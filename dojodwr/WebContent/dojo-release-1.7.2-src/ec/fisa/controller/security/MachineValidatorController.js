define([ "dojo/_base/kernel", 
         "dojo/_base/declare", 
         "dojo/_base/lang",
         "ec/fisa/controller/BaseController",
         "./_base",
         "ec/fisa/navigation/Utils",
         "dojox/mvc",
 		 "dojox/mvc/StatefulModel",
 		 "dijit/form/RadioButton",
 		 "dojox/widget/DialogSimple"], function(dojo, declare, lang, BaseController, baseSecurity) {

	var MachineValidatorController = declare("ec.fisa.controller.security.MachineValidatorController", BaseController, {

		tabId : null,

		pageScopeId : null,
		
		imagePickerId : null,
		
		breadcrumbId : null,
		
		userMachineDataGrid : null,
		
		model : null,
		
		selectedRowItem : null,
		
		action : null,
		
		machineDlg : null,

		data : {},
		
		requiredFieldMessage : {},
		
		machineListDlg : null,
		
		wasMachineListDlg : false, 
		
		isEnroll : false,
		
		machineRegLabel : "",
		
		machinesRegLabel : "",

		constructor : function(tabId, pageScopeId) {
			this.tabId = tabId;
			this.pageScopeId = pageScopeId;
			
			this.model = dojox.mvc.newStatefulModel({
				data : {}
			});
			
			MachineValidatorControllerDWR.getRequiredFieldMessage({
				callbackScope : this,
				callback : function(data) {
					this.requiredFieldMessage = data;
				},
				errorHandler : dojo.hitch(this,this.errorHandler)
			});
		},

		handleWindowAction : function(outcome) {
			var messagesPanel = dijit.byId(this.messagesPanelId);
			messagesPanel.clearAllMessages();
			this.updateMsgsPanel(outcome.aMsgs);
			//ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
			this.cancelMachineInfo();
			//Si fue invocado a partir del del dialogo que obtiene la lista de equipos registrados.
			if(this.wasMachineListDlg == true){
				this.displayMachineList();
			}
			
			if(outcome.dst){
				setTimeout(function(){document.location.reload(true)},3000);
			}
		},
		
		loadUserMachineInformation : function() {
			var store = new ec.fisa.dwr.Store('MachineValidatorControllerDWR', 'viewUserMachineData', this.tabId,
					this.pageScopeId, [], null);
			this.userMachineDataGrid.setStore(store);
		},
		
		bindToModel : function(/* widget */component,/* String */modelProp, /*boolean*/disabled, /*boolean*/ readOnly) {
			// console.log("modelProp [" + modelProp + "]");
			var modelData = this.data[modelProp];

			if (modelData === undefined || modelData == null) {
				modelData = "";
				
				//Si esta vacio is date se coloca la fecha actual
				if(modelProp == "date"){
					modelData = component._componentNode.dropDownDefaultValue;
				}
				
			}

			var stf = new dojox.mvc.StatefulModel({
				data : modelData
			});
			this.model.add(modelProp, stf);
			component.set("ref", this.model[modelProp]);
			component.set('disabled', disabled);
			if(readOnly !== undefined){
				component.set('readOnly', readOnly);
			}
		},
		
		saveMachineInfo : function() {
			var info = [];
			var name = "", identifier = "";
			var nameModel = this.model["name"];

			if (nameModel != undefined) {
				name = this.model["name"].value;
			}
			
			var nameValidation = {field: "CAL_NAME", value : name};
			
			var returnVal = this.validateFields([nameValidation]);
			if(returnVal){
				return;
			}
			
			var identifierModel = this.model["identifier"];

			if (identifierModel != undefined) {
				identifier = this.model["identifier"].value;
			}
			
			info.push(identifier);
			info.push(name);

			var callObj = {
				callbackScope : this
			};
			
			callObj.callback = this.handleWindowAction;
			callObj.errorHandler = this.errorHandler;
			MachineValidatorControllerDWR.saveUserMachineInformation(this.tabId, this.pageScopeId, info, this.action, this.isEnroll, callObj);
		},
		
		setMessagesPanel:function(messagesPanel){
			this.inherited(arguments);
			if(typeof this.breadcrumbId === 'undefined' || this.breadcrumbId == null){
				var breadCrumb=ec.fisa.controller.utils.findCurrentBreadCrumb(messagesPanel);
                if(breadCrumb){
                    this.breadcrumbId=breadCrumb.id;
                }
			}
			this.updateMsgsPanel(this.initMsgs);
			//	this.btContentPaneId = messagesPanel.getParent().getParent().id;
			delete this.initMsgs;
		},
		
		validateFields : function(evalValues) {
			var level = new Object();
			level.level = 40000;			
			var errorMsg = {};
			errorMsg["level"] = level;
			errorMsg["summary"] = this.requiredFieldMessage["I18N_REQUIRED_FIELDS"];
			
			dojo.forEach(evalValues, function(values){
				if((typeof values.value === "undefined") || (values.value == "") || (values.value == "-1")){
					if(typeof errorMsg["detail"] !== "undefined"){
						errorMsg["detail"] = errorMsg["detail"] + " ** " + this.requiredFieldMessage[values.field]; 	
					} else{
						errorMsg["detail"] = "** "+this.requiredFieldMessage[values.field];
					}
				}
			},this);
			
			if(typeof errorMsg["detail"] !== "undefined"){
				var messagesPanel = dijit.byId(this.messagesPanelId);
				messagesPanel.clearAllMessages();
				this.updateMsgsPanel([errorMsg]);
				//Retorna true si hubo mensajes
				return true;
			}
			
			//Retorna false si no hubo mensajes
			return false;
		},
		
		displayMachineInfo : function(action) {
			this.action = action;
			var disable = false;
			
			if(this.machineListDlg != null){
				this.machineListDlg.onCancel();
				this.wasMachineListDlg = true;
			} else {
				this.wasMachineListDlg = false;
			}
			
			//Si es update or delete
			if(action != 'IN'){
				if (this.selectedRowItem != null){
					this.data["identifier"] = this.selectedRowItem.identifier;
					this.data["name"] = this.selectedRowItem.name;
					this.data["date"] = this.selectedRowItem.date;
				} else {
					alert("Debe seleccionar una opcion")
					return;
				}
			} else{
				this.data["identifier"] = '';
				this.data["name"] = '';
			}
			
			//Si es delete se cambia un paramtro a disable = true
			if(action == 'DE'){
				disable = true;
			}
			
			/* Se lanza el PopUp de registro actualizacion o eliminacion de un equipo */
			this.machineDlg = new dojox.widget.DialogSimple({
				title : this.machineRegLabel,
				style : "width: 800px",
				href : "static/security/machineInformation.jsp",
				preventCache : true,
				ioMethod : dojo.xhrPost,
				ioArgs : {
					content : {
						tabId : this.tabId,
						pageScopeId : this.pageScopeId,
						action : this.action,
						disable : disable
					}
				}
			});
			
			this.machineDlg.onCancel = dojo.hitch(this,function() {
				this.machineDlg.destroy();
			});
			
			this.machineDlg.show();
		},
		
		formatterDataGridRadioButton : function(value, idx, allContent){
			if(value != null){			
				if(idx >= 0) {
					var taskId =	allContent.grid.getItem(idx);
					var radioBtn = new dijit.form.RadioButton({
						name: "radioBtn",
						checked: false
					});
					radioBtn.onChange=dojo.hitch(this,function(value){
						var store = allContent.grid.store;
						this.selectedRowItem = store._entries[taskId].data;
					});
					return radioBtn;
				}else{
					// for summary cell
					return "";
				}
			}
		},
		
		displayMachineList : function() {
			/* Se lanza el PopUp de la lista de equipos registrados */
			//dijit.Dialog
			this.machineListDlg = new dojox.widget.DialogSimple({
				title : this.machinesRegLabel,
				style : "width: 800px",
				href : "static/security/savedMachineList.jsp",
				preventCache : true,
				ioMethod : dojo.xhrPost,
				ioArgs : {
					content : {
						tabId : this.tabId,
						pageScopeId : this.pageScopeId
					}
				}
			});
			
			this.machineListDlg.onCancel = dojo.hitch(this,function() {
				this.machineListDlg.destroy();
				this.machineListDlg = null;
			});
			
			this.machineListDlg.show();
		},
		
		cancelMachineInfo: function() {
			this.machineDlg.onCancel();
		},
		
		close : function() {
			ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
		}, 
		
		setIsEnroll : function(isEnroll) {
			this.isEnroll = isEnroll;
		}

	});
	return MachineValidatorController;
});
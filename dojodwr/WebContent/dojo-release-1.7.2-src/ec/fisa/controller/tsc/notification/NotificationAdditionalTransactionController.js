define([ "dojo/_base/kernel",
         "dojo/_base/declare",
         "dojo/_base/lang",
         "ec/fisa/controller/BaseController",
         "ec/fisa/controller/custom/CustomBtController",
         "ec/fisa/format/Utils",
         "ec/fisa/navigation/Utils",
         "dojo/dom-construct",
         "dojox/mvc",
         "dojox/mvc/StatefulModel",
         "ec/fisa/mvc/StatefulModel",
         "dojo/dom-style",
         "ec/fisa/grid/EnhancedGrid",
         "dojo/data/ItemFileWriteStore",
         "dijit/tree/ForestStoreModel",
         "dojox/grid/TreeGrid",
         "dijit/form/CheckBox",
         "ec/fisa/widget/tsc/MixedCheckBox",
         "ec/fisa/dwr/Store",
         "dojox/grid/EnhancedGrid",
         "ec/fisa/grid/enhanced/plugins/Pagination",
         "dojox/lang/functional",
         "ec/fisa/dwr/proxy/tsc/NotificationAdditionalTransactionControllerDWR"
         ], function(dojo,
        		 declare, lang, BaseController, CustomBtController, formatUtils, navigationUtils, domConstruct, mvc,
        		 StatefulModel, StatefulModelParam, domStyle,EnhancedGrid,ItemFileWriteStore) {

	var NotificationAdditionalTransactionController = declare("ec.fisa.controller.tsc.NotificationAdditionalTransactionController", CustomBtController, {

		tabId : null,

		pageScopeId : null,

		model : null,

		modelDestinatario : null,

		data : {},

		accountAccessDataGrid : null,

		treeGridPrivileges : null,

		treegridId : null,

		breadcrumbId : null,

		icons : null,

		labelsData : null,

		requiredFieldMessage : null,

		priorityId : null,

		notificationMeansList : null, 

		meansDataGrid : null,

		listUserDataGrid : null,

		receiverData : null,


		roleId : null,

		roleName : null,

		destPanelId : null,
		selectUsers : null,

		newNotificationMeansList : null,
		
		additionalDataGridId:null,
		//grid for contact media
		additionalDataGridIdCm:null,
		additionalDataStore:null,
		
		//deleted items to later delete from db.
		deletedItems:null,
		//last id number
		lastIdNumber:null,
		
		emailRegex:null,
		numberRegex:null,
		
		messagesPanelIdCm:null,
		idAdditionalDlg:null,
		
		constructor : function(tabId, pageScopeId, initData) {

			//TODO eliminar variable labelsdata para utilizar variable initlabels de custombtcontroller.
			this.setLabelsData(this.initLabels);
			
			this.icons = initData.icons;
			
			this.deletedItems =[];
			
			this.emailRegex = "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@"
				+ "[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$";
			this.numberRegex = "^[0-9]+$";

			if (initData.aMsgs == undefined) {

				this.model = {};
				this.modelDestinatario = {};
				this.init(initData);
			} 		
		},
		init : function(data) {		

			this.priorityId = data.priorityId;
			this.notificationMeansList = data.notificationMeansList;
			this.receiverData = data.receiverData;
			this.selectUsers = data.selectUsers;

			delete data.priorityId;
			delete data.notificationMeansList;
			delete data.receiverData;
			delete data.selectUsers;

			this.data = data;

			this.model = dojox.mvc.newStatefulModel({
				data : {}
			});

			this.modelDestinatario = new StatefulModelParam({
				data : {}
			});		

		},

		handleWindowAction : function(outcome) {
			var messagesPanel = dijit.byId(this.messagesPanelId);
			messagesPanel.clearAllMessages();
			if(outcome.wAxn=="cnfrm"){
				ec.fisa.navigation.utils.showNewBreadCrumbConfirmation(outcome.confirmationDialogTitle,outcome.aMsgs,this.breadcrumbId,this.tabId, this.pageId,null,null,false);	
			} else if ((outcome.aMsgs != undefined && outcome.aMsgs[0].level.level == "20000") || (outcome.wAxn != undefined && outcome.wAxn == "close")) {
				this.updateMsgsPanel(outcome.aMsgs);			
				ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
			} 
		},

		bindToModel : function(/* widget */component,/* String */modelProp, /*boolean*/disabled) {
			// console.log("modelProp [" + modelProp + "]");
			var modelData = this.data[modelProp];

			if (modelData === undefined || modelData == null) {
				modelData = "";
			}

			var stf = new dojox.mvc.StatefulModel({
				data : modelData
			});
			this.model.add(modelProp, stf);
			component.set("ref", this.model[modelProp]);
			component.set('disabled', disabled);
		},

		processValue : function(attribute, value) {
			// this.agendaDataGrid.store.setVa
		},

		setLabelsData:function(data){
			this.labelsData = data;
		},
		validateBtInfo : function(callerCmp) {
			
			this.clearPanelMessage();	
			
			var level =  40000;	
			var summary = '';
			var detail = '';
			
			var grid = dijit.byId(this.additionalDataGridId);
			var newFileItemObject = dojo.fromJson(grid.store._getNewFileContentString());
			var items  = newFileItemObject.items;
			
			var error = false; 
			dojo.some(items,function(item){
				if(item.name == null || item.name == undefined || item.name === ""){
					
					summary = grid.labels['emptyName'];
//					var message = [{summary: ,detail:"",level:{level:40000}}];
//					this.updateMsgsPanel(message);
					error = true;
//					return false;
				}
				if(item.tipo == null || item.tipo == undefined || ec.fisa.format.utils.isObjectEmpty(item.tipo) === true){
					summary = grid.labels['emptyCm'];
//					var message = [{summary: grid.labels['emptyCm'] ,detail:"",level:{level:40000}}];
//					this.updateMsgsPanel(message);
					error = true;
//					return false;
				}
				
				item.tipo =	dojo.toJson(item.tipo);
			},this);
			
			var errorMsg = this.generateMsg(summary, detail, level);
			
			if(error === false){
				
				callerCmp.wAxn = "cnfrm";
				callerCmp.items = items;
			
			} else {
				callerCmp.aMsgs = errorMsg;
				callerCmp.wAxn = "error";	
			}
			
			return callerCmp;
		},

		save : function(callerCmp) {
			
			var callObj = {
					callbackScope : this
			};
			callObj.callback = this.handleWindowAction;
			callObj.errorHandler = dojo.hitch(this,this.errorHandler);
			NotificationAdditionalTransactionControllerDWR.saveAdditionalPersonNotifiableInformation(this.tabId, 
					this.pageScopeId,  this._addNotificationValData(), callerCmp.items,  callObj);
		
		},

		deleteRoleInformation : function() {
			var dlgConfirm = new ec.fisa.widget.ConfirmDialog({
				acceptDialogLabel : this.labelsData.yesLabel,
				cancelDialogLabel : this.labelsData.noLabel,
				title : this.labelsData.deleteMenuLabel,
				content : this.labelsData.deleteWarnLabel,
				acceptAction : dojo.hitch(this, function() {
					var callObj = {
							callbackScope : this
					};
					callObj.callback = this.handleWindowAction;
					callObj.errorHandler = this.errorHandler;
					NotificationAdditionalTransactionControllerDWR.deleteUserRoleInfo(this.tabId, this.pageScopeId,callObj);
				})
			});
			dlgConfirm.show();
		},


		//cancel user role impl
		cancel:function(){		
			var outcome = {};
			outcome.wAxn = "close";
			this.handleWindowAction(outcome);
		},

		
		//for contact media
		setMessagesPanelContactMedia:function(messagePanel){
			this.inherited(arguments);
			this.messagesPanelIdCm = messagePanel.id;
		},
		
		

		addParamToModel : function(component) {

			var eid = component["bt-id"];
			var fid = component["field-id"];

			var field = null;
			if (this.data && this.data[eid]
			&& this.data[eid].dataMessage) {
				field = this.data[eid].dataMessage.fields[fid];
			}
			if (field == null) {
				field = {
						value : '',
						complement : null
				};
				component._fStarted = true;
			} else if (field.value == null) {				

				component._fStarted = true;
			}

			if (this.disabled) {

				component.set('disabled', this.disabled);
				field.enabled = false;
			}

			if (fid === 'EFP-MCN-CHM-NOTIFICATION') {
				var newNotificationMeansListNotAgenda = [];

				for (var i in this.notificationMeansList) {
					if(this.notificationMeansList[i].value != "AGENDA"){
						newNotificationMeansListNotAgenda.push({label:this.notificationMeansList[i].label, selected:this.notificationMeansList[i].selected, value:this.notificationMeansList[i].value});
					}

				}
				field.value = [this.receiverData, newNotificationMeansListNotAgenda, this.priorityId, true];
			} else {

				field.value = "";
			}

			this.notificationId = component.id;

			if(this.modelDestinatario.contains(eid)){
				// if exists yet updates new value.
				if(this.modelDestinatario.contains([eid,'dataMessage','fields',fid]) ) {
					this.modelDestinatario.setValue([eid,'dataMessage','fields',fid,'value'],field.value);
				}
			} else {
				this.modelDestinatario.appendObject([eid,'dataMessage','fields',fid,'value'],field.value,component.id,'value',null,false);

				var enabled = null;
				if(field.enabled != undefined ){
					enabled = field.enabled;
				}
				this.modelDestinatario.appendObject([eid,'dataMessage','fields',fid,'enabled'],enabled,component.id,'enabled',null,false);


				if(component.hasCompl){
					this.modelDestinatario.appendObject([eid,'dataMessage','fields',fid,'complement'],field.complement,component.id,'complement',null,false);
				}
			}
		},
		containsFieldModel : function(eid, fid) {
			return this.modelDestinatario.contains([ eid, 'dataMessage',
			                                         'fields', fid, 'value' ]);
		},
		getFieldModel : function(eid, fid) {
			return this.modelDestinatario.getValue([ eid, 'dataMessage',
			                                         'fields', fid, 'value' ]);
		},
		setFieldModelValue : function(eid, fid, value) {
			this.modelDestinatario.setValue([ eid, 'dataMessage', 'fields',
			                                  fid, 'value' ], value);

		},
		/** updates the mvc with the enabled attribute. */
		setFieldModelEnabled : function(
				/* String businesstemplate id */btId,/*
				 * String
				 * fieldId
				 */
				fid,/* boolean */value) {
			this.modelDestinatario.setValue([ btId, 'dataMessage',
			                                  'fields', fid, 'enabled' ], value);
		},

		setFieldModelComplement : function(eid, fid, complement) {
			this.modelDestinatario.setValue([ eid, 'dataMessage', 'fields',
			                                  fid, 'complement' ], complement);
		},
		getFieldModelComplement : function(eid, fid) {
			return this.modelDestinatario.getValue([ eid, 'dataMessage',
			                                         'fields', fid, 'complement' ]);
		},

		cargarTareasListUser : function(tabId, criteria) {
			this.clearPanelMessage();
			var store = null;

			store = new ec.fisa.dwr.Store(
					'NotificationTransactionControllerDWR',
					'viewDataUsers', this.tabId,
					this.pageScopeId, [], null);

			this.listUserDataGrid.setStore(store);

			dojo.forEach(this.selectUsers, function(value, i){

				this.listUserDataGrid.selection.addToSelection(this.listUserDataGrid.getItemIndex(value));			
			},this);

			this.listUserDataGrid.render();			
		},

		//additional persons grid.
		initDataGrid:function(component,labels){
			var layout = [{noscroll: true,cells:[
			              {
			            	  name : labels['userName'],
			            	  field : "name",
			            	  width : "auto",
			            	  formatter:function(data, rowIndex,column)
			            	  {return ec.fisa.format.utils.formatterAdditionalUsersName(data, rowIndex,column);}

			              },
			              {
			            	  name : labels['contactMedia'],
			            	  field : "tipo" ,
			            	  width : "auto",
			            	  formatter:function(data, rowIndex,column)
			            	  {return ec.fisa.format.utils.formatterAdditionalUsersLink(data, rowIndex,column);}
			              },

			              {
			            	  name : labels['options'],
			            	  field : "" ,
			            	  width : "90px",
			            	  styles: 'text-align: center;',
			            	  formatter:function(data, rowIndex,column)
			            	  {return ec.fisa.format.utils.formatterAdditionalUsersOptions(data, rowIndex,column);}
			              }

			              ]}];
			var gridData = {
					identifier: "id",
					items: this.receiverData
			};
			
			this.lastIdNumber = this.receiverData.length;
			
			
			var store = new ItemFileWriteStore({ data: gridData, hierarchical: false });
			this.additionalDataStore = store;
			/** Creates a div inside an dom node component. */
			var creationDiv = domConstruct.create("div", null,
					component.domNode);

			// domClass.add(creationDiv, "grid");
			var pagination={onNewExecute:dojo.hitch(this,this.execNew),hidePaginationNumber:true};
			
			/* create a new grid: */
			var grid = new EnhancedGrid({
				store: store,
				structure: layout,
				autoHeight:true,
				style:{width:"50%",margin:'auto'},
				newButtonLabel:labels['labelNew'],
				selectable:"true",
				fisaEditableGrid:true,
				plugins:{fisaPagination:pagination}
			},
		
			creationDiv);
			grid.doKeyEvent= function(e){
				//do nothing cause it makes to lose focus or getout of the multiregister	
			};
			grid.tabId = this.tabId;
			grid.labels = labels;
			grid.pageScopeId = this.pageScopeId;
			grid.breadCrumbId = this.breadcrumbId;
			grid.startup();
			
			this.additionalDataGridId = grid.id;
		},
		
		/**Ejecuta el boton nuevo en el multiregistro de los adicionales.*/
		execNew:function(){
			//{id:2,recipientId:"52",tipo:{MAIL:"pelo@com.com"},name:"1231"}
			var newItem = {id:this.lastIdNumber,recipientId:null,tipo:{},name:""};
			this.additionalDataStore.newItem(newItem);
			this.lastIdNumber++;
		},
		//data grid for additional contact media
		initDataGridContactMedia:function(component,labels){
			var layout = [
			              {
			            	  name : labels['contactMedia'],
			            	  field : "contactMedia" ,
			            	  width : "auto",
			            	  editable:false
			              },
			              {
			            	  name : labels['labelData'],
			            	  field : "name",
			            	  width : "200px",
			            	  editable:false,
			            	  formatter:function(data, rowIndex,column)
			            	  {return ec.fisa.format.utils.formatterAdditionalCmData(data, rowIndex,column);}
			              }
			             

			              ];
			//prepare data for the grid.
			var grid = dijit.byId(this.additionalDataGridId);
			var rowGridItem =	grid.selectedRowGridItem;
			
			var tipo=	rowGridItem.tipo[0];
		
			var cmData = [];
			var id = 0;
			//código para eliminar subscripciones 
			
			dojo.forEach(this.notificationMeansList,function(cm){
				if(cm.value != -1){
					var cm = {id:id,name:"",contactMedia:cm.value};
					cmData.push(cm);
					id++;	
				}
			});
			
			//en los medios existentes se actualiza la data d ela base.
			dojox.lang.functional.forIn(tipo,function(data, contactMedia){
				dojo.forEach(cmData,function(cm){
					if(cm.contactMedia == contactMedia){
						cm.name = data;
					}
				});
			}, this);
			
			var gridData = {
					identifier: "id",
					items: cmData
			};
			
			var store = new ItemFileWriteStore({ data: gridData, hierarchical: false });
			/** Creates a div inside an dom node component. */
			var creationDiv = domConstruct.create("div", null,
					component.domNode);
			
			/* create a new grid: */
			var grid = new EnhancedGrid({
				store: store,
				structure: layout,
				autoHeight:true,
				selectable:"true",
				fisaEditableGrid:true
			},
			creationDiv);
			grid.tabId = this.tabId;
			grid.labels = labels;
			grid.pageScopeId = this.pageScopeId;
			grid.numberRegex = this.numberRegex;
			grid.emailRegex = this.emailRegex;
			grid.startup();
			this.additionalDataGridIdCm = grid.id;
		},
		
		
		cancelUserContactMedia:function(){
			this.clearPanelMessageCm();
		var dlg = dijit.byId(this.idAdditionalDlg);
		dlg.destroy();
	
		},
		//save user contact media
		saveUserContactMedia:function(){
			
			var mpCm = dijit.byId(this.messagesPanelIdCm);
			//do nothing until fix error
			if(mpCm.messagesPanelEmpty() == false){
				return;
			}
			this.clearPanelMessageCm();
			var gridCm = dijit.byId(this.additionalDataGridIdCm);
			var newFileItemObject = dojo.fromJson(gridCm.store._getNewFileContentString());
			var items  = newFileItemObject.items;
			
			var tipoUpdated = {};
			dojo.forEach(items,function(item){
				if(item.name != null && item.name != undefined && item.name != ""){
					tipoUpdated[item.contactMedia] = item.name;
				}
			});
			
			var gridNotification = dijit.byId(this.additionalDataGridId);
			gridNotification.selectedRowGridItem.tipo[0] = tipoUpdated; 
			
			var dlg = dijit.byId(this.idAdditionalDlg);
			dlg.destroy();
			
		},
		
		updateMsgsPanelCm:function(msgs){
			if(msgs){
				var messagesPanel = dijit.byId(this.messagesPanelIdCm);
				if(messagesPanel){
					messagesPanel.update(msgs, this.isComponentMsg,this.addComponentMsg,this);
				}
			}
		},
		//clear message panel for contact media
		clearPanelMessageCm:function(){
			if(this.messagesPanelIdCm){
				var messagesPanel = dijit.byId(this.messagesPanelIdCm);
				messagesPanel.clearAllMessages();
			}
		}
		

	});
	return NotificationAdditionalTransactionController;
});
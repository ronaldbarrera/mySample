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
		 "ec/fisa/controller/custom/QtController", 
		 "dijit/tree/ForestStoreModel", 
		 "dojox/grid/TreeGrid",
		 "dojo/data/ItemFileWriteStore", 
		 "dijit/form/CheckBox", 
		 "ec/fisa/widget/tsc/MixedCheckBox",
		 "ec/fisa/dwr/Store"], function(dojo,
		declare, lang, BaseController, CustomBtController, formatUtils, navigationUtils, domConstruct, mvc, StatefulModel,QtController) {

	var UserRolAdminController = declare("ec.fisa.controller.tsc.UserRolAdminController", CustomBtController, {

		
		parentTabId : null,
		
		parentPageScopeId : null,

		model : null,

		data : {},

		privilegesData : null,

		accountAccessDataGrid : null,

		treeGridPrivileges : null,

		availableChannels : [],

		treegridId : null,
		
		breadcrumbId : null,
		
		icons : null,
		
		labelsData : null,
		
		requiredFieldMessage : null,

		constructor : function(tabId, pageScopeId, initData) {
		
			this.setPrivilegesData(initData.privilegesData);
			this.setAvailableChannels(initData.availableChannels);
			this.data["rolName"] = initData.roleName;
			this.data["rolDescription"] = initData.roleDescription;
			this.setParentTabId(initData.parentFisaTabId);
			this.setParentPageScopeId(initData.parentFisaPageScopeId);	
			this.icons = initData.icons;
			//TODO eliminar variable labelsdata para utilizar variable initlabels de custombtcontroller.
			this.labelsData = this.initLabels;
			
			
			delete initData.privilegesData;
			delete initData.availableChannels;
			delete initData.roleName;
			delete initData.roleDescription;
			delete initData.parentFisaTabId;
			delete initData.parentFisaPageScopeId;
			delete initData.icons;
			delete initData.initLabels;

			this.model = dojox.mvc.newStatefulModel({
				data : {}
			});
			
			UserRolAdminControllerDWR.getRequiredFieldMessage({
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

	
				if (outcome.wAxn == "cnfrm") {
					ec.fisa.navigation.utils.showNewBreadCrumbConfirmation(outcome.confirmationDialogTitle,outcome.aMsgs,this.breadcrumbId,this.tabId, this.pageId,null,null,false);
				} else if (outcome.wAxn == "error") {
					this.updateMsgsPanel(outcome.aMsgs);
				}
		},

		bindToModel : function(/* widget */component,/* String */modelProp, /*string*/disabled) {
			//console.log("modelProp [" + modelProp + "]");
				
			var modelData = this.data[modelProp];

			if (modelData === undefined || modelData == null) {
				modelData = "";
			}

			var stf = new dojox.mvc.StatefulModel({
				data : modelData
			});
			this.model.add(modelProp, stf);
			component.set("ref", this.model[modelProp]);
			component.set('disabled', disabled === 'true');
		},

		processValue : function(attribute, value) {
			// this.agendaDataGrid.store.setVa
		},

		loadAccountAccessInformation : function() {
			var store = new ec.fisa.dwr.Store('UserRolAdminControllerDWR', 'viewAccessAccountData', this.tabId,
					this.pageScopeId, [], null);
			this.accountAccessDataGrid.setStore(store);
			this.accountAccessDataGrid.canSort=function(){return false}; 
		},

		/** inits the treegrid. */
		initTreeGrid : function(component, disabled) {

			var layout = [
			{
				name : "",
				width : "60px",
				formatter : dojo.hitch(this, function(data, rowIndex, treepath, p4) {
					return this.formatterTreeGridIcon(data, rowIndex, treepath, p4);
				})
			},
			{
				name : this.labelsData.availableOptions,
				field : "name",
				width : "400px"
			} ];

			for ( var i = 0; i < this.availableChannels.length; i++) {
				var j = i + 2;
				var channel = this.availableChannels[i];
				layout[j] = {
					name : channel[1],
					field : channel[0],
					width : "auto",
					widgetClass : dijit.form.CheckBox,
					formatter : dojo.hitch(this, function(data, rowIndex, treepath, p4) {
						return this.formatterTreeGridBooleanCheckbox(data, rowIndex, treepath, p4, this, disabled);
					})
				}
			}

			var store = new dojo.data.ItemFileWriteStore({
				data : this.privilegesData
			});
			var treeModel = new dijit.tree.ForestStoreModel({
				store : store,
				rootId : 'rootNode',
				rootLabel : 'MenuByApplication',
				childrenAttrs : [ 'children' ],
				mayHaveChildren : function(item) {
					// valida si existe una propiedad
					// leaf que indica si
					// es el ultimo
					if ("leaf" in item) {
						return !item.leaf[0];
					}
					return true;
				}
			});

			/** Creates a div inside an dom node component. */
			var creationDiv = domConstruct.create("div", null, component.domNode);

			this.treeGridPrivileges = new dojox.grid.TreeGrid({
				treeModel : treeModel,
				structure : layout,
				defaultOpen : false,
				autoHeight : true,
				autoWidth : true,
				initialWidth : '100%'

			}, /* lugar de creacion */creationDiv);

			this.treegridId = this.treeGridPrivileges.id;

			this.treeGridPrivileges.startup();
		},

		/** Sets the data for documents, this is the data for the grid . */
		setPrivilegesData : function(privilegesData) {
			var items = privilegesData.items;
			this.processItemChannelInformation(items);
			this.privilegesData = privilegesData;
		},

		processItemChannelInformation : function(items) {
			for ( var i = 0; i < items.length; i++) {
				var item = items[i];
				if (item !== undefined && item != null) {
					// Setea dentro del item la informacion de cada uno de los
					// canales
					var channelList = item.channelList;

					for ( var j = 0; j < channelList.length; j++) {
						var channelInfo = channelList[j];
						item[channelInfo[0]] = channelInfo[1];
					}
					delete item.channelList;

					// Si tiene hijos se barre recursivamente
					var children = item.children;
					if (children !== undefined && children.length > 0) {
						this.processItemChannelInformation(children);
					}
				}
			}
		},

		setAvailableChannels : function(availableChannels) {
			this.availableChannels = availableChannels;
		},

		sendInfoToServer : function() {
			var callObj = {
				scope : this,
				onComplete : function(data) {
					
				}
			};
			callObj.onError = dojo.hitch(this,this.errorHandler);

			// Envia al servidor a guardar lo que se haya modificado en el store
			// para el acceso a cuentas.
			this.accountAccessDataGrid.store.save(callObj);
		},
		
		validateBtInfo : function(callerCmp) {
			
						
			var userRolInfo = [];
			var rolName = "", rolDescription = "";
		
			var rolNameModel = this.model["rolName"];
			var rolDescriptionModel = this.model["rolDescription"];
		
			if (rolNameModel != undefined) {
				rolName = this.model["rolName"].value;
			}
			
			var nameValidation = {field: "CAL_NAME", value : rolName};
			
			var returnVal = this.validateFields([nameValidation]);
			
			if(returnVal != null){
				
			   callerCmp.aMsgs = returnVal.aMsgs; 
			   callerCmp.wAxn = returnVal.wAxn;
			
			}  
			
			if (callerCmp.wAxn == "cnfrm"){			
	
				
				if (rolDescriptionModel != undefined) {
					rolDescription = this.model["rolDescription"].value;
				}
				
				userRolInfo.push(rolName);
				userRolInfo.push(rolDescription);
				
				callerCmp.userRolInfo = userRolInfo;
			} 
			
			return callerCmp;			
		},
		

		save : function(callerCmp) {
			

			var callObj = {
				callbackScope : this
			};
			callObj.callback = this.handleWindowAction;
			callObj.errorHandler = dojo.hitch(this,this.errorHandler);
			UserRolAdminControllerDWR.saveUserRolInformation(this.tabId, this.pageScopeId, this._addNotificationValData(),callerCmp.userRolInfo, callObj);
		},
		
		remove : function(callerCmp) {
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
					callObj.errorHandler = dojo.hitch(this,this.errorHandler);
					UserRolAdminControllerDWR.deleteUserRoleInfo(this.tabId, this.pageScopeId,callObj);
				})
			});
			dlgConfirm.show();
		},

		// formatter que genera el checkbox
		formatterTreeGridBooleanCheckbox : function(value, idx, treepath, p4, controller, disabled) {
			var rowGridItem = p4.grid.getItem(treepath);

			if (value != null) {
				if (idx >= 0) {
					// Si el campo contiene la palabra 'none' quiere decir que no existe una funcionalidad para ese canal
					if(value == "none"){
						return "";
					}

					// var checkBox = new dijit.form.CheckBox({
					var checkBox = new ec.fisa.widget.tsc.MixedCheckBox({
						name : "checkBox",
						value : value,
						checked : value,
						disabled:disabled
					});
					checkBox.fisaRowItem = rowGridItem;
					checkBox.field = p4.field;
					checkBox.treegridId = controller.treegridId;
					checkBox.tabId = controller.tabId;
					checkBox.pageScopeId = controller.pageScopeId;
					checkBox.onChange = function(value) {
						if (this != window) {
							this.fisaRowItem[this.field][0] = value;
							UserRolAdminControllerDWR.setChangedValues(this.tabId, this.pageScopeId, this.field, value, this.fisaRowItem.id[0],
									this.fisaRowItem.parentId[0], {
										callbackScope : this,
										callback : function(data) {
											
											//se obtiene la lista de items que se cambiaron.
											var itemsChanged = data.itemsChanged;
											var treeGrid = dijit.byId(this.treegridId);
											var model = treeGrid.treeModel;

											//Se actualiza al store el item cambiado con el respectivo valor.
											for ( var i = 0; i < itemsChanged.length; i++) {
												var itemChanged = itemsChanged[i];
												var item = treeGrid.treeModel.store._itemsByIdentity[itemChanged.id];
												var channelList = itemChanged.channelList;
												for ( var j = 0; j < channelList.length; j++) {
													var channel = channelList[j];
													model.store.setValue(item, channel[0], channel[1]);
												}
											}
										},
										errorHandler : dojo.hitch(this,this.errorHandler)
									});
						}
					};
					return checkBox;
				} else {
					// for summary cell
					return "";
				}
			}
		},
		
		formatterTreeGridIcon : function(value, idx, treepath, p4) {
			var rowGridItem = p4.grid.getItem(treepath);
			var iconId = rowGridItem.iconId[0];
			if(iconId !== undefined && iconId != null && iconId != ""){
				var iconPath = this.icons[iconId];
				if(iconPath !== undefined && iconPath != null){
					return '<img src="'+this.icons[iconId]+'" />'; 
				}
			}
			return '';
		},
		
		formatterDataGridBooleanCheckbox : function(value, idx, allContent, disabled, attribute, tabId, pageScopeId){
			if(value != null){			
				if(idx >= 0) {
					var taskId =	allContent.grid.getItem(idx);
					//var checkBox = new dijit.form.CheckBox({
					var checkBox = new ec.fisa.widget.tsc.MixedCheckBox({
						name: "checkBox",
						value: value,
						checked: value,
						disabled:disabled
					});
					checkBox.tabId = tabId;
					checkBox.pageScopeId = pageScopeId;
					checkBox.onChange=function(value){
						if(this != window){
							var store = allContent.grid.store;
							var rowItem = store._entries[taskId].data;
							rowItem[attribute] = value;
							store.setValue(taskId, attribute, value);
							var controllerInstance = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
							controllerInstance.sendInfoToServer();
							this.value = value;
							this.checked = value;
							
						}
					};
					return checkBox;
				}else{
					// for summary cell
					return "";
				}
			}
		},
		cancel:function(isSequence){		
			var callObj = {
					callbackScope : this
			};
			callObj.callback = this.handleCancelAction;
			callObj.errorHandler = dojo.hitch(this,this.errorHandler);
			
			UserRolAdminControllerDWR.cancelUserRoleImpl(this.tabId, this.pageScopeId, callObj);
		},
		
		validateFields : function(evalValues) {
			var outcome = {};
	
			var level =  40000;
			
			var summary = this.requiredFieldMessage["I18N_REQUIRED_FIELDS"];
			var detail="";
			

			dojo.forEach(evalValues, function(values){
				if((typeof values.value === "undefined") || (values.value == "") || (values.value == "-1")){	
					summary = summary + " ["+ this.labelsData[values.field]+"] ";
					detail =  detail + "** "+this.requiredFieldMessage["I18N_REQUIRED_FIELDS"] +"["+ this.labelsData[values.field]+"]";				
				}
			},this);
			
			var errorMsg = this.generateMsg(summary, detail, level);
			
			
			if(errorMsg[0].detail != undefined && errorMsg[0].detail != ""){
				var messagesPanel = dijit.byId(this.messagesPanelId);
//				messagesPanel.clearAllMessages();
//				this.updateMsgsPanel([errorMsg]);
				outcome.aMsgs = errorMsg;
				outcome.wAxn = "error";
			} else {
				outcome.wAxn = "cnfrm";
			}			
			
			return outcome;
		},
				
		setParentTabId : function(parentTabId) {
			this.parentTabId = parentTabId;
		},
		
		setParentPageScopeId : function(parentPageScopeId) {
			this.parentPageScopeId = parentPageScopeId;
		}
	});
	return UserRolAdminController;
});
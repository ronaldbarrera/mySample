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
		"ec/fisa/widget/Link",
		"dojo/dom-geometry",
		"dijit/tree/ForestStoreModel",
		"dojox/grid/TreeGrid",
		"dojo/data/ItemFileWriteStore",
		"dijit/form/CheckBox",
		"ec/fisa/widget/tsc/MixedCheckBox",
		"ec/fisa/navigation/Utils",
		"ec/fisa/dwr/Store",
		"ec/fisa/grid/EnhancedGrid",
		"dojox/grid/DataGrid"], function(dojo,
		declare, lang, BaseController, CustomBtController,  formatUtils, navigationUtils, domConstruct, mvc, StatefulModel, StatefulModelParam, domStyle,Link,domGeometry) {

	var NotificationTransactionController = declare("ec.fisa.controller.tsc.NotificationTransactionController", CustomBtController, {

		tabId : null,

		pageScopeId : null,

		model : null,
		
		modelDestinatario : null,

		data : {},

		privilegesData : null,

		accountAccessDataGrid : null,

		treeGridPrivileges : null,

		treegridId : null,
		
		breadcrumbId : null,
		
		breadCrumbAdditionalUser:null,
		
		icons : null,
		
		labelsData : null,
		
		requiredFieldMessage : null,
		
		priorityId : null,
		
		notificationMeansList : null, 
		
		meansDataGrid : null,
		
		
		
		additionalUserGridId:null,
		
		receiverData : null,
		
		panelMsgAdditionalId:null,
	
		roleId : null,
		
		roleName : null,
		
		destPanelId : null,
		
		selectMeans : null,
		
		selectUsers : null,
		
		meanStore : null,
		
//		userStore : null,
		
		newNotificationMeansList : null,
		
		urlToAdditionalUserPage:"",
		
		
		additionalSucessCheckBoxList:[],
		additionalUnSucessCheckBoxList:[],
		
		contentPanelProperties : null,		
	
		constructor : function(tabId, pageScopeId, initData) {

			
			//TODO eliminar variable labelsdata para utilizar variable initlabels de custombtcontroller.
			this.setLabelsData(this.initLabels);
			
			if (initData.aMsgs == undefined) {
				
				this.setPrivilegesData(initData.privilegesData);
				this.setUrlToAdditionalUserPage(initData.additionalUrl);
				this.icons = initData.icons;
				
				this.model = {};
				this.modelDestinatario = {};
				this.meanStore = new ec.fisa.dwr.Store(
						'NotificationTransactionControllerDWR',
						'viewDataMeans', this.tabId,
						this.pageScopeId, [], null);
				this.init(initData);
			} 		
		},
		init : function(data) {		

			this.priorityId = data.priorityId;
			this.notificationMeansList = data.notificationMeansList;
			this.receiverData = data.receiverData;
			this.selectUsers = data.selectUsers;
			this.selectMeans = data.selectMeans;
			
			delete data.priorityId;
			delete data.notificationMeansList;
			delete data.receiverData;
			delete data.selectMeans;
			delete data.selectUsers;
			
			this.data = data;
			
			this.model = dojox.mvc.newStatefulModel({
				data : {}
			});
			
			this.modelDestinatario = new StatefulModelParam({
				data : {}
			});		
			
			this.inicializarNotificationMeansList();
		},
		
		handleWindowAction : function(outcome) {
			var messagesPanel = dijit.byId(this.messagesPanelId);
						
			messagesPanel.clearAllMessages();
			
			if(outcome.wAxn=="cnfrm"){
				ec.fisa.navigation.utils.showNewBreadCrumbConfirmation(outcome.confirmationDialogTitle,outcome.aMsgs,this.breadcrumbId,this.tabId, this.pageId,null,null,false);	
			} else if (outcome.wAxn != undefined && outcome.wAxn == "close"){
				ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
			}	else if (outcome.aMsgs != undefined) {
				
				this.updateMsgsPanel(outcome.aMsgs);
//				ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
			}
		},
		
		handleAdditionalSaveAction : function(outcome) {
			this.contentPanelProperties.destroy();
			this.updateMsgsPanel(outcome.aMsgs);
			
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
			component.set('disabled', disabled === "true");
		},

		processValue : function(attribute, value) {
			// this.agendaDataGrid.store.setVa
		},
		
		setLabelsData:function(data){
			this.labelsData = data;
		},
		
		
		initAdditionalUsersGrid:function(component,componentId,parentTreeGridNodeId, isDisabled){
			
			//init list of checkbox.
			this.additionalSucessCheckBoxList=[];
			this.additionalUnSucessCheckBoxList=[];
			
			var structure=[
			               {
			            	   name: this.labelsData.addUserLabel,
			            	   field: 'value',
			            	   width:'40%',
			            	   styles: 'vertical-align: middle;'
			               },

			               {
			            	   name: this.labelsData.addUserSentSuccess,
			            	   field: 'success',
			            	   width:'30%',
			            	   styles: 'text-align: center; vertical-align: middle;',
			            	   widgetClass : dijit.form.CheckBox,
			            	   formatter : dojo.hitch(this, function(data, rowIndex, column) {
			            		   return this.formatterUserGridBooleanCheckbox(data, rowIndex,column,this, isDisabled === "true");
			            	   })
			               },
			               {
			            	   name: this.labelsData.addUserSentUnsuccess,
			            	   field: 'unSuccess',
			            	   width:'30%',
			            	   styles: 'text-align: center; vertical-align: middle;',
			            	   widgetClass : dijit.form.CheckBox,
			            	   formatter : dojo.hitch(this, function(data, rowIndex, column) {
			            		   return this.formatterUserGridBooleanCheckbox(data, rowIndex,column,this, isDisabled === "true");
			            	   })
			               }];
			//this.store=ctrlr.userStore;
			
			var store =  new ec.fisa.dwr.Store(
					'NotificationTransactionControllerDWR',
					'viewDataUsersAndAdditionals', this.tabId,
					this.pageScopeId, [componentId,parentTreeGridNodeId], null);
			
			/** Creates a div inside an dom node component. */
			var creationDiv = domConstruct.create("div", null, component.domNode);

			// domClass.add(creationDiv, "grid");
			/* create a new grid: */
			var grid = new dojox.grid.DataGrid({
				store: store,
				structure: structure,
				autoHeight:true,
				autoWidth:true
			},
			creationDiv);
			grid.startup();
			this.additionalUserGridId = grid.id;
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
			},
			{
				name : this.labelsData.notificationLabel,
				field : "notifiableValue",
				width : "auto",
				widgetClass : dijit.form.CheckBox,
				formatter : dojo.hitch(this, function(data, rowIndex, treepath, p4) {
					return this.formatterTreeGridBooleanCheckbox(data, rowIndex, treepath, p4, this, disabled === "true");
				})
			},
			{
				name : " ... ",
				field : "additionalUsers",
				width : "auto",
				widgetClass : ec.fisa.widget.Link,
				formatter : dojo.hitch(this, function(data, rowIndex, treepath, p4) {
					return this.formatterTreeGridLink(data, rowIndex, treepath, p4, this, disabled === "true");
				})
			}
			
			
			];

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
				defaultOpen : true,
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
			this.privilegesData = privilegesData;
		},


		//saves additional user on the object representing the row of the tree grid
		saveAdditionalUser:function(parentTreeGridNodeId,parentTreeGridParentNodeId){
			var result = {};
			dojo.forEach(this.additionalSucessCheckBoxList,function(checkBoxId){
				var checkBoxWdgt=	dijit.byId(checkBoxId);
				if(result[checkBoxWdgt.userId] == undefined){
					result[checkBoxWdgt.userId] = {} ;
				}
				result[checkBoxWdgt.userId].sucess = ""+checkBoxWdgt.checked;
				if(checkBoxWdgt.userTranId == undefined){
					result[checkBoxWdgt.userId].userTranId= null;
				}else{
					result[checkBoxWdgt.userId].userTranId=""+ checkBoxWdgt.userTranId;
				}
				
			});

			dojo.forEach(this.additionalUnSucessCheckBoxList,function(checkBoxId){
				var checkBoxWdgt=	dijit.byId(checkBoxId);
				if(result[checkBoxWdgt.userId] == undefined){
					result[checkBoxWdgt.userId] = {} ;
				}
				result[checkBoxWdgt.userId].unsucess = ""+checkBoxWdgt.checked;
				
			});
			
			var callObj = {
					callbackScope : this
				};
				callObj.callback = dojo.hitch(this,this.handleAdditionalSaveAction);
				callObj.errorHandler = this.errorHandler;
				NotificationTransactionControllerDWR.saveAdditionalUsers(this.tabId, 
						this.pageScopeId,  result,parentTreeGridNodeId,parentTreeGridParentNodeId,callObj);
		},
		
		
		//maneja el resultado de la llamada a grabar los adicionales.
		handleSaveAdditional:function(outcome){		
			this.clearPanelMessageAdditional();
			if(outcome.wAxn=="error"){
				this.updateMsgsPanelAdditional(outcome.aMsgs);		
			} else if(outcome.wAxn=="cnfrm") {
				ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadCrumbAdditionalUser);
			}
		},
		
		
		updateMsgsPanelAdditional:function(msgs){
			if(msgs){
				var messagesPanel = dijit.byId(this.panelMsgAdditionalId);
				if(messagesPanel){
					messagesPanel.update(msgs, this.isComponentMsg,this.addComponentMsg,this);
				}
			}
		},
		clearPanelMessageAdditional:function(){
			if(this.messagesPanelId){
				var messagesPanel = dijit.byId(this.panelMsgAdditionalId);
				messagesPanel.clearAllMessages();
			}
		},
		validateBtInfo : function(callerCmp) {
			
			this.clearPanelMessage();							
			
			callerCmp.selectionMeansGrid = this.meansDataGrid.selection.getSelected();	
			
			//TODO VERIFICAR QUE NO SE NECESITE VALIDACIÓN PARA PANTALLA
			callerCmp.wAxn = "cnfrm";
			
			return callerCmp;
		},
		save : function(callerCmp) {						
			
			var callObj = {
				callbackScope : this
			};
			callObj.callback = this.handleWindowAction;
			callObj.errorHandler = this.errorHandler;
			NotificationTransactionControllerDWR.saveUserRolInformation(this.tabId, 
					this.pageScopeId, this._addNotificationValData(), callerCmp.selectionMeansGrid,  callObj);
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
					callObj.errorHandler = this.errorHandler;
					NotificationTransactionControllerDWR.deleteUserRoleInfo(this.tabId, this.pageScopeId,callObj);
				})
			});
			dlgConfirm.show();
		},

		// formatter que genera el checkbox
		formatterTreeGridBooleanCheckbox : function(value, idx, treepath, p4, controller, disabled) {
			var rowGridItem = p4.grid.getItem(treepath);
			
			if (disabled == false) {
				disabled = rowGridItem.disabled[0];
			}

			if (value != null) {
				if (idx >= 0) {
					// Si el campo contiene la palabra 'none' quiere decir que no existe una funcionalidad para ese canal
					if(value == "none"){
						return "";
					}
					if(typeof value === "string")
					{
						if(value == "true"){
						value = true;	
						}
						else if(value == "false"){
						value= false;
						}
						
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
							NotificationTransactionControllerDWR.setChangedValues(this.tabId, this.pageScopeId, this.field, value, this.fisaRowItem.id[0],
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
												
												model.store.setValue(item,"notifiableValue", itemChanged.notifiableValue);
											}
										},
										errorHandler : this.errorHandler
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
		
		
		
		// formatter que genera el checkbox para la grilla de usuarios adicionales
		formatterUserGridBooleanCheckbox : function(value, idx, column, controller, isDisabled) {
			var rowGridItem=column.grid.getItem(idx);
			
//			if (disabled == false) {
//				disabled = rowGridItem.disabled[0];
//			}

			if (value != null) {
				if (idx >= 0) {
					// Si el campo contiene la palabra 'none' quiere decir que no existe una funcionalidad para ese canal
					if(value == "none"){
						return "";
					}
					if(typeof value === "string")
					{
						if(value == "1"){
						value = true;	
						}
						else if(value == "0"){
						value= false;
						}
						
					}

					 var checkBox = new dijit.form.CheckBox({
					//var checkBox = new ec.fisa.widget.tsc.MixedCheckBox({
						name : "checkBox",
						value : value,
						checked : value,
						disabled: isDisabled
					});
					checkBox.userId = rowGridItem;
					checkBox.userTranId = column.grid.store.getValue(rowGridItem,"userTranId");
					if(column.field == "success"){
						controller.additionalSucessCheckBoxList.push(checkBox.id);
					}
					else if(column.field == "unSuccess"){
						controller.additionalUnSucessCheckBoxList.push(checkBox.id);
					}
					
					return checkBox;
				} else {
					// for summary cell
					return "";
				}
			}
		},
		
		

		// formatter que genera el link
		formatterTreeGridLink : function(value, idx, treepath, p4, controller, disabled) {
			var rowGridItem = p4.grid.getItem(treepath);

			if (disabled == false) {
				disabled = rowGridItem.disabled[0];
			}
			if(rowGridItem.leaf[0] === true){
			
			//if (value != null) {
				if (idx >= 0) {
					// Si el campo contiene la palabra 'none' quiere decir que no existe una funcionalidad para ese canal
					if(value == "none"){
						return "";
					}
					// crear nuevo link
					var link = new Link({
						label:controller.labelsData.addUsersTo,
						title:controller.labelsData.addUsersTo
					});
					
					link.set("enabled",rowGridItem.notifiableValue );

					link.onClick =controller.openAdditionalUsersSelection;
					link.isDisabled = disabled;
					link.fisaRowItem = rowGridItem;
					link.field = p4.field;
					link.treegridId = controller.treegridId;
					link.tabId = controller.tabId;
					link.pageScopeId = controller.pageScopeId;
					link.urlToAdditionalUserPage = controller.urlToAdditionalUserPage;
					link.breadCrumbId = controller.breadcrumbId;

					return link;
				} else {
					// for summary cell
					return "";
				}
			}
		},
		//opens additional users selection
		openAdditionalUsersSelection:function(){
			var dialogStyle=ec.fisa.controller.utils.getGlobalModalSize(0.80);
			var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId,	this.pageScopeId);
			var newSubTabPaneArg = {};
			newSubTabPaneArg.title=ctrlr.labelsData.addUsersTo;
			//newSubTabPaneArg.iconClass="breadcrumbIcon";
			newSubTabPaneArg.href=dojo.config.fisaContextPath +this.urlToAdditionalUserPage;
			newSubTabPaneArg.ioArgs = {
					content : {
						'isDisabled':this.isDisabled,
						'FISATabId':this.tabId,
						'FISAParentPageScopeId':this.pageScopeId,
						'componentId':this.fisaRowItem.componentId[0],
						'parentTreeGridNodeId':this.fisaRowItem.id[0],
						'parentTreeGridParentNodeId':this.fisaRowItem.parentId[0]
					}
			};
		
		newSubTabPaneArg.ioMethod = dojo.xhrPost;
		newSubTabPaneArg.style="height:"+dialogStyle.h-70+"px;width:700px;overflow: auto;";
		newSubTabPaneArg.splitter="true";
		
		ctrlr.contentPanelProperties = new dojox.widget.DialogSimple(newSubTabPaneArg);
		ctrlr.contentPanelProperties.resizeContainerNode=this.resizeNode;
		ctrlr.contentPanelProperties.show();		
		ctrlr.resizeNode(ctrlr.contentPanelProperties,dialogStyle);

//		ec.fisa.navigation.utils.openNewBreadCrumb(newSubTabPaneArg, this.breadCrumbId);
			
		},	
		
		resizeNode:function(lovDialog,dialogStyle){
			var titleDim=domGeometry.getMarginBox(lovDialog.titleNode);
			domStyle.set(lovDialog.containerNode, "height", (dialogStyle.h-titleDim.h-(titleDim.t*4)-85)+"px");
			//domStyle.set(lovDialog.containerNode, "width", "100%");
			domStyle.set(lovDialog.containerNode, "display", "block");
			domStyle.set(lovDialog.containerNode, "overflowY", "auto");
			domStyle.set(lovDialog.containerNode, "overflowX", "auto");
		},
		
		setUrlToAdditionalUserPage:function(url){
			this.urlToAdditionalUserPage = url
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
		
		cancel:function(){		
			
			var callObj = {
					callbackScope : this
				};
			callObj.callback = this.handleCancelAction;
			callObj.errorHandler = this.errorHandler;
			
			NotificationTransactionControllerDWR.cancelUserRoleImpl(this.tabId, this.pageScopeId, callObj);		
			
		},
		
		
		cancelAdditionalUser:function(){		
//			ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadCrumbAdditionalUser);
			this.contentPanelProperties.destroy();
			
		},
		setMessagesPanel : function(messagesPanel) {
			this.inherited(arguments);
			if (typeof this.breadcrumbId === 'undefined'
					|| this.breadcrumbId == null) {
				var breadCrumb = ec.fisa.controller.utils
						.findCurrentBreadCrumb(messagesPanel);
				if (breadCrumb) {
					this.breadcrumbId = breadCrumb.id;
				}
			}
			this.updateMsgsPanel(this.errorMsgs);
		},
		
		setMessagesPanelAdditionalUser:function(messagesPanel){
			this.inherited(arguments);
			if(typeof this.breadCrumbAdditionalUser === 'undefined' || this.breadCrumbAdditionalUser == null){
			this.breadCrumbAdditionalUser=messagesPanel.getParent().getParent().getParent().id;
			}
			this.panelMsgAdditionalId = messagesPanel.id;
			
		},
		
		
		validateFields : function(evalValues) {
			/*var level = new Object();
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
			
			//Retorna false si no hubo mensajes*/
			return false;
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

//			if (fid === 'EFP-MCN-CHM-NOTIFICATION') {
//				var newNotificationMeansListNotAgenda = [];
//				
//				for (var i in this.newNotificationMeansList) {
//					if(this.newNotificationMeansList[i].value != "AGENDA"){
//						newNotificationMeansListNotAgenda.push({label:this.newNotificationMeansList[i].label, selected:this.newNotificationMeansList[i].selected, value:this.newNotificationMeansList[i].value});
//					}
//
//				}
//				field.value = [this.receiverData, newNotificationMeansListNotAgenda, this.priorityId, true];
//			} else {
				
				field.value = "";
//			}
			
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
		cargarTareasMeans : function(tabId, criteria) {
			this.clearPanelMessage();
			var store = null;

			store = new ec.fisa.dwr.Store(
					'NotificationTransactionControllerDWR',
					'viewDataMeans', this.tabId,
					this.pageScopeId, [], null);

			this.meansDataGrid.setStore(store);
			
			dojo.forEach(this.selectMeans, function(value, i){
				this.meansDataGrid.selection.addToSelection(this.meansDataGrid.getItemIndex(value));	
			},this);
			
			this.meansDataGrid.render();	
		},
		
		
		inicializarNotificationMeansList : function() {
			
			var selection = this.selectMeans;
			
			var newNotificationMeansList = [];
			
			for (var i in this.notificationMeansList) {				
					
				var validador = this._indexValue(selection, this.notificationMeansList[i].value);
				if(validador  >= 0	 || this.notificationMeansList[i].value == -1) {	
					newNotificationMeansList.push({label:this.notificationMeansList[i].label, selected:this.notificationMeansList[i].selected, value:this.notificationMeansList[i].value});					
				}
			}
			
			this.newNotificationMeansList = newNotificationMeansList;
		},
		
		logger: function(obj){
			//if(typeof console != "undefined"){
				// console.log(obj);
			//}
		},
		setNotification: function(validador){
			
			var destPanel = dojo.byId(this.destPanelId);
			
			if (validador) {
				
				var selectionGrid = this.meansDataGrid.selection
				.getSelected();
				
				var unSelectionGrid = [];
					
				for (var i in this.notificationMeansList) {
					
					var validadorSecond = this._indexValue(selectionGrid, this.notificationMeansList[i].value);
					if(validadorSecond == -1 
							&& this.notificationMeansList[i].value != -1) {
						
						unSelectionGrid.push(this.notificationMeansList[i].value);
					}
				}
				
				var newNotificationMeansList = [];
				
				for (var i in this.notificationMeansList) {					
				
					var validador = this._indexValue(unSelectionGrid, this.notificationMeansList[i].value);
					if(validador < 0 ) {
						
					
						if (newNotificationMeansList[i] == undefined) {
							
							newNotificationMeansList[i] = new Object();
						}
						newNotificationMeansList[i].label = this.notificationMeansList[i].label;
						newNotificationMeansList[i].selected = this.notificationMeansList[i].selected;
						newNotificationMeansList[i].value = this.notificationMeansList[i].value;
					}
				}				
					
				this._setVisible(destPanel);
				
			} else {
				
				this._setNotVisible(destPanel);
			}

					
		},
		_setVisible: function(component){
			
			domStyle.set(component,"display","block");
		},
		_setNotVisible: function(component){
			
			domStyle.set(component,"display","none");
		}, 
		_indexValue : function(component, index) {
			
			for (var i = 0; i < component.length; i++) {
				
				if(component[i]==index){return i;}
			}
			
			return -1;		
		}
		
		
	});
	return NotificationTransactionController;
});

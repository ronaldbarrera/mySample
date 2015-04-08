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
		"dojo/dom-geometry",
		"dijit/tree/ForestStoreModel",
		"dojox/grid/TreeGrid",
		"dojo/data/ItemFileWriteStore",
		"dijit/form/CheckBox",
		"ec/fisa/widget/tsc/MixedCheckBox",
		"ec/fisa/dwr/Store"], function(dojo,
		declare, lang, BaseController, CustomBtController, formatUtils, navigationUtils, domConstruct, mvc, StatefulModel, StatefulModelParam, domStyle, domGeometry) {

	var AuthorizationRuleController = declare("ec.fisa.controller.tsc.AuthorizationRuleController", CustomBtController, {

		tabId : null,

		pageScopeId : null,

		model : null,

		modelDestinatario : null,

		data : {},
		
		breadcrumbId : null,
		
		icons : null,
		
		labelsData : null,
		
		requiredFieldMessage : null,
		
		priorityId : null,
		
		nextId : null,
		
		isFirstPanel : true,  //id del panel actual
		
		generalPanelId : null,
		
		gridPanelId : null,
		
		userPanelId : null,
		
		rulePanelId : null,
		
		checkRuleId : null,		
		
		checkAlwaysId : null,
		
		checkOneId : null,		
		
		checkAllId : null,
		
		listUserDataGrid : null,
		
		listAppDataGrid : null,
		
		userStore : null,
		
		selectUsers : null,
		
		contentLovAplication : null,
		
		textBtId : null,
		
		textAppDesc : null,
		
		actionId : null,
		
		actionMode : null,
		
		sequence : null,
		
		buttonAdd : null,
		
		textAppSearchId : null,
		
		authorizationRuleId : null,
		
		rule : null,
		
		ruleCondition : null,
		
		selectData : null,
		
		tempUserGrid : null,
		
		panelInit : false,
		
		appId : null,
		
		validBtId : true,
		
		validBtMessages: null,
		
		btnBackId:null,
		btnNextId:null,
		btnSaveId:null,
	
		constructor : function(tabId, pageScopeId, initData) {

			//TODO eliminar variable labelsdata para utilizar variable initlabels de custombtcontroller.
			this.labelsData = this.initLabels;
			this.icons = initData.icons;

			this.tempUserGrid = [];
			this.initData = initData;
			if (initData.aMsgs == undefined) {
				
				this.model = {};
				this.modelDestinatario = {};
				this.appId = "";
				this.userStore =  new ec.fisa.dwr.Store(
						'AuthorizationRuleControllerDWR',
						'viewDataUsers', this.tabId,
						this.pageScopeId, [], null);
				this.init(initData);
			}
			
		},
		init : function(data) {		
			
			this.selectUsers = data.selectUsers;
			this.actionMode = data.actionMode;
			this.sequence = data.sequence;
			this.rule = data.rule;
			this.ruleCondition = data.ruleCondition;
			this.selectData = data.selectData;
			this.requiredFieldMessage = data.requiredFieldMessage;
			this.textBtId = data.textBtId;
			

			delete data.selectUsers;
			delete data.actionMode;
			delete data.sequence;
			delete data.rule;
			delete data.ruleCondition;
			delete data.selectData;
			delete data.requiredFieldMessage;
			delete data.textBtId;
			
			this.data = data;
			
			this.id_lov;// = "dijit_form_Button_5"; // Codigo del lov para ponerle el tooltip en error Mantis 18003
			
			this.model = dojox.mvc.newStatefulModel({
				data : {}
			});
			
			this.modelDestinatario = new StatefulModelParam({
				data : {}
			});			
		},
//
		handleWindowAction : function(outcome) {
			var messagesPanel = dijit.byId(this.messagesPanelId);
			messagesPanel.clearAllMessages();	
			
			if(outcome.wAxn=="cnfrm"){
				ec.fisa.navigation.utils.showNewBreadCrumbConfirmation(outcome.respBtLabels[0],outcome.aMsgs,this.breadcrumbId,this.tabId, this.pageId,null,null,false);	
			} else if (outcome.wAxn != undefined && outcome.wAxn == "close"){
				ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
			} else if (outcome.aMsgs != undefined ) {
//				ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
				this.updateMsgsPanel(outcome.aMsgs);
			}
		
		},

		bindToModel : function(/* widget */component,/* String */modelProp, /*string*/disabled) {
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
			component.set('disabled', disabled === 'true');
		},

		processValue : function(attribute, value) {
			// this.agendaDataGrid.store.setVa
		},

		sendInfoToServer : function() {
			var callObj = {
				scope : this,
				onComplete : function(data) {
					
				}
			};
			callObj.onError = this.errorHandler;

			// Envia al servidor a guardar lo que se haya modificado en el store
			// para el acceso a cuentas.
			//this.accountAccessDataGrid.store.save(callObj);
		},
		
		validateBtInfo : function(callerCmp) {
						
			var level =  40000;	
			var summary = this.requiredFieldMessage["I18N_REQUIRED_FIELDS"];
			var detail = '';
			
			var selectionUserGrid = null;
			var authorizationRule = null; 
			
			var btId = this.textBtId;			
			
			var nameValidation = {field: "AUT_MAIN_TRANS", value : btId};
			
			var returnVal =  this.validateFields([nameValidation]);
			
			if (returnVal != null && returnVal.wAxn == "error"){		
				
				callerCmp.aMsgs = returnVal.aMsgs; 
				callerCmp.wAxn = returnVal.wAxn;
				
				return callerCmp;
			}  
			
			var valueCheckAlways = dojo.byId(this.checkAlwaysId).checked;	//check tipo de regla		
			var valueCheckAll = dojo.byId(this.checkAllId).checked;//check tipo de authorization	
			
			var isAlwaysRule = false;
			var hasError = false;
			if('DE'!=this.actionMode){
				if (valueCheckAlways) {
				
					isAlwaysRule = true;

					selectionUserGrid = this.listUserDataGrid.selection.getSelected();
				
					if (!(selectionUserGrid != null) || !(selectionUserGrid.length > 0)) {
					
						summary = summary + " ["+ this.labelsData["AUT_APPROVES"]+"] ";
						detail =  detail + "** "+this.requiredFieldMessage["I18N_REQUIRED_FIELDS"] +"["+ this.labelsData["AUT_APPROVES"]+"]";
						hasError = true;
					}
				} else {
				
					var tempAuthorizationRule = dijit.byId(this.authorizationRuleId);
					authorizationRule = tempAuthorizationRule.get("value");
				
					if (!(authorizationRule != null) || !(authorizationRule.group.length > 0)) {
					
						summary = summary + " ["+ this.labelsData["AUT_BT_TITTLE"]+"] ";
						detail =  detail + "** "+this.requiredFieldMessage["I18N_REQUIRED_FIELDS"] +"["+ this.labelsData["AUT_BT_TITTLE"]+"]";
						hasError = true;
					}				
				}
			}
			
			var isAll = false;
		
			if (valueCheckAll) {
				
				isAll = true;
			}

			var errorMsg = this.generateMsg(summary, detail, level);
			
			
			if (hasError) {
				callerCmp.aMsgs = errorMsg;
				callerCmp.wAxn = "error";								
			} else {
			
				callerCmp.wAxn = "cnfrm";
				
				callerCmp.data = {};
				callerCmp.data.isAlwaysRule= isAlwaysRule;
				callerCmp.data.btId= btId;
				callerCmp.data.isAll= isAll;
				callerCmp.data.selectionUserGrid= selectionUserGrid;
				callerCmp.data.authorizationRule= authorizationRule;
			}
	
			return callerCmp;			
		},
		
		save : function(callerCmp) {
			var data = callerCmp.data;
			
			var callObj = {
				callbackScope : this
			};
			callObj.callback = this.handleWindowAction;
			callObj.errorHandler = this.errorHandler;
			AuthorizationRuleControllerDWR.saveUserRolInformation(this.tabId, 
					this.pageScopeId,  this._addNotificationValData(), [data.isAlwaysRule, data.isAll], data.btId, data.selectionUserGrid,  data.authorizationRule, this.appId, callObj);
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
					AuthorizationRuleControllerDWR.deleteUserRoleInfo(this.tabId, this.pageScopeId,callObj);
				})
			});
			dlgConfirm.show();
		},
		cancel:function(){		
			
			var callObj = {
					callbackScope : this
				};
			callObj.callback = this.handleCancelAction;
				
			callObj.errorHandler = this.errorHandler;
			
			AuthorizationRuleControllerDWR.cancelUserRoleImpl(this.tabId, this.pageScopeId, callObj);		
			
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
				outcome.aMsgs = errorMsg;
				outcome.wAxn = "error";
				
				this.addToolTipRequiredField(this.id_lov); // add tooltip required field
			} else {
				outcome.wAxn = "cnfrm";
			}	
			
			return outcome;
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

			if (this.modelDestinatario.contains(eid)) {
				// if exists yet updates new value.
				if (this.modelDestinatario.contains([ eid, 'dataMessage',
						'fields', fid ])) {
					this.modelDestinatario.setValue([ eid, 'dataMessage',
							'fields', fid, 'value' ],
							field.value);
				}
			} else {
				var formater = null;
				if (component instanceof ec.fisa.widget.DateTextBox) {
					formater = ec.fisa.format.utils.formatLongDate;
				}
				this.modelDestinatario.appendObject([ eid, 'dataMessage',
						'fields', fid, 'value' ], field.value,
						component.id, 'value', formater, true);

				var enabled = null;
				if (field.enabled != undefined) {
					enabled = field.enabled;
				}
				this.modelDestinatario.appendObject([ eid, 'dataMessage',
						'fields', fid, 'enabled' ], enabled,
						component.id, 'enabled', null, false);

				if (component.hasCompl) {
					this.modelDestinatario.appendObject([ eid,
							'dataMessage', 'fields', fid,
							'complement' ], field.complement,
							component.id, 'complement', null,
							false);
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
		logger: function(obj){
			//if(typeof console != "undefined"){
				//console.log(obj);
			//}
		},
		_setVisiblePanel: function(component){
			//component.set("display","block");
			component.style.display = 'block';
			//component.resize();
			domStyle.set(component,"display","block");
		},
		_setNotVisiblePanel: function(component){
			//component.set("display","none");
			domStyle.set(component,"display","none");
		}, 
		next : function () {
			
			var notificationWdg = dijit.byId(this.notificationAdditionalsWdgId);
			
			var btId = this.textBtId;	
			
			var nameValidation = {field: "AUT_MAIN_TRANS", value : btId};				

			if (!this.validBtId) {
				
				var messagesPanel = dijit.byId(this.messagesPanelId);
				messagesPanel.clearAllMessages();					
				this.updateMsgsPanel(this.validBtMessages);
				return;
			};
			
			var returnVal =  this.validateFields([nameValidation]);
			
			if (returnVal != null && returnVal.wAxn == "error"){		
				var aMsgs = returnVal.aMsgs; 
				if(aMsgs != undefined && aMsgs != null){
					if(aMsgs[0] != undefined && aMsgs[0] != null){
						var message=	this.generateMsg(aMsgs[0].summary,aMsgs[0].detail,40000);
						this.clearPanelMessage();
						this.updateMsgsPanel(message);
					}
				}
				return;
			}
		
			var userPanel = dojo.byId(this.userPanelId);
			var pannelGeneral = dojo.byId(this.generalPanelId);
			var pannelRule = null; 
			var valueCheck = dojo.byId(this.checkRuleId).checked;
			
			if (valueCheck) {				
				pannelRule = dojo.byId(this.rulePanelId);				
			} else {				
				pannelRule = dojo.byId(this.gridPanelId);
				
			}
			
			if (this.isFirstPanel) {
				
				this._setVisiblePanel(pannelRule);
				this._setNotVisiblePanel(pannelGeneral);
				
				var btnNext = dijit.byId(this.btnNextId);
				var btnBack = dijit.byId(this.btnBackId);
				var btnSave = dijit.byId(this.btnSaveId);
				
				this._setVisible(btnBack);			
				this._setVisible(btnSave);	
				this._setNotVisible(btnNext);	
				
				
				//muestra el widget de notificaciones
				dojo.forEach(notificationWdg, function(val) {
					var notiValWdgId = val.notifWdgId;
					var notiValWdg = dijit.byId(notiValWdgId);
					this._setNotVisible(notiValWdg.getParent());
				}, this);		
				
				if (!valueCheck) {	
					domStyle.set(userPanel,"display","block");
					userPanel.style.display = 'block';
					domStyle.set(this.listUserDataGrid,"display","block");
					this.listUserDataGrid.render();
					this.listUserDataGrid.resize();
				} else {
					
					this.initPanel();
				}
				
				this.isFirstPanel = false;
				
			} else {
				
				this._setVisiblePanel(pannelGeneral);
				this._setNotVisiblePanel(pannelRule);
				
				var btnNext = dijit.byId(this.btnNextId);
				var btnBack = dijit.byId(this.btnBackId);
				var btnSave = dijit.byId(this.btnSaveId);
				
				this._setNotVisible(btnBack);			
				this._setNotVisible(btnSave);	
				this._setVisible(btnNext);	
				
				//muestra el widget de notificaciones
				dojo.forEach(notificationWdg, function(val) {
					var notiValWdgId = val.notifWdgId;
					var notiValWdg = dijit.byId(notiValWdgId);
					this._setVisiblePanel(notiValWdg.getParent(), "block");
				}, this);
				
				this.isFirstPanel = true;		
			}
		},
		// métodos para cargar lov bts
		openLovAplication : function() {
			
			if (this.disabled || this.actionMode != "IN") {

				return;
			}

			this.clearPanelMessage();
			
			this.appStore =  new ec.fisa.dwr.Store(
					'AuthorizationRuleControllerDWR',
					'viewApplications', this.tabId,
					this.pageScopeId, [], null);
			
			
					var dialogStyle=ec.fisa.controller.utils.getGlobalModalSize(0.80);
			
					this.contentLovAplication = new dojox.widget.DialogSimple(
							{
			
								title : 'Aplicaciones',
								href : './static/tsc/authorization_rule/fragment/lovApplication.jsp',
								ioArgs : {
									content : {
										FISATabId : this.tabId,
										FisaPageScopeId : this.pageScopeId
									}
								},
								ioMethod : dojo.xhrPost,
								style:"height:"+dialogStyle.h+"px;width:"+dialogStyle.w+"px;"
							});
					this.contentLovAplication.resizeContainerNode=this.resizeNode;
					this.contentLovAplication.show();			
					this.resizeNode(this.contentLovAplication,dialogStyle);
		
		},
		closeLovAplication : function() {

			this.contentLovAplication.destroy();
			this.clearPanelMessage();
			
		}, 
		saveLovAplication : function() {
			
			this.clearPanelMessage(); 
			var selectionAppGrid = this.listAppDataGrid.selection.getSelected();			
			
			var label = "";
			var btId = "";
					
			if (selectionAppGrid != null && (selectionAppGrid[0] != undefined || selectionAppGrid[0] != null)) {
								
				this.appId = selectionAppGrid[0];					
				label =	this.listAppDataGrid.store.getValue(this.appId, 'appName');
				btId =	this.listAppDataGrid.store.getValue(this.appId, 'btId');
			}
			
			this.textBtId = btId;
			dijit.byId(this.textAppDesc).set("value", label);
			
			this.contentLovAplication.destroy();
			this.removeToolTipRequiredField(this.id_lov); // remove tooltip 
			
			this.initSecondPanel(btId, label);
			
		}, 
		updateLovAplication : function(actionId) {
			if (actionId != 'IN') {
				
				return;
			}
			
			this.clearPanelMessage(); 				
			
			var label = dijit.byId(this.textAppDesc).get("value");
			var btId = null;
			
			var callObj = {
					callbackScope : this
				};
			callObj.callback = function(outcome) {
				
				if(outcome.btId != undefined) {
					
					btId = outcome.btId;
					
					this.appId = outcome.id;					
					label =	outcome.appName;
					btId =	outcome.btId;
						
					this.initSecondPanel(btId, label);
					
					this.textBtId = btId;	
				} else {
					this.handleWindowAction(outcome);
				}
				
			};
			callObj.errorHandler = this.errorHandler;
			AuthorizationRuleControllerDWR.getApplicationItem(this.tabId, 
					this.pageScopeId, [label], callObj);
			
		},
		initSecondPanel : function (btId, label) {
			
			var callObj = {
					callbackScope : this
				};
			callObj.callback = function(outcome) {
				this.validBtId = outcome.validBtId;
				
				if (!this.validBtId) {
					this.validBtMessages = outcome.aMsgs;
					var messagesPanel = dijit.byId(this.messagesPanelId);
					messagesPanel.clearAllMessages();					
					this.updateMsgsPanel(outcome.aMsgs);
					
					this.addToolTipRequiredField(this.id_lov); // Add Tooltip 
				} 
				
				this.clearAuthorization();
				
			};
			callObj.errorHandler = this.errorHandler;
			//btId = "CCI_PRC_CHR_NFIS0000";//TODO borrar
			AuthorizationRuleControllerDWR.initializeBT(this.tabId, 
					this.pageScopeId, btId, label, callObj);
			
		},
		//Combos panel authorizationGeneral
		setRuleChange : function() {
		
			var checkAlways = dijit.byId(this.checkAlwaysId);
			var checkRule = dijit.byId(this.checkRuleId); 
			
			if (checkAlways == null || checkRule == null) {
				
				return;
			}
			if (checkRule.checked) {
				
				checkAlways.set("value", false, false);				
			} else {
				checkAlways.set("value", true, false);	
			}
		},
		//Combos panel authorizationGeneral
		setAlwaysChange : function() {
			
			var checkAlways = dijit.byId(this.checkAlwaysId);
			var checkRule = dijit.byId(this.checkRuleId); 
			
			if (checkAlways == null || checkRule == null) {
				
				return;
			}
			
			if (checkAlways.checked) {
				
				checkRule.set("checked", false, false);				
			} else {
				checkRule.set("checked", true, false);	
			}
			
		},	
		//Combos panel authorizationGrid
		setOneChange : function() {
		
			var checkOne = dijit.byId(this.checkOneId);
			var checkAll = dijit.byId(this.checkAllId); 
			
			if (checkOne == null || checkAll == null) {
				
				return;
			}
			if (checkOne.checked) {
				
				checkAll.set("value", false, false);				
			} else {
				checkAll.set("value", true, false);	
			}
		},
		//Combos panel authorizationGrid
		setAllChange : function() {
			
			var checkOne = dijit.byId(this.checkOneId);
			var checkAll = dijit.byId(this.checkAllId); 
			
			if (checkAll == null || checkOne == null) {
				
				return;
			}
			
			if (checkAll.checked) {
				
				checkOne.set("checked", false, false);				
			} else {
				checkOne.set("checked", true, false);	
			}
			
		},
		
		update : function() {
			
			var parametro = dojo.byId(this.textAppSearchId).value;
			
			this.appStore =  new ec.fisa.dwr.Store(
					'AuthorizationRuleControllerDWR',
					'viewApplications', this.tabId,
					this.pageScopeId, [parametro], null);
			this.listAppDataGrid.setStore(this.appStore);
		},
		
		setAuthorizationRule : function (authorizationRule) {
			
			this.authorizationRuleId = authorizationRule.id;
			
			if (this.rule != null && this.ruleCondition != undefined && this.selectData != undefined) {
				
				
				authorizationRule.set("value", [this.rule, this.ruleCondition, this.selectData]); 
			}
		},
		
		initPanel : function () {
			
			this.panelInit = true;			

			var tempAuthorizationRule = dijit.byId(this.authorizationRuleId);
			tempAuthorizationRule.relatedFieldBt = this.textBtId;
			//tempAuthorizationRule.relatedFieldBt = "CCI_PRC_CHR_NFIS0000";//TODO borrar
			
			dojo.forEach(this.tempUserGrid, function(userGrid, idx){
							
				var userPannel = dojo.byId(userGrid.getParent().id);
				domStyle.set(userPannel,"display","block");
				userPannel.style.display = 'block';
				domStyle.set(userGrid,"display","block");
				userGrid.render();
				userGrid.resize();
				
			},this);
			
			delete this.tempUserGrid;
		}, 
		resizeNode:function(lovDialog,dialogStyle){
			var titleDim=domGeometry.getMarginBox(lovDialog.titleNode);
			domStyle.set(lovDialog.containerNode, "height", (dialogStyle.h-titleDim.h-(titleDim.t*4))+"px");
			//domStyle.set(lovDialog.containerNode, "width", "100%");
			domStyle.set(lovDialog.containerNode, "display", "block");
			domStyle.set(lovDialog.containerNode, "overflowY", "auto");
			domStyle.set(lovDialog.containerNode, "overflowX", "auto");
		},
		
		/**
		 * Mantis 18003 Add tooltip in field required
		 * @author Christian Mora
		 */
		addToolTipRequiredField:function(field){
			var level={level:40000};
			ec.fisa.format.utils.addToFieldError(field,"El Campo es requerido.",level,null); // Mostrar tooltip en error Mantis 18003 CM
		},
		
		/**
		 * Mantis 18003 remove tooltip from field required after validation
		 * @author Christian Mora
		 */
		removeToolTipRequiredField:function(field){		
			ec.fisa.format.utils.removeFieldError(field); // Mantis 18003 CM - Cerrar tooltip en caso de error al cerrar el lov
		},
		
		clearAuthorization:function(){
			
			//TODO
		}
	});
	return AuthorizationRuleController;
});
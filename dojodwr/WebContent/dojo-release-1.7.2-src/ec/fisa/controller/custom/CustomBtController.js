define([
        "dojo/_base/kernel",
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dijit/focus",
        "dojo/aspect",
        "ec/fisa/controller/BaseController",
        "ec/fisa/format/Utils",
        "ec/fisa/widget/Link",
        "ec/fisa/navigation/Utils",
        "dojo/data/ItemFileWriteStore",
        "dojo/dom-construct",
        "dojo/dom-geometry",
        "dijit/tree/ForestStoreModel",
        "dojox/grid/TreeGrid",
        "ec/fisa/widget/DocumentActions",
        "ec/fisa/mvc/StatefulModel",
        "dojo/on",
        "ec/fisa/controller/custom/QtController",
        "dojo/topic",
        "dojo/dom-style",
        "dojox/mvc",
		"dojox/mvc/StatefulModel",
        "ec/fisa/grid/FisaEditableGridDirect",
        "ec/fisa/widget/DialogSecurity",
        "./_base","ec/fisa/widget/DateTextBox",
        "dojox/lang/functional/object",
        "ec/fisa/dwr/proxy/BtControllerDWR",
        "ec/fisa/dwr/proxy/EventReportActionDWR",
        "ec/fisa/dwr/proxy/RuleFieldSelectorControllerDWR",
        "dojox/lang/functional",
        "ec/fisa/widget/Select",
        "ec/fisa/grid/FisaFormGrid"
        ],function(dojo,declare,lang,focusUtil,aspect,BaseController,formatUtils,fisaLink,navigationUtils,
        		ItemFileWriteStore,domConstruct,domGeometry,ForestStoreModel,TreeGrid,DocumentActions,
        		StatefulModel,on, QtController, topic, domStyle,mvc, dojoxStatefulModel){

	var CustomBtController = declare("ec.fisa.controller.custom.CustomBtController", [BaseController], {
		tabId:null,
		pageScopeId:null,
		model:null,
		data:null,
		/* grid data */
		documentData:null,
		/* combo options status */
		comboStatusOptions:null,
		initMsgs:null,
		shortDateFormatTree:null,
		breadcrumbId:null,
		btnsContainer:null,
		selectDataMap:null,
		lovData:null,
		labels:null,
		btId:null,
		actionId:null,
		contextPath:dojo.config.fisaContextPath,
		isDisabled:null,
		btActionMode:null, 
		tableRegistry:null,
		treeGridDocuments:null,
		/*TEMPLATE*/
		saveAsTemplateChckBoxId:null,
		/*notification widget*/
		notificationAdditionalsWdgId:null,
		//labels for initializacion of the bt.
		initLabels:null,

		// Indicates the content pane in which the bt is loaded.
		btContentPaneId:null,
		dateFields:null,
		//this is for security it has the factors applied to the bt.
		secBeforeListFactor:null,
		secAfterListFactor:null,
		subscriptions:null,
		/**Variable to contains the parent bt pagescope id used only in confirmation bt for reports*/
		parentConfBtPageScopeId:null,
		//document content pane widget.
		documentContentPaneWdgId:null,
		//bt Tab container id.
		btTabContainerId:null,
		//map with select id with field id
		selectComponentToReload:null,//En selección de beneficiarios, cuando un combo tiene asociado un link de seleccion de beneficiarios JCVQ
		selectIdMap:null,
		
		buttonLabel : "Accept",
		
		sequenceBtScheduleButtonData:null,
		
		//variables definidas para el skin seleccionado
		skinParameters : null,
		
		data : null,
		
		constructor: function (tabId,pageScopeId,initData) {
			this.tabId=tabId;
			this.pageScopeId=pageScopeId;
			this.secBeforeListFactor = initData.secBeforeListFactor;
			this.secAfterListFactor = initData.secAfterListFactor;			
			this.initLabels = initData.initLabels;
			this.isSequence= initData.isSequence;			
			
			this.btActionMode = initData.btActionMode;
			this.btId = initData.btId;
			
			this.notificationAdditionalsWdgId=[];
			
			this.skinParameters = initData.skinParameters;
			
			if (initData.aMsgs != undefined) {
			
				this.initMsgs = initData.aMsgs;
			}	
			
			this.data = {};
			
			this.model = dojox.mvc.newStatefulModel({
				data : {}
			});
			
			this.verifyBeforeSecurity();

			delete tabId;
			delete pageScopeId;
			delete initData.initLabels;
			delete initData.secBeforeListFactor;
			delete initData.secAfterListFactor;
			delete initData.isSequence;
			delete initData.actionId;
			delete initData.skinParameters;
		},
		
		mergeObjects:function(obj1,obj2){
			if (!obj1){
				obj1={};
			}
			if(obj2){
				for(var attrib in obj2){
					obj1[attrib]=obj2[attrib];
				}			
			}
			return obj1;
		},

		destroy:function(){
	//TODO DEFINIR MODELO DE MENSAJES PARA PERSONALIZADAS
//			if(this.model!=null){
//				this.model.clearAllMessages();
//			}
			this.data=null;
			this.model=null;
			this.lovData = null;
			this.tableRegistry = null;
			this.initMsgs = null;
			this.notificationAdditionalsWdgId=null;
			//código para eliminar subscripciones 
			dojox.lang.functional.forIn(this.subscriptions,function(subscription, btId){
				if(subscription.remove && lang.isFunction(subscription.remove)){
					subscription.remove();
				}
			}, this);
		},
		
		/**verifys if this bt has security to be shown before. It looks for a number of factors of security. could be more than one and must
		 * be continued one after another.*/
		verifyBeforeSecurity:function(){
			if(this.secBeforeListFactor != null && this.secBeforeListFactor != undefined && this.secBeforeListFactor.length > 0 && this.showConfirmation != "true"){
				this.createDialogSecurityFactor(this.secBeforeListFactor);
			}
		},
		/**Called after the bt was shown, and before it goes to the pe.*/
		verifyAfterSecurity:function(callerCmp){
			if(this.secAfterListFactor != null && this.secAfterListFactor != undefined && this.secAfterListFactor.length > 0){
				var thirdDlg = this.createDialogSecurityFactor(this.secAfterListFactor);
				thirdDlg["dlgSuccessEvent"]=dojo.hitch(this,function(callerCmp,argument){
					this._execActionInternal(callerCmp);
					},callerCmp);
			}
			else{
				this._execActionInternal(callerCmp);
			}
		},
		//TODO AUN NO EXISTE PANTALLA PERSONALIZADA PARA USAR ESTA PROPIEDAD, 
		/**Called after the bt was shown, and before it goes to the pe.*/
		verifyAfterSecuenceSecurity:function(/* String */sequenceId,/* String */ nextStep){
			if(this.secAfterListFactor != null && this.secAfterListFactor != undefined && this.secAfterListFactor.length > 0
			 && (this.showDocuments != "true" || this.showConfirmation != "true")		
			){
				var thirdDlg = this.createDialogSecurityFactor(this.secAfterListFactor);
				thirdDlg["dlgSuccessEvent"]=dojo.hitch(this,function(sequenceId,nextStep,argument){
					this._handleSeqNextActionInternal(sequenceId,nextStep);
				},sequenceId,nextStep);
			}
			else{
				this._handleSeqNextActionInternal(sequenceId,nextStep);
			}
		},
		
		/**Creates the security dialog*/
		createDialogSecurityFactor:function(/*array*/secListFactor){
			var dialogStyle=ec.fisa.controller.utils.getGlobalModalSize(0.50);
			dialogStyle.h = dialogStyle.h+100; //to fix height to more appropiate size
			var thirdDlg = new ec.fisa.widget.DialogSecurity({
				'title': this.initLabels["titleSecurityPopup"],
				'draggable':false,
				'wdgtWidth':dialogStyle.w,
				'wdgtHeight':dialogStyle.h,
				'tabId':this.tabId,
				'secListFactor':secListFactor,
				'pageScopeId':this.pageScopeId+"sec_pop",
				'style': {width: dialogStyle.w+'px', height:dialogStyle.h+'px'},
				'dlgCancelEvent':dojo.hitch(this,function(argument){
//					var outcome ={wAxn:'close'};				
					this.cancelAuthenticationFactorDialog();
//					this.handleWindowAction(outcome);
				})
			});
			thirdDlg.show();
			return thirdDlg;
		},
		

		getComponent:function(btId,fieldId){
			return this.model.getComponent([btId,'dataMessage','fields',fieldId,'value']);
		},
		addParamToModel:function(component){
			var eid=component["bt-id"];
			var fid=component["field-id"];
			var field = null;
			if(this.data&&this.data[eid]&&this.data[eid].dataMessage){
				field = this.data[eid].dataMessage.fields[fid];
			}
			if(field == null) {
				field={value:'',complement:null};
				component._fStarted=true;
			} else if(field.value==null){
				field.value="";
				component._fStarted=true;
			}else if(field.value==''){
				component._fStarted=true;
			}
			
			var isEditableGridDirect = false;
			if(component instanceof ec.fisa.grid.FisaEditableGridDirect){
				isEditableGridDirect = true;
			}else if (component instanceof ec.fisa.grid.FisaFormGrid){
				isEditableGridDirect = true;
			}
			
			if(this.model.contains(eid)){
				// if exists yet updates new value.
				if(this.model.contains([eid,'dataMessage','fields',fid]) ) {
					if(isEditableGridDirect == true){
						this.model.setValue([eid,'dataMessage','fields',fid,'multivalueList'],field.value);
					}
					else{
						this.model.setValue([eid,'dataMessage','fields',fid,'value'],field.value);
					}
					
				}
			} else {
				if(isEditableGridDirect == true){
					this.model.appendObject([eid,'dataMessage','fields',fid,'multivalueList'],field.value,component.id,'value',null,false);
				}
				else{
					this.model.appendObject([eid,'dataMessage','fields',fid,'value'],field.value,component.id,'value',null,false);
				}
				
			
				//este valro viene seteado en el fm cuando es llamado de una rutina generalmente la onload.
				var enabled = null;
				if(field.enabled != undefined ){
					enabled = field.enabled;
					
				}
				this.model.appendObject([eid,'dataMessage','fields',fid,'enabled'],enabled,component.id,'enabled',null,false);

				if(component.hasCompl){
					this.model.appendObject([eid,'dataMessage','fields',fid,'complement'],field.complement,component.id,'complement',null,false);
				}


			}
			//Logica para seleccion de Beneficiarios. JCVQ
			//Se verifica si el componente es de tipo ec.fisa.widget.Select y si tiene la propiedad hasBeneficiarySelectionLink == true para registrarlo
			//Este componente select invocara la actualización de sus opciones luego de regresar de la QT de selección de Beneficiarios.
			if(component instanceof ec.fisa.widget.Select && (component.hasBeneficiarySelectionLink == true || component.hasBeneficiarySelectionLink == "true")){
				this.selectComponentToReload = component;
			}
			
		},
		containsFieldModel:function(eid, fid){
			return this.model.contains([eid,'dataMessage','fields',fid,'value']);
		},
		getFieldModel:function(eid, fid){
			return this.model.getValue([eid,'dataMessage','fields',fid,'value']);
		},
		setFieldModelValue:function(eid, fid, value, priorityChange) {
			this.model.setValue([eid,'dataMessage','fields',fid,'value'],value, priorityChange);
		},
		/** updates the mvc with the enabled attribute. */
		setFieldModelEnabled:function(/* String businesstemplate id */btId,/*
		 * String
		 * fieldId
		 */ fid,/* boolean */ value) {
			this.model.setValue([btId,'dataMessage','fields',fid,'enabled'],value);
		},

		setFieldModelComplement:function(eid, fid, complement) {
			this.model.setValue([eid,'dataMessage','fields',fid,'complement'],complement);
		},
		getFieldModelComplement:function(eid, fid) {
			return this.model.getValue([eid,'dataMessage','fields',fid,'complement']);
		},
		/* sets if components will show in disabled mode. */
		setIsDisabled:function(/* boolean */isDisabled){
			this.isDisabled = isDisabled;

		},

		addControllerRef:function(component){
			component.fc=this;
		},
//		handleCancelAction:function(outcome){
//			this.handleWindowAction(outcome);
//		},
		handleCancelAction : function() {
			
			var breadCrumb = dijit.byId(this.breadcrumbId);
			var selectedPane = breadCrumb.selectedChildWidget;
			var verifyLastTab = false;
			if (selectedPane.postClose != null
					&& selectedPane.postClose != undefined
					&& selectedPane.postCloseScope != undefined
					&& selectedPane.postCloseScope != null) {
				var scp = dijit
						.byId(selectedPane.postCloseScope);
				selectedPane.postClose.apply(scp,
						selectedPane.postCloseArgs);
			} else {
				verifyLastTab = true;
			}
			if (this.isSequence != null
					&& this.isSequence == "true") {
				ec.fisa.navigation.utils
						.closeSequenceBreadCrumb(this.breadcrumbId);
			} else {
				ec.fisa.navigation.utils
						.closeCurrentBreadCrumb(this.breadcrumbId);
			}
			// this is used only in agenda. when postbt is
			// showed, then close the bt too.
			if (selectedPane != null
					&& selectedPane.postCloseArgs != null
					&& selectedPane.postCloseArgs != undefined
					&& selectedPane.postCloseArgs.btBreadCrumbId != null
					&& selectedPane.postCloseArgs.btBreadCrumbId != undefined
					&& selectedPane.postClose != undefined
					&& selectedPane.postCloseScope != undefined) {
				ec.fisa.navigation.utils
						.closeCurrentBreadCrumb(selectedPane.postCloseArgs.btBreadCrumbId);
			}
			if (verifyLastTab) {
				ec.fisa.menu.utils
						.addEmptyTabAllClosed(dojo.config.fisaNewTabLabel);
			}
		},
		/**Handles the window action based on the outcome of the eventactiondwr or eventsequencedwr*/
		handleWindowAction:function(outcome){
			//overrides agenda behavior-> to just close the current breadcrum
			if(this.fromAgenda != null && this.fromAgenda == "true" && outcome.wAxn!="error"){
				outcome.wAxn = "close";
			}
			if(outcome.wAxn=="close"){
				var breadCrumb = dijit.byId(this.breadcrumbId);
				var selectedPane = breadCrumb.selectedChildWidget;
				var verifyLastTab=false;
				if(selectedPane.postClose != null && selectedPane.postClose != undefined && selectedPane.postCloseScope != undefined &&
						selectedPane.postCloseScope != null){
					var scp=dijit.byId(selectedPane.postCloseScope);
					selectedPane.postClose.apply(scp,selectedPane.postCloseArgs);
				} else {
					verifyLastTab=true;
				}
				if(this.isSequence != null && this.isSequence == "true"){
					ec.fisa.navigation.utils.closeSequenceBreadCrumb(this.breadcrumbId);
				} else {
					ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
				}
				//this is used only in agenda. when postbt is showed, then close the bt too.
				if(selectedPane != null && selectedPane.postCloseArgs!= null 
						&& selectedPane.postCloseArgs!= undefined &&
						selectedPane.postCloseArgs.btBreadCrumbId !=null && selectedPane.postCloseArgs.btBreadCrumbId != undefined
						&& selectedPane.postClose != undefined && selectedPane.postCloseScope != undefined){
					ec.fisa.navigation.utils.closeCurrentBreadCrumb(selectedPane.postCloseArgs.btBreadCrumbId);
				}
				if(verifyLastTab){
					ec.fisa.menu.utils.addEmptyTabAllClosed(dojo.config.fisaNewTabLabel);
				}
			} else if(outcome.wAxn=="cnfrm"){
				this.handleConfirmationBt(outcome);
			} else if(outcome.wAxn=="error"){
				this.updateMsgsPanel(outcome.aMsgs);
				this.refreshTableRegistry();
			} else if(outcome.wAxn=="close&refresh"){
				ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
				var refControlller=ec.fisa.controller.utils.getPageController(outcome.parentFisaTabId,outcome.parentFisaPageScopeId);
				if (refControlller != undefined && refControlller instanceof CustomBtController) {
					var ttr = dijit.byId(refControlller.tableRegistry[outcome.parentBtId][outcome.parentEntityId]);
					if (ttr != undefined && ttr != null) {
						ttr.refresh();
					}
				}
			} else if(outcome.wAxn == "showDlg"){
				if(this.isSequence != undefined && this.isSequence != null && this.isSequence === "true"){
					ec.fisa.navigation.utils.templateSequenceDlgShowAction(outcome.respBtLabels,this.tabId,this.pageScopeId,this.sequenceId);
				}else{
					ec.fisa.navigation.utils.templateDlgShowAction(outcome.respBtLabels,this.tabId,this.pageScopeId,this.btId,this.btActionMode,this.isSequence);
				}
			}
			else {
				alert("unknown action!");
			}
		},

		/**
		 * to handle confirmation verify if there is parametrized in visualbt a
		 * postsequence bt if not show confirmation.
		 */
		handleConfirmationBt:function(outcome){
			
			var title =outcome.respBtLabels[0];
			var msg = outcome.aMsgs;
			var postBtId= outcome.postBtId;
			var principalBtId = outcome.pBtId;
			var postBtIdDataKey = outcome.postBtIdDataKey;
			var principalPostBtIdDataKey =outcome.principalPostBtIdDataKey;
			var parentBtInAuthorization = outcome.parentBtInAuthorization;
			
			var showReportModule= outcome.showReportModule;
			var showReportAuto = outcome.showReportAuto;
			
			var messagesPanel = dijit.byId(this.messagesPanelId);
			messagesPanel.clearAllMessages();
			this.model.clearAllMessages();
			if(postBtId == null){
				ec.fisa.navigation.utils.showNewBreadCrumbConfirmation(title,msg,this.breadcrumbId,this.tabId,
						this.pageScopeId,this.btId,this.btActionMode,this.isSequence,showReportModule,showReportAuto);
			} else {
				var breadcrumb = dijit.byId(this.breadcrumbId);
				ec.fisa.navigation.utils.showPostBtBreadCrumb(breadcrumb.params.title,msg,this.tabId,
						this.pageScopeId,postBtId,principalBtId,this.btContentPaneId,postBtIdDataKey,
						principalPostBtIdDataKey,this.isSequence,showReportModule,showReportAuto,parentBtInAuthorization,false);
			}
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

			this.btContentPaneId = messagesPanel.getParent().getParent().id;
			delete this.initMsgs;
		},
		/* sets btId for future use. */
		setBtId:function(btId){
			this.btId =  btId;
		},
		/* sets btId for future use. */
		setActionId:function(actionId){
			this.actionId =  actionId;
		},
		setShortDateFormatTree:function(shortDateFormatTree){
			this.shortDateFormatTree = shortDateFormatTree;
		},
		setLabels:function(/* objeto con los labels */labels){
			this.labels = labels;
		},
		
		setBreadcrumb:function(breadcrumb){
			this.breadcrumbId = breadcrumb.id;
		}, 
		/** only for documents opened in qt */
		setQtDocBreadcrumb:function(component){
			var breadCrumb=ec.fisa.controller.utils.findCurrentBreadCrumb(component);
			if(breadCrumb){
				this.breadcrumbId=breadCrumb.id;
			}
		},
		showMessages : function(outcome) {
			if (outcome != null) {
				this.clearPanelMessage();
				this.updateMsgsPanel(outcome.aMsgs);
			}
		},
		clearPanelMessage:function(){
			if(this.messagesPanelId){
				var messagesPanel = dijit.byId(this.messagesPanelId);
				messagesPanel.clearAllMessages();
			}
		},
		getSelectedIndex:function(component){
			var outcome = -1;
			var options = component.getOptions();
			var i = 0;
			for(i = 0 ; i < options.length; i++){
				var option = options[i];
				if(option.selected === true){
					outcome = i;
					break;
				}
			}
			return outcome - 1;//Se resta 1 ya que la primera opcion del combo es seleccione
		},
		/*sets tab container*/
		setBtTabContainerId:function(btTabContainerId){
			this.btTabContainerId = btTabContainerId;
			var tabs = dijit.byId(btTabContainerId);
			tabs.tabId = this.tabId;
			tabs.pageScopeId = this.pageScopeId;
			

			aspect.around(tabs, "selectChild", function(selectChild) {
				return function(page) {
					//only in change tab
					if(this.selectedChildWidget != page){
						
						var btActionMode = this.selectedChildWidget["action_mode"];
						var btId = this.selectedChildWidget["field-id"];
					
						var btController = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
						btController.clearPanelMessage();
						if(btController.model != null){
							btController.model.clearAllMessages();
						}
						var callObj={callbackScope:{btController:btController,selectChild:selectChild,arguments:arguments,tabContainer:this}};
						callObj.errorHandler=dojo.hitch(btController,btController.errorHandler);
						callObj.callback=btController._updatedFtmLaunchCallBack;
						var fm = btController.model.toPlainObject();
						EventActionDWR.validateBtKeys(fm,this.tabId,this.pageScopeId,btActionMode,btId,callObj);	
					}	
					
				}
			});
		},cancelAuthenticationFactorDialog:function(){
			  //if bt is not null or undefined means that a bt is open, so It should be unlock in DDBB.
			var controller=ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
			controller.cancel();
		}, /**Executes internal action.*/
		_execActionInternal:function(/*component*/callerCmp){

			var controller=ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
		
			if (callerCmp["fisa-action-id"]) {
				
				this.btActionMode = callerCmp["fisa-action-id"];
			}			
			
			
			if(this.btActionMode == "IN" || this.btActionMode == "UP"){
				
				controller.save(callerCmp);
				
			} else if (this.btActionMode == "DE") {
				
				controller.remove(callerCmp);
			}
		},
		/**called after bt being validated.*/
		execAction:function(outcome){			
			
			var callerCmp = {};
			
			if (outcome) {
				callerCmp["fisa-action-id"] = outcome.btAction;
				callerCmp["fisa-bt-id"] =outcome.btId;
				callerCmp["fisa-parameters"] =outcome.parameters;
				
			} else {
				
				callerCmp["fisa-action-id"] = this.btActionMode;
				callerCmp["fisa-bt-id"] =this.btId;
			}
			
		
			var controller=ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
			//Valida si la información de la BT personalizada es correcta antes de proceder a grabar.
			var outcome = controller.validateBtInfo(callerCmp);
			if (outcome != null) {
				
				if(outcome.wAxn=="cnfrm"){			
					
					this.verifyAfterSecurity(outcome);
				 } else if(outcome.wAxn=="error"){
					 	this.clearPanelMessage();
						this.updateMsgsPanel(outcome.aMsgs);
				}
			} else {
				//TODO DEFINIR MENSAJE DE ERROR
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
		_setVisible: function(component){
			 domStyle.set(component.domNode, 'display', 'inline-block');
		},
		_setVisiblePanel: function(component){
			//component.set("display","block");
			component.style.display = 'block';
			//component.resize();
			domStyle.set(component,"display","block");
		},
		_setNotVisible: function(component){
			domStyle.set(component.domNode, 'display', 'none');
		},

		/****/
		loadNotificationAdditionalsWdgId:function(notificationAdditionalsWdgId,currentBtId){
			this.notificationAdditionalsWdgId.push({'btId':currentBtId,'notifWdgId':notificationAdditionalsWdgId});
		},
		updateNotificationData:function(notificationVal, btIdParam){/*Actualiza la data de notificacion*/
			if(this.notificationAdditionalsWdgId!= null && this.notificationAdditionalsWdgId!= undefined){
				dojo.forEach(this.notificationAdditionalsWdgId, dojo.hitch(this,function(val){
					var btId = val.btId;
					if(btId == btIdParam){
						var notiValWdgId = val.notifWdgId;
						var wdgNotif = dijit.byId(notiValWdgId);
						wdgNotif.set("value", notificationVal);
					}
				}));
			}
		},
		/**Adds notification data*/
		_addNotificationValData:function(){
			var notificationVal = {};
			if(this.notificationAdditionalsWdgId!= null && this.notificationAdditionalsWdgId!= undefined){
				dojo.forEach(this.notificationAdditionalsWdgId,dojo.hitch(this,function(val){
					var btId = val.btId;
					var notiValWdgId = val.notifWdgId;
					var wdgNotif = dijit.byId(notiValWdgId);
					var notiVal = wdgNotif.get("value");
					if(notificationVal[btId] == null && notificationVal[btId] == undefined){
						notificationVal[btId]= {};
					}
					notificationVal[btId]=notiVal;
				}));
				}
			return notificationVal;
			
		}
});
	return CustomBtController;
});

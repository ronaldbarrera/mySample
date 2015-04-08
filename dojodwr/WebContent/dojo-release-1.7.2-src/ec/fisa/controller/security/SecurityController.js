define([
        "dojo/_base/kernel",
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/_base/array",
		"dojo/_base/connect",
		"./_base",
		"dojo/dom-geometry",
		"dojo/dom-style",
		"ec/fisa/controller/Utils",
		"ec/fisa/print/Utils",
		"dojo/topic",
		"ec/fisa/controller/BaseController",
		"ec/fisa/navigation/Utils",
		"ec/fisa/validation/Utils"
        ],function(dojo,declare,lang,array,connect,fisaBaseController,domGeom,domStyle,fisaControllerUtils,fisaPrint,topic,BaseController){

	var SecurityController = declare("ec.fisa.controller.security.SecurityController", [BaseController], {
		tabId:null,
		pageScopeId:null,
		model:null,
		data:null,
		/* grid data */
		documentData:null,
		/* combo options status */
		comboStatusOptions:null,
		initMsgs:null,
		breadcrumbId:null,
		btnsContainer:null,
		selectDataMap:null,
		lovData:null,
		labels:null,
		contextPath:dojo.config.fisaContextPath,
		btActionMode:null, 
		tableRegistry:null,
		/*TEMPLATE*/
		/*notification widget*/
		notificationAdditionalsWdgId:null,
		//labels for initializacion of the bt.
		initLabels:null,
		// Indicates the content pane in which the bt is loaded.
		btContentPaneId:null,
		//this is for security it has the factors applied to the bt.
		secBeforeListFactor:null,
		secAfterListFactor:null,
		subscriptions:null,
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
			
			this.skinParameters = initData.skinParameters;
			
			if (initData.aMsgs != undefined) {
			
				this.initMsgs = initData.aMsgs;
			}	
			
			this.data = {};
			
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
		setLabels:function(/* objeto con los labels */labels){
			this.labels = labels;
		},
		
		setBreadcrumb:function(breadcrumb){
			this.breadcrumbId = breadcrumb.id;
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
		cancelAuthenticationFactorDialog:function(){
			  //if bt is not null or undefined means that a bt is open, so It should be unlock in DDBB.
			var controller=ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
			controller.cancel();
		}
			
});
	return SecurityController;
});

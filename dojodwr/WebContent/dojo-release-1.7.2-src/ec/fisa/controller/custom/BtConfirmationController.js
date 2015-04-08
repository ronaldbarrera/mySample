define([
        "dojo/_base/kernel","dojo/_base/declare","dojo/_base/lang","./_base",
        "ec/fisa/controller/BaseController","ec/fisa/navigation/Utils",
        "dojo/dom-construct","dojo/dom-geometry",
        "dojox/mvc","dojo/on","ec/fisa/message/ConfirmationPanel","ec/fisa/dwr/proxy/EventReportActionDWR"
        
        ],function(dojo,declare,lang, fisaBaseController,BaseController,navigationUtils,
        		domConstruct,domGeometry,mvc,on, MessagePanel){

	var BtConfirmationController = declare("ec.fisa.controller.custom.BtConfirmationController", [BaseController], {
		tabId:null,
		pageScopeId:null,
		btId:null,
		breadCrumbId: null,
		msg:null,
		currentBreadCrumbId:null,
		btContentPaneId:null,
		parentPageScopeId:null,
		
		constructor: function (tabId,pageScopeId,btId,parentPageScopeId) {
			this.tabId=tabId;
			this.pageScopeId=pageScopeId;
			this.btId= btId;
			this.parentPageScopeId=parentPageScopeId;
			
		},
		initArgs:function(passArgs,component){
			this.breadCrumbId= passArgs[0];
			this.msg= passArgs[1];
			this.currentBreadCrumbId = component.getParent().getParent().id;
			this.btContentPaneId = component.getParent().id;
		},
		/**load the text of the confirmation panel.*/
		loadOutputText:function(/*dojo widget*/ contentPane) {
			/** Creates a div inside an dom node component. */
			var creationDiv = domConstruct.create("div", null,
					contentPane.domNode);
			var messageDiv = domConstruct.create("div", {'class':'fisaConfirmation'},
					creationDiv);
			var output = new MessagePanel({
			},messageDiv);
			output.startup();
			output.update(this.msg);
		},
		/**close this confirmation breadcrumb with the opened bt.-
		 * if it came from a qt it goes to the qt.*/
		closeConfirmation:function(isSequence){
			var breadCrumb=dijit.byId(this.breadCrumbId);
			var selectedPane = breadCrumb.selectedChildWidget;
			if(selectedPane.postClose){
				var scp=dijit.byId(selectedPane.postCloseScope);
				selectedPane.postClose.apply(scp,selectedPane.postCloseArgs);
			}
			//close confirmation breadcrumb
			ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.currentBreadCrumbId);
			
			if(isSequence != null && isSequence == 'true'){
				ec.fisa.navigation.utils.closeSequenceBreadCrumb(this.breadCrumbId);
			}else{
			    //close previous bt.
				ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadCrumbId);
			}
			ec.fisa.menu.utils.addEmptyTabAllClosed(dojo.config.fisaNewTabLabel);
		},
		
		/**Opens a new bt in insert mode.*/
		openNewBt:function(){
			this.closeConfirmation();
			var url = "";
			url = dojo.config.fisaContextPath;
			url += "/";
			url += "BUSINESS_TEMPLATE";
			url += "/";
			url += this.btId;
			url += "/FISATabId/";
			url += this.tabId;
			url += "/actionMode/IN";
			
				var newSubTabPaneArg = {};
				//newSubTabPaneArg.title=title;
				//newSubTabPaneArg.iconClass="breadcrumbIcon";
				newSubTabPaneArg.href=url;
			//	newSubTabPaneArg.postClose = this.cargarTareas2;
			//	newSubTabPaneArg.postCloseScope = this.id;
			//	newSubTabPaneArg.postCloseArgs = [this.tabId];
				ec.fisa.navigation.utils.openNewBreadCrumb(newSubTabPaneArg, this.breadCrumbId);
			
			
		},
		
		launchReportAuto:function(){
			this.clearPanelMessage();
			var callObj={callbackScope:this};
			callObj.errorHandler=dojo.hitch(this,this.errorHandler);
			callObj.callback=this._launchReportAutoCallBack;
			EventReportActionDWR.openReportAuto(this.tabId,this.parentPageScopeId,callObj);	
			
		},
		
		launchReportModule:function(){
			this.clearPanelMessage();
			var callObj={callbackScope:this};
			callObj.errorHandler=dojo.hitch(this,this.errorHandler);
			callObj.callback=this._launchReportModuleCallBack;
			EventReportActionDWR.openReportModule(this.tabId,this.parentPageScopeId,callObj);	
			
		},
		
		_launchReportAutoCallBack:function(outcome){
			if(outcome.wAxn=="error"){
				this.updateMsgsPanel(outcome.aMsgs);
			}
			else{
				ec.fisa.navigation.utils.showNewReportBreadCrumb(outcome.responseReportLabels.title,
						this.currentBreadCrumbId,this.tabId,this.parentPageScopeId,outcome.responseReportUrl,
						outcome.responseShowNextReportButton ,outcome.responseShowEndReportButton);
			}
		},
		
		_launchReportModuleCallBack:function(outcome){
			if(outcome.wAxn=="error"){
				this.updateMsgsPanel(outcome.aMsgs);
			}
			else{
				ec.fisa.navigation.utils.showNewReportBreadCrumb(outcome.responseReportLabels.title,
						this.currentBreadCrumbId,this.tabId,this.parentPageScopeId,outcome.responseReportUrl,
						null,null);
			}
		}
		
		
		
	});
	return BtConfirmationController;
});

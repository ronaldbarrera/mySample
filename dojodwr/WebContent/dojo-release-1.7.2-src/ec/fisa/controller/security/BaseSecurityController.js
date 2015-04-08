define([
        "dojo/_base/kernel","dojo/_base/declare","./_base","ec/fisa/controller/security/SecurityController"
        ],function(dojo,declare,base,SecurityController){

	var BtController = declare("ec.fisa.controller.security.BaseSecurityController", [SecurityController], {
		"-chains-": {
		      constructor: "manual"
		},
		tabId:null,
		pageScopeId:null,
		serviceId:null,
		calledByDlg:null,
		//variable used at util.js to avoid mix the controllers aht the initpageController.
		//yes if it is shown as a popup
		isLovModal:null,
		
		constructor: function (tabId,pageScopeId,initData,serviceId,calledByDlg) {
			this.tabId=tabId;
			this.pageScopeId=pageScopeId;
			this.serviceId= serviceId;
			if(calledByDlg == null || calledByDlg == undefined){
				calledByDlg = false;
			}
			this.calledByDlg = calledByDlg;
			if(calledByDlg == "true"){
				this.isLovModal = true;
			}
			this.inherited(arguments);
		},

		//this method is called after validation.
		handleWindowAction : function(outcome) {
			var messagesPanel = dijit.byId(this.messagesPanelId);
			messagesPanel.clearAllMessages();
			this.updateMsgsPanel(outcome.aMsgs);
			
			if(outcome.securityValid == true){
				this.onSucessEvent();
			}
		},
		
		destroy:function(){
		
		},
		
		//called when sucess. 
		onSucessEvent:function(argument){
			
		},
		//called when cancelled.-> method to be connected usig dojo .connect
		onCancelEvent:function(argument){
			
		},
		
		beforeBlockScreen : function() {
			//se hace esto para bloquear la interaccion con los botones
			dwr.engine._batchesLength++;
			ec.fisa.dwr.proxy.standby.show();
		}
	});
	return BtController;
});

define([
	"dojo/_base/kernel","dojo/_base/declare","dojo/_base/lang","./_base","ec/fisa/controller/BaseController","dojox/mvc","dojox/mvc/StatefulModel","dojo/store/DataStore","dojo/data/ObjectStore","dojo/store/Memory"
],function(dojo,declare,lang, fisaBaseController,BaseController,mvc,StatefulModel,DataStore,ObjectStore,MemoryStore){
	
	var PasswordExpirationController = declare("ec.fisa.controller.custom.PasswordExpirationController", [BaseController], {
		tabId:null,
		pageScopeId:null,
		constructor: function (tabId,pageScopeId) {
			this.tabId=tabId;
			this.pageScopeId=pageScopeId;
		},
		doMethod:function(data){
			var callbackObj = {callbackScope:this,
					callback:this.submitAction,
					errorHandler:dojo.hitch(this,this.errorHandler)};
			PasswordExpirationControllerDWR.doAction(this.o.value,this.n.value,this.c.value,callbackObj);
		},
		submitAction:function(outcome){
			var messagesPanel = dijit.byId(this.messagesPanelId);
			messagesPanel.clearAllMessages();
			this.updateMsgsPanel(outcome.aMsgs);
			if(outcome.dst){
				document.location.reload(true);
			}
		}
    });
	return PasswordExpirationController;
});
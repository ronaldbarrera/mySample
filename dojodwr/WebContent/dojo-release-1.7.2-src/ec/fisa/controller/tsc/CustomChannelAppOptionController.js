define([ "dojo/_base/kernel", 
        "dojo/_base/declare", 
        "dojo/_base/lang", 
        "ec/fisa/controller/tsc/ChannelAppOptionController",
        "ec/fisa/mvc/StatefulModel"
        ], function(dojo, declare, lang, ChannelAppOptionController,StatefulModel) {

		var CustomChannelAppOptionController = declare("ec.fisa.controller.tsc.CustomChannelAppOptionController", [ChannelAppOptionController], {

		tabId : "",		
		pageScopeId : "",
		channelId:null,
		componentLov:null,
		
		constructor : function(tabId, pageScopeId) {
			this.tabId = tabId;
			this.pageScopeId = pageScopeId;
			
			this.model = new StatefulModel({});
			
			MenuEditionAdminControllerDWR.getRequiredFieldMessage({
				callbackScope : this,
				callback : function(data) {
					this.requiredFieldMessage = data;
				},
				errorHandler : dojo.hitch(this,this.errorHandler)
			});
		},
		

		
		setChannelId : function(newValue) {
			this.channelId = newValue;
//			this.clearPanelMessage();
		}
		
	});
	return CustomChannelAppOptionController;
});
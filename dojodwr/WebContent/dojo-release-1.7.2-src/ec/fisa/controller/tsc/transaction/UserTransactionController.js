define([ "dojo/_base/kernel", 
         "dojo/_base/declare", 
         "dojo/_base/lang", 
         "ec/fisa/controller/BaseController",
		"ec/fisa/format/Utils", 
		"ec/fisa/navigation/Utils", 
		"dojo/dom-construct", 
		"dojox/mvc",
		"dojox/mvc/StatefulModel", 		
		"ec/fisa/mvc/StatefulModel",
		"dojo/dom-style",
		"dijit/tree/ForestStoreModel", 
		"dojox/grid/TreeGrid",
		"dojo/data/ItemFileWriteStore", 
		"dijit/form/CheckBox", 
		"ec/fisa/widget/tsc/MixedCheckBox",
		"ec/fisa/dwr/Store"], function(dojo,
		declare, lang, BaseController, formatUtils, navigationUtils, domConstruct, mvc, StatefulModel, StatefulModelParam, domStyle) {

	var UserTransactionController = declare("ec.fisa.controller.tsc.transaction.UserTransactionController", BaseController, {

		tabId : null,

		pageScopeId : null,

		model : null,
		
		modelDestinatario : null,

		data : {},

		initData : null,
		
		breadcrumbId : null,
		
		channelList : null,
		
		channelValid : null,
		
		appStore : null,
		
		listAppDataGrid : null,
	
		constructor : function(tabId, pageScopeId, initData) {

			this.initData = initData;
			this.tabId = tabId;
			this.pageScopeId = pageScopeId;
			this.model = {};
			
			this.init(initData);
		},
		init : function(data) {		

			this.channelList = data.channelList;
			this.channelValid = data.channelValid;
			this.appStore =  new ec.fisa.dwr.Store(
					'UserTransactionControllerDWR',
					'viewApplications', this.tabId,
					this.pageScopeId, [], null);
			
			delete data.channelList;
			delete data.channelValid;
			
			this.model = dojox.mvc.newStatefulModel({
				data : {}
			});
		},
		
		handleWindowAction : function(outcome) {
			var messagesPanel = dijit.byId(this.messagesPanelId);
			messagesPanel.clearAllMessages();
				
			ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
			
		
		},
		
		cancelUserRoleImpl:function(){		
			
			var callObj = {
					callbackScope : this
				};
			callObj.callback = this.handleWindowAction;
			callObj.errorHandler = this.errorHandler;
			
			UserTransactionControllerDWR.cancelUserRoleImpl(this.tabId, this.pageScopeId, callObj);		
			
		},
		
		setMessagesPanel:function(messagesPanel){
			this.inherited(arguments);
			if(typeof this.breadcrumbId === 'undefined' || this.breadcrumbId == null){
			this.breadcrumbId=messagesPanel.getParent().getParent().getParent().id;
			}
			this.updateMsgsPanel(this.initMsgs);
			this.btContentPaneId = messagesPanel.getParent().getParent().id;
			delete this.initMsgs;
		}
		
	});
	return UserTransactionController;
});
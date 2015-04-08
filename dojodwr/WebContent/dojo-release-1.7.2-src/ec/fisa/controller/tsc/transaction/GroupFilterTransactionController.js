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

	var GroupFilterTransactionController = declare("ec.fisa.controller.tsc.transaction.GroupFilterTransactionController", BaseController, {

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
		
		priorityId : null,
		
		userTransactionList : null,
		
		userTransactionId : null,
	
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
			this.priorityId = data.priorityId;
			this.userTransactionList = data.userTransactionList;
			this.appStore =  new ec.fisa.dwr.Store(
					'GroupFilterTransactionControllerDWR',
					'viewApplications', this.tabId,
					this.pageScopeId, [], null);
			
			delete data.channelList;
			delete data.channelValid;
			
			delete data.priorityId;
			delete data.userTransactionList;
			
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
			
			GroupFilterTransactionControllerDWR.cancelUserRoleImpl(this.tabId, this.pageScopeId, callObj);		
			
		},
		
		setMessagesPanel:function(messagesPanel){
			this.inherited(arguments);
			if(typeof this.breadcrumbId === 'undefined' || this.breadcrumbId == null){
			this.breadcrumbId=messagesPanel.getParent().getParent().getParent().id;
			}
			this.updateMsgsPanel(this.initMsgs);
			this.btContentPaneId = messagesPanel.getParent().getParent().id;
			delete this.initMsgs;
		},
		
		updateGrid : function() {
			this.clearPanelMessage();
			
			var userTransaction = dijit.byId(this.userTransactionId);
			var parametro = userTransaction.get("value");

			var callObj = {
					callbackScope : this
				};
			
			callObj.callback = function(outcome) {
				
				this.channelValid = outcome;			
				
				this.listAppDataGrid.updateData();
			};
			
			callObj.errorHandler = this.errorHandler;
			
			GroupFilterTransactionControllerDWR.getVisibleChannel(this.tabId, this.pageScopeId, [parametro], callObj);	
		}
		
	});
	return GroupFilterTransactionController;
});
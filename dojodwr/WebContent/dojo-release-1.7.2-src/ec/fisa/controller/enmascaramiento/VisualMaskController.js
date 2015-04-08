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

	var UserTransactionController = declare("ec.fisa.controller.enmascaramiento.VisualMaskController", BaseController, {

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
		
		realValue : null,
		
		realValueId : null,
		
		aliasValue : null,
		
		aliasValueId : null,
		
		aliasGridId:null,
		
		fieldIndex:null,
		
		rowIndex:null,
	
		constructor : function(tabId, pageScopeId, initData) {

			this.initData = initData;
			this.tabId = tabId;
			this.pageScopeId = pageScopeId;
			this.model = {};
			
			this.init(initData);
		},
		init : function(data) {		

			this.realValue = data.realValue;
			this.aliasValue = data.aliasValue;
			this.aliasGridId = data.aliasGridId;
			this.fieldIndex = data.fieldIndex;
			this.rowIndex = data.rowIndex;
						
			delete data.realValue;
			delete data.aliasValue;
			
			this.model = dojox.mvc.newStatefulModel({
				data : {}
			});
		},
		
		handleWindowAction : function(outcome) {
			var grid = dijit.byId(this.aliasGridId);
			var controller = ec.fisa.controller.utils.getPageController(grid.tabId,grid.pageScopeId);
			controller.hasToClearMsgs=false;
			if(outcome.wAxn == "refresh"){
				controller.search(false);
			}
			controller.hasToClearMsgs=true;
			grid = null;
		},
		
		cancel:function(){		
			
			var callObj = {
					callbackScope : this
				};
			callObj.callback = this.handleWindowAction;
			callObj.errorHandler = this.errorHandler;
			
			VisualMaskControllerDWR.cancel(this.tabId, this.pageScopeId, callObj);		
			
		},
		
		save:function(){		
			
			var callObj = {
					callbackScope : this
				};
			callObj.callback = this.handleWindowAction;
			callObj.errorHandler = this.errorHandler;
			
			var aliasTxt = dijit.byId(this.aliasValueId);
			
			VisualMaskControllerDWR.save(this.tabId, this.pageScopeId, aliasTxt.get("value"), callObj);		
			
		},
		
		setMessagesPanel:function(messagesPanel){
//			this.inherited(arguments);
//			if(typeof this.breadcrumbId === 'undefined' || this.breadcrumbId == null){
//			this.breadcrumbId=messagesPanel.getParent().getParent().getParent().id;
//			}
//			this.updateMsgsPanel(this.initMsgs);
//			this.btContentPaneId = messagesPanel.getParent().getParent().id;
//			delete this.initMsgs;
		}
		
	});
	return UserTransactionController;
});
define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"ec/fisa/grid/EnhancedGrid",
	"dijit/form/Button",
	"ec/fisa/dwr/Store",
	"ec/fisa/grid/enhanced/plugins/NePagination",
	"dojox/grid/enhanced/plugins/IndirectSelection",
	"ec/fisa/controller/Utils",
	"ec/fisa/grid/Utils","./_base"
], function(dojo, declare, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, FisaEnhancedGrid, Button, FisaDwrStore, FisaNePagination){

var FisaNonEditableGrid = declare("ec.fisa.grid.FisaNonEditableGrid", [FisaEnhancedGrid], {
	newButtonLabel:"",
	editButtonLabel:"",
	deleteButtonLabel:"",
	queryButtonLabel:"",
	selectButtonLabel:"Seleccionar",
	block:null,
	entId:"",
	btId:"",
	openBtId:"",
	tabId:"",
	pageScopeId:"",
	keys:{},
	pKeyStr:"",
	fKeyStr:"",
	btPos:-1,
	pageLength:null,
	postMixInProperties:function(){
		this.inherited(arguments);
		this.pKeyStr = dojo.toJson(this.keys.PK);
		this.fKeyStr = dojo.toJson(this.keys.FK);
		this.store=new ec.fisa.dwr.Store("BtControllerDWR","viewMultivalueData",this.tabId, this.pageScopeId,[this["fisa-bt-id"],this.btId,this.entId,this.pKeyStr]);
		this.store.callbackScope = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
		var pagination={newBlocked:this.block.n, editBlocked:this.block.e,deleteBlocked:this.block.d,queryBlocked:this.block.q, onNewExecute:this.execNew, onEditExecute:this.execEdit, onDeleteExecute:this.execDelete, onQueryExecute:this.execQuery};
		var indirectSelection = {headerSelector:false, width:"64px", name: this.selectButtonLabel, styles:"text-align: center;"};
		if(this.plugins){
			this.plugins.fisaNePagination=pagination;
			this.plugins.indirectSelection=indirectSelection;
		} else {
			this.plugins={fisaNePagination:pagination,indirectSelection:indirectSelection};
		}
	},
	buildRendering:function(){
		this.inherited(arguments);
		var ctrler=ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
		ctrler.registerTable(this);
	},
	getPostFTM:function(){
		var ctrler=ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
		return ctrler.model.toPlainObject();
	},
	getSelectedIndex:function(){
		var _pag=this.fisaNePagination.plugin;
		var cp=_pag.currentPage();
		if(cp==null){
			cp=0;
		}else{
			cp--;
		}
		return (cp*_pag.currentPageSize())+this.selection.selectedIndex;
	},
	execNew:function(){
		var callObj={callbackScope:this.grid,callback:this.grid.handleCB};
		var ctrler=ec.fisa.controller.utils.getPageController(this.grid.tabId,this.grid.pageScopeId);
		var messagesPanel = dijit.byId(ctrler.messagesPanelId);
		messagesPanel.clearAllMessages();
		ctrler.model.clearAllMessages();
		ec.fisa.widget.utils.resetFocusManager();
		BtControllerDWR.execNEGridNew(this.grid.openBtId,this.grid.entId,null,this.grid.btId,this.grid.pKeyStr,this.grid.fKeyStr,this.grid.btPos,this.grid.tabId,this.grid.pageScopeId,this.grid.getPostFTM(),callObj);
	},
	execEdit:function(){
		var callObj={callbackScope:this.grid,callback:this.grid.handleCB};
		var selectedItem = this.grid.selection.getFirstSelected();
		var selectedIndex = this.grid.getSelectedIndex();
		var ctrler=ec.fisa.controller.utils.getPageController(this.grid.tabId,this.grid.pageScopeId);
		var messagesPanel = dijit.byId(ctrler.messagesPanelId);
		messagesPanel.clearAllMessages();
		ctrler.model.clearAllMessages();
		ec.fisa.widget.utils.resetFocusManager();
		BtControllerDWR.execNEGridEdit(this.grid.openBtId,this.grid.entId,selectedItem,selectedIndex,this.grid.btId,this.grid.pKeyStr,this.grid.fKeyStr,this.grid.btPos,this.grid.tabId,this.grid.pageScopeId,this.grid.getPostFTM(),callObj);
	},
	execDelete:function(){
		var callObj={callbackScope:this.grid,callback:this.grid.handleCB};
		var selectedItem = this.grid.selection.getFirstSelected();
		var selectedIndex = this.grid.getSelectedIndex();
		var ctrler=ec.fisa.controller.utils.getPageController(this.grid.tabId,this.grid.pageScopeId);
		var messagesPanel = dijit.byId(ctrler.messagesPanelId);
		messagesPanel.clearAllMessages();
		ctrler.model.clearAllMessages();
		ec.fisa.widget.utils.resetFocusManager();
		BtControllerDWR.execNEGridDelete(this.grid.openBtId,this.grid.entId,selectedItem,selectedIndex,this.grid.btId,this.grid.pKeyStr,this.grid.fKeyStr,this.grid.btPos,this.grid.tabId,this.grid.pageScopeId,this.grid.getPostFTM(),callObj);
	},
	execQuery:function(){
		var callObj={callbackScope:this.grid,callback:this.grid.handleCB};
		var selectedItem = this.grid.selection.getFirstSelected();
		var selectedIndex = this.grid.getSelectedIndex();
		var ctrler=ec.fisa.controller.utils.getPageController(this.grid.tabId,this.grid.pageScopeId);
		var messagesPanel = dijit.byId(ctrler.messagesPanelId);
		messagesPanel.clearAllMessages();
		ctrler.model.clearAllMessages();
		ec.fisa.widget.utils.resetFocusManager();
		BtControllerDWR.execNEGridQuery(this.grid.openBtId,this.grid.entId,selectedItem,selectedIndex,this.grid.btId,this.grid.pKeyStr,this.grid.fKeyStr,this.grid.btPos,this.grid.tabId,this.grid.pageScopeId,this.grid.getPostFTM(),callObj);
	},
	handleCB:function(outcome){
		if(outcome.wAxn=="open") {
			var newSubTabPaneArg = {};
			newSubTabPaneArg.title=outcome.dialogName;
			newSubTabPaneArg.iconClass="breadcrumbIcon";
			newSubTabPaneArg.href=outcome.dialog;
			newSubTabPaneArg.postClose = this.refresh;
			newSubTabPaneArg.postCloseScope = this.id;
			newSubTabPaneArg.postCloseArgs = [this.tabId];
			var ctrler=ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
			ec.fisa.navigation.utils.openNewBreadCrumb(newSubTabPaneArg,ctrler.breadcrumbId);
		} else if(outcome.wAxn=="refresh"){
			this.refresh();
		} else if(outcome.wAxn=="error"){
			var ctrler=ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
			ctrler.updateMsgsPanel(outcome.aMsgs);
		}
		
		//<<HD19508 JCVQ
		if(outcome.wAxn != "error" && outcome.msg){
			outcome.wAxn = "refresh"//Se forza la actualizacion
			var ctrler=ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
			ctrler.handleCallBackBackFieldRoutine(ctrler.removeCurrentMRFromOutcome(outcome,this));
		}//HD19508 JCVQ>>
	},
	refresh:function(){
		this.setQuery(this.query,this.queryOptions);
	},
	canSort:function(col){
		return false;
	}
});

return FisaNonEditableGrid;

});
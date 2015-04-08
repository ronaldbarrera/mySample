define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"ec/fisa/grid/EnhancedGrid",
	"dijit/form/Button",
	"ec/fisa/dwr/Store",
	"ec/fisa/grid/enhanced/plugins/Pagination",
	"ec/fisa/grid/Utils",
	"ec/fisa/grid/RowActions",
	"ec/fisa/controller/Utils","./_base"
], function(dojo, declare, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, FisaEnhancedGrid, Button, FisaDwrStore, FisaPagination,FisaGridUtils){

var FisaEditableGrid = declare("ec.fisa.grid.FisaEditableGrid", [FisaEnhancedGrid], {
	_dataGridStore:null,
	newButtonLabel:"",
	editButtonLabel:"",
	deleteButtonLabel:"",
	selectButtonLabel:"Seleccionar",
	// se cambia de true a null para solucionar mantis 0014486
	block:null,
	tabId:"",
	pageScopeId:"",
	entId:"",
	btId:"",
	btPos:-1,
	keys:{},
	pKeyStr:"",
	fKeyStr:"",
	model:null,
	tabIndexField:null,
	complementModel:null,
	fisaEditableGrid:true,
	hasComboInside:false,
	pageLength: null,
	postMixInProperties:function(){
		this.inherited(arguments);
		this.pKeyStr = dojo.toJson(this.keys.PK);
		this.fKeyStr = dojo.toJson(this.keys.FK);
		this.store=new ec.fisa.dwr.Store("BtControllerDWR","viewEditableMultivalueData",this.tabId, this.pageScopeId,[this["fisa-bt-id"],this.btId,this.entId,this.pKeyStr]);
		this.store.onNew=this.handleNew;
		this.store.onSet=this.handleSet;
	
		var pagination={newBlocked:this.block.n, onNewExecute:this.execNew,tabIndexField:this.tabIndexField};
		if(this.plugins){
			this.plugins.fisaPagination=pagination;
		} else {
			this.plugins={fisaPagination:pagination};
		}
	},
	postCreate: function(){
		this.inherited(arguments);
		//Se setea la referencia a este fisaGrid, en postCreate ya que en el metodo poxMixInProperties el id no esta autogenerado aun.
		this.store.fisaEditableGridId= this.id;
	},
	handleSet:function(){
	},
	handleNew:function(/*item*/ newItem, /*object?*/ parentInfo){
	},
	
	//overrided :: see EnhancedGrid.js
	//
	doKeyEvent: function(e){
	//do nothing cause it makes to lose focus or getout of the multiregister	
	},
	execNew:function() {
		var scope = dijit.byId(this.fisaEditableGridId);
		//con el atributo model se identifica que existe algun elemento en edicion o creacion
		if(!scope.model){
			var callObj={callbackScope:scope,callback:scope.handleNewCB};
			var ctrler=ec.fisa.controller.utils.getPageController(scope.tabId,scope.pageScopeId);
			var messagesPanel = dijit.byId(ctrler.messagesPanelId);
			messagesPanel.clearAllMessages();
			ctrler.model.clearAllMessages();
			BtControllerDWR.execEGridNew(scope.entId,null,scope.btId,scope.pKeyStr,scope.fKeyStr,scope.btPos,scope.tabId,scope.pageScopeId,scope.getPostFTM(),callObj);
		}
	},
	handleNewCB:function(outcome) {
		if(outcome.wAxn=="refresh"){
			if(!this.model){
				FisaGridUtils.updateRowData(outcome,this,false);
				if(outcome.record){
					this.store.newItem(outcome.record);
					this.lastPage();
				}
			}
		} else if(outcome.wAxn=="error"){
			var ctrler=ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
			ctrler.updateMsgsPanel(outcome.aMsgs);
		}
	},
	handleDeleteCB:function(outcome){
		//implement callback delete post actions
	},
	getPostFTM:function(){
		var ctrler=ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
		return ctrler.model.toPlainObject();
	},
	refresh:function(){
		//this.model=null;//Mantis 18342 JCVQ
		this.setQuery(this.query,this.queryOptions);
	},
	canSort:function(col){
		return false;
	}
});

return FisaEditableGrid;

});

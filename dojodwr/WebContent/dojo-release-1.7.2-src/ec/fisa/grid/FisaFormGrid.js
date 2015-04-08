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
	"dojox/lang/functional",
	"ec/fisa/grid/Utils",
	"dojo/dom-style",
	"dojo/on",
	"dojo/dom",
	"ec/fisa/grid/RowActions",
	"ec/fisa/controller/Utils","./_base"
], function(dojo, declare, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, FisaEnhancedGrid, Button, FisaDwrStore, FisaPagination,functional,FisaGridUtils,DomStyle, On, Dom){

var FisaFormGrid = declare("ec.fisa.grid.FisaFormGrid", [FisaEnhancedGrid], {
	_dataGridStore:null,
	newButtonLabel:"",
	editButtonLabel:"",
	deleteButtonLabel:"",
	selectButtonLabel:"Seleccionar",
	// se cambia de true a null para solucionar mantis 0014486
	block:null,
	tabId:"",
	pageScopeId:"",
	tabIndexField:null,
	entId:"",
	btId:"",
	addNewButton:null,
	btPos:-1,
	keys:{},
	pKeyStr:"",
	fKeyStr:"",
	model:null,//array of models
	complementModel:null,
	fisaEditableGrid:true,
	fisaEditableDirectGrid:true,
	hasComboInside:false,
	pageLength: null,
	handle: null,
	constructor:function(){
		this.addNewButton = false;
	},
	postMixInProperties:function(){
		this.inherited(arguments);
		this.pKeyStr = dojo.toJson(this.keys.PK);
		this.fKeyStr = dojo.toJson(this.keys.FK);
		this.store=new ec.fisa.dwr.Store("BtControllerDWR","viewEditableMultivalueDataDirect",this.tabId, this.pageScopeId,[this["fisa-bt-id"],this.btId,this.entId,this.pKeyStr]);
		this.store.onNew=this.handleNew;
		this.store.onSet=this.handleSet;
	
		if(this.addNewButton === false){
			//dont show new button.
			this.block.n = true;
		}
		
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
		
		this.hadle = On(this, 'stylerow',function(row){
			var nd = dojo.query('tr', row.node);
			this.defineTrClass(nd[0], row);
			this.defineTrClass(nd[1], row);
			
			var dojoxGridRowTables = dojo.query('.dojoxGridRowTable', row.node);
			dojoxGridRowTables.forEach(function(tableNode){
				DomStyle.set(tableNode, "width", "100%");
			});
			
			var dojoxGridCells = dojo.query('.fisaComponentGridLeftCell', row.node);
			dojoxGridCells.forEach(function(cellNode){
				DomStyle.set(cellNode, "width", "40%");
			});
			
			dojoxGridCells = dojo.query('.fisaComponentGridRightCell', row.node);
			dojoxGridCells.forEach(function(cellNode){
				DomStyle.set(cellNode, "width", "60%");
			});
			
			
			row.customStyles = "width:100%;border:none;"
		});
	},
	defineTrClass:function(trNode, row){
		if(trNode){
			if(row.odd == true){
				trNode.className = "oddFieldBt";
			}else{
				trNode.className = "evenFieldBt";
			}
		}		
	},
	//overrided :: see EnhancedGrid.js
	//
	doKeyEvent: function(e){
	//do nothing cause it makes to lose focus or getout of the multiregister	
	},
	handleSet:function(){
	},
	handleNew:function(/*item*/ newItem, /*object?*/ parentInfo){
	},
	execNew:function() {
		var scope = dijit.byId(this.fisaEditableGridId);
		//if(scope.model != null){
			var callObj={callbackScope:scope,callback:scope.handleNewCB};
			var ctrler=ec.fisa.controller.utils.getPageController(scope.tabId,scope.pageScopeId);
			var messagesPanel = dijit.byId(ctrler.messagesPanelId);
			messagesPanel.clearAllMessages();
			ctrler.model.clearAllMessages();
			BtControllerDWR.execEDirectGridNew(scope.entId,null,scope.btId,scope.pKeyStr,scope.fKeyStr,scope.btPos,scope.tabId,scope.pageScopeId,scope.getPostFTM(),callObj);
		//}
	},
	handleNewCB:function(outcome) {
		if(outcome.wAxn=="refresh"){
			if(this.model== null){
				this.model =[];
			}
			if(this.complementModel == null){
				this.complementModel = [];
			}
			
				FisaGridUtils.newRowDataDirect(outcome,this,false);
				this.refresh();
				if(outcome.record){
					this.store.newItem(outcome.record);
					this.lastPage();
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
		this.setQuery(this.query,this.queryOptions);
	},
	canSort:function(col){
		return false;
	},
	//obtengo del multiregistro cada fila, el model de la misma y la pongo
	// dentro del array que va a ir al ftm
	_getValueAttr : function() {
		var value =  [];
		if(this.model!=null){
			dojo.forEach(this.model,function(val){
				var rowMr = val.toPlainObject();
				var ftmMr = {};
				dojox.lang.functional.forIn(rowMr,function(value,fieldId){
					var field = {value:value};
					ftmMr[fieldId] = field;
				});
				value.push(ftmMr);
			});
		}
		return value;
	},
	_setValueAttr : function(value, /* Boolean? */priorityChange, /* String? */
			formattedValue) {
		//do nothing.
	},
	startup:function(){
		this.inherited(arguments);
		this.correctWidth();
	},
	_resize:function(){
		this.inherited(arguments);
		DomStyle.set(this.viewsHeaderNode, "display", "none");//Oculta la cabecera del grid.
	},
	destroy:function(){
		this.inherited(arguments);
		if(this.handle){
			this.handle.remove();
		}
	},
	correctWidth : function(){/*Se encarga de ajustar el ancho del grid al 100% de la pantalla*/
		var gridNode = Dom.byId(this.id);
		DomStyle.set(gridNode, "min-width", "100%");
		DomStyle.set(gridNode, "margin", "auto");
		DomStyle.set(gridNode, "width", "100%");
		
		this.hideMasterViewBorders();
	},
	hideMasterViewBorders:function(){
		//Quitando bordes del contenedor del grid
		var masterView = dojo.query('.dojoxGridMasterView', this.id);
		DomStyle.set(masterView[0], "border", "none");
		DomStyle.set(masterView[0], "border-bottom-left-radius", "");
		DomStyle.set(masterView[0], "border-bottom-right-radius", "");
	},
	_onFetchComplete:function(){
		this.inherited(arguments);
	}
	
});

return FisaFormGrid;

});
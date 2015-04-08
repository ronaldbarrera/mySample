define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/connect",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"ec/fisa/grid/EnhancedGrid",
	"dijit/form/Button",
	"ec/fisa/dwr/Store",
	"ec/fisa/grid/enhanced/plugins/QtPagination",
	"dojox/grid/enhanced/plugins/IndirectSelection",
	"ec/fisa/controller/custom/QtController",
	"ec/fisa/report/QtReport",
	"dojo/topic",
	"dojo/dom",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/dom-geometry","./_base"
], function(dojo, declare, lang, connect, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, FisaEnhancedGrid, Button, StoreDWR, FisaQtPagination, IndirectSelection,
		QtController,QtReport, topic, dom, domConstruct, style, domGeom){

var FisaQtGrid = declare("ec.fisa.grid.FisaQtGrid", [FisaEnhancedGrid], {
	_dataGridStore:null,
	execButtonLabel:"Ejecutar",
	selectButtonLabel:"Seleccionar",
	closeButtonLabel:"Cerrar",
	tabId:"",
	pageScopeId:"",
	qtId:"",
	actions:null,
	islov:false,
	parentFisaTabId:'',
	parentFisaPageScopeId:'',
	parentBtId:'',
	parentFieldId:'',
	pageLength:null,
	parentType:'',
	parentWidgetId:'',
	hasSelectionActions:false,
	hasSelection:false,
	hideQTGridIfNoResultsFound:false,
	hideQTPortletIfNoResultsFound:false,
	//indicates 1 if its a final user 0 if its not.
	isFinalUser:null,
	showPagination:true,
	realIndexSelectedArray:null,
	//came from lov
	lovInfoMode:false,
	showPaginationNumbers:true,
	reportPopup:false,
	buttonsOnFooter:false,
	showReportsButton:false,
	reportExportLabel:"",
	reportLanguageLabel:"",
	reportData:"",
	originalValueIndex:-1,//Usado en alias de cuentas, este valor se define en la tabla tapd_qt_property_value con QUERY_TEMPLATE_PROPERTY_ID = 'ORIGINAL_VALUE' para la qt asociada al grid, JCVQ
	substitutionFdk:"",//Usado en alias de cuentas, este valor se define en la tabla tapd_qt_property_value con QUERY_TEMPLATE_PROPERTY_ID = 'SUBSTIT_FDK' para la qt asociada al grid, JCVQ
	showQtButtonMail:false, //indica si muestra el boton de mail
	hideLanguageSlct:false,
	reportSendMailLabel:"", 
	requestFromPortlet:false,
	
	postCreate: function(){
		this._setActionsAttr(this.actions);
		
		//connect
		this.connect(this.selection,"addToSelection",this._addToSelection);
		this.connect(this.selection,"deselect",this._deselect);
		
		this.selection.getSelected=this._getSelected;
		this.realIndexSelectedArray=[];
		
		this.inherited(arguments);
	},
	
	
	//avoid some columns to be sortable.
	canSort:function(col){
		var result = false;	
		var structIn = this.structure[0];
		if(structIn!=null && structIn!=undefined)
		{
			var numCol =ec.fisa.format.utils.absNumber(col);
			//cause it starts with 0 and col with 1.
			numCol = numCol-1;
			if(this.hasSelection){
				//dont count the select column.
				numCol = numCol-1;
			} 
			var colStruct = structIn[numCol];
			if(colStruct != undefined  && colStruct.sortable){
				result =true;
			}
			
		}
		return result;
	},
	
	postMixInProperties:function(){
		this.inherited(arguments);
		if(this.showReportsButton){
			this.reportData=dojo.fromJson(this.reportData);
		}
		var pagination={showAddButton:false,options:this.actions, onExecute:this._execAction, islov:this.islov, onSelect:this._returnSelectedRow
				,isFinalUser:this.isFinalUser};
		var indirectSelection;
		if(this.hasSelectionActions === true || this.islov === true){
			indirectSelection = {headerSelector:false, width:"105px", name: this.selectButtonLabel, styles:"text-align: center;"};
		}else{
			indirectSelection = false;
		}
		//if final user dont add indirect selection and only if its single selection. // love must show indirect selection
		if(this.isFinalUser == "1" && this.selectionMode == "single" && this.islov != true){
			indirectSelection = false;
		}
		
		if(this.lovInfoMode == true){
			indirectSelection = false;
			pagination.lovInfoMode = true;
			pagination.onClose = this._onClose;
		}
		this.keepSelection = true;
		pagination.indirectSelectionVar = indirectSelection;
		this.hasSelection=indirectSelection!==false;
		if(this.plugins){
			if(this.showPagination){
				this.plugins.fisaQtPagination=pagination;
			}
			this.plugins.indirectSelection=indirectSelection;
		} else {
			if(this.showPagination){
				this.plugins={fisaQtPagination:pagination,indirectSelection:indirectSelection};
			}else{
				this.plugins={indirectSelection:indirectSelection};
			}
		}
		
		
		this.store=new ec.fisa.dwr.Store("QtControllerDWR","viewData",this.tabId,this.qtId,dojo.hitch(this, this._defineAditionalParameters),null);//Mantis 18517 JCVQ
		this.store.callbackScope = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
	},
	startup:function(){
		var header= null;
		if(!this.buttonsOnFooter){
			header=domConstruct.create("div",{'class':'qtGridHeader'},this.domNode.parentNode,0);
		}
		if(this.showReportsButton&&(!this.buttonsOnFooter)){
			var _attrs={reportData:this.reportData,async:false,exportLabel:this.reportExportLabel,
					languageLabel:this.reportLanguageLabel,'qt-id':this.qtId,
					'fisa-tab-id':this.tabId,
					'fisa-page-scope-id':this.pageScopeId,
					popup:this.reportPopup,
					showQtButtonMail:this.showQtButtonMail,
					reportSendMailLabel:this.reportSendMailLabel,
					hideLanguageSlct:this.hideLanguageSlct};
			var report=new QtReport(_attrs,domConstruct.create("div",{},header));
			report.startup();
			this.reportData=null;
		}
		var controller = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
		this.query=controller.model.toPlainObject();
		this.correctWidth();
	},
	
	
	//override getselected method to call our array in case of multiple
	_getSelected: function(){
		var result = [];
			for(var i=0, l=this.grid.realIndexSelectedArray.length; i<l; i++){
				if(this.grid.realIndexSelectedArray[i]){
					result.push(i);
				}
			}
		return result;
	},
	
	_deselect:function(inItemOrIndex){
		var realIndex=	ec.fisa.grid.utils.obtainInitialViewableMrIndex(this) + parseInt(inItemOrIndex, 10);
		this.realIndexSelectedArray[realIndex] = false;
	},
	
	/**Only called when multiple is selected and updates with the real row index array the items selected*/
	_addToSelection:function(inItemOrIndex){
		if(this.selectionMode == "single"){
			//reset the array cause must exist only one.
			this.realIndexSelectedArray = [];
		}
		var realIndex=	ec.fisa.grid.utils.obtainInitialViewableMrIndex(this)+ parseInt(inItemOrIndex);
		this.realIndexSelectedArray[realIndex] = true;
		//console.log(inItemOrIndex);
		
	},
	
	correctWidth : function(){/*Correccion TestOne 27 JCVQ 06/05/2013*/
		/**
		 * El método forza a establecer el valor de width del grid con el valor calculado desde el browser menos dos pixeles.
		 */
		var gridNode = dom.byId(this.id);
		var computedStyle = style.getComputedStyle(gridNode);
		var width = style.get(gridNode, "width");
		var height = style.get(gridNode, "height");
		var box = {w:parseInt(width,10) - 2, h:height};
		domGeom.setContentSize(gridNode, box, computedStyle);
		//console.log(box, box);		
	},
	_execAction:function(){
		this.grid.executeAction(this.grid.qtId,this.select.get("value"));
	},
	_returnSelectedRow:function() {
		var selected = this.grid.selection.getSelected();
		if (selected.length > 0) {
			var tabId = this.grid.parentFisaTabId;
			var btId=this.grid.parentBtId;
			var fieldId = this.grid.parentFieldId;
			var parentType = this.grid.parentType;
			var pageScopeId=this.grid.parentFisaPageScopeId;
			var fc = ec.fisa.controller.utils.getPageController(tabId, pageScopeId);
			var btActionMode =  fc.btActionMode;
			//var lovOutputParam = btController.lovData[btId][fieldId]["output"];
			var controller = ec.fisa.controller.utils.getPageController(this.grid.tabId, this.grid.pageScopeId);
			var callObj = {callbackScope:this.grid, callback:this.grid._getSelectedRowCallback, errorHandler:dojo.hitch(controller,controller.errorHandler)};
			var actionLov=null;
			var qtfm = null;
			var btfm = fc.model.toPlainObject();
			var cmp = null;
			if(this.grid.parentWidgetId){
				cmp=dijit.byId(this.grid.parentWidgetId);
			}else{
				cmp=fc.getComponent(btId, fieldId);
			}
			if(fc instanceof ec.fisa.controller.custom.QtController){
				qtfm = btfm;
				btfm = null;
				actionLov = this["action-lov"];
			}
			fc.clearPanelMessage();
			var gridFieldId=null;
			if(cmp.parentEditableGrid){
				gridFieldId=cmp.entityMrId;
			}
			QtControllerDWR.getSelectedRow(this.grid.tabId, this.grid.pageScopeId,tabId,pageScopeId, this.grid.qtId, selected[0], btId, fieldId, parentType,btActionMode,qtfm,btfm,actionLov,gridFieldId,cmp.hasFieldRoutineOrPolicy, callObj);
		}
	},
	_getSelectedRowCallback:function(data) {
		/*
		var parentTabId = this.parentFisaTabId;
		var parentPageScopeId = this.parentFisaPageScopeId;
		var parentBtId = this.parentBtId;
		var parentFieldId = this.parentFieldId;
		var controller = ec.fisa.controller.utils.getPageController(parentTabId, parentPageScopeId);
		var lovData = controller.lovData[parentBtId][parentFieldId];
		var cmp = dijit.byId(this.parentWidgetId);
		cmp._selectedRow = data.selectedRow;
		if (lovData) {
			if(cmp.parentEditableGrid === true){
				var parentGrid = dijit.byId(cmp.gridId);
				dojo.forEach(lovData["output"], function(outputParam, index){
					var fieldId = outputParam[0];
					var column = outputParam[1];
					var pfx=[fieldId];
					var selectedVal=data.selectedRow[column];
					parentGrid.model.setValue(pfx, selectedVal,false);
				},this);
				
				dojo.forEach(lovData["complement"], function(complementParam, index){
					var column = complementParam[0];
					var complement = data.selectedRow[column];
					var complementFieldId = parentFieldId + "--CMPLMNT";
					var pfx = [complementFieldId];
					parentGrid.complementModel.setValue(pfx, complement, false);
				},this);
			}else{
				dojo.forEach(lovData["output"], function(outputParam, index){
					var fieldId = outputParam[0];
					var column = outputParam[1];
					var val=controller.getFieldModel(parentBtId, fieldId);
					if(fieldId==parentFieldId&&val!=data.selectedRow[column]){
						cmp._fromSelection=true;
					}
					controller.setFieldModelValue(parentBtId, fieldId, data.selectedRow[column],false);
				},this);
				dojo.forEach(lovData["complement"], function(complementParam, index){
					var column = complementParam[0];
					controller.setFieldModelComplement(parentBtId, parentFieldId, data.selectedRow[column],false);
				},this);
				
				controller.publishChange(cmp["bt-id"], cmp["fisa-tab-id"], cmp["fisa-page-scope-id"], cmp);
				
			}
		}*/
		var cmp = dijit.byId(this.parentWidgetId);
		if(cmp.parentEditableGrid === true){
			var parentGrid = dijit.byId(cmp.gridId);
			var parentTabId = this.parentFisaTabId;
			var parentPageScopeId = this.parentFisaPageScopeId;
			var controller = ec.fisa.controller.utils.getPageController(parentTabId, parentPageScopeId);
			var parentBtId = this.parentBtId;
			var parentFieldId = this.parentFieldId;
			var lovData = controller.lovData[parentBtId][parentFieldId];
			
			var parentGridModel= null;
			var parentGridComplementModel = null;
			if(parentGrid.fisaEditableDirectGrid == true){
				parentGridModel= parentGrid.model[cmp.gridRealRowIndex];
				parentGridComplementModel = parentGrid.complementModel[cmp.gridRealRowIndex];
							
			}
			else{
				parentGridModel = parentGrid.model;
				parentGridComplementModel = parentGrid.complementModel;
			}
			
			
			
			dojo.forEach(lovData["output"], function(outputParam, index){
				var fieldId = outputParam[0];
				var column = outputParam[1];
				var pfx=[fieldId];
				var selectedVal=data.selectedRow[column];
				parentGridModel.setValue(pfx, selectedVal,false);
			},this);
			
			dojo.forEach(lovData["complement"], function(complementParam, index){
				var column = complementParam[0];
				var complement = data.selectedRow[column];
				var complementFieldId = parentFieldId + "--CMPLMNT";
				var pfx = [complementFieldId];
				parentGridComplementModel.setValue(pfx, complement, false);
			},this);
		}
		cmp._executeAutoLovCallback(data);
		/*if(data.wAxn === "refresh") {*/
			var lovId = this.parentBtId + "_" + this.parentFieldId + "_fisaLov";
			dijit.byId(lovId).closeF();
		/*}*/
	},
	
	//just close
	_onClose:function(){
		var lovId = this.grid.parentBtId + "_" + this.grid.parentFieldId + "_fisaLov";
		dijit.byId(lovId).closeF();
	},
	
	_setActionsAttr: function(actions){
		var s = actions;
		if(s && lang.isString(s)){
			dojo.deprecated("ec.fisa.grid.FisaQtGrid.set('actions', 'objVar')", "use dojox.grid._Grid.set('actions', objVar) instead", "2.0");
			s=lang.getObject(s);
		}
		this.actions = s;
		if(!s){
			return;
		}
	},
	setActions: function(inActions){
		// summary:
		//		Install a new actions and rebuild the grid.
		dojo.deprecated("ec.fisa.grid.FisaQtGrid.setActions(obj)", "use dojox.grid._Grid.set('actions', obj) instead.", "2.0");
		this._setActionsAttr(inActions);
	},
	/* accion interceptada por el controlador*/
	executeAction:function(qtId,action){
	},
	_storeLayerFetch: function(req){
		var fc = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
		if(fc.hasToClearMsgs&&fc.messagesPanelId){
			fc.clearPanelMessage();
		}
		this.inherited(arguments);
	},
	sort:function(){
		this.query.sortRequested = '1';//En QTControllerDwr.search (java) se procesa sortRequested si es 1 no se va a la base, si es 0 si. Tambien Ver funcion search en QtController.js
		this.inherited(arguments);
	},
	
	_onFetchComplete: function(items, req){
		
		this.inherited(arguments);
		if(this.hideQTGridIfNoResultsFound==true ){

			if(req._totalMatchedItems==0){
				var controller = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
				controller.unDisplayQTGrid();
				controller.unDisplayMessagesPanel();
			}
		}
		
		if(this.hideQTPortletIfNoResultsFound==true){
			if(req._totalMatchedItems>0){
				var controller = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
				controller.makeQTPortletVisible();
			}else{
				var controller = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
				controller.unDisplayQTPortlet();
			}
		}else{
			var controller = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
			controller.makeQTPortletVisible();
		}
		if(this.selectionMode == "single" || this.isSearchRequested === true){//Mantis 18178 JCVQ
			//La propiedad isSearchRequested ha sido definida en el metodo search de QtController.js
			delete this.isSearchRequested; //Mantis 18178 JCVQ
			if(this.selection != null && this.selection.deselectAll){
				this.selection.deselectAll();
			}
			this.realIndexSelectedArray=[];
		}
		
		if(this.selectionMode == "multiple"){
			this.preSelect(items);
		}
	},
	
	//hw: after view data creates error.
	onFetchError:function(){
		if(this.requestFromPortlet === true){
			//if an error happens with the parametrization hide or show the portlet.
			var controller = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
			if(this.hideQTGridIfNoResultsFound==true ){
				controller.unDisplayQTGrid();
			}
			else{
				controller.makeQTPortletVisible();
			}
			if(this.hideQTPortletIfNoResultsFound==true){
				controller.unDisplayQTPortlet();
			}
			else{
				controller.makeQTPortletVisible();
			}
		}
	},
	
	showFooterMessage:function(message){
		if(this._messagesId){
			var span=dojo.byId(this._messagesId);
			span.innerHTML=message;
		}
	},
	preSelect: function(items){
		var lastColumn = this.structure[0].length;//La estructura dek grid proporciona la posicion del ultimo elemento.
		
		for ( var i = 0; i <= items.length - 1; i++){
			var rowIndex = this.getItemIndex(items[i]);//Esta es la posicion actua de la fila en la pagina actual, siempre inicia desde cero
			var recordId=this.getItem(rowIndex);
			var selected = this.store.getValue(recordId,(lastColumn + ""));
			if(typeof selected == "boolean"){
				this.selection.setSelected(rowIndex, selected);
			}else{
				//Si no es boolean ya no debería continuar con la iteracion
				break;
			}
		}
	},
	_getBySelectionStatus: function (status){//Mantis 18517 JCVQ
		var result = [];
		for(var i=0, l = this.realIndexSelectedArray.length; i<l; i++){
			if(this.realIndexSelectedArray[i] == status){
				result.push(i);
			}
		}
		return result;
	},
	_defineAditionalParameters: function(){//Mantis 18517 JCVQ
		var outcome = [];
		outcome.push(this.pageScopeId);
		if(this.selectionMode == "multiple"){
			var deselected = this._getBySelectionStatus(false);
			if(deselected){
				outcome.push(deselected.toString());
			}
			
			var selected = this._getBySelectionStatus(true);
			if(selected){
				outcome.push(selected.toString());
			}
		}
		return outcome;
	}
});

return FisaQtGrid;

});

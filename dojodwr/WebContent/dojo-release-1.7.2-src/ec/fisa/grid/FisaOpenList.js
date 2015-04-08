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
        "ec/fisa/grid/enhanced/plugins/OpenListPagination",
        "dojox/grid/enhanced/plugins/IndirectSelection",
        "ec/fisa/controller/custom/QtController",
        "dojo/topic",
        "dojo/dom",
        "dojo/dom-style",
        "dojo/dom-geometry","dojo/_base/array",
        "ec/fisa/dwr/proxy/OpenListControllerDWR",
        "./_base"
        ], function(dojo, declare, lang, connect, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, FisaEnhancedGrid, Button, StoreDWR, OpenListPagination, IndirectSelection,
        		QtController, topic, dom, style, domGeom,array){

	var FisaOpenList = declare("ec.fisa.grid.FisaOpenList", [FisaEnhancedGrid], {
		_dataGridStore:null,
		execButtonLabel:"Ejecutar",
		selectButtonLabel:"Seleccionar",
		closeButtonLabel:"Cerrar",
		tabId:"",
		pageScopeId:"",
		qtId:"",
		actions:null,
		readOnlyValue:false,

		parentFieldId:'',
		pageLength:null,
		hasSelection:false,
		realIndexSelected:null,
		hasFieldRoutineOrPolicy:false,
		//este envia al metodo query para realizar las busquedas.
		queryObject:null,
		_value:null,
		isStartup:false,
		valueSelectedChanged:false,
		//items recovered and visible on the screen.
		visibleItems:null,
		
		selectedFromScreen:false,
		
		originalValueIndex:-1,//Usado en alias de cuentas, este valor se define en la tabla tapd_qt_property_value con QUERY_TEMPLATE_PROPERTY_ID = 'ORIGINAL_VALUE' para la qt asociada al grid, JCVQ
		substitutionFdk:"",//Usado en alias de cuentas, este valor se define en la tabla tapd_qt_property_value con QUERY_TEMPLATE_PROPERTY_ID = 'SUBSTIT_FDK' para la qt asociada al grid, JCVQ
		postCreate: function(){
			//connect
			this.connect(this.selection,"addToSelection",this._addToSelection);
			this.connect(this.selection,"deselect",this._deselect);

			this.selection.getSelected=this._getSelected;
			this.selection.select = this.select;
			this.realIndexSelected=null;


			this.inherited(arguments);
		},

		//override to put a flag to know when is change value and deselect
		select: function(inIndex){
			if(this.mode == 'none'){ return; }
			if(this.mode != 'multiple'){
				this.grid.valueSelectedChanged = true;
				this.deselectAll(inIndex);
				this.grid.valueSelectedChanged = false;
				this.addToSelection(inIndex);
			}else{
				this.toggleSelect(inIndex);
			}
		},


		//avoid some columns to be sortable.
		canSort:function(col){
			var result = false;	
			if(this.readOnlyValue == false){
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
			}
			return result;
		},

		postMixInProperties:function(){

			this.inherited(arguments);
			this.selectionMode = "single";

			var pagination={showAddButton:false,options:this.actions,  onSelect:this._returnSelectedRow};
			var indirectSelection = {headerSelector:false, width:"105px", name: this.selectButtonLabel, styles:"text-align: center;"};
			
			
			this.keepSelection = true;
			pagination.indirectSelectionVar = indirectSelection;
			this.hasSelection=indirectSelection!==false;
			if(this.plugins){
				if(this.readOnlyValue == false){
				this.plugins.openListPagination=pagination;
				this.plugins.indirectSelection=indirectSelection;
				}
				
			} else {
				if(this.readOnlyValue == false){
					this.plugins={openListPagination:pagination,indirectSelection:indirectSelection};
				}
			}
			this.store=new ec.fisa.dwr.Store("OpenListControllerDWR","viewData",this.tabId,this.qtId,[this.pageScopeId,this["field-id"]],null);
			this.store.callbackScope = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
		},
		startup:function(){
			var controller = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
			controller.addParamToModel(this);
			
			if(controller.openListIdMap!= null){
				controller.openListIdMap[this["field-id"]] =this.id ;
			} 
			this.isStartup = true;
			this.initDataBt();
			this.correctWidth();
		},


		//override getselected method to call our array in case of multiple
//		_getSelected: function(){
//		var result = this.realIndexSelected;

//		return result;
//		},

		_deselect:function(inItemOrIndex){
			if(this.readOnlyValue == false){
			//var realIndex=	ec.fisa.grid.utils.obtainInitialViewableMrIndex(this)+inItemOrIndex;
			this.realIndexSelected= -1;
			this._value = "";
			//if value was only deselected change value.
			if(this.valueSelectedChanged == false){
				if(this.isStartup == false){
					this.returnSelectedRow();
					}
			}
			
			}
		},

		/**Only called when multiple is selected and updates with the real row index array the items selected*/
		_addToSelection:function(inItemOrIndex){
			if(this.readOnlyValue == false){
			var realIndex=	ec.fisa.grid.utils.obtainInitialViewableMrIndex(this)+inItemOrIndex;
			this.realIndexSelected=realIndex;
			//console.log(inItemOrIndex);
			if(this.isStartup == false){
				this.selectedFromScreen = true;
			this.returnSelectedRow();
			}
			}
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


		returnSelectedRow:function() {
			var selected = this.realIndexSelected;
			if (selected != null) {
				var btId=this["bt-id"];
				var fieldId = this["field-id"];
				var fc = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
				var btActionMode =  fc.btInitialActionMode;
				//var lovOutputParam = btController.lovData[btId][fieldId]["output"];
				var controller = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
				var callObj = {callbackScope:this, callback:this._getSelectedRowCallback, errorHandler:dojo.hitch(controller,controller.errorHandler)};
				var btfm = fc.model.toPlainObject();
				fc.clearPanelMessage();

				OpenListControllerDWR.getSelectedRow(this.tabId, this.pageScopeId,this.tabId,this.pageScopeId, this.qtId, selected, btId, fieldId, btActionMode,btfm,this.hasFieldRoutineOrPolicy, callObj);
			}
		},
		_getSelectedRowCallback:function(data) { 
			var fc = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
			if(data.wAxn === "error"){
				fc.updateMsgsPanel(data.aMsgs);
				this.clearOutputLovData(fc);
			} else if(data.wAxn === "refresh") {
				this.setOutputLovData(fc, data);
				fc.handleCallBackBackFieldRoutine(data);
				//if has to update combos.
				if(data.dataUpdate!= null &&data.dataUpdate != undefined){
					var comboIdMap =	data.dataUpdate;
					if(comboIdMap != null && comboIdMap != undefined){
						dojox.lang.functional.forIn(comboIdMap,dojo.hitch(this,function(dataCombo,/*key*/notifyComboId){
							fc.updateSelectByOutcome(notifyComboId,dataCombo,ctrl,this.gridRealRowIndex);
						}));
					}
				}
			}
		},

		clearOutputLovData: function(fc){
			this.setOutputLovData(fc, null);
		},
		//updates the model of the bt
		setOutputLovData: function(fc,data){
			var eid = this["bt-id"];
			var fid = this["field-id"];
			var lovData = fc.lovData[eid][fid];
			if (lovData) {
				dojo.forEach(lovData["output"], function(outputParam, index){
					var fieldId = outputParam[0];
					var column = outputParam[1];
					var val=null;
					if (data && data.selectedRow) {
						val=data.selectedRow[column];
					}
					fc.setFieldModelValue(eid, fieldId, val, false);
				},this);
			}
		},

		_storeLayerFetch: function(req){
			this.firstOcurrence = false;
			if(this.isStartup == true){
				req.query["qtSearchRowFieldValue"]= this._value;
			}
			if(this.readOnlyValue == true){
				req.query["qtOpenListQy"]= true;
			}
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
			this.visibleItems = items;
			if(this.isStartup == true){
				if(this.readOnlyValue == false && this._value != null && this._value != ""){
					//here search for the correct  index.	
					if(!array.some(items, dojo.hitch(this,function(item, i){
						if(this.firstOcurrence ==false && this._checkRowOpenList(item, this._value, true)){
							this.isStartup = true;
							this.firstOcurrence = true;
							this.selection.setSelected(i,true);
							this.isStartup = false;
						}
					})));
					
				}
			this.isStartup = false;
			}
			else{
				if (this.selection.selectedIndex >= 0)
			    {
			        // If there is a currently selected row, deselect it now
			        this.selection.setSelected(this.selection.selectedIndex, false);
			    }
				else{
					this.selection.deselectAll();
				}
				 this._value = "";
			}
			
		},
		showFooterMessage:function(message){
			if(this._messagesId){
				var span=dojo.byId(this._messagesId);
				span.innerHTML=message;
			}
		},

		_setValueAttr:function(value, /* Boolean? */priorityChange, /* String? */
				formattedValue){
			this._value = value;
			
			if(this.readOnlyValue == false && value != null && value != "" && this.selectedFromScreen == false){
				//here search for the correct  index.	
				if(!array.some(this.visibleItems, dojo.hitch(this,function(item, i){
					if(this._checkRowOpenList(item, value, true)){
						this.isStartup = true;
						
						if (this.selection.selectedIndex >= 0 && this.selection.selectedIndex != i)
					    {
					        // If there is a currently selected row, deselect it now
					        this.selection.setSelected(this.selection.selectedIndex, false);
					    }
						this.selection.setSelected(i,true);
						this.isStartup = false;
					}
				})));
			}
			this.selectedFromScreen = false;
		},
		_getValueAttr:function(){
			return this._value;
		},

		// inits data from the bt to the query
		initDataBt:function() {
			var btId = this["bt-id"];
			var fieldId = this["field-id"];
			var pfc = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
			var lovData = pfc.lovData[btId][fieldId];
			if (lovData && lovData["input"] && lovData["input"].length>0) {
				dojo.forEach(lovData["input"], function(outputParam, index){
					var fieldId = outputParam[0];
					var paramId = outputParam[1];
					if(this.queryObject == null){
						this.queryObject = {};
					}
					if (!pfc.containsFieldModel(btId, fieldId)) {
						pfc.addParamToModel({"bt-id":btId,"field-id":fieldId,hasCompl:false,set:function(){}});
					}
					var fieldValue = pfc.getFieldModel(btId, fieldId);
					//update from model if model doesnt have value obtain from fm data
					if(fieldValue == null){
						if(pfc.data&&pfc.data[btId]&&pfc.data[btId].dataMessage){
							var field = pfc.data[btId].dataMessage.fields[fieldId];
							if(field){
							fieldValue = field.value;
							}
						}
					}
					this.queryObject[paramId] = fieldValue;
					
				},this);
			}
			if(this.queryObject == null){
				this.queryObject = {};
			}
			this.query=this.queryObject;
		},
		
		//refresh data from bt and added to object query.
		refreshData:function() {
			var btId = this["bt-id"];
			var fieldId = this["field-id"];
			var pfc = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
			var lovData = pfc.lovData[btId][fieldId];
			if (lovData && lovData["input"] && lovData["input"].length>0) {
				dojo.forEach(lovData["input"], function(outputParam, index){
					var fieldId = outputParam[0];
					var paramId = outputParam[1];
					if(this.queryObject == null){
						this.queryObject = {};
					}
					if (!pfc.containsFieldModel(this.parentBtId, fieldId)) {
						pfc.addParamToModel({"bt-id":this.parentBtId,"field-id":fieldId,hasCompl:false,set:function(){}});
					}
					var fieldModel = pfc.getFieldModel(btId, fieldId);
					this.queryObject[paramId] = fieldModel;
				},this);
			}
			this.query=this.queryObject;
		},
		
		refreshDataBt:function(){
			this.refreshData();
			this.refresh();
			// refresh also the value.
			this._value = "";
		},
		
		//migrated from search.js
		_checkRowOpenList: function(/* store item */item, /* Object|RegExp */searchArgs, /* Boolean */isGlobal){
			var g = this, s = g.store, i, field,
				cells = array.filter(g.layout.cells, function(cell){
					return !cell.hidden;
				});
			if(isGlobal){
				return array.some(cells, function(cell){
					try{
						if(cell.field){
							return String(s.getValue(item, cell.field)).search(searchArgs) >= 0;
						}
					}catch(e){
						console.log("Search._checkRow() error: ", e);
					}
					return false;
				});
			}else{
				for(field in searchArgs){
					if(searchArgs[field] instanceof RegExp){
						for(i = cells.length - 1; i >= 0; --i){
							if(cells[i].field == field){
								try{
									if(String(s.getValue(item, field)).search(searchArgs[field]) < 0){
										return false;
									}
									break;
								}catch(e){
									return false;
								}
							}
						}
						if(i < 0){ return false; }
					}
				}
				return true;
			}
		}
	});
	return FisaOpenList;
});
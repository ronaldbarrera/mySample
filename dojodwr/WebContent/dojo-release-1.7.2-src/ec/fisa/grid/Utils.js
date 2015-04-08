define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"ec/fisa/grid/_base",
	"dojox/grid/EnhancedGrid",
	"ec/fisa/mvc/StatefulModel",
	"ec/fisa/widget/MultiregisterLink",
	"dojo/text!ec/fisa/widget/TextBox.conf",
	"ec/fisa/grid/RowActions",
	"ec/fisa/grid/RowActionsDirect",
	"ec/fisa/format/Utils",
	"ec/fisa/widget/i18n/I18nTextBox",
	"ec/fisa/widget/i18n/I18nTextarea",
	"ec/fisa/widget/CheckBox",
	"ec/fisa/widget/OutputText",
	"dojox/lang/functional/object",
	"ec/fisa/widget/DateTextBox",
	"ec/fisa/widget/EnhancedDateTextBox",
	"ec/fisa/widget/TextBox",
	"ec/fisa/widget/TextArea",
	"./_base"
	
],function(dojo,declare,lang,fisaGrid,EnhancedGrid,StatefulModel,MultiregisterLink,textBoxConfigTxt, RowActions,RowActionsDirect){
	
	var Utils = declare("ec.fisa.grid.Utils", null, {
		textBoxConfig:dojo.fromJson(textBoxConfigTxt),
		regexpr : /^(?!.*--CMPLMNT$)/,
	makeEGControlButtons:function(data, rowIndex, cell, edit_title, delete_title, apply_title, cancel_title, add_title, tabIndex){
		var grid =cell.grid;
		return new RowActions({'data':data,'rowIndex':	
			this.obtainInitialViewableMrIndex(grid)+rowIndex,'viewRowIndex':rowIndex,
			'gridId':grid.id,
			'editBlocked':grid.block.e,
			'deleteBlocked':grid.block.d,
			'edit_title':edit_title,
			'delete_title':delete_title,
			'apply_title':apply_title,
			'cancel_title':cancel_title,
			'add_title':add_title,
			'tabIndex':tabIndex
		});
	},
	//only for fisaeditablegrid direct just show delete button
	makeEGControlButtonsDirect:function(data, rowIndex, cell, delete_title,actionMode, tabIndex){
		var grid =cell.grid;
		return new RowActionsDirect({'data':data,'rowIndex':	
		this.obtainInitialViewableMrIndex(grid)+rowIndex,'viewRowIndex':rowIndex,
			'gridId':grid.id,
			'deleteBlocked':grid.block.d,
			'delete_title':delete_title,
			'actionMode':actionMode,
			'tabIndex':tabIndex
		});
	},
	
	makeStatusButtons:function(data, rowIndex, cell, edit_title, delete_title, apply_title, cancel_title, add_title){
		var grid =cell.grid;
		//TODO: change the output component because it does not represent what issue 0014457 asks
		return new RowActions({'data':data,'rowIndex':	
			this.obtainInitialViewableMrIndex(grid)+rowIndex,'viewRowIndex':rowIndex,
			'gridId':grid.id,
			'editBlocked':grid.block.e,
			'deleteBlocked':grid.block.d,
			'edit_title':edit_title,
			'delete_title':delete_title,
			'apply_title':apply_title,
			'cancel_title':cancel_title,
			'add_title':add_title
		});
	},
	
	//obtains the initial index of the viewable multiregister, ejm:
	//if a mr has pagination and u go to the 2 page, and each page contains five.
	//the initial index of the second page must be 5
	obtainInitialViewableMrIndex:function(grid){
		return grid._layers[0].startIdx;
	},
	
	updateRowData:function(outcome,scope,updateStore){
		if(outcome.record){
			if(scope.model){
				delete scope.model;
			}
			if(scope.complementModel){
				delete scope.complementModel;
			}
			var _sts = outcome.record.rowSts;
			var sts=_sts%10;
			if(sts==5){
				scope.model=new StatefulModel();
				scope.complementModel=new StatefulModel();// Se llena en el metodo getMRComponent de esta clase
				var rec=outcome.record;
				if(rec!=null){
					dojox.lang.functional.forIn(rec,function(val, idx){
						if(this.regexpr.test(idx)){
							scope.model.appendObject([idx],val,null,null,null,null);
						}else{
							scope.complementModel.appendObject([idx],val,null,null,null,null);
						}
					},this);
				}
			}
			if(updateStore){
				if(outcome.record.rowSts){
					scope.store.setValue(outcome.recordId,"rowSts",outcome.record.rowSts);
				}
				dojox.lang.functional.forIn(outcome.record,function(val,prop){
					if(prop!="rowSts"){
						scope.store.setValue(outcome.recordId,prop,val);
					}
				},scope);
			}
		}
	},
	//new row for mr direct
	newRowDataDirect:function(outcome,scope,updateStore){
		if(outcome.record){
				scope.model[scope.model.length] = new StatefulModel();
				scope.complementModel[scope.complementModel.length]=new StatefulModel();
				var rec=outcome.record;
				if(rec!=null){
					var _model=scope.model[scope.model.length-1];
					dojox.lang.functional.forIn(rec,function(val, idx){
						_model.appendObject([idx],val,null,null,null,null);
					},this);
				}
			if(updateStore){
				if(outcome.record.rowSts){
					scope.store.setValue(outcome.recordId,"rowSts",outcome.record.rowSts);
				}
				dojox.lang.functional.forIn(outcome.record,function(val,prop){
					if(prop!="rowSts"){
						scope.store.setValue(outcome.recordId,prop,val);
					}
				},scope);
			}
		}
	},
	/**Obtains the dojo widget by the field type.*/
	getMRComponent:function(/*Object -data of the specific cell value*/data,rowIndex,colDef,fieldType,
			tabId,pageScopeId,qtId,/*String*/ gridId, /*Object {}*/aditionalData, tabIndex){
		var recordId=colDef.grid.getItem(rowIndex);
		var _sts = colDef.grid.store.getValue(recordId,"rowSts");
		var sts=_sts%10;
		if(sts==5){
			return this.getMRComponentEditable(data,rowIndex,colDef,fieldType,tabId,pageScopeId,qtId,gridId,aditionalData,false,tabIndex);
		}else if(data){
			if(fieldType == 3){
				var ctrlr= ec.fisa.controller.utils.getPageController(tabId,pageScopeId);
				outcome = ctrlr.findDescription(colDef.bt, colDef.field, data);
				return outcome;
			}else if(fieldType==8){
				//Se crea un check en modo solo lectura
				var outcome = new ec.fisa.widget.CheckBox({"fieldId":colDef.field,"value":data,"readOnly":true});
				return outcome;
			}else{
				return this._formatcolumn(tabId, pageScopeId, sts, aditionalData, data,rowIndex,colDef);
			}
			
		}else if(!data){
			if(fieldType==8){
				var outcome = new ec.fisa.widget.CheckBox({"fieldId":colDef.field,"value":'0',"readOnly":true});
				return outcome;
			}
			return "";
		}
		return data;
	},
	
	/**Obtains the dojo widget by the field type.*/
	getMRComponentDirect:function(/*Object -data of the specific cell value*/data,
			rowIndex,colDef,fieldType,tabId,pageScopeId,qtId,/*String*/ gridId, /*Object {}*/aditionalData, tabIndex){
		if(colDef.grid.model == null || colDef.grid.model == undefined){
			colDef.grid.model=[];
		}
		if(colDef.grid.complementModel == null || colDef.grid.complementModel == undefined){
			colDef.grid.complementModel=[];
		}

		//index real cause in pagination starts over each page.
		var gridRealRowIndex = this.obtainInitialViewableMrIndex(colDef.grid)+rowIndex;
		
		if(colDef.grid.model[gridRealRowIndex] == undefined){
			colDef.grid.model[gridRealRowIndex] = new StatefulModel({});
		}
		
		if(colDef.grid.complementModel[gridRealRowIndex] == undefined){
			colDef.grid.complementModel[gridRealRowIndex] = new StatefulModel({});
		}
		
		if(aditionalData.actionMode == "QY" || aditionalData.actionMode == "DE" || colDef.grid.block.e == true){
			//Mantis 17580 JCVQ, se añade condición adicional en l que se verifica si el multiregistro tiene restricción de edición de datos.
			if(data){
				if("ec.fisa.grid.FisaFormGrid" === colDef.grid.declaredClass && 0 === aditionalData.columnIndex){
					var outcome = '<label class="fisaLabel">' + data + '</label>';
					return outcome;
				}//texto fieldtype == 1
				else if("ec.fisa.grid.FisaFormGrid" === colDef.grid.declaredClass && fieldType == 1){
					var numeric = false;
					if(aditionalData.format == 4 || aditionalData.format == 5 || aditionalData.format == 6){
						//es numerico.
						numeric = true;
					}	
					var outcome = new ec.fisa.widget.OutputText({value:data,numeric:numeric});
					
					return outcome;
				}
				
				else if(fieldType == 3){
					var ctrlr= ec.fisa.controller.utils.getPageController(tabId,pageScopeId);
					outcome = ctrlr.findDescription(colDef.bt, colDef.field, data);
					return outcome;
				}else if(fieldType==8){
					//Se crea un check en modo solo lectura
					var outcome = new ec.fisa.widget.CheckBox({"fieldId":colDef.field,"value":data,"readOnly":true});
					return outcome;
				}else{
					var recordId=colDef.grid.getItem(rowIndex);
					var _sts = colDef.grid.store.getValue(recordId,"rowSts");
					return this._formatcolumn(tabId, pageScopeId, _sts, aditionalData, data,rowIndex,colDef);
				}
				
			}else if(!data){
				return "";
			}
			
		}else{
			return this.getMRComponentEditable(data,rowIndex,colDef,fieldType,tabId,pageScopeId,qtId,gridId,aditionalData,true, tabIndex);
		}
		
	},
	
	
	/** obtains the editable component for the row.*/
	getMRComponentEditable:function(/*Object -data of the specific cell value*/data,rowIndex,colDef,
			fieldType,tabId,pageScopeId,qtId,/*String*/ gridId, /*Object {}*/aditionalData,isDirect, tabIndex){
		var recordId=colDef.grid.getItem(rowIndex);
		var _sts = colDef.grid.store.getValue(recordId,"rowSts");
		
		//index real cause in pagination starts over each page.
		var gridRealRowIndex = this.obtainInitialViewableMrIndex(colDef.grid)+rowIndex;
		var cAction=null;
			if(_sts.length>1){
				cAction=_sts.charAt(_sts.length-2);
			}
			if(cAction==1){
				cAction="IN";
			}else if(cAction==2){
				cAction="UP";
			}
		if(cAction == null && isDirect== true)
		{
			cAction = aditionalData.actionMode;
		}
		
		// Mantis 17618 hw: first check if the value exists on a model if not obtain from store
		var initVal = null;
		if(isDirect==false){
			var pfx=[colDef.field];
			initVal=colDef.grid.model.getValue(pfx);
			}
		else{
			if(data != undefined && data != null){
				initVal = data;
			}
			else{
				var model =	colDef.grid.model[gridRealRowIndex];
				if(model != undefined){
					var tempVal =model.getValue([colDef.field]);
					if(tempVal != undefined && tempVal != null){
						initVal = tempVal;
					}
				}
			}
		}
		var dataVal = colDef.grid.store.getValue(recordId,colDef.field);
		if("ec.fisa.grid.FisaFormGrid" === colDef.grid.declaredClass && 0 === aditionalData.columnIndex){
			var outcome = '<label class="fisaLabel">' + dataVal + '</label>';
			return outcome;
		}
		if(fieldType==1){//Texto
			if(aditionalData.multiLanguage == 1){
				var initObject = {
						'bt-id':colDef.bt,
						'tabId':tabId,
						'pageScopeId':pageScopeId,
						'fieldId':colDef.field,
						//duplicate cause in some js. uses the one it came from the vm.
						'field-id':colDef.field,
						'defaultLanguage':aditionalData.currentLanguage, 
						'supportedLanguages':aditionalData.supportedLanguages,
						'tapdFieldLenght':aditionalData.tapdFieldLenght,
						'requestedAction':aditionalData.requestedAction,
						'parentEditableGrid':true,
						'notify-combo-id':aditionalData.notifyComboId,
						'tdParentWidth':aditionalData.tdParentWidth,
						'gridId':gridId,
						'gridSelectedRowIndex':rowIndex,
						'entityMrId':aditionalData.entityId,
						'gridRealRowIndex':gridRealRowIndex,
						'tabIndexField':tabIndex,
						'parentType':colDef.ptype};
				
				if(aditionalData.visualSize!=null){
					initObject.visualSize=aditionalData.visualSize;
				}
				
				//Mantis 20145 JCVQ
				if(aditionalData.textTransform){
					initObject.textTransform = aditionalData.textTransform;
				}
				var outcome = new ec.fisa.widget.i18n.I18nTextBox(initObject);
				this._setInitValFromModel(colDef,isDirect,rowIndex,initVal,outcome.id,gridRealRowIndex);
				return outcome;
			}else{
				var initObject = {
						'bt-id':colDef.bt,
						'fieldId':colDef.field,
						'field-id':colDef.field,
						'maxLength':aditionalData.tapdFieldLenght,
						'requestedAction':aditionalData.requestedAction,
						'btId':aditionalData.btId,
						'gridSelectedRowIndex':rowIndex,
						'notify-combo-id':aditionalData.notifyComboId,
						'tdParentWidth':aditionalData.tdParentWidth,
						'parentEditableGrid':true,
						'tabId':tabId,
						'pageScopeId':pageScopeId,
						'entityMrId':aditionalData.entityId,
						'gridId':gridId,
						'format':aditionalData.format,
						'tabIndexField':tabIndex,
						'gridRealRowIndex':gridRealRowIndex
						};
				
				if(aditionalData.visualSize!=null){
					initObject.visualSize=aditionalData.visualSize;
				}
				//Mantis 20145 JCVQ
				if(aditionalData.textTransform){
					initObject.textTransform = aditionalData.textTransform;
				}
				var outcome =new ec.fisa.widget.TextBox(initObject);
				//indicates that by a controller this component was disabled. for the ftm.
				var disabled = true;
				if(cAction=='IN'){
					disabled = aditionalData.ftmDisabledIn;
				}else if(cAction=='UP'){
					disabled = aditionalData.ftmDisabledUp;
				}
				aditionalData.insertAllowed = (disabled != true);
				aditionalData.updateAllowed = (disabled != true);
				
				this._defineReadOnly(outcome, cAction, aditionalData.insertAllowed, aditionalData.updateAllowed);
				this._setInitValFromModel(colDef,isDirect,rowIndex,initVal,outcome.id,gridRealRowIndex);
				return outcome;
			}
		} else if(fieldType==2){//Lov
			var _val="";
			if(!("" === initVal || null == initVal || typeof initVal === "undefined")){
				_val=initVal;
			}
			var _opts={selectLabel:"Seleccione ...",
					'fisa-tab-id':tabId,
					'fisa-page-scope-id':pageScopeId,
					'bt-id':colDef.bt,
					'qt-id':qtId,
					'qtTitle':aditionalData.qtTitle,
					'fieldId':colDef.field,
					'field-id':colDef.field,
					'parentEditableGrid':true,
					'entityMrId':aditionalData.entityId,
					'notify-combo-id':aditionalData.notifyComboId,
					'tdParentWidth':aditionalData.tdParentWidth,
					'gridId':gridId,
					'gridSelectedRowIndex':rowIndex,
					'parentType':colDef.ptype,
					'editable':aditionalData.editAllowed,
					'initial-value':_val,
					'actionMode':aditionalData.actionMode,
					'gridRealRowIndex':gridRealRowIndex,
					'tabIndexField':tabIndex,
					'lov-height':aditionalData.lovHeight,
					'lov-width':aditionalData.lovWidth,
					'lov-info-mode':aditionalData.lovInfoMode,
					'hasFieldRoutineOrPolicy':'false'};
			if(aditionalData.visualSize!=null){
				_opts.visualSize=aditionalData.visualSize;
			}
			//Mantis 20145 JCVQ
			if(aditionalData.textTransform){
				_opts.textTransform = aditionalData.textTransform;
			}			
			var outcome =new ec.fisa.lov.ListOfValues(_opts);
			
			//Mantis 18937 CM No se ha implementado este codigo en estos componentes  
			//indicates that by a controller this component was disabled. for the ftm.
			var disabled = true;
			if(cAction=='IN'){
				disabled = aditionalData.ftmDisabledIn;
			}else if(cAction=='UP'){
				disabled = aditionalData.ftmDisabledUp;
			}
			aditionalData.insertAllowed = (disabled != true);
			aditionalData.updateAllowed = (disabled != true);
			
			this._defineReadOnly(outcome, cAction, aditionalData.insertAllowed, aditionalData.updateAllowed);			
			
			this._setInitValFromModel(colDef,isDirect,rowIndex,initVal,outcome.id,gridRealRowIndex);
			return outcome;
		} else if(fieldType==3){//ComboBox
//			var ctrlr= ec.fisa.controller.utils.getPageController(tabId,pageScopeId);
//			var options=ctrlr.loadSelectData({'qt-id':qtId},true);
			var initObject ={
					'qtId':qtId,
					'qt-id':qtId,
					'fieldId':colDef.field,
					'value':initVal,
					'tabId':tabId,
					'pageScopeId':pageScopeId,
					'parentEditableGrid':true,
					'entityMrId':aditionalData.entityId,
					'notify-combo-id':aditionalData.notifyComboId,
					'parentGridId':gridId,
					'tdParentWidth':aditionalData.tdParentWidth,
					'field-id':colDef.field,
					'gridRealRowIndex':gridRealRowIndex,
					'tabIndexField':tabIndex,
					'gridId':gridId,
					'bt-id':colDef.bt
					};
				if(aditionalData.visualSize!=null){
					initObject.visualSize=aditionalData.visualSize;
				}	
			
			var outcome = new ec.fisa.widget.Select(initObject);
			
			//Mantis 18937 CM No se ha implementado este codigo en estos componentes  
			//indicates that by a controller this component was disabled. for the ftm.
			var disabled = true;
			if(cAction=='IN'){
				disabled = aditionalData.ftmDisabledIn;
			}else if(cAction=='UP'){
				disabled = aditionalData.ftmDisabledUp;
			}
			aditionalData.insertAllowed = (disabled != true);
			aditionalData.updateAllowed = (disabled != true);
			
			this._defineReadOnly(outcome, cAction, aditionalData.insertAllowed, aditionalData.updateAllowed);	
			
			this._setInitValFromModel(colDef,isDirect,rowIndex,initVal,outcome.id,gridRealRowIndex);
			return outcome;
		} else if(fieldType==5){//Fechas
			var initObject={
					fieldId:colDef.field,
					fisaFormat:aditionalData.format,
					fisaFormatPattern:aditionalData.formatPattern,
					'fisa-tab-id':tabId,
					'field-id':colDef.field,
					'fieldId':colDef.field,
					'fisa-page-scope-id':pageScopeId,
					'bt-id':colDef.bt,
					'parentEditableGrid':true,
					'entityMrId':aditionalData.entityId,
					'notify-combo-id':aditionalData.notifyComboId,
					'tdParentWidth':aditionalData.tdParentWidth,
					'gridRealRowIndex':gridRealRowIndex,
					'tabIndexField':tabIndex,
					'gridId':gridId,
					'baseClass':"dijitTextBox dijitComboBox dijitDateTextBox",
					inputInvalidLabel:aditionalData.inputInvalidLabel};
			if(aditionalData.visualSize!=null){
				initObject.visualSize=aditionalData.visualSize;
			}	
			var outcome = new ec.fisa.widget.DateTextBox(initObject);
			
			//Mantis 18937 CM No se ha implementado este codigo en estos componentes  
			//indicates that by a controller this component was disabled. for the ftm.
			var disabled = true;
			if(cAction=='IN'){
				disabled = aditionalData.ftmDisabledIn;
			}else if(cAction=='UP'){
				disabled = aditionalData.ftmDisabledUp;
			}
			aditionalData.insertAllowed = (disabled != true);
			aditionalData.updateAllowed = (disabled != true);
			
			this._defineReadOnly(outcome, cAction, aditionalData.insertAllowed, aditionalData.updateAllowed);	
			
			this._setInitValFromModel(colDef,isDirect,rowIndex,initVal,outcome.id,gridRealRowIndex);
			return outcome;
		} 	else if(fieldType==7){//TEXT_AREA
			if(aditionalData.multiLanguage == 1){
				var initObject = {
						'bt-id':colDef.bt,
						'tabId':tabId,
						'pageScopeId':pageScopeId,
						'fieldId':colDef.field,
						//duplicate cause in some js. uses the one it came from the vm.
						'field-id':colDef.field,
						'defaultLanguage':aditionalData.currentLanguage, 
						'supportedLanguages':aditionalData.supportedLanguages,
						'tapdFieldLenght':aditionalData.tapdFieldLenght,
						'requestedAction':aditionalData.requestedAction,
						'parentEditableGrid':true,
						'notify-combo-id':aditionalData.notifyComboId,
						'tdParentWidth':aditionalData.tdParentWidth,
						'gridId':gridId,
						'gridSelectedRowIndex':rowIndex,
						'entityMrId':aditionalData.entityId,
						'gridRealRowIndex':gridRealRowIndex,
						'tabIndexField':tabIndex,
						'parentType':colDef.ptype};
				
				if(aditionalData.visualSize!=null){
					//initObject.visualSize=aditionalData.visualSize;  ************************
					initObject.visualSize=2025;
					
				}
				
				//Mantis 20145 JCVQ
				if(aditionalData.textTransform){
					initObject.textTransform = aditionalData.textTransform;
				}
				var outcome = new ec.fisa.widget.i18n.I18nTextarea(initObject);
				
				//Mantis 18937 CM No se ha implementado este codigo en estos componentes  
				//indicates that by a controller this component was disabled. for the ftm.
				var disabled = true;
				if(cAction=='IN'){
					disabled = aditionalData.ftmDisabledIn;
				}else if(cAction=='UP'){
					disabled = aditionalData.ftmDisabledUp;
				}
				aditionalData.insertAllowed = (disabled != true);
				aditionalData.updateAllowed = (disabled != true);
				
				this._defineReadOnly(outcome, cAction, aditionalData.insertAllowed, aditionalData.updateAllowed);	
				
				this._setInitValFromModel(colDef,isDirect,rowIndex,initVal,outcome.id,gridRealRowIndex);
				return outcome;
			}else{
				var initObject = {
						'bt-id':colDef.bt,
						'fieldId':colDef.field,
						'field-id':colDef.field,
						'maxLength':aditionalData.tapdFieldLenght,
						'requestedAction':aditionalData.requestedAction,
						'btId':aditionalData.btId,
						'gridSelectedRowIndex':rowIndex,
						'notify-combo-id':aditionalData.notifyComboId,
						'tdParentWidth':aditionalData.tdParentWidth,
						'parentEditableGrid':true,
						'tabId':tabId,
						'pageScopeId':pageScopeId,
						'entityMrId':aditionalData.entityId,
						'gridId':gridId,
						'format':aditionalData.format,
						'tabIndexField':tabIndex,
						'gridRealRowIndex':gridRealRowIndex,
						'textAreaBaseClass':aditionalData.textAreaBaseClass
						};
				
				if(aditionalData.visualSize!=null){
					//initObject.visualSize=aditionalData.visualSize;  ********************************
					//para hacer cuadrar en registro multieditable. temporal
					initObject.visualSize=2025;
				}
				//Mantis 20145 JCVQ
				if(aditionalData.textTransform){
					initObject.textTransform = aditionalData.textTransform;
				}				
				var outcome =new ec.fisa.widget.TextArea(initObject);
				//indicates that by a controller this component was disabled. for the ftm.
				var disabled = true;
				if(cAction=='IN'){
					disabled = aditionalData.ftmDisabledIn;
				}else if(cAction=='UP'){
					disabled = aditionalData.ftmDisabledUp;
				}
				aditionalData.insertAllowed = (disabled != true);
				aditionalData.updateAllowed = (disabled != true);
				
				this._defineReadOnly(outcome, cAction, aditionalData.insertAllowed, aditionalData.updateAllowed);
				this._setInitValFromModel(colDef,isDirect,rowIndex,initVal,outcome.id,gridRealRowIndex);
				return outcome;
			}
		}
		
		else if(fieldType==8){//CHECK_BOX
			
			var initObject={
					fieldId:colDef.field,
					'fisa-tab-id':tabId,
					'field-id':colDef.field,
					'fieldId':colDef.field,
					'fisa-page-scope-id':pageScopeId,
					'bt-id':colDef.bt,
					'parentEditableGrid':true,
					'notify-combo-id':aditionalData.notifyComboId,
					'tdParentWidth':aditionalData.tdParentWidth,
					'gridRealRowIndex':gridRealRowIndex,
					'tabIndex':tabIndex,
					'gridId':gridId,
					inputInvalidLabel:aditionalData.inputInvalidLabel};
			
			var outcome = new ec.fisa.widget.CheckBox(initObject);
			this._defineReadOnly(outcome, cAction, aditionalData.insertAllowed, aditionalData.updateAllowed);
			this._setInitValFromModel(colDef,isDirect,rowIndex,initVal,outcome.id,gridRealRowIndex);
			return outcome;
		}else if(fieldType==0){
			//Es complemento
			var outcome = new ec.fisa.widget.OutputText({fieldId:colDef.field});
			var initVal=data;
			if(!("" === initVal || null == initVal || typeof initVal === "undefined")){
				outcome.set("value", initVal);
			}
			this._setInitValFromModel(colDef,isDirect,rowIndex,initVal,outcome.id,gridRealRowIndex);
			return outcome;
		}else if(fieldType == 30){//ENHANCED_DATE
			var _opts={
					'fisa-tab-id':tabId,
					'fisa-page-scope-id':pageScopeId,
					'bt-id':colDef.bt,
					'qt-id':qtId,
					'fieldId':colDef.field,
					'field-id':colDef.field,
					'actionMode':aditionalData.actionMode,
					'parentEditableGrid':true,
					'entityMrId':aditionalData.entityId,
					'notify-combo-id':aditionalData.notifyComboId,
					'baseClass': 'dijitTextBox dijitComboBox dijitDateTextBox',
					'tdParentWidth':aditionalData.tdParentWidth,
					'tabIndex':tabIndex,
					'gridRealRowIndex':gridRealRowIndex,
					'gridId':gridId,
					fisaFormat:aditionalData.format,
					fisaFormatPattern:aditionalData.formatPattern,
					inputInvalidLabel:aditionalData.inputInvalidLabel};
			if(aditionalData.visualSize!=null){
				_opts.visualSize=aditionalData.visualSize;
			}
			var outcome = new ec.fisa.widget.EnhancedDateTextBox(_opts);
			
			//Mantis 18937 CM No se ha implementado este codigo en estos componentes  
			//indicates that by a controller this component was disabled. for the ftm.
			var disabled = true;
			if(cAction=='IN'){
				disabled = aditionalData.ftmDisabledIn;
			}else if(cAction=='UP'){
				disabled = aditionalData.ftmDisabledUp;
			}
			aditionalData.insertAllowed = (disabled != true);
			aditionalData.updateAllowed = (disabled != true);
			
			this._defineReadOnly(outcome, cAction, aditionalData.insertAllowed, aditionalData.updateAllowed);	
			
			this._setInitValFromModel(colDef,isDirect,rowIndex,initVal,outcome.id,gridRealRowIndex);
			return outcome;	
		}
	},
	
	
	//set to the modle the widgetid and the initvalue of the component
	//is is direct put in the array of models.
	_setInitValFromModel:function(colDef,/*boolean*/isDirect,rowIndex,initVal,id,gridRealRowIndex){
		var pfx=[colDef.field];
		if(isDirect ===false){
			var _model=colDef.grid.model;
			if(!this.regexpr.test(colDef.field)){
				_model=colDef.grid.complementModel;
			}
			_model.removeObject(pfx);
			_model.appendObject(pfx,initVal,id,"value",null,null);
		}
		else{
			var _model=colDef.grid.model[gridRealRowIndex];
			if(!this.regexpr.test(colDef.field)){
				_model=colDef.grid.complementModel[gridRealRowIndex];
			}
			// JG: Solucion incidente mantis 18789
//			// mantis 18839 con la bandera en true obtiene le valor del modelo y actualiza a pantalla
			if(colDef.grid._fr){
				if(_model.contains(pfx)){
					initVal=_model.getValue(pfx);
				}
			}
			// JG: end 18789
			_model.removeObject(pfx);
			_model.appendObject(pfx,initVal,id,"value",null,null);
		}
		
	},
	
	_formatcolumn: function(tabId, pageScopeId, sts, aditionalData, data,rowIndex,colDef){
		if(aditionalData.hasLink){
			var value = data;
			if(aditionalData.format != 0){
				value = ec.fisa.format.utils.formatQtColumn(aditionalData.format, aditionalData.formatPattern, data);
			}
			return this.formatLink(aditionalData.btId, aditionalData.fieldId, tabId, pageScopeId, aditionalData.actionMode, aditionalData.entityId, aditionalData.tabIndex, value,rowIndex,colDef);
		}else {
			return ec.fisa.grid.utils.obtainMultiRegisterFormatValue(aditionalData,data);
			//return ec.fisa.format.utils.formatQtColumn(aditionalData.format, aditionalData.formatPattern, data);
		}
	},
	loadSelectData:function(tabId,pageScopeId,component){
		var controller = ec.fisa.controller.utils.getPageController(tabId,pageScopeId);
		return controller.loadSelectDataCmp(component);
	},
	formatLink:function(btId,fieldId,tabId,pageScopeId,actionMode,entityId,btPos,data,rowIndex,colDef){
		var value =colDef.grid.store.getValue(colDef.grid.getItem(rowIndex),fieldId+"--RTNLNK",null);
		if(value!=null&&value==="1"){
			return new ec.fisa.widget.MultiregisterLink({btId:btId,
				fieldId:fieldId,
				tabId:tabId,
				pageScopeId:pageScopeId,
				actionMode:actionMode,
				rowIndex:rowIndex,
				entityId:entityId,
				btPos:btPos,
				label:data});
		}
		return data;
	},
	_defineReadOnly:function(
			/*Componente visual que se pintará en el grid*/component,
			/*Puede ser IN, UP, QY, etc, etc*/requestedAction,
			/*boolean*/insertAllowed,
			/*boolean*/updateAllowed ){
		if("IN" === requestedAction){
			component.set("enabled", insertAllowed);
		}else if("UP" === requestedAction){
			component.set("enabled", updateAllowed);
		}
	},
	getNonEditableComponent:function(/*Object -data of the specific cell value*/data,rowIndex,colDef,/*Object, see DojoFisaNonEditableGrid.vm*/formatterData){
		if(formatterData.imageLinkRoutine != ''){
			//Formatea en caso de que tenga un link asociado a la columna
			return ec.fisa.grid.utils.formatLink(formatterData.btId,formatterData.fieldId,formatterData.tabId,formatterData.pageScopeId,formatterData.actionMode,formatterData.entityId,formatterData.tabIndex,data, rowIndex, colDef);
		}else if(formatterData.formType == '0'){
			//Cuando es complemento
			//return '&lt;b>'+data+'&lt;/b>';
			return '<b>'+data+'</b>';
		}else if(formatterData.formType == '8'){
			var outcome = new ec.fisa.widget.CheckBox({"fieldId":colDef.field,"value":data,"readOnly":true});
			return outcome;
		}else {
			if(data != undefined && data != null){
			return ec.fisa.grid.utils.obtainMultiRegisterFormatValue(formatterData,data);
			}else{
				return "";
			}
		}
	},
	
	/**Obtains the data formatted by Id*/
	obtainMultiRegisterFormatValue:function(formatterData,data){
		if(formatterData.dataType == 'Date' || formatterData.dataType == 'DateTime'){
			var fecha = ec.fisa.format.utils.getStrDateByFormatIdStrDate(data,formatterData.format);
			return	'<div style=\"text-align:center;\"> '+  fecha +'</div>'
		}
		else if(formatterData.dataType == 'BigDecimal'){
			return	'<div style=\"text-align:right;\"> '+  ec.fisa.format.utils.formatNumberByFormatType(data,formatterData.format) +'</div>'
		}
		return data;

	},
	formatFormGridCell:function(colDef){
		if(colDef.index == 0){
			colDef.customClasses.push("fisaComponentGridLeftCell");
		}else if(colDef.index == 1){
			colDef.customClasses.push("fisaComponentGridRightCell");
		}
	}
	
});
	fisaGrid.utils= new Utils;
	ec.fisa.grid.utils=fisaGrid.utils;
	return fisaGrid.utils;
});

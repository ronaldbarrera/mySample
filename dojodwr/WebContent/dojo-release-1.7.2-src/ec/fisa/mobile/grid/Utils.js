define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dojo/dom-construct",
	"ec/fisa/mvc/StatefulModel", 
	"ec/fisa/mobile/grid/_base"
	/*,
	"ec/fisa/grid/Utils"*/],
	function(dojo,declare,domContruct,StatefulModel,fisaGrid){
	
		var MobileUtils = declare("ec.fisa.mobile.grid.Utils", /*[ec.fisa.grid.Utils]*/null, {
			
		_formatcolumn: function(tabId, pageScopeId, sts, aditionalData, data,rowIndex,colDef){
			if(aditionalData.hasLink){
				var value = data;
				if(aditionalData.format != 0){
					value = ec.fisa.mobile.format.utils.formatQtColumn(aditionalData.format, aditionalData.formatPattern, data);
				}
				return this.formatLink(aditionalData.btId, aditionalData.fieldId, tabId, pageScopeId, aditionalData.actionMode, aditionalData.entityId, aditionalData.tabIndex, value,rowIndex,colDef);
			}else {
				return ec.fisa.grid.utils.obtainMultiRegisterFormatValue(aditionalData,data);
			}
		},
		
		/**Obtains the dojo widget by the field type.*/
		getMRComponentDirect:function(/*Object -data of the specific cell value*/data,
				rowIndex,colDef,fieldType,tabId,pageScopeId,qtId,/*String*/ gridId, /*Object {}*/aditionalData, tabIndex, recordId){
			if(colDef.grid.model == null || colDef.grid.model == undefined){
				colDef.grid.model=[];
			}
			if(colDef.grid.complementModel == null || colDef.grid.complementModel == undefined){
				colDef.grid.complementModel=[];
			}

			//index real cause in pagination starts over each page.
			var gridRealRowIndex = rowIndex;/*this.obtainInitialViewableMrIndex(colDef.grid)+rowIndex;*/
			
			if(colDef.grid.model[gridRealRowIndex] == undefined){
				colDef.grid.model[gridRealRowIndex] = new StatefulModel();
			}
			
			if(colDef.grid.complementModel[gridRealRowIndex] == undefined){
				colDef.grid.complementModel[gridRealRowIndex] = new StatefulModel();
			}
			
			if(aditionalData.actionMode == "QY" || aditionalData.actionMode == "DE"){
				//TODO: COMPLETAR ESTA PARTE DE CODIGO PARA QUE FUNCIONE COMO MOVIL
				/*if(data){
					if("ec.fisa.grid.FisaFormGrid" === colDef.grid.declaredClass && 0 === aditionalData.columnIndex){
						var outcome = '<label class="fisaLabel">' + data + '</label>';
						return outcome;
					}else if(fieldType == 3){
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
				}*/
				
			}else{
				return this.getMRComponentEditable(data,rowIndex,colDef,fieldType,tabId,pageScopeId,qtId,gridId,aditionalData,true, tabIndex, recordId);
			}
			
		},
		
		/** obtains the editable component for the row.*/
		getMRComponentEditable:function(/*Object -data of the specific cell value*/data,rowIndex,colDef,
				fieldType,tabId,pageScopeId,qtId,/*String*/ gridId, /*Object {}*/aditionalData,isDirect, tabIndex, recordId){
//			var recordId=colDef.grid.getItem(rowIndex);
			var _sts = colDef.grid.store.getValue(recordId,"rowSts");
			
			//index real cause in pagination starts over each page.
			var gridRealRowIndex = rowIndex;/*this.obtainInitialViewableMrIndex(colDef.grid)+rowIndex;*/
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
			var dataVal = colDef.grid.store.getValue(recordId,colDef.field);
			
			if("ec.fisa.mobile.widget.FormGrid" === colDef.grid.declaredClass && 0 === aditionalData.columnIndex){
				var outcome = domContruct.create("span",{'class':'fisaLabel',innerHTML:dataVal});
				return outcome;
			}
			fieldType = fieldType==7?1:fieldType;
			if(fieldType==1){
				if(aditionalData.multiLanguage == 1){
					var initObject = {
							'bt-id':colDef.bt,
							'fisatabid':tabId,
							'fisapageid':pageScopeId,
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
							/*'gridRealRowIndex':gridRealRowIndex,*/
							'tabIndexField':tabIndex,
							'parentType':colDef.ptype};
					
					if(aditionalData.visualSize!=null){
						initObject.visualSize=aditionalData.visualSize;
					}
					var outcome = new ec.fisa.widget.i18n.I18nTextBox(initObject);
					var pfx=[colDef.field];
					var initVal = null;
					if(isDirect==false){
						initVal=colDef.grid.model.getValue(pfx);
					}
					this._setInitValFromModel(colDef,isDirect,rowIndex,initVal,data,outcome.id,gridRealRowIndex);
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
							'fisatabid':tabId,
							'fisapageid':pageScopeId,
							'entityMrId':aditionalData.entityId,
							'gridId':gridId,
							'format':aditionalData.format,
							'tabIndexField':tabIndex
							/*,'gridRealRowIndex':gridRealRowIndex*/
							};
					
					if(aditionalData.visualSize!=null){
						initObject.visualSize=aditionalData.visualSize;
					}
					var outcome =new ec.fisa.mobile.widget.TextBox(initObject);
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
					var pfx=[colDef.field];
					var initVal = null;
					if(isDirect==false){
						initVal=colDef.grid.model.getValue(pfx);
					}
					this._setInitValFromModel(colDef,isDirect,rowIndex,initVal,data,outcome.id,gridRealRowIndex);
					return outcome;
				}
			} //moviles no soporta lov
			/*else if(fieldType==2){
				var pfx=[colDef.field];
				var initVal = null;
				if(isDirect==false){
				initVal=colDef.grid.model.getValue(pfx);
				}
				var _val="";
				if(!("" === initVal || null == initVal || typeof initVal === "undefined")){
					_val=initVal;
				}
				var _opts={selectLabel:"Seleccione ...",
						'fisatabid':tabId,
						'fisapageid':pageScopeId,
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
				var outcome =new ec.fisa.lov.ListOfValues(_opts);
				this._setInitValFromModel(colDef,isDirect,rowIndex,initVal,data,outcome.id,gridRealRowIndex);
				return outcome;
			} */else if(fieldType==3){
//				var ctrlr= ec.fisa.controller.utils.getPageController(tabId,pageScopeId);
//				var options=ctrlr.loadSelectData({'qt-id':qtId},true);
				var pfx=[colDef.field];
				var initVal = null;
				if(isDirect==false){
					initVal=colDef.grid.model.getValue(pfx);
				}
				else{
					initVal = data;
				}
				var initObject ={
						'qtId':qtId,
						'qt-id':qtId,
						'fieldId':colDef.field,
						'value':initVal,
						'fisatabid':tabId,
						'fisapageid':pageScopeId,
						'parentEditableGrid':true,
						'entityMrId':aditionalData.entityId,
						'notify-combo-id':aditionalData.notifyComboId,
						'parentGridId':gridId,
						'tdParentWidth':aditionalData.tdParentWidth,
						'field-id':colDef.field,
						'gridRealRowIndex':gridRealRowIndex,
						'tabIndexField':tabIndex,
						'bt-id':colDef.bt
						};
					if(aditionalData.visualSize!=null){
						initObject.visualSize=aditionalData.visualSize;
					}	
				
				var outcome = new ec.fisa.mobile.widget.Select(initObject);
				this._setInitValFromModel(colDef,isDirect,rowIndex,initVal,data,outcome.id,gridRealRowIndex);
				return outcome;
			} else if(fieldType==5){//Fechas
				var initObject={
						fieldId:colDef.field,
						fisaFormat:aditionalData.format,
						fisaFormatPattern:aditionalData.formatPattern,
						'fisatabid':tabId,
						'fisapageid':pageScopeId,
						'field-id':colDef.field,
						'bt-id':colDef.bt,
						'parentEditableGrid':true,
						'entityMrId':aditionalData.entityId,
						'notify-combo-id':aditionalData.notifyComboId,
						'tdParentWidth':aditionalData.tdParentWidth,
						'gridRealRowIndex':gridRealRowIndex,
						'tabIndexField':tabIndex,
						'baseClass':"dijitTextBox dijitComboBox dijitDateTextBox",
						inputInvalidLabel:aditionalData.inputInvalidLabel};
				if(aditionalData.visualSize!=null){
					initObject.visualSize=aditionalData.visualSize;
				}	
				var outcome = new ec.fisa.mobile.widget.DatePicker(initObject);
				var pfx=[colDef.field];
				var initVal = null;
				if(isDirect==false){
					initVal=colDef.grid.model.getValue(pfx);
				}
				this._setInitValFromModel(colDef,isDirect,rowIndex,initVal,data,outcome.id,gridRealRowIndex);
				return outcome;
			} 	//movil no muestra texbox, en lugar de ello se lo reemplaza por textbox
			/*else if(fieldType==7){
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
					var outcome = new ec.fisa.widget.i18n.I18nTextarea(initObject);
					var pfx=[colDef.field];
					var initVal = null;
					if(isDirect==false){
						initVal=colDef.grid.model.getValue(pfx);
						}
					this._setInitValFromModel(colDef,isDirect,rowIndex,initVal,data,outcome.id,gridRealRowIndex);
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
						//initObject.visualSize=aditionalData.visualSize;  ********************************
						//para hacer cuadrar en registro multieditable. temporal
						initObject.visualSize=2025;
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
					var pfx=[colDef.field];
					var initVal = null;
					if(isDirect==false){
						initVal=colDef.grid.model.getValue(pfx);
						}
					this._setInitValFromModel(colDef,isDirect,rowIndex,initVal,data,outcome.id,gridRealRowIndex);
					return outcome;
				}
			}*/
			//TODO: no esta completo el check box para moviles asi que se usa momentaneamente el de dojo
			else if(fieldType==8){
				
				var initObject={
						fieldId:colDef.field,
						'fisatabid':tabId,
						'fisapageid':pageScopeId,
						'field-id':colDef.field,
						'bt-id':colDef.bt,
						'parentEditableGrid':true,
						'notify-combo-id':aditionalData.notifyComboId,
						'tdParentWidth':aditionalData.tdParentWidth,
						'gridRealRowIndex':gridRealRowIndex,
						'tabIndex':tabIndex,
						inputInvalidLabel:aditionalData.inputInvalidLabel};
				
				var outcome = new dojox.mobile.CheckBox(initObject);
				this._defineReadOnly(outcome, cAction, aditionalData.insertAllowed, aditionalData.updateAllowed);
				var pfx=[colDef.field];
				var initVal = null;
				if(isDirect==false){
					initVal=colDef.grid.model.getValue(pfx);
				}
				this._setInitValFromModel(colDef,isDirect,rowIndex,initVal,data,outcome.id,gridRealRowIndex);
				return outcome;
			}else if(fieldType==0){
				//Es complemento
				var outcome = new ec.fisa.mobile.widget.OutputText({fieldId:colDef.field});
				var pfx=[colDef.field];
				var initVal=data;
				if(!("" === initVal || null == initVal || typeof initVal === "undefined")){
					outcome.set("value", initVal);
				}
				this._setInitValFromModel(colDef,isDirect,rowIndex,initVal,data,outcome.id,gridRealRowIndex);
				return outcome;
			}
			//no existe componente de enhanced date para moviles
			/*else if(fieldType == 30){//ENHANCED_DATE
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
						fisaFormat:aditionalData.format,
						fisaFormatPattern:aditionalData.formatPattern,
						inputInvalidLabel:aditionalData.inputInvalidLabel};
				if(aditionalData.visualSize!=null){
					_opts.visualSize=aditionalData.visualSize;
				}
				var outcome = new ec.fisa.widget.EnhancedDateTextBox(_opts);
				var pfx=[colDef.field];
				var initVal = null;
				if(isDirect==false){
				initVal=colDef.grid.model.getValue(pfx);
				}
				this._setInitValFromModel(colDef,isDirect,rowIndex,initVal,data,outcome.id,gridRealRowIndex);
				return outcome;	
			}*/
		}
		
	});
	fisaGrid.utils= new MobileUtils();
	ec.fisa.mobile.grid.utils=fisaGrid.utils;
	return MobileUtils;
});

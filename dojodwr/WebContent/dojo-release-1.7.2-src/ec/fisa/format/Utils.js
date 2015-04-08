define( [ "dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/lang", "dojo/number","dojo/dom-geometry", "dojo/on", "dojo/dom-construct", "dijit/form/TextBox","dijit/form/DateTextBox",
		  "ec/fisa/format/_base", "dojo/date/locale","ec/fisa/widget/Link","ec/fisa/widget/DocumentActions","dojo/data/ItemFileReadStore",
		  "ec/fisa/navigation/Utils","ec/fisa/controller/Utils","dojo/string","dijit/form/Select","dijit/form/Button","ec/fisa/widget/AgendaActions","ec/fisa/widget/Priority",
		  "dijit/form/CheckBox","ec/fisa/widget/NumberTextBox","ec/fisa/widget/EnhancedSchedulingDateTextBox", "ec/fisa/widget/QueryTemplateFieldRoutineLink",
		  "ec/fisa/widget/QueryTemplateFieldAliasLink",
		  "dijit/form/ValidationTextBox"
		  ], function(dojo, declare, lang, number,domGeometry, on, domConstruct,
				  textBox, dateTextBox, fisaFormat, dateLocale,fisaLink, DocumentActions, ItemFileReadStore,
				  navigationUtils, controllerUtils,dstring) {

	var Utils = declare("ec.fisa.format.Utils", null, {
		
		JDBCtimestampFormat:'yyyy-MM-dd HH:mm:ss.S',
		
		formatQtParameter:function(valueToFormat,options){
			if('format' in options){
				if(options.format == 0){
					return ec.fisa.format.utils.formatDefaultDate(valueToFormat);
				}else{
					return ec.fisa.format.utils.formatQtColumn(options.format, options.formatPattern, valueToFormat);
				}
			}
			return valueToFormat;
		},
		
		formatField : function (format, formatPattern, valueToFormat, rowIndex, actionToInvoke,description, tabId, pageScopeId, formatterData) {
		
			if(isNaN(format)){
				var outcome = "";
				if (valueToFormat != null){
					outcome = valueToFormat;
				}
				return outcome;
			}else if(format==1||format==2 || format==3){
				if(valueToFormat==null){
					return "";
				}
				var dateValue = this.parseLongDate(valueToFormat);
				return dateLocale.format(dateValue,{datePattern:formatPattern,selector:"date",locale:dojo.config.fisaCurrentLocale});
			} else if(format==4||format==6 || format==5){
				if(valueToFormat==null){
					return "";
				}
				return this.formatNumber(valueToFormat,formatPattern);
			} else if(format==8){
				if(valueToFormat==null){
					return "";
				} else if (valueToFormat=="0"){
					return "<input type=\"checkbox\" disabled=\"true\" disabled=\"true\"  />";
				}			
				return "<input type=\"checkbox\" disabled=\"true\" checked=\"checked\" />";
			} else if(format==26){
				if(valueToFormat==null||valueToFormat=="0"||valueToFormat==""){
					return "";
				}
				return "<span class=\"qtCellChecked\"/>";
			} else if(format==27){
				if(valueToFormat==null||valueToFormat=="0"||valueToFormat==""){
					return "";
				}
				var noImagePath = dojo.config.fisaContextPath + "/imageNotFound.jpg";
				var onerrorCall = "this.src = '" + noImagePath + "'";
				var imagePath = dojo.config.fisaContextPath + "/fisaImages/"+valueToFormat;
				//formatPattern -> url of the image came from componentfactory
				//var img =domConstruct.create("img",{src:imagePath,alt:description, title:description, onerror:onerrorCall});
				return "<img src=\""+ imagePath+"\"  alt=\""+description+"\" title=\""+description+"\" onerror=\""+onerrorCall+"\" width=\"16\" height=\"16\" "+"style=\" {border:0px}  \""  +" />";
			} else {
				return null;
			}
			
		},

		formatQtColumn : function(format, formatPattern, valueToFormat, rowIndex, actionToInvoke,description, tabId, pageScopeId, formatterData) {
			//aditionalData se usa en las rutinas de campo de qts JCVQ cuando format es -4
			var aditionalData = formatterData || {};
			try{
				
				//hw: mantis 18282 Si es oculto no muestre nada
			if(formatterData.colDef._props.hidden == true){
				return "";
			}	
				
			
			var formatValue = this.formatField(format, formatPattern, valueToFormat, rowIndex, actionToInvoke,description, tabId, pageScopeId, formatterData);
			if (formatValue != null) {
				return formatValue;
			}
			
			
			if(format<0){
				var controller = ec.fisa.controller.utils.getPageController(tabId, pageScopeId);
				var linkAttrs= {
						fakeBtn:{
							fc:controller,
							'tabId':tabId,
							'pageScopeId':pageScopeId},
						fisaScopeSelectedId:rowIndex,
						fisaScopeSelectedAction:actionToInvoke,
						onClick:function(){
							this.fakeBtn.fc.executeAction.call(this.fakeBtn,dijit.byId(this.fakeBtn.fc.qtGridId).qtId,this.fisaScopeSelectedAction,this.fisaScopeSelectedId);
						}};
				if(format==-1){
					//PromptLink
					linkAttrs.title=description||"";
					linkAttrs.label=valueToFormat||"";
					var outcome = new fisaLink(linkAttrs);
					return outcome;
				} else if(format==-3){
					//TextLink
					linkAttrs.title=description||"";
					linkAttrs.label=formatPattern||"";
					return new fisaLink(linkAttrs);
				} else if(format==-2){
					//Image
					var outcome= new fisaLink(linkAttrs);
					var noImagePath = dojo.config.fisaContextPath + "/imageNotFound.jpg";
					var onerrorCall = "this.src = '" + noImagePath + "'";
					//formatPattern -> url of the image came from componentfactory
					domConstruct.create("img",{src:formatPattern,alt:description, title:description, onerror:onerrorCall,"style":{"display": "block", "margin": "auto" , 'width':'16px', 'height':'16px','border':'0px'}},outcome.containerNode);
					return outcome;
				}else if(format == -4){//Link de imagen o pdf
					return this.formatQueryTemplateFieldRoutineLink(format, formatPattern, valueToFormat, rowIndex, actionToInvoke,description, tabId, pageScopeId, formatterData);
				}else if(format == -5){//Link de alias de cuentas
					var linkData = {
							'fieldId':aditionalData.fieldId,
							'tabId': tabId,
							'pageScopeId':pageScopeId,
							'valueToFormat': valueToFormat,
							'rowIndex': rowIndex,
							'gridId': aditionalData.colDef.grid.id,
							'colDef':aditionalData.colDef,
							'originalValueIndex':aditionalData.colDef.grid.originalValueIndex,
							'maskId': formatPattern,
							'substitutionFdk':aditionalData.colDef.grid.substitutionFdk};	
					return ec.fisa.format.utils.formatQueryTemplateFieldAliasLink(linkData);
				}
			}
			}
			catch(e){
				//console.log("FALLO EN ...format.Utils metodo formatQtColumn. Valor a ser formateado: "+valueToFormat+" format: "+format);
				//console.log(e);
				valueToFormat  = valueToFormat;
			}
			return valueToFormat;
		},
		formatQueryTemplateFieldRoutineLink:function(format, formatPattern, valueToFormat, rowIndex, actionToInvoke,description, tabId, pageScopeId, aditionalData){
			if (aditionalData.rowRoutine.length > 0 ) {
								
				var colDef = aditionalData.colDef;					
				var rowRoutine = colDef.grid.store.getValue(colDef.grid.getItem(rowIndex),aditionalData.rowRoutine);
												
				if (rowRoutine == null || rowRoutine == '0') {
					var formatValueLink = this.formatField(aditionalData.defaultFormat, formatPattern, valueToFormat, rowIndex, actionToInvoke,description, tabId, pageScopeId, formatterData);
					
					if (formatValueLink != null) {
						return formatValueLink;
					} else {
						return valueToFormat;
					}
				}			
			}		
				
			var linkData = {
				'fieldId':aditionalData.fieldId,
				'tabId': tabId,
				'pageScopeId':pageScopeId,
				'valueToFormat': valueToFormat,
				'rowIndex': rowIndex,
				'colDef':aditionalData.colDef,
				'routine': aditionalData.routine};
			return ec.fisa.format.utils.formatQueryTemplateFieldLink(linkData);							
		}
		,
		formatQueryTemplateFieldAliasLink:function(linkData){
			var colDef = linkData.colDef;
			var value = colDef.grid.store.getValue(colDef.grid.getItem(linkData.rowIndex),linkData.fieldId);
			var outcome;
			if(value){
				outcome = new ec.fisa.widget.QueryTemplateFieldAliasLink({
					'fieldId':linkData.fieldId,
					'tabId':linkData.tabId,
					'pageScopeId':linkData.pageScopeId,
					'rowIndex':linkData.rowIndex,
					'label':linkData.valueToFormat,
					'maskedValue':value,
					'gridId':linkData.gridId,
					'originalValueIndex':linkData.originalValueIndex,
					'maskId':linkData.maskId,
					'substitutionFdk':linkData.substitutionFdk
				});
			}else{
				outcome = linkData.valueToFormat;
			}
			return outcome;
			
			
		},
		//string must comply with this pattern 'yyyy-MM-dd HH:mm:ss.S'
		parseLongDate:function(strValue){
			if(strValue!=null){
				var n=strValue.lastIndexOf(".");
				if(n>=0&&strValue.length>=(n+2)){
					strValue=strValue.substring(0,n+2);
				} else if(n>=0&&strValue.length>=(n+1)){
					strValue=strValue.substring(0,n+1)+"0";
				}
			}
			return dateLocale.parse(strValue,{datePattern:this.JDBCtimestampFormat,selector:"date",locale:dojo.config.fisaCurrentLocale});
		},

		//
		getStrDatebyFormatId:function(value, formatId){
			var result ='';
			var pattern= '';
			if(value && value!= ""){
				if(formatId==1){
					pattern= dojo.config.fisaShortDatePattern;
				}else if(formatId==2){
					pattern= dojo.config.fisaLongDatePattern;
				}else{
					pattern= dojo.config.fisaDateTimePattern;
				}
				if(typeof value == 'string'){
					 var v=dateLocale.parse(value,{datePattern:pattern,selector:"date",locale:dojo.config.fisaCurrentLocale});
					 if (v != null) {
						 result = dateLocale.format(v,{datePattern:this.JDBCtimestampFormat,selector:"date",locale:dojo.config.fisaCurrentLocale});
					 } else {
						 result=value;
					 }
					
				}else{
					result=value;
				}
			}
			return result;
		},
		
		formatLongDate:function(value){
			return dateLocale.format(value,{datePattern:this.JDBCtimestampFormat,selector:"date",locale:dojo.config.fisaCurrentLocale});
		},
//		formatDefaultDate:function(value){
//			if(value && value!= ""){
//				var valueToFormat = new Date(value);
//				return dateLocale.format(valueToFormat,{datePattern':"yyyy-MM-dd HH:mm:ss.S",'selector':'date','locale':dojo.config.fisaCurrentLocale});
//			}
//			return null;
//		},
		formatDate : function( format, component) {
			var value = component.ref.data;
			if(value && value!= ""){
				var valueToFormat = this._parseDate(value);
				return dateLocale.format(valueToFormat,{datePattern:format,selector:"date",locale:dojo.config.fisaCurrentLocale});
			}
			return "";
		},
		
		/**the value must come in format: //string must comply with this pattern 'yyyy-MM-dd HH:mm:ss.S' */
		getStrDateByFormatIdStrDate:function(/*String*/ value,formatId){
			//first move to js date object.
			var fechaDate = this.parseLongDate(value);
			var fechaStr = this.formatDateByFormatId(fechaDate,formatId);
			return fechaStr;
		},
		
		
		formatDateByFormatId: function(value,formatId){
			var result =value;
			var pattern= '';
			if(value && value!= ""){
				if(typeof value == 'string'){
					value=this.parseLongDate(value);
				}
				if(formatId==1){
					pattern= dojo.config.fisaShortDatePattern;
				}else if(formatId==2){
					pattern= dojo.config.fisaLongDatePattern;
				}else{
					pattern= dojo.config.fisaDateTimePattern;
				}
				if(value != null && value != undefined){
					result = dateLocale.format(value,{datePattern:pattern,selector:"date",locale:dojo.config.fisaCurrentLocale});
				}
				
			}
			return result;
		},

		formatDateForStringValue: function (format, value){
			if(value && value!= ""){
				var valueToFormat = dateLocale.parse(value,{selector: 'date', datePattern: this.JDBCtimestampFormat, locale: dojo.config.fisaCurrentLocale});
				if (valueToFormat == null) {
					return value;
				}
				return dateLocale.format(valueToFormat,{datePattern:format,selector:"date",locale:dojo.config.fisaCurrentLocale});
			}
			return "";
		},

		formatDataGridDate : function( value, rowIndex,column) {
			var format = column.grid.shortDateFormatTree;
			if(value && value!= ""){
				 var dateValue = this._parseDate(value);
				return dateLocale.format(dateValue,{datePattern:format,selector:"date",locale:dojo.config.fisaCurrentLocale});
			}
			return "";
		},

		
		/**parses date if value cames a date just return it.*/
		_parseDate:function(value){
			if(value instanceof Date){
				return value;
			}
			if(typeof value == "string" || value instanceof String){
				return this.parseLongDate(value);
			}
			return value;
		},
		

		// formatter que genera el combo
		formatterCombo : function(value, idx, treepath,/*column*/p4){
			// obtains the row.
			var treeGrid = p4.grid;
			var rowGridItem=p4.grid.getItem(treepath);
			// 4 indica en el objeto treegrid node el tipo y es el tipo
			var comboOptionsTemp = p4.grid.comboStatusOptions;
			// documento
			if(rowGridItem.type != 4){
				return "";
			}
			
			var comboOptions = [];
			if(rowGridItem.notApplicable != null && rowGridItem.notApplicable[0] == false){
				for(var i=0;i< comboOptionsTemp.length ;i++){
					if("7" != comboOptionsTemp[i].value){
						comboOptions.push(comboOptionsTemp[i]);
					}
				}
			}
			else{
				comboOptions = comboOptionsTemp;
			}
			
			if(value){			
				if(idx >= 0) {

					if(p4.grid.isDisabled == true) {
						for(var i=0;i< comboOptions.length ;i++){
							if(value == comboOptions[i].value){
								return  comboOptions[i].label;
							}
						}
						return value;
					}

					// var id = jsonStore.getIdentity(grid.getItem(treepath));
					var data2 = {
							identifier: "value",
							label: "label",
							items: comboOptions
					};
					var readStore = new ItemFileReadStore({data:dojo.clone(data2)});
					// it uses store, cause it was imposible with options to
					// select an initial value.
					var selectObj = new dijit.form.Select({store: readStore,value:value});
					selectObj.fisaRowItem = rowGridItem;
					selectObj.tabId = treeGrid.tabIdvar;
					selectObj.pageScopeId = treeGrid.pageScopeIdvar;
					selectObj.humanChanged = true;
					selectObj.treeGridId = treeGrid.id;

					selectObj.connect(selectObj,"onChange",function(value){
						if(this != window){
							// el this es del scope del select. y obtiene
							// fisaRowItem que agregue al objeto especificodijit.form.CheckBox
							// anterior.
							
							var oldStatus = ""+this.fisaRowItem.status[0];
							if(value != oldStatus){
							
							var callObj = {
										callbackScope : this
								};
								callObj.errorHandler = dojo.hitch(this,this.errorHandler);
								callObj.callback = ec.fisa.format.utils.callBckFnctnSelectDocDwr;
								DocumentControllerDWR.updateDocumentStatus(this.fisaRowItem.id[0], this.tabId, this.pageScopeId, value,oldStatus,callObj);
							//this.fisaRowItem.status = value;
							}
						}
					});
					selectObj.startup();
					return selectObj;
				}else{
					// for summary cell
					return "";
				}
			}
		},
		
		/**called after the combo of the documents is changed and processed*/
		callBckFnctnSelectDocDwr:function(outcome){
			//fix to avoid called onchange two times.
			this._lastValueReported = outcome.RESPONSE_DOC_STATUS;
			if(outcome.details != undefined && outcome.details != null){
			var treeGrid = dijit.byId(this.treeGridId);
			outcome.details.status = parseInt(outcome.RESPONSE_DOC_STATUS);
			ec.fisa.controller.utils.updateRowTreeGrid(treeGrid, outcome);
			}
			else{
				this.set("value",outcome.RESPONSE_DOC_STATUS,false);
			}
		},
		
		
		

		// formatter que genera el checkbox
		formatterBooleanCheckbox : function(value, idx, treepath,p4){
			var treeGrid = p4.grid;
			var rowGridItem=p4.grid.getItem(treepath);
			// 4 indica en el objeto treegrid node el tipo y es el tipo
			// documento
			if(rowGridItem.type != 4){
				return "";
			}

			if(value != null){			
				if(idx >= 0) {

					var checkBox = new dijit.form.CheckBox({
						value: value,
						checked: value,
						disabled:true
					});
					checkBox.fisaRowItem = rowGridItem;
					checkBox.tabId = treeGrid.tabIdvar;
					checkBox.pageScopeId = treeGrid.pageScopeIdvar;
					checkBox.connect(checkBox,"onChange",function(value){
						if(this != window){
							if(this.fisaRowItem.required != value){
							this.fisaRowItem.required = value;
							DocumentControllerDWR.updateDocumentRequired(this.fisaRowItem.id[0], this.tabId, this.pageScopeId, value);
							}
						}
					});
					return checkBox;
				}else{
					// for summary cell
					return "";
				}
			}
		},

		// formatter que genera el checkbox
		formatterDataGridBooleanCheckbox : function(value, idx, allContent, disable, attribute){
			if(value != null){			
				if(idx >= 0) {
					var taskId =	allContent.grid.getItem(idx);
					var checkBox = new dijit.form.CheckBox({
						name: "checkBox",
						value: value,
						checked: value,
						disabled:disable
					});
					checkBox.onChange=function(value){
						if(this != window){
							var store = allContent.grid.store;
							var rowItem =	store._entries[taskId].data;
							rowItem[attribute] = value;
							store.setValue(taskId, attribute, value);
							this.value = value;
							this.checked = value;
						}
					};
					return checkBox;
				}else{
					// for summary cell
					return "";
				}
			}
		},

		// formatter que formatea la fecha del treegrid.
		formatterMaxDeliveryDate : function(value, idx, treepath,column){
			var treeGrid = column.grid;
			var rowGridItem=column.grid.getItem(treepath);
			// 4 indica en el objeto treegrid node el tipo y es el tipo
			// documento
			if(value){			
				if(idx >= 0) {
					if(rowGridItem.type != 4){
						return "";
					}
					
					if(rowGridItem.type == 4 && rowGridItem.prolongable == 'false' && rowGridItem.required == 'false'){
						 var dateValue = this._parseDate(value);
						return dojo.date.locale.format(dateValue, {datePattern: column.grid.cusDateFormat, selector: "date",locale:dojo.config.fisaCurrentLocale});
					}

					if(rowGridItem.type == 4 && rowGridItem.prolongable == 'true' && rowGridItem.required == 'false'){

						if(column.grid.isDisabled == true) {
							var dateValue = this._parseDate(value);
							return dojo.date.locale.format(dateValue, {datePattern: column.grid.cusDateFormat, selector: "date",locale:dojo.config.fisaCurrentLocale});;
						}
						
						var datTxtBox = new dateTextBox({
							value: value,
							constraints:{datePattern:column.grid.cusDateFormat},
							fisaRowItem:rowGridItem
						});
						
						datTxtBox.tabId = treeGrid.tabIdvar;
						datTxtBox.pageScopeId = treeGrid.pageScopeIdvar;
						
						datTxtBox.connect(datTxtBox,"onBlur",function(){
							if(this != window){
								if((this.fisaRowItem.maxDeliveryDate != null && this.fisaRowItem.maxDeliveryDate[0] != this.displayedValue) || (this.fisaRowItem.maxDeliveryDate == null)){
								this.fisaRowItem.maxDeliveryDate= [this.displayedValue];
								var date = dateLocale.parse(this.displayedValue,{datePattern:this.constraints.datePattern,selector:"date",locale:dojo.config.fisaCurrentLocale});
								
								DocumentControllerDWR.updateDocumentMaxDeliveryDate(this.fisaRowItem.id[0], this.tabId, this.pageScopeId, date);
								}
								}});

						return datTxtBox;
					}
				}
			}
			return "";
		},

		// formatter que formatea la fecha del treegrid.
		formatterRecepcionDate : function(value, idx, treepath,column){
			var rowGridItem=column.grid.getItem(treepath);
			// 4 indica en el objeto treegrid node el tipo y es el tipo
			// documento
			if(rowGridItem.type == 4){
				if(value){			
					if(idx >= 0) {
						var dateValue = this._parseDate(value);
						return dojo.date.locale.format(dateValue, {datePattern: column.grid.cusDateFormat, selector: "date",locale:dojo.config.fisaCurrentLocale});
					}else{
						// for summary cell
						return "";
					}
				}
			}
			return "";
		},

		// formatter que formatea la fecha del treegrid.
		formatterExpiracionDate : function(value, idx,
				treepath, column) {
			var treeGrid = column.grid;
			var rowGridItem = column.grid.getItem(treepath);
			// 4 indica en el objeto treegrid node el tipo y es
			// el tipo
			// documento
			if (value) {
				if (idx >= 0) {
					if (rowGridItem.type == 4
							&& rowGridItem.changed == 'false'
								&& rowGridItem.expires == 'true') {

						var dateValue = this._parseDate(value);
						return dojo.date.locale.format(dateValue, {
							datePattern : column.grid.cusDateFormat,
							selector : "date",
							locale:dojo.config.fisaCurrentLocale
						});

					}
					if (rowGridItem.type == 4
							&& rowGridItem.changed == 'true'
								&& rowGridItem.expires == 'true') {

						if(column.grid.isDisabled == true) {
							var dateValue = this._parseDate(value);
							return dojo.date.locale.format(dateValue, {datePattern: column.grid.cusDateFormat, selector: "date",locale:dojo.config.fisaCurrentLocale});;
						}
						
						
						var datTxtBox = new dateTextBox({
							value: value,
							constraints:{datePattern:column.grid.cusDateFormat},
							fisaRowItem:rowGridItem
						});
						datTxtBox.tabId = treeGrid.tabIdvar;
						datTxtBox.pageScopeId = treeGrid.pageScopeIdvar;
						datTxtBox.connect(datTxtBox,"onBlur",function(){
							if(this != window){
								if((this.fisaRowItem.expirationDate != null && (this.fisaRowItem.expirationDate[0]!= this.displayedValue)) ||  this.fisaRowItem.expirationDate == null){
								this.fisaRowItem.expirationDate= [this.displayedValue];
								var date = dateLocale.parse(this.displayedValue,{datePattern:this.constraints.datePattern,selector:"date",locale:dojo.config.fisaCurrentLocale});
								DocumentControllerDWR.updateDocumentExpirationDate(this.fisaRowItem.id[0], this.tabId, this.pageScopeId, date);
								}
							}});

						return datTxtBox;
					}
				}
			}

			return "";
		},

		// formatter que formatea las opciones del treegrid
		formatterDocumentsOptions : function(value, idx, treepath,column){

			var treeGrid = column.grid;
			var rowGridItem=treeGrid.getItem(treepath);
			var labels =treeGrid.labelsColm;
			var contextPath = dojo.config.fisaContextPath;
			var descargaHref = contextPath + "/pages/DocumentDownload/FISATabId/" + treeGrid.tabIdvar+"/FisaPageScopeId/"+treeGrid.pageScopeIdvar+"/TREEGRID_NODE_ID/"+ rowGridItem.id[0];
			var previewHref=contextPath + "/pages/DocumentView/FISATabId/" + treeGrid.tabIdvar+"/FisaPageScopeId/"+treeGrid.pageScopeIdvar+"/TREEGRID_NODE_ID/"+ rowGridItem.id[0];



			if(rowGridItem.type != 4){
				return "";
			}

			var descargaVisible=false;
			var undoVisible=false;
			var historyVisible=false;
			var previewVisible=false;

			if(rowGridItem.fileUploaded == 'true'){
				//se elimina esta opcion por peticion de Sofia Mosquera. 22 enero 2014.
				//se presenta siempre descarga visible. 
				// sin importa el modo que se abre los documentos.
				
//				if(column.grid.isDisabled == false) {
					descargaVisible = true;
//				}
				
				
				previewVisible = true;
			}
			if(rowGridItem.changed == 'true'){
				undoVisible = true;
			}
			if(rowGridItem.historial == 'true'){
				historyVisible = true;
			}

			if(idx >= 0) {



				var docActionWgdt = new DocumentActions({
					rowItemData:rowGridItem,
					descargaHref:descargaHref,
					previewHref:previewHref,
					labels:labels,
					treeGrid:column.grid,
					descargaVisible:descargaVisible,
					undoVisible:undoVisible,
					historyVisible:historyVisible,
					previewVisible:previewVisible,
					descargaTitle:labels["treeTableDownload"],
					undoAction:function(){
						// se llema dentro del contexto this del
						// documentactions donde fue invocado
						return	ec.fisa.navigation.utils.undoTreeGridAction(this.labels, this.treeGrid , this.rowItemData);
					} ,
					historyAction:function(){
						// se llema dentro del contexto this del
						// documentactions donde fue invocado
						return	ec.fisa.navigation.utils.historyTreeGridAction( this.treeGrid,this.rowItemData);
					} ,

					undoTitle:labels["treeTableUndo"],
					historyTitle:labels["treeShowHistory"],
					previewTitle:labels["treeDocumentViewer"]

				});
				return docActionWgdt;
			}	
			return "";
		},


		// formatter que formatea las opciones del datagrid de
		// historial de documentos.
		formatterDocumentsHistoryOptions : function(value, idx, column){


			var dataGrid = column.grid;
			var rowGridItem=dataGrid.getItem(idx);
			var labels =dataGrid.labels;
			var contextPath = dojo.config.fisaContextPath;

			var descargaHref = contextPath + "/pages/DocumentHistoryDownload/FISATabId/" + 
			dataGrid.tabIdvar+"/FisaPageScopeId/"+dataGrid.pageScopeIdvar+"/REQUEST_DOC_HISTORY_NODE_ID_DOC/"+ rowGridItem.documentId[0]
			+"/REQUEST_DOC_HISTORY_NODE_ID_RECORD/"+rowGridItem.recordNumber[0];

			var previewHref=contextPath + "/pages/DocumentHistoryViewDownload/FISATabId/" +
			dataGrid.tabIdvar+"/FisaPageScopeId/"+dataGrid.pageScopeIdvar+"/REQUEST_DOC_HISTORY_NODE_ID_DOC/"+ rowGridItem.documentId[0]
			+"/REQUEST_DOC_HISTORY_NODE_ID_RECORD/"+rowGridItem.recordNumber[0];

			var descargaVisible=true;
			var undoVisible=false;
			var historyVisible=false;
			var previewVisible=true;

			if(idx >= 0) {
				var docActionWgdt = new DocumentActions({
					rowItemData:rowGridItem,
					descargaHref:descargaHref,
					previewHref:previewHref,
					labels:labels,
					treeGrid:dataGrid, // maintains the name of
					// the previous
					// treegrid, but it is a
					// datagrid
					descargaVisible:descargaVisible,
					undoVisible:undoVisible,
					historyVisible:historyVisible,
					previewVisible:previewVisible,
					descargaTitle:labels["treeTableDownload"],
					undoTitle:labels["treeTableUndo"],
					historyTitle:labels["treeShowHistory"],
					previewTitle:labels["treeDocumentViewer"]

				});
				return docActionWgdt;
			}	
			return "";
		},



		// formatter que formatea el detalle del treegrid. de
		// documentos
		formatterDetail : function(value, idx, treepath,column){
			var rowGridItem=column.grid.getItem(treepath);
			// 4 indica en el objeto treegrid node el tipo y es el tipo
			// documento
			if(rowGridItem.type == 0){
				if(value){			
					if(idx >= 0) {
						return value;
					}else{
						// for summary cell
						return "";
					}
				}
			}
			return "";
		},

		cloneRowFunction:function (fisaRowItem ,/* object */ pageScopeVars){
			var cloneRowItem = ec.fisa.format.utils.simpleCloneRowFunction(fisaRowItem);
			cloneRowItem.actionId=pageScopeVars.actionId;
			cloneRowItem.btId=pageScopeVars.btId;
			cloneRowItem.tabId=pageScopeVars.tabId;
			cloneRowItem.pageScopeId=pageScopeVars.pageScopeId;
			return cloneRowItem;

		},
		
		
		simpleCloneRowFunction:function(fisaRowItem){
			var cloneRowItem = {};
			cloneRowItem.changed=fisaRowItem.changed;
			cloneRowItem.children=fisaRowItem.children;
			cloneRowItem.complement=fisaRowItem.complement;
			cloneRowItem.daysValid=fisaRowItem.daysValid;
			cloneRowItem.description=fisaRowItem.description;
			cloneRowItem.expirationDate=fisaRowItem.expirationDate;
			cloneRowItem.expires=fisaRowItem.expires;
			cloneRowItem.historial=fisaRowItem.historial;
			cloneRowItem.id=fisaRowItem.id;
			cloneRowItem.maxDeliveryDate=fisaRowItem.maxDeliveryDate;
			cloneRowItem.prolongable=fisaRowItem.prolongable;
			cloneRowItem.receptionDate=fisaRowItem.receptionDate;
			cloneRowItem.required=fisaRowItem.required;
			cloneRowItem.status=fisaRowItem.status;
			cloneRowItem.type=fisaRowItem.type;
			return cloneRowItem;
			
		},


		// formatter que genera el combo
		linkPopUpFormatter: function(value, idx,/* array matrix of the path */ treepath,column){

			var dataGridRowItem=column.grid.getItem(treepath);

			var pageScopeVars = {
					tabId : column.grid.tabIdvar,
					btId : column.grid.btIdvar,
					actionId : column.grid.actionIdvar,
					pageScopeId : column.grid.pageScopeIdvar		
			};
			var contextPath = dojo.config.fisaContextPath;
			if(dataGridRowItem.type == 4)
				if(value){			
					if(idx >= 0) {

						if(column.grid.isDisabled == true) {
							return value;
						}
						var linkFisa = new fisaLink({label: value});
						linkFisa.pageScopeVars = pageScopeVars;
						linkFisa.fisaRowItem = dataGridRowItem;
						linkFisa.treeGrid = column.grid;
						on(linkFisa,"click",function(){

							var cloneRowItem = ec.fisa.format.utils.cloneRowFunction(this.fisaRowItem, this.pageScopeVars);
							// alert(this.fisaRowItem);
							// var dataRow= {id:this.fisaRowItem.id, }
							delete cloneRowItem._0;
							delete cloneRowItem._RRM;
							delete cloneRowItem._S;
							ec.fisa.navigation.utils.openFisaDialog(column.titlePopUp, contextPath+"/pages/static/documents/file_upload.jsp",cloneRowItem,this.treeGrid);
						});
						return linkFisa;
					}else{
						// for summary cell
						return value;
					}
				}

			return value;
		}, 
		formatterAgendaActions : function(value, idx, allContent,botonLabel,texto,tabId,pageScopeId){
			var taskId =	allContent.grid.getItem(idx);
			var rowItem =	allContent.grid.store._entries[taskId].data;
			// var actionsStr=dojo.toJson(rowItem.taskActions);
			var sel=new ec.fisa.widget.AgendaActions(
					{
						tarea:rowItem,
						botonNodeLabel : botonLabel, 	
						textoNodeMensaje: texto,
						tabId:tabId ,
						pageScopeId: pageScopeId
					});
			return sel;
		},
		formatterAgendaPriority : function (value, idx, allContent, tabId,pageScopeId, readMode){
			var taskId =	allContent.grid.getItem(idx);
			var rowItem =	allContent.grid.store._entries[taskId].data;
			var sel=new ec.fisa.widget.Priority(
					{	
						initialPriorityValue:value,
						tarea:rowItem,
						tabId:tabId ,
						pageScopeId: pageScopeId,
						readOnlyMode: readMode
					});
			return sel;
		},
				
		
		formatterAgendaLink: function(value, idx, allContent, tabId, pageScopeId){
			var taskId =	allContent.grid.getItem(idx);
			var rowItem =	allContent.grid.store._entries[taskId].data;
			var outcome = this.defineAgendaLink(value, taskId, rowItem, tabId, pageScopeId);
			return outcome;
		},defineAgendaLink:function(value, taskId, rowItem, tabId, pageScopeId){
			var outcome;
			if(rowItem.hasUrl == true && !(rowItem.canBeDispatched == true)){
				outcome = value;
			} else {
				if(value == null || value == undefined){
					value = "..."
				}
				outcome = new fisaLink({label: value});
				outcome.tabId=tabId;
				outcome.pageScopeId = pageScopeId;
				outcome.connect(outcome,"onClick",function(){
					var controllerInstance = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
					//controllerInstance.tabId = tabId;// Setea el id del tab,
					// usado al cerrar el
					// formulario de tareas
					// creadas o editadas
					controllerInstance.processLinkAction(taskId, rowItem);
				});
			}
			return outcome;
		},



		// formatter que formatea el detalle del treegrid. de documentos
		formatterPopUpKeywords : function(value, idx,column){
			var rowGridItem=column.grid.getItem(idx);
			// 4 indica en el objeto treegrid node el tipo y es el tipo
			// documento

			if(idx >= 0) {
				var dateNew = null;
				if(value){
					
					if(typeof value === "string" && value.indexOf("/") != -1){
					// only in this case, cause it comes in a text that new Date
					// dont recognize.
					var tempArray=	value.split("/");
					var day = tempArray[0];
					var month = tempArray[1]-1; // months init from 0. strangely
					// string can be converted to
					// int when applied math
					// operations
					var year = tempArray[2];
					dateNew = new Date(year,month,day);
					}
				}
				if(rowGridItem.keyDataType[0] == "2"){

					var datTxtBox = new ec.fisa.widget.EnhancedSchedulingDateTextBox({
						value: dateNew,
						constraints:{datePattern:column.shortDateFormatTree},
						fisaRowItem:rowGridItem,
						"fisa-tab-id":column.grid.tabId,
						"fisa-page-scope-id":column.grid.pageScopeId,
						inputInvalidLabel:column.grid.inputInvalidValueLabel
					});
					datTxtBox.connect(datTxtBox,"onChange",function(){
						if(this != window){
							this.fisaRowItem.value= [this.displayedValue];
						}});

					return datTxtBox;

				}	//textbox
				else if(rowGridItem.keyDataType[0] == "1"){
					var txtBox = new textBox({
						value: value,
						fisaRowItem:rowGridItem
					});
					txtBox.connect(txtBox,"onBlur",function(){
						if(this != window){
							this.fisaRowItem.value= [this.displayedValue];
						}});

					return txtBox;
				}
				//number
				else if(rowGridItem.keyDataType[0] == "3"){
					var txtBox = new ec.fisa.widget.NumberTextBox({
						value: value,
						fisaRowItem:rowGridItem,
						baseClass: "dijit dijitReset dijitInline dijitLeft dijitTextBox dijitNumberTextBox"
					});
					txtBox.connect(txtBox,"onChange",function(value){
						if(this != window){
							this.fisaRowItem.value= [value];
						}});

					return txtBox;
				}
				return value;
			}
			else{
				return "";	
			}

		},
		
		
		
		// formatter que formatea el checkbox para calendarizacion los medios de contacto.
		formatterMediaNotificationValue : function(value, idx,column){
			var rowGridItem=column.grid.getItem(idx);
			// 4 indica en el objeto treegrid node el tipo y es el tipo
			// documento

			if(idx >= 0) {
				if(value == null || value == undefined ){
					value = false;
				}
					var checkBox = new dijit.form.CheckBox({
						value: value,
						checked: value
					});
					checkBox.fisaRowItem = rowGridItem;
					checkBox.connect(checkBox,"onChange",function(value){
						if(this != window){
							if(this.fisaRowItem.value != value){
								this.fisaRowItem.value = [value];
							}
						}
					});
					return checkBox;
			}
			else{
				return "";	
			}

		},
		

		formatDataGridHistoryDetail : function( value, rowIndex,column) {
			var rowGridItem=column.grid.getItem(rowIndex);
			if(value && value!= ""){
				return value + " - " + rowGridItem.recordStatus[0];
			}
			return "";
		},
		//dont take into account any locale but info found in params.
		formatNumber : function(/*Number*/value, /*String*/pattern){
			if(value==null || value==='' || value===undefined){ // 0=='' is true, use ===.
				return '';
			}
			var formattedValue = String(value);
			if(typeof value != "number"){ value=number.parse(value,{locale:"en"}); }
			if(isNaN(value)){ return ""; }
			var sign='';
			if(value<0)sign='-';
			var places=0;
			var decimal = dojo.config.decimalSeparator;
			var group = dojo.config.groupSeparator;
			if(pattern && pattern.length>0){
				var index = pattern.indexOf(decimal);
				if(index>-1 ){
					var temp = pattern.substring(index+1);
					places=temp.length;
				}
			}
			var patternParts = pattern.split(decimal),
			maxPlaces = places;
			var valueParts = String(Math.abs(value)).split("."),
			fractional = valueParts[1] || "";
			if(patternParts[1] || options.places){
				var pad =places !== undefined ? places : (patternParts[1] && patternParts[1].lastIndexOf("0") + 1);
				if(pad > fractional.length){
					valueParts[1] = dstring.pad(fractional, pad, '0', true);
				}
				if(maxPlaces < fractional.length){
					valueParts[1] = fractional.substr(0, maxPlaces);
				}
			}else{
				if(valueParts[1]){ valueParts.pop(); }
			}
			// Pad whole with leading zeros
			var patternDigits = patternParts[0].replace(decimal, '');
			pad = patternDigits.indexOf("0");
			if(pad != -1){
					pad = patternDigits.length - pad;
					if(pad > valueParts[0].length){
						valueParts[0] = dstring.pad(valueParts[0], pad);
					}
					// Truncate whole
					if(patternDigits.indexOf("#") == -1){
						valueParts[0] = valueParts[0].substr(valueParts[0].length - pad);
					}
			}
			// Add group separators
			var index = patternParts[0].lastIndexOf(group),
			groupSize=3;
			var pieces = [];
			for(var whole = valueParts[0]; whole;){
				var off = whole.length - groupSize;
				pieces.push((off > 0) ? whole.substr(off) : whole);
				whole = (off > 0) ? whole.slice(0, off) : "";
			}
			valueParts[0] = pieces.reverse().join(group);
			var result= valueParts.join(decimal);
		//	console.log("valor formateado con formato: "+pattern+" -> "+  result)
			return sign+result;
		},
		
		formatPropertyTextBox : function(value, rowIndex,column, readMode){
			var rowGridItem=column.grid.getItem(rowIndex);
			var theTextBox = new dijit.form.TextBox({
				name: "attribute_vale",
				value: value /* no or empty value! */,
				style: {width : "225px"},
				placeHolder: "Ingrese el valor de la propiedad",
				readOnly : readMode
			});
			theTextBox.rowGridItem = rowGridItem;
			
			theTextBox.connect(theTextBox,"onChange",function(value){
				if(this != window){
					this.rowGridItem.widget = [value];
				}
			});
			return theTextBox;
		},
		toByteArray:function(str){
			var bytes = [];
			if(str!=null) {
				for (var i = 0; i < str.length; ++i) {
					bytes.push(str.charCodeAt(i));
				}
			}
			return bytes;
		},
		/**return absolute value of a number*/
		absNumber:function(number) {
			return ((number<0) ? number*-1 : number);
		},
		formatQueryTemplateFieldLink:function(linkData){
			var colDef = linkData.colDef;
			var value = colDef.grid.store.getValue(colDef.grid.getItem(linkData.rowIndex),linkData.fieldId);
			var outcome;
			if(value && value !=='0'){
				outcome = new ec.fisa.widget.QueryTemplateFieldRoutineLink({
					fieldId:linkData.fieldId,
					tabId:linkData.tabId,
					pageScopeId:linkData.pageScopeId,
					rowIndex:linkData.rowIndex,
					label:linkData.valueToFormat,
					routine:linkData.routine
				});
			}else{
				outcome = linkData.valueToFormat;
			}
			return outcome;
		},
		
		/**formats a number by format type*/
		formatNumberByFormatType:function(valueToFormat,format){
			var pattern = null;
			if (format == 4) {
				pattern = dojo.config.fisaNumericPattern;
			}else if (format == 5) {
				pattern = dojo.config.interestRateFormat;
			}else if (format == 6) {
				pattern =  dojo.config.percentageFormat;
			}

			if(valueToFormat==null){
				return "";
			}
			if(pattern != null){
				return this.formatNumber(valueToFormat,pattern);
			}
			else{
				return valueToFormat;
			}
		},
		
		/**link opens a new page with the contactmedia*/
		formatterAdditionalUsersLink : function(value, idx,column){
			var rowGridItem=column.grid.getItem(idx);
			if(idx >= 0) {
				if(value){			
						var linkAttrs={
								label: column.grid.labels['labelChoose'],
								rowGridItem :rowGridItem,
						gridId :column.grid,
						breadCrumbId :column.grid.breadCrumbId,
						onClick :function(){
								}};
					
						var linkFisa = new fisaLink(linkAttrs);
						
						linkFisa.connect(linkFisa,"onClick",function(){
							//console.log("clicked");
							var grid = dijit.byId(this.gridId);
							var controller =ec.fisa.controller.utils.getPageController(grid.tabId,grid.pageScopeId);
							controller.clearPanelMessage();
							grid.selectedRowGridItem = this.rowGridItem;
							controller.idAdditionalDlg = ec.fisa.navigation.utils.showNewDialogAdditionalCm(grid.breadCrumbId, grid.tabId, grid.pageScopeId,column.grid.labels['contactMedia']);
	
							
						});
						
						return linkFisa;
				}
			}
			else{
				return "";	
			}

		},
		/**inputtext the user name*/
		formatterAdditionalUsersName : function(value, idx,column){
			var rowGridItem=column.grid.getItem(idx);
			if(idx >= 0) {
				if(value != undefined && value!= null ){			
						var theTextBox = new dijit.form.TextBox({
							value: value /* no or empty value! */,
							style: {width : "175px"}
						});
						theTextBox.rowGridItem = rowGridItem;
						theTextBox.connect(theTextBox,"onChange",function(value){
							if(this != window){
								this.rowGridItem.name = [value];
							}
						});
						return theTextBox;
				}
			}
			return value;	

		},
		/**options this case onlye delete button.*/
		formatterAdditionalUsersOptions : function(value, idx,column){
			var rowGridItem=column.grid.getItem(idx);
			if(idx >= 0) {
						var buttonDelete = new dijit.form.Button({
							iconClass:"imgDelete",
							 baseClass:"fisaGridButton",
							 showLabel:false,
							 title:column.grid.labels['labelRemovePersonTitle'],
								style: {width : "24px",height:"24px"}
						});
						buttonDelete.gridId = column.grid.id;
						buttonDelete.rowGridItem = rowGridItem;
						buttonDelete.onClick=function(value){
							if(this != window){
								var grid = dijit.byId(this.gridId);
								if(grid!= null){
									if(grid.store !=null){
										var item = this.rowGridItem;
										if(item.recipientId != undefined && item.recipientId != null && item.recipientId[0] != null){
											var controller =ec.fisa.controller.utils.getPageController(grid.tabId,grid.pageScopeId);
											var itemDeleted = {recipientId:item.recipientId[0]};
											controller.deletedItems.push(itemDeleted);
										}
										grid.store.deleteItem(item);
									}
								}
								
								//this.rowGridItem.name = [value];
							}
						};
						return buttonDelete;
			}
			else{
				return value;	
			}

		},
		
		/**inputtext the data for additional contact media.*/
		formatterAdditionalCmData : function(value, idx,column){
			var rowGridItem=column.grid.getItem(idx);
			if(idx >= 0) {
				if(value != undefined && value!= null ){	
					
					var tipo = rowGridItem.contactMedia;
					var theTextBox = new dijit.form.ValidationTextBox({value: value,
						style: {width : "175px"},invalidMessage:this.invalidMessage});
					theTextBox.grid = column.grid;
						theTextBox.rowGridItem = rowGridItem;
						theTextBox.connect(theTextBox,"onChange",function(value){
							if(this != window){
								if(value != ""){
								var controller =	ec.fisa.controller.utils.getPageController(this.grid.tabId,this.grid.pageScopeId);
								controller.clearPanelMessageCm();
								if(this.isValid()){
									this.rowGridItem.name = [value];
								}
								else{
									this.set("value","");
									this.rowGridItem.name = [""];
										var message = [{summary: value + " : "+this.grid.labels['invalidValue'] ,detail:"",level:{level:40000}}];
									controller.updateMsgsPanelCm(message);
								}
								}
							}
						});
						if (tipo == "SMS") {					
							theTextBox.set("regExp",column.grid.numberRegex);
						} else if (tipo == "MAIL") {
							theTextBox.set("regExp",column.grid.emailRegex);
						}
						return theTextBox;
				}
			}
			return value;	

		},
		//verifies if an object is empty
		isObjectEmpty: function (obj){
			if(obj==undefined || obj==null){
				return true;
			}else{
				for(var prop in obj) {
					if(obj.hasOwnProperty(prop)){
					    return false;
				    	}
				}
			}
			return true;
		},
		//Usado en alias de cuentas. Retorna una cadena de código html que iserta una imagen de un lapiz. JCVQ
		//Se invoca desde DojoFisaQtGrid
		getEditIcon:function(){
			/*return "&nbsp<span><img src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABaklEQVQ4jZXNzyuDcQDH8e/58Sc4m5XlYJcd5MRBilbKgRBfslIODpKbg7IfaKZtDyMlChEXDtT2fR7saauxlicOtCZ5nucinrFJPs6y+j5731+9Camyh8kGVaM1pk6FjEEFZ1V4JxqAtOSBQQUYVIBOhYxlvB0NQJZlMMYg+bpgUAEarTEtYbY6jfWYCFVVUSwWwRjD+Vwf7icdGhcr4gRKBkM+0YKY6IeqqlAUBZuRALg4GRlHSWd4T9nxJhHcHjVjNRzEZtjPx5ehsT/4+bQOadGN+MoQH8vLFCU98Q8nQ90W8OIgPivgq6Cbj5mvt+L5cqmTj+Penorni4UOPj6ecKXNpyuY161/sORv5+NDT5PzZmsGP99llAtneDl3IS26wbxtfEwIIQeeRq/5nMOXpqJcSMG82wCbb7WGCSFkf9SR/cjH8ZrbxuPpLE6mXNYxIYSsDdiwN2LP7lH7wS6tH97tt9VW438B20Aa58Vb6TAAAAAASUVORK5CYII=\"/></span>";*/
			return "&nbsp<span style=\"display: inline-block;margin-top: 0px;padding-top: 0px;\"><div class=\"alias_icon\"></div></span>";
		},
		
		/**add error to the field, create a div with the desired style and error msg attached beside the field*/
		addToFieldError:function(id,msg,level,/*This could be null*/_tt){
			
			var wd=dijit.byId(id);
			if(wd instanceof dijit.form.TextBox && wd.domNode.type === "hidden"){
				return;
			}
			var _id=wd.domNode.id+"_tooltip";
			var imgSpan=dojo.byId(_id);
			var _level=level.level;
			if(imgSpan==null){
				var pn=null;
				var wd_link=null;
				// Mantis 17612
				if(wd.customMsgParent){
					//Se obtiene el componente widget de beneficiario asociado.
					wd_link=wd.getBeneficiaryNode();
				} 
				
				pn=wd.domNode.parentNode;
				
				var dimsTd=domGeometry.getMarginBox(pn);
				var _idw=wd.domNode.id+"_wrap";
				var tableWrap =domConstruct.create("table",{'id':_idw,'class':'fisaCmpMsgWrap','cellpadding':'0','cellspacing':'0','border':'0'},pn);
				var tbodyWrap =domConstruct.create("tbody",{},tableWrap);
				tableWrap=null;
				var trWrap =domConstruct.create("tr",{},tbodyWrap);
				tbodyWrap=null;
				var cmpWrap =domConstruct.create("td",{},trWrap);
				domConstruct.place(wd.domNode,cmpWrap);
				// Mantis 17612
				if(wd.customMsgParent){
					//Coloca en otro td el link de benficiario
					cmpWrap =domConstruct.create("td",{},trWrap);
					domConstruct.place(wd_link.domNode,cmpWrap);
				} 
				var popupWrap =domConstruct.create("td",{},trWrap);
				trWrap=null;
				var divCtnr =domConstruct.create("div",{'class':'fisaValidTooltip fisaValidTooltipRight'},popupWrap);
				var divPointer =domConstruct.create("div",{'class':'fisaValidTooltipConnector'},divCtnr);
				var divContent =domConstruct.create("div",{'class':'fisaValidTooltipContainer fisaValidTooltipContents'},divCtnr);
				tableWrap =domConstruct.create("table",{'cellpadding':'0','cellspacing':'0','border':'0'},divContent);
				tbodyWrap =domConstruct.create("tbody",{},tableWrap);
				tableWrap=null;
				trWrap =domConstruct.create("tr",{},tbodyWrap);
				tbodyWrap=null;
				var td1 =domConstruct.create("td",{'valign':'middle'},trWrap);
				var td2 =domConstruct.create("td",{'valign':'middle'},trWrap);
				trWrap=null;
				imgSpan=domConstruct.create("span",{'id':_id,'class':ec.fisa.format.utils._getLevelClass(_level)},td1);
				var lblSpan=domConstruct.create("span",{},td2);
				lblSpan.innerHTML=msg;
				imgSpan['level']=_level;
				if(_tt!=null){
				_tt[id] = null;
				}/*new Tooltip({
					connectId: [_id],
					label: msg
				});*/
			} else if(imgSpan.level<_level){
				domAttr.set(imgSpan,'class',ec.fisa.format.utils._getLevelClass(_level));
				/*var _tt=this._tt[_dat._cmpId];
				_tt.set("label",_tt.get("label")+", "+msg);*/
				imgSpan['level']=_level;
			}
			
			
		},
		//remove field error and destroy the msg 
		removeFieldError:function(id){
			
			var wd=dijit.byId(id);
			var wrapper= dojo.byId(wd.domNode.id+"_wrap");
			if(wrapper!=null){
				if(wd.customMsgParent){
					var wd_link=wd.getBeneficiaryNode();
					//Mantis 17612 se obtiene el parent para colocar el componentente de beneficiario
					domConstruct.place(wd_link.domNode,wrapper.parentNode.parentNode.children[1]);
				}
				domConstruct.place(wd.domNode,wrapper.parentNode);
				/*var _id=wd.domNode.id+"_tooltip";
				domConstruct.destroy(_id);*/
				domConstruct.destroy(wrapper);
			}
		},
		
		_getLevelClass:function(_level){
			var className="fisaToolTip";
			if(_level==40000){
				className+=' fisaToolTipError';
			} else if(_level==30000){
				className+=' fisaToolTipWarn';
			} else if(_level==20000){
				className+=' fisaToolTipInfo';
			}
			return className;
		}
	
	});
	fisaFormat.utils = new Utils;
	ec.fisa.format.utils=fisaFormat.utils;
	return Utils;
});

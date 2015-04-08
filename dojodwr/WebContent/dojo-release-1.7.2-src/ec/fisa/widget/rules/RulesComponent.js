define( [ "dojo/_base/kernel", "dojo/_base/declare", "dijit/_Widget",
		"dijit/_Templated", "dojo/on", "dijit/TitlePane",
		"ec/fisa/widget/Link", "dojo/dom-construct", "dojo/dom-geometry",
		"dojo/dom-style", "ec/fisa/controller/custom/BtController",
		"dojox/widget/DialogSimple","dojox/encoding/base64", "dojo/text!./templates/RulesComponent.html",
		"ec/fisa/widget/DateTextBox","ec/fisa/widget/rules/Condition",
		"dojox/lang/functional/object","ec/fisa/format/Utils","./_base"], function(dojo,
		declare, _Widget, _Templated, on, TitlePane, FisaLink,domConstruct,domGeometry,domStyle, BtController,DialogSimple,base64, template) {
	return declare("ec.fisa.widget.rules.RulesComponent", [ _Widget, _Templated ], {
		tabId : '',
		pageScopeId:'',
		templateString : template,
		newRuleLabel : 'Nueva Regla',// Define el texto del link de nuevas
		newConditionLabel : "Agregar Nueva Condici\u00F3n",
		ruleLabel:'Regla',
		deleteRuleLabel:'Eliminar regla',
		fieldSelectorTitle: "Seleccione un Campo o Variable",
		ruleSectionTable:"Table",//Prefijo usado para crear el id de las tablas (tabla de html) de reglas
		ruleSectionTbody:"TBody",//Prefijo usado para crear el id de las filas de las tablas de reglas
		newRuleLink:null,
		//initial data
		businessTemplateId:'',//Almacena el id de la business template desde la que se recuperaran los campos para la regla
		fieldId:'',			 // id del campo que contiene el componente de reglas
		fieldProperties:null,   
		// id del campo que contiene el id de bt. con el btId se obtienen todos sus campos habilitados
		//para reglas
		relatedFieldBt:'',    
		operators:null,    //Lista de todos los operadores
		//información complementaria de los campos utilizados para reglas, como por ejemplo opción por defecto, nivel de acceso
		additionalFieldInfo:null, 
	
		//component data 
		numberOfRules: 0, //Se encarga de contar el número de reglas, es usado para generar ids de las tablas de reglas.
		numberOfConditionsForRuleIndex:null,
		links:null,
		rulePaneList:null,  //Lista de TitlePanes. Cada titlePane contiene a una regla.
		//Array bidimensional que contiene los valores y componentes que conforman una condición
		//conditionsArray[i][j], donde i es el índice de una regla, y j es el índice de una condición dentro de una regla
		conditionsArray:null,  
		readOnly:false,
		//información para los componentes de selección para las condiciones de una reglas,
		//por ejemplo, en caso de usar el operador en: se presentará un combo con las posibles opciones a ser seleccionadaas
		comboData:null,
		//estructura de datos que contiene las reglas recuperadas desde BBDD, la que permite renderizar el componente
		rulesData:null,
		//número asignado al componente de reglas
		rulesComponentNumber:null,

		constructor:function(){
			this.sectionRules = [];
			this.conditionsArray=[];
			this.numberOfConditionsForRuleIndex=[];  //la posición '0' indicaría el número de condiciones de la regla con indice '0'
			this.links={};
			this.rulePaneList={};
		},
		
		postMixInProperties:function(){
			this.inherited(arguments);
			if(this.fieldProperties){
				var fp=this.fieldProperties['RULE_REF_FIELD'];
				this.fieldProperties=fp;
				this.relatedFieldBt=fp[0]['value'];
			}
		},
		postCreate : function() {
			this.inherited(arguments);
			this.initNewRuleLink();
			if(this.operators){
				var opts=[];
				dojox.lang.functional.forIn(this.operators,function(val,idx){
					opts.push({'label':val,'value':idx});
				},this);
				this.operators=opts;
			}
		},
		initNewRuleLink : function() {// Inicializa el link para creación de
			var labelL = this.newRuleLabel;
			if(this.readOnly) labelL =''; 
										// nuevas reglas
			this.newRuleLink = new FisaLink({label:labelL},domConstruct.create('div',null,this._newRuleLink));
			if(!this.readOnly ){
				this.newRuleLink.connect(this.newRuleLink, "onClick", dojo.hitch(this,this.createNewRuleSection));
			}
		},
		createNewRuleSection : function() {
			var newRule = new TitlePane({
				title : this.ruleLabel
			});
			newRule.placeAt(this._ruleContainer);
			newRule.startup();
			var ruleIndex = this.numberOfRules;
			this.numberOfRules++;
			this.rulePaneList[ruleIndex]=newRule;
			return this.initNewConditionSection(newRule.containerNode,ruleIndex);
		},
		initNewConditionSection:function(/*Nodo dom del title pane*/newRuleNode,ruleIndex){
			//Se inicializan los ids que se usaran posteriormente para recuperar la tabla e inyectarle filas
			var tableId = this.createTableRuleId(ruleIndex);
			var tBodyId = this.createTableBodyRuleId(ruleIndex);
			this.conditionsArray[ruleIndex]={};
			this.numberOfConditionsForRuleIndex[ruleIndex]=0;
			//Se añaden los elementos al dom
			var ruleSectionTable = domConstruct.create("table",{'id':tableId,'rulescompid':this.id , 'ruleindex':ruleIndex,cellpadding:"0",cellspacing:"0",border:"0"}, newRuleNode);
			var ruleSectionTbody = domConstruct.create("tbody",{'id':tBodyId,'rulescompid':this.id , 'ruleindex':ruleIndex}, ruleSectionTable);
			var linkSectionTable = domConstruct.create("table",{cellpadding:"0",cellspacing:"0",border:"0",width:'100%'}, newRuleNode);
			var linkSectionTbody = domConstruct.create("tbody",{}, linkSectionTable);
			var linkSectionTr = domConstruct.create("tr",{}, linkSectionTbody);
			var initObject = {};
			initObject.tableId = tableId;
			initObject.tBodyId = tBodyId;
			var ruleObject = this.initNewRuleObject(initObject);//Inicia el nuevo objeto que almecenará las condiciones
			var linkAddSectionTd = domConstruct.create("td",{'align':'left'}, linkSectionTr);
			var labelL = this.newConditionLabel;
			if(this.readOnly) labelL ='';
			var newConditionLink = new FisaLink({label: labelL},domConstruct.create("div",null,linkAddSectionTd));
			newConditionLink.tableId=tableId;
			newConditionLink.ruleObject=ruleObject;
			newConditionLink.parent=this;
			if(!this.readOnly){
				newConditionLink.connect(newConditionLink,"onClick",dojo.hitch(newConditionLink,this.showFieldSelector,null));
			}
			var linkDelSectionTd = domConstruct.create("td",{'align':'right'}, linkSectionTr);
			var labelE = this.deleteRuleLabel;
			if(this.readOnly) labelE ='';
			var delConditionLink = new FisaLink({label: labelE},domConstruct.create("div",null,linkDelSectionTd));
			delConditionLink.tableId=tableId;
			delConditionLink.ruleObject=ruleObject;
			delConditionLink.parent=this;
			if(!this.readOnly ){
				delConditionLink.connect(delConditionLink,"onClick",dojo.hitch(delConditionLink,this.delRule,ruleIndex));
			}
			this.links[ruleIndex]=[delConditionLink,newConditionLink];
			return ruleSectionTbody;
		},

		/*Inicializa un objeto de regla, en este objeto se almacenaran la condiciones*/
		initNewRuleObject: function(/*Objeto de inicialización*/initObject) {
			var ruleObject={};
			ruleObject.tableId = initObject.tableId;
			ruleObject.tBodyId = initObject.tBodyId;
			return ruleObject;
		},
		showFieldSelector:function(selectedItem){
			var _this = this.parent;
			var params = {content:{}};
			var btIdWhereToGetRulesField=null;
			
			var ctrl = ec.fisa.controller.utils.getPageController(_this.tabId, _this.pageScopeId);
			if(ctrl){
				btIdWhereToGetRulesField= ctrl.getFieldModel(_this.businessTemplateId,_this.relatedFieldBt)
			}
			var dialogArgs = {};
			dialogArgs.href = dojo.config.fisaContextPath + "/ITEM_RULE_FIELD_SELECTOR/";
			dialogArgs.href+=_this.businessTemplateId;
			dialogArgs.href+="/FISATabId/";
			dialogArgs.href+=_this.tabId;
			dialogArgs.href+="/parentFisaPageScopeId/";
			dialogArgs.href+=_this.pageScopeId;
			dialogArgs.href+="/parentBtId/";
			dialogArgs.href+=base64.encode(ec.fisa.format.utils.toByteArray(_this.relatedFieldBt));
			dialogArgs.href+="/_parentBtId/parentFieldId/";
			dialogArgs.href+=_this.fieldId;
			if(btIdWhereToGetRulesField!=null){
				dialogArgs.href+="/btWhereToGetRuleFields/";
				dialogArgs.href+=btIdWhereToGetRulesField;
			}
			dialogArgs.href+="/parentWidgetId/";
			dialogArgs.href+=this.ruleObject.tBodyId;
			dialogArgs.href+="/FDK/";
			if(selectedItem==null){
				dialogArgs.href+="_FDK";
			} else {
				dialogArgs.href+=base64.encode(ec.fisa.format.utils.toByteArray("{id:'"+selectedItem.id+"',t:'"+selectedItem.type+"'}"));
				dialogArgs.href+="/_FDK";
			}
			dialogArgs.href+="/content.jsp";
			dialogArgs.title=_this.fieldSelectorTitle;
			dialogArgs.ioArgs=params;
			dialogArgs.ioMethod=dojo.xhrPost;
			var dialogStyle=ec.fisa.controller.utils.getGlobalModalSize(0.80);
			dialogArgs.style="height:"+dialogStyle.h+"px;width:"+dialogStyle.w+"px;";
			_this._fieldSelector = new dojox.widget.DialogSimple(dialogArgs);
			if(selectedItem!=null){
				var tbodyDom=dojo.byId(this.ruleObject.tBodyId);
				dojo.setAttr(tbodyDom,'ruleindex',selectedItem.ruleindex);
				dojo.setAttr(tbodyDom,'conditionindex',selectedItem.conditionindex);
			}
			_this._fieldSelector.tbid=this.ruleObject.tBodyId;
			_this._fieldSelector.connect(_this._fieldSelector,"hide",dojo.hitch(_this,function(){
				var table1=dojo.byId(this._fieldSelector.tbid);
				ec.fisa.controller.utils.uninitializeController(dojo.getAttr(table1,'tid'),dojo.getAttr(table1,'psid'));
				dojo.removeAttr(table1,'tid');
				dojo.removeAttr(table1,'psid');
				var fieldSelector=this._fieldSelector;
				delete this._fieldSelector;
				fieldSelector.destroyRecursive(false);
			}));
			
			_this._fieldSelector.show();
			_this._resizeContainerNode(_this._fieldSelector,dialogStyle);
		},
		/*Crea el id de la tabla de reglas*/
		createTableRuleId:function(count){
			var temp =this.id.substring(this.id.lastIndexOf("_")+1);
			return 'rule'+temp+"_"+this.ruleSectionTable + "_" + count;
		},
		/*Crea el id del body de la tabla de reglas*/
		createTableBodyRuleId:function(count){
			var temp =this.id.substring(this.id.lastIndexOf("_")+1);
			return 'rule'+temp+"_"+this.ruleSectionTbody + "_" + count;
		},
		_resizeContainerNode:function(lovDialog,dialogStyle){
			var titleDim=domGeometry.getMarginBox(lovDialog.titleNode);
			domStyle.set(lovDialog.containerNode, "height", (dialogStyle.h-titleDim.h-(titleDim.t*4))+"px");
			//domStyle.set(lovDialog.containerNode, "width", "100%");
			domStyle.set(lovDialog.containerNode, "display", "block");
			domStyle.set(lovDialog.containerNode, "overflowY", "auto");
			domStyle.set(lovDialog.containerNode, "overflowX", "auto");
		},
		addItem:function(type,item,ruleContainer){
			var params={rulesComponentId:this.id,fieldType:type,item:item,ruleContainer:ruleContainer,tabId:this.tabId,pageScopeId:this.pageScopeId};
			//var condition = new ec.fisa.widget.rules.Condition(this.id,type,item,tableId,tabId,pageScopeId);
			var condition = new ec.fisa.widget.rules.Condition(params);
			condition.placeAt(ruleContainer);
			condition.startup();
			this._fieldSelector.hide();
		},
		closeFieldSelector:function(){
			this._fieldSelector.hide();
		},
		_getValueAttr: function(){
			return this.rulesComponentNumber;
		},
		_setValueAttr: function(value, /*Boolean?*/ priorityChange, /*String?*/ formattedValue){
			this.rulesComponentNumber=value;

		},
		_getRuleValueAttr: function(){
			var outcome=this.generateValue();
			if(outcome!=null&&outcome.errorCode==null){
				return outcome;
			}
			return null;
		},
		_setRuleValueAttr: function(data, /*Boolean?*/ priorityChange, /*String?*/ formattedValue){
			this.rulesData=data;
		},
		renderRuleComponent:function(){
			var finalRule = this.rulesData /*[0]*/; 
			var ruleCondition = this.additionalFieldInfo; 
			var selectData =  this.comboData;
			if (finalRule == null || ruleCondition == null ) {
				return;
			}
			this._fieldSelector = new dojox.widget.DialogSimple();
		
			for (var i in finalRule.group) {
				var rule = finalRule.group[i]; 
				var ruleSection = this.createNewRuleSection();
				for (var j in rule.group) {
					var tempItem = null;
					var condition = rule.group[j]; 
					var tBodyId = ruleSection.id;			
					if (condition.type == 'F') {
						var fiels = ruleCondition.fields;
						for (var idf in fiels) {
							if (fiels[idf].id == condition.fieldId){
								tempItem = fiels[idf];
								tempItem['value'] = condition.value;
								tempItem['btId'] = condition.btId;
								tempItem['operator'] = condition.operator;
								break;
							}
						}
					} else if (condition.type == 'V'){
						var variables = ruleCondition.variables;
						for (var idv in variables) {
							if (variables[idv].id == condition.fieldId){
								tempItem = variables[idv];
								tempItem['value'] = condition.value;
								tempItem['btId'] = condition.btId;
								tempItem['operator'] = condition.operator;
								break;
							}
						}						
					}
					//si no se encuentra información complementaria de campos parametrizados
					//para reglas no se intenta renderizar esta fila del componente.
					//Esto se evitará con el borrado lógico de los registros de la tabla de 
					//parametrización de reglas:TAUT_AUTHO_FIELD_DETAIL
					if(tempItem!=null){
						var item={'id':tempItem.id,'btId':tempItem.btId,'fieldName':tempItem.prompt,'value':tempItem.value,'operator': tempItem.operator,
								'conditionEnable':tempItem.conditionEnable,'dbDataType':tempItem['dbDataType'] };
						
						var qtId=tempItem.qtId;
						if(qtId!=null){
							var data = selectData[qtId];
							if(data!=null){
								var qtLabel=tempItem.qtDescription;
								var qtValue=tempItem.qtValue;
							//	item['cd']=tempItem.operator; //tempItem.conditionDefault;  //condition
						    //		item['ce']=tempItem.conditionEnable;
								var newData=[];
								dojo.forEach(data,function(it){
									newData.push({'label':it['f'+qtLabel],'value':it['f'+qtValue]});
								},this);
								item['qtItems']=newData;
							}
						}
						var str = dojo.getAttr(ruleSection,'rulescompId');
						var wid=dijit.byId(str);
						wid.addItem(condition.type, item, ruleSection);
					}
				}
			}
			
			var fieldSelector=this._fieldSelector;
			delete this._fieldSelector;
			fieldSelector.destroyRecursive(false);
		},
		generateValue: function(){
			var outcome=null;
			if(this.conditionsArray!=null){
				var _sects=[];
				for(var sect in this.conditionsArray){
					_sects.push(sect);
				}
				if(_sects.length>0){
					for(var i=0; i < _sects.length; i++){
						var sect=_sects[i];
						var _items=[];
						for(var _sect in this.conditionsArray[sect]){
							_items.push(_sect);
						}
						if(_items.length>0){
							//OC: no mover la siguiente condición
							if(outcome==null){
								outcome={group:[],operator:"OR",value:null,fieldId:null,btId:null,type:null,users:null};
							}
							var outCond={group:[],operator:"AND",value:null,fieldId:null,btId:null,type:null,users:null};
							outcome.group.push(outCond);
							for(var j=0; j < _items.length; j++){
								var _i=_items[j];
								var _item=this.conditionsArray[sect][_i];
								var condition={group:null,operator:null,value:[],fieldId:null,btId:null,type:null,users:null};
								var cmp=dijit.byId(_item.operatorComponentId);  
								condition.operator=cmp.get("value");
								cmp=dijit.byId(_item.value1ComponentId);
								var values = cmp.get("value");
								var componenteSeleccionMultiple = cmp.declaredClass=='dijit.form.MultiSelect';
								if(componenteSeleccionMultiple===true){
									for(var i=0; i<values.length; i++){
										condition.value.push(values[i]);
									}
								}else{
									condition.value.push(values);
								}
								if(condition.operator=='7'){
									var cmp1=dijit.byId(_item.value2ComponentId);
									var values1 = cmp1.get("value");
									var longitud = values.length;
									if(componenteSeleccionMultiple===false){
										condition.value.push(values1);
									}else{
										for(var j=0; j<longitud; j++){
											condition.value.push(values1[j]);
										}
									}
								}
								condition.btId=_item.btId;
								condition.type=_item.fieldType;
								condition.fieldId=_item.fieldId;
								outCond.group.push(condition);
							}
						}
					}
				} 
			}
			return outcome;
		},		
		_setEnabledAttr:function(value){
			if(value != null){
				if(this.conditionsArray &&  this.conditionsArray.length>0){
					for(var i=0; i < this.conditionsArray.length; i++){
						if(this.conditionsArray[i] && this.conditionsArray[i].length>0){
							for(var j=0; j < this.conditionsArray[i][j].length; j++){
								var conditionId=this.conditionsArray[i][j].conditionId;
								dijit.byId(conditionId).enableCondition(value);
							}
						}
						
					}
				} 
			}
		},
		_isEmpty: function (obj){
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
		delRule:function(idx){
			var _this=this
			var vals=_this.conditionsArray[idx];
			dojox.lang.functional.forIn(vals,function(item){
				_this.destroyRow(item);
			},this);
			var tableId = _this.createTableRuleId(idx);
			domConstruct.destroy(tableId);
			var links=_this.links[idx];
			links[0].destroy(false);
			links[1].destroy(false);
			delete _this.links[idx];
			var _pane=_this.rulePaneList[idx];
			_pane.destroy(false);
			delete _this.rulePaneList[idx];
			delete _this.conditionsArray[idx];
		},
		destroyRow:function(row){
			var condition = dijit.byId(row.conditionId);
			condition.destroyCondition();

		},
		destroy:function(){
			dojo.forEach(this.conditionsArray,function(item,idx){
				dojox.lang.functional.forIn(item,function(row){
					this.destroyRow(row);
				},this);
			},this);
			dojox.lang.functional.forIn(this.links,function(item,idx){
				delete item[0].parent;
				delete item[1].parent;
				item[0].destroy(false);
				item[1].destroy(false);
			},this);
			dojox.lang.functional.forIn(this.rulePaneList,function(item,idx){
				item.destroy(false);
			},this);
			this.newRuleLink.destroy(false);
			delete this.newRuleLink;
			this.inherited(arguments);
		}
	});
});
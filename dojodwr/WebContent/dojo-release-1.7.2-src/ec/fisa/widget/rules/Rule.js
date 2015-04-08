define( [ "dojo/_base/kernel", "dojo/_base/declare", "dijit/_Widget",
		"dijit/_Templated", "dojo/on", "dijit/TitlePane",
		"ec/fisa/widget/Link", "dojo/dom-construct", "dojo/dom-geometry",
		"dojo/dom-style", "ec/fisa/controller/custom/BtController",
		"dojox/widget/DialogSimple","dojox/encoding/base64", "dojo/text!./templates/Rule.html",
		"dojox/lang/functional/object","ec/fisa/format/Utils","./_base"], function(dojo,
		declare, _Widget, _Templated, on, TitlePane, FisaLink,domConstruct,domGeometry,domStyle, BtController,DialogSimple,base64, template) {
	return declare("ec.fisa.widget.rules.Rule", [ _Widget, _Templated ], {
		tabId : '',
		pageScopeId:'',
		templateString : template,
		newRuleLabel : "Nueva Regla",// Define el texto del link de nuevas
		newConditionLabel : "Agregar Nueva Condici\u00F3n",
		fieldSelectorTitle: "Seleccione un Campo o Variable",
		sectionRules:null,/*Array que contiene la lista de reglas del componente*/
		ruleSectionTable:"sTbl",//Prefijo usado para crear el id de las tablas (tabla de html) de reglas
		ruleSectionTbody:"sTbd",//Prefijo usado para crear el id de las filas de las tablas de reglas
		count: 0, //Se encarga de contar el número de reglas, es usado para generar ids de las tablas de reglas.
		businessTemplateId:'',//Almacena el id de la business template desde la que se recuperaran los campos para la regla
		fieldId:'',
		relatedFieldBt:'',
		operators:null,
		fieldProperties:null,
		_value:null,
		_sidx:null,
		_links:null,
		_panes:null,
		newRuleLink:null,
		readOnly:false,
		value:null,
		//información complementaria de los campos utilizados para reglas, como por ejemplo opción por defecto, nivel de acceso
		additionalFieldInfo:null, 
		//información para los componentes de selección para las condiciones de una reglas,
		//por ejemplo, en caso de usar el operador en: se presentará un combo con las posibles opciones a ser seleccionadaas
		comboData:null,
		initialData:null,
		constructor:function(){
			this.sectionRules = [];
			this._value=[];
			this._sidx=[];
			this._links={};
			this._panes={};
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
										// nuevas reglas
			this.newRuleLink = new FisaLink({label: this.newRuleLabel},domConstruct.create('div',null,this._newRuleLink));
			if(!this.readOnly ){
			this.newRuleLink.connect(this.newRuleLink, "onClick", dojo.hitch(this,this.createNewRuleSection));
			}
		},
		createNewRuleSection : function() {
			var newRule = new TitlePane({
				title : "Regla"
			});
			newRule.placeAt(this._ruleContainer);
			newRule.startup();
			var idCount = this.count;
			this.count++;
			this._panes['p'+idCount]=newRule;
			return this.initNewConditionSection(newRule.containerNode,idCount);
		},
		initNewConditionSection:function(/*Nodo dom del title pane*/newRuleNode,idCount){
			var nodes = [];
			//Se inicializan los ids que se usaran posteriormente para recuperar la tabla e inyectarle filas
			var tableId = this.createTableRuleId(idCount);
			var tBodyId = this.createTableBodyRuleId(idCount);
			this._value['v'+idCount]={};
			this._sidx['s'+idCount]=0;
			//Se añaden los elementos al dom
			var ruleSectionTable = domConstruct.create("table",{'id':tableId,'rule-idx':idCount,cellpadding:"0",cellspacing:"0",border:"0"}, newRuleNode);
			var ruleSectionTbody = domConstruct.create("tbody",{'id':tBodyId,'rule-idx':idCount}, ruleSectionTable);
			var linkSectionTable = domConstruct.create("table",{cellpadding:"0",cellspacing:"0",border:"0",width:'100%'}, newRuleNode);
			var linkSectionTbody = domConstruct.create("tbody",{}, linkSectionTable);
			var linkSectionTr = domConstruct.create("tr",{}, linkSectionTbody);
			var initObject = {};
			initObject.tableId = tableId;
			initObject.tBodyId = tBodyId;
			var ruleObject = this.initNewRuleObject(initObject);//Inicia el nuevo objeto que almecenará las condiciones
			//this.sectionRules[idCount] = ruleObject;
			var linkAddSectionTd = domConstruct.create("td",{'align':'left'}, linkSectionTr);
			var newConditionLink = new FisaLink({label: this.newConditionLabel},domConstruct.create("div",null,linkAddSectionTd));
			newConditionLink.tableId=tableId;
			newConditionLink.ruleObject=ruleObject;
			newConditionLink.parent=this;
			if(!this.readOnly){
			newConditionLink.connect(newConditionLink,"onClick",dojo.hitch(newConditionLink,this.showFieldSelector,null));
			}
			//newConditionLink.placeAt(linkAddSectionTd);
			var linkDelSectionTd = domConstruct.create("td",{'align':'right'}, linkSectionTr);
			var delConditionLink = new FisaLink({label: " Eliminar Regla"},domConstruct.create("div",null,linkDelSectionTd));
			delConditionLink.tableId=tableId;
			delConditionLink.ruleObject=ruleObject;
			delConditionLink.parent=this;
			if(!this.readOnly ){
			delConditionLink.connect(delConditionLink,"onClick",dojo.hitch(delConditionLink,this.delRule,idCount));
			}
//			delConditionLink.placeAt(linkDelSectionTd);
			this._links['l'+idCount]=[delConditionLink,newConditionLink];
			return ruleSectionTbody;
		},
		delRule:function(idx){
			var _this=this.parent;
			var vals=_this._value['v'+idx];
			dojox.lang.functional.forIn(vals,function(item){
				_this.destroyRow(item);
			},this);
			var tableId = _this.createTableRuleId(idx);
			domConstruct.destroy(tableId);
			var _links=_this._links['l'+idx];
			_links[0].destroy(false);
			_links[1].destroy(false);
			delete _this._links['l'+idx];
			var _pane=_this._panes['p'+idx];
			_pane.destroy(false);
			delete _this._panes['p'+idx];
			delete _this._value['v'+idx];
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
				dojo.setAttr(tbodyDom,'val-idx',selectedItem.idx);
				dojo.setAttr(tbodyDom,'val-sidx',selectedItem.sidx);
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
			return this.id+"_"+this.ruleSectionTable + "_" + count;
		},
		/*Crea el id del body de la tabla de reglas*/
		createTableBodyRuleId:function(count){
			return this.id+"_"+this.ruleSectionTbody + "_" + count;
		},
		_resizeContainerNode:function(lovDialog,dialogStyle){
			var titleDim=domGeometry.getMarginBox(lovDialog.titleNode);
			domStyle.set(lovDialog.containerNode, "height", (dialogStyle.h-titleDim.h-(titleDim.t*4))+"px");
			//domStyle.set(lovDialog.containerNode, "width", "100%");
			domStyle.set(lovDialog.containerNode, "display", "block");
			domStyle.set(lovDialog.containerNode, "overflowY", "auto");
			domStyle.set(lovDialog.containerNode, "overflowX", "auto");
		},
		addItem:function(type,item,tableId,tabId,pageScopeId){
			var ruleSectionTbody =dojo.byId(tableId);
			var idx=dojo.getAttr(ruleSectionTbody,'rule-idx');
			var vidx = dojo.getAttr(ruleSectionTbody,'val-idx');
			var sidx=null;
			var tdd1 = null;
			var tdd2 = null;
			var tdd3 = null;
			var tdd4 = null;
			var tdd5 = null;
			if(vidx!=null){
				sidx = dojo.getAttr(ruleSectionTbody,'val-sidx');
				var o=this._value['v'+idx][sidx];
				var prompt = dijit.byId(o.p);
				tdd1 = domConstruct.create("div",{}, prompt.domNode.parentNode);
				prompt.destroy(false);
				delete prompt;
				var operators = dijit.byId(o.o);
				tdd2 = domConstruct.create("div",{}, operators.domNode.parentNode);
				operators.destroy(false);
				delete operators;
				var valueCmp = dijit.byId(o.v);
				tdd3 = domConstruct.create("div",{}, valueCmp.domNode.parentNode);
				valueCmp.destroy(false);
				delete valueCmp;
				var editCmp = dijit.byId(o.e);
				tdd4 = domConstruct.create("div",{}, editCmp.domNode.parentNode);
				delete editCmp.parent;
				editCmp.destroy(false);
				delete editCmp;
				var delCmp = dijit.byId(o.d);
				tdd5 = domConstruct.create("div",{}, delCmp.domNode.parentNode);
				delete delCmp.parent;
				delCmp.destroy(false);
				delete delCmp;
			} else {
				sidx='i'+this._sidx['s'+idx];
				this._sidx['s'+idx]=this._sidx['s'+idx]+1;
				var tr = domConstruct.create("tr",{'id':(tableId+sidx)}, ruleSectionTbody);
				var classValue = "border-top:4px solid transparent;color:#1c75bc;padding-top:13px";
				
				var td1 = domConstruct.create("td",{style: classValue}, tr);
				var td2 = domConstruct.create("td",{style: classValue}, tr);
				var td3 = domConstruct.create("td",{style: classValue}, tr);
				var td4 = domConstruct.create("td",{style: classValue}, tr);
				var td5 = domConstruct.create("td",{style: classValue}, tr);
				tdd1 = domConstruct.create("div",{}, td1);
				tdd2 = domConstruct.create("div",{}, td2);
				tdd3 = domConstruct.create("div",{}, td3);
				tdd4 = domConstruct.create("div",{}, td4);
				tdd5 = domConstruct.create("div",{}, td5);
			}
			var tb1 = new dijit.form.TextBox({'value':item.prompt,'val-idx':idx,'val-sidx':sidx,'disabled':true,'style':{'width':'150px'}}, tdd1);
			var selArgs={'options':this.operators,'val-idx':idx,'val-sidx':sidx,'disabled' : this.onlyRead,'style':{'width':'150px'}};
			if(item.operator!=null&&item.operator!==""){
				selArgs.value=item.operator;
			}
			if(item.conditionEnable!=null&&item.conditionEnable!==""){
				selArgs.readOnly=item.conditionEnable=="1";
			}
			var cb1= new dijit.form.Select(selArgs,tdd2);
			var mb2= null;
			if(item.o==null){
				mb2= new dijit.form.TextBox({'val-idx':idx,'val-sidx':sidx,'style':{'width':'150px'}},tdd3);
			} else {
				mb2= new dijit.form.Select({'options':item.o,'val-idx':idx,'val-sidx':sidx,'style':{'width':'150px'}},tdd3);
			}
			if (item.value != null && item.value !== "") {
				mb2.set("value", item.value);
			}
			if(this.onlyRead==true){
				mb2.set("disabled", "disabled");
			}
			var img1= new dijit.form.Button({iconClass:'imgEdit',baseClass:"fisaGridButton",showLabel:false},tdd4);
			img1.connect(img1,"onClick",dojo.hitch(img1,this.showFieldSelector,{'id':item.id,'idx':idx,'sidx':sidx,'type':type}));
			img1.parent=this;
			img1.ruleObject={'tBodyId':tableId};
			var img2= new dijit.form.Button({iconClass:'imgDelete',baseClass:"fisaGridButton",showLabel:false},tdd5);
			img2.connect(img2,"onClick",dojo.hitch(this,this.execDelete,{'id':item.id,'idx':idx,'sidx':sidx,'type':type}));
			img2.parent=this;
			img2.ruleObject={'tBodyId':tableId};
			this._value['v'+idx][sidx]={'i':item.id,'bt' : item.btId,'p':tb1.id,'o':cb1.id,'v':mb2.id,'e':img1.id,'d':img2.id,'t':type};
			this._fieldSelector.hide();
		
		},
		execDelete:function(data){
			var idx=data.idx;
			var sidx=data.sidx;
			var tBodyId=this.createTableBodyRuleId(idx);
			var tbody=dojo.byId(tBodyId);
			var trId=tBodyId+sidx;
			if(tbody.rows!=null&&tbody.rows.length>0){
				var i=0;
				for(i=0;i<tbody.rows.length;i++){
					if(trId==tbody.rows[i].id){
						delete this._value['v'+idx][sidx];
						tbody.deleteRow(i);
						break;
					}
				}
				
			}
		},
		destroyRow:function(row){
			var cmp=dijit.byId(row.p);
			cmp.destroy(false);
			cmp=dijit.byId(row.o);
			cmp.destroy(false);
			cmp=dijit.byId(row.v);
			cmp.destroy(false);
			cmp=dijit.byId(row.e);
			delete cmp.parent;
			cmp.destroy(false);
			cmp=dijit.byId(row.d);
			delete cmp.parent;
			cmp.destroy(false);
		},
		destroy:function(){
			dojo.forEach(this._value,function(item,idx){
				dojox.lang.functional.forIn(item,function(row){
					this.destroyRow(row);
				},this);
			},this);
			dojox.lang.functional.forIn(this._links,function(item,idx){
				delete item[0].parent;
				delete item[1].parent;
				item[0].destroy(false);
				item[1].destroy(false);
			},this);
			dojox.lang.functional.forIn(this._panes,function(item,idx){
				item.destroy(false);
			},this);
			this.newRuleLink.destroy(false);
			delete this.newRuleLink;
			this.inherited(arguments);
		},
		_getValueAttr: function(){
			console.debug('_getValueAttr');
			return this.value;
		},
		_setValueAttr: function(value, /*Boolean?*/ priorityChange, /*String?*/ formattedValue){
			console.debug('_setValueAttr');
			this.value=value;
			//this.set('value',value, priorityChange, formattedValue);
		},
		_getRuleValueAttr: function(){
			console.debug('_getRuleValueAttr');
			var outcome=this.generateValue();
			if(outcome!=null&&outcome.errorCode==null){
				return outcome;
			}
			return null;
		},
		_setRuleValueAttr: function(data, /*Boolean?*/ priorityChange, /*String?*/ formattedValue){
			console.debug('_setRuleValueAttr');
			this.initialData=data
		},
		renderRuleComponent:function(){
			var finalRule = this.initialData /*[0]*/; 
			var ruleCondition = this.additionalFieldInfo; 
			var selectData =  this.comboData;
			if (finalRule == null || ruleCondition == null ) {
				return;
			}
			this._fieldSelector = new dojox.widget.DialogSimple();
			var tempItem;
			for (var i in finalRule.group) {
				var rule = finalRule.group[i]; 
				var ruleSection = this.createNewRuleSection();

				
				for (var j in rule.group) {
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
					var item={'id':tempItem.id,'btId':tempItem.btId,'prompt':tempItem.prompt,'value':tempItem.value,'operator': tempItem.operator,
							'conditionEnable':tempItem.conditionEnable };
					
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
							item['o']=newData;
						}
					}
					var str=tBodyId.substring(0,tBodyId.lastIndexOf("_"));
					str=str.substring(0,str.lastIndexOf("_"));
					var wid=dijit.byId(str);
					wid.addItem(condition.type, item, ruleSection.id, this.tabId, this.pageScopeId);
				}
			}
			
			var fieldSelector=this._fieldSelector;
			delete this._fieldSelector;
			fieldSelector.destroyRecursive(false);
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
		generateValue: function(){
			var outcome=null;
			if(this._value!=null){
				var _sects=[];
				for(var sect in this._value){
					_sects.push(sect);
				}
				if(_sects.length>0){
					outcome={group:[],operator:"OR",value:null,fieldId:null,btId:null,type:null,users:null};
					for(var i=0; i < _sects.length; i++){
						var sect=_sects[i];
						var _items=[];
						for(var _sect in this._value[sect]){
							_items.push(_sect);
						}
						if(_items.length>0){
							var outCond={group:[],operator:"AND",value:null,fieldId:null,btId:null,type:null,users:null};
							outcome.group.push(outCond);
							for(var j=0; j < _items.length; j++){
								var _i=_items[j];
								var _item=this._value[sect][_i];
								var cond={group:null,operator:null,value:[],fieldId:null,btId:null,type:null,users:null};
								var cmp=dijit.byId(_item.o);
								cond.operator=cmp.get("value");
								cmp=dijit.byId(_item.v);
								cond.value.push(cmp.get("value"));
								cond.btId=this.businessTemplateId;
								cond.type=_item.t;
								cond.fieldId=_item.i;
								outCond.group.push(cond);
								if(cond.operator==null){
									return {errorCode:"4"};
								} else if(dojo.string.trim(cond.value[0])==""){
									return {errorCode:"5"};
								}
							}
						} else {
							return {errorCode:"3"};
						}
					}
				} else {
					return {errorCode:"2"};
				}
			}else{
				return {errorCode:"1"};
			}
			return outcome;
		}
	});
});
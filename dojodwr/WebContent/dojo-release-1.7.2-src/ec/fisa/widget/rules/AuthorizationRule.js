define( [ "dojo/_base/kernel", "dojo/_base/declare", "dijit/_Widget",
		"dijit/_Templated", "dojo/on", "dijit/TitlePane",
		"ec/fisa/widget/Link", "dojo/dom-construct", "dojo/dom-geometry",
		"dojo/dom-style", "ec/fisa/controller/custom/BtController", "ec/fisa/widget/rules/RulesComponent",
		"dojox/widget/DialogSimple","dojox/encoding/base64", "dojo/text!./templates/RulesComponent.html",
		"dojox/lang/functional/object","ec/fisa/format/Utils","./_base"],	
		function(dojo,	declare, _Widget, _Templated, on, TitlePane, FisaLink,domConstruct,domGeometry,domStyle, 
				BtController, Rule,DialogSimple,base64, template) {
	return declare("ec.fisa.widget.rules.AuthorizationRule", [Rule], {
		
		authUserForRule:null, //array donde se almacena el id de la jerarquía de usuarios asociada a cada regla.
		
		onlyRead:false, 
		initTableId : null,
		autAll : "Todos",
		autAtLeastOne : "Al menos uno",
		constructor:function(){
			this.inherited(arguments);
			this.authUserForRule=[];
			
		},
		postMixInProperties:function(){
			this.inherited(arguments);
			//seteo el valor del componente de reglas del cual heredo
			this.readOnly=this.onlyRead;
		},
		postCreate : function() {
			this.inherited(arguments);
			var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
			ctrlr.setAuthorizationRule(this);
		},
		initNewRuleLink : function() {// Inicializa el link para creación de  nuevas reglas
			if(!this.onlyRead){
				this.newRuleLink = new FisaLink({label: this.newRuleLabel});
				this.newRuleLink.placeAt(this._newRuleLink);
				if (!this.onlyRead) {
					this.newRuleLink.connect(this.newRuleLink, "onClick", dojo.hitch(this,this.createNewRuleSection));
				}
			}
		},
		createNewRuleSection : function() {
			var newRule = new TitlePane({
				title : "Regla"
			});
			newRule.placeAt(this._ruleContainer);
			var ruleIndex = this.numberOfRules;
			this.numberOfRules++;
			this.rulePaneList[ruleIndex]=newRule;		
			return this.initNewConditionSection(newRule.containerNode,ruleIndex);
		},
		initNewConditionSection:function(/*Nodo dom del title pane*/newRuleNode,ruleIndex){
			var nodes = [];
			//Se inicializan los ids que se usaran posteriormente para recuperar la tabla e inyectarle filas
			var tableId = this.createTableRuleId(ruleIndex);
			var tBodyId = this.createTableBodyRuleId(ruleIndex);
			var authTableId = tableId+"_auth";
			var authTableBodyId = tBodyId+"_auth";
			this.conditionsArray[ruleIndex]={};
			this.numberOfConditionsForRuleIndex[ruleIndex]=0;
			//Se añaden los elementos al dom
			var ruleSectionTable = domConstruct.create("table",{'id':tableId,'rulescompid':this.id, 'ruleindex':ruleIndex,cellpadding:"0",cellspacing:"0",border:"0", width:'60%', 'align':'left'}, newRuleNode);
			var ruleSectionTbody = domConstruct.create("tbody",{'id':tBodyId,'rulescompid':this.id, 'ruleindex':ruleIndex}, ruleSectionTable);
			var authSectionTable = domConstruct.create("table",{'id':authTableId,'rulescompid':this.id, 'ruleindex':ruleIndex, cellpadding:"0",cellspacing:"0",border:"0",width:'40%', 'align':'right'}, newRuleNode);
			var authSectionTbody = domConstruct.create("tbody",{'id':authTableBodyId,'rulescompid':this.id, 'ruleindex':ruleIndex}, authSectionTable);
			var linkSectionTable = domConstruct.create("table",{cellpadding:"0",cellspacing:"0",border:"0",width:'100%'}, newRuleNode);
			var linkSectionTbody = domConstruct.create("tbody",{}, linkSectionTable);
			var linkSectionTr = domConstruct.create("tr",{}, linkSectionTbody);
			
			var initObject = {};
			initObject.tableId = tableId;
			initObject.tBodyId = tBodyId;
			var ruleObject = this.initNewRuleObject(initObject);//Inicia el nuevo objeto que almecenará las condiciones
			
			if(!this.onlyRead){
				//this.sectionRules[ruleObject.index] = ruleObject;
				var newConditionLink = new FisaLink({label: this.newConditionLabel});
				newConditionLink.tableId=tableId;
				newConditionLink.ruleObject=ruleObject;
				newConditionLink.parent=this;
				if (!this.onlyRead) {
					newConditionLink.connect(newConditionLink,"onClick",dojo.hitch(newConditionLink,this.showFieldSelector,null));
				}			
				var linkAddSectionTd = domConstruct.create("td",{'align':'left'}, linkSectionTr);
				newConditionLink.placeAt(linkAddSectionTd);
				var delConditionLink = new FisaLink({label: "Eliminar Regla"});
				delConditionLink.tableId=tableId;
				delConditionLink.ruleObject=ruleObject;
				delConditionLink.parent=this;
				if (!this.onlyRead) {
					delConditionLink.connect(delConditionLink,"onClick",dojo.hitch(this,this.delRule,ruleIndex));
				}				
				var linkDelSectionTd = domConstruct.create("td",{'align':'right'}, linkSectionTr);
				delConditionLink.placeAt(linkDelSectionTd);
				this.links[ruleIndex]=[delConditionLink,newConditionLink];
			}
			return {'ruleSectionTbody':ruleSectionTbody, 'authSectionTbody':authSectionTbody };
		},
		createTableAuthorizationId:function(tableId){
			return  tableId+"_auth";
		},
		
		addItem : function(type, item, ruleContainer, userContainer) {
			var ruleSectionTbody =ruleContainer;
			var autorizationSectionTbody=null;
			if(userContainer){
				autorizationSectionTbody=userContainer;
			}else{
				autorizationSectionTbody= dojo.byId(this.createTableAuthorizationId(ruleContainer.id));
			}
			
			var params={rulesComponentId:this.id,fieldType:type,item:item,ruleContainer:ruleContainer,tabId:this.tabId,pageScopeId:this.pageScopeId};
			var condition = new ec.fisa.widget.rules.Condition(params);
			condition.placeAt(ruleSectionTbody);
			var ruleIndex = condition.ruleIndex;
			var conditionIndex = condition.conditionIndex;
			var rowCount = ruleSectionTbody.rows.length;
			var authRowCount= autorizationSectionTbody.rows.length;
			condition.startup();
			if(rowCount==1 &&  authRowCount==0){
				var trS = domConstruct.create("tr", {'align':'center'}, autorizationSectionTbody);					
				var trA = domConstruct.create("tr", {'align':'center'}, autorizationSectionTbody);					
				
		 		var classValueGrid = "border-top:4px; border-left:4px; solid transparent;color:#1c75bc;padding-top:13px; padding-left:13px";
				var tdA4 = domConstruct.create("td", {style: classValueGrid}, trA);				
				var tdS4 = domConstruct.create("td", {style: classValueGrid}, trS);
				
				var optionTable = domConstruct.create("table",{cellpadding:"0",cellspacing:"0",border:"0",width:'65%'}, tdS4);
				var optionTbody = domConstruct.create("tbody",{}, optionTable);
				var optionTr = domConstruct.create("tr",{'class':'evenFieldBt'}, optionTbody);
				
				tddA4 = domConstruct.create("div", {}, tdA4);
				tdddA1 = domConstruct.create("div", {}, tddA4);
				
				var tdA4 = domConstruct.create("td", {style: classValueGrid}, trA);
				
				var tdS1 = domConstruct.create("td", {'class':'fisaComponentGridHalfLeftCell'}, optionTr); //labels
				var tdS2 = domConstruct.create("td", {'class':'fisaComponentGridHalfRightCell'}, optionTr); // checkbox
				var tdS3 = domConstruct.create("td", {'class':'fisaComponentGridHalfLeftCell'}, optionTr); // labels
				var tdS4 = domConstruct.create("td", {'class':'fisaComponentGridHalfRightCell'}, optionTr); // checkbox
				
				var labelDiv1 = domConstruct.create("div",{}, tdS1);
				var labelDiv2 = domConstruct.create("div",{}, tdS3);
				
				var label1 = domConstruct.create("label", {'class':'fisaLabel',innerHTML:this.autAll}, labelDiv1);
				var label2 = domConstruct.create("label", {'class':'fisaLabel',innerHTML:this.autAtLeastOne}, labelDiv2);
				
				var divS1 = domConstruct.create("div", {}, tdS2);
				var divS2 = domConstruct.create("div", {}, tdS4);
				
				var optionCheckBox1 = new dijit.form.CheckBox({}, divS1);
				var optionCheckBox2 = new dijit.form.CheckBox({}, divS2);
				if(!this.onlyRead){
					optionCheckBox1.connect(optionCheckBox1, 'onChange',dojo.hitch(this,this._setAllChange,optionCheckBox1, optionCheckBox2));
					optionCheckBox2.connect(optionCheckBox2, 'onChange',dojo.hitch(this,this._setOneChange,optionCheckBox1, optionCheckBox2));
				}else{
					optionCheckBox1.set("disabled",true);
					optionCheckBox2.set("disabled",true);
				}
				
				var contentPanel = new dijit.layout.ContentPane({
					doLayout:"false",
					style:"height: auto; overflow: auto; width: 450px; display: block; border: 10px;",
					splitter:"true"						
				}, tddA4);
				var userGrid1 = new ec.fisa.widget.authorization.UserGrid({
					style:"width: 100%;",
					autoHeight:"true",
					label:"Autorizadores",
					tabId:this.tabId,
					pageScopeId:this.pageScopeId,
					onlyRead:this.onlyRead, 
					selectUsers:item.users,
					style:"display: block;",
					isMain:false
				}, tdddA1);
				userGrid1.startup();
				var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
				if (!ctrlr.panelInit) {
					ctrlr.tempUserGrid.push(userGrid1);
				}
				if (item.approvalType != undefined) {
					
					if (item.approvalType == '3') {
						optionCheckBox1.set("checked", true, false);
					} else {
						optionCheckBox2.set("checked", true, false);
					}
				}
				this.conditionsArray[ruleIndex][conditionIndex].usersComponentId=userGrid1.id;
				this.conditionsArray[ruleIndex][conditionIndex].approvalTypeComponentId=optionCheckBox1.id;
				this.authUserForRule[ruleIndex] = {'userGridId':userGrid1.id, 'approvalTypeId':optionCheckBox1.id};
		
			}else{
				this.conditionsArray[ruleIndex][conditionIndex].usersComponentId=this.authUserForRule[ruleIndex].userGridId;
				this.conditionsArray[ruleIndex][conditionIndex].approvalTypeComponentId=this.authUserForRule[ruleIndex].approvalTypeId;
			}
			
			this._fieldSelector.hide();
			
			
		},

		_getValueAttr: function(){
			var newValue = new Object();
			newValue.group = [];
			newValue.btId = this.relatedFieldBt; 
			newValue.fieldId = null;
			newValue.operator = "AND";
			newValue.value = null;
			newValue.users = null;
			newValue.type = null;
			for (var item in this.conditionsArray) {
				var newRule = new Object();
				newRule.group = [];
				newRule.btId = null;
				newRule.fieldId = null;
				newRule.operator = "OR";
				newRule.value = null;
				newRule.users = null;
				newRule.type = null;
				var isEmpty = this._isEmpty(this.conditionsArray[item]);
				if(!isEmpty){
					for (var indice in this.conditionsArray[item]) {
							var condition={group:null,operator:null,value:[],fieldId:null,btId:null,type:null,users:null};	
							temp = this.conditionsArray[item][indice];
							condition.group = [];
							condition.btId = temp.btId; 
							condition.fieldId = temp.fieldId;
							var cmp=dijit.byId(temp.operatorComponentId);
							condition.operator=cmp.get("value");
							cmp=dijit.byId(temp.value1ComponentId);
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
								var cmp1=dijit.byId(temp.value2ComponentId);
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
							if(newRule.users==null){
								newRule.users = dijit.byId(temp.usersComponentId).selection.getSelected();
								if (dojo.byId(temp.approvalTypeComponentId).checked) {
									newRule.approvalType = '3';
								} else {
									newRule.approvalType = '1';
								}
							}
							condition.type = temp.fieldType;
							newRule.group.push(condition);
					}
					newValue.group.push(newRule);
				}
			}
			return newValue;
		},
		_setValueAttr: function(data){
			var finalRule = data[0]; 
			var ruleCondition = data[1]; 
			var selectData = data[2];
			if (finalRule == null || ruleCondition == null || selectData == null) {
				return;
			}
			this._fieldSelector = new dojox.widget.DialogSimple();
			
			for (var i in finalRule.group) {
				var rule = finalRule.group[i]; 
				var usersRule = finalRule.group[i].users;	//
				var approvalType = finalRule.group[i].approvalType;
				var ruleAndAuthorizationSection = this.createNewRuleSection();
				var ruleObject = ruleAndAuthorizationSection.ruleSectionTbody;
				var authorizationSection = ruleAndAuthorizationSection.authSectionTbody;
				
				for (var j in rule.group) {
					var tempItem=null;
					var condition = rule.group[j]; 
					var tBodyId = ruleObject.id;			
					if (condition.type == 'F') {
						var fiels = ruleCondition.fields;
						for (var idf in fiels) {
							if (fiels[idf].id == condition.fieldId){
								tempItem = fiels[idf];
								tempItem['value'] = condition.value;
								tempItem['btId'] = condition.btId;
								tempItem['operator'] = condition.operator;
								tempItem['users'] = usersRule;
								tempItem['approvalType'] = approvalType;
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
								tempItem['users'] = usersRule;
								tempItem['approvalType'] = approvalType;
								break;
							}
						}						
					}
					//si no se encuentra información complementaria de campos parametrizados
					//para reglas no se intenta renderizar esta fila del componente.
					//Esto se evitará con el borrado lógico de los registros de la tabla de 
					//parametrización de reglas:TAUT_AUTHO_FIELD_DETAIL
		
					if(tempItem!=null){
						var item={'id':tempItem.id,'btId':tempItem.btId,'fieldName':tempItem.prompt,'value':tempItem.value,'operator': tempItem.operator,'users':tempItem.users, 'approvalType':tempItem.approvalType,
								'conditionEnable':tempItem.conditionEnable,'dbDataType':tempItem.dbDataType };
						var qtId=tempItem.qtId;
						if(qtId!=null){
							var data = selectData[qtId];
							if(data!=null){
								var qtLabel=tempItem.qtDescription;
								var qtValue=tempItem.qtValue;
								var newData=[];
								dojo.forEach(data,function(it){
									newData.push({'label':it['f'+qtLabel],'value':it['f'+qtValue]});
								},this);
								item['qtItems']=newData;
							}
						}
						var str=dojo.getAttr(ruleObject,'rulescompId');
						var wid=dijit.byId(str);
						wid.addItem(condition.type, item, ruleObject,authorizationSection); 
					}
				}
			}
			
			var fieldSelector=this._fieldSelector;
			delete this._fieldSelector;
			fieldSelector.destroyRecursive(false);
		},
	
		//Combos panel authorizationGrid
		_setOneChange : function(checkAll, checkOne) {		
			if (checkOne == null || checkAll == null) {
				return;
			}
			if (checkOne.checked) {
				checkAll.set("value", false, false);				
			} else {
				checkAll.set("value", true, false);	
			}
		},
		//Combos panel authorizationGrid
		_setAllChange : function(checkAll, checkOne) {
			if (checkAll == null || checkOne == null) {
				return;
			}
			if (checkAll.checked) {
				checkOne.set("checked", false, false);				
			} else {
				checkOne.set("checked", true, false);	
			}
		},
		/* Borra una regla y todas las condiciones */
		delRule:function(idx){
//			console.debug('delRule - AuthorizationRule');
		//	var _this=this.parent;
			var _this=this;
			var vals=_this.authUserForRule[idx];
			_this.destroyAuthorizationComponents(vals);
			var tableId = _this.createTableRuleId(idx);
			var authTableId = _this.createTableAuthorizationId(tableId);
			domConstruct.destroy(authTableId);
			delete _this.authUserForRule[idx];
			_this.inherited(arguments);
		},
		destroyAuthorizationComponents:function(item){
//			console.debug('destroyAuthorizationComponents ');
			var cmp=dijit.byId(item.userGridId);
			cmp.destroy(false);
			cmp=dijit.byId(item.approvalTypeId);
			cmp.destroy(false);
		},
		destroy:function(){
//			console.debug('destroy  AuthorizationRule');
			dojo.forEach(this.authUserForRule,function(item,idx){
				this.destroyAuthorizationComponents(item);
			},this);
			this.inherited(arguments);
		}
		
	});
});

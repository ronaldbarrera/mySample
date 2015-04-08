define( [ "dojo/_base/kernel", "dojo/_base/declare", "dijit/_Widget",
        "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin",
		"dojo/on", "dijit/TitlePane",
		"ec/fisa/widget/Link", "dojo/dom-construct", "dojo/dom-geometry",
		"dojo/dom-style",  "dojo/text!./templates/Condition.html",
		"ec/fisa/widget/DateTextBox","ec/fisa/widget/rules/RulesComponent",
		"dojox/lang/functional/object","./_base","dijit/form/MultiSelect","ec/fisa/widget/TextBox"], function(dojo,
		declare, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, on, TitlePane, FisaLink,domConstruct,domGeometry,domStyle, template) {
	return declare("ec.fisa.widget.rules.Condition", [ _Widget, _TemplatedMixin, _WidgetsInTemplateMixin ], {
		//visual styles
		_classValue: "border-top:4px solid transparent;color:#1c75bc;padding-top:13px",
		//data from parent : rules component
		rulesComponentId:null,
		tabId:null,   //necesario para mostrar mensajes del componente de fechas
		pageScopeId:null,  //necesario para mostrar mensajes del componente de fechas
		ruleTableId:null,
		ruleConstainer:null,
		ruleIndex:null,
		//additional data for condition rendering
		item:{},
		fieldType:null,
		//own condition data
		conditionCode:null,
		conditionIndex:null,
		valIdx:null,
		readonly:false,
		_disabledExp:'',
		_readOnlyExp:'',
		_valueCmpType:'ec.fisa.widget.TextBox',
		_baseClassExp:'',
		_visualSizeExp:'',
		_isNumericExp:'',
		_showComplementExp:'',
		//visual components
		_componentField:null,
		_componentOperator:null,
		_componentValue1:null,
		_componentSeparator:null,
		_componentValue2:null,
		_componentDeleteBotton:null,
		templateString : template,
		postMixInProperties:function(){
			var ruleContainer = this.ruleContainer;
			this.ruleTableId= ruleContainer.id;
			this.ruleIndex = dojo.getAttr(ruleContainer,'ruleindex');
			this.valIdx = dojo.getAttr(ruleContainer,'val-idx');
			delete this.ruleContainer;
			if(this.valIdx!=null){
//				console.debug('this.valIdx!=null');
			}else{
				this.conditionIndex=dijit.byId(this.rulesComponentId).numberOfConditionsForRuleIndex[this.ruleIndex];
				this.conditionCode = this._getConditionCode();
				dijit.byId(this.rulesComponentId).numberOfConditionsForRuleIndex[this.ruleIndex]=
					dijit.byId(this.rulesComponentId).numberOfConditionsForRuleIndex[this.ruleIndex]+1;
			}
			if(dijit.byId(this.rulesComponentId).readOnly==true){
				this.readonly=true;
				this._disabledExp='disabled';
				
			}
			if(this.item.qtItems==null){
				switch (this.item.dbDataType){
					case 'BigDecimal':
						this._valueCmpType="ec.fisa.widget.TextBox";
						this._isNumericExp="numeric=true";
						this._textboxBaseClass="textboxBaseClass='dijitTextBox'";
						this._visualSizeExp="visualSize=10";
						this._readOnlyExp='readOnlyValue='+this.readonly;
						this._showComplementExp="showComplement=false"
						break;
					case 'Date':
					case 'DateTime':
						this._valueCmpType="ec.fisa.widget.DateTextBox";
						this._textboxBaseClass="baseClass='dijitTextBox dijitComboBox dijitDateTextBox'";
						this._visualSizeExp="visualSize=15";
						this._readOnlyExp='readOnly='+this.readonly;
						break;
					default:
						this._valueCmpType="ec.fisa.widget.TextBox";
						this._isNumericExp="numeric=false";
						this._textboxBaseClass="textboxBaseClass='dijitTextBox'";
						this._visualSizeExp="visualSize=10";
						this._readOnlyExp='readOnlyValue='+this.readonly;
						this._showComplementExp="showComplement=false"
						break;
				}
				
			}else{
				this._valueCmpType="dijit.form.MultiSelect";
			}
		},
		buildRendering : function() {
			this.inherited(arguments);
			this._setAttributesForFieldComponent();
			this._setAttributesForOperatorComponent();
			this._setAttributesForValueComponent(this._componentValue1,0);
			this._setAttributesForSeparatorComponent();
			this._setAttributesForValueComponent(this._componentValue2,1);

		},
		_setAttributesForFieldComponent:function(){
			this._componentField.set('value',this.item.fieldName);
			this._componentField.set('ruleindex',this.ruleIndex);
			this._componentField.set('conditionindex',this.conditionIndex);
		},
		_setAttributesForOperatorComponent:function(){
			var operatorList = this._filterOperatorsForConditionByFieldDbDataType(this.item.dbDataType);
			this._componentOperator.set('options',operatorList);
			this._componentOperator.set('ruleindex',this.ruleIndex);
			this._componentOperator.set('conditionindex',this.conditionIndex);
			this._componentOperator.set('value',this.item.operator);
			
			if(this.item.conditionEnable!=null&&this.item.conditionEnable!==""){
				this._componentOperator.set('readOnly',this.item.conditionEnable=="1");
			}
		},
		_setAttributesForSeparatorComponent:function(){
			this._componentSeparator.set('value','&nbsp;-&nbsp;');
		},
		_setAttributesForValueComponent:function(component, index){
			component.set('ruleIndex',this.ruleIndex);
			component.set('conditionindex',this.conditionIndex);
			if(this.item.qtItems!=null){
				dojo.forEach(this.item.qtItems, function(item){
					var c = dojo.doc.createElement('option');
					c.innerHTML = item.label;
					c.value = item.value;
					component.containerNode.appendChild(c);
				}, this);
			}
			if(this.item.qtItems!=null){
				if(this.item.value != undefined && this.item.value != null && this.item.value.length>0) {
					component.set("value", this.item.value);
				}
			}else{			
				if(this.item.value != undefined && this.item.value != null && this.item.value.length>=index+1) {
					component.set("value", this.item.value[index]);
				}
			}
		},
		startup:function(){
			this.inherited(arguments);
				this._componentOperator.connect(this._componentOperator,"onChange",
						dojo.hitch( this,function(value){this._onChangeOperator(value);})); 
				this._onChangeOperator();
				if(false == dijit.byId(this.rulesComponentId).readOnly){
					this._componentDeleteBotton.connect(this._componentDeleteBotton,"onClick",dojo.hitch(this,this._deleteCondition));
				}
			dijit.byId(this.rulesComponentId).conditionsArray[this.ruleIndex][this.conditionIndex]=
					{
					'conditionId':this.id,
					'fieldId':this.item.id,
					'btId' : this.item.btId,
					'fieldType':this.fieldType,
					'fieldNameComponentId':this._componentField.id,
					'operatorComponentId':this._componentOperator.id,
					'value1ComponentId':this._componentValue1.id,
					'separatorComponentId':this._componentSeparator.id,
					'value2ComponentId':this._componentValue2.id,
					'deleteButtonComponentId':this._componentDeleteBotton.id
					};	
		},
		_getValueAttr: function(){
//			console.debug('_getValueAttr');
		},
		_setValueAttr: function(value, /*Boolean?*/ priorityChange, /*String?*/ formattedValue){
//			console.debug('_setValueAttr');
		},
		_onChangeOperator:function (value){
//			console.debug('_onChangeOperator '+value);
			if(value==undefined || value==null) {
				value = this._componentOperator.get("value");
			}
			
			if(value){
				if(value=="8"){
					this._componentValue1.set('multiple',true);
				}else{
					this._componentValue1.set('multiple',false);
				}
				if(value=="7"){
					this._showComponents();
				}else{
					this._hideComponents();
				}
				
			}
			else{
				
			}
			
		},
		_hideComponents:function(){
			domStyle.set(this._componentSeparator.domNode,"visibility","hidden");	
			domStyle.set(this._componentValue2.domNode,"visibility","hidden");	
			//this._componentValue2.set("value","");	
		},
		_showComponents:function(){
			domStyle.set(this._componentSeparator.domNode,"visibility","visible");	
			domStyle.set(this._componentValue2.domNode,"visibility","visible");	
		},
		
		_filterOperatorsForConditionByFieldDbDataType: function(dbDataType){
			var operations=[];
			for (var i in dijit.byId(this.rulesComponentId).operators) {
				var op = dijit.byId(this.rulesComponentId).operators[i]; 
				switch (dbDataType){
					case 'String':
						if(op.value=='1' || op.value=='2'  )	{ //Es igual, Es diferente de, Esta en
							operations.push(op);
						}
						if(op.value=='8' && this.item.qtItems!=null){
							operations.push(op);
						}
						break;
					case 'Lob':
						break;
					case 'BigDecimal':
						if(op.value=='8' && this.item.qtItems!=null){
							operations.push(op);
						}else{
							operations.push(op);
						}
						break;
					case 'Date':
					case 'DateTime':
						if(op.value!='8' )	{  //Operador Esta en:
							operations.push(op);
						}						
						break;
				}
			}
			return operations;
		},
		_getConditionCode:function(){
			return this.ruleTableId+'_cond'+this.conditionIndex;
		},
		_deleteCondition:function(){
//			console.debug('_deleteCondition  Condition');
			var tBodyId=dijit.byId(this.rulesComponentId).createTableBodyRuleId(this.ruleIndex);
			var tbody=dojo.byId(tBodyId);
			var trId=this._getConditionCode();
			if(tbody.rows!=null&&tbody.rows.length>0){
				var i=0;
				for(i=0;i<tbody.rows.length;i++){
					if(trId==dojo.getAttr(tbody.rows[i],'conditioncode')){
						var rulesComponent = dijit.byId(this.rulesComponentId);
						//var condition =rulesComponent.conditionsArray[this.ruleIndex][this.conditionIndex];
						//this.destroyRow(condition);
						tbody.deleteRow(i);
						this.destroyCondition();
						delete rulesComponent.conditionsArray[this.ruleIndex][this.conditionIndex];
						
						break;
					}
				}
			}
		},
		destroyCondition:function(){
//			console.debug('destroyCondition  Condition');
//			var cmp=dijit.byId(row.fieldNameComponentId);
//			cmp.destroy(false);
//			cmp=dijit.byId(row.operatorComponentId);
//			cmp.destroy(false);
//			cmp=dijit.byId(row.value1ComponentId);
//			cmp.destroy(false);
//			cmp=dijit.byId(row.separatorComponentId);
//			cmp.destroy(false);
//			cmp=dijit.byId(row.value2ComponentId);
//			cmp.destroy(false);
//			cmp=dijit.byId(row.deleteButtonComponentId);
//			cmp.destroy(false);
			this._componentField.destroy(false);
			this._componentOperator.destroy(false);
			this._componentValue1.destroy(false);
			this._componentSeparator.destroy(false);
			this._componentValue2.destroy(false);
			this._componentDeleteBotton.destroy(false);
			this.destroy(false);
		},
		enableCondition:function(value){
//			console.debug('enableCondition  Condition');
			this._componentOperator.set("disabled",value);
			this._componentValue1.set("disabled",value);
			this._componentValue2.set("disabled",value);
			this._componentDeleteBotton.set("disabled",value);
			
		}
	});
});
define([
		"dijit/_Widget",
		"dijit/_Templated",
		"dojo/_base/declare",
		"dojo/number",
		"dojo/keys",
		"dijit/form/TextBox",
		"ec/fisa/widget/Utils",
		"dojo/text!ec/fisa/widget/templates/OutputTextComplement.html",
		"ec/fisa/widget/OutputText",
		"./_base" ], function(_Widget, _Templated,
					declare, number,  keys, TextBox,  widgetUtils, template) {


	return declare("ec.fisa.widget.OutputTextComplement", [ _Widget, _Templated ], {
		readOnly : true,
		title : "",
		style : "",
		textboxBaseClass : 'dijitTextBox',
		complementBaseClass : 'fisaOutputTextComplement',
		hasCompl : true,
		widgetsInTemplate : true,
		_complementNode : null,
		_componentNode : null,
		_cmpType : "dijit.form.TextBox",
		password: false,
		value:"",
		format:0,
		numeric:false,
		textBoxConfig:dojo.fromJson(dojo.cache("skin","Widget.conf")).TextBox,
		tasasFormat: dojo.config.interestRateFormat, 
		porcentajeFormat: dojo.config.percentageFormat,
		currencyFormat:dojo.config.fisaDefaultCurrency,
		numericFormat: dojo.config.fisaNumericPattern,
		templateString : template,
		styleClass:"",
		_destroyOnRemove: true,
		postMixInProperties : function() {
			this.inherited(arguments);
			if(this.styleClass){
				this.complementBaseClass = this.styleClass;
			}
		},
		postCreate:function(){
			this.inherited(arguments);
			this._valueSetter(this.value);
		},
		buildRendering:function(){
			this.inherited(arguments);
			var visualSizeAttr = null;
			if(this.visualSize>=0){
				visualSizeAttr = this.visualSize;
			}else{
				visualSizeAttr = this.textBoxConfig[dojo.config.fisaTheme].defaultVisualSize;
			}
			var fw =this.textBoxConfig[dojo.config.fisaTheme].textCharWidth*visualSizeAttr;
			fw +=this.textBoxConfig[dojo.config.fisaTheme].padding;
			this._componentNode.style.width=fw+'px';
			if (this.format == 4 || this.format == 5 || this.format == 6 || this.numeric) {
			
				this._componentNode.style.textAlign='right';
			}
		},
		destroy: function() {
			this.inherited(arguments);
		},
		_getRefCmplAttr : function() {
			return this._complementNode.get("ref");
		},
		_setRefCmplAttr : function(value) {
			this._complementNode.set("ref", value);
		},
		_setBindingAttr : function(value) {
			this._componentNode.set("binding", value);
		},
		_getValueAttr : function() {
					return this._componentNode.innerHTML;
				},
		_setValueAttr : function(value, /* Boolean? */priorityChange, /* String? */
						formattedValue) {
				this._valueSetter(value);
		},
		
		_valueSetter: function(value){
					
			if(this.password==true){
				value=this._maskValue(value)
			}
				
			if(value==null || value==""){
				this._componentNode.innerHTML="";
			}else{
  			  if(this.password==true){
			    	this._componentNode.innerHTML=value;
			    }else if(this.format==1 || this.format==2 || this.format==3){
			    	this._componentNode.innerHTML=this.formatDatebyFormatId(value,this.format);
			    }
			    else if(this.format==4){
					this._componentNode.innerHTML=this.formatNumber(value,{pattern: this.numericFormat});
				}else if(this.format==5){
					this._componentNode.innerHTML=this.formatNumber(value,{pattern: this.tasasFormat});
				}else if (this.format==6){
					this._componentNode.innerHTML=this.formatNumber(value,{pattern: this.porcentajeFormat});
				}else {
					this._componentNode.innerHTML=value;
				}
			}
			
		},
		formatNumber: function(/*String*/ value, /*dojo.number.__FormatOptions*/ constraints){
			return ec.fisa.format.utils.formatNumber(value, constraints.pattern);
		},
		formatDatebyFormatId: function(value, formatId){
			return ec.fisa.format.utils.formatDateByFormatId(value,formatId);
		},
		
		_maskValue : function(value){
			var result;
			if(value!=null && value!=""){
				result=value.replace(/./g,"*");
			}
			return result;
		},
		_getComplementAttr : function() {
			return this._complementNode.get("value");
		},
		_setComplementAttr : function(value, /* Boolean? */priorityChange, /* String? */
		formattedValue) {
			this._complementNode.set("value", value);
		},_maskValue : function(value){
			var result="";
			if(value!=null && value!=""){
				result=value.replace(/./g,"*");
			}
			return result;
		}
		

	});
});

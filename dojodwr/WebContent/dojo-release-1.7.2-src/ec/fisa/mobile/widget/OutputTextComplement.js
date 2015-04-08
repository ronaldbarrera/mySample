define([
		"dijit/_Widget",
		"dijit/_Templated",
		"dojo/_base/declare",
		"dojo/text!ec/fisa/mobile/widget/templates/OutputTextComplement.html",
		"./_MvcMixin"], function(_Widget,_Templated,declare,template,MvcMixin) {


	return declare("ec.fisa.mobile.widget.OutputTextComplement", [ _Widget, _Templated, MvcMixin], {
		readOnly : true,
		_componentNode : null,
		password: false,
		value:"",
		format:0,
		styleClass:"",
		ftype:"",
		textBoxConfig:dojo.fromJson(dojo.cache("skin","Widget.conf")).TextBox,
		tasasFormat: dojo.config.interestRateFormat, 
		porcentajeFormat: dojo.config.percentageFormat,
		currencyFormat:dojo.config.fisaDefaultCurrency,
		numericFormat: dojo.config.fisaNumericPattern,
		templateString : template,
		
		constructor:function(){
			this.inherited(arguments);
		},
		
		postMixInProperties : function() {
			this.inherited(arguments);
		},
		
		postCreate:function(){
			this.inherited(arguments);
			if(this.value){
				this._valueSetter(this.value);
			}
		},
		
		buildRendering:function(){
			this.inherited(arguments);
//			if (this.format == 4 || this.format == 5 || this.format == 6) {
//				var visualSizeAttr = null;
//				if(this.visualSize>=0){
//					visualSizeAttr = this.visualSize;
//				}
//				else{
//					visualSizeAttr = this.textBoxConfig[dojo.config.fisaTheme].defaultVisualSize;
//				}
//				var fw =this.textBoxConfig[dojo.config.fisaTheme].textCharWidth*visualSizeAttr;
//				this._componentNode.style.width=fw+'px';
//				this._componentNode.style.textAlign='right';
//			}
		},
		
		startup:function(){
			this.addParamToModel();
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
		//TODO: verificar el this.formatnumber puede ser por el dojo.config.patrones ya que los patrones no existen, por ende se cae
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
					this._componentNode.innerHTML=this.value;//this.formatNumber(value,{pattern: this.numericFormat});
				}else if(this.format==5){
					this._componentNode.innerHTML=this.value;//this.formatNumber(value,{pattern: this.tasasFormat});
				}else if (this.format==6){
					this._componentNode.innerHTML=this.value;//this.formatNumber(value,{pattern: this.porcentajeFormat});
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
		},
		
		_maskValue : function(value){
			var result="";
			if(value!=null && value!=""){
				result=value.replace(/./g,"*");
			}
			return result;
		}
	});
});

define( [ "./_base","dijit/_Widget", "dijit/_Templated", "dojo/_base/declare","dojo/number","dojo/text!./templates/OutputText.html"],
		function(_widgetBase,_Widget, _Templated, declare,number,template) {
				return declare("ec.fisa.widget.OutputText", [ _Widget, _Templated ], {
				readOnly : true,
				_componentNode : null,
				styleClass:"",
				password:false,
				widgetsInTemplate : false,
				value:"",
				format:0,
				numeric:false,
				visualAdapt:true,
				textBoxConfig:dojo.fromJson(dojo.cache("skin","Widget.conf")).TextBox,
				numericFormat: dojo.config.fisaNumericPattern,
				tasasFormat: dojo.config.interestRateFormat, 
				porcentajeFormat: dojo.config.percentageFormat,
				currencyFormat:dojo.config.fisaDefaultCurrency,
				decimalSeparator:dojo.config.decimalSeparator,
				groupSeparator:dojo.config.groupSeparator,
				templateString : template,
				_destroyOnRemove: true,
				postMixInProperties : function() {
					this.inherited(arguments);
					if(this.value==null){
						this.value="";
					}
					if(this.baseClass){
						this.styleClass=this.baseClass;
					}
				},
				postCreate:function(){
					this.inherited(arguments);
					if(this.value){
						this._valueSetter(this.value);
					}
				},
				buildRendering:function(){
					this.inherited(arguments);
					if (this.format == 4 || this.format == 5 || this.format == 6||this.numeric) {
						var visualSizeAttr = null;
						if(this.visualSize>=0){
							visualSizeAttr = this.visualSize;
						}else{
							visualSizeAttr = this.textBoxConfig[dojo.config.fisaTheme].defaultVisualSize;
						}
						var fw =this.textBoxConfig[dojo.config.fisaTheme].textCharWidth*visualSizeAttr;
						fw +=this.textBoxConfig[dojo.config.fisaTheme].padding;
						if(this.visualAdapt){
							this._componentNode.style.width=fw+'px';
							this._componentNode.style.textAlign='right';
						}
					}
				},
				destroyRendering:function(){
					delete this._componentNode;
					this.inherited(arguments);
				},
				_setBindingAttr : function() {
					this._componentNode.set("binding", value);
				},
				_getValueAttr : function() {
					return this.value;
				},
				_setValueAttr : function(value, /* Boolean? */priorityChange, /* String? */
						formattedValue) {
					this._valueSetter(value);
				},
				_valueSetter: function(value){
					this.value=value;
					if(this.password==true){
						value=this._maskValue(value)
					}
						
					if(this.value==null || this.value===""){
						this._componentNode.innerHTML="";
					}else{
						if(this.password==true){
							this._componentNode.innerHTML=value;
						}else if(this.format==1 || this.format==2 || this.format==3){
							this.value=this.formatDatebyFormatId(value,this.format);
					    	this._componentNode.innerHTML=this.value;
					    }else if(this.format==4){
							this.value=this.formatNumber(value,{pattern: this.numericFormat});
							this._componentNode.innerHTML=this.value;
						}else if(this.format==5){
							this.value=this.formatNumber(value,{pattern: this.tasasFormat});
							this._componentNode.innerHTML=this.value;
						}else if (this.format==6){
							this.value=this.formatNumber(value,{pattern: this.porcentajeFormat});
							this._componentNode.innerHTML=this.value;
						}else{
							this._componentNode.innerHTML=value;
						}
					}
					
				},
				_maskValue : function(value){
					var result="";
					if(value!=null && value!=""){
						result=value.replace(/./g,"*");
					}
					return result;
				},
				formatNumber: function(/*String*/ value, /*dojo.number.__FormatOptions*/ constraints){
					return ec.fisa.format.utils.formatNumber(value, constraints.pattern);
				},
				formatDatebyFormatId: function(value, formatId){
					return ec.fisa.format.utils.formatDateByFormatId(value,formatId);
				}
				
			});
		});

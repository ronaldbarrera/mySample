define( [ "dojo/_base/declare", "dojo/number", "dijit/form/NumberTextBox",
		"ec/fisa/widget/Utils","dijit/_Widget", "dijit/_Templated","dojo/regexp",
		"dojo/_base/lang","dojo/text!./templates/NumberTextBox.html","dojo/dom-attr",
		"dojo/has", "dojo/_base/sniff","dojo/string" ],
		function(declare, number, NumberTextBox, widgetUtils,_Widget, _Templated,dregexp,lang,template, domAttr, has) {
			dojo.config.fisaDecimalExp=/[-\+\d\.]/g;
			dojo.config.fisaDecimalTypeExp=/[mMtT]/g;

			return declare("ec.fisa.widget.NumberTextBox", [ _Widget, _Templated ], {
				_fStarted:true,
				baseClass:"",
				widgetsInTemplate : true,
				readOnly:false,
				maxLength:-1,
				maskall:false,
				password:false,
				_readOnlyExp:"",
				_maxLengthExp:"",
				_type:"",
				factor:1,
				tabId:"",
				_tabIndex:0,
				_destroyOnRemove: true,
				pageScopeId:"",
				btId:"",
				fieldId:"",
				decimalSeparator:dojo.config.decimalSeparator,
				groupSeparator:dojo.config.groupSeparator,
				currencyFormat:dojo.config.fisaDefaultCurrency,	
				numericFormat: dojo.config.fisaNumericPattern,
				templateString : template,
				_componentNode:null,
				textboxBaseClass:"",
				noValidInputLabel:"Valor fuera de rango ",
				postMixInProperties : function() {
					if(this.readOnly===true){
						this._readOnlyExp="disabled='disabled'";
					}
					if(this.maxLength>=0){
						this._maxLengthExp="maxLength="+this.maxLength;
					}
					if(this.maskall || this.password){
						this._type = "password";
					}
					if(this.tabindex != null){
						this._tabIndex = this.tabindex;
					}
				},
				buildRendering : function() {
					this.inherited(arguments);
					this._componentNode.textbox.style.textAlign = "right";
					widgetUtils.setAcceptOnlyNumeric(this._componentNode,false);
					this._componentNode._setBlurValue=this._setBlurValue;
					this._componentNode.format=this.format;
					this._componentNode.parse=this.parse;
					this._componentNode.parser=this.parser;
					this._componentNode._getStringValueInEN_USLocale=this._getStringValueInEN_USLocale;
					this._componentNode._fisaConvertAmount=this._fisaConvertAmount;
					this._componentNode._cleanSeparators=this._cleanSeparators;
					this._componentNode._clearErrorMsg=this._clearErrorMsg;
					this._componentNode.handleErrorMsg=this.handleErrorMsg;
					this._componentNode.decimalSeparator=this.decimalSeparator;
					this._componentNode.groupSeparator=this.groupSeparator;
					this._componentNode._refreshState=this._refreshState;
					this._componentNode._onFocus=this._onFocus;
					this._componentNode.validate=this.validate;
					this._componentNode.isInRange= this.isInRange;
					this._componentNode._numberParser= this._numberParser;
					this._componentNode.numericFormat= this.numericFormat;
					this._componentNode.tabId= this.tabId;
					this._componentNode.pageScopeId= this.pageScopeId;
					this._componentNode.btId= this.btId;
					this._componentNode.fieldId= this.fieldId;
					this._componentNode.noValidInputLabel= this.noValidInputLabel;
					this._componentNode.connect(this._componentNode,"onChange",dojo.hitch(this,this._onChangeInterno));


				},
				
				startup:function(){
					this.inherited(arguments);
					//remove the parent tabindex.
					dojo.removeAttr(this.domNode,"tabindex");
					if(has("ie")){
						//Mantis 17193 JCVQ
						this._componentNode.textbox.tabIndex = parseInt(this.tabIndex);
						domAttr.set(this._componentNode.textbox,"tabindex", parseInt(this.tabIndex));
					}
				},
				
				format: function(/*Number*/ value, /*dojo.number.__FormatOptions*/ constraints){
//					console.debug('NumberTextBox.format');
					var pattern =constraints.pattern;
					if(pattern == undefined){
						pattern = this.numericFormat;
					}
					return ec.fisa.format.utils.formatNumber(value, pattern);
				},
				//usado para poder conectarse al onchange al widget.
				_onChangeInterno:function(value){
//					console.debug('NumberTetBox._onChangeInterno '+this.id  );
					if(this.onChange != undefined){
						this.onChange(value);
						}
					},

				
				parse: function(/*String*/ value, /*number.__FormatOptions*/ constraints){
//					console.debug('NumberTextBox.parse '+this.id);
					var parsedValue = NaN;
					if(value && value.length>0){
						value=dojo.string.trim(value);
					}
					if( value ===undefined || value==null || value ==''){ return parsedValue; }
					v = this.parser(value); 
					return v;
				},
				
				parser : function(expression){
//					console.debug('NumberTextBox.parser '+this.id);
					var val = this._cleanSeparators(expression);
					var result=this._numberParser(val);
					return result;
					
				},
				_setBlurValue:function(){
//					console.debug('_setBlurValue' );
					if(this.focused==false){
						this._clearErrorMsg();
						this.factor=1;
						var _val=this.textbox.value;
						var val=null;
						 if(_val!=null&&""!=_val){
							 if(typeof _val == 'string'){
								 val=this._getStringValueInEN_USLocale(_val);
							 }else{	 
								 val=_val;
							 }
						 } 
						 if(isNaN(val)||val==null){
							 this.set('value',null);
						 }else{
							 if (this.isInRange(val,this.factor)){
								 	this.set('value',this._numberParser(val,this.factor)); 
							 }else{
								 this.set('value',null);
								 this.handleErrorMsg(val);
							 }
						 }						 
					}else{ 
						return false;
					}
				},
				_refreshState: function(){
//					console.debug('NumberTextBox._refreshState' );
				},
				
				//llamado cuando se pulsa un boton actualizar
				_getValueAttr : function() {
//					console.debug('NumberTextBox._getValueAttr '+this.id);
						var _val =this._componentNode.get('value');
					if(isNaN(_val)){
						return "";
					}
					return ""+_val;
				},
				_onFocus: function(){
					if(this.disabled){ 
						return; 
					}
				
				},
				validate:function(isFocused){
//					console.debug('NumberTetBox.validate '+this.id  );
					//return true;
					
				},				
				//llamado la primera vez
				_setValueAttr : function(value, /* Boolean? */priorityChange, /* String? */
						formattedValue) {
//					console.debug('NumberTextBox._setValueAttr '+this.id);

					var _val=null;
					if(value!=null&&""!=value){
						_val=this._numberParser(value);
					}
					this._componentNode.set('value',_val,priorityChange);
					if(typeof priorityChange==="boolean"&& (!priorityChange)){
						this._componentNode._pendingOnChange=false;
						this._componentNode._lastValueReported=_val;
					}
				},
				
				_getStringValueInEN_USLocale: function (value){
//					console.debug('_getStringValueInEN_USLocale' );
					var result = null;
					var val = this._cleanSeparators(value);
					if(val.search(dojo.config.fisaDecimalTypeExp)!=-1){
						result = this._fisaConvertAmount(val);
					}else{
						result=val;
					}
					return result;
				},
				_fisaConvertAmount:function(textVal){
//					console.debug('_fisaConvertAmount' );
					var _amount=new String(textVal);
					_amount=_amount.replace(dojo.config.fisaDecimalTypeExp,"");
					var _type=new String(textVal);
					_type=_type.replace(dojo.config.fisaDecimalExp,"");
					_type=_type.toLowerCase();
					this.factor=1;
					if(_type=="m"){
						this.factor =1000000;
					} else if(_type=="t"){
						this.factor = 1000;
					}
					return _amount;
				},
				
				_cleanSeparators:function(value){
					var patron = new RegExp('\\'+this.groupSeparator,'g');
					value=value.replace(patron,'');
					value=value.replace(this.decimalSeparator,'.');
				    return value;
				},
				_getConstraintsAttr:function(constraints){
//					console.debug('_getConstraintsAttr' );
					return this._componentNode.get('constraints');
				},
				_setConstraintsAttr:function(constraints){
//					console.debug('_setConstraintsAttr' );
					this._componentNode.set('constraints',constraints);
				},
				_setEnabledAttr:function(value){
					if(value != null){
						if(value){
							ec.fisa.widget.utils.enableWidget(this._componentNode);
						} else {
							ec.fisa.widget.utils.disableWidget(this._componentNode);
						}
					}
				},
				_getEnabledAttr:function(){
					return ec.fisa.widget.utils.isEnabled(this._componentNode);
				},
				isInRange:function(/*String*/value, factor){
					var result = true;
					var _val =  this._numberParser(value,factor);
					var max = this.constraints.max;
					var  min = this.constraints.min;
					if(_val >max || _val<min){
						result =  false;
					}
					
					return result;
				},
				_numberParser:function(value,factor){
					if(!factor){
						factor=1;
					}
					return number.parse(value,{locale:'en'})*factor;
				},
				_clearErrorMsg: function(){
					var btController=ec.fisa.controller.utils
						.getPageController(this.tabId,
								this.pageScopeId);
						
					if(btController != null && btController != undefined){
					btController.model.clearAllMessages();

						if(btController.messagesPanelId != undefined && btController.messagesPanelId != null){
							var messagesPanel = dijit.byId(btController.messagesPanelId);
							messagesPanel.clearAllMessages();
						}
					}

				},
				handleErrorMsg:function(val){
					var men = this.noValidInputLabel + "["+ this.constraints.max + ", "+ this.constraints.min+"] : "+ val;
					var message = {fieldId:this.fieldId, fieldMsg: men,detail:"", summary:men ,level:{level:40000},origLevel:{level:40000}};
					var cntrlr =ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
					
					if(cntrlr instanceof ec.fisa.controller.custom.BtController){
						message.ftmId=this.btId;
					}
					 	
					cntrlr.updateMsgsPanel([message]);
						
				}
			});
		});
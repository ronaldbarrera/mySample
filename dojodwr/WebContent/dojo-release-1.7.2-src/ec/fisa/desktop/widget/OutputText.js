define( [ "dijit/_Widget", "dijit/_Templated", "dojo/_base/declare", "dojo/text!ec/fisa/desktop/widget/templates/OutputText.html" ],
		function(_Widget, _Templated, declare, template) {

			return declare("ec.fisa.desktop.widget.OutputText", [ _Widget, _Templated ], {
				readOnly : true,
				_componentNode : null,
				widgetsInTemplate : false,
				templateString : template,
				postCreate:function(){
					this.inherited(arguments);
					if(this.value){
						this._componentNode.innerHTML=this.value;
					}
				},
				_setBindingAttr : function() {
					this._componentNode.set("binding", value);
				},
				_getValueAttr : function() {
					return this._componentNode.innerHTML;
				},
				_setValueAttr : function(value, /* Boolean? */priorityChange, /* String? */
						formattedValue) {
					this._componentNode.innerHTML=value;
				}
			});
		});

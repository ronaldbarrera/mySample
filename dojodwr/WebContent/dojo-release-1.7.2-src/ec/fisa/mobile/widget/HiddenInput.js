define( [ "dijit/_WidgetBase", "dijit/_Templated","./_MvcMixin", "dojo/_base/declare","dojo/text!./templates/HiddenInput.html","./_base"],
		function(_Widget, _Templated,MvcMixin, declare,template) {

			return declare("ec.fisa.mobile.widget.HiddenInput", [ _Widget, _Templated, MvcMixin], {
				_input:null,
				ftype:"bt",
				widgetsInTemplate : true,
				classStyle:"",
				templateString : template,
				postMixInProperties:function(){
					this.inherited(arguments);
				},
				startup:function(){
					this.addParamToModel();
				},
				buildRendering:function(){
					this.inherited(arguments);
				},
				_getValueAttr : function() {
					return this._input.value;
				},
				_setValueAttr : function(value, /* Boolean? */priorityChange, /* String? */
						formattedValue) {
					this._input.value=value;
				}
				
			});
		});

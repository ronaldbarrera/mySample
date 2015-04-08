define( [ "dijit/_WidgetBase", 
          "dijit/_Templated",
          "dojo/text!./templates/SimpleSelect.html",
          "dojo/dom-construct", 
          "dojo/_base/declare",
          "./_MvcMixin",
          "dijit/_base/manager",
          "./_base"],
		function(_Widget, _Templated,template,domConstruct, declare,MvcMixin) {

			return declare("ec.fisa.mobile.widget.SimpleSelect", [ _Widget, _Templated,MvcMixin ], {
				_componentNode: null,
				_options: null,
				templateString : template,
				postMixInProperties: function(){
					this.inherited(arguments);
					this.options = dojo.fromJson(this.options);
				},
				
				startup: function(){
					this.inherited(arguments);
					this.addParamToModel();
				},
				
				buildRendering:function(){
					this.inherited(arguments);
					this._setOptionsAttr();
					this.connect(this._componentNode,'onchange',this.onChange);
				},
				
				_setOptionsAttr : function(options) {
					this.options=options||this.options;
					this._componentNode.innerHTML="";
					if(this.options){
						dojo.forEach(this.options,function(opt){
							var opt1 = domConstruct.create("option",{'value':opt.value},this._componentNode);
							opt1.text=opt.label;
						},this);
					}
				},
				
				_getValueAttr : function() {
					return this._componentNode.value;
				},
				
				_setValueAttr : function(value, /* Boolean? */priorityChange, /* String? */
						formattedValue) {
					this._componentNode.value=value;
				},
				
				onChange: function(){
					//funcion sobreescrita
				}
				
			});
		});

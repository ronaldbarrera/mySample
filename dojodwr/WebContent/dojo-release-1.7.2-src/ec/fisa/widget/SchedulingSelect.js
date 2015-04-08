define( [ "dijit/_Widget",
          "dijit/_Templated",
          "dojo/_base/declare",
          "dojo/_base/kernel",
          "dijit/form/Select",
          "dojo/_base/lang",
          "dojo/topic",
          "ec/fisa/controller/Utils",
          "ec/fisa/widget/Utils",
          "./_base" ],
		function(_Widget, _Templated, declare, dojo, Select, lang,  topic,array) {

			return declare("ec.fisa.widget.SchedulingSelect", [ Select ], {
				textBoxConfig:dojo.fromJson(dojo.cache("skin","Widget.conf")).TextBox,
				visualSize:0,
				maxHeight:-1,
				_destroyOnRemove: true,
				buildRendering : function() {
					this.inherited(arguments);
					if(this.visualSize>0){
						var width_comp =(this.textBoxConfig[dojo.config.fisaTheme].textCharWidth*this.visualSize)+5;
						width_comp +=this.textBoxConfig[dojo.config.fisaTheme].padding;
						this.style={'width':width_comp+'px'};
					}
				}
				
			});

		});

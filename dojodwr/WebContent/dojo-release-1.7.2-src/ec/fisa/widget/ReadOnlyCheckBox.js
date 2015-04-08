define( ["dojo/_base/declare", "./CheckBox","dojo/dom-attr","dojo/on"],
		function(declare, CheckBox, domAttr, dojoOn) {

			return declare("ec.fisa.widget.ReadOnlyCheckBox", [CheckBox], {
				_destroyOnRemove: true,
				postMixInProperties: function(){
					this.readOnly=true;
					this.inherited(arguments);
				}
			});
		});

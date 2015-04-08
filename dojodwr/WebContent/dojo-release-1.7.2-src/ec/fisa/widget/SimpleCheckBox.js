define(
		[
		"dojo/_base/declare",
		"dojo/dom-attr",
		"dojo/on",
		"dijit/_Widget",
		"dijit/_Templated",
		"dojo/text!ec/fisa/widget/templates/SimpleCheckBox.html",
		"ec/fisa/controller/Utils",
		"ec/fisa/widget/Utils",
		"dijit/form/CheckBox",
		"./_base"] ,
	function(declare,  domAttr, dojoOn,  _Widget, _Templated, template) {
			return declare("ec.fisa.widget.SimpleCheckBox",[ _Widget, _Templated], {
				widgetsInTemplate : true,
				templateString : template,
				_componentNode:null,	
				tabIndex:null,
				_tabIndex:0,
				_destroyOnRemove: true,
				postMixInProperties : function() {
					this.inherited(arguments);
					if(this.tabIndex != null){
						this._tabIndex = this.tabIndex;
					}
				},
				
				startup: function(){
					this.inherited(arguments);
					this._componentNode.node=this;
				},
				_setValueAttr: function(/*String|Boolean*/ newValue, /*Boolean*/ priorityChange){
					if(newValue == undefined || newValue == null || newValue == ""){
						newValue = false;
					}
					this._componentNode.set('checked',newValue,priorityChange);
				},
				_getValueAttr: function(){
					return this._componentNode.checked;
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
				}
			});
	});
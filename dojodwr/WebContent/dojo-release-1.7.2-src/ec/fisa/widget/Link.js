define([
		"dijit/_Widget",
		"dijit/_Templated",
		"dojo/_base/declare",
		"dojo/dom-style",
		"dojo/dom-attr",
		"dojo/text!ec/fisa/widget/templates/Link.html",
		"dojo/dom-class",
		"ec/fisa/widget/Utils",
		"./_base" ],
		function(_Widget, _Templated, declare,style,domAttr, template,domClass) {
	
	return declare("ec.fisa.widget.Link", [ _Widget, _Templated ], {
		label : '',
		title:'',
		_anchor : null,
		_span:null,
		_componentNode : null,
		_destroyOnRemove: true,
		widgetsInTemplate : true,
		enabled:true,
		linkClass:"fisaLink",
		
		labelClass:"fisaLinkLabel",
		originalColor:"",
		tabIndex:null,
		_tabIndex:0,
		templateString : template,
		
		startup:function(){
			this.inherited(arguments);
			this.originalColor =style.get(this._anchor,"color");
		},
		
		postMixInProperties : function() {
			this.inherited(arguments);
			if(this.tabIndex != null){
				this._tabIndex = this.tabIndex;
			}
		},
		
		destroyRendering:function(){
			delete this.label;
			delete this.title;
			delete this._componentNode;
			this.inherited(arguments);
		},
		_onClick:function(evt){
			if(this.enabled == true){
				dojo.stopEvent(evt);
				this.onClick(evt);
			}
		},
		onClick:function(evt){
			//function to be connected
		},
		_setLabelAttr:function(label){
			this.label = label;
			this._span.innerHTML= label;
		},
		_getLabelAttr:function(){
			return this.label;
		},
		
		_getRefAttr : function() {
			return this._componentNode.get("ref");
		},
		_setRefAttr : function(value) {
			this._componentNode.set("ref", value);
		},
		_getBindingAttr : function(value) {
			return this._componentNode.get("binding");
		},
		_setBindingAttr : function() {
			this._componentNode.set("binding", value);
		},
		_getValueAttr : function() {
			return this._componentNode.get("value");
		},
		_setValueAttr : function(value, /* Boolean? */priorityChange, /* String? */ formattedValue) {
			this._componentNode.set("value", value);
		}, 
		_getBlockedAttr:function(){
			return domAttr.get(this._anchor, "blocked");
		},
		_setBlockedAttr:function(value, priorityChange){
			if(typeof value == "string"){
				value = false;
				if(value == "true"){
					value = true;
				}
			}
			domAttr.set(this._anchor,"blocked", value);
		},
		_setEnabledAttr:function(value){
			if(value != null){
				
				if(dojo.isArray(value) == true){
					value = value[0];
				}
				
				if(typeof value == "string"){
					if(value == "true"){
						value = true;
					}
					else{
						value = false;
					}
				}
				if(value == false){
					domClass.replace(this._anchor,this.linkClass+"Disabled",this.linkClass+"Enabled");
					
				}
				else{
					domClass.replace(this._anchor,this.linkClass+"Enabled",this.linkClass+"Disabled");
					
				}
				
				
				this.enabled = value;
			}
		},
		_getEnabledAttr:function(){
			return ec.fisa.widget.utils.isEnabled(this);
		}
	});
});

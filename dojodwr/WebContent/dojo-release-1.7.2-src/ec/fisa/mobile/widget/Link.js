define([
		"dijit/_Widget",
		"dijit/_Templated",
		"dojo/_base/declare",
		"dojo/dom-style",
		"dojo/dom-attr",
		"dojo/text!ec/fisa/mobile/widget/templates/Link.html",
		"ec/fisa/widget/Utils",
		"ec/fisa/dwr/proxy/QueryTemplateFieldRoutineControllerDWR",
		"./_base" ],
		function(_Widget, _Templated, declare,style,domAttr, template) {
	
	return declare("ec.fisa.mobile.widget.Link", [ _Widget, _Templated ], {
		fieldId:-1,
		fisatabid:'',
		fisapageid:'',
		rowIndex:-1,
		routine:'',
		label : '',
		title:'',
		_anchor : null,
		_span:null,
		_componentNode : null,
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
		
		handleButtonResponse:function(outcome){
			var controller = ec.fisa.controller.utils.getPageController(this.fisatabid,this.fisapageid);
			controller.clearPanelMessage();
			if(outcome.aMsgs){
				controller.updateMsgsPanel(outcome.aMsgs);
			}
			if(outcome.wAxn&&outcome.wAxn=="open"){
				if(outcome.dst.substring(0,4)=="http"){
					window.open(outcome.dst);
				}else{
					var href =location.protocol+"//"+location.host+dojo.config.fisaContextPath;
					var format=outcome.format.toLowerCase();
					var url=dojo.config.fisaContextPath+'/multiregisterLink/format/'+outcome.format;
					url+='/dst/'+outcome.dst;
					window.open(url);	
				}						
			} 					
		},		
		
		destroyRendering:function(){
			delete this.label;
			delete this.title;
			delete this._componentNode;
			this.inherited(arguments);
		},
		_onClick:function(){
			if(this.enabled == true){
			this.onClick();
			}
		},
		onClick:function(){
			QueryTemplateFieldRoutineControllerDWR.executeAction(this.fieldId,this.rowIndex,this.fisatabid,this.fisapageid,this.routine,{callbackScope:this,callback:this.handleButtonResponse});
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
					style.set(this._anchor,"color","gray");
					style.set(this._anchor,"textDecoration","none");
					style.set(this._anchor,"cursor","default");
				}
				else{
					style.set(this._anchor,"textDecoration","underline");
					style.set(this._anchor,"cursor","hand");
					style.set(this._anchor,"color",this.originalColor);
				}
				
				
				this.enabled = value;
			}
		},
		_getEnabledAttr:function(){
			return ec.fisa.widget.utils.isEnabled(this);
		}
	});
});

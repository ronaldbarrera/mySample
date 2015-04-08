define([
		"dijit/_Templated",
		"dijit/layout/ContentPane",
		"dojo/_base/declare",
		"dojo/dom-geometry",
		"dojo/string",
		"dojo/text!ec/fisa/widget/templates/IFrame.html",
		"dojo/dom-class",
		"./_base" ],
		function(_Templated,ContentPane, declare, domGeometry, string, template, domClass) {

			return declare("ec.fisa.widget.IFrame", [ ContentPane ], {
				baseClass: "visualMask",
				src : '',
				format:'',
				width:0,
				height:0,
				_iframe : null,
				
				_originalUrl:null,
				
				iframeTemplate : template,
				_layout: function(changeSize, resultSize){
					this.inherited(arguments);
					var newSize = domGeometry.getMarginBox(this.domNode);
					if(changeSize && changeSize.h){
						newSize.h=changeSize.h;
					}
					if(changeSize && changeSize.w){
						newSize.w=changeSize.w;
					}
				},
				
				buildRendering:function(){
					this.inherited(arguments);
				},
				
				postMixInProperties : function(){
					this.inherited(arguments);
					this._originalUrl = this.src;
					this.content = this.generateReplacements(this._originalUrl);
				},
				
				refresh:function(){
					var tempUrl = this._originalUrl +(this._originalUrl.indexOf("?") == -1 ? "?" : "&");
					tempUrl = tempUrl+ "dojo.preventCache="+ new Date().valueOf();
					
					this.set("content",this.generateReplacements(tempUrl));
				},
				
				
				generateReplacements:function(tempUrl){
					var url = this.src;
					if(tempUrl!= null && tempUrl != undefined){
						url = tempUrl;
					}
					var replacements = {};
					if(this.format == "pdf"){
						replacements = {src:url, width:this.width, height:this.height, format:this.format};
					}
					else if(this.format == "report"){
						replacements = {src:url, width:'100%', height:this.height, format:""};
					}
					else{
						replacements = {src:url, width:this.width, height:this.height, format:this.format};
					}
					return this.replaceVariables(replacements);
				},
				
				
				replaceVariables: function(replacements){
					replacements.iframeTemplate=this.iframeTemplate;
					return string.substitute(replacements.iframeTemplate, replacements, function(value, key){
						if(key.charAt(0) == '!'){
							value = lang.getObject(key.substr(1), false, this);
						}
						if(typeof value == "undefined"){ 
							throw new Error("No hay valor de reemplazo para:"+key); 
						} // a debugging aide
						if(value == null){ return ""; }
						
						// Substitution keys beginning with ! will skip the transform step,
						// in case a user wishes to insert unescaped markup, e.g. ${!foo}
						return key.charAt(0) == "!" ? value :
						// Safer substitution, see heading "Attribute values" in
						// http://www.w3.org/TR/REC-html40/appendix/notes.html#h-B.3.2
						value.toString().replace(/"/g,"&quot;"); //TODO: add &amp? use encodeXML method?
					}, replacements);
				},
				startup: function(){
					this.inherited(arguments);
					// Remove the unwanted content pane class.
					domClass.remove(this.domNode, "dijitContentPane");
					//Set proper style
					domClass.add(this.domNode, "visualMask");

				}
			});
		});


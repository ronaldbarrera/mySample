define([
		"dojo/_base/declare",
		"dijit/_Widget",
		"dijit/_Templated",
		"dojo/_base/kernel",
		"dojo/text!ec/fisa/widget/templates/ImageText.html",
		"./_base" ],
		function(declare,_Widget,_Templated, dojo, template) {

			return declare("ec.fisa.widget.ImageText", [_Widget,_Templated ], {
				btId:'',
				fieldId:'',
				tabId:'',
				pageScopeId:'',
				label:"",
				src:"",
				alt:"",
				height:"",
				width:"",
				classSufix:"",
				showLabel:true,
				_labelStyle:"display:inline-block;",
				_heightExpr:"",
				_widthExpr:"",
				_destroyOnRemove: true,
				templateString : template,
				destroyRendering:function(){
					delete this.btId;
					delete this.fieldId;
					delete this.tabId;
					delete this.pageScopeId;
					delete this.label;
					delete this.src;
					delete this.alt;
					delete this.showLabel;
					this.inherited(arguments);
				},
				postMixInProperties:function(){
					this.inherited(arguments);
					if(this.showLabel==false){
						this._labelStyle="display:none;";
					}
					if(this.height!=""){
						this._heightExpr=" height='"+this.height+"'";
					}
					if(this.width!=""){
						this._widthExpr=" width='"+this.width+"'";
					}
				}
			});
		});

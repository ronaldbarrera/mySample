define([
	"dijit/_Widget", 
	"dijit/_Templated", 
	"dojo/_base/declare",
	"dojo/dom-style",
	"dojo/html",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!ec/fisa/widget/templates/AddTabController.html",
	"dijit/form/Button",
	"./_base"
 ],
function(_Widget, _Templated, declare, domStyle, html, _TemplatedMixin,_WidgetsInTemplateMixin, template){
	return declare("ec.fisa.widget.AddTabController", [_Widget, _Templated, _TemplatedMixin, _WidgetsInTemplateMixin], {
		fisaTabMaxNumber: dojo.config.fisaTabMaxNumber,
		widgetsInTemplate:true,
		nuevoTabMensaje:dojo.config.fisaNewTabLabel,
		_newTabBtn:null,
		templateString : template,
		startup:function(){
			this.inherited(arguments);
			domStyle.set(this.domNode, "visibility", "");
			if(this.fisaTabMaxNumber<=1){
				domStyle.set(this._newTabBtn.domNode,"visibility",'hidden');
			}
		}
	});
});
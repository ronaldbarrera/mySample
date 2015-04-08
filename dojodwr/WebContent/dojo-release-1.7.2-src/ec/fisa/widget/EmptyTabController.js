define([
	"dijit/_Widget", 
	"dijit/_Templated", 
	"dojo/_base/declare",
	"dojo/dom-style",
	"dojo/html",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/form/Button",
    "./_base"
 ],
function(_Widget, _Templated, declare, domStyle, html, _TemplatedMixin,_WidgetsInTemplateMixin){
	return declare("ec.fisa.widget.EmptyTabController", [_Widget, _Templated, _TemplatedMixin, _WidgetsInTemplateMixin], {
		agendaUrl:dojo.config.fisaToDosUrl,
		agendaTitle:dojo.config.fisaToDosTitle,
		widgetsInTemplate:true,
		nuevoTabMensaje:dojo.config.fisaNewTabLabel,
		_newTabBtn:null,
		fisaTabMaxNumber: dojo.config.fisaTabMaxNumber,
		templateString : dojo.cache("ec.fisa.widget.EmptyTabController",
		"../templates/EmptyTabController.html"),
		startup:function(){
			this.inherited(arguments);
			domStyle.set(this.domNode, "visibility", "");
		}
	});
});
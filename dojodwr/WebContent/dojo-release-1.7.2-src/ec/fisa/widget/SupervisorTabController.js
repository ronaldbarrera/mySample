define([
	"dijit/_Widget", 
	"dijit/_Templated", 
	"dojo/_base/declare",
	"dojo/dom-style",
	"dojo/html",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!ec/fisa/widget/templates/SupervisorTabController.html",
	"dijit/form/Button",
	"./_base"
 ],
function(_Widget, _Templated, declare, domStyle, html, _TemplatedMixin,_WidgetsInTemplateMixin, template){
	return declare("ec.fisa.widget.SupervisorTabController", [_Widget, _Templated, _TemplatedMixin, _WidgetsInTemplateMixin], {
		agendaUrl:dojo.config.fisaToDosUrl,
		agendaTitle:dojo.config.fisaToDosTitle,
		supervisorAgendaUrl:dojo.config.fisaSupervisorToDosUrl,
		supervisorAgendaTitle:dojo.config.fisaSupervisorToDosTitle, 
		widgetsInTemplate:true,
		_newTabBtn:null,
		templateString : template,
		_destroyOnRemove: true,
		startup:function(){
			this.inherited(arguments);
			domStyle.set(this.domNode, "visibility", "");
		}
	});
});
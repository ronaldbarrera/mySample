define([
		"dijit/_Widget",
		"dijit/_Templated",
		"dojo/_base/declare",
		"dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin",
		"dojo/text!ec/fisa/widget/templates/GenericTabController.html",
		"./_base" ],
		function(_Widget, _Templated, declare,_TemplatedMixin, _WidgetsInTemplateMixin, template) {

			return declare("ec.fisa.widget.GenericTabController", [ _Widget, _Templated, _TemplatedMixin, _WidgetsInTemplateMixin ], {
				_cmpType : dojo.config.fisaToDosWidget,
				widgetsInTemplate:true,
				templateString : template
			});
		});

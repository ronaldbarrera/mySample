define(
		[ "dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/lang",
				"ec/fisa/controller/BaseController", "ec/fisa/format/Utils",
				"dojo/_base/window", "dojo/dom",
				"dojox/mvc", "dojox/mvc/StatefulModel",
				"dojox/lang/functional/object", "dojo/store/Memory",
				"dojo/data/ItemFileReadStore", "dojo/date/locale",
				"ec/fisa/navigation/Utils", "ec/fisa/dwr/Store",
				"dojox/widget/DialogSimple"],
		function(dojo, declare, lang, BaseController, formatUtils,win, dom, mvc,
				StatefulModel, FisaUtils) {
			var MenuController = declare(
					"ec.fisa.controller.tsc.MenuController",
					BaseController,
					{
											
						tabContainerId : null,
						controllerList : null,
						data : null,
						tabId : null,
						pageScopeId : null,
						model : null,
						cmps : null,
						
						constructor : function(tabId, pageScopeId) {
							this.tabId = tabId;
							this.pageScopeId = pageScopeId;	
							this.model={};
					     	this.cmps={};
						}		
					});
			return MenuController;
		});
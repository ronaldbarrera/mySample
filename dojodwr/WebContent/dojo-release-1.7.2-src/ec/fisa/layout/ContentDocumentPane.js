define([
	"dojo/_base/lang", // lang.mixin lang.delegate lang.hitch lang.isFunction lang.isObject
	"dojo/_base/declare", // declare
	"dojo/_base/Deferred", // Deferred
	"dojox/layout/ContentPane", // dom.byId
	"dojo/_base/xhr", // xhr.get
	"ec/fisa/controller/Utils"
], function(lang, declare, Deferred, ContentPane, xhr){

return declare("ec.fisa.layout.ContentDocumentPane", ContentPane, {
	
	tabId:null,
	pageScopeId:null,
	
    
    startup:function(){
    	 this.inherited(arguments);
    	   ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId).initTreeGrid(this);
    }
	
});

});

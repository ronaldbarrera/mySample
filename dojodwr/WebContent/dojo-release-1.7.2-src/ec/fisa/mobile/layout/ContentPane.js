define([
	"dojo/_base/lang",
	"dojo/_base/declare",
	"dojo/_base/Deferred", 
	"dojox/mobile/ContentPane", 
	"dojo/_base/xhr",
	"dojo/_base/window"
], function(lang, declare, Deferred, ContentPane, xhr,win){

return declare("ec.fisa.mobile.layout.ContentPane", ContentPane, {
	ioArgs: {},
	_setHrefAttr: function(/*String*/href){
		// tags:
		//		private
		if(this.lazy || !href || href === this._loaded){
			this.lazy = false;
			return null;
		}
		var p = this._p;
		if(p){
			win.body().appendChild(p.domNode);
			p.start();
		}
		this._set("href", href);
		this._loaded = href;
		return xhr.get(lang.mixin({
			url: href,
			handleAs: "text",
			load: lang.hitch(this, "loadHandler"),
			error: lang.hitch(this, "errorHandler")},this.ioArgs));
	}
});
});
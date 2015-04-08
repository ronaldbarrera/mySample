define([
	"dojo/_base/lang", // lang.mixin lang.delegate lang.hitch lang.isFunction lang.isObject
	"dojo/_base/declare", // declare
	"dojo/_base/Deferred", // Deferred
	"dojox/layout/ContentPane", // dom.byId
	"dojo/_base/xhr" // xhr.get
], function(lang, declare, Deferred, ContentPane, xhr){

return declare("ec.fisa.layout.ContentPane", ContentPane, {
	_load: function(){
		// summary:
		//		Load/reload the href specified in this.href

		// display loading message
		this._setContent(this.onDownloadStart(), true);

		var self = this;
		var getArgs = {
			preventCache: (this.preventCache || this.refreshOnShow),
			url: this.href,
			handleAs: "text"
		};
		if(lang.isObject(this.ioArgs)){
			lang.mixin(getArgs, this.ioArgs);
		}

		var hand = (this._xhrDfd = (this.ioMethod || xhr.get)(getArgs));

		hand.addCallback(function(html){
			try{
				var sessionTimeout = hand.ioArgs.xhr.getResponseHeader("LoginRequired");
				if(sessionTimeout){
					location.reload(true);
				}
				self._isDownloaded = true;
				self._setContent(html, false);
				self.onDownloadEnd();
			}catch(err){
				self._onError('Content', err); // onContentError
			}
			delete self._xhrDfd;
			return html;
		});

		hand.addErrback(function(err){
			if(!hand.canceled){
				// show error message in the pane
				self._onError('Download', err); // onDownloadError
			}
			delete self._xhrDfd;
			return err;
		});

		// Remove flag saying that a load is needed
		delete this._hrefChanged;
	}
});

});

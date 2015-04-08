define(["dojo/_base/declare",
        "dojox/widget/DialogSimple",
        "dojo/Deferred",
        "dojo/_base/lang",
        "dojo/_base/fx",
        "dijit/Dialog",
        "dojo/dom-style"], function(declare, DialogSimple, Deferred,lang,fx,Dialog,domStyle){
	
	var FisaDialogSimple = declare("ec.fisa.widget.DialogSimple", [DialogSimple], {
		hideTitleBarNode:null,
		constructor:function(initData){
			this.inherited(arguments);
			this.hideTitleBarNode = initData.hideTitleBarNode;
		},
		hide:function(){
			//JCVQ Mantis 0017433 Se sobreescribe el método original para evitar errores al invocar fx.fadeOut porque domNode es null porque el método destroy se ejecutó antes de que se pueda ejecutar este método
			// summary:
			//		Hide the dialog
			// returns: dojo/promise/Promise
			//		Promise object that resolves when the display animation is complete

			// If we haven't been initialized yet then we aren't showing and we can just return.
			// Likewise if we are already hidden, or are currently fading out.
			if(!this._alreadyInitialized || !this.open){
				return;
			}
			if(this._fadeInDeferred){
				this._fadeInDeferred.cancel();
			}

			// fade-in Animation object, setup below
			var fadeOut;

			this._fadeOutDeferred = new Deferred(lang.hitch(this, function(){
				fadeOut.stop();
				delete this._fadeOutDeferred;
			}));

			// fire onHide when the promise resolves.
			this._fadeOutDeferred.then(lang.hitch(this, 'onHide'));

			// If delay is 0, code below will delete this._fadeOutDeferred instantly, so grab promise while we can.
			var promise = this._fadeOutDeferred.promise;

			if(this.domNode != null && this.domNode){
				//La ejecucion de este método es condicional. Aqui radica la diferencia entre este metodo y el metodo original
				fadeOut = fx.fadeOut({
					node: this.domNode,
					duration: this.duration,
					onEnd: lang.hitch(this, function(){
						this.domNode.style.display = "none";
						DialogLevelManager.hide(this);
						this._fadeOutDeferred.resolve(true);
						delete this._fadeOutDeferred;
					})
				}).play();
			}

			if(this._scrollConnected){
				this._scrollConnected = false;
			}
			var h;
			while(h = this._modalconnects.pop()){
				h.remove();
			}

			if(this._relativePosition){
				delete this._relativePosition;
			}
			this._set("open", false);

			return promise;
		},
		startup:function(){
			this.inherited(arguments);
			if(this.hideTitleBarNode === true){
				domStyle.set(this.titleBar,"display","none");
			}
		}
	});
	
	var DialogLevelManager = Dialog._DialogLevelManager;//Esta variable es usada en el método hide.
	return FisaDialogSimple;
});
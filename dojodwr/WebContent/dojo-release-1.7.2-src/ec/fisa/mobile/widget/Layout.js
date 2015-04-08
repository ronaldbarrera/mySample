define(	[ "dojo/_base/declare",
       	  "dojox/mobile/ContentPane",
          "dojo/_base/kernel",
          "dojo/on",
          "dojo/dom-style",
          "./_base"],
		
	function(declare,ContentPane,dojo,on,domStyle) {
	// Componente creado para modificar el comportamiento de un portlet
	//al ser utilizado dentro de los layouts y para contener una QT;
	//permanece oculto hasta que explicitamente se lo haga visible.
	return declare("ec.fisa.mobile.widget.Portlet",[ContentPane], {
		viewType:'',
		buildRendering:function(){
			this.inherited(arguments);
			if(this.viewType=='ITEM_QUERY_TEMPLATE'){
				domStyle.set(this.domNode, "visibility", "hidden");
			}
		},
		startup:function(){
			this.inherited(arguments);
			if(this.viewType=='ITEM_QUERY_TEMPLATE'){
				domStyle.set(this.domNode, "visibility", "hidden");
			}
		}
	});
});
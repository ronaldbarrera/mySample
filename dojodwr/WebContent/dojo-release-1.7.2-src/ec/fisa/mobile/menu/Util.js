define(["./_base",
        "dijit/registry",
        "dojo/_base/kernel", 
        "dojo/_base/declare", 
        "dojo/dom-construct",
        "dojo/_base/window", 
        "dojox/mobile/Heading",
        "dojox/mobile/ContentPane"], 
        function(fisaMenu,registry,dojo,declare,domConstruct,win,Heading,ContentPane) {

	var Utils = declare("ec.fisa.mobile.menu.Util", null,
			{

		/** Move to menu tab.*/
		moveToMenuTab:function(){
			ec.fisa.mobile.util.initPage.call(this);
			var viewn=dijit.byId("viewPort");
			viewn.params=this.params;
			var item = {itemType:this.params.itemType , 
					relatedUrl:this.params.relatedUrl,
					relatedParameter:this.params.relatedParameter, idParentView:this.params.idParentView};
			var trans= ec.fisa.mobile.menu.utils.loadMenuTabContainer(item);
			if(trans&&this.params.moveTo!=null){
				this.transitionTo("viewPort");
			}
		},

		/**load the url of the Bt and put it into a contentPane*/
		loadMenuTabContainer : function(item , viewParentContainer) {
			var url = null;
			var _self=true;
			if(item.itemType=='BUSINESS_TEMPLATE_CUSTOMIZED_URL'&&item.relatedUrl!=null){
				url = dojo.config.fisaContextPath;
				url += item.relatedUrl;
				url += "?idParentView=";
				url += item.idParentView;
				//se comenta para la funcionalidad de agenda
				//_self=false;
			}else if (item.itemType) {
				url = dojo.config.fisaContextPath;
				url += "/";
				url += item.itemType;
				url += "/";
				url += item.relatedUrl;
				if (item.relatedParameter != null && item.relatedParameter!= "null") {
					url += "/actionMode/";
					url += item.relatedParameter;
				}
				url += "/index.jsp";
			} else {
				url = item.relatedUrl;
			}
			if(_self){
				var cntnPn = new ContentPane({
					href:url
				},domConstruct.create("div",{'class':'mblContentBodyClass'},ec.fisa.mobile.util.buildContentBody.call(this).containerNode));
				cntnPn.startup();
			} else {
				window.location.href=url;
			}
			return _self;
		},

		/*funciones tipo utilitario para abrir y cerrar un simpleDialog*/
		show: function(dlg){
			registry.byId(dlg).show();
		},

		hide: function(dlg){
			registry.byId(dlg).hide();
		}
			});
	fisaMenu.utils = new Utils();
	ec.fisa.mobile.menu.utils = fisaMenu.utils;
	return Utils;
});
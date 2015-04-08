define(["./_base",
        "dijit/registry",
        "dojo/_base/kernel", 
        "dojo/_base/declare", 
        "dojo/_base/lang",
		"dojo/dom-construct",
		"dojo/dom-style",
		"dojox/mobile/Heading",
		"dojox/mobile/Button",
        "dojox/mobile/TabBar",
        "dojox/mobile/TabBarButton",
        "dojox/mobile/ContentPane",
        "dojox/mobile/ScrollableView"], 
		function(fisaMenu,registry,dojo,declare,lang,domConstruct,domStyle,Heading,Button,TabBar,TabBarButton,ContentPane,ScrollableView) {

	var Util = declare("ec.fisa.mobile.Util", null,{
		

		/** Move to menu tab.*/
		initPage:function(){
			var mainContainer =	registry.byId("mobileMainContainer");
			var viewn=dijit.byId("viewPort");
			var isNew = false;
			if(viewn==null){
				isNew = true;
				viewn=new dojox.mobile.View({'id':'viewPort','style':'height:'+window.innerHeight+'px; visibility: visible',
					'idParentView':this.params.idParentView,
					'orientation':'v'},
					domConstruct.create("div",null,mainContainer.containerNode));
			}else{
				viewn.domNode.setAttribute("style","height:"+window.innerHeight.toString().concat("px;"));
				dojo.forEach(viewn.getChildren(),function(cmp){
					cmp.destroyRecursive(false);
				},this);
			}
			return isNew;
		},
		
		buildContentBody:function(){
			var isNew = ec.fisa.mobile.util.initPage.call(this);
			var viewn=dijit.byId("viewPort");
			var viewCntntPn = new ContentPane(null,domConstruct.create("div",null,viewn.containerNode));
			var scrollContainer = new ContentPane(null,domConstruct.create("div",null,viewCntntPn.containerNode));
			viewn.containers={ParentContentID:viewCntntPn.id,scrollContainerID:scrollContainer.id};
			
			viewn.containers.previousContent = viewn.params.idParentView;
			
			ec.fisa.mobile.util.buildHeading.call(this,scrollContainer);
			var heading1 = new dojox.mobile.Heading({
				'label': viewn.params.name,
				'class': 'qtHeadingName',
				'fixed':'top'
			},domConstruct.create("div",null,scrollContainer.containerNode));
			heading1.startup();
			var scroll = new dojox.mobile.ScrollableView(null,domConstruct.create("div",null,scrollContainer.containerNode));
			ec.fisa.mobile.util.loadFooter.call(this,scrollContainer);
			scroll.startup();
			if(isNew){
				viewn.startup();
				viewn.resize();
			} else {
				viewn.show(true,true);
				viewn.resize();
			}
			return scroll;
		},
		

		buildHeading: function(parentContainer){
			var viewn=dijit.byId("viewPort");
			var heading0 = new dojox.mobile.Heading(ec.fisa.mobile.util.headingParams.call(this)
					,domConstruct.create("div",null,parentContainer.containerNode));
			var bck = heading0.backButton;
			bck.previousContent = viewn.containers.previousContent;
			bck.currentContent =   viewn.containers.currentContent;
			
			if(bck && viewn.containers.BtContentPaneID){
				bck.on("click", ec.fisa.mobile.util.back);
			}
			domConstruct.create("div",{'class':'mblHeadingLogo'},heading0.containerNode);
			var accountBtn = new Button({
				'class':'mblHeadingbottonAccount'
			},domConstruct.create("div",null,heading0.containerNode));
			accountBtn.on("click",function(){ec.fisa.mobile.util.show("dlg_account")});
			heading0.startup();
		},
		
		headingParams: function(){
			var params = {'back': dojo.config.fisaReturnButton,'fixed':'top'};
			var viewn=dijit.byId("viewPort");
			if(viewn.containers){
				params.moveTo=viewn.containers.previousContent;
			} else {
				params.moveTo="viewPort";
			}
			return params;
		},

		back: function(){
			var viewn=dijit.byId("viewPort");
			var previousContent = dijit.byId(this.previousContent);
			var currentContent = dijit.byId(this.currentContent);
			domStyle.set(currentContent.domNode,"display","none");
			domStyle.set(previousContent.domNode,"display","block");
			
			
			if(this.currentContent  == viewn.containers.BtContentPaneID){
				var fisaTabId = viewn.fisaTabId;
				var callObj = {
						callbackScope : this,
						callback : ec.fisa.controller.utils.clearControllers
				};
				EventActionDWR.closeTab(fisaTabId,callObj);
				var btContainer = dijit.byId(viewn.containers.BtContentPaneID);
				if(btContainer){
					btContainer.destroyRecursive(false);
				}
				
				viewn.containers.BtContentPaneID="";
				//also destroy documents
				var btDocContainer = dijit.byId(viewn.containers.BtDocumentContentPaneID);
				if(btDocContainer){
					btDocContainer.destroyRecursive(false);
				}
				viewn.containers.BtDocumentContentPaneID=null;
			}
			
			viewn.show(true,true);
			viewn.resize();
		},

		loadAgenda: function(){
			ec.fisa.mobile.util.deselectTabBarButton.call(this);
			ec.fisa.mobile.menu.utils.moveToMenuTab.call(this);
		},
		
		/**
		 * Footer con los atajos generales del sistema
		 * @author Jonathan Guerra
		 * TODO: implementar la accion de opciones y redireccionar
		 */
		loadFooter: function(parentContainer){
			var viewn=dijit.byId("viewPort");
			var tabBar = new TabBar({
				'class':'mblTabBarFooter',
				'single':'true',
				'fixed':'bottom'
			},domConstruct.create("ul",null,parentContainer.containerNode));
			var tab0 = new TabBarButton({
				'label': dojo.config.fisaHomeTab,
				'class':'mblTabBarInicio',
				'moveTo':dojo.config.fsesMoveTo, 
				'transition':'dissolve'},domConstruct.create("li",null,tabBar.domNode));
			var tab1 = new TabBarButton({
				'label':dojo.config.fisaAgendaTab,
				'class':'mblTabBarAgenda',
				'transition':'dissolve',
				'moveTo':'viewPort',
				'name':dojo.config.fisaAgendaTab,
				'idParentView':viewn.params.idParentView,
				'itemType':'BUSINESS_TEMPLATE_CUSTOMIZED_URL',
				'relatedUrl':dojo.config.fsesAgendaUrl,
				'relatedParameter':'',
				'onClick':ec.fisa.mobile.util.loadAgenda},domConstruct.create("li",null,tabBar.domNode));
			var tab2 = new TabBarButton({
				'label':dojo.config.fisaOptionsTab,
				'class':'mblTabBarOpciones'},domConstruct.create("li",null,tabBar.domNode));
			var tab3 = new TabBarButton({
				'label':dojo.config.fisaLogoutTab,
				'class':'mblTabBarSalir',
				'href':dojo.config.fisaContextPath+dojo.config.fsesLogOutUrl},domConstruct.create("li",null,tabBar.domNode));
			ec.fisa.mobile.util.attachFunction([tab0,tab1,tab2,tab3]);
			tabBar.startup();
		},
		
		attachFunction: function(tabArray){
			dojo.forEach(tabArray,function(tab){
				tab.on('click',ec.fisa.mobile.util.deselectTabBarButton);
			},this);
		},

		deselectTabBarButton: function(){
			setTimeout(lang.hitch(this, function(){this.set("selected", false);}), 50);
		},
		
		/*funciones tipo utilitario para abrir y cerrar un simpleDialog*/
		show: function(dlg){
			registry.byId(dlg).show();
		},

		hide: function(dlg){
			registry.byId(dlg).hide();
		}
		
	});
	ec.fisa.mobile.util = new Util();
	return Util;
});

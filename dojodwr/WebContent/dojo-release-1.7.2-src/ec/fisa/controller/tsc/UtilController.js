define(
		[ "dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/lang",
			"dojo/dom-construct", "dojo/on", "ec/fisa/menu/_base",
			"ec/fisa/layout/ContentPane",
			"dijit/layout/AccordionContainer",
			"dijit/layout/BorderContainer", "ec/fisa/widget/Link", "ec/fisa/widget/VerticalMenuLink",
			"dojox/fx", "dojo/fx", "ec/fisa/widget/IFrame" ],
	function(dojo, declare, lang, domConstruct, on, fisaMenu, ContentPane,
			AccordionContainer, BorderContainer, Link, VerticalMenuLink, Fx, dojoFx) {
			var UtilController = declare(
					"ec.fisa.controller.tsc.UtilController",
					null,
					{					
						menuTreeOnClick : function(item, tab, nodeWidget) {
							try {
								// TODO: con el tabContainer verificar si se
								// desea suplantar el contenido del tab
								// appendable si es que el usuario acepta el
								// mensaje
								if (item != null) {
									if (nodeWidget && nodeWidget.isExpandable) {
										nodeWidget.expandoNode.click();
									} else {
										ec.fisa.controller.tsc.UtilController.loadTabContainer(item, tab);
									}
								}
							} catch (e) {
								//if (typeof console != "undefined") {
									// console.log("Error al momento de procesar el click...");
									// console.log(e);
								//}
							}

						},
						
						loadTabContainer:function(item, tab) {
							var mainTab = dijit.byId(tab)
							mainTab.doLayout=false;
							mainTab.startup();
							var newTabPaneArg = {};
							newTabPaneArg.preload = true;
							newTabPaneArg.title = item.name;
							newTabPaneArg.closable = true;
							newTabPaneArg.nested = true;
							
							//creacion del breadcrumb
							var newSubTabPaneArg = {};
							newSubTabPaneArg.title = item.name;
							newSubTabPaneArg.iconClass = "breadcrumbIcon";
							newSubTabPaneArg.preventCache=true;
							newSubTabPaneArg.closable = true;
							newSubTabPaneArg.nested = true;
							
							if (item.itemType=='DIRECT_LINK'){
									newSubTabPaneArg.href = item.relatedUrl;
									newSubTabPane = new ec.fisa.layout.ContentPane(newTabPaneArg);
							}else if (item.itemType!='EXTERNAL_URL') {
								var url = "";
								if(item.itemType=='BUSINESS_TEMPLATE_CUSTOMIZED'){
									url += item.relatedUrl;
								}else{
									url = dojo.config.fisaContextPath;
									url += "/";
									url += item.itemType;
									url += "/";
									url += item.relatedUrl;
								}
								if (item.relatedParameter) {
									url += "/actionMode/";
									url += item.relatedParameter;
								}
								url += "/FDK/";
								if (item.invokeClass==null){
									url += "_FDK";
								}else {
									url += item.invokeClass;
									url += "/_FDK";
								}
								if(item.itemType!='BUSINESS_TEMPLATE_CUSTOMIZED'){
									url += "/index.jsp";
								}
								newSubTabPaneArg.href = url;
								newSubTabPane = new ec.fisa.layout.ContentPane(newSubTabPaneArg); //creacion del nuevo panel
							} else if(item.itemType=='EXTERNAL_URL'){
								newSubTabPaneArg.src = item.relatedUrl;
								newSubTabPane = new ec.fisa.widget.IFrame(newSubTabPaneArg);
							}
							//TODO: DUPLICATE CODE FROM UTILS?
//							else if(item.itemType=='BUSINESS_TEMPLATE_CUSTOMIZED'){
//								
//							}

							mainTab.addChild(newSubTabPane);
							
							if (item.notAppendable) {
								newSubTabPane.appendable = true;
							} else {
								newSubTabPane.appendable = false;
							}
							mainTab.selectChild(newSubTabPane);
							newSubTabPane.callObj = {
									callbackScope : this,
									callback : function() {
							}
							};
							on(newSubTabPane, "close", function() {
								EventActionDWR.closeTab(this.tabId,
										this.callObj);
							});
							
							//newTabPane.startup();
							var newHomeSubTabPaneArg = {};
							newHomeSubTabPaneArg.title = "Home";
							newHomeSubTabPaneArg.iconClass = "breadcrumbIcon";
							newHomeSubTabPaneArg.isHome = true;							
							
							var newHomeSubTabPane = new ec.fisa.layout.ContentPane(
									newHomeSubTabPaneArg);
							newSubTabPane.addChild(newHomeSubTabPane, 0);
							newHomeSubTabPane.controlButton.set("disabled",
									true);
							newHomeSubTabPane.controlButton.onClick = function() {
							};
							
						}		
					});
			fisaMenu.utilController = new UtilController;
			ec.fisa.controller.tsc.UtilController = fisaMenu.utilController;
			return UtilController;
		});
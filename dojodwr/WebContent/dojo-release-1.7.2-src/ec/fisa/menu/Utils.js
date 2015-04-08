define(
		[ "dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/lang","dojo/window",
				"dojo/dom-construct","dojo/dom-style","dojo/dom-geometry", "dojo/on", "ec/fisa/menu/_base",
				"ec/fisa/layout/ContentPane",
				"dijit/layout/AccordionContainer",
				"dijit/layout/BorderContainer", "ec/fisa/widget/Link", "ec/fisa/widget/VerticalMenuLink",
				"dojox/fx", "dojo/fx","dojo/aspect", "ec/fisa/widget/VRootHBranchesAndLeavesMenu","ec/fisa/widget/IFrame","ec/fisa/controller/Utils","dijit/PopupMenuBarItem","dijit/MenuBar","dijit/MenuItem" ],
		function(dojo, declare, lang,win, domConstruct,domStyle,domGeometry, on, fisaMenu, ContentPane,
				AccordionContainer, BorderContainer, Link, VerticalMenuLink, Fx, dojoFx , aspect,vRootHBranchesAndLeavesMenu ) {

			var Utils = declare(
					"ec.fisa.menu.Utils",
					null,
					{
						dynamicMenuCurrentLevel : 0,
						levelsItemMap : {},
						levelBackParentItem : {},
						updatePreferentialOptions:function(prefs){
							var cmpOpts=dojo.byId("menuOptions");
							//delete old nodes
							var toRemoveDOM=[];
							dojo.forEach(cmpOpts.children,function(optn){
								var lid=dojo.getAttr(optn,'fisa-link-id');
								if(lid!=null){
									var link=dijit.byId(lid);
									link.destroy(false);
									link=null;
									toRemoveDOM.push(optn);
								}
							},this);
							for(var i=0;i<toRemoveDOM.length;i++){
								var optn=toRemoveDOM[i];
								toRemoveDOM[i]=null;
								domConstruct.destroy(optn);
							}
							if(prefs!=null&&prefs.options!=null){
								if  (dojo.config.fisaPreferentialMenu=='preferenceMenuButton'){
								dojo.forEach(prefs.options,function(item,idx){
									var div=domConstruct.create("div",{'class':"userMenuContainerMiddleItem"},cmpOpts,idx);
									var table=domConstruct.create("table",{ 'cellpadding':"0", 'cellspacing':"0", 'border':"0"},div);
									//div= null;
									var tbody=domConstruct.create("tbody",{ },table);
									table=null;
									var tr=domConstruct.create("tr",{ },tbody);
									tbody=null;
									var tdIcon=domConstruct.create("td",{ },tr);
									var tdLabel=domConstruct.create("td",{ },tr);
									tr=null;
									var divIcon=domConstruct.create("div",{},tdIcon);
									tdIcon=null;
									var divLabel=domConstruct.create("div",{},tdLabel);
									tdLabel=null;
									var link =new Link({'class':"userMenuContainerMiddleItemLink",'label':item.label},divLabel);
									dojo.setAttr(div,'fisa-link-id',link.id);
									link.item=item;
									item.name=item.label;
									link.connect(link,"onClick",function(){
										ec.fisa.menu.utils.menuTreeOnClick(this.item,{});
									});
								},this);
								cmpOpts=null;
							}else{
								prefs.items=prefs.options;
								ec.fisa.widget.vRootHBranchesAndLeavesMenu.menuPrefLoad(prefs, 'horizontal', true, 'menuOptions',0);
							}
						 }
						},
						updateLocalCurrency:function(localCurrency){
							if(localCurrency!=null){
								dojo.config.fisaDefaultCurrency=localCurrency;
							}
						},
						updateRoles:function(_url,newValue){
							if(newValue==null){
								var cmpSel=dijit.byId("selectCompany");
								_url+=cmpSel.get("value");
							}
							var deferred = dojo.xhrGet( {
							    url: _url,
							    preventCache: true,
							    handleAs: "json",
							    load: this.updateRolesData,
							    error: function(error){
							      alert(error);
							    }
							  });
						},
						updateRolesData:function(data){
							var cmp = dijit.byId("selectRole");
							var itr = cmp.options.length;
							ec.fisa.menu.utils
									.updatePreferentialOptions(data.prefs);
							ec.fisa.menu.utils.updateLocalCurrency(data.prefs);
							 //update the variables with the logout content dynamic data
						    dojo.config.hasLogoutContentDynamic = data.hasLogoutContentDynamic;
							
							dojo.forEach(data.items, function(item, i) {
								if (i == 0) {
									var contains = false;
									var k = -1;
									for ( var j = 0; j < itr; j++) {
										var opt = cmp.options[j];
										if (opt.value == data.value) {
											contains = true;
											k = j;
											break;
										}
									}
									if (!contains) {
										cmp.addOption(item);
									}
									cmp.set("value", item.value);
									var dif = 0;
									for ( var j = 0; j < itr; j++) {
										if (j == k) {
											dif++;
										} else {
											cmp.removeOption(cmp.options[dif]);
										}
									}
								} else {
									cmp.addOption(item);
								}
							}, this);
						},
						updateRolesDataMenu:function(roles,menu, containerId, url, /* String */
								typeMenu, /* String */contextPath){
							this.updateRolesData(roles);
							ec.fisa.menu.utils.menuLoad(menu, typeMenu, true, containerId);
							var selectObj=dijit.byId("selectRole");
							this._containerId=containerId;
							this._url=url;
							this._typeMenu=typeMenu;
							this._contextPath=contextPath;
							setTimeout(dojo.hitch(selectObj,"connect",selectObj,"onChange",ec.fisa.menu.utils.updateMenu),1000);
							
							//Despliega el icono del chat de acuerdo al grupo
							var chatGroupId = dojo.config.fisaChatGroup;
							var chatLink=dojo.byId("chatIconLink");
						    if(chatGroupId != 'null'){
                                domStyle.set(chatLink,"visibility","");
                                domStyle.set(chatLink,"display","");
                                //chatLink._connection=on(chatLink,"click",function(){
                                  //  ec.fisa.navigation.utils.openChat();
                                }
                            else{
                                domStyle.set(chatIconLink,"visibility","hidden");
                                domStyle.set(chatLink,"display","none");
                            }
						},
						/** Updates the left menu of the index.jsp */
						updateMenu : function(roleId) {
							var _url2=ec.fisa.menu.utils._url+"&roleId="+roleId;
							var deferred = dojo.xhrGet( {
							    url: _url2,
							    preventCache: true,
							    handleAs: "json",
							    load: function(data){ec.fisa.menu.utils.menuLoad(data, ec.fisa.menu.utils._typeMenu, true, ec.fisa.menu.utils._containerId);},
									    error: function(error){
										      alert(error);
										    }
									});
						},
						clearTabs:function(){
							var tabContainer = dijit.byId("tabContainer");
							var children=tabContainer.getChildren();
							dojo.forEach(children,function(currentTab){
								var currentIndexTab = tabContainer.getIndexOfChild(currentTab);
								if(currentIndexTab>0){
									tabContainer.closeChild(currentTab);
								}
							},this);
						},
						menuLoad:function(data,typeMenu, updateHome,containerId){
							ec.fisa.menu.utils.clearTabs();
							if(updateHome){
								var item=data.home;
								if(item==null){
									item={'itemType':'DIRECT_LINK'};
								}
								ec.fisa.menu.utils.updateHomeTab(item);
							}
							var containerCntnPn = dijit.byId(containerId);
							var items=data.items;
							var sort=data.sort;
							if(sort && sort == true){
								var itemsTmp=data.items;
								
								//AVI: se ordena por nombre (Manis 17565)
								items = itemsTmp.slice(0).sort(function(a, b) {
									if (a.name < b.name) return -1;
								    if (a.name > b.name) return 1;
								    return 0;
								});
							}
							
								//TODO: GO BACK TO THE FUNCTION
								// TYPEMENU == 'TREE'
								//
								if (typeMenu == 'tree') {
									// this case tree.
									var container = dijit.byId("leftAccordion");
									if(container!=null){
										container.destroyRecursive(false);
									}
									container = new AccordionContainer(
											{
												id : "leftAccordion",
												name : "leftAccordion"
											});
									containerCntnPn.attr("content",
											container);
									dojo
											.forEach(
													items,
													function(item,
															i) {
														var pane = new dijit.layout.ContentPane(
																{
																	title : item.name,
																					/*title : request.store
																					.getValue(
																							item,
																							request.store._labelAttr),*/
																	id : item.id,
																					/*id : request.store
																					.getValue(
																							item,
																							request.store._identifier),*/
																	iconClass : 'fisaTabIcon menuGroupIcon'
																});
														if (i != 0) {
															pane
																	.connect(
																			pane,
																			"onShow",
																			ec.fisa.menu.utils.updateSubMenuTree);
														}
														pane.advChilds = item.childrenItems;
														container
																.addChild(pane);
														if (i == 0) {
															ec.fisa.menu.utils.updateSubMenuTree
																	.call(pane);
															container.selectedChildWidget = pane;
														}
													});
									container.startup();

								} else if(typeMenu == 'slide') {

									ec.fisa.menu.utils
											.updateNavigateMenu(
													items,
													containerCntnPn.id);

								} else if(typeMenu == 'horizontal') {
									ec.fisa.menu.utils
									.updateHorizontalMenu(
											items,
											containerCntnPn.id,"topMenu");
								}else if(typeMenu == 'verticalHorizontal'){
									ec.fisa.widget.vRootHBranchesAndLeavesMenu
									.updateVerticalMixedHorizontalMenu(containerId,items,"vertHorMenu",data,updateHome);
								}
								if(updateHome){
									ec.fisa.menu.utils.menuItems=data.items;
								}
							},
						updateNavigateMenu : function(/* array */items,
								/*
										 * dojo widget
										 */
								containerCntnPnId) {
							// top menu
							var homePanel = dijit.byId("homePanel");
							var tr = domConstruct.create("tr",{},domConstruct.create("tbody",{},domConstruct.create("table",{'border':0,'cellpadding':0,'cellspacing':0},homePanel.domNode)));

							var backLink = new Link({
								region : 'leading',
								baseClass : 'backmenuWidget',
								labelClass : "backmenu"
							},domConstruct.create("div",{},domConstruct.create("td",{'class':'homePanelLeft'},tr)));
							var homeLink = new Link({
								region : 'leading',
								labelClass : "icnhome",
								onClick : function() {
									ec.fisa.menu.utils.loadItems(
											containerCntnPnId, items,
											backLink.id, true,
											null, true);
								}
							},domConstruct.create("div",{},domConstruct.create("td",{'class':'homePanelRight'},tr)));
							tr=null;
							ec.fisa.menu.utils.loadItems(containerCntnPnId,
									items, backLink.id, true, null,
									true);

						},
						/* inits the home menu */
						loadItems : function(/* dojo widget id */containerCntnPnId,/* array */
						items, backLinkId, /* boolean */
						isHomeItems,/* father item */parentItem,/* boolean */
						menuAdvanceFront) {

							// menu options
							var brdtContainer = new BorderContainer({
								gutters : false
							});
							var containerCntnPn = dijit.byId(containerCntnPnId);
							
							containerCntnPn.destroyDescendants(false);
							containerCntnPn.set("content", brdtContainer);
							// childs
							var backLink = dijit.byId(backLinkId);
							if (isHomeItems == false) {
								// true for parent.
								var parentHome = parentItem.isHomeItem
										|| isHomeItems;
								var result = ec.fisa.menu.utils
										.obtainLabelIdVal(parentItem,
												parentHome);
								var labelParent = result[1];
								// add the menu the navigation item. indicatin
								// the father.
								var tempLink = new Link({
									region : 'top',
									baseClass : 'posmenu',
									label : labelParent
								});
								brdtContainer.addChild(tempLink);
//								//update the backlink onclick to new menu
								
								// change value of backlink
								if(backLink.clicked != true){
									backLink.domNode.style.display = "inline-block";
								}
								
								backLink.onClick = function() {
									backLink.domNode.style.display = "none";
									backLink.clicked = true;
									// returns.
									ec.fisa.menu.utils.dynamicMenuCurrentLevel = ec.fisa.menu.utils.dynamicMenuCurrentLevel - 1;
									if (ec.fisa.menu.utils.dynamicMenuCurrentLevel < 0) {
										ec.fisa.menu.utils.dynamicMenuCurrentLevel = 0;

									}
									if (ec.fisa.menu.utils.dynamicMenuCurrentLevel == 0) {
										parentHome = true;
									}
									ec.fisa.menu.utils.backwardAnimate(
											containerCntnPnId, advChilds,
											backLinkId, parentItem, parentHome);
								};

							} else {
								backLink.domNode.style.display = "none";
								// erase object
								if (menuAdvanceFront == true) {
									ec.fisa.menu.utils.dynamicMenuCurrentLevel = 0;
									ec.fisa.menu.utils.levelsItemMap = {};
								}
							}

							// add to a object the levels.
							if (menuAdvanceFront == true) {
								ec.fisa.menu.utils.levelsItemMap[ec.fisa.menu.utils.dynamicMenuCurrentLevel] = items;
								ec.fisa.menu.utils.levelBackParentItem[ec.fisa.menu.utils.dynamicMenuCurrentLevel] = parentItem;
							}

							dojo.forEach(items, function(item, i) {
								// mark parent items with a value.
								if (isHomeItems == true) {
									item.isHomeItem = true;
								}

								var result = ec.fisa.menu.utils
										.obtainLabelIdVal(item,
												isHomeItems);
								var label = result[1];
								var id = result[0];
								var tempLink = new Link({
									region : 'top',
									baseClass : 'menulevel',
									label : label,
									id : id,
									onClick : function() {
										ec.fisa.menu.utils.menuDynamicNavigate(
												containerCntnPnId, item,
												backLinkId, isHomeItems);
									}
								});
								brdtContainer.addChild(tempLink);

							});
							
							
							brdtContainer.connect(brdtContainer,"startup",function(){
								if(backLink.clicked === true){
									backLink.clicked = false;
									if (isHomeItems == false) {
										backLink.domNode.style.display = "block";
									}
									else{
										backLink.domNode.style.display = "none";
									}
								}	
							});
							
							brdtContainer.startup();
							

						},

						/**
						 * function called at the menu to navigate to other menu
						 * or open a bt.
						 */
						menuDynamicNavigate : function(
						/* dojo widget id */containerCntnPnId,/* object */
						item,/* id widget */backLinkId, isHomeItems) {
							var advChilds = ec.fisa.menu.utils
									.obtainChildrenItems(isHomeItems,
											item);

							if (advChilds) {
								ec.fisa.menu.utils.forwardAnimate(
										containerCntnPnId, advChilds,
										backLinkId, item);

							} else {
								ec.fisa.menu.utils.loadMenuTabContainer(item);
							}
						},

						forwardAnimate : function(containerCntnPnId, advChilds,
								backLinkId, item) {
							var anim = Fx.slideBy({
								node : containerCntnPnId,
								duration : 50,
								left : -(dojo.position(containerCntnPnId).w),
								onEnd:function(){
									ec.fisa.menu.utils.dynamicMenuCurrentLevel = ec.fisa.menu.utils.dynamicMenuCurrentLevel + 1;
									ec.fisa.menu.utils.loadItems(
											containerCntnPnId, advChilds,
											backLinkId, false, item,
											true);
								}
							});

							var animReturn = Fx
									.slideBy({
										node : containerCntnPnId,
										duration : 1,
										left : (dojo
												.position(containerCntnPnId).w) * 2
									});

							var animReturn2 = Fx.slideBy({
								node : containerCntnPnId,
								duration : 200,
								left : 0
							});

							dojoFx.chain([ anim, animReturn, animReturn2 ])
									.play();
						},

						backwardAnimate : function(containerCntnPnId, advChilds,
								backLinkId, item, parentHome) {
							var anim = Fx.slideBy({
								node : containerCntnPnId,
								duration : 50,
								left : (dojo.position(containerCntnPnId).w),
								onEnd:function(){
									var advChilds = ec.fisa.menu.utils.levelsItemMap[ec.fisa.menu.utils.dynamicMenuCurrentLevel];
									var parentItem = ec.fisa.menu.utils.levelBackParentItem[ec.fisa.menu.utils.dynamicMenuCurrentLevel];
									ec.fisa.menu.utils.loadItems(
											containerCntnPnId, advChilds,
											backLinkId, parentHome,
											parentItem, false);
								}
							});

							var animReturn = Fx
									.slideBy({
										node : containerCntnPnId,
										duration : 1,
										left : -(dojo
												.position(containerCntnPnId).w) * 2
									});

							var animReturn2 = Fx.slideBy({
								node : containerCntnPnId,
								duration : 200,
								left : 0
							});

							var animBack = dojoFx.chain([ anim, animReturn, animReturn2 ]);
							animBack.play();
							
							
						},

						/** obtain children Items. */
						obtainChildrenItems : function(isHomeItems, item) {
//							if (isHomeItems == true) {
								advChilds = item.childrenItems;
//							} else {
//								advChilds = item.childrenItems;
//							}
							return advChilds;
						},

						/** obtains the id and label for the level of the store. */
						obtainLabelIdVal : function(item, isHomeItems) {
							var label = "";
							var id = "";

//							if (isHomeItems == true) {
								label = item.name;
								id = item.id;
//							} else {
//								label = item[store._labelAttr];
//								id = item[store._identifier];
//							}
							return [ id, label ];
						},

						/** updates submenu tree */
						updateSubMenuTree : function() {
							if (this.advChilds) {
								var memoStore = new dojo.store.Memory({
									data : this.advChilds
								});
								memoStore.idProperty = "id";
								var treeStore = new dojo.data.ObjectStore({
									objectStore : memoStore,
									labelProperty : "name"
								});
								var treeModel = new dijit.tree.ForestStoreModel(
										{
											store : treeStore,
											rootId : "id",
											rootLabel : "name",
											childrenAttrs : [ "childrenItems" ]
										});
								var node = dojo.create("div", null,
										this.domNode);
								var menuTree = new dijit.Tree({
									model : treeModel,
									showRoot : false,
									openOnClick:true,
									getLabelClass:function(item, opened){
										var labelStr = "fisaMenuLevel";
										var n=item.id.match(/_/g);
										if(n!=null&&n.length>=0){
										labelStr+=n.length;
										}
										return labelStr;
									}
								}, node);
								delete this.advChilds;
								menuTree.connect(menuTree,"onClick",ec.fisa.menu.utils.menuTreeOnClick);
							}
						},
						closeTab: function(){
							var tabContainer = dijit.byId("tabContainer");
							if( tabContainer.getChildren() && tabContainer.getChildren().length == 1 ){
								if(tabContainer.getChildren()[0].id != "inicio" ){
									var homeLink=dojo.byId("homeIconLink");
									if(homeLink != undefined && homeLink != null && homeLink['_home'] != null){
										
									ec.fisa.menu.utils.loadMenuTabContainer(homeLink['_home'],true); 
									}
									else{
										
										var currentTab = tabContainer.selectedChildWidget;
										if(currentTab.removedTabToUpdate != true){
											var newTabPaneArg = {};
											newTabPaneArg.preload = true;
											newTabPaneArg.title = dojo.config.fisaHomeLabel;
											newTabPaneArg.closable = true;
											newTabPaneArg.nested = true;
											if(dojo.config.fisaTabMaxNumber==1){
												newTabPaneArg.title = item.name;
												newTabPaneArg.closable = false;
											}
											newTabPaneArg.id = "inicio";
											newTabPaneArg.onClose=ec.fisa.menu.utils.closeTab;
											var	newTabPane = new dijit.layout.TabContainer(newTabPaneArg);


											var closablePane = new dijit.layout.ContentPane({
												title: dojo.config.fisaHomeLabel,
												itemType: "EMPTY_TAB",
												closable: true
											});
											closablePane.onClose = function(){
												return ec.fisa.menu.utils.closeTab();
											};
											newTabPane.addChild(closablePane);
											tabContainer.addChild(newTabPane);
											tabContainer.selectChild(newTabPane);
										}
									}
								}
								else{
									return false;
								}
							}
							return true;
						},
						addEmptyTab: function(titleTab){ 
							var tabContainer = dijit.byId("tabContainer");
							if(tabContainer.getChildren().length >= dojo.config.fisaTabMaxNumber){
									return false;
							}
			   				var closablePane = new dijit.layout.ContentPane({
			   			   	  title: titleTab,
					  	   	  itemType: "EMPTY_TAB",
			      			  closable: true
			    			});
			   				closablePane.onClose = function(){
			   					return ec.fisa.menu.utils.closeTab();
			   				};
			    			tabContainer.addChild(closablePane);
			 				tabContainer.selectChild(closablePane);
						},
						addEmptyTabAllClosed: function(titleTab){ 
							var tabContainer = dijit.byId("tabContainer");
							if(tabContainer.getChildren().length >= 1){
									return false;
							}
			   				var closablePane = new dijit.layout.ContentPane({
			   			   	  title: titleTab,
					  	   	  itemType: "EMPTY_TAB",
			      			  closable: true
			    			});
			   				closablePane.onClose = function(){
			   					return ec.fisa.menu.utils.closeTab();
			   				};
			    			tabContainer.addChild(closablePane);
			 				tabContainer.selectChild(closablePane);
						},
						verifyAgendaTab: function(tabContainer,fisaId){
							var result = false;
							var panes = tabContainer.getChildren();
							var l= panes.length;
							for(var i=0;i<l;i++){
								var fId = panes[i].params.fisaId;
								if(fId && fId==fisaId){
									result = true;
									break;
								}
							}
							return result;
						},						
						menuTreeOnClick : function(item, nodeWidget) {
							try {
								//rip-003
								if  (dojo.config.fisaPreferentialMenu=='preferenceMenuHeader'){ 
									ec.fisa.menu.utils.updateHeaderMenu(item);
								}
								if (item != null) {
									if (nodeWidget && nodeWidget.isExpandable) {
										//Do nothing
									} else {
										ec.fisa.menu.utils.loadMenuTabContainer(item,false);
									}
								}
							} catch (e) {
								alert(e);
//								if (typeof console != "undefined") {
									//console.log("Error al momento de procesar el click...");
									//console.log(e);
//								}
							}

						},
						//creates a new tab for the tab container. with the item from the menu
						loadMenuTabContainer : function(item,isHome,parentTabContainerId,inicioTabId,/*boolean*/fromPlataforma) {
							
							if(parentTabContainerId == undefined || parentTabContainerId == null){
								parentTabContainerId = "tabContainer";
							}
							
							if(inicioTabId == undefined || inicioTabId == null){
								inicioTabId = "inicio";
							}
							
							
							var tabContainer = dijit.byId(parentTabContainerId);
							var currentTab = null;
							if(isHome){
								currentTab=dijit.byId(inicioTabId);
							} else {
								currentTab=tabContainer.selectedChildWidget;
								
							}
							var currentIndexTab = 0;
							var createNewTab = false;
							var overrideTabConfirmationRequired =  true;
							//Variable q indica si ya existe un tag de agenda o agenda supervisor
							var agendaTab = false;
							var currentItemType=null;
							if(currentTab){
								currentIndexTab = tabContainer.getIndexOfChild(currentTab);
								currentItemType=currentTab.params.itemType;
							}
							
							var itemFisaId = item.fisaId;
							
							if(itemFisaId){
								agendaTab=this.verifyAgendaTab(tabContainer,itemFisaId);
							}
							if( (currentItemType && currentItemType=='EMPTY_TAB') || dojo.config.fisaTabMaxNumber==1 || isHome){
								overrideTabConfirmationRequired=false;
							}
							var newTabPaneArg = {};
							newTabPaneArg.fromPlataforma = fromPlataforma;
							newTabPaneArg.preload = true;
							var newSubTabPaneArg = {};
							if(isHome){
								newTabPaneArg.title = dojo.config.fisaHomeLabel;
							} else {
								newTabPaneArg.title = item.name;
							}
							newTabPaneArg.closable = true;
							newTabPaneArg.nested = true;
							
							if(dojo.config.fisaTabMaxNumber==1){
								newTabPaneArg.title = item.name;
								newTabPaneArg.closable = false;
								
							}
							if(itemFisaId){
								newTabPaneArg.fisaId = itemFisaId;
							}
							if(isHome){
								newTabPaneArg.id = inicioTabId;
							}
							//creacion del tab contenedor
							var newTabPane = null;

							var closeTabFunction = function () {
								//always closeTab and clear tab context and unlock Fm
								var contentPanes = this.getChildren();
								var tabIdsObj = {};
								if (contentPanes != null) {
									dojo.forEach(contentPanes, function (item) {
										if (item.tabId != null && item.tabId != "" && tabIdsObj[item.tabId] == null
										) {
											if (item.tabId instanceof Array) {
												dojo.forEach(item.tabId, function (tab) {
													if (tab != null && tab != "" && tabIdsObj[tab] == null) {
														tabIdsObj[tab] = "";
														EventActionDWR.closeTab(tab, this.callObj);
													}
												}, this);
											}
											else {
												EventActionDWR.closeTab(item.tabId, this.callObj);
											}
										}
									}, this);
								}

								if (this.fromPlataforma != true) {
									if (!ec.fisa.menu.utils.closeTab()) {
										return false;
									}
								}

								return true;
							};
							
							
			   				
							if(createNewTab){
								//Antes de crear un nuevo tab, se comprueba que no se haya alcanzado el n�mero m�ximo de tabs abiertos
								if(tabContainer.getChildren().length >= dojo.config.fisaTabMaxNumber){
									return false;
								}
								//Se comprueba que no exista un tab de agenda o supervisor agenda, respectivamente 
								if(agendaTab){
								   return false;
								}
								newTabPane = new dijit.layout.TabContainer(newTabPaneArg);
								tabContainer.addChild(newTabPane);
							}else{
								/*
								 07-11-2013-AS: Se retira alert por solicitud del cliente
								 if(overrideTabConfirmationRequired){
									var conf=confirm(dojo.config.fisaOverrideTabContentMsg);
									if(conf==false){
										return false;
									}
								}*/
								if(currentTab){
									if(currentTab.onClose){
										currentTab.removedTabToUpdate = true;
									currentTab.onClose();
									}
									tabContainer.removeChild(currentTab);
									currentTab.destroyRecursive();
								}
								newTabPane = new dijit.layout.TabContainer(newTabPaneArg);
								
//								newTabPane.watch("title", function (id, oldval, newval) {
//					                console.log( "o." + id + " changed from " + oldval + " to " + newval );
//					                alert("title changed");
//					                return newval;
//					            });
								
								
								tabContainer.addChild(newTabPane,currentIndexTab);
							}
							
							newTabPane.startup();
							if (item.notAppendable) {
								newTabPane.appendable = true;
							} else {
								newTabPane.appendable = false;
							}
							tabContainer.selectChild(newTabPane);
							newTabPane.callObj = {
									callbackScope : this,
									callback : function() {
							}
							};
							
							
							
							newTabPane.onClose = closeTabFunction;
							//creacion del breadcrumb
							newSubTabPaneArg.title = item.name;
							newSubTabPaneArg.iconClass = "breadcrumbIcon";
							newSubTabPaneArg.preventCache=true;

							var newSubTabPane = null;
							if (item.itemType=='DIRECT_LINK'){
								newSubTabPaneArg.href = item.relatedUrl;
								if(newSubTabPaneArg.href){
									newSubTabPane = new ec.fisa.layout.ContentPane(
											newSubTabPaneArg);
								}
							}else if (item.itemType!='EXTERNAL_URL') {
								var url = "";
								var addIndexSuffix=true;
								if(item.itemType=='BUSINESS_TEMPLATE_CUSTOMIZED'){
									url = dojo.config.fisaContextPath;
									url += "/";
									url += item.itemType;
									url += "/";
									url += item.relatedUrl;
									if(item.FISATabId != undefined){
										url += "/parentFisaTabId/";
										url += item.FISATabId;
									}
									if(item.FisaPageScopeId != undefined){
										url += "/parentFisaPageScopeId/";
										url += item.FisaPageScopeId;
									}
									if(item.realId != undefined){
										url += "/menuId/";
										url += item.realId;
									}
									//indica que viene del inicio
									if(item.home != undefined){
										url += "/home/";
										url += item.home;
									}
									if (item.hasChildren) {
										url += "?SubMenuItemId=" + item.realId;
									}
									addIndexSuffix=false;
								}else if(item.itemType=='BUSINESS_TEMPLATE_CUSTOMIZED_URL'&&item.realUrl!=null){
									url = dojo.config.fisaContextPath;
									url += item.realUrl;
									addIndexSuffix=false;
								}else{
									url = dojo.config.fisaContextPath;
									url += "/";
									url += item.itemType;
									url += "/";
									url += item.relatedUrl;
									
									if(item.realId != undefined){
										url += "/menuId/";
										url += item.realId;
									}
									//indica que viene del inicio
									if(item.home != undefined){
										url += "/home/";
										url += item.home;
									}
								}
								if (item.relatedParameter) {
									url += "/actionMode/";
									url += item.relatedParameter;
								}
								
								if(addIndexSuffix){
									url += "/index.jsp";
								}
								//Replica HD17515 JCVQ 13-12-2013
								if(item.lockInsert){
									var ioArgs = {};
									ioArgs.content = {lockInsert:item.lockInsert};
									newSubTabPaneArg.ioArgs = ioArgs;
								}
								//>>
//								// custom param add this to the url to add to the filter.
//								if(item.customParam != undefined && item.customParam != null){
//									dojox.lang.functional.forIn(item.customParam,function(value,id){
//										url += "/"+ id +"/";
//										url += value;
//									});
//									
//								}
								
								if (item.itemType == 'ITEM_QUERY_TEMPLATE' && item.qtParameters != null) {
									url = url + "?initialQtParamValues=" + item.qtParameters;
								}
								this.verifyMenuRoutine(url,newSubTabPaneArg,item,newTabPane);
								
							} else if(item.itemType=='EXTERNAL_URL'){
								newSubTabPaneArg.src = item.relatedUrl;
								newSubTabPaneArg.width = "100%";
								newSubTabPaneArg.height ="100%";
								newSubTabPane = new ec.fisa.widget.IFrame(
										newSubTabPaneArg);
								newTabPane.addChild(newSubTabPane);
								
							}
							//TODO: ??? FIX THIS CODE.
//								else if(item.itemType=='BUSINESS_TEMPLATE_CUSTOMIZED'){
//								
//							}
							// newSubTabPaneArg.doLayout=false;
							var newHomeSubTabPaneArg = {};
							newHomeSubTabPaneArg.title = dojo.config.fisaHomeLabel;
							newHomeSubTabPaneArg.iconClass = "breadcrumbIcon";
							newHomeSubTabPaneArg.isHome = true;
							var newHomeSubTabPane = new ec.fisa.layout.ContentPane(
									newHomeSubTabPaneArg);
							newTabPane.addChild(newHomeSubTabPane, 0);
							newHomeSubTabPane.controlButton.set("disabled",
									true);
							newHomeSubTabPane.controlButton.onClick = function() {
							};

						},
						
						verifyMenuRoutine:function(url,newSubTabPaneArg,item,newTabPane){
							//means it has routine
							if (item.customParam || item.invokeClass) {
								this.callMenuRoutine(url,newSubTabPaneArg,item,newTabPane);
							}
							else{
								newSubTabPaneArg.href = url;
								var newSubTabPane = new ec.fisa.layout.ContentPane(
										newSubTabPaneArg);
								if(newSubTabPane!=null){
									newTabPane.addChild(newSubTabPane);
								}
							}
								/*anchor a cabecera*/
								 ec.fisa.navigation.utils.gotoTop();
							
						},
						
						//call menu routine this item, must have a tab id or pagescope id to obtain a ftm put in cache.
						callMenuRoutine:function(url,newSubTabPaneArg,item,newTabPane){
							
							var callObj={};
							callObj.callbackScope = {"controller":this,"newSubTabPaneArg":newSubTabPaneArg,"newTabPane":newTabPane};
							callObj.errorHandler=dojo.hitch(this,this.errorHandler);
							callObj.callback=this._callMenuRoutineCallBack;
							
							var itemChanged = {};
							dojox.lang.functional.forIn(item,function(value,id){
								itemChanged[id] = ""+value;
							});
							
							EventActionDWR.callMenuRoutine(url,itemChanged,callObj);
						},
						
						//call back from menu routine.
						_callMenuRoutineCallBack:function(outcome){
							if(outcome.wAxn == "refresh"){
								
								this.newSubTabPaneArg.href = outcome.msg;
								var newSubTabPane = new ec.fisa.layout.ContentPane(
										this.newSubTabPaneArg);
								if(newSubTabPane!=null){
									//deletes all previous. children.
									dojo.forEach(this.newTabPane.getChildren(),dojo.hitch(this,function(childPane){
										this.newTabPane.removeChild(childPane);
									}));
									
									this.newTabPane.addChild(newSubTabPane);
								}
							}
							else if(outcome.wAxn == "error"){
								//must come back the tabid and pagescopeid.
								var cntrlr = ec.fisa.controller.utils.getPageController(outcome.FISATabId,outcome.FisaPageScopeId);
								if(cntrlr){
									cntrlr.updateMsgsPanel(outcome.aMsgs);
								}
								else{
									this.newSubTabPaneArg.href = dojo.config.fisaContextPath + "/pages/schedule-errors.jsp";
									this.newSubTabPaneArg.ioArgs = {
											content : {
												'SCHEDULE_ERROR_SUMMARY' : encodeURIComponent(outcome.aMsgs[0].summary),
												'SCHEDULE_ERROR_DETAIL' : encodeURIComponent(outcome.aMsgs[0].summary)
											}
										};
									var newSubTabPane = new ec.fisa.layout.ContentPane(
											this.newSubTabPaneArg);
									if(newSubTabPane!=null){
										//deletes all previous. children.
										dojo.forEach(this.newTabPane.getChildren(),dojo.hitch(this,function(childPane){
											this.newTabPane.removeChild(childPane);
										}));
										
										this.newTabPane.addChild(newSubTabPane);
									}
								}
							}
						},
						
						
						/** hides left menu. */
						showHideLeftMenu : function() {
							ec.fisa.menu.utils.hideMenus("slidepanelleftDiv","brdCntrLeft",dojo.config.fisaStandbyId,true,true);
						},
						
						showHideRightMenu:function(animate){
							ec.fisa.menu.utils.hideMenus("slidepanelrightDiv","brdCntrRight",dojo.config.fisaStandbyId,false, animate);
							
						},
						
						/*hide menus*/
						hideMenus:function(/*String*/ panelButtonNameId,/*String*/ containerToHideId ,/*parent container*/ containerToResize,/*boolean*/ left, animate){
							
							
							var borderContainerWdgt = dijit.byId(containerToHideId);
							var anim = {};
							if (borderContainerWdgt.isHidden == null
									|| borderContainerWdgt.isHidden == false) {
								borderContainerWdgt.prevWidth = dojo
								.position(containerToHideId).w;
								borderContainerWdgt.isHidden = true;
								if(animate){
								anim = Fx.wipeTo({
									node : containerToHideId,
									duration : 2,
									width : 1
								}).play();
								on(
										anim,
										"End",
										function() {
											var tabContainer = dijit.byId(containerToResize);
											tabContainer.resize();		
											var divslid = dojo.byId(panelButtonNameId);
											if(left == true){
											divslid.style.left = "1px";
											}else{
												divslid.style.right = "1px";
											}
										}
										);
								} else {
									var borderContainerDom = dojo.byId(containerToHideId);
									domStyle.set(borderContainerDom,"width",0);
									var tabContainer = dijit.byId(containerToResize);
									tabContainer.resize();
								}
							} else {
								borderContainerWdgt.isHidden = false;
								if(animate){
								var anim2 = Fx.wipeTo({
									node : containerToHideId,
									duration : 2,
									width : borderContainerWdgt.prevWidth
								}).play();
								on(
										anim2,
										"End",
										function() {
											var tabContainer = dijit.byId(containerToResize);
											tabContainer.resize();		
											
											var divslid = dojo.byId(panelButtonNameId);
											if(left == true){
											divslid.style.left = borderContainerWdgt.prevWidth +"px";
											}
											else{
												divslid.style.right = borderContainerWdgt.prevWidth +"px";
											}
											
											}
										);
								}
							}
							
							
						},
						updateHorizontalMenu:function(/* array */items,
								/*
								 * dojo widget
								 */
						containerCntnPnId,/*String*/menuBarId, ignoreOverflow){
							
							var io = ignoreOverflow || false;
							
							var containerCntnPn = dijit.byId(containerCntnPnId);
							var container = dijit.byId(menuBarId);
							if(container!=null){
								container.destroyRecursive(false);
							}
							container = new dijit.MenuBar(
									{
										id : menuBarId,
										name : "topMenu"
									},dojo.create("div",null,containerCntnPn.domNode));
							var menuItemMore = new dijit.PopupMenuBarItem(
								{
								label : ">",
								id : menuBarId+"menu_more_options",
								popup:(new dijit.Menu({parentMenu:container,
									baseClass: "dijitHorizontalSubMenu"})),
								baseClass: "dijitHorizontalSubMenuItem"
								});
							container.addChild(menuItemMore);
							var initialY=domGeometry.position(menuItemMore.domNode).y;
							var overflow=false;
							dojo.forEach(items, function(item, i) {
								if(overflow){
									this.addHorizontalMenuItems(menuItemMore.popup,[this.getMenuItem(item)]);
								}else{
									var itemCnt = new dijit.Menu({parentMenu:container,
										baseClass: "dijitHorizontalSubMenu"});
									var menuItem = new dijit.PopupMenuBarItem(
											{
												label : item.name,
														id : item.id,
																popup:itemCnt,
																baseClass: "dijitHorizontalSubMenuItem",
																hotKey:item.hotKey
											});
									container.addChild(menuItem,i);
									var dim =domGeometry.position(menuItemMore.domNode);
									if(io == false && dim.y!=initialY){
										overflow=true;
										container.removeChild(menuItem);
										menuItem.destroyRecursive(false);
										this.addHorizontalMenuItems(menuItemMore.popup,[this.getMenuItem(item)]);
									} else {
										this.addHorizontalMenuItems(itemCnt,
												item.childrenItems);
									}
								}
							},this);
							if(!overflow){
							container.removeChild(menuItemMore);
							menuItemMore.destroyRecursive(false);
							}
						},
						addHorizontalMenuItems:function(parentItem,subItems){
							if(subItems!=null){
								dojo.forEach(subItems,function(subItem){
									if(subItem.childrenItems!=null){
										var item = new dijit.Menu({parentMenu:parentItem,baseClass: "dijitHorizontalSubMenu"});
										var itemSubMenu=new dijit.PopupMenuItem({label:subItem.name, popup:item, baseClass: "dijitHorizontalSubMenuItem"});
										parentItem.addChild(itemSubMenu);
										domStyle.set(itemSubMenu.arrowWrapper, "visibility", "");
										this.addHorizontalMenuItems(item, subItem.childrenItems);
									}else{
										var params ={onClick:function(){ec.fisa.menu.utils.menuTreeOnClick(this,null);}};
										lang.mixin(params,subItem);
										params.label=subItem.name;
										params.baseClass= "dijitHorizontalMenuItem";
										parentItem.addChild(new dijit.MenuItem(params));
									}
								},this);
							}
						},
						getMenuItem:function(item){
							var _item ={};
							_item['name']=item.name;
							_item['id']=item.id;
							_item['childrenItems']=item.childrenItems;
							return _item;
						},
						updateHomeTab:function(_home){
							var homeLink=dojo.byId("homeIconLink");
							if(_home!=null && 'name' in _home){
								if(homeLink!=null){
									domStyle.set(homeLink,"visibility","");
									domStyle.set(homeLink,"display","");
									homeLink['_home']=_home;
									if(homeLink._connection!=null){
										homeLink._connection.remove();
										homeLink._connection=null;
									}
									homeLink._connection=on(homeLink,"click",function(){
										ec.fisa.navigation.utils.closeCurrentTab();
										ec.fisa.menu.utils.loadMenuTabContainer(this['_home'],true);
										//rip-003
										if  (dojo.config.fisaPreferentialMenu=='preferenceMenuHeader'){ 
											ec.fisa.menu.utils.updateHeaderMenu(this['_home']);
										}
									});
								}
								ec.fisa.menu.utils.loadMenuTabContainer(_home,true);
							} else {
								if(homeLink!=null){
									domStyle.set(homeLink,"visibility","hidden");
									domStyle.set(homeLink,"display","none");
								}
							}
						},
						doResponsive:function(menuType){
//				    		if(console.log){
//				    			console.log("cambios");
//				    		}
				    		if(ec.fisa.menu.utils.menuItems){
				    			var vs = win.getBox();
				    			if(vs.w<800){
				    				ec.fisa.menu.utils.menuLoad({items:[{id:'parent_menu_0000',name:'Tablets Menu',childrenItems:ec.fisa.menu.utils.menuItems}]},menuType, false,'leftMenuCntPn');
				    			} else {
				    				ec.fisa.menu.utils.menuLoad({items:ec.fisa.menu.utils.menuItems},menuType, false,'leftMenuCntPn');
				    			}
				    		}
				    	},
				    	checkUserMenu:function(menuType){
				    		var containerButton=document.getElementById("userMenuContainerTop");
				    		var containerStyle=containerButton.style;
				    		
				    		if(containerStyle.display=="none" && menuType=='verticalHorizontal'){
				    			dojo.byId("userMenuButton").style.display="none";
				    		}
				    		
				    	},
				    	updateHeaderMenu:function(item){
				    		if( item.domNode==null || item.domNode.parentNode.id!="topPrefSubMenu"){
				    			if(item.menuPopup==null){
				    		var containerCntnPnSub = dijit.byId("submenuOptions");
							var containerTitle=document.getElementById("titlePurple");
							containerTitle.innerHTML="<h2>"+item.name+"</h2>";
							var container = dijit.byId("topPrefSubMenu");
							if(container!=null ){
								container.destroyRecursive(false);
							}
							if(item.name!=null){
								item.label=item.name;
							}
							ec.fisa.widget.vRootHBranchesAndLeavesMenu.addHeaderMenuH(item);
							var tabContainer = dijit.byId("tabContainer");
							tabContainer.resize();
							containerCntnPnSub.resize();
							var bodyContainer = dijit.byId("borderContainerBody");
							bodyContainer.resize();
				    			}
						}
				    	}
		
					});
			fisaMenu.utils = new Utils;
			ec.fisa.menu.utils = fisaMenu.utils;
			return Utils;
		});

define( [ "dijit/_Widget","dojo/_base/declare","dojo/dom-geometry","dojo/_base/lang","dojo/dom-style",
          "ec/fisa/menu/Utils","./_base", "ec/fisa/widget/_base"], 
          function(_Widget,
        		  declare, domGeometry,lang,domStyle,menutUtils,fisaWidgetMenu) {

	var VRootHBranchesAndLeavesMenu =  declare("ec.fisa.widget.VRootHBranchesAndLeavesMenu", [ _Widget], {
		menuId:"",
		
		startup:function(){
			this.inherited(arguments);
			
		}, 
	    menuPrefLoad:function(data,typeMenu, updateHome,containerId,menuLevelFlag){
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
			ec.fisa.widget.vRootHBranchesAndLeavesMenu.updateHorizontalPrefMenu(
					items,
					containerCntnPn.id,"topPrefMenu",menuLevelFlag);
			
	    },
	    updateHorizontalPrefMenu:function(/* array */items,
				/*
				 * dojo widget
				 */
		containerCntnPnId,/*String*/menuBarId, menuLevelFlag){
	    	//var io = ignoreOverflow || false;
			
			var containerCntnPn = dijit.byId(containerCntnPnId);
			var container = dijit.byId(menuBarId);
			if(container!=null){
				container.destroyRecursive(false);
			}
			container = new dijit.MenuBar(
					{
						id : menuBarId,
						name : menuBarId
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
							if(item.label!=null)
								item.name=item.label;
								else
									item.label=item.name;
								if(item.childrenItems != null && item.childrenItems.length>0){
									item.children=item.childrenItems;
								}
								if(item.menuItemId == null){
									item.menuItemId=item.realId;
								}

					if(overflow){
						
						ec.fisa.widget.vRootHBranchesAndLeavesMenu.addHorizontalPrefMenuItems(menuItemMore.popup,[item],menuLevelFlag);
					}else{
						
						//container.addChild(menuItem,i);
						//var dim =domGeometry.position(menuItemMore.domNode);
						/*if(io == false && dim.y!=initialY){
							overflow=true;
							container.removeChild(menuItem);
							menuItem.destroyRecursive(false);
							this.addHorizontalPrefMenuItems(menuItemMore.popup,[this.getPrefMenuItem(item)]);
						} else {*/  
							if(item.children!=null && menuLevelFlag==1){
								var itemCnt = new dijit.Menu({parentMenu:container,
									baseClass: "dijitHorizontalSubMenu"});
								
								var menuItem = new dijit.PopupMenuBarItem(
										{
											label : item.label,
													id : "menuPref"+item.menuItemId,
															popup:itemCnt,
															baseClass: "dijitHorizontalSubMenuItem",
															hotKey:item.hotKey
										});	
								container.addChild(menuItem,i);
								ec.fisa.widget.vRootHBranchesAndLeavesMenu.addHorizontalPrefMenuItems(itemCnt,
									item.children,menuLevelFlag);
							}else{
								var params=null;
								if(item.label!=null)
								item.name=item.label;
								else
									item.label=item.name;
								if(item.childrenItems != null && item.childrenItems.length>0){
									item.children=item.childrenItems;
								}
								if(item.children!=null){
									params ={onClick:function(){ec.fisa.widget.vRootHBranchesAndLeavesMenu.menuTreeFirstLevelOnClick(item,i);}};
								}else{
									
									params ={onClick:function(){ec.fisa.widget.vRootHBranchesAndLeavesMenu.menuPreferenceNoChild(this,menuLevelFlag,i);}};
								}
								lang.mixin(params,item);
								if(menuLevelFlag==1){
									params.label=item.label;
								}else{
								params.label="<i class='x-small'></i>"+item.label;
								}
								params.baseClass= "dijitHorizontalSubMenuItem";
								var menItem=	new dijit.MenuBarItem(params);
								container.addChild(menItem,i); 
								var dim =domGeometry.position(menuItemMore.domNode);
								if(dim.y!=initialY){
									overflow=true;
									container.removeChild(menItem);
									menItem.destroyRecursive(false);
									ec.fisa.widget.vRootHBranchesAndLeavesMenu.addHorizontalPrefMenuItems(menuItemMore.popup,[item],menuLevelFlag);
								} 
							}
						//}
					}
				},this);
				
				
				
			
	    },
	    
	    addHorizontalPrefMenuItems:function(parentItem,subItems,menuLevelFlag){
			if(subItems!=null){
				dojo.forEach(subItems,function(subItem){
					if(subItem.label!=null)
								subItem.name=subItem.label;
								else
									subItem.label=subItem.name;
								if(subItem.childrenItems != null && subItem.childrenItems.length>0){
									subItem.children=subItem.childrenItems;
								}
								if(subItem.menuItemId == null){
									subItem.menuItemId=subItem.realId;
								}
					if(subItem.children!=null){
						var item = new dijit.Menu({parentMenu:parentItem,baseClass: "dijitHorizontalSubMenu"});
						var itemSubMenu=new dijit.PopupMenuItem({label:subItem.label, popup:item, baseClass: "dijitHorizontalSubMenuItem"});
						parentItem.addChild(itemSubMenu);
						domStyle.set(itemSubMenu.arrowWrapper, "visibility", "");
						ec.fisa.widget.vRootHBranchesAndLeavesMenu.addHorizontalPrefMenuItems(item, subItem.children,menuLevelFlag);
					}else{
						subItem.menuPopup=1;
						if(subItem.label!=null){
						 subItem.name=subItem.label;
						}else{
							subItem.label=subItem.name;
						}
						var params=null;
						if(menuLevelFlag==0){

							params ={onClick:function(){ec.fisa.widget.vRootHBranchesAndLeavesMenu.menuPreferenceNoChild(this,menuLevelFlag,0);}};
						}else{
						 params ={onClick:function(){ec.fisa.menu.utils.menuTreeOnClick(this,null);}};
						}
						lang.mixin(params,subItem);
						params.label=subItem.label;
						params.baseClass= "dijitHorizontalMenuItem";
						parentItem.addChild(new dijit.MenuItem(params));
					}
				},this);
			}
		},
		
		getPrefMenuItem:function(item){
			var _item ={};
			_item['label']=item.label;
			_item['menuItemId']="menuPref"+item.menuItemId;
			_item['children']=item.children;
			return _item;
		},
		
		menuTreeFirstLevelOnClick : function(item,menuLevelFlag,i) {
			
				var containerTitle=document.getElementById("titlePurple");
				containerTitle.innerHTML="<h2>"+item.name+"</h2>";
			
			var containerCntnPnSub = dijit.byId("submenuOptions");
			var container = dijit.byId("topPrefSubMenu");
			if(container!=null){
				container.destroyRecursive(false);
			}
			ec.fisa.widget.vRootHBranchesAndLeavesMenu.updateHorizontalPrefMenu(
					item.children,
					containerCntnPnSub.id,"topPrefSubMenu",1);
			//migrar spm
			var tabContainer = dijit.byId("tabContainer");
			tabContainer.resize();
			containerCntnPnSub.resize();
			var bodyContainer = dijit.byId("borderContainerBody");
			bodyContainer.resize();
			ec.fisa.widget.vRootHBranchesAndLeavesMenu.firstNodeChildClick(item);
		},
		firstNodeChildClick: function(item,menuLevelFlag){
			//dojo.forEach(item.children, function(child, i) {
			var check=0;
			for(var i=0;i<item.children.length;i++){
				var child = item.children[i];
				if(child.children==null){
					ec.fisa.menu.utils.loadMenuTabContainer(child,false);
					var container = dijit.byId("topPrefSubMenu");
					var cssClass=container.domNode.childNodes[i].className;
					cssClass=cssClass+" preferenceMenuActive ";
					container.domNode.childNodes[i].className=cssClass;
					i=item.children.length;
					check=1;
				}else{
					check=ec.fisa.widget.vRootHBranchesAndLeavesMenu.firstNodeChildClick(child);
					if(check=1){
						i=item.children.length;

					}
				}
			}
			return check;
			//},this);
		},
		
		menuPreferenceNoChild: function (item,nodeLevel,j){
			if(nodeLevel==0){
				var containerTitle=document.getElementById("titlePurple");
				containerTitle.innerHTML="<h2>"+item.name+"</h2>";
			}
			var container = dijit.byId("topPrefSubMenu");
			if(container!=null && nodeLevel==1){
				for(i=0; i < container.domNode.childNodes.length;i++){
					var cssClass=container.domNode.childNodes[i].className;
					
						cssClass=cssClass.replace("preferenceMenuActive", "");
					
					if(j==i){
						cssClass=cssClass+" preferenceMenuActive ";
						
					}
					container.domNode.childNodes[i].className=cssClass;
				}
				
			}
			if(container!=null && nodeLevel==0){
				container.destroyRecursive(false);
			}
			
			if(nodeLevel==0){
			ec.fisa.widget.vRootHBranchesAndLeavesMenu.addHeaderMenuH(item);

							}

			ec.fisa.menu.utils.menuTreeOnClick(item,null);
			//migrar spm
			var tabContainer = dijit.byId("tabContainer");
			tabContainer.resize();
			var bodyContainer = dijit.byId("borderContainerBody");
			bodyContainer.resize();
			
		},

		addHeaderMenuH:function(item ){
			var containerCntnPn = dijit.byId("submenuOptions");
			container = new dijit.MenuBar(
						{
								id : "topPrefSubMenu",
								name : "topPrefSubMenu"
							},dojo.create("div",null,containerCntnPn.domNode));
							var menuItem = new dijit.MenuBarItem(
										{
											label : item.label,
													id : "menuPref"+item.menuItemId,
															
															baseClass: "dijitHorizontalSubMenuItem",
															hotKey:item.hotKey
										});	
							
								container.addChild(menuItem);
								var cssClass=container.domNode.childNodes[0].className;
								cssClass=cssClass+" preferenceMenuActive ";
								container.domNode.childNodes[0].className=cssClass;

		},
		updateVerticalMixedHorizontalMenu: function (containerId,items,menuBarId,data,updateHome){
			//var mainMenu = new Menu({}, "mainMenu");
			if(updateHome){
				var item=data.home;
				if(item.id!=null){
				if(item.name!=null)
				item.label=item.name;
				 var containerTitle=document.getElementById("titlePurple");
				containerTitle.innerHTML="<h2>"+item.name+"</h2>";
				ec.fisa.widget.vRootHBranchesAndLeavesMenu.addHeaderMenuH(item);
				var tabContainer = dijit.byId("tabContainer");
				tabContainer.resize();
				var bodyContainer = dijit.byId("borderContainerBody");
				bodyContainer.resize();
				}
			}
			var containerMain = dijit.byId(containerId);
			
			container = new dijit.Menu(
					{
						id : menuBarId,
						name : menuBarId
					},dojo.create("div",null,containerMain.domNode));
			
			dojo.forEach(items, function(item, i) {
				var params=null;
				item.label=item.name;
				item.children=item.childrenItems;
				if(item.children!=null){
					params ={onClick:function(){ec.fisa.widget.vRootHBranchesAndLeavesMenu.menuTreeFirstLevelOnClick(item,i);}};
				}else{
					
					params ={onClick:function(){ec.fisa.widget.vRootHBranchesAndLeavesMenu.menuPreferenceNoChild(this,0,i);}};
				}
				lang.mixin(params,item);
				params.label=item.label;
				//params.baseClass= "dijitHorizontalSubMenuItem";
			//	container.addChild(new dijit.MenuItem(params),i); 
				menuItemVer=new dijit.MenuItem(params);
				if(item.icon!=null){
				var imagePath = dojo.config.fisaContextPath + "/fisaImages/"+item.icon;
				imagsStr="background-image: url("+imagePath+");";
				classNames=menuItemVer.iconNode.className;
				classNames=classNames.replace("dijitNoIcon", "");
				menuItemVer.iconNode.className=classNames;
				menuItemVer.iconNode.style.cssText =imagsStr;	
			}
				if(item.menuCss!=null){
					menuClassCss=menuItemVer.domNode.className;
					menuClassCss=menuClassCss+" "+item.menuCss;
					menuItemVer.domNode.className=menuClassCss;
					
				}
				//menuItemVer.attr('iconNode', imagePath); 
				container.addChild( menuItemVer,i); 
			},this);
			
			
		}
		
	});
	fisaWidgetMenu.vRootHBranchesAndLeavesMenu = new VRootHBranchesAndLeavesMenu;
	ec.fisa.widget.vRootHBranchesAndLeavesMenu = fisaWidgetMenu.vRootHBranchesAndLeavesMenu;
	return VRootHBranchesAndLeavesMenu;
	
	
});
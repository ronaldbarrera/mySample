define([ "dojo/_base/declare", 
         "dojo/_base/kernel", 
         "dojo/dom-construct", 
         "dojo/_base/array",
         "dijit/Tree", 
         "dijit/Menu",
         "ec/fisa/widget/DialogSimple",
         "ec/fisa/dwr/Store", 
         "ec/fisa/dwr/proxy/tsc/MenuEditionAdminControllerDWR", 
         "dojo/data/ItemFileWriteStore",
         "dijit/tree/dndSource", 
         "ec/fisa/dwr/TreeStoreModel", 
         "ec/fisa/widget/ConfirmDialog", 
         "./_base" ], function(
		declare, dojo, domConstruct, array, Tree, Menu) {

	return declare("ec.fisa.widget.tsc.EditableOptionsTree", [ Tree ], {
		tabId : '',
		pageScopeId : '',
		copyOnly : true,
		selfAccept : false,
		_selectedNode : null,
		showRoot : false,
		isForQY:false,
		additionalParams:[],
		dialogIdByItemId : {},
		newItemsId : [],
		isDeletedItems : false,
		isModifyOption : false,
		isNewItem : false,
		labelsData : null,
		selectedItem : null,
		parentSelectedItem : null,
		movedItemsIdByOldParent : {},
		movedItemsId : [],
		itemData : {},
		updatedItems : {},
		domNodes : {},
		dndParams : [],
		dndController : "dijit.tree.dndSource",
		postMixInProperties : function() {
			this.inherited(arguments);
			this.store = new ec.fisa.dwr.Store("MenuEditionAdminControllerDWR", "viewEditableTransacctions", this.tabId, this.pageScopeId, this.additionalParams, null);
			this.store.fastFetchItemByIdentity = false;
			this.store.updateMsgsPanel = this.updateMessages;
			this.store.setCallbackScope(this.store);
			var itemModel = new ec.fisa.dwr.TreeStoreModel({
				childrenAttrs : [ "items" ],
				labelAttr : "name",
				query : {},
				store : this.store,
				onChildrenChange : dojo.hitch(this, function(parent, newChildrenList) {
					this.displayOnDropPopup(parent, newChildrenList);
				}),
				sendNewItem : dojo.hitch(this, function(item) {
					this.newItemsId.push(item);
				}),
				sendMovedItem : dojo.hitch(this, function(oldParentItem, item) {
					var isEditableTreeItem = this.store.getValue(item, "editableTreeItem");
//					console.log("Item --> ["+item+"] isEditableTreeItem ---> "+ isEditableTreeItem);
					if(isEditableTreeItem===true){
						var temp = this.movedItemsIdByOldParent[oldParentItem];
						if(temp === undefined){
							temp = []
							this.movedItemsIdByOldParent[oldParentItem] = temp;
						} 
						temp.push(item);
						this.movedItemsId.push(item);
					} else {
						delete this.movedItemsId;
						this.movedItemsIdByOldParent = {};
						this.movedItemsId = [];
					}
				})
			});
			this.model = itemModel;
			this.dragThreshold = 8;
			this.betweenThreshold = 5;
			this.persist = false;
			if(!this.isForQY) {
				this.dndParams =[ "onDndDrop", "itemCreator", "onDndCancel", "checkAcceptance", "checkItemAcceptance", "dragThreshold", "betweenThreshold", "deleteSelectedNodes" ];
			}
		},
		postCreate:function(){
			var params=this.store.getAdditionalParams();
			params[0]=this.getChannelValue();
			this.store.setAdditionalParams(params);
			this.inherited(arguments);
		},
		
		updateMessages : function(msgs) {
//			console.log("loading Messages EditableTree");
			var controller = ec.fisa.controller.utils.getPageController(this.tabId, this.gridStoreId);
			var msgPanelId = controller.globalMessagePanelId;
			if(msgPanelId !== undefined || msgPanelId != null){
				controller.setMessagesPanel(dijit.byId(msgPanelId));
				controller.updateMsgsPanel(msgs);
			} else {
				controller.setPenddingMessages(msgs);
			}
		},
		
		checkAcceptance : function(source, nodes) {
			return true;
		},
		checkItemAcceptance : function(node, source, position) {
			this.leafSwitch = false;
			/*Evalua la posicion para que siempre coloquen sobre el item que quieren agregar.*/
			if(position == 'before' || position == 'after'){
				return false;
			}
			
			/*Evalua si el nodo en el que se va hacer el drop no sea un nodo hijo*/ 
			var idParentNode = node.parentNode.id;
			var parentNodeItem = dijit.byId(idParentNode).item;
			var store = this.tree.store;
			if(store.getValue(parentNodeItem, "leaf")===true){
				this.leafSwitch = true;
				return true;
			}
			
			/*Evalua si el nodo que se esta arrastrando no es una carpeta*/
			var dragItem = source.tree.selectedItem;
			var dragStore = source.tree.store;
			if(dragStore.getValue(dragItem, "leaf")===false){
				//Si la carpeta es un nodo del mismo arbol se deja mover 
				if(dragStore.getValue(dragItem, "editableTreeItem")===true){
					return true;
				}
				return false;
			}
			
			/*Si es un item del mismo arbol de edicion no se debe mover*/
//			if(dragStore.getValue(dragItem, "editableTreeItem")===true){
//				return false;
//			}
			
			return true;
		},
		deleteSelectedNodes : function() {
			return true;
		},
		getIconClass:function(item){
			if(!item) {
				return "itemFolder";
			}
			if(this.store.getValue(item, "leaf")===true){
				if(this.store.getValue(item,"type") == "ITEM_QUERY_TEMPLATE"){
					return "qtIconMenu";
				}
				else{
					return "itemLeaf";
				}
			}
			return "itemFolder";
		},
		deleteItem : function(item, parent) {
			this.isDeletedItems = true;
			this.model.deleteItem(item, parent);
		},
		startup : function() {
			if(!Array.prototype.indexOf){
			    Array.prototype.indexOf=function(obj,start){
			        for(var i=(start||0),j=this.length;i<j;i++){
			            if(this[i]==obj){return i;}
			        }
			        return -1;
			    }
			}
			
			MenuEditionAdminControllerDWR.getScreenLabels({
				callbackScope : this,
				callback : function(data) {
					this.labelsData = data;
				},
				errorHandler : dojo.hitch(this,this.errorHandler)
			});
			if(!this.isForQY){
			// Se añade el Menu
			var pMenu = new Menu();
//			pMenu.store = this.store;
//			pMenu.labelsData = this.labelsData;
//			pMenu.treeId = this.id;

			pMenu.addChild(new dijit.MenuItem({
				iconClass : "dijitIcon dijitIconEdit",
				type : "M",
				onClick : dojo.hitch(this, function() {
					this.displayModifyItemDialog();
				})
			}));

			pMenu.addChild(new dijit.MenuItem({
				iconClass : "dijitIcon dijitIconNewTask",
				type : "AF",
				onClick : dojo.hitch(this, function() {
					var item = this.selectedItem;
//					console.log("NodeSelected ADD Folder ---> " + item);
					this.isNewItem = true;
					this.displayNewFolderDialog(item);
				})
			}));

			pMenu.addChild(new dijit.MenuItem({
				iconClass : "dijitIcon dijitIconTask",
				type : "AU",
				onClick : dojo.hitch(this, function() {
					var item = this.selectedItem;
//					console.log("NodeSelected ADD URL ---> " + item);
					this.isNewItem = true;
					this.displayExternalURLDialog(item);
				})
			}));

			pMenu.addChild(new dijit.MenuItem({
				iconClass : "dijitIcon dijitIconDelete",
				type : "D",
				onClick : dojo.hitch(this, function() {
					var dlgConfirm = new ec.fisa.widget.ConfirmDialog({
						acceptDialogLabel : this.labelsData.yesLabel,
						cancelDialogLabel : this.labelsData.noLabel,
						title : this.labelsData.deleteMenuLabel,
						content : this.labelsData.deleteNodeWarnLabel,
						acceptAction : dojo.hitch(this, function() {
							var itemToDelete = this.selectedItem;
							var parent = this.parentSelectedItem;
//							console.log("NodeSelected to delete ---> " + itemToDelete + " Parent --> " + parent);
							this.deleteItem(itemToDelete, parent);
						})
					});
					dlgConfirm.show();
				})
			}));

			pMenu.bindDomNode(this.id);
			
			pMenu.connect(pMenu, "_openMyself", function(e){
				//Obtiene el widget asociado al menu
				var menuTree = dijit.getEnclosingWidget(e.target);
				var menuItem = menuTree.lastFocused;

				var itemId = menuItem.item;
				
				if(itemId !== undefined){
					var item = menuItem.tree.store.getEntryById(itemId).data;
					//Se indica el id del item seleccionado
//					if(item.id !== undefined || item.id != ''){
//						menuItem.tree.selectedItem = item.id;
//					} else {
					menuItem.tree.selectedItem = itemId;
//					}
					menuItem.tree.parentSelectedItem = menuItem.getParent().item;
					
					var labelData = menuItem.tree.labelsData;
	
					dojo.forEach(pMenu.getChildren(), function(menuItem){
						menuItem.set('style', 'display: block'); 
						var menuItemType = menuItem.params["type"];
						if(menuItemType == "M"){
							menuItem.set('label', labelData.modifyMenuLabel);
						} else if(menuItemType == "AF"){
							menuItem.set('label', labelData.addFolderMenuLabel);
						} else if(menuItemType == "AU"){
							menuItem.set('label', labelData.addURLMenuLabel);
						} else if(menuItemType == "D"){
							menuItem.set('label', labelData.deleteMenuLabel);
						}
						
					});
					
					var type = item.type;
					
					if(type== "MENU_CONTAINER"){
						dojo.forEach(pMenu.getChildren(), function(menuItem){
							var menuItemType = menuItem.params["type"];
							if(menuItemType == "M" || menuItemType == "D" || menuItemType == "AU"){
								menuItem.set('style', 'display: none'); 
							}
						});
					}else{
						var leaf = item.leaf;
						
						if(leaf){
							dojo.forEach(pMenu.getChildren(), function(menuItem){
								var menuItemType = menuItem.params["type"];
								if(menuItemType == "AF" || menuItemType == "AU"){
									menuItem.set('style', 'display: none'); 
								}
							});
						}
					}
				} else {
					dojo.forEach(pMenu.getChildren(), function(menuItem){
						menuItem.set('style', 'display: none'); 
					});
				}
			});
			
			}
		},
		
		displayOnDropPopup : function(parent, newChildrenList) {

			if (this.isDeletedItems) {
				/*
				 * Evalua si es un item eliminado no deja pasar para la
				 * siguiente funcionalidad
				 */
				this.isDeletedItems = false;
				//En el caso de que sea un nuevo item se elimina de la lista de nuevos items.
				this.removeNewItemsIdList(newChildrenList);
				return;
			} else if (this.isNewItem) {
				/*
				 * Evalua si es un nuevo item no deja pasar para la siguiente
				 * funcionalidad
				 */
				this.isNewItem = false;
				//En el caso de que sea un nuevo item se elimina de la lista de nuevos items.
				this.removeNewItemsIdList(newChildrenList);
				return;
			} else if (this.isModifyOption){
				/*
				 * Evalua si es modificacion item no deja pasar para la siguiente
				 * funcionalidad
				 */
				this.idModifyOption = false;
				//En el caso de que sea un nuevo item se elimina de la lista de nuevos items.
				this.removeNewItemsIdList(newChildrenList);
				return;
			}
			
			//Evalua si el parent tiene hijos movidos
			var result = false;
			var movedItemsArr = this.movedItemsIdByOldParent[parent];
			if(movedItemsArr !== undefined && movedItemsArr.length > 0){
				result = true;
				delete movedItemsArr;
				delete this.movedItemsIdByOldParent;
				this.movedItemsIdByOldParent = {};
			}
			//Si existe hijos movidos no se hace nada
			if(result){
//				console.log('Es movimiento de items!!');
				return;
			}
			
			/*
			 * Evalua cual es el Id del item para presentear el popup, esto es
			 * en caso de que se hayan arrastrado mas de 2 items.
			 */
			var newId;
			outter: for ( var i = 0; i < this.newItemsId.length; i++) {
				for ( var j = 0; j < newChildrenList.length; j++) {
					if (newChildrenList[j] == this.newItemsId[i]) {
						newId = this.newItemsId[i];
						break outter;
					}
				}
			}
			
			this.removeArr(this.newItemsId, newId);
//			console.log("ID procesado " + newId + " tamaño arreglo " + this.newItemsId.length);
			
			//Si el item esta en el arreglo de items que se movieron no se hace nada.
			var exist = false;
			dojo.forEach(this.movedItemsId , function(item) {
	            if (item == newId) {
	            	exist = true;
	            }
	        });
			//Si el item esta dentro de la lista de hijos movidos no se hace nada
			if(exist){
//				console.log('Entro a evaluacion de items que se han movido!!');
				this.removeArr(this.movedItemsId, newId);
				return;
			}
			
			/*
			 * Obtiene del store el entry a partir del Id, ya que este posee
			 * toda la info correspondiente a ese nodo
			 */
			var item = this.store.getEntryById(newId).data;
			//Solo si el nodo no es una carpeta se despliega el dialogo caso contrario no.
			if(item['leaf'] == true){
				// Se barre para llenar con toda la información del nodo
				for ( var attr in item) {
					if (typeof attr !== "undefined") {
						var value = item[attr];
						if(value != null){
							this.itemData[newId + "_" + attr] = value;
							//Si el valor es name se llena el valor de i18N
							if(attr == 'name'){
								this.itemData[newId + "_nameI18n"] = value;
							}
						}
					}
				}
			
				this.displayItemNodeInformationDialog(item, parent);
			}
		},
		
		onClick : function(item) {
			if(!this.isForQY){
			/*
			 * Obtiene del store el entry a partir del Id, ya que este posee
			 * toda la info correspondiente a ese nodo
			 */
			var itemNode = this.store.getEntryById(item).data;
			
			//Se Obtiene el tipo
			var type = itemNode.type;
			
			if (type== "MENU_CONTAINER") {
				//var folderDlg = new dijit.Dialog({
				var folderDlg = new ec.fisa.widget.DialogSimple({
					title : this.labelsData.rootMenuLabel,
					style : "width: 800px",
					href : "static/tsc/newMenuFolder.jsp",
					ioMethod : dojo.xhrPost,
					editTreeId : this.id,
					preventCache : true,
					ioArgs : {
						content : {
							tabId : this.tabId,
							pageScopeId : this.pageScopeId,
							editTreeId : this.id,
							itemId : item,
							modify : false,
							newFolder : false,
							changeMainMenuName : true
						}
					},
					onCancel : function() {
						var tree = dijit.byId(this.editTreeId);
						//Se resetea los valores cuando se cancela
						tree.isModifyOption = false;
						tree.isNewItem = false;
						tree.itemData = {};
						this.destroy();
					}
				});

				//Se barre para llenar con toda la información del nodo
				for ( var attr in itemNode) {
					if (typeof attr !== "undefined") {
						var value = itemNode[attr];
						if(value != null){
							this.itemData[item + "_" + attr] = value;
						}
					}
				}
				
//				console.log('enviado a llamar el dialogo --> '+ folderDlg.id);
				
				folderDlg.show();
				this.dialogIdByItemId[item] = folderDlg.id;
			}
			}
		},
		
		displayItemNodeInformationDialog : function(item, parent) {
			
			var displayParameterField = true;
			var displayRoutineField = true;
			var changeParameterFieldType = false;
			var dialogTitle = '';
			//Se Obtiene el tipo
			var type = item.type;
			var page = "static/tsc/menuItemInformation.jsp";

			//Dependiendo del tipo se presenta las pantallas
			//TODO Cambiar por etiquetas i18n
			if(type == "ITEM_QUERY_TEMPLATE"){
				displayParameterField = false;
				dialogTitle = this.labelsData.addQueryTemplateLabel;
			} else if(type == "BUSINESS_TEMPLATE"){
				dialogTitle = this.labelsData.addBusinessTemplateLabel;
			} else if(type == "BUSINESS_TEMPLATE_CUSTOMIZED"){
				changeParameterFieldType = true;
				dialogTitle = this.labelsData.addCustomBusinessLabel;
			} else if(type == "BUSINESS_TEMPLATE_URL"){
				displayParameterField = false;
				dialogTitle = this.labelsData.addURLBusinessLabel;
			} else if(type == "ITEM_LAYOUT_TEMPLATE"){
				displayParameterField = false;
				displayRoutineField = false;
				dialogTitle = this.labelsData.addLayoutTemplateLabel;
				//page = "static/tsc/portletItemInformation.jsp";
			}
			
			/* Se lanza el PopUp Pantalla de Proceso */
			//var processDlg = new dijit.Dialog({
			var processDlg = new ec.fisa.widget.DialogSimple({
				title : dialogTitle,
				style : "width: 800px",
				href : page,
				ioMethod : dojo.xhrPost,
				editTreeId : this.id,
				itemId : item.id,
				parentId : parent,
				preventCache : true,
				ioArgs : {
					content : {
						tabId : this.tabId,
						pageScopeId : this.pageScopeId,
						itemId : item.id,
						editTreeId : this.id,
						'displayParameterField' : displayParameterField,
						'changeParameterFieldType' : changeParameterFieldType,
						'displayRoutineField' : displayRoutineField
					}
				},
				onCancel : function() {
					var tree = dijit.byId(this.editTreeId);
					if(!tree.isModifyOption){
						tree.deleteItem(this.itemId, this.parentId);
					}
					//Se seta a false 
					tree.isModifyOption = false;
					this.destroy();
				}
			});
			
			processDlg.show();
			this.dialogIdByItemId[item.id] = processDlg.id;
		},
		
		displayNewFolderDialog : function(item) {
			
			//var folderDlg = new dijit.Dialog({
			var folderDlg = new ec.fisa.widget.DialogSimple({
				title : this.labelsData.folderLabel,
				style : "width: 800px",
				href : "static/tsc/newMenuFolder.jsp",
				ioMethod : dojo.xhrPost,
				editTreeId : this.id,
				preventCache : true,
				ioArgs : {
					content : {
						tabId : this.tabId,
						pageScopeId : this.pageScopeId,
						editTreeId : this.id,
						itemId : item,
						modify : this.isModifyOption,
						newFolder : this.isNewItem,
						changeMainMenuName : false
					}
				},
				onCancel : function() {
					var tree = dijit.byId(this.editTreeId);
					//Se resetea los valores cuando se cancela
					tree.isModifyOption = false;
					tree.isNewItem = false;
					this.destroy();
				}
			});
			
			folderDlg.show();
			this.dialogIdByItemId[item] = folderDlg.id;
		},
		
		displayModifyItemDialog : function() {
			
			this.isModifyOption = true;
			
			var itemId = this.selectedItem;
			/*
			 * Obtiene del store el entry a partir del Id, ya que este posee
			 * toda la info correspondiente a ese nodo
			 */
			var itemNode = this.store.getEntryById(itemId).data;
			
			//Se barre para llenar con toda la información del nodo
			for ( var attr in itemNode) {
				if (typeof attr !== "undefined") {
					var value = itemNode[attr];
					if(value != null){
						this.itemData[itemId + "_" + attr] = value;
					}
				}
			}
			
			//Se Obtiene el tipo
			var type = itemNode.type;
			
			if(type == "EXTERNAL_FOLDER"){
				//Modifica el nombre de un Folder,
				this.displayNewFolderDialog(itemId);
			}else if(type == "EXTERNAL_URL"){
				//Modifica un URL externo
				this.displayExternalURLDialog(itemId);
			} else{
				//Modifica la informacion de un nodo,
				this.displayItemNodeInformationDialog(itemNode);
			}
			
		},
		
		displayExternalURLDialog : function(item) {
			//var externalUrlDlg = new dijit.Dialog({
			var externalUrlDlg = new ec.fisa.widget.DialogSimple({
				title : this.labelsData.externalURLLabel,
				style : "width: 800px",
				href : "static/tsc/externalURL.jsp",
				ioMethod : dojo.xhrPost,
				editTreeId : this.id,
				preventCache : true,
				ioArgs : {
					content : {
						tabId : this.tabId,
						pageScopeId : this.pageScopeId,
						editTreeId : this.id,
						itemId : item,
						modify : this.isModifyOption,
						newItem : this.isNewItem
					}
				},
				onCancel : function() {
					var tree = dijit.byId(this.editTreeId);
					//Se resetea los valores cuando se cancela
					tree.isModifyOption = false;
					tree.isNewItem = false;
					this.destroy();
				}

			});
			
			externalUrlDlg.show();
			this.dialogIdByItemId[item] = externalUrlDlg.id;
		},

		removeArr : function(arr) {
			var what, a = arguments, L = a.length, ax;
			while (L > 1 && arr.length) {
				what = a[--L];
				while ((ax = arr.indexOf(what)) !== -1) {
					arr.splice(ax, 1);
				}
			}
			return arr;
		},
		
		removeNewItemsIdList : function(newChildrenList) {
			for ( var i = 0; i < this.newItemsId.length; i++) {
				for ( var j = 0; j < newChildrenList.length; j++) {
					if (newChildrenList[j] == this.newItemsId[i]) {
						this.removeArr(this.newItemsId, newChildrenList[j]);
					}
				}
			}
		},

		setItemData : function(data) {
			this.itemData = data;
		},
		
		getDomNodeById: function(id){
	       // return this.domNodes[id];
			return this._itemNodesMap[id][0].domNode;
	    },
	    
	    constructDomNodesArr : function() {
	    	//se limpia para que llene con nueva informacion si este existe.
	    	this.domNodes = {};
	    	var treeNodes = this._itemNodesMap;
	    	var rootNode =  this.model.root;
	    	var node = treeNodes[rootNode][0];
	    	this._fillDomNodesArr(node, treeNodes);
		},
	    
	    _fillDomNodesArr : function(node, treeNodes) {
	    	var nodeId = node.params.item;
			var entry = this.store.getEntryById(nodeId);
			var itmes = [];
			if(entry != undefined){
				items = entry.data.items;
			}
			node.setChildItems(items);
			if(items && items.length > 0){
				array.forEach(items, function(item){
					var node = treeNodes[item][0];
					this._fillDomNodesArr(node, treeNodes);
				}, this);
			}
		},
		getChannelValue:function(){
			var ctrlr=ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
			var cmpChannels=dijit.byId(ctrlr.channelComboId);
			return cmpChannels.get("value");
		},
		//onDndDrop. override from dndSource.js
		onDndDrop: function(source, nodes, copy){
			var leafSwitch =this.leafSwitch;
			if(leafSwitch == true){
				 if(this.containerState == "Over"){
					 var tree = this.tree,
					 model = tree.model,
					 target = this.targetAnchor;
					 this.isDragging = false; 
					 
					 
					 // Compute the new parent item
					 var insertIndex  = target.getIndexInParent();
					 var before; // drop source before (aka previous sibling) of target
							var sourceItem = source.getItem(nodes[0].id);
							var oldParentItem = null;
							// Information that's available if the source is another Tree
							// (possibly but not necessarily this tree, possibly but not
							// necessarily the same model as this Tree)
							if(array.indexOf(sourceItem.type, "treeNode") != -1){
								var childTreeNode = sourceItem.data,
									childItem = childTreeNode.item,
									oldParentItem = childTreeNode.getParent().item;
								
								//the selected to the target
								 model.pasteItem(childItem, oldParentItem, oldParentItem, false, insertIndex, before);
								 
								 // the target to the selected.
								 var originalInsertIndex = childTreeNode.getIndexInParent();
								 var originalTargeItem = target.item;
								 
								 model.pasteItem(childItem, oldParentItem, oldParentItem, false, originalInsertIndex, before);
							}
				
					 
				 
				 }
				
			}else{
				//normal course.
				this.inherited(arguments);
			}
			
			
		}

	});

});
define([ "dojo/_base/declare", 
         "dojo/_base/kernel", 
         "dojo/dom-construct",
		 "dojo/_base/array", 
		 "dijit/Tree",
		 "ec/fisa/format/Utils",
		 "dojo/dom",
		 "dojo/_base/lang",
		 "dojo/data/ItemFileWriteStore",
		 "dojox/grid/DataGrid",
		 "dijit/form/Button",
		 "dijit/Menu",
		 "ec/fisa/dwr/Store", 
		 "ec/fisa/dwr/proxy/UserHomeAdminDWR",
		 "dojo/data/ItemFileWriteStore", 
		 "dijit/tree/dndSource",
		 "ec/fisa/dwr/TreeStoreModel", 
		 "./_base" ], 
		 function(declare, dojo, domConstruct, array, Tree,formatUtils,dom,lang,ItemFileWriteStore,DataGrid,Button,Menu) {

	return declare("ec.fisa.widget.tsc.MicroRouteTree", [ Tree ], {
		tabId : '',
		pageScopeId : '',
		actionId : '',
		copyOnly : true,
		selfAccept : false,
		_selectedNode : null,
		showRoot : false,
		controller : '',
		method : '',
		elementChildList : null,
		elementAttributeList:null,
		gridLayout:null,
		attrGridData:null,
		attrGridDataList:null,
		attrGridStore:null,
		attrGrid:null,
		itemData : {},
		panelAttributes:null,
		dataTableGeneratedId:null,
		buttonDataTableId:null,
		dataTableAttributesMap:null,
		dndParams : ["onDndDrop", 
		             "itemCreator", 
		             "onDndCancel",
		             "checkAcceptance", 
		             "checkItemAcceptance", 
		             "dragThreshold", 
		             "betweenThreshold", 
		             "deleteSelectedNodes"],
		dndController : "dijit.tree.dndSource",
		postMixInProperties : function() {
			this.inherited(arguments);
			this.store = new ec.fisa.dwr.Store(this.controller, this.method, this.tabId, this.pageScopeId, [], null);
			this.store.fastFetchItemByIdentity = false;
			var itemModel = new ec.fisa.dwr.TreeStoreModel({
				childrenAttrs : [ "items" ],
				labelAttr : "name",
				query : {},
				store : this.store,
				onChildrenChange : dojo.hitch(this, function(parent, newChildrenList) {
					var store = this.store;
					if(newChildrenList.length > 0) {
						dojo.forEach(newChildrenList, function(entry) {
							var idNumber = store._entries[entry].itemId
							var nameOriginal = store._entries[entry].data.name;
							var elmParent = store._entries[entry].data.elementId;
							store.setValue(idNumber, "name", nameOriginal);
							this.createInitialAttributesTable();
							dojo.style(dijit.byId(this.buttonDataTableId).domNode, {display:'none'});
				        }, this);
					}
				})
			});
			this.model = itemModel;
			this.dragThreshold = 8;
			this.betweenThreshold = 5;
			this.persist = false;
			this.elementChildList = [];
			this.elementAttributeList=[];
			this.dataTableAttributesMap=[];
			this.getElementAttributeData();
			this.checkItemTreeAceptance();
		},
		startup : function() {
			var pMenu = new Menu();
			pMenu.addChild(new dijit.MenuItem({
				iconClass : "dijitIcon dijitIconDelete",
				type : "D",
				onClick : dojo.hitch(this, function() {
					var itemToDelete = this.lastFocused.item;
					var existingNode = this.tree.store._entries[itemToDelete];
					var isRoot = false;
					if (existingNode) {
						var elementId = existingNode.data.elementId;
						if (elementId == "root") {
							isRoot = true;
						}
					}
					if (!isRoot && (this.actionId == "IN" || this.actionId == "UP")) {
						var dlgConfirm = new ec.fisa.widget.ConfirmDialog({
							acceptDialogLabel : 'Yes',
							cancelDialogLabel : 'No',
							title : 'Eliminar',
							content : 'Desea Eliminar el Elemento?',
							acceptAction : dojo.hitch(this, function() {
								var itemToDelete = this.lastFocused.item;
								var parent = this.lastFocused.getParent().item;
								this.deleteItem(itemToDelete, parent);
							})
						});
						dlgConfirm.show();
					}
				})
			}));
			pMenu.bindDomNode(this.id);
		},
		checkAcceptance : function(source, nodes) {
			return true;
		},
		checkItemAcceptance : function(node, source, position) {
			var treeNode = dijit.getEnclosingWidget(node);
			var treeNodeItem = treeNode.item;
			var store = this.tree.store;
			var elmParent = store._entries[treeNodeItem].data.elementId;
			var dragItem = source.tree.selectedItem;
			var existingNode = store._entries[dragItem];
			var elm = null;
			if (existingNode) {
				elm = existingNode.data.elementId;
			} else {
				elm = dragItem.split("_")[2];
			}
			if (elmParent == "root" && (position == "before" || position == "after")) {
				return false;
			}
			if (position == "before" || position == "after") {
				var parentTreeNode = treeNode.getParent();
				treeNodeItem = parentTreeNode.item;
				elmParent = store._entries[treeNodeItem].data.elementId;
			}
			var isElement = false;
			var arrElem = this.tree.elementChildList;
			for (x in arrElem) {
				if (elmParent == x) {
					var arrFinal = arrElem[x];
					for (j = 0; j < arrFinal.length; j++) {
						if(arrFinal[j] == elm) {
							isElement = true;
						}
					}
				}
			}
			return isElement;
		},
		deleteSelectedNodes : function() {
			return true;
		},
		checkItemTreeAceptance:function(){
			MicroRouteControllerDWR.getMicroRouteElements({
				callbackScope : this,
				callback : function(data) {
					this.fillChildListOptions(data);
				},
				errorHandler : this.errorHandler
			});
		},
		fillChildListOptions:function(data){
			this.elementChildList=data;
		},
		errorHandler : function(data) {
			alert("errorHandler "+data);
		},
		getElementAttributeData:function(){
			MicroRouteControllerDWR.getAttributesGroupByElement({
				callbackScope : this,
				callback : function(data) {
					this.fillElementAttributeList(data);
				},
				errorHandler : this.errorHandler
			});
		},
		fillElementAttributeList:function(data){
			this.elementAttributeList=data;
		},
		displayOndropAttributesTable:function(elementId,realId){
			var newItems = [];
			for (x in this.elementAttributeList) {
				if(x == elementId) {
					var arrChilds = this.elementAttributeList[x];
					for(var j = 0; j < arrChilds.length; j++){
						var dataRow = arrChilds[j].split('_');
						var newItem = {'id':(j+1).toString(),'type':x.toString(),'attr':dataRow[0].toString(),'widget':'','isLabel':dataRow[1]};
						newItems.push(newItem);
					}
				}
			}
			this.attrGridData.items=newItems;
			this.attrGridStore = new ItemFileWriteStore({data: this.attrGridData});
			var store = this.tree.store;
			var item=store._entries[realId];
			var currentDataGrid=dijit.byId(this.dataTableGeneratedId);
			currentDataGrid.setStore(this.attrGridStore);
			var currentButton = dijit.byId(this.buttonDataTableId);
			currentButton.treeItem=item;
			currentDataGrid.parentTreeId = this.tree.id;
			if(newItems.length > 0){	
				dojo.style(dijit.byId(this.buttonDataTableId).domNode, {display:'block'});
			} else {
				dojo.style(dijit.byId(this.buttonDataTableId).domNode, {display:'none'});
			}			
		},
		createInitialAttributesTable:function(){
			this.attrGridData = {
					identifier:"id",
					label:"type",
					items:[]
			}
			
			this.attrGridStore = new ItemFileWriteStore({data: this.attrGridData});
			if (this.actionId == "IN" || this.actionId == "UP") {
				this.gridLayout = [
				{ name: 'Propiedad', field: 'attr', editable: false,width: "40%" /* Can't edit ID's of dojo/data items */ },
				{ name: 'Valor',field: 'widget',width : "60%",'editable':false,cellType:dojox.grid.cells._Widget,widgetClass: dijit.layout.ContentPane,
					formatter:function(data, rowIndex,column) {return ec.fisa.format.utils.formatPropertyTextBox(data, rowIndex,column, false);}
				}
				];
			} else {
				this.gridLayout = [
   				{ name: 'Propiedad', field: 'attr', editable: false,width: "40%" /* Can't edit ID's of dojo/data items */ },
   				{ name: 'Valor',field: 'widget',width : "60%",'editable':false,cellType:dojox.grid.cells._Widget,widgetClass: dijit.form.TextBox,
   				  formatter:function(data, rowIndex,column) {return ec.fisa.format.utils.formatPropertyTextBox(data, rowIndex,column, true);}
   				}
   				];
			}			
			var currentDataGrid = dijit.byId(this.dataTableGeneratedId);
			currentDataGrid.setStore(this.attrGridStore);
			currentDataGrid.setStructure(this.gridLayout);
			currentDataGrid.autoHeight=true;
		},
		setDataTableGeneratedId:function(id){
			this.dataTableGeneratedId=id;
			this.createInitialAttributesTable();
		},
		setButtonDataTableId:function(id){
			this.buttonDataTableId=id;
		},
		onClick:function(item){
			var store = this.tree.store;
			var itemOriginal=store._entries[item];
			var properties = itemOriginal.data.properties;
			var itemId = itemOriginal.data.elementId;
			var itemAttributes = this.elementAttributeList[itemId];
			var updates = itemOriginal.updates;
			var newItems=[];
			for (attribute in updates) {
				var attributeArray = attribute.split("_");
				var id = attributeArray[0];
				var index = attributeArray[1];
				var indexInt = parseInt(index) + 1;
				if (id == 'attributeId') {
					var newItem={'id':indexInt,'type':itemOriginal.data.name,'attr':updates[attribute],'widget':updates['attributeValue_'.concat(index)],'isLabel':updates['isLabel_'.concat(index)]};
					newItems.push(newItem);
				}
			}
			if (newItems.length == 0 && itemAttributes) {
				for (var i = 0; i < itemAttributes.length; i++) {
					var attributeArray = itemAttributes[i].split('_');
					var attributeId = attributeArray[0];
					var attributeIsLabel = attributeArray[1];
					var propertyValue = '';
					if (properties != null) {
						propertyValue = properties[attributeId];
						if (propertyValue == null) {
							propertyValue = '';
						}
					}
					var newItem = {'id':(i+1).toString(),'type':item.toString(),'attr':attributeId,'widget':propertyValue,'isLabel':attributeIsLabel};
					newItems.push(newItem);
					store.setValue(itemOriginal.itemId,"attributeId_"+i,attributeId);
					store.setValue(itemOriginal.itemId,"attributeValue_"+i,propertyValue);
					store.setValue(itemOriginal.itemId,"isLabel_"+i,attributeIsLabel);
				}
			}
			var currentDataGrid=dijit.byId(this.dataTableGeneratedId);
			this.attrGridData.items = newItems;
			this.attrGridStore = new ItemFileWriteStore({data: this.attrGridData});
			currentDataGrid.setStore(this.attrGridStore);
			if (this.buttonDataTableId != null) {
				var currentButton = dijit.byId(this.buttonDataTableId);
				currentButton.treeItem = itemOriginal;
				currentDataGrid.parentTreeId = this.tree.id;
				if (newItems.length > 0) {	
					dojo.style(dijit.byId(this.buttonDataTableId).domNode, {display:'block'});
				} else {
					dojo.style(dijit.byId(this.buttonDataTableId).domNode, {display:'none'});
				}
			}
		},
		deleteItem : function(item, parent) {
			this.isDeletedItems = true;
			this.model.deleteItem(item, parent);
			this.createInitialAttributesTable();
			dojo.style(dijit.byId(this.buttonDataTableId).domNode, {display:'none'});
		},
		getIconClass : function(item) {
			var elementClass = 'class_';
			if (!item) {
				return "class_generic";
			} else {
				var store = this.tree.store;
				var elementId = store._entries[item].data.elementId;
				if (elementId) {
					elementClass = elementClass.concat(elementId);
					return elementClass;
				}
			}
			return "class_generic"
		},
		setItemData : function(data) {
			this.itemData = data;
		}
	});

});

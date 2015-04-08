define([ "dojo/_base/array", // array.indexOf array.some
"dojo/_base/declare", // declare
"dojo/_base/lang", // lang.hitch
"dojo/_base/window", // win.global
"dijit/tree/TreeStoreModel" ], function(array, declare, lang, win, TreeStoreModel) {

	/*
	 * ===== var TreeStoreModel = dijit.tree.TreeStoreModel; =====
	 */

	// module:
	// dijit/tree/ForestStoreModel
	// summary:
	// Interface between a dijit.Tree and a dojo.data store that doesn't have a
	// root item,
	// a.k.a. a store that has multiple "top level" items.
	return declare("ec.fisa.dwr.TreeStoreModel", TreeStoreModel, {
		mayHaveChildren : function(/* dojo.data.Item */item) {
			// summary:
			// Tells if an item has or may have children. Implementing logic
			// here
			// avoids showing +/- expando icon for nodes that we know don't have
			// children.
			// (For efficiency reasons we may not want to check if an element
			// actually
			// has children until user clicks the expando node)
			return array.some(this.childrenAttrs, function(attr) {
				if (item == "id") {
					return this.store.hasAttribute(item, attr);
				} else {
					return this.store.getValue(item, "leaf") === false;
				}
			}, this);
		},
		getRoot : function(onItem, onError) {
			// summary:
			// Calls onItem with the root item for the tree, possibly a
			// fabricated item.
			// Calls onError on error.
			if (this.root) {
				onItem(this.root);
			} else {
				this.store.fetch({
					query : this.query,
					onComplete : lang.hitch(this, function(items) {
						this.root = items[0];
						onItem(this.root);
					}),
					onError : onError
				});
			}
		},

		getChildren : function(/* dojo.data.Item */parentItem, /* function(items) */
		onComplete, /* function */onError) {
			// summary:
			// Calls onComplete() with array of child items of given parent
			// item, all loaded.

			var store = this.store;
			// if(parentItem!="id"){
			// var getChildren = lang.hitch(this, arguments.callee);
			// var
			// childrenItems=store._entries[parentItem].data[this.childrenAttrs[0]];
			// if(childrenItems!=null){
			// onComplete(childrenItems);
			// }
			// return;
			// }
			var childItems = [];
			for ( var i = 0; i < this.childrenAttrs.length; i++) {
				var preVals = store.getValues(parentItem, this.childrenAttrs[i]);
				var vals = [];
				array.forEach(preVals, function(item) {
					if (item != null) {
						vals.push(item);
					}
				}, this);
				delete preVals;
				childItems = childItems.concat(vals);
			}

			// count how many items need to be loaded
			var _waitCount = 0;
			// if(!this.deferItemLoadingUntilExpand){
			// array.forEach(childItems, function(item){
			// if(!store.isItemLoaded(item)){ _waitCount++; } });
			// }

			if (_waitCount == 0) {
				// all items are already loaded (or we aren't loading them).
				// proceed...
				onComplete(childItems);
			} else {
				// still waiting for some or all of the items to load
				array.forEach(childItems, function(item, idx) {
					if (!store.isItemLoaded(item)) {
						store.loadItem({
							item : item,
							onItem : function(item) {
								childItems[idx] = item;
								if (--_waitCount == 0) {
									// all nodes have been loaded, send them to
									// the tree
									onComplete(childItems);
								}
							},
							onError : onError
						});
					}
				});
			}
		},

		newItem : function(/* dojo.dnd.Item */args, /* Item */parent, /* int? */insertIndex) {
			// summary:
			// Creates a new item. See `dojo.data.api.Write` for details on
			// args.
			// Used in drag & drop when item from external source dropped onto
			// tree.
			// description:
			// Developers will need to override this method if new items get
			// added
			// to parents with multiple children attributes, in order to define
			// which
			// children attribute points to the new item.
			var pInfo = {
				parent : parent,
				attribute : this.childrenAttrs[0]
			}, LnewItem;
			if (this.newItemIdAttr && args[this.newItemIdAttr]) {
				// Maybe there's already a corresponding item in the store; if
				// so, reuse it.
				this.fetchItemByIdentity({
					identity : dijit.byId(args[this.newItemIdAttr]).item,
					scope : this,
					onItem : function(item) {
						if (item) {
							// There's already a matching item in store, use it
							this.pasteItem(item, null, parent, true, insertIndex);
						} else {
							// Create new item in the tree, based on the drag
							// source.
							LnewItem = this.store.newItem(args, pInfo);
							if (LnewItem && (insertIndex != undefined)) {
								// Move new item to desired position
								this.pasteItem(LnewItem, parent, parent, false, insertIndex);
							}
						}
					}
				});
			} else {
				// [as far as we know] there is no id so we must assume this is
				// a new item
				LnewItem = this.store.newItem(args, pInfo);
				if (LnewItem && (insertIndex != undefined)) {
					// Move new item to desired position
					this.pasteItem(LnewItem, parent, parent, false, insertIndex);
				}
			}
		},

		pasteItem : function(/* Item */childItem, /* Item */oldParentItem, /* Item */newParentItem, /* Boolean */
		bCopy, /* int? */insertIndex) {
			// summary:
			// Move or copy an item from one parent item to another.
			// Used in drag & drop
			var store = this.store, parentAttr = this.childrenAttrs[0]; // name
			// of
			// "children"
			// attr
			// in
			// parent item
			// remove child from source item, and record the attribute that
			// child occurred in
			if (oldParentItem) {
				array.forEach(this.childrenAttrs, dojo.hitch(this, function(attr) {
					if (store.containsValue(oldParentItem, attr, childItem)) {
						if (!bCopy) {
							var values = array.filter(store.getValues(oldParentItem, attr), function(x) {
								return x != childItem;
							});
							//Se envia al metodo que maneja los elementos movidos
							this.sendMovedItem(oldParentItem, childItem);
							
							store.setValues(oldParentItem, attr, values);
						}
						parentAttr = attr;
					}
				}));
			}
			// modify target item's children attribute to include this item
			if (newParentItem) {
				if (typeof insertIndex == "number") {
					// call slice() to avoid modifying the original array,
					// confusing the
					// data store
					var childItems = store.getValues(newParentItem, parentAttr).slice();
					childItems.splice(insertIndex, 0, childItem);
					this.sendNewItem(childItem);
					store.setValues(newParentItem, parentAttr, childItems);
				} else {

					var preVals = store.getValues(newParentItem, parentAttr);
					var vals = [];
					array.forEach(preVals, function(item) {
						if (item != null) {
							vals.push(item);
						}
					}, this);
					delete preVals;
					this.sendNewItem(childItem);
					store.setValues(newParentItem, parentAttr, vals.concat(childItem));
				}
			}
		},

		getIdentity : function(/* item */item) {
			var id = item[this.newItemIdAttr];
			if (typeof id === "undefined") {
				id = item;
			}
			return this.store.getIdentity(id); // Object
		},
		
		deleteItem : function(itemToDelete, parent) {
			var store = this.store, parentAttr = this.childrenAttrs[0];
			var preVals = store.getValues(parent, parentAttr);
			var vals = [];
			array.forEach(preVals, function(item) {
				if (item != null && item != itemToDelete) {
					vals.push(item);
				}
			}, this);
			delete preValss;

			store.setValues(parent, parentAttr, vals);
			store.deleteItem(itemToDelete);
		},
		
		findTreeItem : function(/*Valor a Buscar*/ pattern, /*Id del root*/ rootAttrId) {

			var rootEntry = this.store._entries[rootAttrId];
			var rootData = rootEntry.data;
			var paths = [];
			
			//Se evalua que exista un patron de busqueda
			if((typeof pattern === "undefined") || pattern == null){
				return paths;
			}
			
			var items = rootData.items;
			//Si existe items se itera
			if(items != null){
				for ( var i = 0; i < items.length; i++) {
					var itemId = items[i];
					var _entry = this.store._entries[itemId];
					this.iterateTree(pattern, _entry, [rootAttrId], paths);
				}
			}
			
			return paths;
		},
		
		iterateTree : function(/*Valor a Buscar*/ pattern, /*Entry */ entry, 
				/*Contiene el path del padre*/ parentPath, 
				/*Arreglo de paths de todos los items encontrados*/ paths) {
			if(entry == undefined || entry == null){
				return;
			}
			//Arreglo de paths
			var pathTmp = [];
			var itemData = entry.data;
			
			
			//Se llena el path temporal con el path del padre .
			for ( var id = 0; id < parentPath.length; id++) {
				pathTmp.push(parentPath[id]);
			}
			
			//Se añade el id del item que se esta evaluando
			pathTmp.push(entry.$id);
			
			if(itemData.name.toLowerCase().indexOf(pattern.toLowerCase()) !== -1){
				//Se añade el path encontrado al arreglo de paths en el caso que exista mas de uno
				paths.push(pathTmp);
			}
			
			var items = itemData.items;
			//Si existe items se itera
			if(items != null){
				for ( var i = 0; i < items.length; i++) {
					var itemId = items[i];
					var _entry = this.store._entries[itemId];
					this.iterateTree(pattern, _entry, pathTmp, paths);
				}
			}
			
			delete pathTmp;
		},
		
		sendNewItem:function(item){
			/*Metodo en al que se envia el elemento a añadirse, sobreescribir este metodo si se desea obtener el id que se esta añadiendo*/
		},
		
		sendMovedItem : function(oldParentItem, item) {
			/*Metodo en al que se envia el elemento que se esta moviendo y su atiguo padre, sobreescribir este metodo si se desea obtener el id que se esta añadiendo*/
		}
	});

});

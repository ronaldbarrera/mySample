define( [ "dojo/_base/declare", "dojo/_base/kernel", "dojo/dom-construct", "dojo/_base/connect",
		"dojo/dnd/Target", "ec/fisa/widget/tsc/TranslatorDropArea", "ec/fisa/controller/Utils",
		"dojox/lang/functional/object", "./_base" ], function(declare, dojo, domConstruct, connect,
		Target, TranslatorDropArea) {

	return declare("ec.fisa.widget.tsc.TranslatorDropAreaTarget", [ TranslatorDropArea ], {
		
		constructor : function() {
			var ctrl = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
			ctrl.bindDropAreaTarget(this);
		},
		onDrop:function(source, nodes, copy){
			
			/*Evalua si el nodo que se esta arrastrando no es una carpeta*/
			var declaredClass = source.tree.declaredClass;
			if(declaredClass === 'ec.fisa.widget.tsc.TranslatorSourceTree'){
				return ;
			}
			
			/*Evalua si el nodo que se esta arrastrando no es una carpeta*/
			var dragItem = source.tree.selectedItem;
			var dragStore = source.tree.store;
			if(dragStore.getValue(dragItem, "leaf")===false){
				return;
			}
			
			this.inherited(arguments);
			var selections=dojox.lang.functional.keys(this.selection);
			var items=dojox.lang.functional.keys(this.map);
			var itemId=selections[0];
			if(items.length>1){
				var removeItems=[];
				dojo.forEach(items,function(item){
					if(item!=itemId){
					removeItems.push(item);
					}
					},this);
				dojo.forEach(removeItems,function(item){
					this.delItem(item);
					connect.disconnect(this._connections[item]);
					delete this._connections[item];
					domConstruct.destroy(dojo.byId(item));
					},this);
			}
			var newItem = this.map[itemId];
			var titleDiv=domConstruct.create("div",{"class":"userHomeScreenTitle"},dojo.byId(itemId));
			var titleSpan = domConstruct.create("span",null,titleDiv);
			//titleSpan.innerHTML=newItem.data.name;
			titleSpan.innerHTML = "Target Field";
			var closeA = domConstruct.create("span",{"class":"userHomeScreenTitleClose"},titleDiv);
			closeA.itemId=itemId;
			this._connections[itemId]=connect.connect(closeA,"onclick",this,this.deleteItem);
			var targetContent = domConstruct.create("div", null, titleDiv);
			targetContent.innerHTML = newItem.data.name;
			targetContent.style.color = 'black';
		}
	});

});

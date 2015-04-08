define( [ "dojo/_base/declare", "dojo/_base/kernel", "dojo/dom-construct", "dojo/_base/connect",
		"dojo/dnd/Target", "dojox/lang/functional/object", "./_base" ], function(declare, dojo, domConstruct, connect,
		Target) {

	return declare("ec.fisa.widget.UserHomeAdminDropArea", [ Target ], {
		tabId : '',
		pageScopeId : '',
		copyOnly : true,
		selfAccept : true,
		_selectedNode : null,
		_connections:{},
		constructor : function() {
			this.creator = function(item, hint) {
				var newNode = domConstruct.create("div",{"class":"userHomeScreen"},null);
				return {
					node : newNode,
					data : {id:item.tree.store.getValue(item.item,"id"),name:item.tree.store.getValue(item.item,"name")},
					type : ["ec.fisa.demo.Screen"]
				};
			};
		},
		checkAcceptance : function(source, nodes) {
			return dojox.lang.functional.keys(this.map).length<2;
		},
		checkItemAcceptance : function(node, source, position) {
			return dojox.lang.functional.keys(this.map).length<2;
		},
		onDrop:function(source, nodes, copy){
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
			titleSpan.innerHTML=newItem.data.name;
			var closeA = domConstruct.create("span",{"class":"userHomeScreenTitleClose"},titleDiv);
			closeA.itemId=itemId;
			this._connections[itemId]=connect.connect(closeA,"onclick",this,this.deleteItem);
		},
		deleteItem:function(){
			var selections=dojox.lang.functional.keys(this.selection);
			this.selection={};
			var item=selections[0];
			this.delItem(item);
			connect.disconnect(this._connections[item]);
			delete this._connections[item];
			domConstruct.destroy(dojo.byId(item));
		}
	});

});

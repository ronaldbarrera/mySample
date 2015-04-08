define( [ "dojo/_base/declare", "dojo/_base/kernel", "dojo/dom-construct", "dojo/_base/connect",
		"dojo/dnd/Target", "dojox/lang/functional/object", "./_base" ], function(declare, dojo, domConstruct, connect,
		Target) {

	return declare("ec.fisa.widget.tsc.TranslatorDropArea", [ Target ], {
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
		creator: function(){
			// summary:
			//		creator function, dummy at the moment
			this.inherited(arguments);
			//this.tabId;
			//this.pageScopeId;
		},
		checkAcceptance : function(source, nodes) {
			return dojox.lang.functional.keys(this.map).length<2;
		},
		checkItemAcceptance : function(node, source, position) {
			return dojox.lang.functional.keys(this.map).length<2;
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

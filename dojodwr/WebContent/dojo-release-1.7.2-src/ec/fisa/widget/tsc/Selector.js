define([
	'dojo/dnd/Selector',
	'dojo/_base/declare',
	'dojo/_base/event',
	'dojo/dom-attr',
	"./_base"
], function ( Selector, declare, event, domAttr ) {

	return declare("ec.fisa.widget.tsc.Selector", [Selector], {
		// methods
		getAllNodes: function(){
			// summary:
			//		returns a list (an array) of all valid child nodes
			var nodeList = dojo.query(".dojoDndItem", this.parent);
			return 	nodeList;// NodeList
		},
		
		startup: function(){
			// summary:
			//		collects valid child items and populate the map

			// set up the real parent node
			if(!this.parent){
				// use the standard algorithm, if not assigned
				this.parent = this.node;
			}
			this.defaultCreator = dojo.dnd._defaultCreator(this.parent);

			// process specially marked children
			this.sync();
		}
	});	/* end declare() */
});	/* end define() */

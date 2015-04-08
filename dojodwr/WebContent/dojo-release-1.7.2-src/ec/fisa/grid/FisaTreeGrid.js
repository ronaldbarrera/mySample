//defines dependencies
define([
"dojo/_base/kernel",
"dojo/_base/declare",
"dojo/dom-class",
"dojox/grid/TreeGrid",
"./_base"
],function(dojo,declare,domClass,/* parameter treegrid. obtained from define */TreeGrid){

	var FisaTreeGrid = declare("ec.fisa.grid.FisaTreeGrid",[TreeGrid],{
		_setModel: function(treeModel){
//			if(treeModel && (!ForestStoreModel || !(treeModel instanceof ForestStoreModel))){
//				throw new Error("dojox.grid.TreeGrid: treeModel must be an instance of dijit.tree.ForestStoreModel");
//			}
			this.treeModel = treeModel;
			domClass.toggle(this.domNode, "dojoxGridTreeModel", this.treeModel ? true : false);
			this._setQuery(treeModel ? treeModel.query : null);
			this._setStore(treeModel ? treeModel.store : null);
		}
	});
	return FisaTreeGrid;
});




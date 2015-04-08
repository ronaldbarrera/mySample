define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dojox/grid/EnhancedGrid",
	"ec/fisa/grid/enhanced/_PluginManager",
	"dojo/_base/sniff","ec/fisa/grid/_View","ec/fisa/grid/_AlignHeaderView","./_base"
], function(dojo, declare, DojoEnhancedGrid, _PluginManager, has){

dojo.experimental("ec.fisa.grid.EnhancedGrid");

var EnhancedGrid = declare("ec.fisa.grid.EnhancedGrid", DojoEnhancedGrid, {
	_pluginMgrClass: _PluginManager,
	fisaEditableGrid:false,
	//fisa refresh
	_fr:false,
	destroyRendering:function(){
		if(this.store && this._store_connects){
			dojo.forEach(this._store_connects, this.disconnect, this);
		}
		if(this.store){
			var store = this.store;
			delete this.store;
			if(store.destroy){
				store.destroy();
			}
			delete store;
		}
	},
	buildViews: function(){
		var viewType = "ec.fisa.grid._View";
		if(!this.fisaEditableGrid){
			viewType = "ec.fisa.grid._AlignHeaderView";
		}
		for(var i=0, vs; (vs=this.layout.structure[i]); i++){
			this.createView(vs.type || viewType, i).setStructure(vs);
		}
		this.scroller.setContentNodes(this.views.getContentNodes());
	},
	postresize: function(){
		if(this._autoHeight){
			// views are position absolute, so they do not inflate the parent
			var contentHeight = null;
			if(has("ie")){
//				contentHeight=0;
//				for(var i=0, inView; inView=this.views.views[i]; i++){
//					contentHeight=Math.max(inView.domNode.offsetHeight,contentHeight);
//					inView.scrollboxNode.style.height=(contentHeight+=5)+"px";
//				}
				contentHeight=this.views.measureContent()+5;
			}else{
				contentHeight=this.views.measureContent();
			}
			var size = Math.max(contentHeight) + 'px';
			this.viewsNode.style.height = size;
		}
	},
	/** Causes the grid to refresh*/
	refresh:function(){
		this._refresh(true);
	},
	// mantis 18839 se controla en resize que agregue una bandera que obtenga la data del modelo
	resize:function(){
		this._fr = true;
		this.inherited(arguments);
		this._fr = false;
	}
	
});

return EnhancedGrid;

});
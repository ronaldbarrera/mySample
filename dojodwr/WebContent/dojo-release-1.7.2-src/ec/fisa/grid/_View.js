define([
	"dojo/_base/declare",
	"dojox/grid/util",
	"./_AlignHeaderView","./_base"
], function(declare, util, _AlignHeaderView){

	return declare('ec.fisa.grid._View', [_AlignHeaderView], {
		postCreate: function(){
			this.connect(this.scrollboxNode,"onscroll","doscroll");
			//util.funnelEvents(this.contentNode, this, "doContentEvent", [ 'mouseover', 'mouseout', 'click', 'dblclick', 'contextmenu', 'mousedown' ]);
			util.funnelEvents(this.headerNode, this, "doHeaderEvent", [ 'dblclick', 'mouseover', 'mouseout', 'mousemove', 'mousedown', 'click', 'contextmenu' ]);
			this.content = new this._contentBuilderClass(this);
			this.header = new this._headerBuilderClass(this);
			if(!this.grid.isLeftToRight()){
				this.headerNodeContainer.style.width = "";
			}
		}
	});

});
define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dojo/keys",
	"dojo/_base/html",
	"dojo/_base/event",
	"dojox/grid/enhanced/_Events"
], function(dojo, declare, keys, html, event, _Events){

return declare("ec.fisa.grid.enhanced._Events", _Events, {
	onCellClick: function(e){
		if(!this.fisaEditableGrid){
			this._events.onCellClick.call(this, e);
			this.focus.contentMouseEvent(e);
		}
	},
	onRowClick: function(e){
		if(!this.fisaEditableGrid){
			this.edit.rowClick(e);
		}
		if(!e.cell || !this.plugin('indirectSelection')){
			this.selection.clickSelectEvent(e);
		}
	},
	onCellFocus: function(inCell, inRowIndex){
		if(!this.fisaEditableGrid){
			this.edit.cellFocus(inCell, inRowIndex);
		}
	},
	onContentEvent:function(e){
		if(!this.fisaEditableGrid){
			this.dispatchContentEvent(e);
		}
	}
});
});
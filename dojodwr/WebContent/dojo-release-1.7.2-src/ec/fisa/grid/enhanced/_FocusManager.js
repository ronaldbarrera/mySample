define([
	"dojo/_base/kernel",
	"dojo/_base/lang",
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/connect",
	"dojox/grid/enhanced/_FocusManager"
], function(dojo, lang, declare, array, connect, DojoFocusManager){

return declare("ec.fisa.grid.enhanced._FocusManager", DojoFocusManager, {
	_delayedHeaderFocus: function(){
		/*if(this.isNavHeader()){
			this.focusHeader();
		}*/
	},
	_delayedCellFocus: function(){
		/*this.currentArea("header", true);
		this.focusArea(this._currentAreaIdx);*/
	},
	initFocusView: function(){
		// summary:
		//		Overwritten
		this.focusView = this.grid.views.getFirstScrollingView() || this.focusView || this.grid.views.views[0];
		if(!this.grid.fisaEditableGrid){
			this._bindAreaEvents();
		}
	},
	addArea: function(area){
		if(area.name && lang.isString(area.name)){
			if(this._areas[area.name]){
				//Just replace the original area, instead of remove it, so the position does not change.
				array.forEach(area._connects, connect.disconnect);
			}
			this._areas[area.name] = new dojox.grid.enhanced._FocusArea(area, this);
			if(area.onHeaderMouseEvent){
				this._headerMouseEventHandlers.push(area.name);
			}
			if(!this.grid.fisaEditableGrid){
				if(area.onContentMouseEvent){
					this._contentMouseEventHandlers.push(area.name);
				}
			}
		}
	}
});

});
define([
	"dojo/_base/kernel",
	"dojo/_base/lang",
	"dojo/_base/declare",
	"ec/fisa/grid/enhanced/_Events",
	"dojox/grid/enhanced/_PluginManager",
	"ec/fisa/grid/enhanced/_FocusManager",
	"dojox/grid/util"
], function(dojo, lang, declare, _Events, DojoPluginManager, _FocusManager, util){

var _PluginManager = declare("ec.fisa.grid.enhanced._PluginManager", DojoPluginManager, {
	preInit: function(){
		this.grid.focus.destroy();
		this.grid.focus = new _FocusManager(this.grid);
		new _Events(this.grid);//overwrite some default events of DataGrid
		this._init(true);
		this.forEach('onPreInit');
	},
	_initView: function(view){
		if(!view){ return; }
		if(!this.grid.fisaEditableGrid){
			util.funnelEvents(view.contentNode, view, "doContentEvent", ['mouseup', 'mousemove']);
		}
		util.funnelEvents(view.headerNode, view, "doHeaderEvent", ['mouseup']);
	}
});

return _PluginManager;

});
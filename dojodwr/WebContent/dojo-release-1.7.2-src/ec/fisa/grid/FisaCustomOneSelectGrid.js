define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"ec/fisa/grid/FisaQtGrid",
	"ec/fisa/dwr/proxy/LovSelectMenuItemControllerDWR",
	"./_base"
], function(dojo, declare, lang, FisaQtGrid){
	var FisaCustomOneSelectGrid = declare("ec.fisa.grid.FisaCustomOneSelectGrid", [FisaQtGrid], {
		tabId:"",
		pageScopeId:"",
		menuContentPaneId:"",
		
		constructor:function(){
			this.inherited(arguments);
		},
		
		postMixInProperties:function(){
			this.inherited(arguments);
		},
		
		_returnSelectedRow: function(){
			var selected = this.grid.selection.getSelected();
			if (selected.length > 0) {
				var tabId = this.grid.parentFisaTabId;
				var btId=this.grid.parentBtId;
				var fieldId = this.grid.parentFieldId;
				var parentType = this.grid.parentType;
				var pageScopeId=this.grid.parentFisaPageScopeId;
				var fc = ec.fisa.controller.utils.getPageController(tabId, pageScopeId);
				var btActionMode =  fc.btActionMode;
				var controller = ec.fisa.controller.utils.getPageController(this.grid.tabId, this.grid.pageScopeId);
				var callObj = {callbackScope:this.grid, callback:this.grid._getSelectedRowCallback, errorHandler:dojo.hitch(controller,controller.errorHandler)};
				var actionLov=null;
				var qtfm = null;
				var btfm = fc.model.toPlainObject();
				var cmp = null;
				if(this.grid.parentWidgetId){
					cmp=dijit.byId(this.grid.parentWidgetId);
				}else{
					cmp=fc.getComponent(btId, fieldId);
				}
				fc.clearPanelMessage();
				var gridFieldId=null;
				if(cmp.parentEditableGrid){
					gridFieldId=cmp.entityMrId;
				}
				LovSelectMenuItemControllerDWR.executeSelection(this.grid.tabId, this.grid.pageScopeId,tabId,pageScopeId, this.grid.qtId, selected[0], btId, fieldId, parentType,btActionMode,qtfm,btfm,actionLov,gridFieldId,cmp.hasFieldRoutineOrPolicy, callObj);
			}
		},
		
		_getSelectedRowCallback:function(data) {

			var fc = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
			var cmp = dijit.byId(this.parentWidgetId);
			fc.componentLov = cmp;
			fc.wAxn = "refresh";
			fc.parentBtId = this.parentBtId;
			var menuContentPane = dijit.byId(fc.menuContentPaneId);
			menuContentPane.set("href", data.dialog);

			
		}
		
	});
	return FisaCustomOneSelectGrid;
});
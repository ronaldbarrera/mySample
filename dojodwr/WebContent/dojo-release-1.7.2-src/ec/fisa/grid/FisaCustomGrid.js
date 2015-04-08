define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"ec/fisa/grid/EnhancedGrid",
	"dijit/form/Button",
	"ec/fisa/dwr/Store",
	"ec/fisa/grid/enhanced/plugins/QtPagination",
	"dojox/grid/enhanced/plugins/IndirectSelection",
	"./_base"
], function(dojo, declare, _Widget, _TemplatedMixin, FisaEnhancedGrid, Button, StoreDWR, FisaQtPagination, IndirectSelection,
		topic){
	
	return declare("ec.fisa.grid.FisaCustomGrid", [FisaEnhancedGrid], {
		tabId:"",
		pageScopeId:"",
		controller:"",
		toExecute:"",
		captureSelection:false,
		
		postMixInProperties: function(){
			this.inherited(arguments);
			var indirectSelection = {indirectSelection:true, headerSelector:false, width:"105px", name: this.selectButtonLabel, styles:"text-align: center;"};
			var pagination={showAddButton:false, islov:false};
			if(this.captureSelection){
				dojo.connect(this,'onSelected',this.onSelection);//otros eventos: onSelectionChanged, onDeselected
			}
			
			//pagination.indirectSelectionVar = indirectSelection;
			this.plugins={fisaQtPagination:pagination,indirectSelection:indirectSelection};
			this.selectionMode="single";
			this.store= new StoreDWR(this.controller,this.toExecute,this.tabId, this.qtId,[this.pageScopeId],null);
			this.store.callbackScope = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
		},
		
		onSelection:function(index){
			var fc = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
			fc.createAuthenticationPanel(index);
		}
	});
});
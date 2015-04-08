define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dojox/grid/EnhancedGrid",
	"./_base"
], function(dojo, declare, DojoEnhancedGrid){

dojo.experimental("ec.fisa.grid.TranslatorMappingGrid");

var EnhancedGrid = declare("ec.fisa.grid.TranslatorMappingGrid", DojoEnhancedGrid, {
	actionId:null,
	tabId:null,
	pageScopeId:null,
	postMixInProperties:function(){
		this.inherited(arguments);
		this.setGridPlugin();
	},
	setGridPlugin:function(){
		var controller = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
		this.actionId = controller.actionId;
		var pagination = {
				pageSizes: [10,'All'],
				description: true,
				sizeSwitch: true,
				pageStepper: true,
				gotoButton: true,
				maxPageStep: 4,
				position: 'top'
		};
		
		var indirectSelection;
		if(this.actionId == "IN" || this.actionId == "UP"){
			indirectSelection = {
					headerSelector:true, 
					width: '10%', 
					styles: 'text-align: center;'
			};
		}else{
			indirectSelection = false;
		}
		this.plugins={"pagination":pagination, "indirectSelection":indirectSelection};	
	}
});

return EnhancedGrid;

});
define([ "dojo/_base/declare", 
         "dojo/_base/kernel", 
         "ec/fisa/widget/tsc/EditableOptionsTree",
         "./_base" ], function(declare, dojo,EditableOptionsTree) {
	return declare("ec.fisa.widget.tsc.CustomEditableOptionsTree", [ EditableOptionsTree ], {
		tabId:"",
		pageScopeId:"",
		channelId:"",
		
		postMixInProperties : function() {
			this.inherited(arguments);
			this.dndParams =[];
		},
	
		getChannelValue:function(){
			var ctrlr=ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
			return ctrlr.channelId;
		},
		
		onClick : function(item) {
			if(!this.isForQY){
				var itemNode = this.store.getEntryById(item).data;			
				var ctrlr=ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
				var data = {wAxn:ctrlr.wAxn, selectedRow:[itemNode.id,itemNode.name]};
				ctrlr.componentLov._executeAutoLovCallback(data);
				var lovId = "EFP_SSM_CNE_NFIS0000_EFP-TCNM_TARGET_EVENT-MENU_ITEM_ID_fisaLov";
				dijit.byId(lovId).closeF();
			}
		}
	
	});
});
define([ "dijit/_Widget", 
        "dojo/_base/declare",
        "ec/fisa/controller/mobile/BaseController"],function(_Widget,declare,BaseController){
	var LayoutController = declare("ec.fisa.mobile.widget.LayoutController", [_Widget,BaseController], {
		
		fisatabid:"",
		fisapageid:"",
		layoutId:'',
		//Lista que contiene todos los portles que pertenecen a un Layout
		portletScopeIds:[],
		
//		constructor: function () {
//			this.inherited(args);
//		},
		
		postMixInProperties:function(){
			this.inherited(arguments);
			ec.fisa.controller.utils.initPageController(this.fisatabid,this.fisapageid,this,true);
			this.clearPanelMessage();
//			ec.fisa.controller.custom.LayoutController(this.fisatabid,this.fisapageid,this.layoutId);
		},
		
		execAction:function(callerCmp){
			if(callerCmp&&callerCmp["fisa-action-id"]){
				var action=callerCmp["fisa-action-id"];
				var callObj={callbackScope:this};
				ec.fisa.widget.utils.resetFocusManager();
				if("CANCEL"==action){
					var outcome = {wAxn:'close'};
					this.handleCancelAction(outcome);
				} else if("PRINT"==action){
					this.handlePrintAction(outcome);
				}
			}
		},
		
		/**Handles the window action based on the outcome of the eventactiondwr or eventsequencedwr*/
		handleCancelAction:function(outcome){
			if(outcome.wAxn=="close"){
				var breadCrumb = dijit.byId(this.breadcrumbId);
				var selectedPane = breadCrumb.selectedChildWidget;
				var verifyLastTab=false;
				if(selectedPane.postClose != null && selectedPane.postClose != undefined && selectedPane.postCloseScope != undefined &&
						selectedPane.postCloseScope != null){
					var scp=dijit.byId(selectedPane.postCloseScope);
					selectedPane.postClose.apply(scp,selectedPane.postCloseArgs);
				} else {
					verifyLastTab=true;
				}
				ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);

				//this is used only in agenda. when postbt is showed, then close the bt too.
				if(selectedPane != null && selectedPane.postCloseArgs!= null 
						&& selectedPane.postCloseArgs!= undefined &&
						selectedPane.postCloseArgs.btBreadCrumbId !=null && selectedPane.postCloseArgs.btBreadCrumbId != undefined
						&& selectedPane.postClose != undefined && selectedPane.postCloseScope != undefined){
					ec.fisa.navigation.utils.closeCurrentBreadCrumb(selectedPane.postCloseArgs.btBreadCrumbId);
				}
				if(verifyLastTab){
					ec.fisa.menu.utils.addEmptyTabAllClosed(dojo.config.fisaNewTabLabel);
				}
			} 
			else {
				alert("unknown action!");
			}
		},
		
		handlePrintAction:function(outcome){
			var pageScopeList = this.portletScopeIds;
				//ec.fisa.controller.utils.getPortletsPageScopeIds(this.tabId);
			var pageScopeIdsInString = json.toJson(pageScopeList);
			var report = dojo.config.fisaContextPath+"/layoutReport?tabId=" + this.fisatabid+"&layoutTemplateId="+
				this.layoutId+"&pageScopeIdList="+pageScopeIdsInString;
			window.open(report);
		}
		
	});
		return LayoutController;
});
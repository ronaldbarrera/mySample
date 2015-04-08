define([
        "dojo/_base/kernel",
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dijit/focus",
        "dojo/aspect",
        "ec/fisa/controller/BaseController",
        "ec/fisa/format/Utils",
        "ec/fisa/navigation/Utils",
        "dojo/dom-geometry",
        "dojo/on",
        "dojo/_base/json",
        "dojox/lang/functional/object"
        ],function(dojo,declare,lang,focusUtil,aspect,BaseController,formatUtils,navigationUtils,domGeometry,on,json){

	var LayoutController = declare("ec.fisa.controller.custom.LayoutController", [BaseController], {
		tabId:null,
		pageScopeId:null,
		layoutTemplateId:null,
		breadcrumbId:null,
		jasperToPrint:null,
		//Lista que contiene todos los portles que pertenecen a un Layout
		portletScopeIds:[],
		constructor: function (tabId,pageScopeId,layoutTemplateId) {
			this.tabId=tabId;
			this.pageScopeId=pageScopeId;
			this.layoutTemplateId=layoutTemplateId;
		},
		destroy:function(){
			
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
			var report = dojo.config.fisaContextPath+"/layoutReport?tabId=" + this.tabId+"&layoutTemplateId="+
				this.layoutTemplateId+"&pageScopeIdList="+pageScopeIdsInString;
			window.open(report);
		},
		setBreadcrumb:function(callerComponent){
			if(callerComponent){
				var p = callerComponent.getParent().getParent().getParent();
				this.breadcrumbId = p.id;
			}
		},
		addPortletScopeId: function(pageScopeId){
			console.log("*******añadiendo pages scope de controlador hijo");
			this.portletScopeIds.push(pageScopeId);
		}
	});
	return LayoutController;
});
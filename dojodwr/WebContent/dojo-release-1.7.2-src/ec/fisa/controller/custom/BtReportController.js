define([
        "dojo/_base/kernel","dojo/_base/declare","dojo/_base/lang","./_base",
        "ec/fisa/controller/BaseController","ec/fisa/navigation/Utils",
        "dojo/dom-construct","dojo/dom-geometry",
        "dojox/mvc","dojo/on","ec/fisa/message/ConfirmationPanel",
        "ec/fisa/mvc/StatefulModel",
        "dojo/data/ItemFileWriteStore",
        "ec/fisa/dwr/proxy/EventReportActionDWR","dojox/grid/EnhancedGrid"
        
        ],function(dojo,declare,lang, fisaBaseController,BaseController,navigationUtils,
        		domConstruct,domGeometry,mvc,on, MessagePanel,StatefulModel,ItemFileWriteStore){

	var BtReportController = declare("ec.fisa.controller.custom.BtReportController", [BaseController], {
		tabId:null,
		pageScopeId:null,
		breadCrumbId: null,
		msg:null,
		currentBreadCrumbId:null,
		btContentPaneId:null,
		btPageScopeId:null,
		
		buttonCntPneId:null,
		iframeWdgtId:null,
		model:null,
		
		constructor: function (tabId,pageScopeId,btPageScopeId) {
			this.tabId=tabId;
			this.pageScopeId=pageScopeId;
			this.btPageScopeId=btPageScopeId;
			this.model = StatefulModel({});
			
		},
		
		initMvc:function(/** component */component,/*
				 * string to be
				 * binded
				 */modelProp){
					this.model.appendObject([modelProp,'value'],"",component.id,'value',null,false);
					//this.model.appendObject([modelProp,'disabled'],disabled,component.id,'disabled',null,false);
					//this.model.appendObject([modelProp,'_lastValueReported'],modelData,component.id,'_lastValueReported',null,false);
				},
		
		initArgs:function(component){
			this.currentBreadCrumbId = component.getParent().getParent().id;
			this.btContentPaneId = component.getParent().id;
		},
		
		initButtonCntnPne:function(component){
			this.buttonCntPneId = component.id;
		},
		
		initIFrameWdgt:function(component){
			this.iframeWdgtId = component.id;
		},
		
		/**close this confirmation breadcrumb with the opened bt.-
		 * if it came from a qt it goes to the qt.*/
		closeConfirmation:function(){
			this.closeReports();
		},
		
		/**function moves to the next report*/
		nextAutoRunReport:function(){
			var callObj={callbackScope:this};
			callObj.errorHandler=dojo.hitch(this,this.errorHandler);
			callObj.callback=this._launchNextAutoRunReportCallBack;
			EventReportActionDWR.nextAutoRunReport(this.tabId,this.btPageScopeId,callObj);	
		},
		
		_launchNextAutoRunReportCallBack:function(outcome){
			
			if(outcome.wAxn = "cnfrm"){
				
				var buttonPane= dijit.byId(this.buttonCntPneId);
				buttonPane.ioArgs = {content:{
					responseShowNextReportButton:outcome.responseShowNextReportButton,
					responseShowEndReportButton:outcome.responseShowEndReportButton,
					tabId:this.tabId,
					pageScopeId:this.pageScopeId
					}
				};
				
				buttonPane.refresh();
				var iframWdgt = dijit.byId(this.iframeWdgtId);
				iframWdgt.refresh();
				
			}
			
			
		},
		/**cierra los reportes*/
		closeReports:function(){
			var breadCrumb=dijit.byId(this.currentBreadCrumbId);
			var selectedPane = breadCrumb.selectedChildWidget;
			if(selectedPane.postClose){
				var scp=dijit.byId(selectedPane.postCloseScope);
				selectedPane.postClose.apply(scp,selectedPane.postCloseArgs);
			}
			ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.currentBreadCrumbId);
		},
		
		
		/** inits the history datagrid. */
		initReportGrid:function(component,labels, reportList){
			var creationDiv = domConstruct.create("div", null,
					component.domNode);
				var layout = [
				              {
				            	  name : labels["reportId"],
				            	  field : "reportId",
				            	  width : "100px"
				              },
				              {
				            	  name :  labels["reportTitle"],
				            	  field : "reportTitle" ,
				            	  width : "100px"
				              }
				              ];
				var gridData = {
						identifier: "customReportId",
						items: reportList
				};
				var store = new ItemFileWriteStore({ data: gridData });

				// domClass.add(creationDiv, "grid");
				/* create a new grid: */
				var grid = new dojox.grid.EnhancedGrid({
					store: store,
					structure: layout,
					rowSelector: '0px',
					selectionMode:'single',
					autoHeight:true,
					autoWidth:true    
				},
				creationDiv);
				grid.startup();
			
		},
		/**function indefined */
		appliedParameterList:function(){
			
		},
		
		/**called from autrorunreportlist to build reports.*/
		buildReports:function(){
			this.clearPanelMessage();
			var callObj={callbackScope:this};
			callObj.errorHandler=dojo.hitch(this,this.errorHandler);
			callObj.callback=this._launchBuildReportCallBack;
			var languageSelected =	this.model.getValue(["LANGUAGE_SELECTED",'value']);
			EventReportActionDWR.openReportAutoFromModule(this.tabId,this.btPageScopeId,languageSelected,callObj);	
		},
		
		_launchBuildReportCallBack:function(outcome){
			if(outcome.wAxn=="error"){
				this.updateMsgsPanel(outcome.aMsgs);
			}
			else{
				ec.fisa.navigation.utils.showNewReportBreadCrumb(outcome.responseReportLabels.title,
						this.currentBreadCrumbId,this.tabId,this.btPageScopeId,outcome.responseReportUrl,
						outcome.responseShowNextReportButton ,outcome.responseShowEndReportButton);
			}
		}
		
		
	});
	return BtReportController;
});

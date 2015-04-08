define(["./_base",
        "dijit/registry",
        "dojo/_base/kernel", 
        "dojo/_base/declare",
		"dojo/dom-construct",
		"dojo/dom-style",
		"ec/fisa/mobile/layout/ContentPane"], 
		function(mobileNavigation,registry,dojo,declare,domConstruct,domStyle,ContentPane) {

	var Utils = declare("ec.fisa.mobile.navigation.Utils", null,{
		
		openNewBreadCrumb : function(newSubTabPaneArg) {
			var viewn=dijit.byId("viewPort");
			var parentQT=dijit.byId(viewn.containers.ParentContentID);
			var parentSCROLL=dijit.byId(viewn.containers.scrollContainerID);
			domStyle.set(parentSCROLL.domNode,"display","none");
			var btCntntPn = new ContentPane(null,domConstruct.create("div",null,parentQT.containerNode));
			
			viewn.containers.currentContent = btCntntPn.id;
			viewn.containers.previousContent = viewn.containers.scrollContainerID;
			
			viewn.containers.BtContentPaneID=btCntntPn.id;
			ec.fisa.mobile.util.buildHeading.call(this,btCntntPn);
			
			var heading1 = new dojox.mobile.Heading({
				'label': viewn.params.name,
				'class': 'qtHeadingName',
				'fixed':'top'
			},domConstruct.create("div",null,btCntntPn.containerNode));
			heading1.startup();
			var scroll = new dojox.mobile.ScrollableView(null,domConstruct.create("div",null,btCntntPn.containerNode));
			var btCntntPn2 = new ContentPane({href:newSubTabPaneArg.href,ioArgs:newSubTabPaneArg.ioArgs},domConstruct.create("div",{'class':'mblContentBodyClass'},scroll.containerNode));
			ec.fisa.mobile.util.loadFooter.call(this,btCntntPn);
			btCntntPn.startup();
			
			
			viewn.show(true,true);
			viewn.resize();

		},
		
		//opens a docuemt bread crumb
		openDocumentBreadCrumb : function(newSubTabPaneArg) {
			var viewn=dijit.byId("viewPort");
			//if exists dont create another and just open the existent one.
			if(viewn.containers.BtDocumentContentPaneID != null && viewn.containers.BtDocumentContentPaneID != undefined){
				var btContainer = dijit.byId(viewn.containers.BtContentPaneID);
				var documentContainer = dijit.byId(viewn.containers.BtDocumentContentPaneID);
				domStyle.set(btContainer.domNode,"display","none");
				domStyle.set(documentContainer.domNode,"display","block");
			}
			else{
				var parentQT=dijit.byId(viewn.containers.ParentContentID);
				var parentSCROLL=dijit.byId(viewn.containers.BtContentPaneID);
				domStyle.set(parentSCROLL.domNode,"display","none");
				var btCntntPn = new ContentPane(null,domConstruct.create("div",null,parentQT.containerNode));
				viewn.containers.currentContent = btCntntPn.id;
				viewn.containers.previousContent = viewn.containers.BtContentPaneID;


				viewn.containers.BtDocumentContentPaneID=btCntntPn.id;
				ec.fisa.mobile.util.buildHeading.call(this,btCntntPn);

				var heading1 = new dojox.mobile.Heading({
					'label': newSubTabPaneArg.title,
					'class': 'qtHeadingName',
					'fixed':'top'
				},domConstruct.create("div",null,btCntntPn.containerNode));
				heading1.startup();
				var scroll = new dojox.mobile.ScrollableView(null,domConstruct.create("div",null,btCntntPn.containerNode));
				var btCntntPn2 = new ContentPane({href:newSubTabPaneArg.href,ioArgs:newSubTabPaneArg.ioArgs},domConstruct.create("div",{'class':'mblContentBodyClass'},scroll.containerNode));
				ec.fisa.mobile.util.loadFooter.call(this,btCntntPn);
				btCntntPn.startup();
				viewn.show(true,true);
				viewn.resize();

			}
		},
		
		/**Updates the current contentpane. used only in sequences.*/
		updateCurrentBreadCrumb : function(/*obj with contentPane parameters */newSubTabPaneArg,/*dojo widget*/contentPaneId, tabId, pageScopeId) {
			var contentPane = dijit.byId(contentPaneId);
			contentPane.ioArgs =newSubTabPaneArg.ioArgs;
			contentPane.set("href",newSubTabPaneArg.href);
			ec.fisa.controller.utils.resetControllerData(tabId,pageScopeId);
		},
		
		/**wrapper*/
		navigateSequenceTo : function(/* string */sequenceId,/* String */
				nextStep,/* dojo widget */contentPaneId,/* String */
				tabId, /* String */pageScopeId,/*string*/sequenceMode,/*String*/previousButton) {
			this.navigateSequenceFromDocTo(sequenceId,nextStep,contentPaneId,tabId,pageScopeId,sequenceMode,previousButton,"false");
		},
		
		/**
		 * Function that opens in the same breadcrumb a new bt
		 * for the sequence given the step, and the id.
		 */
		navigateSequenceFromDocTo : function(/* string */sequenceId,/* String */
		nextStep,/* dojo widget */contentPaneId,/* String */
		tabId, /* String */pageScopeId,/*string*/sequenceMode,/*String*/previousButton,/*boolean*/comingFromDoc) {
			var url = "";
			url = dojo.config.fisaContextPath;
			url += "/";
			url += "BUSINESS_TEMPLATE";
			url += "/";
			url += sequenceId;
			url += "/btSequenceStep/";
			url += nextStep;
			url += "/FISATabId/";
			url += tabId;
			url += "/FisaPageScopeId/";
			url += pageScopeId;
			url += "/SEQUENCE_PRINCIPAL_BT_MODE/";
			url += sequenceMode;
			if(previousButton === "true"){
			url += "/PREVIOUS_BUTTON_CLICKED/";
			url += previousButton;
			}
			if(comingFromDoc === "true"){
				url += "/COMING_BACK_FROM_DOC/";
				url += comingFromDoc;
			}
			
			var cntnPn = new dojox.mobile.ContentPane({
				href:url, 'ioArgs':'null'
			},domConstruct.create("div",{'class':'mblContentBodyClass'},ec.fisa.mobile.util.buildContentBody.call(this).containerNode));
			cntnPn.startup();
			 ec.fisa.controller.utils.resetControllerData(tabId,pageScopeId);
		}

		
	});
	mobileNavigation.utils = new Utils();
	ec.fisa.mobile.navigation.utils = mobileNavigation.utils;
	return Utils;
});
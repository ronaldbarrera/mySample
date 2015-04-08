define(
		[ "dojo/_base/declare", "dojo/_base/lang",
				"ec/fisa/controller/BaseController", "dojo/dom-construct",
				"dijit/form/CheckBox", 	"ec/fisa/format/Utils", "ec/fisa/navigation/Utils", "./_base" ],
		function(declare, lang, BaseController, domConstruct, CheckBox) {

			var TransactionAdministrationController = declare(
					"ec.fisa.controller.custom.TransactionAdministrationController",
					BaseController,
					{
						tabId : null,
						pageScopeId : null,
						messagesPanelId: null,
						breadcrumbId : null,
						labelsData : null,
						errorMsgs : null,
						isEmpty : null,
						
						constructor : function(tabId, pageScopeId, initData ) {
							this.tabId = tabId;
							this.pageScopeId = pageScopeId;
							
							this.labelsData = initData.labelsData;
							this.isEmpty = initData.isEmpty;
							
							delete initData.labelsData;
							delete initData.isEmpty;
							
							if (this.isEmpty) {
								
								this.setMessageWarning();
							}
							
						},
						setMessagesPanel : function(messagesPanel) {
							this.inherited(arguments);
							if (typeof this.breadcrumbId === 'undefined'
									|| this.breadcrumbId == null) {
								var breadCrumb = ec.fisa.controller.utils
										.findCurrentBreadCrumb(messagesPanel);
								if (breadCrumb) {
									this.breadcrumbId = breadCrumb.id;
								}
							}
							this.updateMsgsPanel(this.errorMsgs);
						},						
						clearAllMessages : function() {
							var messagesPanel = dijit.byId(this.messagesPanelId);
							messagesPanel.clearAllMessages();
						},
						setMessageWarning: function() {
//							this.clearAllMessages();							
							var level = new Object();
							level.level = 30000;			
							var errorMsg = {};
							errorMsg["level"] = level;
							errorMsg["summary"] = '';
							errorMsg.summary = this.labelsData.warning1;
							this.errorMsgs  = [errorMsg];
//							this.updateMsgsPanel([errorMsg]);	
						},
						cancel : function() {
						var callObj = {
								callbackScope : this,
								callback : this.handleCancelAction
							};
							EventActionDWR.executeCommandButtonCancel(
									this.tabId, this.pageScopeId, "", callObj);
						},
						handleCancelAction : function() {
							var breadCrumb = dijit.byId(this.breadcrumbId);
							var selectedPane = breadCrumb.selectedChildWidget;
							var verifyLastTab = false;
							if (selectedPane.postClose != null
									&& selectedPane.postClose != undefined
									&& selectedPane.postCloseScope != undefined
									&& selectedPane.postCloseScope != null) {
								var scp = dijit
										.byId(selectedPane.postCloseScope);
								selectedPane.postClose.apply(scp,
										selectedPane.postCloseArgs);
							} else {
								verifyLastTab = true;
							}
							if (this.isSequence != null
									&& this.isSequence == "true") {
								ec.fisa.navigation.utils
										.closeSequenceBreadCrumb(this.breadcrumbId);
							} else {
								ec.fisa.navigation.utils
										.closeCurrentBreadCrumb(this.breadcrumbId);
							}
							// this is used only in agenda. when postbt is
							// showed, then close the bt too.
							if (selectedPane != null
									&& selectedPane.postCloseArgs != null
									&& selectedPane.postCloseArgs != undefined
									&& selectedPane.postCloseArgs.btBreadCrumbId != null
									&& selectedPane.postCloseArgs.btBreadCrumbId != undefined
									&& selectedPane.postClose != undefined
									&& selectedPane.postCloseScope != undefined) {
								ec.fisa.navigation.utils
										.closeCurrentBreadCrumb(selectedPane.postCloseArgs.btBreadCrumbId);
							}
							if (verifyLastTab) {
								ec.fisa.menu.utils
										.addEmptyTabAllClosed(dojo.config.fisaNewTabLabel);
							}
						}
					});
			return TransactionAdministrationController;
		});
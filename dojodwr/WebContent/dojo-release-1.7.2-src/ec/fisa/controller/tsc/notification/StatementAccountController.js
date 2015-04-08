define(
		[ "dojo/_base/declare", "dojo/_base/lang",
				"ec/fisa/controller/BaseController", "ec/fisa/controller/custom/CustomBtController", "dojo/dom-construct",
				"dijit/form/CheckBox", 
				"dojo/dom-geometry", "dojo/dom-style", "ec/fisa/widget/SANotificationGridUser",
				"ec/fisa/format/Utils", "ec/fisa/navigation/Utils", "./_base" ],
		function(declare, lang, BaseController, CustomBtController, domConstruct, CheckBox, domGeometry, domStyle) {

			var StatementAccountController = declare(
					"ec.fisa.controller.tsc.notification.StatementAccountController",
					CustomBtController,
					{
						listUserDataGridId : null,
						listProdDataGridId : null,
						selectedUsers : null,
						selectedProds : null,
						breadcrumbId : null,
						icons : null,
						labelsData : null,
						additionalSucessCheckBoxList : [],
						additionalUnSucessCheckBoxList : [],
						urlToAdditionalUserPage : null,
						disableVal : null,
						breadCrumbAdditionalUser : null,
						parentBtId : null,
						additionalUserGridId : null,
						productSelectValues : null,
						contentPanelProperties : null,
						priorityId : null,
						formatListData : null,
						selectedFormat : null,
						listSelectFormat : {},
						frecuencyListData : null,
						selectedFrecuency : null,
						listSelectFrecuency : {},
						constructor : function(tabId, pageScopeId, initData) {

							//TODO eliminar variable labelsdata para utilizar variable initlabels de custombtcontroller.
							this.setLabelsData(this.initLabels);
							if (initData.aMsgs == undefined) {

								this.selectedUsers = initData.selectedUsers;
								this.selectedProds = initData.selectedProds;
								this.disableVal = initData.disableVal;
								this.parentBtId = initData.parentBtId;
								this.formatListData = initData.formatListData;
								this.selectedFormat = initData.selectedFormat;
								this.frecuencyListData = initData.frecuencyListData;
								this.selectedFrecuency = initData.selectedFrecuency;
								this.priorityId  = initData.priorityId;
							} 
							
							delete initData.selectedUsers;
							delete initData.selectedProds;
							delete initData.disableVal;
							delete initData.parentBtId;
							delete initData.formatListData;
							delete initData.selectedFormat;
							delete initData.priorityId;
							delete initData.frecuencyListData;
							delete initData.selectedFrecuency;
							
						},

						getSelectedUsers : function() {
							return this.selectedUsers;
						},
						getSelectedProds : function() {
							return this.selectedProds;
						},
						setListUserDataGridId : function(cmp) {
							this.listUserDataGridId = cmp.id;
						},
						setListProdDataGridId : function(cmp) {
							this.listProdDataGridId = cmp.id;
						},
						_getSelectedUsers : function() {
							return this
									._getSelectedValues(this.listUserDataGridId);
						},
						_getSelectedProducts : function() {
							return this
									._getSelectedValues(this.listProdDataGridId);
						},
						_getSelectedProductsLine : function() {
							return this
									._getSelectedValuesProducts(this.listProdDataGridId);
						},
						_getSelectedValuesProducts : function(gridIdProduct) {
							var grid = dijit.byId(gridId);
							var outcome = null;
							if (grid != null && grid.fisaChecks != null) {
								outcome = [];
								dojo.forEach(grid.fisaChecks, function(che) {
									var check = dijit.byId(che);
									var outcomeTemp = null;
									if (check.checked) {
										var val = check.fval;
										outcomeTemp.val = check.fvalLine;
										outcome.push(outcomeTemp);
									}
								}, this);
							}
							return outcome;
						},
						_getSelectedValues : function(gridId) {
							var grid = dijit.byId(gridId);
							var outcome = null;
							if (grid != null && grid.fisaChecks != null) {
								outcome = [];
								dojo.forEach(grid.fisaChecks, function(che) {
									var check = dijit.byId(che);
									if (check.checked) {
										outcome.push(check.fval);
									}
								}, this);
							}
							return outcome;
						},
						_getSelectedAllProducts : function() {
							return this._getAllValues(this.listProdDataGridId);
						},
						_getAllValues : function(gridId) {
							var grid = dijit.byId(gridId);
							var outcome = null;
							if (grid != null && grid.fisaChecks != null) {
								outcome = [];
								dojo.forEach(grid.fisaChecks, function(che) {
									var check = dijit.byId(che);
									outcome.push(check.fval);
								}, this);
							}
							return outcome;
						},
						validateBtInfo : function(callerCmp) {
							
							this.clearPanelMessage();							
							var level =  40000;	
							var summary = '';
							var detail = '';
							

							var validador = true;
							var selectProducts = this._getSelectedProducts();
							var listProdDataGrid = dijit
									.byId(this.listProdDataGridId);
							
							var listSelectFormat = {};
							var listSelectFrecuency = {};
							
							for (var i = 0; i < selectProducts.length; i++) {

								var indexGrid = listProdDataGrid
										.getItemIndex(selectProducts[i]);
								
								var selectFormat = dijit.byId(listProdDataGrid.fisaSelectFormat[indexGrid]);
								var selectFrecuency = dijit.byId(listProdDataGrid.fisaSelectFrecuency[indexGrid]);
								
								if (selectFormat.get("value") == '-1') {
									validador = false;
									summary = this.labelsData.warning1;
									break;
								} else {
									listSelectFormat[selectProducts[i]] = selectFormat.get("value");
								}
								
								if (selectFrecuency.get("value") == '-1') {
									validador = false;
									summary = this.labelsData.warning1;
									break;
								} else {
									listSelectFrecuency[selectProducts[i]] = selectFrecuency.get("value");
								}
								
								if (listProdDataGrid.fisaChecksValues[indexGrid] != listProdDataGrid.fisaUserSelect[indexGrid]) {
									validador = false;
//									
									summary = this.labelsData.warning2;									
									break;
								}								
							}
							
							var errorMsg = this.generateMsg(summary, detail, level);
							
							this.listSelectFormat = listSelectFormat;
							this.listSelectFrecuency = listSelectFrecuency;
							
							if (!validador) {
								callerCmp.aMsgs = errorMsg;
								callerCmp.wAxn = "error";								
							} else {
							
								callerCmp.wAxn = "cnfrm";
							}
							

							return callerCmp;
						},
						cancel : function() {
							var callObj = {
								callbackScope : this,
								callback : this.handleCancelAction
							};
							EventActionDWR.executeCommandButtonCancel(
									this.tabId, this.pageScopeId, "", callObj);
						},
						remove : function(callerCmp) {
							//TODO IMPLEMENTS 
						},
						handleSaveAction : function(outcome) {
							if (outcome.wAxn == "cnfrm") {
								this.handleConfirmationBt(outcome);
							} else if (outcome.wAxn == "error") {
								this.updateMsgsPanel(outcome.aMsgs);
							}
						},
						handleAdditionalSaveAction : function(outcome) {
							this.contentPanelProperties.destroy();							
						},
						handleConfirmationBt : function(outcome) {

							var title = outcome.respBtLabels[0];
							var msg = outcome.aMsgs;
							var postBtId = outcome.postBtId;
							var principalBtId = outcome.pBtId;
							var postBtIdDataKey = outcome.postBtIdDataKey;
							var principalPostBtIdDataKey = outcome.principalPostBtIdDataKey;
							var parentBtInAuthorization = outcome.parentBtInAuthorization;

							var showReportModule = outcome.showReportModule;
							var showReportAuto = outcome.showReportAuto;

							var messagesPanel = dijit
									.byId(this.messagesPanelId);
							messagesPanel.clearAllMessages();
							// this.model.clearAllMessages();
							if (postBtId == null) {
								ec.fisa.navigation.utils
										.showNewBreadCrumbConfirmation(title,
												msg, this.breadcrumbId,
												this.tabId, this.pageScopeId,
												this.btId, this.btActionMode,
												this.isSequence,
												showReportModule,
												showReportAuto);
							} else {
								var breadcrumb = dijit.byId(this.breadcrumbId);
								ec.fisa.navigation.utils.showPostBtBreadCrumb(
										breadcrumb.params.title, msg,
										this.tabId, this.pageScopeId, postBtId,
										principalBtId, this.btContentPaneId,
										postBtIdDataKey,
										principalPostBtIdDataKey,
										this.isSequence, showReportModule,
										showReportAuto,
										parentBtInAuthorization, false);
							}
						},

						setLabelsData : function(data) {
							this.labelsData = data;
						},
						setUrlToAdditionalUserPage : function(url) {
							this.urlToAdditionalUserPage = url;
						},
						// opens additional users selection
						openAdditionalUsersSelection : function() {
							var ctrlr = ec.fisa.controller.utils
									.getPageController(this.tabId,
											this.pageScopeId);
							ctrlr.productSelectValues = ctrlr
									._getSelectedProducts();
							var newSubTabPaneArg = {};
							var dialogStyle=ec.fisa.controller.utils.getGlobalModalSize(0.80);
	
							newSubTabPaneArg.title=ctrlr.labelsData.addUsersTo;
							// newSubTabPaneArg.iconClass="breadcrumbIcon";
							newSubTabPaneArg.href = dojo.config.fisaContextPath
									+ this.urlToAdditionalUserPage;
							newSubTabPaneArg.ioArgs = {
								content : {
									'FISATabId' : this.tabId,
									'FISAParentPageScopeId' : this.pageScopeId,
									'isSelect' : this.rowData.checked,
									'rowId' : this.rowData.fval,
									'componentId' : this.parentBtId,
									'height' : dialogStyle.h
								}
							};
							newSubTabPaneArg.ioMethod = dojo.xhrPost;
							newSubTabPaneArg.style="height:"+dialogStyle.h+"px;width:700px;overflow: auto;";
							newSubTabPaneArg.splitter="true";
							ctrlr.contentPanelProperties = new dojox.widget.DialogSimple(newSubTabPaneArg);
							ctrlr.contentPanelProperties.resizeContainerNode=this.resizeNode;
							ctrlr.contentPanelProperties.show();		
							ctrlr.resizeNode(ctrlr.contentPanelProperties,dialogStyle);
//							ec.fisa.navigation.utils.openHrefFisaDlg(ctrlr.labelsData.addUsersTo,/* String */
//							href, ioArgs)
							
//							ec.fisa.navigation.utils.openNewBreadCrumb(
//									newSubTabPaneArg, this.breadCrumbId);

						},	resizeNode:function(lovDialog,dialogStyle){
							var titleDim=domGeometry.getMarginBox(lovDialog.titleNode);
							domStyle.set(lovDialog.containerNode, "height", (dialogStyle.h-titleDim.h-(titleDim.t*4))+"px");
							//domStyle.set(lovDialog.containerNode, "width", "100%");
							domStyle.set(lovDialog.containerNode, "display", "block");
							domStyle.set(lovDialog.containerNode, "overflowY", "auto");
							domStyle.set(lovDialog.containerNode, "overflowX", "auto");
						},

						initAdditionalUsersGrid : function(component, isSelect,
								rowId, componentId) {
							// init list of checkbox.
							this.additionalSucessCheckBoxList = [];
							this.additionalUnSucessCheckBoxList = [];

							var store = new ec.fisa.dwr.Store(
									"StatementAccountControllerDWR",
									'viewDataUsers', this.tabId,
									this.pageScopeId, [ isSelect, rowId ], null);

							/** Creates a div inside an dom node component. */
							var creationDiv = domConstruct.create("div", null,
									component.domNode);

							// domClass.add(creationDiv, "grid");
							/* create a new grid: */
							var grid = new ec.fisa.widget.SANotificationGridUser(
									{
										style : "width: 100%;",
										autoWidth : "true",
										tabId : this.tabId,
										pageScopeId : this.pageScopeId,
										onlyRead : this.disableVal,
										label : this.labelsData.addUserLabel,
										labelRole : this.labelsData.labelRole,
										selectButtonLabel : this.labelsData.selectButtonLabel,
										selectProducts : this.productSelectValues,
										store : store
									}, creationDiv);
							this.additionalUserGridId = grid.id;
							grid.startup();
						},

						cancelAdditionalUser : function(component, isSelect,
								rowId) {

							var listProdDataGrid = dijit
									.byId(this.listProdDataGridId);
							var selected = this._getSelectedValues(component);
							this.contentPanelProperties.destroy();

//							ec.fisa.navigation.utils
//									.closeCurrentBreadCrumb(this.breadCrumbAdditionalUser);

						},

						// saves additional user on the object representing the
						// row of the tree grid
						saveAdditionalUser : function(component, isSelect,
								rowId) {
							var listProdDataGrid = dijit
									.byId(this.listProdDataGridId);

							var userGrid = dijit
									.byId(this.additionalUserGridId);

							var selectedUsers = this
									._getSelectedValues(userGrid.id);

							var indexGrid = listProdDataGrid
									.getItemIndex(rowId);
							
							if (selectedUsers.length != 0) {

								listProdDataGrid.fisaUserSelect[indexGrid] = true;
							} else {
								listProdDataGrid.fisaUserSelect[indexGrid] = false;
							}
							var check = dijit.byId(listProdDataGrid.fisaChecks[indexGrid]);
							var productLine = check.fvalLine;

							var selectProducts = userGrid.selectProducts;

							var callObj = {
								callbackScope : this
							};
							callObj.callback = dojo.hitch(this,
									this.handleAdditionalSaveAction);
							callObj.errorHandler = this.errorHandler;
							StatementAccountControllerDWR
									.saveUserProductSelected(this.tabId,
											this.pageScopeId, selectedUsers,
											rowId, productLine, callObj);
							
//							ec.fisa.navigation.utils
//									.closeCurrentBreadCrumb(this.breadCrumbAdditionalUser);
						},
						// métodos para cargar tiMapping
						openWarning : function() {

							this.clearPanelMessage();

							this.contentPanelProperties = new dojox.widget.DialogSimple(
									{
										// i can call this.titleDlg cause the
										// scope previously inserted.
										title : 'Warning',
										href : './static/tsc/notification/fragment/accountUserWarning.jsp',
										ioArgs : {
											content : {
												FISATabId : this.tabId,
												FisaPageScopeId : this.pageScopeId
											}
										},
										ioMethod : dojo.xhrPost
									});
							this.contentPanelProperties.show();

						},

						actionWarning : function(validador) {

							this.clearPanelMessage();
							this.contentPanelProperties.destroy();

							if (validador === "true") {
								this.save();
							}
						},
						save : function(callerCmp) {
						
							var selectProducts = this._getSelectedProducts();
							
								var callObj = {
									callbackScope : this,
									callback : this.handleSaveAction
								};

								StatementAccountControllerDWR.save(this._addNotificationValData(),this
										._getSelectedAllProducts(), selectProducts, this.listSelectFormat, this.listSelectFrecuency,
										this.tabId, this.pageScopeId, callObj);
							
						}
					});
			return StatementAccountController;
		});
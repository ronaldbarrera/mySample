define(
		["dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/lang",
				"ec/fisa/controller/BaseController", "ec/fisa/controller/custom/CustomBtController", "dojo/dom-construct",
				"dijit/form/CheckBox", 
				"dojo/dom-geometry", "dojo/dom-style", "ec/fisa/widget/SANotificationGridUser",
				"ec/fisa/format/Utils", "ec/fisa/navigation/Utils" ],
		function(dojo,declare, lang, BaseController, CustomBtController, domConstruct, CheckBox, domGeometry, domStyle) {

			var MultiplePaymentsController = declare(
					"ec.fisa.controller.transfers.MultiplePaymentsController", CustomBtController, {
						listUserDataGridId : null, 
						tXMDinamicGridId : null,
						selectedUsers : null,
						selectedProds : null,
						breadcrumbId : null,
						icons : null,
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
						listSelectFrecuency : {},
						ownAccountsData:null,
						listGridData:null,
						btnBackId:null,
						btnNextId:null,
						btnSaveId:null,
						btnCloseId:null,
						btnCancelId:null,
						btnPrintId:null,
						
						_fci:{id:0,transactionType:1,transactionName:2,companyName:3,serviceName:4,outAccount:5,'monto_aux':6,desc:7,
							descRead:8,monto:9,charge:10,totalAmount:11,summary:12,summarySave:13},
							
						montoId:'monto',
						montoIdAux:'monto_aux',
						descId:'desc',
						montoReadId:'montoRead',
						
						descReadId:'descRead',
						accountId : null,
						accountAmountId : 'accountAmount',
						resumePanelId : null,						
						inputDisabled : null,
						
						//read fields
						montoReadId:'montoRead',
						descReadId:'descRead',
						chargeId : 'charge',
						totalAmountId : 'totalAmount',
						summaryId : 'summary',
						summarySaveId : 'summarySave',
						
						//payments
						contractId : 'contract',
						contractReadId:'contractReadId',
						
						disabledId : 'disabledId',
						
						isSuccess : 'totalSuccess',
						
						constructor : function(tabId, pageScopeId, initData) {
					
							this.listGridData = {};
							this.inputDisabled = false;
							if (initData.aMsgs == undefined) {
								
								this.selectedUsers = initData.selectedUsers;
								this.selectedProds = initData.selectedProds;
								this.disableVal = initData.disableVal;
								this.parentBtId = initData.parentBtId;
								
								this.priorityId  = initData.priorityId;
								this.ownAccountsData = initData.ownAccountsData;
							} 
							
//							var callObj = {
//									callbackScope : this,
//									callback : this.handleQueryServicesAction
//								};
//
//								MultiplePaymentsControllerDWR.queryPaymentServices(this.listGridData, this.tabId, this.pageScopeId, callObj);
//							
							delete initData.selectedUsers;
							delete initData.selectedProds;
							delete initData.disableVal;
							delete initData.parentBtId;
							delete initData.priorityId;
							
							delete initData.ownAccountsData;
						},

						getSelectedUsers : function() {
							return this.selectedUsers;
						},
						getSelectedProds : function() {
							return this.selectedProds;
						},
						setTxMDinamicGridId : function(id) {
							this.tXMDinamicGridId = id;
						},
						getTxMDinamicGrid : function() {
							return dijit.byId(this.tXMDinamicGridId);
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
							
							var hasError = false;
							var msgError = "";
							
							var gridTx = this.getTxMDinamicGrid();									
							var listResults = gridTx.store.getResults();
							
							var isSuccess = false;
							
							for (var i = 0; i < listResults.length; i++ ) {
								
								var data = listResults[i].data;
								
								var id = data.id;
								
								if (this.listGridData[id]) {
									
									if (this.listGridData[id][this.montoId]) {
										data[this.montoId] = this.listGridData[id][this.montoId];
									}
								}
								
								if (this.listGridData[id][this.isSuccess] === 'true') {
									isSuccess = true;
									
									//manejo errores
									if (!(data[this.montoId] > 0)) {
										
										hasError = true;
										msgError = this.initLabels.warning2;
										break;
									}
								}
							}
							
							if (!isSuccess) {
								
								hasError = true;
								msgError = this.initLabels.warning5;
							}
							
							if (hasError) {
								
								var errorMsg = this.generateMsg(msgError, '', 40000);
								 
								callerCmp.aMsgs = errorMsg; 
								callerCmp.wAxn = "error";
								
//								this.showErrorValidation(msgError);
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
									this.tabId, this.pageScopeId, this.btId, callObj);
						},
						remove : function(callerCmp) {
							//TODO IMPLEMENTS 
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
												this.btIdescIdd, this.btActionMode,
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
	
//							newSubTabPaneArg.title=ctrlr.labelsData.addUsersTo;
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
						save : function(callerCmp) {
							
							this.clearPanelMessage();		
							
							this.listGridData;
		
							var callObj = {
								callbackScope : this,
								callback : this.handleSaveAction
							};
							
							var notificationVal = this._addNotificationValData();
							
							MultiplePaymentsControllerDWR.save(this.listGridData, notificationVal,	this.tabId, this.pageScopeId, callObj);
						
						},
						next : function(callerCmp) {
							
							this.clearPanelMessage();		
							
							var hasError = false;
							var msgError = "";
//							
							var accountValue = dijit.byId(this.accountId).get("value");
							if (accountValue && accountValue == "-1") {
								
								hasError = true;
								msgError = this.initLabels.warning3;
								
							}
							
							var gridTx = this.getTxMDinamicGrid();		
							
							var listResults = gridTx.store.getResults();
							
							if (!hasError) {
								for (var i = 0; i < listResults.length; i++ ) {
									
									var data = listResults[i].data;
									
									var id = data.id;
									
									if (this.listGridData[id]) {
										
				
										if (this.listGridData[id][this.descId]) {
											data[this.descId] = this.listGridData[id][this.descId];	
											data[this.montoReadId] = this.listGridData[id][this.montoIdAux];
											data[this.montoIdAux] = data[this.montoReadId];
										}
									}
	
									if (data[this.descId] == undefined || data[this.descId].length == 0) {
										
										hasError = true;
										msgError = this.initLabels.warning4;
										break;
									}
								}
							}
//				
							if (hasError) {
								
								this.showErrorValidation(msgError);
							} else {
								
								var callObj = {
										callbackScope : this,
										callback : this.handleNextAction
									};

									MultiplePaymentsControllerDWR.next(this.listGridData, accountValue, this.tabId, this.pageScopeId, callObj);
							}
							
						},
						
						back : function(callerCmp) {
							
							this.clearPanelMessage();
							
							var callObj = {
								callbackScope : this,
								callback : this.handleBackAction
							};

							MultiplePaymentsControllerDWR.back(this.listGridData,	this.tabId, this.pageScopeId, callObj);
							
						},
						handleBackAction : function(outcome) {
							
							this.inputDisabled = false;
							
							dijit.byId(this.accountId).set("disabled", this.inputDisabled);													
							
							var gridTx = this.getTxMDinamicGrid();
							
							gridTx.isSortable = true;
							
							gridTx.layout.setColumnVisibility(this._fci[this.montoIdAux], true);
							gridTx.layout.setColumnVisibility(this._fci[this.descId], true);
							gridTx.layout.setColumnVisibility(this._fci[this.descReadId], false);
							gridTx.layout.setColumnVisibility(this._fci[this.montoId], false);
							gridTx.layout.setColumnVisibility(this._fci[this.chargeId], false);
							//resumen
							gridTx.layout.setColumnVisibility(this._fci[this.totalAmountId], false);
					
							
							var resumePanel = dijit.byId( this.resumePanelId );							
	
							
							var btnNext = dijit.byId(this.btnNextId);
							var btnBack = dijit.byId(this.btnBackId);
							var btnSave = dijit.byId(this.btnSaveId);
							
							
							this._setNotVisible(resumePanel);
							this._setNotVisible(btnBack);
							this._setVisible(btnNext);							
							this._setNotVisible(btnSave);
							
								var notificationWdg = dijit.byId(this.notificationAdditionalsWdgId);
							
							//muestra el widget de notificaciones
							dojo.forEach(notificationWdg, function(val) {
								var notiValWdgId = val.notifWdgId;
								var notiValWdg = dijit.byId(notiValWdgId);
								this._setVisiblePanel(notiValWdg.getParent(), "block");
							}, this);
						},
						handleNextAction : function(outcome) {							
							
							this.inputDisabled = true;
							
							dijit.byId(this.accountId).set("disabled", this.inputDisabled);
							
							var errorList = outcome.errorList;
							var mapTxM = outcome.mapTxM;
							var totalTxn = outcome.totalTxn;
							
							var gridTx = this.getTxMDinamicGrid();		
							
							gridTx.isSortable = false;
							
							var listResults = gridTx.store.getResults();
							
							for (var i = 0; i < listResults.length; i++ ) {
								
								var data = listResults[i].data;
																
								var id = data.id;
							
								if (mapTxM[id]) {
									
//									data[this.montoId] = mapTxM[id][this.montoId];
//									data[this.contractId] = mapTxM[id][this.contractId];
//									data[this.contractReadId] = mapTxM[id][this.contractId];										
//									data[this.totalAmountId] = mapTxM[id][this.totalAmountId];	
//									data[this.descId] = mapTxM[id][this.descId];
//									data[this.descReadId] = mapTxM[id][this.descId];
//									data[this.chargeId] = mapTxM[id][this.chargeId];
									
									
									if (this.listGridData[id]) {
										/*
										if (mapTxM[id][this.isSuccess] === 'true') {
											this.listGridData[id][this.disabledId] = mapTxM[id][this.disabledId];
										} else {
											this.listGridData[id][this.disabledId] = 'true';
										}*/						
										
										this.listGridData[id][this.isSuccess] = mapTxM[id][this.isSuccess];
										this.listGridData[id][this.montoId] = mapTxM[id][this.montoIdAux];
										this.listGridData[id][this.montoIdAux] = mapTxM[id][this.montoIdAux];
										this.listGridData[id][this.contractReadId] = mapTxM[id][this.contractId];
										this.listGridData[id][this.totalAmountId] = mapTxM[id][this.totalAmountId];											
										this.listGridData[id][this.descId] = mapTxM[id][this.descId];
										this.listGridData[id][this.descReadId] = mapTxM[id][this.descId];
										this.listGridData[id][this.chargeId] = mapTxM[id][this.chargeId];
										this.listGridData[id][this.summaryId] = "";
									}
							
									if (errorList[id]) {
										
										var errorLog = "";
										for (var j = 0; j < errorList[id].length; j++) {
											
											if (errorList[id][j][this.summaryId]) {
												
												errorLog = errorLog + "**" + errorList[id][j][this.summaryId];
											}
										}
										
//										data[this.summaryId] = errorLog;
										
										if (this.listGridData[id]) {
											
											this.listGridData[id][this.summaryId] = errorLog;
										}
									}
								}
							}
							if (totalTxn) {
								this.setValuesResumePanel(totalTxn.accountAmount,totalTxn.totalCharge, totalTxn.totalDebit);
							}
							
							gridTx.layout.setColumnVisibility(this._fci[this.montoIdAux], false);
							gridTx.layout.setColumnVisibility(this._fci[this.descId], false);
							gridTx.layout.setColumnVisibility(this._fci[this.descReadId], true);
							gridTx.layout.setColumnVisibility(this._fci[this.montoId], true);
							gridTx.layout.setColumnVisibility(this._fci[this.chargeId], true);
							gridTx.layout.setColumnVisibility(this._fci[this.totalAmountId], true);
							//resumen
							gridTx.layout.setColumnVisibility(this._fci[this.summaryId], true);
					
							var resumePanel = dijit.byId( this.resumePanelId );
							
							var btnNext = dijit.byId(this.btnNextId);
							var btnBack = dijit.byId(this.btnBackId);
							var btnSave = dijit.byId(this.btnSaveId);
							
							
					
							this._setVisiblePanel(resumePanel);
							this._setNotVisible(btnNext);
							this._setVisible(btnBack);
							this._setVisible(btnSave);	
							
								
							var notificationWdg = dijit.byId(this.notificationAdditionalsWdgId);
							
							//muestra el widget de notificaciones
							dojo.forEach(notificationWdg, function(val) {
								var notiValWdgId = val.notifWdgId;
								var notiValWdg = dijit.byId(notiValWdgId);
								this._setNotVisible(notiValWdg.getParent());
							}, this);
						},
						
						handleQueryServicesAction : function(outcome) {							
							
//							this.inputDisabled = true;
							
//							dijit.byId(this.accountId).set("disabled", this.inputDisabled);
							
//							var errorList = outcome.errorList;
//							var mapTxM = outcome.mapTxM;
							var mapTxAmounts = outcome.mapTxAmounts;
//							var totalTxn = outcome.totalTxn;
							
							var gridTx = this.getTxMDinamicGrid();		
							
							gridTx.isSortable = false;
							
							var listResults = gridTx.store.getResults();
							
							for (var i = 0; i < listResults.length; i++ ) {
								
								var data = listResults[i].data;
																
								var id = data.id;
							
								if (mapTxAmounts[id]) {						
									
									if (this.listGridData[id]) {
										
//										if (mapTxM[id][this.isSuccess] === 'true') {
//											this.listGridData[id][this.disabledId] = mapTxM[id][this.disabledId];
//										} else {
//											this.listGridData[id][this.disabledId] = 'true';
//										}						
										
										data[this.montoIdAux] = mapTxAmounts[id];
										this.listGridData[id][this.montoIdAux] = mapTxAmounts[id]; 
											
									}
								}
							}
						
							
							
							gridTx.layout.setColumnVisibility(this._fci[this.montoIdAux], false);
//							gridTx.layout.setColumnVisibility(this._fci[this.descId], true);
//							gridTx.layout.setColumnVisibility(this._fci[this.descReadId], true);
//							gridTx.layout.setColumnVisibility(this._fci[this.montoId], true);
//							gridTx.layout.setColumnVisibility(this._fci[this.chargeId], true);
//							//resumen
//							gridTx.layout.setColumnVisibility(this._fci[this.totalAmountId], true);
					
						},
						
						
						handleSaveAction : function(outcome) {		
							
							var mapTxM = outcome.mapTxM;
							var errorList = outcome.errorList;
							
							var gridTx = this.getTxMDinamicGrid();
							var listResults = gridTx.store.getResults();
							var totalTxn = outcome.totalTxn;
							
							for (var i = 0; i < listResults.length; i++ ) {
								
								var data = listResults[i].data;
								var id = data.id;								
								
								var summary = "";
								if (errorList[id]) {
									
									var errorLog = "";
									
									for (var j = 0; j < errorList[id].length; j++) {
										
										if (errorList[id][j][this.summaryId]) {
											
											errorLog = errorLog + "**" + errorList[id][j][this.summaryId];
										}
									}
									
									summary = errorLog;
									
								} else if (mapTxM[id] && mapTxM[id][this.summaryId] ) {									
									
									summary = mapTxM[id][this.summaryId];
								}
								
								data[this.summarySaveId] = summary;
								
								
								if (this.listGridData[id]) {
									
									this.listGridData[id][this.disabledId] = "true";
									this.listGridData[id][this.summarySaveId] = summary;
									this.listGridData[id][this.summaryId] = summary;
								}
							}
							
							if (totalTxn) {
								this.setValuesResumePanel(totalTxn.accountAmount,totalTxn.totalCharge, totalTxn.totalDebit);
							}
							gridTx.layout.setColumnVisibility(this._fci[this.totalAmountId], true);
							gridTx.layout.setColumnVisibility(this._fci[this.summaryId], false);
							
							var btnNext = dijit.byId(this.btnNextId);
							var btnBack = dijit.byId(this.btnBackId);
							var btnSave = dijit.byId(this.btnSaveId);
							var btnClose = dijit.byId(this.btnCloseId);
							var btnCancel = dijit.byId(this.btnCancelId);
							var btnPrint = dijit.byId(this.btnPrintId);
							
							this._setNotVisible(btnCancel);
							this._setNotVisible(btnNext);
							this._setNotVisible(btnBack);
							this._setNotVisible(btnSave);	
							this._setVisible(btnPrint);		
							this._setVisible(btnClose);	
							
							/*Rompa el Vidrio en caso de emergencia JG*/
							setTimeout(dojo.hitch(this,"brokenGlass"),50);
						},
						
						brokenGlass:function(){
							var gridTx = this.getTxMDinamicGrid();
							gridTx.layout.setColumnVisibility(this._fci[this.summaryId], true);
						},
						
						setValuesResumePanel : function(accountAmount,totalCharge, totalDebit) {
							
							var totalAmountTB = this.model["accountAmount"];
							
							totalAmountTB.set("value", accountAmount);
							
							var totalChargeTB = this.model["totalCharge"];
							
							totalChargeTB.set("value", totalCharge);
							
							var totalDebitTB = this.model["totalDebit"];
							
							totalDebitTB.set("value", totalDebit);
						},
						
						showErrorValidation : function(msgError) {
						
							this.clearPanelMessage();							
							var level =  40000;	
							var summary = msgError;
							var detail = '';
							
							var errorMsg = this.generateMsg(summary, detail, level);
							
							this.updateMsgsPanel(errorMsg);
						},
						_setVisiblePanel: function(component){
							
							component.style = 'min-width:98%; display: inline-block';							
							domStyle.set(component.domNode,"display","inline-block");
							component.resize();
							
						}
					});
			return MultiplePaymentsController;
		});
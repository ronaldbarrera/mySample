define(
        [ "dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/lang",
                "dojo/_base/xhr", "dojo/on", "ec/fisa/navigation/_base",
                "dojox/widget/DialogSimple", "ec/fisa/layout/ContentPane",
                "ec/fisa/widget/ConfirmDialog","ec/fisa/widget/ConfirmTemplateDialog","dojo/dom-geometry","dojo/dom-style","dojo/dom-construct","ec/fisa/controller/Utils" ],
        function(dojo, declare, lang, xhr, on, fisaNavigation, DialogSimple,
                FisaContentPane, ConfirmDialog, ConfirmTemplateDialog,domGeometry,domStyle,domConstruct) {

            var Utils = declare(
                    "ec.fisa.navigation.Utils",
                    null,
                    {
                        createNewFisaTab : function(fisaDialogTitle,
                                fisaDialogId, fisaDialogUrl,
                                tableStoreIdToAnswer, indexesToReceiveAnswer) {
                            var tabContainer = dijit.byId("tabContainer");
                            var contiene = 0;
                            var maxTabCount = 0;
                            dojo.forEach(tabContainer.getChildren(),
                                    function(tabItem) {
                                        if (tabItem.id.indexOf("TAB_"
                                                + fisaDialogId, 0) == 0) {
                                            contiene = contiene + 1;
                                        }
                                        if (tabItem.tabCount > maxTabCount) {
                                            maxTabCount = tabItem.tabCount;
                                        }
                                    });
                            var newTabPaneArg = {};
                            newTabPaneArg.preload = true;
                            newTabPaneArg.id = "TAB_" + fisaDialogId + "_"
                                    + contiene;
                            newTabPaneArg.tabCount = maxTabCount + 1;
                            if (contiene == 0) {
                                newTabPaneArg.href = fisaDialogUrl + "&tabId="
                                        + (maxTabCount + 1);
                                newTabPaneArg.title = fisaDialogTitle;
                            } else {
                                newTabPaneArg.href = fisaDialogUrl + "&tabId="
                                        + (maxTabCount + 1);
                                newTabPaneArg.title = fisaDialogTitle + " ("
                                        + (contiene + 1) + ")";
                            }
                            newTabPaneArg.closable = true;
                            var newTabPane = new dojox.layout.ContentPane(
                                    newTabPaneArg, dojo.doc
                                            .createElement('div'));

                            tabContainer.addChild(newTabPane);
                            tabContainer.selectChild(newTabPane);
                            newTabPane.startup();
                            if (tableStoreIdToAnswer) {
                                var tableStoreToAnswer = dojo.dijit
                                        .byId(tableStoreIdToAnswer);
                                tabContainer.fisaTableStoreToAnswer = tableStoreToAnswer;
                                tabContainer.fisaStoreToAnswer = tableStoreToAnswer.store;
                                tabContainer.fisaIndexesToAnswer = indexesToReceiveAnswer;
                                tabContainer.fisaAction = function() {
                                    newTabPane.close();
                                };
                            }
                        },
                        closeTab : function(tabId) {
                            var callObj = {
                                callbackScope : this,
                                callback : ec.fisa.controller.utils.clearControllers
                            };
                            EventActionDWR.closeTab(tabId, callObj);
                            // this.destroy(); this se refiere al util.js
                            // navigation.
                        },
                        closeCurrentTab : function() {
                            var tabContainer = dijit.byId("tabContainer");
                            var currentTab=tabContainer.selectedChildWidget;
                            if(currentTab){
                                if(currentTab.onClose){
                                currentTab.onClose();
                                }
                                tabContainer.removeChild(currentTab);
                                currentTab.destroyRecursive();
                            }
                        },

                        closeTabFromBreadCrumb : function(breadCrumb) {
                            var tabContainer = breadCrumb.getParent();
                            var chi = tabContainer.getChildren();
                            // var newSelectedChildren = chi[0];
                            // tabContainer.selectChild(newSelectedChildren);
                            tabContainer.removeChild(breadCrumb);
                            // TODO: agregar el callback que llama a
                            /*
                             * var callObj = { callbackScope : this, callback :
                             * ec.fisa.controller.utils.clearControllers };
                             */
                            EventActionDWR.closeTab(breadCrumb.tabId);

                        },

                        openNewBreadCrumb : function(
                        /* obj with contentPane parameters */newSubTabPaneArg,/*
                                                                                 * tab
                                                                                 * container
                                                                                 * breadcrumb
                                                                                 */
                        breadcrumbId) {
                            newSubTabPaneArg.preventCache = true;
                            newSubTabPaneArg.iconClass="breadcrumbIcon";
                            var newSubTabPane = new ec.fisa.layout.ContentPane(
                                    newSubTabPaneArg);
                            var breadcrumb = dijit.byId(breadcrumbId);
                            // newSubTabPane.domNode.style.overflow = "none";
                            breadcrumb.addChild(newSubTabPane);
                            breadcrumb.selectedChildWidget.controlButton.set(
                                    "disabled", true);
                            // saves the onclick funcionality on a variable to
                            // not lose it, so it can be restored
                            breadcrumb.selectedChildWidget.controlButton.oldOnClick = breadcrumb.selectedChildWidget.controlButton.onClick;
                            // overrides onClick function to do nothing, so it
                            // have breadcrumb functionality.
                            breadcrumb.selectedChildWidget.controlButton.onClick = function() {
                            };
                            breadcrumb.selectChild(newSubTabPane);
                            /*anchor a cabecera*/
                            ec.fisa.navigation.utils.gotoTop();
                        },
                        /**Updates the current contentpane. used only in sequences.*/
                        updateCurrentBreadCrumb : function(
                        /* obj with contentPane parameters */newSubTabPaneArg,/*
                         * 
                         * dojo widget
                         * 
                         */
                        contentPaneId, tabId, pageScopeId) {
                            var contentPane = dijit.byId(contentPaneId);
                            contentPane.ioArgs =newSubTabPaneArg.ioArgs;
                            contentPane.setHref(newSubTabPaneArg.href);
                            
                            ec.fisa.controller.utils.resetControllerData(tabId,pageScopeId);
                            
                            /*anchor a cabecera*/
                            ec.fisa.navigation.utils.gotoTop();
                        },
                        closeCurrentBreadCrumb : function(breadcrumbId) {
                            var breadcrumb = dijit.byId(breadcrumbId);
                            var lchi = ec.fisa.navigation.utils
                                    .removeChildBreadCrumb(breadcrumbId);
                            if (lchi==null||lchi.isHome === true) {
                                ec.fisa.navigation.utils.closeTabFromBreadCrumb(breadcrumb);
                            }
                            else if(lchi.isQtContentPane === true){
                                ec.fisa.controller.utils.getPageController(lchi.tabId,lchi.pageScopeId).searchAfterCloseContentPane();
                            }else if (lchi.getChildren()[0] && 
                                    lchi.getChildren()[0].selectedChildWidget && 
                                    lchi.getChildren()[0].selectedChildWidget.isQtContentPane === true){
                                //Mantis 17585 JCVQ
                                //Esto funciona siempre y cuando el primer hijo sea un tab container.
                                //Se usa en las pantallas de Adminstración de Beneficiarios.
                                var tabId = lchi.getChildren()[0].selectedChildWidget.tabId;
                                var pageScopeId = lchi.getChildren()[0].selectedChildWidget.pageScopeId;
                                ec.fisa.controller.utils.getPageController(tabId,pageScopeId).searchAfterCloseContentPane();
                            }
                            /*anchor a cabecera*/
                            ec.fisa.navigation.utils.gotoTop();
                        },

                        closeSequenceBreadCrumb : function(breadcrumbId) {
                            var breadcrumb = dijit.byId(breadcrumbId);
                            var lchi = ec.fisa.navigation.utils
                                    .removeChildBreadCrumb(breadcrumbId);

                            if (lchi.isHome === true) {
                                ec.fisa.navigation.utils.closeTabFromBreadCrumb(breadcrumb);
                            } 
                            else if(lchi.isQtContentPane === true){
                                ec.fisa.controller.utils.getPageController(lchi.tabId,lchi.pageScopeId).searchAfterCloseContentPane();
                            }
                            
                            else {
                                ec.fisa.navigation.utils.closeSequenceBreadCrumb(breadcrumb);
                            }
                            /*anchor a cabecera*/
                            ec.fisa.navigation.utils.gotoTop();
                        },
                        /**Remueve el breadcrumb del foco, y asigna al anterior.*/
                        removeChildBreadCrumb : function(breadcrumbId) {
                            var breadcrumb = dijit.byId(breadcrumbId);
                            var currentBreadcrumb= breadcrumb.selectedChildWidget;
                            var controlButton = currentBreadcrumb.controlButton;
                            breadcrumb
                                    .removeChild(currentBreadcrumb);
                            currentBreadcrumb.destroyRecursive(false);
                            var chi = breadcrumb.getChildren();
                            var lchi = null;
                            if(chi.length>0){
                                lchi = chi[chi.length - 1];
                                lchi.controlButton.set("disabled", false);
                                lchi.controlButton.onClick = lchi.controlButton.oldOnClick;
                                delete lchi.controlButton.oldOnClick;
                                breadcrumb.selectChild(lchi);
                            }
                            return lchi;
                        },

                        showMsgCloseCurrentBreadCrumb : function(title,
                                message, breadcrumbId) {
                            var dialogObj = this.openCntFisaDlg(title, message);
                            dialogObj.closeCurrentBreadCrumb = this.closeCurrentBreadCrumb;
                            dialogObj.breadcrumbId = breadcrumbId;
                            //TODO: mejorar esta funcionalidad no esta liberando memoria
                            on(
                                    dialogObj,
                                    "hide",
                                    function() {
                                        var breadCrumb = dijit.byId(breadcrumbId);
                                        var selectedPane = breadCrumb.selectedChildWidget;
                                        if (selectedPane.postClose) {
                                            var scope = ec.fisa.controller.utils.getPageController(selectedPane.postCloseArgs[0], selectedPane.postCloseArgs[1]);
                                            selectedPane.postClose
                                                    .apply(
                                                            scope,
                                                            selectedPane.postCloseArgs);
                                            scp = null;
                                        }
                                        this
                                                .closeCurrentBreadCrumb(this.breadcrumbId);
                                        this.destroyRecursive();
                                    });
                            dialogObj.resize({
                                w : 250,
                                h : 150
                            });
                            dialogObj.show();
                        },
                        /**shows new bread crumb for bt and show button report if had any*/
                        showNewBreadCrumbConfirmation : function(title,
                                message, breadcrumbId, tabId, pageScopeId, btId,
                                btCalledActionMode, isSequence) {
                            this.showNewBreadCrumbConfirmation(title,
                                    message, breadcrumbId, tabId, pageScopeId, btId,
                                    btCalledActionMode, isSequence,null,null);
                        },
                        
                        /** Shows new bread crumb for confirmation.*/
                        showNewBreadCrumbConfirmation : function(title,
                                message, breadcrumbId, tabId, pageScopeId, btId,
                                btCalledActionMode, isSequence,/*boolean*/showReportModule,/*boolean*/showReportAuto) {

                            // caso de mostrar confirmacion.
                            var url = "";
                            url += dojo.config.fisaContextPath;
                            url += "/BT_CONFIRMATION/BUSINESS_TEMPLATE/";
                            url += btId;
                            url += "/actionMode/";
                            url += btCalledActionMode;
                            url += "/REQUEST_IS_SEQUENCE/";
                            url += isSequence;
                            url += "/showReportModule/";
                            url += showReportModule;
                            url += "/showReportAuto/";
                            url += showReportAuto;
                            url += "/FISATabId/";
                            url += tabId;
                            url += "/parentFisaPageScopeId/";
                            url += pageScopeId;
                            url += "/";
                            
                            
                            var newSubTabPaneArg = {};
                            newSubTabPaneArg.title = title;
                            newSubTabPaneArg.iconClass = "breadcrumbIcon";
                            newSubTabPaneArg.href = url;
                            // newSubTabPaneArg.postClose = this.cargarTareas2;
                            // newSubTabPaneArg.postCloseScope = this.id;
                            newSubTabPaneArg.closeArgs = [ breadcrumbId, message ];
//                            newSubTabPaneArg.ioArgs = {
//                                content : {
//                                    'tabId' : tabId,
//                                    'pageScopeId' : pageScopeId,
//                                    'btId' : btId,
//                                    'btCalledActionMode' : btCalledActionMode,
//                                    'isSequence' : isSequence,
//                                    'showReportModule':showReportModule,
//                                    'showReportAuto':showReportAuto
//                                }
//                            };
                            ec.fisa.navigation.utils.openNewBreadCrumb(
                                    newSubTabPaneArg, breadcrumbId);
                        },
                        
                        
                        /** Shows new bread crumb for additional persons to add contact media.*/
                        showNewDialogAdditionalCm : function( breadcrumbId, tabId, pageScopeId,title ) {
                            var dialogStyle=ec.fisa.controller.utils.getGlobalModalSize(0.80);
                            // caso de mostrar confirmacion.
                            var url = "";
                            url += dojo.config.fisaContextPath;
                            url += "/pages/static/tsc/notification/fragment/additionalPersonContactMedia.jsp";
                            var newSubTabPaneArg = {};
                            newSubTabPaneArg.title = title;
                            newSubTabPaneArg.href = url;
                            newSubTabPaneArg.resizeOnLoad=false;
                            newSubTabPaneArg.executeScripts=true;
                            
                            
                            newSubTabPaneArg.ioArgs = {
                                content : {
                                    'tabId' : tabId,
                                    'pageScopeId' : pageScopeId
                                }
                            };
                            newSubTabPaneArg.ioMethod = dojo.xhrPost;
                            newSubTabPaneArg.style="height:"+dialogStyle.h-70+"px;width:500px;overflow: auto;";
                            
                            var dlgAdditional = new DialogSimple(newSubTabPaneArg);
                            //dlgAdditional.resizeContainerNode=this.resizeNode;
                            domStyle.set(dlgAdditional.closeButtonNode,"display","none");
                            dlgAdditional.show();       
                            this.resizeNode(dlgAdditional,dialogStyle);
                            return dlgAdditional.id;
                        },
                        
                        resizeNode:function(lovDialog,dialogStyle){
                            var titleDim=domGeometry.getMarginBox(lovDialog.titleNode);
                            domStyle.set(lovDialog.containerNode, "height", (dialogStyle.h-titleDim.h-(titleDim.t*4)-85)+"px");
                            //domStyle.set(lovDialog.containerNode, "width", "100%");
                            domStyle.set(lovDialog.containerNode, "display", "block");
                            domStyle.set(lovDialog.containerNode, "overflowY", "auto");
                            domStyle.set(lovDialog.containerNode, "overflowX", "auto");
                        },
                        
                        
                        /** Shows new bread crumb for report.*/
                        showNewReportBreadCrumb : function(title,
                                 breadcrumbId, tabId, pageScopeId, urlToOpen,
                                 responseShowNextReportButton,responseShowEndReportButton ) {
                            // caso de mostrar confirmacion.
                            var url = "";
                            url += dojo.config.fisaContextPath;
                            url += urlToOpen;
                            var newSubTabPaneArg = {};
                            newSubTabPaneArg.title = title;
                            newSubTabPaneArg.iconClass = "breadcrumbIcon";
                            newSubTabPaneArg.href = url;
                            // newSubTabPaneArg.postClose = this.cargarTareas2;
                            // newSubTabPaneArg.postCloseScope = this.id;
                            newSubTabPaneArg.ioArgs = {
                                content : {
                                    'tabId' : tabId,
                                    'btPageScopeId' : pageScopeId,
                                    'responseShowNextReportButton':responseShowNextReportButton,
                                    'responseShowEndReportButton':responseShowEndReportButton
                                }
                            };
                            newSubTabPaneArg.ioMethod = dojo.xhrPost;
                            ec.fisa.navigation.utils.openNewBreadCrumb(
                                    newSubTabPaneArg, breadcrumbId);
                        },
                        
                        
                        /**Opens show new bread crumb qt scheduling*/
                        showNewBreadCrumbQtScheduling : function(title, breadcrumbId, tabId, pageScopeId,qtId,plainModel) {
                            
                            // caso de mostrar scheduling.
                            var url = "";
                            url += dojo.config.fisaContextPath;
                            url += "/";
                            url += "SCHEDULE_QT_FILTER";
                            url += "/";
                            url += "ITEM_QUERY_TEMPLATE";
                            url += "/";
                            url += qtId;
                            url += "/FISATabId/";
                            url += tabId;
                            url += "/REQUEST_HIDE_BUTTON_BAR/true";
                            
                            
                            var newSubTabPaneArg = {};
                            newSubTabPaneArg.title = title;
                            //newSubTabPaneArg.iconClass = "breadcrumbIcon";
                            newSubTabPaneArg.href = url;
                            newSubTabPaneArg.ioArgs = {
                                content : {
                                    'parentTabId' : tabId,
                                    'parentPageScopeId' : pageScopeId,
                                    'parentBreadCrumbId':breadcrumbId,
                                    'scheduleInitialQtParams':plainModel
                                }
                            };
                            newSubTabPaneArg.ioMethod = dojo.xhrPost;
                            ec.fisa.navigation.utils.openNewBreadCrumb(
                                    newSubTabPaneArg, breadcrumbId);
                        },
                        
                        
                        /**
                         * show postbt in qy mode always at the end of accept
                         * button.
                         */
                        showPostBtBreadCrumb : function(title, msg, tabId, btPageScopeId,
                                btId,/*String*/pBtId,/*this id could be an breadcrumb or contentpane*/ containerId, postBtIdDataKey,principalPostBtIdDataKey, 
                                isSequence,showReportModule,showReportAuto,/*boolean*/parentBtInAuthorization,fromAgenda) {
                            // caso de mostrar confirmacion.
                            var url = "";
                            url += dojo.config.fisaContextPath;
                            
                            url += "/";
                            url += "BUSINESS_TEMPLATE";
                            url += "/";
                            url += btId;
                            if(pBtId !=null && pBtId != undefined && pBtId != ""){
                                url += "/";
                                url += "POST_SECUENCE_ID";
                                url += "/";
                                url += pBtId;
                            }
                            url += "/FISATabId/";
                            url += tabId;
                            url += "/actionMode/QY";
                            url += "/FDK/";
                            url += postBtIdDataKey;
                            url += "/_FDK";
                            url += "/BT_SHOW_CONFIRMATION_BT/";
                            url += "true";
                            if(isSequence != null && isSequence != undefined){
                            url += "/REQUEST_IS_SEQUENCE/";
                            url += isSequence;
                            }
                            url += "/POST_PBT_FDK/";
                            url += principalPostBtIdDataKey;
                            url += "/parentBtInAuthorization/";
                            url += parentBtInAuthorization;
                            url += "/isConfirmationBt/";
                            url += "true/index.jsp";
                            
                            var newSubTabPaneArg = {};
                            newSubTabPaneArg.title = title;
                            newSubTabPaneArg.iconClass = "breadcrumbIcon";
                            newSubTabPaneArg.href = url;
                            
                            if(fromAgenda == false){
                            
                            // newSubTabPaneArg.postClose = this.cargarTareas2;
                            // newSubTabPaneArg.postCloseScope = this.id;
                            // newSubTabPaneArg.closeArgs =
                            // [breadcrumb,message];
                            newSubTabPaneArg.ioArgs = {
                                content : {
                                    'msgPostBreadCrumb' : dojo.toJson(msg),
                                    'showReportModule':showReportModule,
                                    'showReportAuto':showReportAuto,
                                    'btPageScopeId':btPageScopeId
                                }
                            };
                            ec.fisa.navigation.utils.updateCurrentBreadCrumb(
                                    newSubTabPaneArg, containerId,tabId,btPageScopeId);
                            
                            }
                            else{
                            
//                          newSubTabPaneArg.closeArgs = [ containerId, msg ];
                            newSubTabPaneArg.ioArgs = {
                                content : {
                                    'msgPostBreadCrumb' : encodeURIComponent(dojo.toJson(msg)),
                                    'tabId' : tabId,
                                    'pageScopeId' : btPageScopeId,
                                    'btPageScopeId':btPageScopeId,
                                    'btId' : btId,
                                    'isSequence' : isSequence,
                                    'showReportModule':showReportModule,
                                    'showReportAuto':showReportAuto
                                }
                            };
                            ec.fisa.navigation.utils.openNewBreadCrumb(
                                    newSubTabPaneArg, containerId);
                            }
                        },

                        /* Open a dialog based on a url */
                        openFisaDialog : function(/* String */titleDlg,/* String */
                        hrefString,/* object to pass to the dialog */
                        data,/* dojo widget */treeGrid) {

                            // callbackscope: object that contains variables to
                            // be passed on callback methods.
                            var callObj = {
                                callbackScope : {
                                    titleDlg : titleDlg,
                                    hrefString : hrefString,
                                    data : data,
                                    treeGrid : treeGrid
                                }
                            };
                            callObj.errorHandler = dojo.hitch(this,this.errorHandler);
                            callObj.callback = this.callBckObjOpenPopup;

                            DocumentControllerDWR.processLaunchPopupDocument(
                                    data.actionId, data.tabId,
                                    data.pageScopeId, data.btId, data.id[0],
                                    callObj);

                        },
                        /* Open a dialog based on a message */
                        openCntFisaDlg : function(/* String */titleDlg,/* String */
                        message) {
                            var dialogObj = new DialogSimple({
                                title : titleDlg,
                                content : message,
                                preload : true,
                                preventCache : true,
                                draggable:false
                            });
                            dialogObj.show();
                            return dialogObj;
                        },
                        /* Open a dialog based on a url */
                        openHrefFisaDlg : function(/* String */titleDlg,/* String */
                        href, ioArgs) {
                            var dialogObj = new DialogSimple({
                                title : titleDlg,
                                href : href,
                                preload : true,
                                preventCache : true,
                                ioArgs : ioArgs
                            });
                            dialogObj.show();
                            return dialogObj;
                        },
                        
                        /* Open a dialog based on a url */
                        openHrefFisaDlgPopupUnique : function(/*String*/id, /* String */titleDlg,/* String */
                        href, ioArgs) {
                            var dialogObj = new DialogSimple({
                                id:id,
                                title : titleDlg,
                                href : href,
                                preload : true,
                                preventCache : true,
                                ioArgs : ioArgs
                            });
                            
                            dialogObj.connect(dialogObj,"onHide",function(a){
                                this.destroyRecursive(false);
                            });
                            
                            dialogObj.show();
                            return dialogObj;
                        },
                        
                        callBckObjOpenPopup : function(outcome) {
                            var dataStr = outcome;
                            dataStr.treeGridNodeId = this.data.id[0];
                            var dialogObj = new DialogSimple(
                                    {
                                        // i can call this.titleDlg cause the
                                        // scope previously inserted.
                                        title : this.titleDlg,
                                        href : this.hrefString,
                                        ioArgs : {
                                            content : {
                                                tabId : this.data.tabId,
                                                btId : this.data.btId,
                                                actionId : this.data.actionId,
                                                pageScopeIdDocument : this.data.pageScopeId
                                            }
                                        },
                                        ioMethod : dojo.xhrPost
                                    });
                            dialogObj.treeGrid = this.treeGrid;
                            dialogObj.tabId = this.data.tabId;
                            dialogObj.data = dataStr;
                            // dialogObj.resize(ec.fisa.controller.utils.getModalSize(0.65));
                            dialogObj.show();
                            dialogObj.connect(dialogObj,"hide",function(){
                                var callObj = {
                                        callbackScope : this
                                        
                                    };
                                    callObj.errorHandler = dojo.hitch(this,this.errorHandler);
                                    callObj.callback = ec.fisa.navigation.utils.callBckHideDialogHandler;
                                    DocumentControllerDWR.undoCancelUploadDocument(
                                            this.treeGridNodeId,
                                            this.treeGrid.tabIdvar,
                                            this.treeGrid.pageScopeIdvar, callObj);
                                
                            });
                        },
                        
                        
                        /**handles callback from undoDocument when the dialog closes*/
                        callBckHideDialogHandler:function(outcome){
                            if(outcome.status == "success"){
                                ec.fisa.controller.utils.uninitializeController(this.tabId, this.popupPageScopeId);
                                this.destroyRecursive();
                            }
                            else{
                                ec.fisa.controller.utils.getPageController(this.tabId, this.popupPageScopeId).updateMsgsPanel(outcome.details);
                            }
                        },
                        
                        switchVisibility : function(cmpId) {
                            var cmp = dojo.byId(cmpId);
                            var node = cmp;
                            if (cmp.domNode) {
                                node = cmp.domNode;
                            }
                            var nodeStyle = node.style;
                            var vis = "none";
                            if (nodeStyle.display == "none") {
                                vis = "";
                            }
                            nodeStyle.display = vis;
                            return node;
                        },

                        undoTreeGridAction : function(labels, treeGrid,
                                rowItemData) {
                            var dlgConfirm = new ConfirmDialog({
                                acceptDialogLabel : labels["acceptButton"],
                                cancelDialogLabel : labels["cancelButton"],
                                title : labels["infoTitle"],
                                content : labels["treeTableUndoMessage"],
                                acceptAction : this._undoDialogActin
                            });
                            dlgConfirm.callBckFnctnDwr = this.callBckFnctnDwr;
                            dlgConfirm.errorHandler = dojo.hitch(this,this.errorHandler);
                            dlgConfirm.rowItemData = rowItemData;
                            dlgConfirm.treeGrid = treeGrid;
                            dlgConfirm.show();

                        },
                        /**Shows template dialog action. With 3 buttons and associate events to them*/
                        templateDlgShowAction : function(/*map*/labels,/*String*/tabId,/*String*/ pageScopeId,btId,btActionMode,isSequence) {
                            
                            var callerCmp = {};
                            callerCmp["fisa-action-id"] =btActionMode ;
                            callerCmp["fisa-bt-id"] = btId;
                            callerCmp["is_sequence"] =isSequence ;
                            
                            var acceptFunction=function(){
                                var btCtrl =    ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
                                this.callerCmp["template_over_call"] = "New";
                                btCtrl.execAction(this.callerCmp);
                            };
                            
                            
                            var overWriteFunction=function(){
                                var btCtrl =    ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
                                this.callerCmp["template_over_call"] = "OverWrite";
                                btCtrl.execAction(this.callerCmp);
                            };
                            this._templateDlgShowAction(labels,tabId,pageScopeId,
                                    acceptFunction,overWriteFunction,callerCmp);
                        },
                        
                        
                        
                        /**Shows template  dialog action. For sequence With 3 buttons and associate events to them*/
                        templateSequenceDlgShowAction : function(/*map*/labels,/*String*/tabId,/*String*/ pageScopeId,sequenceId) {
                            var callerCmp = {};
                            var acceptFunction=function(){
                                var btCtrl =    ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
                                btCtrl.templateOverCall =  "New";
                                btCtrl.sequenceLastAction(sequenceId);
                            };
                            
                            var overWriteFunction=function(){
                                var btCtrl =    ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
                                btCtrl.templateOverCall = "OverWrite";
                                btCtrl.sequenceLastAction(sequenceId);
                            };
                            this._templateDlgShowAction(labels,tabId,pageScopeId,
                                    acceptFunction,overWriteFunction,callerCmp);
                        },
                        
                        /** Internal function to call the dialog for templates*/
                        _templateDlgShowAction:function(/*map*/labels,/*String*/tabId,/*String*/ pageScopeId,
                                /*function*/acceptFunction,/*function*/overWriteFunction,/*Obj*/callerCmp){
                            
                            var dlgConfirm = new ConfirmTemplateDialog({
                                acceptDialogLabel : labels["New"],
                                cancelDialogLabel : labels["Cancel"],
                                overWriteDialogLabel : labels["PLANTILLA_OVERWRITE"],
                                title : labels["PLANTILLA_CONFIRM"],
                                content : labels["PLANTILLA_DUPLICATE"],
                                acceptAction : acceptFunction,
                                overWriteAction:overWriteFunction
                                
                            });
                            dlgConfirm.errorHandler = dojo.hitch(this,this.errorHandler);
                            dlgConfirm.callerCmp = callerCmp;
                            dlgConfirm.tabId = tabId;
                            dlgConfirm.pageScopeId = pageScopeId;
                            dlgConfirm.show();
                        },

                        // function to be passed to the confirm dialog.
                        _undoDialogActin : function() {
                            // here call to dwr to undo the action.
                            // callbackscope: object that contains variables to
                            // be passed on callback methods.
                            var callObj = {
                                callbackScope : {
                                    treeGrid : this.treeGrid
                                }
                            };
                            callObj.errorHandler = dojo.hitch(this,this.errorHandler);
                            callObj.callback = this.callBckFnctnDwr;
                            DocumentControllerDWR.undoDocument(
                                    this.rowItemData.id[0],
                                    this.treeGrid.tabIdvar,
                                    this.treeGrid.pageScopeIdvar, callObj);
                        },

                        /* function called after the dwr process. */
                        callBckFnctnDwr : function(/* object */outcome) {
                            if (outcome.status == "success") {
                                // only if exists.
                                // reloads the tree grid data that was set
                                // at the creation of the dialog.
                                if (this.treeGrid) {
                                    ec.fisa.controller.utils.updateRowTreeGrid(
                                            this.treeGrid, outcome);
                                }

                            }
                        },

                        historyTreeGridAction : function(treeGrid, rowItemData) {

                            // callbackscope: object that contains variables to
                            // be passed on callback methods.
                            var callObj = {
                                callbackScope : {
                                    treeGrid : treeGrid
                                }
                            };
                            callObj.errorHandler = dojo.hitch(this,this.errorHandler);
                            callObj.callback = this.callBckFnctnHistoryDwr;
                            DocumentControllerDWR.processLaunchShowHistory(
                                    rowItemData.id[0], treeGrid.tabIdvar,
                                    treeGrid.pageScopeIdvar, callObj)

                        },

                        /* function called after the dwr process. */
                        callBckFnctnHistoryDwr : function(/* object */outcome) {
                            if (outcome.status == "success") {
                                var documentHisArray = outcome.details;
                                // var dataStr= dojo.toJson(documentHisArray);

                                var labels = outcome.labels;
                                var contextPath = dojo.config.fisaContextPath;
                                var dialogObj = new DialogSimple(
                                        {
                                            // i can call this.titleDlg cause
                                            // the scope previously inserted.
                                            title : labels["treeDocHistory"],
                                            href : contextPath
                                                    + "/pages/static/documents/document_history.jsp",
                                            ioArgs : {
                                                content : {
                                                    tabId : this.treeGrid.tabIdvar,
                                                    btId : this.treeGrid.btIdvar,
                                                    actionId : this.treeGrid.actionIdvar,
                                                    pageScopeIdDocument : this.treeGrid.pageScopeIdvar
                                                }
                                            },
                                            ioMethod : dojo.xhrPost
                                        });
                                dialogObj.documentHisArray = documentHisArray;
                                dialogObj.labels = labels;
                                dialogObj.contextPath = contextPath;
                                dialogObj.show();

                            }
                        },
                        obtainParentBreadCrumb : function(component) {
                            var fisaTab = component;
                            while (fisaTab.declaredClass != "dijit.layout.TabContainer") {
                                if (fisaTab.getParent()) {
                                    fisaTab = fisaTab.getParent();
                                } else {
                                    break;
                                }
                            }
                            //Verificación adicional, si el el tab tiene la propiedad isinnertabcontainer igual a true continua la busqueda
                            //Introducido para soportar la administracion de beneficiarios JCVQ
                            if(fisaTab && fisaTab.finner && fisaTab.finner === "true" && fisaTab.getParent()){
                                fisaTab = this.obtainParentBreadCrumb(fisaTab.getParent());
                            }
                            return fisaTab;
                        },
                        
                        //obtains bt Title by panel message component
                        obtainBtTitle:function(component,first){
                            var _first = first || false;
                            var div = null;
                            var fisaTab = component;
                            while (fisaTab.declaredClass != "dijit.layout.TabContainer") {
                                if (fisaTab.getParent()) {
                                    fisaTab = fisaTab.getParent();
                                } else {
                                    break;
                                }
                            }
                            //first tabcontainer searched.
                            if(fisaTab != undefined && fisaTab != null){
                                var nodeListArray =dojo.query(".btTitle", fisaTab.domNode);
                                if(nodeListArray != null && nodeListArray.length >0){
                                    //came only one.
                                    if(_first){
                                        div=    nodeListArray[0];
                                    } else {
                                        div=    nodeListArray[nodeListArray.length-1];
                                    }
                                    
                            //      div=    nodeListArray[0];
                                }
                            }
                            return div;
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
                            
                            

                            var newSubTabPaneArg = {};
                            // newSubTabPaneArg.title=title;
                            // newSubTabPaneArg.iconClass="breadcrumbIcon";
                            newSubTabPaneArg.href = url;
                            // newSubTabPaneArg.postClose = this.cargarTareas2;
                            // newSubTabPaneArg.postCloseScope = this.id;
                            // newSubTabPaneArg.postCloseArgs = [this.tabId];
                            ec.fisa.navigation.utils.updateCurrentBreadCrumb(
                                    newSubTabPaneArg, contentPaneId,tabId,pageScopeId);

                        },
                        /**Invokes the filter*/
                        navigateToSchedulePage:function(/*String*/btId, /*String*/toRenderBt,
                                /*String*/tabId,/*String*/title,/*String*/dataKey,
                                /*id widget*/btContentPaneId,/*String*/  pageScopeId){
                        // caso de mostrar scheduling.
                        var url = "";
                        url += dojo.config.fisaContextPath;
                        url += "/";
                        url += "SCHEDULE_FILTER";
                        url += "/";
                        url += "BUSINESS_TEMPLATE";
                        url += "/";
                        url += toRenderBt;
                        url += "/FISATabId/";
                        url += tabId;
                        url += "/FDK/";
                        url += dataKey;
                        url += "/_FDK";
                        url += "/actionMode/QY";
                        url += "/";
                        url += "REQUEST_SCHEDULE_FILTER_BT";
                        url += "/";
                        url += btId;
                        url += "/REQUEST_HIDE_BUTTON_BAR/true";
                        url += "/index.jsp";    
                        //url += "/content.jsp";//to be called in tabwrapped false
                        var newSubTabPaneArg = {};
                        newSubTabPaneArg.title = title;
                        newSubTabPaneArg.iconClass = "breadcrumbIcon";
                        newSubTabPaneArg.href = url;
                        // newSubTabPaneArg.postClose = this.cargarTareas2;
                        // newSubTabPaneArg.postCloseScope = this.id;
                        // newSubTabPaneArg.closeArgs =
                        // [breadcrumb,message];
                        ec.fisa.navigation.utils.updateCurrentBreadCrumb(
                                newSubTabPaneArg, btContentPaneId,tabId, pageScopeId);
                        
                        },
                        
                         
                        /*openChat:function(){
                            var footer=dijit.byId("chatCP");
                            if(footer==null){
                                //var _url = dojo.config.fisaContextPath+"/pages/chat.jsp";
                                
                                //pruebita
                                var _url = "/mcm-web-chat/client.jsp?username=alucard";
                                footer=new dojox.layout.ContentPane({id:"chatCP",href:_url,"doLayout":false},domConstruct.create("div",{},dojo.byId("copyright")));
                                footer.startup();
                                footer._onShow();
                            }
                        },*/
                        
                        openChat:function(){
                            
                            var footer = dijit.byId("chatCP");
                            var username=dojo.config.fisaChatUsername;
                            var fisaSessionId = dojo.config.fisaSessionId;
                            var fisaUserData64 = dojo.config.fisaUserData64;
                            var fisaChatGroup = dojo.config.fisaChatGroup;
                            //var fisaContextPath = dojo.config.fisaContextPath;
                            //var fisaDojoReleaseNameUrl = dojo.config.fisaDojoReleaseNameUrl;
                            //var fisaDojoSrcUrl = dojo.config.fisaDojoSrcUrl;
                            var fisaDojoRootUrl = dojo.config.fisaDojoRootUrl;
                            if (footer == null) {
                                // var _url = dojo.config.fisaContextPath + "/pages/chat.jsp";
                                if (dojo.config.fisaFinalUser == '1') {
                                    var _url = dojo.config.modulePaths.chat + "/pages/client.jsp?username=" + username + "&fisaSessionId=" 
                                    	+ encodeURIComponent(fisaSessionId) + "&fisaUserData64=" + encodeURIComponent(fisaUserData64)
                                    	+ "&fisaChatGroup="+ fisaChatGroup;
                                    footer = new dojox.layout.ContentPane({
                                        id : "chatCP",
                                        href : _url,
                                        "doLayout" : false,
                                        style : ""
                                    }, domConstruct.create("div", {style : ""}, dojo
                                    		//.byId("copyright")));
                                    		.body()));
                                            
                                    footer.startup();
                                    footer._onShow();
                                    
                                } else {
                                    var _url = dojo.config.modulePaths.chat + "/pages/manageClients.jsp";
                                    //window.open(_url + '?operator=' + username + '&fisaSessionId=' + encodeURIComponent(fisaSessionId) + "&fisaDojoRootUrl=" 
                                    //		+ fisaDojoRootUrl + "&fisaUserData64=" + encodeURIComponent(fisaUserData64), username, 'menubar=0,resizable=1,width=600,height=350' );
                                    window.open('', username, 'menubar=0,resizable=1,width=600,height=350');
                                    var form = domConstruct.create("form");
                                    form.action = _url;
                                    form.method = "POST";
                                    form.target = username;
                                    
                                    var inputOperator = domConstruct.create("input");
                                    inputOperator.name = "operator";
                                    inputOperator.value = username;
                                    inputOperator.type = "hidden";
                                    form.appendChild(inputOperator);
                                    var inputSessionId = domConstruct.create("input");
                                    inputSessionId.name = "fisaSessionId";
                                    inputSessionId.value = fisaSessionId; //encodeURIComponent(fisaSessionId);
                                    inputSessionId.type = "hidden";
                                    form.appendChild(inputSessionId);
                                    var inputDojoRoot = domConstruct.create("input");
                                    inputDojoRoot.name = "fisaDojoRootUrl";
                                    inputDojoRoot.value = fisaDojoRootUrl;
                                    inputDojoRoot.type = "hidden";
                                    form.appendChild(inputDojoRoot);
                                    var inputUserData64 = domConstruct.create("input");
                                    inputUserData64.name = "fisaUserData64";
                                    inputUserData64.value = fisaUserData64; //encodeURIComponent(fisaUserData64);
                                    inputUserData64.type = "hidden";
                                    form.appendChild(inputUserData64);
                                    var inputChatGroup = domConstruct.create("input");
                                    inputChatGroup.name = "fisaChatGroup";
                                    inputChatGroup.value = fisaChatGroup; //encodeURIComponent(fisaUserData64);
                                    inputChatGroup.type = "hidden";
                                    form.appendChild(inputChatGroup);
                                    
                                    
                                    form.style.display = 'none';
                                    dojo.body().appendChild(form);
                                    form.submit();
                                }
                                // var _url = dojo.config.modulePaths.chat + "/manageClients.jsp";
                                
                            }
                        },
                        hideChat:function(){
                        	
                        	dojo.query("#chatCP").style("display", "none");
                        	 
//                             dojo.query("#chatCP").attr({
//                 				"display" : "none"
//                 			});
                        },
                        closeChat:function(){
                            //alert('HHHHHHHHHHHHHHHHHHH');
                            var footer=dijit.byId("chatCP");
                            if(footer!=null){
                                footer.destroyRecursive(false);
                            }
                        },
                        /**
                         * method for loading the next dynamic content or the component if all exists.
                         * */
                        nextDynamicContent:function(/*String*/tabId, /*String*/pageScopeId,/*String*/ id,/*String*/href){
                        	var button = dijit.byId(id);
                        	//first obtain the container.
                        	var dynamicContentPane = button.getParent();
                        	if(dynamicContentPane){
                        		
                        		var i= href.lastIndexOf("/");
                        		var l =href.length;
                        		var phref = href.substring(0, i)+"/FISATabId/";
                        		phref += tabId;
                        		phref += "/FisaPageScopeId/";
                        		phref += pageScopeId;
                        		phref += "/dynamicApplied/true";
                        		phref += href.substring(i, l);
                        		phref = phref.replace("/FPSC","");
//                        		dynamicContentPane.ioArgs =newSubTabPaneArg.ioArgs;
                        		dynamicContentPane.setHref(phref);
                        	}
                        	 /*anchor a cabecera*/
                            ec.fisa.navigation.utils.gotoTop();
                        },
                        
                        
                        //called at the main page to logout.
                        logoutButton:function(/*String*/id, /*String*/ urlDirect,/*String*/bt){
                        	var button = dijit.byId(id);
                        	button.onClick=dojo.hitch(this, function(evt){

                        		if(dojo.config.hasLogoutContentDynamic == true){
                        			var tabContainer = dijit.byId("tabContainer");

                        			var newTabPaneArg = {};
                        			newTabPaneArg.fromPlataforma = false;
                        			newTabPaneArg.preload = true;

                        			newTabPaneArg.title = "";
                        			newTabPaneArg.closable = true;
                        			newTabPaneArg.nested = true;

                        			var newTabPane = new dijit.layout.TabContainer(newTabPaneArg);
                        			tabContainer.addChild(newTabPane);
                        			newTabPane.startup();
                        			tabContainer.selectChild(newTabPane);

                        			var newSubTabPaneArg = {};
                        			var url = dojo.config.fisaContextPath;
                        			url += "/BUSINESS_TEMPLATE_CUSTOMIZED/";
                        			url += bt;
                        			url += "/logout/true";

                        			newSubTabPaneArg.href = url;
                        			var newSubTabPane = new ec.fisa.layout.ContentPane(
                        					newSubTabPaneArg);
                        			if(newSubTabPane!=null){
                        				newTabPane.addChild(newSubTabPane);
                        			}
                        		}
                        		else{
                        			window.location.href = urlDirect;
                        		}
                        	});
                        },
                        
                        /*logut de la aplicacion mantis 20110*/
                        logoutLink:function(/*String*/id, /*String*/ urlDirect,/*String*/bt){
                        	/*var button = dijit.byId(id);
                        	button.onClick=dojo.hitch(this, function(evt){*/

                        		if(dojo.config.hasLogoutContentDynamic == true){
                        			var tabContainer = dijit.byId("tabContainer");

                        			var newTabPaneArg = {};
                        			newTabPaneArg.fromPlataforma = false;
                        			newTabPaneArg.preload = true;

                        			newTabPaneArg.title = "";
                        			newTabPaneArg.closable = true;
                        			newTabPaneArg.nested = true;

                        			var newTabPane = new dijit.layout.TabContainer(newTabPaneArg);
                        			tabContainer.addChild(newTabPane);
                        			newTabPane.startup();
                        			tabContainer.selectChild(newTabPane);

                        			var newSubTabPaneArg = {};
                        			var url = dojo.config.fisaContextPath;
                        			url += "/BUSINESS_TEMPLATE_CUSTOMIZED/";
                        			url += bt;
                        			url += "/logout/true";

                        			newSubTabPaneArg.href = url;
                        			var newSubTabPane = new ec.fisa.layout.ContentPane(
                        					newSubTabPaneArg);
                        			if(newSubTabPane!=null){
                        				newTabPane.addChild(newSubTabPane);
                        			}
                        		}
                        		else{
                        			window.location.href = urlDirect;
                        		}
                        	/*});*/
                        },
                        /*llama a una BT por su URL usa como base el id de la bt modo de acceso y datakey mantis 20110*/
                        callBtOrQtById: function(/*String*/ btId, /*String*/ dataKey, /*String*/ actionMode, /*String*/ isBt, title){
                        	var type="";
                        	if(isBt!=null && isBt=='1'){
                        		type="BUSINESS_TEMPLATE_CUSTOMIZED_URL";
                        		/*relatedParameter="datakey="+dataKey;*/
                        	}else{
                        		type="ITEM_QUERY_TEMPLATE";
                        	}
                          var containerTitle=document.getElementById("titlePurple");
                          if(containerTitle!=null)
                        	  containerTitle.innerHTML="<h2>"+title+"</h2>";
            			  var container = dijit.byId("topPrefSubMenu");
							if(container!=null ){
								container.destroyRecursive(false);
							}
						  var containerCntnPn = dijit.byId("submenuOptions");
						  if(containerCntnPn!=null){
						  container = new dijit.MenuBar(
								  {
										id : "topPrefSubMenu",
										name : "topPrefSubMenu"
									},dojo.create("div",null,containerCntnPn.domNode));
							var menuItem = new dijit.MenuBarItem(
										{
											label : title,
													id : "menuPref"+btId,
															
															baseClass: "dijitHorizontalSubMenuItem",
															hotKey:""
										});	
							
								container.addChild(menuItem);
								var cssClass=container.domNode.childNodes[0].className;
								cssClass=cssClass+" preferenceMenuActive ";
								container.domNode.childNodes[0].className=cssClass;
						  }	
								
                      	  var callObj = {
                                    callbackScope : {
                                  	  btId : btId,
                                  	  dataKey : dataKey,
                                  	  actionMode : actionMode,
                                  	  isBt : isBt,
                                  	  type:type,
                                  	  name:title
                                    }
                                };
                      	callObj.callback=this.callBtOrQtByIdCallBack;
                      	EventActionDWR.callBTQTResourceurl(btId,dataKey,actionMode,isBt,callObj);
                      	var tabContainer = dijit.byId("tabContainer");
        				tabContainer.resize();
        				var bodyContainer = dijit.byId("borderContainerBody");
        				bodyContainer.resize();
                      },
                      
                      gotoTop : function(){
                    	  /*anchor a cabecera*/
                          var url = location.href;
                          window.location.href = "#"+"cabecera";
                          history.replaceState(null,null,url);
                      }
                      ,
                      
                      /*llama a una BT por su URL usa como base el id de la bt modo de acceso y datakey mantis 20110*/
                      callBtOrQtByIdCallBack :function(/*String*/ urlResource){
                      	var item={itemType:this.type,
                        		  realUrl:urlResource,
                        		    name:this.title
                          			};
                          ec.fisa.menu.utils.loadMenuTabContainer(item,true);     
                      }
                            
                    });
            fisaNavigation.utils = new Utils;
            ec.fisa.navigation.utils = fisaNavigation.utils;
            return Utils;
        });


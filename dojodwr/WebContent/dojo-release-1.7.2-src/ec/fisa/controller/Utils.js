/**
 * Util.js
 * 
 * Objeto js que contiene metodos para inicializar un controlador, y setear en
 * memoria el panel de mensajes.
 * 
 */

define(
		[ "dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/lang", "dojox/lang/functional/object",
		  "ec/fisa/controller/_base","dojo/dom-geometry","dijit/focus","ec/fisa/mvc/StatefulModel"],
		  function(dojo, declare, lang, functionalObject, fisaController,domGeometry,focus) {

			var Utils = declare(
					"ec.fisa.controller.Utils",
					null,
					{
						/**
						 * Function that initializes a controller and appends to
						 * the global variable ec.fisa.tc. instancerFunction:
						 * returns the controller.
						 */
						initController : function(/* String tabid */tabId, /* Function */
								instancerFunction) {
							var controllerInst = instancerFunction(tabId);
							var i = "t" + tabId;
							if (ec.fisa.tc) {
								if (ec.fisa.tc[i]) {
									return ec.fisa.tc[i];
								}
							} else {
								ec.fisa.tc = {};
							}
							// here appendes with the unique tabid the
							// controller.
							ec.fisa.tc[i] = controllerInst;
							var tabContainer=dijit.byId("tabContainer");
							if(!tabContainer.selectedChildWidget.tabId){
								tabContainer.selectedChildWidget.tabId=tabId;
							}
							return controllerInst;
						},

						/**
						 * Inits at the general map the controllers of
						 * pages, documents. everything that generates
						 * besides tabId, a pageScopeId
						 */
						initPageController : function(/* String numbers only tabid */tabId,/*String numbers*/pageScopeId, /* Function/Controller */
								instancer, isInstance) {
							var instance = isInstance||false;
							var i = "t" + tabId+"p"+pageScopeId;
							if (ec.fisa.tc) {
								if (ec.fisa.tc[i]) {
									var controller = ec.fisa.tc[i];
									return controller;
								}
							} else {
								ec.fisa.tc = {};
							}
							// here appendes with the unique tabid the
							// controller.
							var controllerInst = null;
							if(instance==true){
								controllerInst=instancer;
							}else{
								controllerInst=instancer(tabId,pageScopeId);
							}
							ec.fisa.tc[i] = controllerInst;
							// in documents dialog has another controller for the dialog.
							// if exists defined dont override the existing values.
							if(controllerInst.isLovModal == undefined || controllerInst.isLovModal == false ){
								var tabContainer=dijit.byId("tabContainer");
								if(tabContainer){
									var subTab=tabContainer.selectedChildWidget.selectedChildWidget;
									if(subTab!=null){
										if(subTab.tabId){
											var idx = dojo.indexOf(subTab.tabId, tabId);
											if (idx >= 0) {
												subTab.tabId.push(tabId);
											}
										}else{
											subTab.tabId=[tabId];
										}
										if(subTab.pageScopeId){
											subTab.pageScopeId.push(pageScopeId);
										}else{
											subTab.pageScopeId=[pageScopeId];
										}
										subTab.onUnload=function(){
											ec.fisa.controller.utils.uninitializeController(this.tabId, this.pageScopeId);
											//in case it exists internal bt erase the father too.
											if(this.pageScopeId != null && this.pageScopeId != undefined
													&& (this.pageScopeId.indexOf("_resourceIn") != -1)){
												
												
												
												
											}
											return true;
										};
									}
								}
							}
							else{
								//TODO: generar codigo para destruir los controladores de los lovs.


							}
							return controllerInst;
						},


						/**Uninitialize controller*/
						uninitializeController:function(/*String*/tabId,/*String*/pageScopeId){
							var tabIds=null;
							var pageScopeIds=null;
							if(typeof tabId != "string"){
								tabIds=tabId;
								pageScopeIds=pageScopeId;
							} else {
								tabIds=[tabId];
								pageScopeIds=[pageScopeId];
							}
							dojo.forEach(tabIds,function(ctabId,i){
								var cpageScopeId=pageScopeIds[i];
								var cntrlr = ec.fisa.controller.utils.getPageController(ctabId,cpageScopeId);
								if(cntrlr!=null&&cntrlr.destroy){
									cntrlr.destroy();
								}
								cntrlr = null;
								ec.fisa.controller.utils.clearPageController(ctabId,cpageScopeId);
							},this);
						},

						resetControllerData:function(/*String*/tabId,/*String*/pageScopeId){
							var cntrlr = ec.fisa.controller.utils.getPageController(tabId,pageScopeId);
							if(cntrlr!=null&&cntrlr.destroy){
								cntrlr.destroy();
							}
						},
						

						/**
						 * Obtains the controller asociated with the tab Id
						 * 
						 */
						getController : function(/*String tabId*/tabId) {
							//the t is appended because there cant be variables with numbers.
							//the tabid is a string numeric.
							if(ec.fisa.tc){
								var i = "t" + tabId;
								return ec.fisa.tc[i];
							}
							return null;
						},

						/**
						 * Obtains the controller asociated with the tab Id and the pageScopeId
						 * 
						 */
						getPageController : function(/*String tabId*/tabId ,/*String numbers*/pageScopeId) {
							//the t is appended because there cant be variables with numbers.
							//the tabid is a string numeric.
							if(ec.fisa.tc){
								var i = "t" + tabId+"p"+pageScopeId;
								return ec.fisa.tc[i];
							}
							return null;
						},

						/**
						 * Setea el  panel de mensajes con el tabid y el valor del panel de dojo.
						 * */
						setMessagesPanel : function(
								/*String Id del tab */tabId, /* ec.fisa.message.Panel */
								newMessagesPanel) {
							this.setAttr(tabId, 'messagesPanel',
									newMessagesPanel);
						},
						setPageBindingForm : function(index, pageScopeId, newBindingForm) {
							this.setPageAttr(index, pageScopeId, 'bindingForm', newBindingForm);
						},
						setBindingForm : function(index, newBindingForm) {
							this.setAttr(index, 'bindingForm', newBindingForm);
						},
						/**
						 * Obtains the controller associated with the tab id, this controller
						 * is associated temporally in ec.fisa.tc with the tabId.
						 * And u set the dojo component as a new attribute in the controller.
						 *  
						 * */
						setAttr : function(/*String tab id*/tabId,/*string attribute*/
								attr,/* dojo component */attrVal) {
							//sets new attribute.
							this.getController(tabId)[attr] = attrVal;


						},
						/**
						 * Obtains the controller associated with the tab id, this controller
						 * is associated temporally in ec.fisa.tc with the tabId.
						 * And u set the dojo component as a new attribute in the controller.
						 *  
						 * */
						setPageAttr : function(/*String tab id*/tabId,/*String pageScope id*/pageScopeId,/*string attribute*/
								attr,/* dojo component */attrVal) {
							//sets new attribute.
							this.getPageController(tabId,pageScopeId)[attr] = attrVal;


						},
						clearControllers:function(tabId){
							var toDel = [];
							dojo.functional.forIn(ec.fisa.tc,function(index){
								if(index.indexOf("t"+tabId)==0){
									toDel.push(index);
								}
							},this);
							dojo.forEach(toDel,function(item){
								delete ec.fisa.tc[item];
							});
						},
						clearPageController:function(tabId,pageScopeId){
							delete ec.fisa.tc["t"+tabId+"p"+pageScopeId];
						},
						/* updates the specific row of the treegrid**/
						updateRowTreeGrid:function(/*dojo Widget*/treeGrid,/*row item to be updated*/ outcome){

							var treeGridStore = treeGrid.store;

							//	treeGridStore.fetch( { query: { id: outcome.details.id[0] },  

							treeGridStore.fetchItemByIdentity({
								identity: outcome.details.id,
								scope:{outcome:outcome,treeGrid:treeGrid},
								onItem: function(item) { 
									// console.log(item);

									var varNew = this.outcome.details;

									item.changed= [varNew.changed];
									if(varNew.children && varNew.children.length > 0)
									{item.children= varNew.children;
									}
									else{
										item.children = [];
									}
									item.complement= [varNew.complement];
									item.daysValid= [varNew.daysValid];
									item.description= [varNew.description];
									item.expirationDate= [varNew.expirationDate];
									item.expires= [varNew.expires];
									item.historial= [varNew.historial];
									item.id= [varNew.id];
									item.maxDeliveryDate= [varNew.maxDeliveryDate];
									item.prolongable= [varNew.prolongable];
									item.receptionDate= [varNew.receptionDate];
									item.required= [varNew.required];
									item.status= [varNew.status];
									item.type= [varNew.type];
									item.fileUploaded= [varNew.fileUploaded];
									item.documentUploaded= [varNew.documentUploaded];



									//this.treeGrid.setStore(this.treeGrid.store);

									// to update just one row.
									var idx = this.treeGrid.getItemIndex(item);
									if(typeof idx == "string"){
										this.treeGrid.updateRow(idx.split('/')[0]);
									}else if(idx > -1){
										this.treeGrid.updateRow(idx);
									}					

								}
							});
							//treeGrid.setQuery({id: "*"});
							/*
							treeGrid.store.close();
							treeGrid.sort();*/


						},
						doPanelsLayout:function(childWidget,layoutChlidren){/*
							var parentCmp=childWidget.getParent();
							var geomsH = 0;
							var tab=null;
							dojo.forEach(parentCmp.getChildren(),function(item){
								if(item["fisa-to-layout"] == "true"){
									tab =item;
								} else {
									var geoms = domGeometry.getMarginBox(item.domNode);
									geomsH+=geoms.h;
								}
							},this);
							if(tab){
								var newSize=null
								if(parentCmp instanceof dojox.widget.DialogSimple){
									var parentGeoms = domGeometry.getMarginBox(parentCmp.domNode);
									var parentTitleGeoms = domGeometry.getMarginBox(parentCmp.titleNode);
									var parentGeomsC=parentCmp.get("_contentBox");
									newSize={w:parentGeomsC.w,h:(parentGeoms.h-parentTitleGeoms.h-29)};
								}else{
									var parentGeoms = domGeometry.getMarginBox(parentCmp.domNode);
									newSize={w:parentGeoms.w,h:(parentGeoms.h-geomsH)};
								}
								tab.resize(newSize);
								if(dojo.isIE){
									parentCmp.domNode.scroll="no";
								} else {
									parentCmp.domNode.style.overflow="none";
								}
								if(layoutChlidren){
									dojo.forEach(tab.getChildren(),function(item){
										item.resize(newSize);
										if(item instanceof dijit.layout.TabContainer){
											item.doLayout=true;
											item.layout();
										}
									},this);
								}
							}*/
						},
						getModalSize:function(proportion){
							var propo=proportion||1;
							var tabContainer = dijit.byId("tabContainer");
							var tabContainerGeoms = domGeometry.getMarginBox(tabContainer.domNode);
							return {h:tabContainerGeoms.h*propo,w:tabContainerGeoms.w*propo};
						},
						getGlobalModalSize:function(proportion){
							var propo=proportion||1;
							var tabContainer = dijit.byId(dojo.config.fisaStandbyId);
							var tabContainerGeoms = domGeometry.getMarginBox(tabContainer.domNode);
							return {h:tabContainerGeoms.h*propo,w:tabContainerGeoms.w*propo};
						},
						parseCssUrl:function(cssUrl){
							var outcome = null;
							if(cssUrl){
								cssUrl=cssUrl.replace(/"/g,"");
								cssUrl=cssUrl.replace(/'/g,"");
								var i=cssUrl.indexOf("http");
								var j =cssUrl.lastIndexOf(')');
								outcome=cssUrl.substring(i,j);
							}
							return outcome;
						},
						findCurrentBreadCrumb:function(component){
							var outcome = null;
							var parent = component.getParent();
							
							if(parent){
								var declaredClass = parent.get("declaredClass");
								var nested = parent.get("nested");
								if("dijit.layout.TabContainer" === declaredClass && true === nested){
									outcome = parent;
								}else{
									outcome = this.findCurrentBreadCrumb(parent);
								}
							}else{
								outcome = component;
							}
							return outcome;
						},
						getCurrentTranslation : function(stringToTranslate, languageCode , supportedLanguages) {
							var currentTranslation = '';
							if (stringToTranslate != null && stringToTranslate.indexOf(String.fromCharCode(255))) {
								var arrayTranslation = stringToTranslate.split(String.fromCharCode(255));
								currentTranslation = this.selectTranslation(supportedLanguages, languageCode, arrayTranslation);
							} else {
								currentTranslation = stringToTranslate;
							}
							return currentTranslation;
						},
						selectTranslation : function(languageCollection,
								languageCode, arrayTranslation) {
							var count = 0;
							var currentLangIndex = 0;
							var currentTranslation = '';

							for ( var i = 0; i < languageCollection.length; i++) {
								var map = languageCollection[i];
								var langId = map['languageId'];
								if (languageCode == langId) {
									currentLangIndex = count;
									if (currentLangIndex < arrayTranslation.length) {
										currentTranslation = arrayTranslation[currentLangIndex];
									} else {
										currentTranslation = '';
									}

									if (currentTranslation.length == 0) {
										var langParentId = map['parentCode'];
										if (langParentId != null) {
											var parentTranslation = this.selectTranslation(languageCollection,langParentId,
													arrayTranslation);
											currentTranslation = parentTranslation;
										} else {
											currentTranslation = arrayTranslation[0];
										}
										break;
									}
									break;
								}
								count++;
							}
							return currentTranslation;
						}
//						,getPortletsPageScopeIds:function(tabId){
//						    var portletsPageScopeId =[];
//							if(ec.fisa.tc){
//								for(var prop in ec.fisa.tc) {
//								    if(ec.fisa.tc.hasOwnProperty(prop)){
//								        if(tabId == ec.fisa.tc[prop].tabId && tabId!=ec.fisa.tc[prop].pageScopeId){
//										    console.log('pagescopeId found: ' + ec.fisa.tc[prop].pageScopeId);
//										    portletsPageScopeId.push(ec.fisa.tc[prop].pageScopeId);
//								        }
//								    }
//								 }
//							}
//						    return portletsPageScopeId;
//						}
					});
			fisaController.utils = new Utils;
			ec.fisa.controller.utils=fisaController.utils;
			return Utils;
		});

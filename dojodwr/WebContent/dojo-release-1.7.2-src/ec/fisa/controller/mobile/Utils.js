/**
 * Util.js
 * 
 * Objeto js que contiene metodos para inicializar un controlador, y setear en
 * memoria el panel de mensajes.
 * 
 */

define(
		[ "dojo/_base/kernel", "dojo/_base/declare"/*, "ec/fisa/controller/Utils"*/, "./_base"],
		  function(dojo, declare) {

			var Utils = declare(
					"ec.fisa.controller.mobile.Utils",
					null,
					{
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
										subTab.tabId=tabId;
										subTab.pageScopeId=pageScopeId;
										subTab.onUnload=function(){
											ec.fisa.controller.utils.uninitializeController(this.tabId, this.pageScopeId);
											//in case it exists internal bt erase the father too.
											if(this.pageScopeId != null && this.pageScopeId != undefined
													&& (this.pageScopeId.indexOf("_resourceIn") != -1)){
												
												
												
												
											}
											return true;
										}
									}
								}
							}
							else{
								//TODO: generar codigo para destruir los controladores de los lovs.


							}
							return controllerInst;
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
						attachInput:function(){
							var ctrlr=ec.fisa.controller.mobile.utils.getPageController(this.fisatabid,this.fisapageid);
							if(ctrlr==null){
								ctrlr=ec.fisa.controller.mobile.utils.initPageController(this.fisatabid,this.fisapageid,function(){
									return {
										execOne:function(){
											alert(text1);
										}
									};
								});
							}
							ctrlr.text1=this.id;
						},
						initActionBtn : function() {
							var ctrlr=ec.fisa.controller.mobile.utils.getPageController(this.fisatabid,this.fisapageid);
							//this.connect(this,"onClick",ctrlr.execOne);
						}
					});
			ec.fisa.controller.mobile.utils=new Utils();
			return Utils;
		});

define( [ "dijit/_Widget", 
          "dojo/_base/declare",
          "dijit/_Templated",
          "dojo/text!./templates/QtController.html",
          "ec/fisa/mvc/StatefulModel",
          "ec/fisa/controller/mobile/BaseController",
          "ec/fisa/mobile/widget/MessagePanel",
          "dojox/mobile/SimpleDialog",
          "dojo/_base/window",
          "dojo/dom-construct",
          "dojox/mobile/Button",
          "dojo/dom-style",
          "ec/fisa/mobile/widget/QtParameterButton",
          "ec/fisa/controller/Utils",
          "ec/fisa/dwr/proxy/QtControllerDWR",
          "ec/fisa/dwr/Store",
          "./_base"],
		function(_Widget, declare,_Templated,template,StatefulModel,BaseController,MessagePanel, SimpleDialog, Window,domConstruct,Button,domStyle) {

			return declare("ec.fisa.mobile.widget.QtController", [ _Widget,BaseController], {
				templateString: template,
				data:null,
				parentData:null,
				parentComplementData:null,
				model:null,
				modelComplement:null,
				selectData:null,
				selectDataMap:null,
				fisatabid:"",
				qtid:"",
				fisapageid:"",
				store:null,
				isForRenderCharts:false,
				actionsDialogId: null,
				initialData:null,
				ftype:'',
				isFirstTimePortlet:true,
				linkParentFisaTabId : "",
				linkParentFisaPageScopeId : "",
				linkParentBtId  : "",
				initialStart:null,
				initialPageLenght:null,
				postMixInProperties:function(){
					this.inherited(arguments);
					this.model = new StatefulModel({});
					this.modelComplement = new StatefulModel({});
					this.model.appendObject(['autoExec'],0,null,null,null,false);
					//
					this.model.appendObject(['start'],this.initialStart,null,null,null,false);
					this.model.appendObject(['count'],this.initialPageLenght,null,null,null,false);
					//
					if(this.parentData==null){
						this.parentData={};
					}
					if(this.parentComplementData==null){
						this.parentComplementData={};
					}
					this.store= new ec.fisa.dwr.Store("QtControllerDWR", "viewData", this.fisatabid,this.qtid,[this.fisapageid], null);
					ec.fisa.controller.utils.initPageController(this.fisatabid,this.fisapageid,this,true);
					
					if(this.initialData!=null){
						dojox.lang.functional.forIn(this.initialData,function(value,paramId){
							if(value!=null){
								this.parentData[paramId] = value;
							}
						},this);
					}
					this.store.callbackScope=this;
				},
				loadSelectData:function(component,ignoreSetOptions) {
					var iso=ignoreSetOptions||false;
					var btId = component["bt-id"];
					var fieldId = component["field-id"];
					var listOfOptions = [];
					if(this.selectDataMap && this.selectDataMap[btId][fieldId]["data"]){
						var selectItems = this.selectDataMap[btId][fieldId]["data"];
						listOfOptions[0] = {value : "" , label : dojo.config.fisaSelectLabel};
						dojo.forEach(selectItems, function(item, index){
							listOfOptions[index+1]  = {value : "" + item[component.valueColumn], label : item[component.labelColum]};
						},this);
					}
					if(!iso){
						component.set("options", listOfOptions);
					}
					return listOfOptions;
				},
				obtainInitialValue:function(component){
					var fid=component["field-id"];
					var field = null;
					if(this.parentData&&this.parentData[fid]){
						field = this.parentData[fid];
					}
					if(field == null) {
						return "";
					} else {
						return field;
					}
				},
				
				executeAction:function(requiredSelection, action, preSelect){
//					var action = event.currentTarget.qtAction;
					var fc = ec.fisa.controller.utils.getPageController(this.fisatabid,this.fisapageid);
					fc.clearPanelMessage();
					var selected = [];/*TODO:verificar cuando sea seleccion multiple*/
					if(requiredSelection){
						selected[0] = this.selection.indexSelected;
					}
					if(preSelect!=null){
//						var qtGrid = dijit.byId(fc.qtGridId);
//						var item = qtGrid.getItem(preSelect);
						selected=[preSelect/*parseInt(item, 10)*/];
					}
					var qtId = this.qtId || fc.qtid;
					
					var plainModel = fc.model.toPlainObject();
					if(fc.linkParentBtId && fc.linkParentBtId != ""){
						//fc.linkParentBtId se define en el metodo handleButtonResponse de BtLink.js
						//es Usado en seleccion de beneficiarios.
						//en qtcontainer.jsp linkParentBtId es colocado como attributo de request y posteriormente es procesado en com.fisa.render.dojo.model.DojoMobileComponentFactory.customizeQT
						plainModel.linkParentBtId = fc.linkParentBtId;
					}
					
					var callObj={ callbackScope:fc,
							callback:fc.executeActionCallback,
							errorHandler:dojo.hitch(this,this.errorHandler)};
					if(selected.length<=0){
						QtControllerDWR.executeAction(this.fisatabid,this.fisapageid,qtId,null,action,plainModel,null,callObj);
					} else {
						QtControllerDWR.executeAction(this.fisatabid,this.fisapageid,qtId,selected,action,plainModel,null,callObj);
					}
				},
				/**called after execution is done.*/
				executeActionCallback:function(data){
					var actionsDialog = dijit.byId(this.actionsDialogId);
					if(actionsDialog!=null){
						actionsDialog.hide();
						actionsDialog.destroy(false);
					}
					
					if(this.hasToClearMsgs){
						this.clearPanelMessage();
						this.model.clearAllMessages();
					}
					//used to show msgs to the screen through the messagesPanel.
					if(data.wAxn=="error"){
						if(data.refreshResults === true){
							this.searchAfterCloseContentPane();
						}
						this.updateMsgsPanel(data.aMsgs);
					}else if(data.wAxn=="open"){
						//show info and warn messages anyway. Same as 2.4
						if(data.responseMessages){
							this.updateMsgsPanel(data.responseMessages.aMsgs);
							this.hasToClearMsgs = false;
						}
						var newSubTabPaneArg = {};
						newSubTabPaneArg.title=data.dialogName;
						newSubTabPaneArg.href=data.dialog;
						//this is for documents
						if(data.transactionDocuments != undefined && data.transactionDocuments != null){
						var tranStr = dojo.toJson(data.transactionDocuments);
						newSubTabPaneArg.ioArgs = {
								content : {
									'transactionDocuments' : tranStr,
									'actionMode':data.actionMode,
									'FISATabId':this.tabId
								}
							};
						};
						newSubTabPaneArg.ioMethod = dojo.xhrPost;
						
						ec.fisa.mobile.navigation.utils.openNewBreadCrumb(newSubTabPaneArg);
					}else if(data.wAxn=="refresh"){
						if(data.responseMessages){
							this.updateMsgsPanel(data.responseMessages.aMsgs);
						}
						this.hasToClearMsgs=false;
						this.search(false);
						this.hasToClearMsgs=true;
					}else if( data.wAxn == "refreshParentBtFtm"){
						data.wAxn = "refresh";
						data.msg = data.afectedFields;
						data.priorityChange = "true";
						var parentController = ec.fisa.controller.utils.getPageController(this.linkParentFisaTabId, this.linkParentFisaPageScopeId);
						parentController.handleCallBackBackFieldRoutine(data);
						if(data.beneficiaryNotificationData && data.beneficiaryBtId){
							parentController.updateNotificationData(data.beneficiaryNotificationData , data.beneficiaryBtId);
						}
						this.execCancel(null, this.qtId);
					}
				},
				
				execCancel:function(component,qtId){
					var callObj={callbackScope:this,errorHandler:dojo.hitch(this,this.errorHandler),callback:this.handleCancelAction};
					QtControllerDWR.executeCancel(this.tabId,this.pageScopeId,qtId,callObj);
				},

				handleCancelAction:function(outcome){
					if(outcome.wAxn=="close"){
						if(this.isSequence != null && this.isSequence == "true"){
							ec.fisa.navigation.utils.closeSequenceBreadCrumb(this.breadcrumbId);
						}
						else{
							ec.fisa.mobile.util.back();
						}
					}
					
					if(this.linkParentFisaTabId  && this.linkParentFisaPageScopeId){
						//Si existen estas dos variables (this.linkParentFisaTabId  && this.linkParentFisaPageScopeId), la qt se abrio desde un link de seleccion de beneficiario. JCVQ
						//Se verifica si existe combobox asociado al link para recargar sus opciones.
						var fc = ec.fisa.controller.utils.getPageController(this.linkParentFisaTabId,this.linkParentFisaPageScopeId);
						//fc debe ser el controlador de la bt desde donde se abrió la qt
						if(fc && fc.selectComponentToReload && lang.isFunction(fc.selectComponentToReload.doForceReloadOptions)){
							fc.selectComponentToReload.doForceReloadOptions();
						}
					}
				},
				/***/
				
				/**
				 * Verifica si es layout y nulifica el mensaje si no encontro resultados en la busqueda
				 */
				updateMsgsPanel:function(msgs){
					/*validacion para que no muestre los mensajes de en portlets si no encuentra resultados
					 * en una QT*/
					if(this.ftype==="QT_PORTLET" && this.isFirstTimePortlet){
						this.isFirstTimePortlet=false;
						msgs=null;
					}
					this.inherited(arguments);
				},
				
				//handles component on change routine and notify combo to change 
				// to use the same method of btcontroller some parameters are passed never used.
				handleOnChangeComponent:function(fieldId,qtId,routineActionMode,notifyComboId,isARoutineField,
						comboSelectedIndex,parentEditableGrid,entityMrId,/*Number indice real de la grilla*/gridRealRowIndex){
					this.clearPanelMessage();
					var model =this.model.toPlainObject();

					var callObj = {
							callbackScope : {"ctrl":this,"notifyComboId":notifyComboId}};
					callObj.callback = this.handleCallBackQtOnChangeComponent;
					callObj.errorHandler = dojo.hitch(this,this.errorHandler);
					
					EventActionDWR.handleQtOnChangeComponent(this.fisatabid,this.fisapageid,fieldId,qtId,model,notifyComboId,comboSelectedIndex,callObj);
				},
				
				//handles onCallBack on change component.
				handleCallBackQtOnChangeComponent:function(outcome){
					var aMsgs = outcome.aMsgs;
					// if msgs came from onchange an error ocurred
					if(outcome.wAxn=="error"){
						//added to avoid duplicate message
						this.ctrl.clearPanelMessage();
						this.ctrl.updateMsgsPanel(aMsgs);
					}
					else{
						// if has to update combos.
						if(outcome.dataUpdate!= null &&outcome.dataUpdate != undefined){
							var comboIdMap =	outcome.dataUpdate;
							if(comboIdMap != null && comboIdMap != undefined){
								dojox.lang.functional.forIn(comboIdMap,dojo.hitch(this,function(data,/* key */notifyComboId){
									this.ctrl.updateSelectByOutcome(notifyComboId,data,this.ctrl);
								}));
							}
						}
						
						if(outcome.qtParams!= null && outcome.qtParams !=undefined){
							dojox.lang.functional.forIn(outcome.qtParams,dojo.hitch(this,function(value,id){
								this.ctrl.model.setValue([id],value, false);
							}));
						}
						if(outcome.complementParams!= null && outcome.complementParams !=undefined){
							dojox.lang.functional.forIn(outcome.complementParams,dojo.hitch(this,function(value,id){
								this.ctrl.modelComplement.setValue([id],value, false);
							}));
						}

						
					}

				},
				
				//update combo with new value
				updateSelectByOutcome:function(notifyComboId,data,ctrl){
						var selectData =  data;
						var selectId = ctrl.selectIdMap[notifyComboId];
						var component = dijit.byId(selectId);
						var btId = component["bt-id"];
						var fieldId = component["field-id"];
						ctrl.selectDataMap[btId][fieldId]["data"] = selectData;
						
						component.setControlValue("");
						component.removeOption(component.getOptions());
						ctrl.loadSelectData(component);
						//component.set("value","",false);
					
				},
				
				/**Realiza una busqueda a la base por la qt. segun los parametros.*/
				search:function(clearMsgs,/*boolean*/calledFromButton){
					if((clearMsgs==null||clearMsgs==true)&&this.messagesPanelId){
						this.clearPanelMessage();
					}
					//ec.fisa.widget.utils.resetFocusManager();
					/*if(this.validate(this) == true){
						return;
					}*/

					var plainModel = this.model.toPlainObject();
					plainModel.autoExec++;
					plainModel.sortRequested = '0';
					this.model.setValue(['autoExec'],plainModel.autoExec);
					if(calledFromButton == true){
						plainModel.calledFromButtonScreenSearch= true;
					}
					
					if(this.hasToClearMsgs&&this.messagesPanelId){
						this.model.clearAllMessages();
					}
					if(this.isForRenderCharts){
						var fisaChart = dijit.byId(this.fisaChartId);
						fisaChart.setQuery(plainModel);
					}else{
						var qtGrid = dijit.byId(this.qtGridId);
						qtGrid.setQuery(plainModel);
					}
				},
				
				unDisplayQTGrid:function(){
					var qtGrid=dijit.byId(this.qtGridId);
					var component = qtGrid.getParent();;
					domStyle.set(component.domNode,"display","none");			
				},
				unDisplayMessagesPanel:function(){
					var panel=dijit.byId(this.messagesPanelId);
					if(panel){
						domStyle.set(panel.domNode,"display","none");	
					}
				},
				unDisplayQTPortlet:function(){
					var qtGrid=dijit.byId(this.qtGridId);
					var component = qtGrid.getParent().getParent().getParent();
					domStyle.set(component.domNode,"display","none");			
				},
				makeQTPortletVisible:function(){
					var qtGrid=dijit.byId(this.qtGridId);
					var component = qtGrid.getParent().getParent().getParent();
					domStyle.set(component.domNode,"visibility","visible");			
				}				
			});
		});

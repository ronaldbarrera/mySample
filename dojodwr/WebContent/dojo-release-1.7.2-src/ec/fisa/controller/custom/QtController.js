define([
        "dojo/_base/kernel","dojo/_base/declare","dojo/_base/lang","./_base","ec/fisa/controller/BaseController",
        "ec/fisa/mvc/StatefulModel","dojo/topic","dojo/on","dojo/dom-style","ec/fisa/grid/FisaQtGrid","ec/fisa/dwr/proxy/QtControllerDWR",
        "dojox/lang/functional/object","ec/fisa/format/Utils","ec/fisa/navigation/Utils",
        "ec/fisa/controller/Utils","ec/fisa/widget/DateTextBox","dijit/focus"
        ],function(dojo,declare,lang,fisaBaseController,BaseController,StatefulModel, topic, on,domStyle){

	var QtController = declare("ec.fisa.controller.custom.QtController", [BaseController], {
		tabId:null,
		pageScopeId:null,
		parentTabId:null,
		parentPageScopeId:null,
		parentBtId:null,
		parentFieldId:null,
		parentData:null,
		parentComplementData:null,
		model:null,
		modelComplement:null,
		qtGridId:null,
		fisaChartId:null,
		breadcrumbId:null,
		selectData:null,
		lovData:null,
		hasToClearMsgs:true,
		isForRenderCharts:false,

		isLovModal:false,

		searchButtonId:null,
		scheduleButtonId:null,
		qtId:null,
		selectDataMap:null,
		publishId:"",
		subscription:null,
		//this id is for the reports, set where the report is showed.
		reportWdgtId:null,

		isLovFromEditableGrid: false,//Bandera que indica si la qt asociada al controlador es usada para presentar graficos.
		sortSignal:null, //Variable que guardará un manejador de eventos de ordenamiento, ver funcion setQtGrid y destroy
		linkParentFisaTabId : null,
		linkParentFisaPageScopeId : null,
		linkParentBtId  : null,
		//map stores the id of each select with the field id as key
		selectIdMap:null,
		constructor: function (tabId, pageScopeId, parentTabId, parentPageScopeId,qtId, parentBtId, parentFieldId, selectData, lovData, initialData, initialComplementData, isForRenderCharts, isLovFromEditableGrid,/*String*/isLovModal, /*Object*/additionalData) {
			if(isForRenderCharts){
				this.isForRenderCharts = isForRenderCharts;
			}

			if(isLovFromEditableGrid){
				this.isLovFromEditableGrid = isLovFromEditableGrid;
			}

			this.tabId = tabId;
			this.pageScopeId = pageScopeId;
			this.qtId = qtId;

			this.parentTabId = parentTabId;
			this.parentPageScopeId = parentPageScopeId;
			this.parentBtId = parentBtId;
			this.parentFieldId = parentFieldId;
			this.parentData = {};
			this.parentComplementData={};
			if(isLovModal == true){
				this.isLovModal = true;
			}

			this.selectData = selectData;
			this.lovData = lovData;
			this.model = new StatefulModel({});
			this.modelComplement = new StatefulModel({});
			this.dojoComponents = {};
			this.initData(initialData);
			this.initComplementData(initialComplementData);
			this.model.appendObject(['autoExec'],0,null,null,null,false);
			var _additionalData = additionalData || {};
			this.selectDataMap = _additionalData.selectDataMap || {};
			this.publishId = this.qtId + '_' + this.tabId + '_' + this.pageScopeId;
		//	this.subscription = topic.subscribe(this.publishId, lang.hitch(this,this.updateDependantComponents));
			this.linkParentFisaTabId = _additionalData.linkParentFisaTabId || "";
			this.linkParentFisaPageScopeId = _additionalData.linkParentFisaPageScopeId || "";
			this.linkParentBtId = _additionalData.linkParentBtId || "";
			this.selectIdMap= {};
		},
		destroy:function(){
			if(this.model!=null){
				this.model.clearAllMessages();
			}
			this.data=null;
			this.model=null;
			this.modelComplement = null;
			this.dojoComponents = null;
			this.parentData = null;
			if(this.subscription && this.subscription.remove && lang.isFunction(this.subscription.remove)){
				this.subscription.remove();
			}
			
			if(this.sortSignal && this.sortSignal.remove && lang.isFunction(this.sortSignal.remove)){
				this.sortSignal.remove();
			}
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
		setQtGrid:function(qtGrid){
			this.qtGridId=qtGrid.id;
			qtGrid.executeAction=this.executeAction;
		},
		getComponent:function(btId,fieldId){
			return this.model.getComponent([fieldId]);
		},
		addParamToModel:function(component){
			var fid=component["field-id"];
			if(!this.model.contains(fid)){
				var eid=component["bt-id"];
				var paramData = this.parentData[fid];
				var stf = null;
				var _data=null;
				if (paramData) {
					var pd=null;
					if(paramData.get){
						pd=paramData.get("value");
					} else {
						pd=paramData;
					}
					_data=pd;
				} else {
					_data="";
				}

				this.model.appendObject([fid],_data,component.id,'value',null,true);
				if(component.hasCompl){
					var complemento=this.parentComplementData[fid];
					if(!complemento){
						complemento="";
					}
					this.modelComplement.appendObject([fid],complemento,component.id,'complement',null,false);
				}

			}
			//Cargando los componentes visuales de la qt
			if(!this.dojoComponents[eid]){
				this.dojoComponents[eid]=[];
			}
			var componentElement = {fieldId: component["field-id"], component: component.id};
			this.dojoComponents[eid].push(componentElement);
		},
		initHoldParams:function(appId,userId){
			this.model.appendObject(['APP_ID'],appId,null,null,null,false);
			this.model.appendObject(['USER_ID'],userId,null,null,null,false);
		},
		containsFieldModel:function(eid, fid){
			return this.model.contains([fid]);
		},
		getFieldModel:function(eid, fid){
			return this.model.getValue([fid]);
		},
		setFieldModelValue:function(eid, fid, value) {
			var priorityChange;
			if(arguments[3] == undefined || arguments[3] == null){
				priorityChange = true;
			}else {
				priorityChange = arguments[3];
			}
			this.model.setValue([fid],value, priorityChange);
		},
		setFieldModelComplement:function(eid, fid, complement) {
			this.modelComplement.setValue([fid],complement);
		},
		getFieldModelComplement:function(eid, fid) {
			return this.modelComplement.getValue([fid]);
		},
		initSearchBtn:function(component){
			this.searchButtonId = component.id;
			component.connect(component,"onClick",dojo.hitch(this,this.search,null,true));
		},
		/**Inits the schedule button this is called from the qt, and parametrized at dojocomponentfactory*/
		initScheduleBtn:function(componentId){
			this.scheduleButtonId = componentId;
			var btnSch = dijit.byId(componentId);
			btnSch.connect(btnSch,"onClick",dojo.hitch(this,this.scheduleAction));
		},
		
		
		initData:function(initialData) {
			if (this.parentTabId != "" && this.parentPageScopeId != "" ) {
				var pfc = ec.fisa.controller.utils.getPageController(this.parentTabId, this.parentPageScopeId);
				var lovData = pfc.lovData[this.parentBtId][this.parentFieldId];
				var addedFields=[];
				if (lovData && lovData["input"] && lovData["input"].length>0) {
					dojo.forEach(lovData["input"], function(outputParam, index){
						var fieldId = outputParam[0];
						var paramId = outputParam[1];
						var fieldModel = null;
						if(this.isLovFromEditableGrid){
							var currentLov = dijit.byId(pfc.dojoFromLovId);
							var grid = dijit.byId(currentLov.gridId);
							var model = grid.model;
							var pfx=[fieldId];
							fieldModel = model.getValue(pfx);
						}else{
							if (!pfc.containsFieldModel(this.parentBtId, fieldId)) {
								pfc.addParamToModel({"bt-id":this.parentBtId,"field-id":fieldId,hasCompl:false,set:function(){}});
							}
							fieldModel = pfc.getFieldModel(this.parentBtId, fieldId);
						}
						if (fieldModel==null) {
							this.parentData[paramId] = null;
						} else {
							this.parentData[paramId] = fieldModel;
						}
						addedFields.push(fieldId);
					},this);
					dojox.lang.functional.forIn(initialData,function(value,paramId){
						var contains=false;
						for(var i=0;i<addedFields.length;i++){
							if(addedFields[i]==paramId){
								contains=true;
								break;
							}
						}
						if((!contains)&&value!=null){
							this.parentData[paramId] = value;
						}
					},this);
				}else{
					dojox.lang.functional.forIn(initialData,function(value,paramId){
						if(value!=null){
							this.parentData[paramId] = value;
						}
					},this);
				}
			} else {
				dojox.lang.functional.forIn(initialData,function(value,paramId){
					if(value!=null){
						this.parentData[paramId] = value;
					}
				},this);
			}
		},
		
		initComplementData:function(initialComplementData) {
			if (this.parentTabId != "" && this.parentPageScopeId != "" ) {
				
				
			} else {
				dojox.lang.functional.forIn(initialComplementData,function(value,paramId){
					if(value!=null){
						this.parentComplementData[paramId] = value;
					}
				},this);
			}
		},
		
		
		
		/**Opens tab with the parametrization.*/
		scheduleAction:function(){
			var plainModel = this.model.toPlainObject();
			//plainModel.autoExec++;
			//this.model.setValue(['autoExec'],plainModel.autoExec);
			var plainModelStr = dojo.toJson(plainModel);
			ec.fisa.navigation.utils.showNewBreadCrumbQtScheduling("",this.breadcrumbId, this.tabId, this.pageScopeId,this.qtId,plainModelStr);
			
			
		},
		/**Realiza una busqueda a la base por la qt. segun los parametros.*/
		search:function(clearMsgs,/*boolean*/calledFromButton){
			
			//var fc = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
			if(this.validate(this) == true){
				return;
			}

			if((clearMsgs==null||clearMsgs==true)&&this.messagesPanelId){
				this.clearPanelMessage();
			}
			
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
				//Mantis 18178 JCVQ, esta bandera es usada en el método _onFetchComplete y _getDeselected de FisaQtGrid.js 
				qtGrid.isSearchRequested = true;//Mantis 18178 JCVQ
				qtGrid.setQuery(plainModel);
			}
		},
		hold:function(url,title){
			this.executeActionCallback({'wAxn':'open','dialog':url,'dialogName':title});
		},
		/**Validate screen of a qt, by putting focus on all elements, to trigger validations 
		 * for each one of the elements.*/
		validate:function(){
			var findError = false;
			if(this.model.getComponentsId != undefined){
				var componentsId = this.model.getComponentsId();
				if(componentsId !=null){
					dojox.lang.functional.forIn(componentsId, function(item, idx) {
					var cmp =dijit.byId(item);
					if(cmp != undefined && cmp != null){
						if(findError == false){
							if(cmp.hasErrorCmp != undefined && cmp.hasErrorCmp() === true){
								findError = true;
							}
						}
					
					}

				},this);
				}
			}
			var searchButtonWdgt =dijit.byId(this.searchButtonId);
			if(searchButtonWdgt != null && searchButtonWdgt != undefined){
				dijit.focus(searchButtonWdgt.domNode);//En alias de cuentas, en portlets no existe el botón buscar. Se controla el null o undefined
			}
			return findError;

		},


		findDojoComponent:function(fieldId){
			var outcome;
			dojox.lang.functional.forIn(this.dojoComponents, function(componentList, com){
				dojo.forEach(componentList, function(componenteElement){
					var elementFieldId = componenteElement.fieldId;
					if(elementFieldId == fieldId){
						outcome = componenteElement.component;
					}
				})
			},this);
			return outcome;
		},
		/**search just after a bt was closed or a contentpane.and is returning to the qt*/
		searchAfterCloseContentPane:function(){
			var fc = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
			var plainModel = fc.model.toPlainObject();
			if(fc.hasToClearMsgs&&fc.messagesPanelId){
				fc.clearPanelMessage();
				fc.model.clearAllMessages();
			}
			if(fc.isForRenderCharts){
				var fisaChart = dijit.byId(fc.fisaChartId);
				fisaChart.setQuery(plainModel);
			}else{
				var qtGrid = dijit.byId(fc.qtGridId);
				//qtGrid.setQuery(plainModel);
				qtGrid.refresh();
			}


		},
		executeAction:function(qtId,action,preSelect){
			var fc = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
			fc.clearPanelMessage();
			ec.fisa.widget.utils.resetFocusManager();
			var selected = null;
			if(arguments.length==2){
				selected=this.selection.getSelected();
			} else {
				//Mantis 0014451 JCVQ 30/05/2013
				var qtGrid = dijit.byId(fc.qtGridId);
				var item = qtGrid.getItem(preSelect);
				selected=[parseInt(item, 10)];
			}
			var plainModel = fc.model.toPlainObject();
			
			if(fc.linkParentBtId && fc.linkParentBtId != ""){
				//fc.linkParentBtId se define en el metodo handleButtonResponse de BtLink.js
				//es Usado en seleccion de beneficiarios.
				//en qtcontainer.jsp linkParentBtId es colocado como attributo de request y posteriormente es procesado en com.fisa.render.dojo.model.DojoComponentFactory.customizeQT
				plainModel.linkParentBtId = fc.linkParentBtId;
			}
			var callObj={ callbackScope:fc,
					callback:fc.executeActionCallback,
					errorHandler:dojo.hitch(fc,fc.errorHandler)};
			
			//MAntis 18517 JCVQ Se recuperan los elementos deseleccionados, usado en QTs de seleccion multiple
			var deselected = fc._getDeselected();
			
			
			if(selected.length<=0){
				QtControllerDWR.executeAction(this.tabId,this.pageScopeId,qtId,null,action,plainModel,deselected, callObj);
			} else {
				QtControllerDWR.executeAction(this.tabId,this.pageScopeId,qtId,selected,action,plainModel,deselected, callObj);
			}
		},
		/**called after execution is done.*/
		executeActionCallback:function(data){
			var messagesPanel = dijit.byId(this.messagesPanelId);
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
					this.closePopupMsgPanel();
					this.hasToClearMsgs = false;
				}
				
				//mantis 16674 se añade soport para reportes del 2.4
				if(data.dialog != null && data.dialog.indexOf('BTRenderWeb/faces/QTReportManager') > -1 ){
					window.open(data.dialog);
				}
				else{
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

					ec.fisa.navigation.utils.openNewBreadCrumb(newSubTabPaneArg,this.breadcrumbId);
				}
				
				
				
			}else if(data.wAxn=="refresh"){
				if(data.responseMessages){
					this.updateMsgsPanel(data.responseMessages.aMsgs);
				}
				this.hasToClearMsgs=false;
				this.search(false);
				this.hasToClearMsgs=true;
			}else if( data.wAxn == "refreshParentBtFtm"){
				
				//<<Mantis 18973 JCVQ
				if(data.beneficiaryNotificationData && data.beneficiaryBtId){
					var parentController = ec.fisa.controller.utils.getPageController(this.linkParentFisaTabId, this.linkParentFisaPageScopeId);
					parentController.updateNotificationData(data.beneficiaryNotificationData , data.beneficiaryBtId);
				}//>>
				
				var fc = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
				var callObj={ callbackScope:fc,
						callback:fc.executeRefreshParentBtFtmCallback,
						errorHandler:dojo.hitch(fc,fc.errorHandler)};
				QtControllerDWR.executeAfectedFieldsRoutine(this.linkParentFisaTabId, this.linkParentFisaPageScopeId, this.linkParentBtId, data.afectedFields, callObj);
			}
		},
		
		executeRefreshParentBtFtmCallback:function(data){
			
			if(data.wAxn=="error"){
				if(data.refreshResults === true){
					this.searchAfterCloseContentPane();
				}
				this.updateMsgsPanel(data.aMsgs);
			} else {
				data.wAxn = "refresh";
				data.msg = data.afectedFields;
				data.priorityChange = "false";
				var parentController = ec.fisa.controller.utils.getPageController(this.linkParentFisaTabId, this.linkParentFisaPageScopeId);
				parentController.handleCallBackBackFieldRoutine(data);
				this.execCancel(null, this.qtId);
			}
		},
		
		setMessagesPanel:function(messagesPanel){
			this.inherited(arguments);
			this.breadcrumbId=ec.fisa.navigation.utils.obtainParentBreadCrumb(messagesPanel).id;
			//obtain contentpane where resides the qt. and is inserted at the breadcrumb.
			var qtContentPane = messagesPanel.getParent().getParent();
			qtContentPane.tabId=this.tabId;
			qtContentPane.pageScopeId=this.pageScopeId;
			qtContentPane.isQtContentPane = true;


		},

		loadSelectData:function(component,ignoreSetOptions) {
			var iso=ignoreSetOptions||false;
			var btId = component["bt-id"];
			var qtId = component["qt-id"];
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
		setFisaChart:function(component){
			//Si la qt es de autoejecucion, llamar al dwr.
			this.fisaChartId = component.id;
			component.tabId=this.tabId;
			component.pageScopeId=this.pageScopeId;
			//<<JCVQ 04/06/2013 Mantis 0014527
			var plainModel = this.model.toPlainObject();
			component.setInitialQuery(plainModel);
			//>>
			component.startUp();
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
					ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
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
		isComponentMsg:function(message){
			return (('fieldId' in message)&&(message.fieldId!=null)&&(message.fieldId!=""));
		},
		addComponentMsg:function(message){
			this.model.setMessage([message.fieldId],message.fieldMsg, message.origLevel);
		},
//		updateDependantComponents:function(){
//			var changedComboBox = arguments[0];
//			var selectedIndex = this.getSelectedIndex(changedComboBox);
//			var btId = changedComboBox["bt-id"];
//			var fieldId = changedComboBox["field-id"];
//			var data = this.selectDataMap[btId][fieldId]["data"];
//			var rowData = data[selectedIndex];
//			var tabId = changedComboBox["tabId"];
//			var pageScopeId = changedComboBox["pageScopeId"];
//			// console.log("updateDependantComponents", rowData);
//			//Actualizar los output parameters
//			this.updateOutputParams(changedComboBox, rowData);
//			//Comunica que cambió, quien este escuchando en la subscripción de la BT/QT padre
//			this.publishChange(btId, tabId, pageScopeId, changedComboBox);
//		},
//		attachOnChangeComboBoxEvent:function(component){
//			var publishId = this.publishId;
//			component.connect(component,"onChange", function (){
//					topic.publish(publishId, component);
//			});
//		},
		attachOnChangeEvent:function(component){
			
		},
		getSelectedIndex:function(component){
			var outcome = -1;
			var options = component.getOptions();
			for(var i=0 ; i < options.length; i++){
				var option = options[i];
				if(option.selected === true){
					outcome = i;
					break;
				}
			}
			return outcome - 1;//Se resta 1 ya que la primera opcion del combo es seleccione
		},
		fetchSelectOptions:function(selectComponentId, qtId, inputParameters){
			this.clearPanelMessage();
			var callObj={callbackScope:this,errorHandler:dojo.hitch(this,this.errorHandler),callback:this.callBackFetchSelectOptions};
			var modelObject = this.model.toPlainObject();
			QtControllerDWR.loadSelectOptionsData(selectComponentId,qtId,inputParameters,modelObject,callObj);
		},
		callBackFetchSelectOptions:function(data){
			var selectData =  data.data;
			var aMsgs = data.aMsgs;
			if(aMsgs){
				this.updateMsgsPanel(aMsgs);
			}else{
				var selectId = data.fieldId;
				var component = dijit.byId(selectId);
				var btId = component["bt-id"];
				var fieldId = component["field-id"];
				var cntrlr = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
				cntrlr.selectDataMap[btId][fieldId]["data"] = selectData;
				cntrlr.loadSelectData(component);
				component.set("value","");
			}
		},
//		updateOutputParams: function(changedComboBox, rowData){
//			var outputParams = changedComboBox.findOutputParameters();
//			var complemets = changedComboBox.findComplemenParams();
//			dojo.forEach(outputParams,function(outputParam, index, allOutputParams){
//				if(rowData){
//					var colum = parseInt(outputParam.parameterQt, 10);
//					this.model.setValue([outputParam.parameterFieldId],rowData[colum], true);
//				}else{
//					this.model.setValue([outputParam.parameterFieldId],"", true);
//				}
//			},this);
//			
//			dojo.forEach(complemets, function(complement, index, alComplements){
//				if(rowData){
//					var colum = parseInt(complement.parameterFieldId, 10);
//					this.modelComplement.setValue([complement.destParameterFieldId],rowData[colum],true );
//				}else{
//					this.modelComplement.setValue([complement.destParameterFieldId],"",true );
//				}
//			}, this);
//		},
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
			if(component!=null){
			domStyle.set(component.domNode,"visibility","visible");	
			}
		},
		updateMsgsPanel:function(msgs){
			var toremove = [];
			var tablemsgs=[];
			dojo.forEach(msgs, function(message,index) {
				if(message.ftmId==this.qtId&&message.fieldId==this.qtId){
					toremove.push(index);
					tablemsgs.push(message);
				}
			},this);
			if(toremove.length>0){
				toremove.reverse();
				dojo.forEach(toremove, function(index) {
					msgs.splice(index,1);
				},this);
			}
			this.inherited(arguments);
			if(tablemsgs.length>0){
				var grid =dijit.byId(this.qtGridId);
				if(grid!=null){
					grid.showFooterMessage(tablemsgs[0].summary);
				}
			}
		},
		clearPanelMessage:function(){
			this.inherited(arguments);
			var grid =dijit.byId(this.qtGridId);
			if(grid!=null){
				grid.showFooterMessage("");
			}
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
			
			EventActionDWR.handleQtOnChangeComponent(this.tabId,this.pageScopeId,fieldId,qtId,model,notifyComboId,comboSelectedIndex,callObj);
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
		_getDeselected:function(){
			var outcome;
			if(this.qtGridId){
				var qtGrid = dijit.byId(this.qtGridId);
				var deselected = qtGrid._getBySelectionStatus(false);
				if(deselected && deselected.length > 0){
					outcome = deselected.toString();
				}else {
					outcome = null;
				}
			}else{
				outcome = null;
			}
			
			return outcome;
		}
		

	});
	return QtController;
});

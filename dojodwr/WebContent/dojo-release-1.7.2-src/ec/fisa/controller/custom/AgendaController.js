define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"./_base",
	"ec/fisa/controller/BaseController",
	"ec/fisa/format/Utils",
	"dojox/mvc",
	"ec/fisa/mvc/StatefulModel",
	"dojox/lang/functional/object",	
	"dijit/layout/ContentPane",
	"dijit/form/TextBox",
	"dojo/store/Memory",
	"dijit/layout/ContentPane",
	"dojo/data/ItemFileWriteStore",
	"dijit/layout/BorderContainer",
	"dijit/form/Button",
	"dijit/TitlePane",
	"dojox/grid/EnhancedGrid",
	"dojox/grid/enhanced/plugins/Pagination",
	"dijit/TitlePane",
	"dijit/form/Select",
	"dijit/form/DateTextBox",
	"dojo/date/locale","dijit/form/Form",
	"dijit/form/CheckBox",
	"dijit/form/TextBox",
	"ec/fisa/navigation/Utils",
	"dwr/interface/AgendaControllerDWR",
	"dwr/dto/TaskCriteria",
	"dwr/dto/TaskVO",
	"ec/fisa/dwr/Store"]
	,function(dojo,declare,lang, fisaBaseController,BaseController,formatUtils,mvc,StatefulModel, FisaUtils){
	var AgendaController = declare("ec.fisa.controller.custom.AgendaController", [BaseController], {
		tabId:null,
		pageScopeId:null,
		model:null,
		cmps:null,
		initData:null,
		taskTypeList:null,
		taskStatusList:null,
		personalizedTaskTypeList:null,
		dataGridPriorityList:null,
		breadcrumb:null,
		bindingContentPane:null,
		changeUserStatusNumberOfExecution:0,
		hiddeSummaryNumberOfExecution:0, //para resolver el bug de dojo con checkbox
		summaryW:null,
		parameters:null, //encargada de llevar todos los parametros al servidor
		agendaDataGrid:null,
		paneSearcher:null,
		tabAgendaShow : null,
		currenContentPaneId : null,//Mantis 0013950 JCVQ 10/06/2013 Se inicializa en task-list.jsp
		'filtro-agenda': null,//Mantis 0013950 JCVQ 10/06/2013 Se inicializa en task-list.jsp
		labels:null,
		modelPerTab:{},
		
		constructor: function (tabId, pageScopeId, initData) {
			this.initData = initData;
			initData.dateFrom=ec.fisa.format.utils.parseLongDate(initData.dateFrom);
			initData.dateTo=ec.fisa.format.utils.parseLongDate(initData.dateTo);
	     	this.tabId=tabId;
	     	this.pageScopeId=pageScopeId;
	     	this.model={};
	     	this.modelPerTab = {};
	     	this.cmps={};
	     	this.init(initData);
	     	this.parameters = [];
	     	
		},
		init:function(data){
			this.taskTypeList=data.taskTypeList;
			delete data.languageList;
			this.taskStatusList=data.taskStatusList;
			delete data.taskStatusList;
			this.personalizedTaskTypeList=data.personalizedTaskTypeList,
			this.dataGridPriorityList=data.dataGridPriorityList;
			delete data.dataGridPriorityList;
			this.model=new StatefulModel({});
			this.initDataModel();
		},
		
		
		setLabels:function (labels){
			this.labels = labels;
		},
		setBindingContentPane : function(newBindingContentPane){
			this.bindingContentPane=newBindingContentPane;
		},
		JDBCDateFormat:function(date){
			return dojo.date.locale.format(date,{selector:"date",datePattern:'yyyy,MM,dd'});
		},
		cargarTareas2:function(tabId){
			this.clearPanelMessage();
			var criteria = this.getCriteria();
			  	
			var store =	new ec.fisa.dwr.Store('AgendaControllerDWR', 'viewData', this.tabId ,criteria, this.getCriteriaArray(), null);
			    	store.callbackScope = this;
			    this.agendaDataGrid.setStore(store);
			    this.countTasksByFilter(this.tabId);//Mantis 0013950 JCVQ 08/06/2013 se actualiza el número de registros en el titulo
		},
		
		initDataModel:function(){
			//Inicializacion de variables del modelo
			this.modelPerTab['maxResults'] =this.initData.maxResults;
			this.modelPerTab['orderByPriority'] = this.initData.orderByPriority;
			this.modelPerTab['personalizedTaskTypeId'] = this.initData.personalizedTaskTypeId;
		},
		/**
		 * @author christmo
		 * @date 21-10-2014
		 * 
		 * Obtiene los parametros cargados en pantalla para enviarlos al servidor en un arreglo
		 */
		getCriteria:function(){
			var criteria = {
						 taskTypeId : this.modelPerTab["taskTypeId"],
						 taskStatusId: this.modelPerTab["taskStatusId"],
						 taskTab: this.modelPerTab["taskTab"],
						 taskType: this.modelPerTab["taskType"],
						 companyId: this.modelPerTab["companyId"],
						 dateTo: this.model.getValue(["dateTo"]),
						 dateFrom: this.model.getValue(["dateFrom"]),
						 maxResults: this.modelPerTab["maxResults"],
						 orderByPriority: this.modelPerTab["orderByPriority"],
						 personalizedTaskTypeId: this.modelPerTab["personalizedTaskTypeId"],
						 parameters:this.parameters
					 };
			for (var i = 0; i < this.parameters.length; i++) {
				criteria[this.parameters[i]] = this.model.getValue([this.parameters[i]]);
			};

			return criteria;
		},
		/**
		 * @author christmo
		 * @date 2014-10-22
		 * 
		 * 		Se hace la conversion de los parametros a un Array para enviarlo por el Store
		 * 		para no tener problemas al recibirlo en el DWR de java
		 */
		getCriteriaArray:function(){
			var arr = [];
			var criteria = this.getCriteria();
			arr.push(this.pageScopeId);
			arr.push(dojo.toJson(criteria));
			return arr;
		},
		setTaskStatusId:function(tabId,pageScopeId,taskStatusText){
			if(taskStatusText=='pendientes'){
				this.modelPerTab['taskStatusId'] =1;
				this.modelPerTab['taskTypeId']=-2;//Mantis 0013950 JCVQ 08/06/2013 Si se quiere evitar que aprezcan en los resultados un tipo de tarea se lo envia como negativo, pero solo aplica para valores menores que -1, Ver método com.fisa.efisa.process.worklist.business.WorkListQueryBean.getTasksByCriteria(HashMap<String, String>, TaskCriteria)
			}else if(taskStatusText=='despachadas'){
				this.modelPerTab['taskStatusId'] =7;
				this.modelPerTab['taskTypeId']=1;
			}else if(taskStatusText=='notificaciones'){
				this.modelPerTab['taskStatusId'] = 18;//Notificaciones no leidas
				this.modelPerTab['taskTypeId'] = -1;
			}else if(taskStatusText=='tareas'){
				//<<Mantis 0013950 JCVQ 08/06/2013 Corrección en el filtro de tareas
				this.modelPerTab['taskStatusId']=1;
				this.modelPerTab['taskTypeId'] =2;
				//this.model.taskStatusId.value=5;//Personalizadas o Tareas, TODO:Aclarar
				//>>
			}
			var status=taskStatusText;
		},
		countTasksByFilter:function(tabId){
			var criteria = this.getCriteria();
			
			var callObj = {
					callbackScope : this
				};
				callObj.callback = function(outcome) {
					this.totalReg=outcome;
					this.updateCurrentContentPaneTitle();//Mantis 0013950 JCVQ 10/06/2013
				};
				callObj.errorHandler = this.errorHandler;
				AgendaControllerDWR.countTasksByCriteria(criteria, this.getCriteriaArray(),this.tabId,callObj);
		},
		changeUserStatus:function(isUserEnabled,tabId) {
			this.clearPanelMessage();
			if(this.changeUserStatusNumberOfExecution>0){		
				AgendaControllerDWR.changeUserStatusDWR(isUserEnabled,tabId);
			}
			this.changeUserStatusNumberOfExecution++;
			
		},
		updateSingleTaskPriority :function(taskId, priorityValue){
			this.clearPanelMessage();
			var taskIdList = [];
			taskIdList[0]=taskId;
			var callObj = {
					callbackScope : this
				};
			callObj.callback = function(outcome) {
				this.showMessages(outcome);
			};
			callObj.errorHandler = dojo.hitch(this,this.errorHandler);
			
			AgendaControllerDWR. updateTasksPriorityDWR(
						taskIdList, priorityValue, callObj);
		},		
		initComponentData: function(component, id){
			
		},
		setMessagesPanel : function(/* ec.fisa.message.Panel */
				newMessagesPanel) {
			//this.messagesPanel = newMessagesPanel;
			this.messagesPanelId = newMessagesPanel.id;
			this.breadcrumb = newMessagesPanel.getParent().getParent().getParent().getParent().getParent().getParent();
		},
		newTaskAction:function(title, tabId){
			this.tabId = tabId;
			var newSubTabPaneArg = {};
			newSubTabPaneArg.title=title;
			newSubTabPaneArg.iconClass="breadcrumbIcon";
			newSubTabPaneArg.href='./static/agenda/PersonalTask.jsp';
			newSubTabPaneArg.postClose = this.cargarTareas2;
			newSubTabPaneArg.postCloseScope = this.id;
			newSubTabPaneArg.postCloseArgs = [this.tabId, this.pageScopeId];
			ec.fisa.navigation.utils.openNewBreadCrumb(newSubTabPaneArg, this.breadcrumb);
		}, 
		processLinkAction:function(taskId, rowItem){
			//Al ejecutarse esta función, el valor de this.tabId fue seteado en el método defineAgendaLink de ec.fisa.format.utils
			if(!(rowItem.hasUrl == true)){
				var callObj = {callbackScope: this};
				callObj.errorHandler=dojo.hitch(this,this.errorHandler);
				callObj.callback = this.handelClickAction;
				AgendaControllerDWR.isTaskAvailableDWR(taskId, rowItem.customizedActionId, callObj);
			}else if(rowItem.hasUrl == true && rowItem.canBeDispatched == true){
				var callObj = {callbackScope: this};
				callObj.errorHandler=dojo.hitch(this,this.errorHandler);
				callObj.callback = this.handleClickBTAction;
				var tareaVO={
						taskId:rowItem.taskId,
						customizedActionId:rowItem.customizedActionId,
						customizedActionFilter: rowItem.customizedActionFilter,
						newActionStatusFilter: rowItem.newActionStatusFilter,
						status: rowItem.status,
						urlInfo: rowItem.urlInfo,
						dataKey:rowItem.dataKey,
						btKeys:rowItem.btKeys,
						taskSystem:rowItem.taskSystem,
						taskSubSystem:rowItem.taskSubSystem,
						referenceCode:rowItem.referenceCode,
						taskTypeId:rowItem.taskTypeId,
						taskComment:rowItem.taskComment,
						requestTabId: this.tabId,
						$dwrClassName: "TaskVO"
					};
				
				AgendaControllerDWR.openTask(tareaVO, callObj);
			}
		}, 
		handelClickAction: function(outcome){
			if(outcome.isTaskAvaliable == true){
				var newSubTabPaneArg = {};
				newSubTabPaneArg.title="Editar";
				newSubTabPaneArg.iconClass="breadcrumbIcon";
				newSubTabPaneArg.href=outcome.callUrl!= null &&  outcome.callUrl!= undefined?outcome.callUrl : './static/agenda/PersonalTask.jsp';
				newSubTabPaneArg.postClose = this.cargarTareas2;
				newSubTabPaneArg.postCloseArgs = [this.tabId, this.pageScopeId];
				newSubTabPaneArg.ioArgs= {content:{'taskId':outcome.taskId,'customizedActionId':outcome.customizedActionId}};
				ec.fisa.navigation.utils.openNewBreadCrumb(newSubTabPaneArg, this.breadcrumb);
			}else if(outcome.wAxn=="error"){
				var messagesPanel = dijit.byId(this.messagesPanelId);
				messagesPanel.clearAllMessages();
				this.updateMsgsPanel(outcome.aMsgs);
			}
		},
		handleClickBTAction: function(outcome){
			 if(outcome.wAxn=="error"){
				 	var messagesPanel = dijit.byId(this.messagesPanelId);
					messagesPanel.clearAllMessages();
					this.updateMsgsPanel(outcome.aMsgs);
				}else
			if(outcome.isTaskAvaliable == true){
				var newSubTabPaneArg = {};
				newSubTabPaneArg.title=outcome.btTitle;
				newSubTabPaneArg.iconClass="breadcrumbIcon";
				newSubTabPaneArg.href= outcome.taskProccessingUrl;
				newSubTabPaneArg.postClose = this.cargarTareas2;
				newSubTabPaneArg.postCloseScope = this.id;
				newSubTabPaneArg.postCloseArgs = [this.tabId, this.pageScopeId];
				ec.fisa.navigation.utils.openNewBreadCrumb(newSubTabPaneArg, this.breadcrumb);
			}			
		},
		dispatchTask:function(tareaVO,tabId,pageScopeId){
			this.clearPanelMessage();
			var callObj={callbackScope:this};
			callObj.callback=function(outcome){ 
				if(outcome == null || outcome.aMsgs[0].level.level==20000){
					this.cargarTareas2(tabId);
				}
				this.showMessages(outcome);
			};
			callObj.errorHandler=dojo.hitch(this,this.errorHandler);
			AgendaControllerDWR.dispatchTaskFromList(tareaVO,tabId,pageScopeId,callObj); 
		},
		clearPanelMessage:function(){
			var messagesPanel = dijit.byId(this.messagesPanelId);
			if(messagesPanel){
				messagesPanel.clearAllMessages();
			}
		},
		showMessages:function(outcome){
			if(outcome!=null){
				this.updateMsgsPanel(outcome.aMsgs);
			}
		},
		_getSelectedTaskIdList: function(){
			var selectedIdList = this.agendaDataGrid.selection.selected;
			var taskIdList = [];
			var index = 0;
			for ( var i = 0; i < selectedIdList.length; i++) {
				if (selectedIdList[i]) {
					taskIdList[index++] = this.agendaDataGrid
							.getItem(i);
				}
			}
			return taskIdList;
		},
		updateTaskAction : function(){
			var value = this.model.getValue("taskStatusMultipleSelection");//this.model.taskStatusMultipleSelection.value;
			var selectedItems = this._getSelectedTaskIdList();
			alert("NO DISPONIBLE. ");
		},
		updateCurrentContentPaneTitle:function(){//Mantis 0013950 JCVQ 10/06/2013
			//Se encarga de actualizar el título del contentPane en las tareas de la agenda
			//TODO INTERNACIONALIZAR
			if(this["filtro-agenda"] == "pendientes"){
				this.buildTitle(this.labels['pending']);
			}else if(this["filtro-agenda"] == "despachadas"){
				this.buildTitle(this.labels['dispatched']);
			}else if(this["filtro-agenda"] == "notificaciones"){
				this.buildTitle(this.labels['notifications']);
			}else if(this["filtro-agenda"] == "tareas"){
				this.buildTitle(this.labels['tasks']);
			}
		},
		buildTitle: function(prefix){//Mantis 0013950 JCVQ 10/06/2013
			var currentContentPane = dijit.byId(this.currenContentPaneId);
			currentContentPane.set("title",prefix + " (" + this.totalReg +")");
			currentContentPane = null;
		},
		/**
		 * @author christmo
		 * @date 21-10-2014
		 * 
		 * Se cambia el MVC para usar el de fisa y agregar los parametros al modelo
		 */
		addParamToModel:function(field,value,component){
			if(typeof field !== 'undefined'){
				this.model.appendObject(field,value,component.id,'value',null,false);
				if(field != 'dateFrom' && field != 'dateTo'){
					if(field != undefined && field.length === 1){
					this.parameters.push(field[0]);
					}
				}
			}
		}
    });
	return AgendaController;
});
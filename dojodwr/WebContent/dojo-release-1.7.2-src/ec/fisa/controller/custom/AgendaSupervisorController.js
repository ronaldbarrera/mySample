define(
		[ "dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/lang","./_base",
				"ec/fisa/controller/BaseController", "ec/fisa/format/Utils",
				"dojo/_base/window", "dojo/dom",
				"dojox/mvc", "dojox/mvc/StatefulModel",
				"dojox/lang/functional/object", "dojo/store/Memory",
				"dojo/data/ItemFileReadStore", "dojo/date/locale",
				"ec/fisa/navigation/Utils", "ec/fisa/dwr/Store","ec/fisa/controller/Utils",
				"dojox/widget/DialogSimple"],
		function(dojo, declare, lang, fisaBaseController, BaseController, formatUtils,win, dom, mvc,
				StatefulModel, FisaUtils) {
			var AgendaSupervisorController = declare(
					"ec.fisa.controller.custom.AgendaSupervisorController",
					[BaseController],
					{
						tabId : null,
						pageScopeId : null,
						model : null,
						cmps : null,
						initData : null,
						taskTypeList : null,
						personalizedTaskTypeList : null,
						priorityList : null,
						dataGridPriorityList:null,
						reAssignActionList : null,
						breadcrumb : null,
						bindingContentPane : null,
						agendaDataGrid : null,
						paneSearcher : null,
						tabAgendaShow : null,
						messagesPanel : null,
						hierarchyDataGrid : null,
						collaboratorsDataGrid : null,
						hierarchyList : null,
						collaboratorList : null,
						multipleSelectionCollaboratorWidget : null,
						selectedCollaboratorList:null,
						hierarchyPopup : null,
						collaboratorPopup:null,
						constructor : function(tabId, pageScopeId, initData) {
							this.initData = initData;
							initData.dateFrom=ec.fisa.format.utils.parseLongDate(initData.dateFrom);
							initData.dateTo=ec.fisa.format.utils.parseLongDate(initData.dateTo);
							this.tabId = tabId;
							this.pageScopeId = pageScopeId;
					     	this.model={};
					     	this.cmps={};
							this.init(initData);
						},
						init : function(data) {
							this.taskTypeList = data.taskTypeList;
							this.priorityList = data.priorityList;
							this.personalizedTaskTypeList = data.personalizedTaskTypeList;
							this.reAssignActionList=data.reAssignActionList;
							this.dataGridPriorityList=data.dataGridPriorityList;
							this.hierarchyList=data.hierarchyList;
							delete data.priorityList;
							delete data.taskTypeList;
							delete data.personalizedTaskTypeList;
							delete data.reAssignActionList;
							delete data.dataGridPriorityList;
							delete data.hierarchyList;
							this.model = dojox.mvc.newStatefulModel({
								data : data
							});

						},
						setBindingContentPane : function(newBindingContentPane) {
							this.bindingContentPane = newBindingContentPane;
						},
						cargarTareas : function(tabId) {
							this.clearPanelMessage();
							criteria = {
								taskTypeId : this.model.taskTypeId.value,
								taskStatusId : this.model.taskStatusId.value,
								orderByPriority : this.model.orderByPriority.value,
								dateTo : this.model.dateTo.value,
								dateFrom : this.model.dateFrom.value,
								maxResults : this.model.maxResults.value,
								personalizedTaskTypeId : this.model.personalizedTaskTypeId.value,
								collaborators : this.selectedCollaboratorList,
								authorizationHierarchy : this.model.hierarchyId.value,
								priority: this.model.priorityId.value
							};

							var store = new ec.fisa.dwr.Store(
									'AgendaSupervisorControllerDWR',
									'viewData', this.tabId, criteria, [
											this.model.userDescription.value,
											this.pageScopeId ], null);
							this.agendaDataGrid.setStore(store);
						},
						setTaskStatusId:function(tabId,pageScopeId,taskStatusText){
							if(taskStatusText=='pendientes'){
								this.model.taskStatusId.value=1;
							}else if(taskStatusText=='despachadas'){
								this.model.taskStatusId.value=7;
							}
						},
						countTasksByFilter:function(tabId){
							var criteria = {
									 taskTypeId : this.model.taskTypeId.value,
									 taskStatusId: this.model.taskStatusId.value,
								     orderByPriority: this.model.orderByPriority.value,
									 dateTo: this.model.dateTo.value,
									 dateFrom: this.model.dateFrom.value,
									 maxResults: this.model.maxResults.value,
									 personalizedTaskTypeId:this.model.personalizedTaskTypeId.value
								 };
							
							var callObj = {
									callbackScope : this
								};
								callObj.callback = function(outcome) {
									this.totalReg=outcome;
								};
								callObj.errorHandler = this.errorHandler;
								AgendaSupervisorControllerDWR.countTasksByCriteria(criteria, this.model.userDescription.value,this.tabId,callObj);
						},
						changeUserStatus : function(isUserEnabled, tabId) {
							this.clearPanelMessage();

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
						
						updateTasksPriority : function() {
							this.clearPanelMessage();
							var taskIdList = this._getSelectedTaskIdList();
							var priorityValue = this.model.priorityId.value;
						
							var callObj = {
								callbackScope : this
							};
							callObj.callback = function(outcome) {
								this.showMessages(outcome);
								if (outcome == null || this.isEmpty(outcome)) {
									this.cargarTareas();
									this.agendaDataGrid.rowSelectCell.toggleAllSelection(false);
								}
							};
							callObj.errorHandler = dojo.hitch(this,this.errorHandler);
							// callObj.timeout=9000;
							AgendaSupervisorControllerDWR. updateTasksPriorityDWR(
									taskIdList, priorityValue, callObj);

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
							
							AgendaSupervisorControllerDWR. updateTasksPriorityDWR(
										taskIdList, priorityValue, callObj);
						},
						reAssignTasks: function(){
							var optionValue = this.model.reAssignActionId.value;
							var taskIdList = this._getSelectedTaskIdList();
							var callObj = {
									callbackScope : this
								};
								callObj.callback = function(outcome) {
									this.showMessages(outcome);
									if (outcome == null || this.isEmpty(outcome)) {
										this.cargarTareas();
										this.agendaDataGrid.rowSelectCell.toggleAllSelection(false);
									}
								};
								callObj.errorHandler = dojo.hitch(this,this.errorHandler);
								// callObj.timeout=9000;
								AgendaSupervisorControllerDWR.reAssignTasksDWR(	taskIdList, optionValue,callObj);
							
						},
						initComponentData : function(component, id) {
						},
						setMessagesPanel : function(/* ec.fisa.message.Panel */
						newMessagesPanel) {
							this.messagesPanel = newMessagesPanel;
							this.breadcrumb = this.messagesPanel.getParent().getParent().getParent()
									.getParent().getParent().getParent()
									.getParent();
						},
						clearPanelMessage : function() {
							if (this.messagesPanel) {
								this.messagesPanel.clearAllMessages();
							}
						},
						showMessages : function(outcome) {
							if (outcome != null) {
								this.updateMsgsPanel(outcome.aMsgs);
							}
						},  
						isEmpty : function(obj) {
							var p;
							for (p in obj) {
								if (obj.hasOwnProperty(p)) {
									return false;
								}
							}
							return true;

						},
						//métodos para cargar jerarquía
						openHierarchyPopup : function(){
							this.clearPanelMessage();
							var dialogStyle=ec.fisa.controller.utils.getGlobalModalSize(0.50);
							this.hierarchyPopup = new dojox.widget.DialogSimple({
								//i can call this.titleDlg cause the scope previously inserted.
								style:"width:"+dialogStyle.w+"px;",
								title : 'FISA GROUP',
								href : './static/agenda/fragment/supervisor-hierarchy-list.jsp',
								ioArgs : {
									content : {
										FISATabId : this.tabId,
										FisaPageScopeId : this.pageScopeId
									}
								},
								ioMethod : dojo.xhrPost
							});
							this.hierarchyPopup.show();
						},
						loadHierarchyList : function() {
							var hierarchyList = this.hierarchyList;
							var data = {
										identifier:'hierarchyId',
										items: hierarchyList
								}
							var store = new dojo.data.ItemFileReadStore({data:data});
							this.hierarchyDataGrid.setStore(store);
						},
						closeHierarchyPopup:function(){
							var selectedId = this.hierarchyDataGrid.selection.selectedIndex;
							var row= this.hierarchyDataGrid.getItem(selectedId);
							this.hierarchyPopup.destroy();
							this.model.hierarchyId.set("value",row.hierarchyId[0]);
							this.model.hierarchyDescription.set("value",row.description[0]);
						},
						clearHierarchySelection:function(){
							this.hierarchyPopup.destroy();
								this.model.hierarchyId.set("value","");
							this.model.hierarchyDescription.set("value","");
						},
						//métodos para cargar jerarquía
						openCollaboratorPopup : function(){
						this.collaboratorList=[];
							this.clearPanelMessage();
							var callObj = {
									callbackScope : this
								};
							callObj.callback = function(outcome) {
								this.showMessages(outcome);
								if(!outcome.aMsgs){
									this.collaboratorList=outcome.response_value;
									var dialogStyle=ec.fisa.controller.utils.getGlobalModalSize(0.70);
									this.collaboratorPopup = new dojox.widget.DialogSimple({
										style:"width:"+dialogStyle.w+"px;",
										title : 'FISA GROUP',
										href : './static/agenda/fragment/supervisor-collaborator-list.jsp',
										ioArgs : {
											content : {
												FISATabId : this.tabId,
												FisaPageScopeId : this.pageScopeId
											}
										},
										ioMethod : dojo.xhrPost
									});
									this.collaboratorPopup.show();
								}
								
							};
							callObj.errorHandler = dojo.hitch(this,this.errorHandler);
							
							AgendaSupervisorControllerDWR. getSupervisorCollaboratorsByHierarchyIdDWR(
										this.model.hierarchyId.value,  callObj);
						},
						loadCollaboratorList: function() {
							var collaboratorList = this.collaboratorList;
							var data = {
										identifier:'userId',
										items: collaboratorList
								}
							var store = new dojo.data.ItemFileReadStore({data:data});
							this.collaboratorDataGrid.setStore(store);
						},
						closeCollaboratorPopup:function(){
							var selectedIdList = this.collaboratorDataGrid.selection.selected;
							this.selectedCollaboratorList = [];
							var index = 0;
							for ( var i = 0; i < selectedIdList.length; i++) {
								if (selectedIdList[i]) {
									var item = {
											label:this.collaboratorDataGrid.getItem(i).fullName[0],
											value:this.collaboratorDataGrid.getItem(i).userId[0],
											userId:this.collaboratorDataGrid.getItem(i).userId[0]
									}
									this.selectedCollaboratorList[index++] = item;
								}
							}
							this.loadValuesForMultipleSelectionCollaboratorWidget();
							this.collaboratorPopup.destroy();
						},
						loadValuesForMultipleSelectionCollaboratorWidget:function(){
							if(this.selectedCollaboratorList!=null){
								var id = this.multipleSelectionCollaboratorWidget.get("id");
								var domElement = dom.byId(id);
								
								while (domElement.hasChildNodes()) {
									domElement.removeChild(domElement.lastChild);
								}
								for(var i=0; i<this.selectedCollaboratorList.length ; i++){
									var c = win.doc.createElement('option');
									c.innerHTML = this.selectedCollaboratorList[i].label;
									c.value =this.selectedCollaboratorList[i].value;
									domElement.appendChild(c);
								}
							}
						}			
					});
			return AgendaSupervisorController;
		});
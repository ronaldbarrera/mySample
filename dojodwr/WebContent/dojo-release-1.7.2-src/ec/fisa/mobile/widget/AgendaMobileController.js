define(
		[ "dijit/_Widget", "dojo/_base/declare",
		  "ec/fisa/controller/mobile/BaseController",
		  "ec/fisa/format/Utils", 
		  "ec/fisa/navigation/Utils",
		  "dojo/dom-construct", 
		  "ec/fisa/widget/DocumentActions",
		  "ec/fisa/mvc/StatefulModel", "dojo/on",
		  "ec/fisa/widget/DialogSecurity", "./_base",
		  "dojox/lang/functional/object",
		  "ec/fisa/dwr/proxy/BtControllerDWR",
		  "ec/fisa/dwr/proxy/EventReportActionDWR",
		  "ec/fisa/dwr/proxy/RuleFieldSelectorControllerDWR",
		  "ec/fisa/dwr/proxy/AgendaMobileControllerDWR",
		  "dojox/lang/functional" ],
		function(_Widget,declare,BaseController,formatUtils,navigationUtils,domConstruct,DocumentActions,
				StatefulModel,on) {
			var AgendaMobileController = declare("ec.fisa.mobile.widget.AgendaMobileController",[ _Widget,BaseController ],
					{
						fisatabid:"",
						fisapageid:"",
						tabId : null,
						pageScopeId : null,
						model : null,
						cmps : null,
						initData : null,
						taskTypeList : null,
						taskStatusList : null,
						personalizedTaskTypeList : null,
						dataGridPriorityList : null,
						breadcrumb : null,
						bindingContentPane : null,
						changeUserStatusNumberOfExecution : 0,
						hiddeSummaryNumberOfExecution : 0,
						summaryW : null,
						agendaDataGrid : null,
						paneSearcher : null,
						tabAgendaShow : null,
						currenContentPaneId : null,
						'filtro-agenda' : null,
						initializer:"",
						constructor : function() {
							this.model = new StatefulModel({});
							this.cmps = {};
							
						},
						postMixInProperties:function(){
							this.inherited(arguments);
							ec.fisa.controller.utils.initPageController(this.fisatabid,this.fisapageid,this,true);
							var funct = new Function(this.initializer);
							this.initializer = null;
							var init = funct.call();
							funct = null;
							this.initData = init.initData;
							this.initMsgs = init.initMsgs;
							this.initData.mobileDateFrom = ec.fisa.mobile.format.utils.parseLongDate(this.initData.mobileDateFrom);
							this.initData.mobileDateTo = ec.fisa.mobile.format.utils.parseLongDate(this.initData.mobileDateTo);
							
							this.model.setValue(['taskStatusId'],'1');
							this.model.setValue(['mobileDateTo'],this.initData.mobileDateTo);
							this.model.setValue(['mobileDateFrom'],this.initData.mobileDateFrom);
							this.model.setValue(['mobileUserDescription'],this.initData.mobileUserDescription);
							this.cargarTareas2(this.fisatabid,true); 
							
						},
						search:function(){
							this.cargarTareas2(this.fisatabid,false);
						},
						cargarTareas2 : function(tabId,init) {
							//this.clearPanelMessage();
							var criteria = {
								//taskTypeId : this.model.taskTypeId.value,
								taskStatusId : this.model.getValue(['taskStatusId']),
								//orderByPriority : this.model.orderByPriority.value,
								dateTo : this.model.getValue(['mobileDateTo']),
								dateFrom : this.model.getValue(['mobileDateFrom']),
								maxResults : 250,
								userDescriptionFilter:this.model.getValue(['mobileUserDescription'])
								//personalizedTaskTypeId : this.model.personalizedTaskTypeId.value
							};
							
							if(init){
							this.store = new ec.fisa.dwr.Store('AgendaMobileControllerDWR', 'viewData',
									this.fisatabid, criteria, [null,this.fisapageid], null);
							this.store.callbackScope=this;
							}else{
								var grid = dijit.byId(this.agendaDataGrid);
								grid.setQuery(criteria);
							}
							
						},
						initAgendaGrid:function(gridId){
							this.agendaDataGrid=gridId;
							this.cargarTareas2(this.fisatabid);
						},
						getFisaStore: function(){
							return ec.fisa.controller.utils.getPageController(this.fisatabid,this.fisapageid).store;
						}
					});
			return AgendaMobileController;
		});
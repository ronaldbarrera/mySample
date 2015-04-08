define([
        "dojo/_base/kernel","dojo/_base/declare","dojo/_base/lang",
        "ec/fisa/controller/BaseController","ec/fisa/format/Utils","ec/fisa/navigation/Utils",
        "dojo/data/ItemFileWriteStore","dojo/dom-construct","dojox/grid/TreeGrid",
        "ec/fisa/mvc/StatefulModel","dojox/grid/DataGrid","./_base",  "ec/fisa/dwr/proxy/SchedulingActionDWR"
        ],function(dojo,declare,lang,BaseController,formatUtils,navigationUtils,
        		ItemFileWriteStore,domConstruct,TreeGrid,
        		StatefulModel,DataGrid){

	var parentSchedulingController = declare("ec.fisa.controller.custom.BaseSchedulingController", [BaseController], {
		tabId:null,
		pageScopeId:null,
		model:null,
		data:null,
		breadcrumbId:null,
		contextPath:dojo.config.fisaContextPath,
		repeatId:null,
		processDate:null,
		componentCondId:null,
		//Indicates the content pane in which the bt is loaded.
		btContentPaneId:null,
		calType:null,
		//contains notification media data.
		mediaData:null,
		//
		mediaDataSuccessStore:null,
		mediaDataFailStore:null,

		constructor: function (tabId,pageScopeId,data,componentCondId,calType) {
			this.tabId=tabId;
			this.pageScopeId=pageScopeId;
			this.data =  data;
			this.componentCondId = componentCondId;
			this.processDate = data["startDate"];
			this.calType = calType;

			this.model = StatefulModel({});
		},

		initMvc:function(/** component */component,/*
		 * string to be
		 * binded
		 */modelProp,/*boolean*/disabled){
			var modelData = this.data[modelProp];
			this.model.appendObject([modelProp,'value'],modelData,component.id,'value',null,false);
			this.model.appendObject([modelProp,'disabled'],disabled,component.id,'disabled',null,false);
			this.model.appendObject([modelProp,'_lastValueReported'],modelData,component.id,'_lastValueReported',null,false);
		},
		
		//deprecated no se usa
		/** Carga el id del textbox del id.*/
		loadRepeatId:function(repeatId){
			this.repeatId = repeatId;
			
			var wdgRpt = dijit.byId(repeatId);
			wdgRpt.connect(wdgRpt,"onChange",dojo.hitch(this,function(value){
				this.updateEndDateByRepeat(value)
			}));
			
			
		},
		
		
		loadFrecuencyId:function(frequencyId){
			this.repeatId = frequencyId;
			
			var wdgRpt = dijit.byId(frequencyId);
			wdgRpt.connect(wdgRpt,"onChange",dojo.hitch(this,function(value){
				this.updateFrequency(value)
			}));
		},
		
		
		//inits data.
		initMediaData:function(/*json */mediaData){
			this.mediaData = mediaData;
		},
		
		destroy:function(){
			if(this.model!=null){
				this.model.clearAllMessages();
			}
			this.data=null;
			this.model=null;
			this.lovData = null;
			this.tableRegistry = null;
		},

		setMessagesPanel:function(messagesPanel){
			this.inherited(arguments);
			if(typeof this.breadcrumbId === 'undefined' || this.breadcrumbId == null){
				this.breadcrumbId=messagesPanel.getParent().getParent().id;
			}
			this.updateMsgsPanel(this.initMsgs);
			this.btContentPaneId = messagesPanel.getParent().id;
		},
		/**Add logic to the select, the value updates the times and dates values.*/
		updateFrequency:function(/*String*/newValue){
			if(!(newValue != undefined && newValue != null)){
				//if value is null then disable textbox.
				this.model.setValue(["repeat",'value'],1,false);
				this.model.setValue(["repeat",'disabled'],true);

				var startDate =this.model.getValue(["startDate",'value']);
				if(!(startDate != null && startDate != "")){
					startDate = this.processDate;
					this.model.setValue(["startDate",'value'],startDate,false);
				}
				this.model.setValue(["endDate",'value'],startDate,false);
			}
			else{
				//si no es nulo.
				this.model.setValue(["repeat",'disabled'],false);
				this.model.setValue(["repeat",'value'],"1",false);

				var timesToRepeat =	1; //this.model.getValue(["repeat",'value']);
				var initDate = this.model.getValue(["startDate",'value']);
				if(timesToRepeat != undefined && timesToRepeat != null && initDate != undefined && initDate != null){
					this.updateEndDate(newValue, initDate, timesToRepeat);
				}


			}
		},
		/**Updates by start date.*/
		updateEndDateByStartDate:function(/*Date*/initDate){
			var frequency =	this.model.getValue(["frequency",'value']);
			var timesToRepeat =	1; //this.model.getValue(["repeat",'value']);
			if(frequency != undefined && frequency != null && timesToRepeat != undefined && timesToRepeat != null){
				this.updateEndDate(frequency, initDate, timesToRepeat);
			}
			else if(frequency == null && timesToRepeat != undefined && timesToRepeat != null && timesToRepeat == 1){
				var endDate = this.obtainEndDate(initDate);
				this.model.setValue(["endDate",'value'],endDate,false);
			}

		},
		/**Updates by end date */
		updateEndDateByEndDate:function(/*Date*/endDate){
			if(endDate != null && endDate != ""){
			var frequency =	this.model.getValue(["frequency",'value']);
			var initDate = this.model.getValue(["startDate",'value']);
			var timesToRepeat =	1; //this.model.getValue(["repeat",'value']);
			if(frequency != undefined && frequency != null && timesToRepeat != undefined && timesToRepeat != null){
				//starts from  endDate to calculate.
				//this.model.setValue(["startDate",'value'],endDate);
				var callObj = {
						callbackScope : this
				};
				callObj.errorHandler = dojo.hitch(this,this.errorHandler);
				callObj.callback = this.callBckFnRepeatDwr;
				//String periodicityId, Date initDate, Integer timesToRepeat
				SchedulingActionDWR.obtainScheduleRepeatByDates(frequency,initDate,endDate,this.calType,callObj);

			}
			else if(frequency == null && timesToRepeat != undefined && timesToRepeat != null && timesToRepeat == 1){
		
				var endDateTmp = this.obtainEndDate(endDate);
				this.model.setValue(["startDate",'value'],endDateTmp,false);
			}
			}
		},

		/**Outcome from dwr function sets times repeated.*/
		callBckFnRepeatDwr:function(/*Object*/outcome){
			var innerController = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId + '_resourceIn');
			if(innerController !== undefined){
				innerController.clearPanelMessage();
			} 
			this.clearPanelMessage();
			
			if(outcome.wAxn=="cnfrm"){
				var value =  outcome.msg;
				this.model.setValue(["repeat",'_lastValueReported'],value[0],false);
				this.model.setValue(["repeat",'value'],value[0],false);
				
				
				var endDate = this.obtainEndDate(value[1]);

				this.model.setValue(["endDate",'_lastValueReported'],endDate,false);
				this.model.setValue(["endDate",'value'],endDate,false);

			} else if(outcome.wAxn=="error"){
				if(innerController !== undefined){
					innerController.updateMsgsPanel(outcome.aMsgs);
				} else {
					this.updateMsgsPanel(outcome.aMsgs);
				}
			}
		},







		/*** Updates the end date by the retries parameter.*/
		updateEndDateByRepeat:function(timesToRepeat){
			var frequency =	this.model.getValue(["frequency",'value']);
			var initDate = this.model.getValue(["startDate",'value']);
			if(frequency != undefined && frequency != null && initDate != undefined && initDate != null && timesToRepeat != null && 
					isNaN(timesToRepeat)==false && timesToRepeat != 0 ){
				this.updateEndDate(frequency, initDate, timesToRepeat);
			}
			else{
				this.model.setValue(["repeat",'_lastValueReported'],"1",false);
				this.model.setValue(["repeat",'value'],"1",false);
			}
			
		},

		/**Update end date.*/
		updateEndDate:function(/*String*/frequency,/*Date*/ startDate,/*Int*/ timesToRepeat){
			var callObj = {
					callbackScope : this
			};
			callObj.errorHandler = dojo.hitch(this,this.errorHandler);
			callObj.callback = this.callBckFnEndDateDwr;
			//String periodicityId, Date initDate, Integer timesToRepeat
			SchedulingActionDWR.obtainScheduleEndDate(frequency,startDate,timesToRepeat,this.calType,callObj);
		},
		
		
		

		/**Outcome from dwr function sets end date.*/
		callBckFnEndDateDwr:function(/*Object*/outcome){
			var innerController = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId + '_resourceIn');
			if(innerController !== undefined){
				innerController.clearPanelMessage();
			} 
			this.clearPanelMessage();
			
			if(outcome.wAxn=="cnfrm"){
				var endDate = this.obtainEndDate(outcome.msg);
				
				this.model.setValue(["endDate",'_lastValueReported'],endDate,false);
				this.model.setValue(["endDate",'value'],endDate,false);


			} else if(outcome.wAxn=="error"){
				if(innerController !== undefined){
					innerController.updateMsgsPanel(outcome.aMsgs);
				} else {
					this.updateMsgsPanel(outcome.aMsgs);
				}
			}
		},

		/*Obtains end date*/
		obtainEndDate:function(endDateTmp){
			var endDate =  endDateTmp;
			if(endDateTmp != null && endDateTmp!= undefined ){
				if (typeof value == "string") {
					endDate = ec.fisa.format.utils
					.parseLongDate(endDateTmp);
				}
			}
			return endDate;
		},
		
		/*Cancela y cierra la pantalla de transaccion*/
		cancel:function(){
			ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
		},
		/* to be override.*/
		accept:function(){
			
		},
		//callback function for accept.
		callBckFnAcceptSchedulingDwr:function(outcome){
			if(outcome.wAxn=="cnfrm"){
				ec.fisa.navigation.utils.showNewBreadCrumbConfirmation("",[outcome.msg],this.breadcrumbId,this.tabId, this.pageScopeId,"","","");
			} else if(outcome.wAxn=="error"){
				if(outcome.errorSchedule == false){
					var btController = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId+"_resourceIn");
					btController.clearPanelMessage();
					btController.updateMsgsPanel(outcome.aMsgs);
					
				}else{
					this.updateMsgsPanel(outcome.aMsgs);
				}
				
			}
		},
		
		isComponentMsg:function(message){
			return (('fieldId' in message)&&(message.fieldId!=null)&&(message.fieldId!=""));
		},
		
		/**overwrite from basecontroller.*/
		addComponentMsg:function(message){
			this.model.setMessage([message.fieldId,'value'],message.fieldMsg, message.origLevel);
		},
		
		
		
		/** inits the media sucess datagrid. */
		initMediaSucessDataGrid:function(component){
			var layout = [
			              {
			            	  name : "",
			            	  field : "shortName",
			            	  width : "250px"
			              },
			              {
			            	  name : "",
			            	  field : "value" ,
			            	  width : "150px",
			            	  editable:false,
			            	  formatter:function(data, rowIndex,column)
			            	  {return ec.fisa.format.utils.formatterMediaNotificationValue(data, rowIndex,column);}
			              }
			              ];
			var gridData = {
					identifier: "id",
					items: this.mediaData.success
			};
			var store = new ItemFileWriteStore({ data: gridData });
			this.mediaDataSuccessStore = store;

			/** Creates a div inside an dom node component. */
			var creationDiv = domConstruct.create("div", null,
					component.domNode);

			// domClass.add(creationDiv, "grid");

			/* create a new grid: */
			var grid = new DataGrid({
				store: store,
				structure: layout,
				autoHeight:true,
				autoWidth:true,
				selectionMode:'none'
			},
			creationDiv);
			grid.tabId = this.tabId;
			grid.pageScopeId = this.pageScopeId;
			// workaround the grid calls postrender after
			// the component is at the dom.
			// so then i can change the style to reset the
			// header to invisible
			grid.connect(grid,"postrender",function(){
				var headerGrid =this.domNode.firstElementChild == null? this.domNode.children[0]:  this.domNode.firstElementChild;
				headerGrid.style.display="none";
			});
			grid.startup();
		},
		
		
		
		/** inits the media fail datagrid. */
		initMediaFailDataGrid:function(component){
			var layout = [
			              {
			            	  name : "",
			            	  field : "shortName",
			            	  width : "250px"
			              },
			              {
			            	  name : "",
			            	  field : "value" ,
			            	  width : "150px",
			            	  editable:false,
			            	  formatter:function(data, rowIndex,column)
			            	  {return ec.fisa.format.utils.formatterMediaNotificationValue(data, rowIndex,column);}
			              }
			              ];
			var gridData = {
					identifier: "id",
					items: this.mediaData.fail
			};
			var store = new ItemFileWriteStore({ data: gridData });
			this.mediaDataFailStore = store;

			/** Creates a div inside an dom node component. */
			var creationDiv = domConstruct.create("div", null,
					component.domNode);

			// domClass.add(creationDiv, "grid");

			/* create a new grid: */
			var grid = new DataGrid({
				store: store,
				structure: layout,
				autoHeight:true,
				autoWidth:true    
			},
			creationDiv);
			grid.tabId = this.tabId;
			grid.pageScopeId = this.pageScopeId;
			// workaround the grid calls postrender after
			// the component is at the dom.
			// so then i can change the style to reset the
			// header to invisible
			grid.connect(grid,"postrender",function(){
				var headerGrid =this.domNode.firstElementChild == null? this.domNode.children[0]:  this.domNode.firstElementChild;
				headerGrid.style.display="none";
			});
			grid.startup();
		}

	});
	return parentSchedulingController;
});

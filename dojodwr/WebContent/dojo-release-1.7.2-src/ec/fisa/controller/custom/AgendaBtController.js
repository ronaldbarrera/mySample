define([	"dojo/_base/kernel",
        	"dojo/_base/declare",
        	"dojo/_base/lang",
        	"ec/fisa/mvc/StatefulModel",
        	"./_base",
        	"ec/fisa/controller/custom/BtController"
], function(dojo,declare,lang, StatefulModel,fisaBaseController, BtController){
	var AgendaBtController = declare("ec.fisa.controller.custom.AgendaBtController",[BtController],{
		taskVO:null,
		//for params in agenda distinct from the model of the bt that is displayed.
		paramsModel:{},
		/* mapa que contiene los campos que cumplieron con el retipeo */
		retyped:null,
		constructor: function (){
			this.taskVO={};
			this.paramsModel=dojox.mvc.newStatefulModel({ data : {} });
			this.retyped = {};
		},
		
		
		
		
		
		
		
		initTaskVO:function(tabId, pageId){
			var callObj={callbackScope:this};
			callObj.callback=this.processResul;
			callObj.errorHandler=dojo.hitch(this,this.errorHandler);
			AgendaControllerDWR.getTaskVOFromRequest(tabId, pageId, callObj);
		},
		processResul: function(taskVO){
			this.taskVO = taskVO;
		},
		/**Binds value to mvc for paramsModel object.*/
		bindToModel:function(/*widget*/component,/*String*/modelProp,/*object*/initDat){
			var stf=new dojox.mvc.StatefulModel({data:initDat});
			this.paramsModel.add(modelProp,stf);
			component.set("ref",this.paramsModel[modelProp]);
		},
		dispatchConfirmTaskStatus:function(tabid, pageId){
			this.clearPanelMessage();
			var callObj={callbackScope:this};
			callObj.callback=this.processDispatchResult;
			callObj.errorHandler=dojo.hitch(this,this.errorHandler);
			AgendaControllerDWR.dispatchConfirmTaskStatus(tabid, pageId, callObj);
			
		},
		dispatchRejectedTaskStatus:function(tabid, pageId){
			this.clearPanelMessage();
			var callObj={callbackScope:this};
			callObj.callback=this.processDispatchResult;
			callObj.errorHandler=dojo.hitch(this,this.errorHandler);
			AgendaControllerDWR.dispatchRejectedTaskStatus(tabid, pageId, callObj);
		},
		dispatchTask:function(tabId, pageScopeId,/*String*/ isSequence, /*Principal Bt*/ principalBt){
			this.clearPanelMessage();
			var taskVO = {};
			taskVO.$dwrClassName="TaskVO";
			//filter es el valor del combo.
			taskVO.filter=this.paramsModel.filter.value;
			var comments;
			if(this.paramsModel.comments){
				comments = this.paramsModel.comments.value;
			}else{
				comments = "";
			}
			taskVO.requestTabId = this.taskVO.requestTabId;
			taskVO.requestPageScopeId = this.taskVO.requestPageScopeId;
			taskVO.initFilter = true;
			var callObj={callbackScope:this};
			callObj.callback=this.processDispatchResult;
			callObj.errorHandler=dojo.hitch(this,this.errorHandler);
			var fm = this.model.toPlainObject();
			AgendaControllerDWR.dispatchTask(taskVO, fm, this.retyped,isSequence, principalBt,callObj);
		},
		dispatchPersonalizedTask:function(requestTabId, requestPageScopeId){
			this.clearPanelMessage();
			var callObj={callbackScope:this};
			callObj.callback=this.processDispatchResult;
			callObj.errorHandler=dojo.hitch(this,this.errorHandler);
			AgendaControllerDWR.dispatchPersonalizedTask(requestTabId, requestPageScopeId,callObj);
		},
		processDispatchResult:function(outcome){
			if(outcome.wAxn=="close"){
				ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumb);
			} else if(outcome.wAxn=="cnfrm"){

				this.handleConfirmationBt(outcome);
			
			} else if(outcome.wAxn=="error"){
				this.updateMsgsPanel(outcome.aMsgs);
			}
		},
		setMessagesPanel:function(messagesPanel){
			this.inherited(arguments);
			this.messagesPanelId=messagesPanel.id;
		},
		
		handleConfirmationBt:function(outcome){
			
			var title =outcome.confirmationDialogTitle;
			var msg = outcome.aMsgs;
			var postBtId= outcome.postBtId;
			var principalBtId = outcome.pBtId;
			var postBtIdDataKey = outcome.postBtIdDataKey;
			var principalPostBtIdDataKey =outcome.principalPostBtIdDataKey;
			var parentBtInAuthorization = outcome.parentBtInAuthorization;
			
			var messagesPanel = dijit.byId(this.messagesPanelId);
			messagesPanel.clearAllMessages();
			
			var breadcrumb = dijit.byId(this.breadcrumbId);
			var postClose = breadcrumb.selectedChildWidget.postClose;
			var postCloseArgs = breadcrumb.selectedChildWidget.postCloseArgs;
			
			if(postBtId == null){
				//ec.fisa.navigation.utils.showMsgCloseCurrentBreadCrumb(outcome.aMsgs[0].summary,outcome.aMsgs[0].summary,this.breadcrumbId);
				ec.fisa.navigation.utils.showNewBreadCrumbConfirmation(title,msg,this.breadcrumbId,this.tabId,
						this.pageScopeId,null,null,false);

			} else {
				//used in case of bt showing post bt. its needed to close the confirmation and bt breadcrumb to return to agenda.
				postCloseArgs.btBreadCrumbId = this.breadcrumbId;
				//in agenda send the breadcrumb
				ec.fisa.navigation.utils.showPostBtBreadCrumb(breadcrumb.params.title,msg,this.tabId,
						this.pageScopeId,postBtId,principalBtId,this.breadcrumbId,postBtIdDataKey,
						principalPostBtIdDataKey,false,null,null,null,true);
			}
			breadcrumb.selectedChildWidget.postClose = postClose;
			breadcrumb.selectedChildWidget.postCloseArgs = postCloseArgs;
			breadcrumb.selectedChildWidget.postCloseScope = ec.fisa.controller.utils.getPageController(postCloseArgs[0], postCloseArgs[1]);

			
			
		}
		
	});
	return AgendaBtController;
});

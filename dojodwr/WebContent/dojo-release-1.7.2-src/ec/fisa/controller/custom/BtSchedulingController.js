define([
        "dojo/_base/kernel","dojo/_base/declare","dojo/_base/lang",
        "ec/fisa/controller/custom/BaseSchedulingController","./_base", "ec/fisa/dwr/proxy/SchedulingActionDWR"
        ],function(dojo,declare,lang,BaseSchedulingController){

	var BtSchedulingController = declare("ec.fisa.controller.custom.BtSchedulingController", [BaseSchedulingController], {
		btId:null,
		originalActionMode:null,
		btActionMode:null,
		
		sequencePrevButtonId:null,
		sequenceNextButtonId:null,
		
		schedulingAcceptButtonId:null,

		constructor: function (tabId,pageScopeId,data,componentCondId,calType,btId,originalActionMode,btActionMode) {
			this.btId = btId;
			this.originalActionMode = originalActionMode;
			this.btActionMode = btActionMode;
		},
		
		
		setSequencePrevButtonId:function(sequencePrevButtonId){
			this.sequencePrevButtonId = sequencePrevButtonId;
		},
		
		setSequenceNextButtonId:function(sequenceNextButtonId){
			this.sequenceNextButtonId = sequenceNextButtonId;
		},
		
		setSchedulingAcceptButtonId:function(schedulingAcceptButtonId){
			this.schedulingAcceptButtonId = schedulingAcceptButtonId;
		},
		
		/**Accept logic if comes to scheduler insert, validates the bt.*/
		accept:function(){
			var formValues = {};
			formValues.allowRetries  = this.model.getValue(["allowRetries","value"]);
//			formValues.correctProcessInterno = this.model.getValue(["correctProcessInterno","value"]);
//			formValues.correctProcessMail  = this.model.getValue(["correctProcessMail","value"]);
//			formValues.correctProcessSms  = this.model.getValue(["correctProcessSms","value"]);
			formValues.endDate  = this.model.getValue(["endDate","value"]);
			formValues.frequency  = this.model.getValue(["frequency","value"]);
//			formValues.notCorrectProcessInterno  = this.model.getValue(["notCorrectProcessInterno","value"]);
//			formValues.notCorrectProcessMail  = this.model.getValue(["notCorrectProcessMail","value"]);
//			formValues.notCorrectProcessSms  = this.model.getValue(["notCorrectProcessSms","value"]);
			formValues.repeat  = this.model.getValue(["repeat","value"]);
			formValues.startDate  = this.model.getValue(["startDate","value"]);
//			formValues.termsAccept = this.model.getValue(["termsAccept","value"]);
			formValues.calType = this.calType;
			
			formValues.componentCondId = this.componentCondId;
			
//			if(this.mediaDataSuccessStore != null){
//				var newFileItemObject = dojo
//				.fromJson(this.mediaDataSuccessStore
//						._getNewFileContentString());
//				formValues.sucessMediaNotifications = newFileItemObject.items;
//				
//				
//			}
//			if(this.mediaDataFailStore!= null){
//				var newFileItemObject = dojo
//				.fromJson(this.mediaDataFailStore
//						._getNewFileContentString());
//				formValues.failMediaNotifications = newFileItemObject.items;
//			}
			
			
			if(this.originalActionMode == "SI"){
				this.acceptComplexBt(formValues);
			}else{
				this.acceptSimple(formValues);
			}
		},
		/**Process the scheduling form to the pe and validate required fields.*/
		acceptComplexBt:function(formValues){
			this.clearPanelMessage();
			var callObj = {
					callbackScope : this
			};
			callObj.errorHandler = dojo.hitch(this,this.errorHandler);
			callObj.callback = this.callBckFnAcceptSchedulingDwr;
			var pageScopeId=this.pageScopeId+"_resourceIn";
			var btController = ec.fisa.controller.utils.getPageController(this.tabId,pageScopeId);
			var fm = btController.model.toPlainObject();
			
			var messagesPanel = dijit.byId(btController.messagesPanelId);
			if(messagesPanel != null){
				messagesPanel.clearAllMessages();
			}
			if(btController.model != null){
				btController.model.clearAllMessages();
			}
			
			messagesPanel = dijit.byId(this.messagesPanelId);
			if(messagesPanel != null){
				messagesPanel.clearAllMessages();
				this.messagesPanelId=btController.messagesPanelId;
			}
			if(this.model != null){
				this.model.clearAllMessages();
			}
			
			SchedulingActionDWR.acceptSchedulingComplex(formValues,this.tabId,pageScopeId,fm,this.btId,this.btActionMode,callObj);
//				var msg = [{"detail":null,"fieldId":null,"fieldMsg":null,"ftmId":null,"label":null,"level":{"level":20000},"origLevel":null,"summary":"Su transacción ha sido programada.","zipable":false}];
//		ec.fisa.navigation.utils.showNewBreadCrumbConfirmation("",msg,this.breadcrumbId,this.tabId, this.pageScopeId,"","","");
			
		},
		
		
		
		acceptSimple:function(formValues){
			this.clearPanelMessage();
			var callObj = {
					callbackScope : this
			};
			callObj.errorHandler = dojo.hitch(this,this.errorHandler);
			callObj.callback = this.callBckFnAcceptSchedulingDwr;
			
			
			SchedulingActionDWR.acceptScheduling(formValues,this.tabId,this.pageScopeId+"_resourceIn",callObj);
//				var msg = [{"detail":null,"fieldId":null,"fieldMsg":null,"ftmId":null,"label":null,"level":{"level":20000},"origLevel":null,"summary":"Su transacción ha sido programada.","zipable":false}];
//		ec.fisa.navigation.utils.showNewBreadCrumbConfirmation("",msg,this.breadcrumbId,this.tabId, this.pageScopeId,"","","");
			
		},
		/**Change components by action mode.*/
		changeComponentsByActionMode:function(/*string */btActionMode){
			
			var disable = false;
			if(btActionMode == 'QY'){
				disable = true;
			}
			this.model.setValue(["repeat",'disabled'],disable);
			this.model.setValue(["startDate",'disabled'],disable);
			
			this.model.setValue(["endDate",'disabled'],disable);
			this.model.setValue(["frequency",'disabled'],disable);
			this.model.setValue(["allowRetries",'disabled'],disable);
			
			
		}

	});
	return BtSchedulingController;
});

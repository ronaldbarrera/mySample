define([
        "dojo/_base/kernel",
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dijit/focus",
        "dojo/aspect",
        "ec/fisa/controller/BaseController",
        "ec/fisa/format/Utils",
        "ec/fisa/widget/Link",
        "ec/fisa/navigation/Utils",
        "dojo/data/ItemFileWriteStore",
        "dojo/dom-construct",
        "dojo/dom-geometry",
        "dijit/tree/ForestStoreModel",
        "dojox/grid/TreeGrid",
        "ec/fisa/widget/DocumentActions",
        "ec/fisa/mvc/StatefulModel",
        "dojo/on",
        "ec/fisa/controller/custom/QtController",
        "dojo/topic",
        "dojo/dom-style",
        "ec/fisa/grid/FisaEditableGridDirect",
        "ec/fisa/widget/DialogSecurity",
        "./_base","ec/fisa/widget/DateTextBox",
        "dojox/lang/functional/object",
        "ec/fisa/dwr/proxy/BtControllerDWR",
        "ec/fisa/dwr/proxy/EventReportActionDWR",
        "ec/fisa/dwr/proxy/RuleFieldSelectorControllerDWR",
        "dojox/lang/functional",
        "ec/fisa/widget/Select",
        "ec/fisa/grid/FisaFormGrid"
        ],function(dojo,declare,lang,focusUtil,aspect,BaseController,formatUtils,fisaLink,navigationUtils,
        		ItemFileWriteStore,domConstruct,domGeometry,ForestStoreModel,TreeGrid,DocumentActions,
        		StatefulModel,on, QtController, topic, domStyle){

	var BtController = declare("ec.fisa.controller.custom.BtController", [BaseController], {
		tabId:null,
		pageScopeId:null,
		model:null,
		data:null,
		/* grid data */
		documentData:null,
		/* combo options status */
		comboStatusOptions:null,
		initMsgs:null,
		shortDateFormatTree:null,
		breadcrumbId:null,
		btnsContainer:null,
		selectDataMap:null,
		lovData:null,
		labels:null,
		btId:null,
		actionId:null,
		contextPath:dojo.config.fisaContextPath,
		isDisabled:null,
		tableRegistry:null,
		treeGridDocuments:null,
		/*TEMPLATE*/
		saveAsTemplateChckBoxId:null,
		/*notification widget*/
		notificationAdditionalsWdgId:null,
		//labels for initializacion of the bt.
		initLabels:null,

		// Indicates the content pane in which the bt is loaded.
		btContentPaneId:null,
		dateFields:null,
		//this is for security it has the factors applied to the bt.
		secBeforeListFactor:null,
		secAfterListFactor:null,
		subscriptions:null,
		/**Variable to contains the parent bt pagescope id used only in confirmation bt for reports*/
		parentConfBtPageScopeId:null,
		//document content pane widget.
		documentContentPaneWdgId:null,
		//bt Tab container id.
		btTabContainerId:null,
		//map with select id with field id
		selectComponentToReload:null,//En selección de beneficiarios, cuando un combo tiene asociado un link de seleccion de beneficiarios JCVQ
		selectIdMap:null,
		
		btInitialActionMode:null,
		//openlist id map filled in each open list.
		openListIdMap:null,
		sequenceBtScheduleButtonData:null,
		
		constructor: function (tabId,pageScopeId,initData,initMsgs,selectDataMap,lovData,secBeforeListFactor,secAfterListFactor,initLabels,btActionMode,parentConfBtPageScopeId) {
			this.tabId=tabId;
			this.pageScopeId=pageScopeId;
			this.data=initData;
			this.initMsgs=initMsgs;
			this.selectDataMap=selectDataMap;
			this.lovData=lovData;
			this.tableRegistry={};
			this.model=new StatefulModel({});
			this.notificationAdditionalsWdgId=[];
			this.secBeforeListFactor = secBeforeListFactor;
			this.secAfterListFactor = secAfterListFactor;
			this.initLabels = initLabels;
			this.verifyBeforeSecurity();
			this.subscriptions = {};
			this.parentConfBtPageScopeId = parentConfBtPageScopeId;
			this.selectIdMap = {};
			this.openListIdMap = {};
			//added initialactionmode cause the btactionmode is used elsewhere,
			this.btInitialActionMode = btActionMode;
		},
		/**this is used only in sequences, to copy one screen to another.*/
		copyInitData: function (tabId,pageScopeId,initData,initMsgs,selectDataMap,lovData,secBeforeListFactor,secAfterListFactor,initLabels,btInitialActionMode) {
			this.tabId=tabId;
			this.pageScopeId=pageScopeId;
			this.data=initData;
			this.initMsgs=initMsgs;
			this.selectDataMap=selectDataMap;
			this.lovData=lovData;
			this.tableRegistry={};
			this.model=new StatefulModel({});
			this.notificationAdditionalsWdgId=[];
			this.secBeforeListFactor = secBeforeListFactor;
			this.secAfterListFactor = secAfterListFactor;
			this.initLabels = initLabels;
			this.verifyBeforeSecurity();
			this.subscriptions = {};
			this.btInitialActionMode = btActionMode;
		},
		/**This is used for bts contain in a btGroup unless main bt  **/
		updateInitData:function (selectDataMap,lovData,initData) {
			var _initData = initData || {};
			this.selectDataMap =this.mergeObjects(this.selectDataMap,selectDataMap);
			this.lovData =this.mergeObjects(this.lovData,lovData);
			this.data = this.mergeObjects(this.data, _initData);//JCVQ Mantis 18209
		},
		
		mergeObjects:function(obj1,obj2){
			if (!obj1){
				obj1={};
			}
			if(obj2){
				for(var attrib in obj2){
					obj1[attrib]=obj2[attrib];
				}			
			}
			return obj1;
		},

		destroy:function(){
			if(this.model!=null){
				this.model.clearAllMessages();
			}
			this.data=null;
			this.model=null;
			this.lovData = null;
			this.tableRegistry = null;
			this.initMsgs = null;
			this.notificationAdditionalsWdgId=null;
			//código para eliminar subscripciones 
			dojox.lang.functional.forIn(this.subscriptions,function(subscription, btId){
				if(subscription.remove && lang.isFunction(subscription.remove)){
					subscription.remove();
				}
			}, this);
		},
		
		/**verifys if this bt has security to be shown before. It looks for a number of factors of security. could be more than one and must
		 * be continued one after another.*/
		verifyBeforeSecurity:function(){
			if(this.secBeforeListFactor != null && this.secBeforeListFactor != undefined && this.secBeforeListFactor.length > 0 && this.showConfirmation != "true"){
				this.createDialogSecurityFactor(this.secBeforeListFactor);
			}
		},
		/**Called after the bt was shown, and before it goes to the pe.*/
		verifyAfterSecurity:function(callerCmp){
			if(this.secAfterListFactor != null && this.secAfterListFactor != undefined && this.secAfterListFactor.length > 0){
				var callObj={callbackScope:this,errorHandler:dojo.hitch(this,this.errorHandler),callback:this.handleVerifyAfterLastSecurity,arg:callerCmp};
				//uses the same as sequence cause it is fixed the authentication to a bt only.
				EventSequenceActionDWR.verifyRuleForValidationBt(this.tabId,this.pageScopeId,callObj);
				
				
			}
			else{
				this._execActionInternal(callerCmp);
			}
		},
		/**Called after the bt sequence was shown, and before it goes to the pe.*/
		verifyAfterSecurityLast:function(callerCmp){
			if(this.secAfterListFactor != null && this.secAfterListFactor != undefined && this.secAfterListFactor.length > 0){
				var callObj={callbackScope:this,errorHandler:dojo.hitch(this,this.errorHandler),callback:this.handleSequenceVerifyAfterLastSecurity,arg:callerCmp};
				EventSequenceActionDWR.verifyRuleForValidationBt(this.tabId,this.pageScopeId,callObj);
			}
			else{
				this.sequenceLastAction(callerCmp);
			}
		},
		
		
		/**Despues de verificar que factor debe ser corregido.*/
		handleVerifyAfterLastSecurity:function(outcome,callerCmp){
			var thirdDlg = this.createDialogSecurityFactor(this.secAfterListFactor,callerCmp["fisa-bt-id"],outcome.RULE_NUMBER_OF_FACTOR_TO_VALIDATE);
			thirdDlg["dlgSuccessEvent"]=dojo.hitch(this,function(callerCmp,argument){
				this._execActionInternal(callerCmp);
				},callerCmp);
			
		},
		
		
		/**Despues de verificar que factor debe ser corregido.*/
		handleSequenceVerifyAfterLastSecurity:function(outcome,callerCmp){
			var thirdDlg = this.createDialogSecurityFactor(this.secAfterListFactor,callerCmp["fisa-bt-id"],outcome.RULE_NUMBER_OF_FACTOR_TO_VALIDATE);
			thirdDlg["dlgSuccessEvent"]=dojo.hitch(this,function(callerCmp,argument){
				this.sequenceLastAction(callerCmp);
				},callerCmp);
		},
		
		
		cancelAuthenticationFactorDialog:function(btId){
		  //if bt is not null or undefined means that a bt is open, so It should be unlock in DDBB.
			if(btId){
			var callObj={callbackScope:this};
			callObj.errorHandler=dojo.hitch(this,this.errorHandler);
				callObj.callback=dojo.hitch(this, function (){
			var outcome ={wAxn:'close'};
			this.handleWindowAction(outcome);
				});
			EventActionDWR.executeCommandButtonCancel(this.tabId,this.pageScopeId,btId,callObj);
			}else{
				var outcome ={wAxn:'close'};
				this.handleWindowAction(outcome);
			}
		},
		
		/**Called after the bt was shown, and before it goes to the pe.*/
		verifyAfterSecuenceSecurity:function(/* String */sequenceId,/* String */ nextStep){
			if(this.secAfterListFactor != null && this.secAfterListFactor != undefined && this.secAfterListFactor.length > 0
			 && (this.showDocuments != "true" || this.showConfirmation != "true")		
			){
				var thirdDlg = this.createDialogSecurityFactor(this.secAfterListFactor);
				thirdDlg["dlgSuccessEvent"]=dojo.hitch(this,function(sequenceId,nextStep,argument){
					this._handleSeqNextActionInternal(sequenceId,nextStep);
				},sequenceId,nextStep);
			}
			else{
				this._handleSeqNextActionInternal(sequenceId,nextStep);
			}
		},
		
		/**Creates the security dialog*/
		createDialogSecurityFactor:function(/*array*/secListFactor,btId,numberSecurityFactor){
			var dialogStyle=ec.fisa.controller.utils.getGlobalModalSize(0.50);
			dialogStyle.h = dialogStyle.h+100; //to fix height to more appropiate size
			var thirdDlg = new ec.fisa.widget.DialogSecurity({
				'title': this.initLabels["titleSecurityPopup"],
				'draggable':false,
				'wdgtWidth':dialogStyle.w,
				'wdgtHeight':dialogStyle.h,
				'tabId':this.tabId,
				'secListFactor':secListFactor,
				'pageScopeId':this.pageScopeId+"sec_pop",
				'secBeforeListFactorIndex':numberSecurityFactor,
				
				'style': {width: dialogStyle.w+'px', height:dialogStyle.h+'px'},
				'dlgCancelEvent':dojo.hitch(this,function(argument){
					this.cancelAuthenticationFactorDialog(btId);
				})
			});
			thirdDlg.show();
			return thirdDlg;
		},
		
		/** In case of sequence repoblates the init data 
		 * this data is new and cames from a fm repoblated.*/
		renewInitData:function(initData){
			this.data=initData;
		},

		/** load id of save as templatechckboxid */
		loadSaveAsTemplateChckBoxId:function(saveAsTemplateChckBoxId){
			this.saveAsTemplateChckBoxId = saveAsTemplateChckBoxId;
		},
	
		/****/
		loadNotificationAdditionalsWdgId:function(notificationAdditionalsWdgId,currentBtId){
			this.notificationAdditionalsWdgId.push({'btId':currentBtId,'notifWdgId':notificationAdditionalsWdgId});
		},
		getComponent:function(btId,fieldId){
			return this.model.getComponent([btId,'dataMessage','fields',fieldId,'value']);
		},
		addParamToModel:function(component){
			var eid=component["bt-id"];
			var fid=component["field-id"];
			var field = null;
			if(this.data&&this.data[eid]&&this.data[eid].dataMessage){
				field = this.data[eid].dataMessage.fields[fid];
			}
			if(field == null) {
				field={value:'',complement:null};
				component._fStarted=true;
			} else if(field.value==null){
				field.value="";
				component._fStarted=true;
			}else if(field.value==''){
				component._fStarted=true;
			}
			
			var isEditableGridDirect = false;
			if(component instanceof ec.fisa.grid.FisaEditableGridDirect){
				isEditableGridDirect = true;
			}else if (component instanceof ec.fisa.grid.FisaFormGrid){
				isEditableGridDirect = true;
			}
			
			if(this.model.contains(eid)){
				// if exists yet updates new value.
				if(this.model.contains([eid,'dataMessage','fields',fid]) ) {
					if(isEditableGridDirect == true){
						this.model.setValue([eid,'dataMessage','fields',fid,'multivalueList'],field.value);
					}
					else{
						this.model.setValue([eid,'dataMessage','fields',fid,'value'],field.value);
					}
					
				}
			} else {
				if(isEditableGridDirect == true){
					this.model.appendObject([eid,'dataMessage','fields',fid,'multivalueList'],field.value,component.id,'value',null,false);
				}
				else{
					this.model.appendObject([eid,'dataMessage','fields',fid,'value'],field.value,component.id,'value',null,false);
				}
				
			
				//este valro viene seteado en el fm cuando es llamado de una rutina generalmente la onload.
				var enabled = null;
				if(field.enabled != undefined ){
					enabled = field.enabled;
					
				}
				this.model.appendObject([eid,'dataMessage','fields',fid,'enabled'],enabled,component.id,'enabled',null,false);

				if(component.hasCompl){
					this.model.appendObject([eid,'dataMessage','fields',fid,'complement'],field.complement,component.id,'complement',null,false);
				}


			}
			//Logica para seleccion de Beneficiarios. JCVQ
			//Se verifica si el componente es de tipo ec.fisa.widget.Select y si tiene la propiedad hasBeneficiarySelectionLink == true para registrarlo
			//Este componente select invocara la actualización de sus opciones luego de regresar de la QT de selección de Beneficiarios.
			if(component instanceof ec.fisa.widget.Select && (component.hasBeneficiarySelectionLink == true || component.hasBeneficiarySelectionLink == "true")){
				this.selectComponentToReload = component;
			}
			
		},
		
		addRuleParamToModel:function(component){
			this.addParamToModel(component);
			var eid=component["bt-id"];
			var fid=component["field-id"];
			var fieldRule = null;
			
			if(this.data&&this.data[eid]&&this.data[eid].tscRules){
				fieldRule = this.data[eid].tscRules[fid];
			}
			if(fieldRule == null) {
				fieldRule={value:'',complement:null};
				component._fStarted=true;
			}else{
				this._getAdditionalFieldsInformationForRuleComponent(component);
			}
			// if exists yet updates new value.
			if(this.model.contains([eid])&&this.model.contains([eid,'tscRules',fid])){
				this.model.setValue([eid,'tscRules',fid],fieldRule);
			} else {
				this.model.appendObject([eid,'tscRules',fid],fieldRule,component.id,'ruleValue',null,false);
			}
		},
		_getAdditionalFieldsInformationForRuleComponent: function(component){
			var relatedFieldBt = component.get('relatedFieldBt');
			var eid=component["bt-id"];
			var btWhereToGetFieldsForRule = this.getFieldModel(eid,relatedFieldBt);
			if(btWhereToGetFieldsForRule!=undefined && btWhereToGetFieldsForRule!=null &&btWhereToGetFieldsForRule!=''){
				var callObj={callbackScope:this};
				callObj.errorHandler=dojo.hitch(this,this.errorHandler);
				callObj.callback=function(outcome){
					this._handleCallBackAdditionalFieldsInformationForRuleComponent(outcome,component);
				}
				RuleFieldSelectorControllerDWR.loadAdditionalFieldsInformationForRuleComponent(btWhereToGetFieldsForRule ,callObj);
			}
		},	
		
		_handleCallBackAdditionalFieldsInformationForRuleComponent:function(outcome,component){
			var additionalFieldInfo= outcome.additionalFieldInfo;
			var comboData = outcome.comboData;
			component.set('additionalFieldInfo',additionalFieldInfo);
			component.set('comboData',comboData);
			component.renderRuleComponent();
			
		},
		registerTable:function(component){
			if(!this.tableRegistry[component.btId]){
				this.tableRegistry[component.btId]={};
			}
			var tbt=this.tableRegistry[component.btId];
			if(!tbt[component.entId]){
				tbt[component.entId]=component.id;
			}
		},
		containsFieldModel:function(eid, fid){
			return this.model.contains([eid,'dataMessage','fields',fid,'value']);
		},
		getFieldModel:function(eid, fid){
			return this.model.getValue([eid,'dataMessage','fields',fid,'value']);
		},
		setFieldModelValue:function(eid, fid, value, priorityChange) {
			this.model.setValue([eid,'dataMessage','fields',fid,'value'],value, priorityChange);
		},
		/** updates the mvc with the enabled attribute. */
		setFieldModelEnabled:function(/* String businesstemplate id */btId,/*
		 * String
		 * fieldId
		 */ fid,/* boolean */ value) {
			this.model.setValue([btId,'dataMessage','fields',fid,'enabled'],value);
		},

		setFieldModelComplement:function(eid, fid, complement) {
			this.model.setValue([eid,'dataMessage','fields',fid,'complement'],complement);
		},
		getFieldModelComplement:function(eid, fid) {
			return this.model.getValue([eid,'dataMessage','fields',fid,'complement']);
		},
		/* sets if components will show in disabled mode. */
		setIsDisabled:function(/* boolean */isDisabled){
			this.isDisabled = isDisabled;

		},

		addControllerRef:function(component){
			component.fc=this;
		},
		/**
		 * called at the buttons of btbuttonbarcontainr with the interacion of a
		 * bt.
		 */
		execAction:function(/** component */callerCmp){
			var messagesPanel = dijit.byId(this.messagesPanelId);
			if(messagesPanel != null){
				messagesPanel.clearAllMessages();
			}
			if(this.model != null){
				this.model.clearAllMessages();
			}
			if(callerCmp&&callerCmp["fisa-action-id"]){
				var action = callerCmp["fisa-action-id"];
				var btId = callerCmp["fisa-bt-id"];
				var isSequence = callerCmp["is_sequence"];
				var templateOverCall = callerCmp["template_over_call"];
				//called when agenda push hold button.
				var fromAgenda = callerCmp["from-agenda"];

				this.btId = btId;
				this.btActionMode = action;
				this.isSequence = isSequence;
				this.fromAgenda = fromAgenda;
				
				var callObj={callbackScope:this};
				callObj.errorHandler=dojo.hitch(this,this.errorHandler);
				ec.fisa.widget.utils.resetFocusManager();
				if("CANCEL"==action || "closeBt" == action){
					callObj.callback=this.handleCancelAction;
					EventActionDWR.executeCommandButtonCancel(this.tabId,this.pageScopeId,btId,callObj);
				} 
				else if("close" == action){
					var outcome={};
					outcome.wAxn = "close";
					this.handleWindowAction(outcome);
				} 
				
				else {
					// Para acciones
					// "IN"==action||"DE"==action||"UP"==action||"HD"==action
					var callObj={callbackScope:this};
					callObj.errorHandler=dojo.hitch(this,this.errorHandler);
					callObj.callback=this._validateBtCallBack;
					var fm = this.model.toPlainObject();
					
					var notificationVal = this._addNotificationValData();
					
					var valueTemplate = false;
					if(this.saveAsTemplateChckBoxId != null){
						var checkBoxSt = dijit.byId(this.saveAsTemplateChckBoxId);
						if(checkBoxSt.get('checked') == true){
							valueTemplate = true;
						}
					}
					EventActionDWR.executeCommandButtonAction(this.tabId,this.pageScopeId,btId,action,valueTemplate,templateOverCall,fm,notificationVal,callObj);
				}
			}
		},
		
		
		
		/**Adds notification data*/
		_addNotificationValData:function(){
			var notificationVal = {};
			if(this.notificationAdditionalsWdgId!= null && this.notificationAdditionalsWdgId!= undefined){
				dojo.forEach(this.notificationAdditionalsWdgId,dojo.hitch(this,function(val){
					var btId = val.btId;
					var notiValWdgId = val.notifWdgId;
					var wdgNotif = dijit.byId(notiValWdgId);
					var notiVal = wdgNotif.get("value");
					if(notificationVal[btId] == null && notificationVal[btId] == undefined){
						notificationVal[btId]= {};
					}
					notificationVal[btId]=notiVal;
				}));
				}
			return notificationVal;
			
		},
		updateNotificationData:function(notificationVal, btIdParam){/*Actualiza la data de notificacion*/
			if(this.notificationAdditionalsWdgId!= null && this.notificationAdditionalsWdgId!= undefined){
				dojo.forEach(this.notificationAdditionalsWdgId, dojo.hitch(this,function(val){
					var btId = val.btId;
					if(btId == btIdParam){
						var notiValWdgId = val.notifWdgId;
						var wdgNotif = dijit.byId(notiValWdgId);
						wdgNotif.set("value", notificationVal);
					}
				}));
			}
		},
		addNotificationValDataForLinkAction:function(){
			return this._addNotificationValData();
		},
		
		/**called after bt being validated.*/
		_validateBtCallBack:function(outcome){
			 if(outcome.wAxn=="cnfrm"){
				var callerCmp = {};
				callerCmp["fisa-action-id"] = outcome.btAction;
				callerCmp["fisa-bt-id"] =outcome.btId;
				this.verifyAfterSecurity(callerCmp);
			 } else if(outcome.wAxn=="error"){
					this.updateMsgsPanel(outcome.aMsgs);
			}
			
		},
		
		/**Executes internal action.*/
		_execActionInternal:function(/*component*/callerCmp){
			var action = callerCmp["fisa-action-id"];
			var btId = callerCmp["fisa-bt-id"];
			// Para acciones
			// "IN"==action||"DE"==action||"UP"==action||"HD"==action
			var callObj={callbackScope:this};
			callObj.errorHandler=dojo.hitch(this,this.errorHandler);
			callObj.callback=this.handleInAction;
			
			EventActionDWR.executeValidatedBtAction(this.tabId,this.pageScopeId,btId,action,callObj);
		},
		
		//deprecated its no used anymore. TODO: DELETE THIS METHOD
		/** Controls the scheduling of a bt. */
		execActionSchedule:function(/* dojo Widget generaly a button */callerCmp){
			var btId = callerCmp["fisa-bt-id"];
			var tabId = callerCmp["tab_id"];
			var label = callerCmp["label"];
			var dataKey = callerCmp["data_key"];
			var toRenderBt = callerCmp["fisa-bt-id-to-render"];

			ec.fisa.navigation.utils.navigateToSchedulePage(btId,toRenderBt,tabId,label,dataKey,this.btContentPaneId,this.pageScopeId);
		},

		execActionPU:function(callerCmp){
			var messagesPanel = dijit.byId(this.messagesPanelId);
			messagesPanel.clearAllMessages();
			this.model.clearAllMessages();
			if(callerCmp&&callerCmp["fisa-action-id"]){
				var action = callerCmp["fisa-action-id"];
				var btId = callerCmp["fisa-bt-id"];
				var callObj={callbackScope:this};
				callObj.errorHandler=dojo.hitch(this,this.errorHandler);
				ec.fisa.widget.utils.resetFocusManager();
				if("CANCEL"==action){
					callObj.callback=this.handleCancelAction;
					EventActionDWR.executeCommandButtonCancel(this.tabId,this.pageScopeId,btId,callObj);
				} else {
					callObj.callback=this.handleInAction;
					var fm = this.model.toPlainObject();
					EventActionDWR.executeCommandButtonActionPopUp(this.tabId,this.pageScopeId,btId,action,fm,callObj);
				}
			}
		},
		/**Handles action for the bt updates the model withe new values of the fm.*/
		handleInAction:function(outcome){
			if(this.model&&outcome&&outcome.ftMsgs && this.fromAgenda != "true"){
				this.data=outcome.ftMsgs;
				dojox.lang.functional.forIn(this.data,function(ftm,prop){
					if(this.model.contains([prop])){
						var ftmFlds =ftm.dataMessage.fields;
						dojox.lang.functional.forIn(ftmFlds,function(f,fId){
							var _val=f.value||"";
							var _cmpl=f.complement||"";
							//JG: le aumente el priority change a false para que no ejecute nuevamente las rutinas cuando no debe
							this.model.setValue([prop,'dataMessage','fields',fId,'value'],f.value,false);
							this.model.setValue([prop,'dataMessage','fields',fId,'complement'],f.complement,false);
						},this);
					}
				},this);
			}
			this.handleWindowAction(outcome);
		},
		handleCancelAction:function(outcome){
			this.handleWindowAction(outcome);
		},
		/**Handles the window action based on the outcome of the eventactiondwr or eventsequencedwr*/
		handleWindowAction:function(outcome){
			//overrides agenda behavior-> to just close the current breadcrum
			if(this.fromAgenda != null && this.fromAgenda == "true" && outcome.wAxn!="error"){
				outcome.wAxn = "close";
			}
			if(outcome.wAxn=="close"){
				var breadCrumb = dijit.byId(this.breadcrumbId);
				var selectedPane = breadCrumb.selectedChildWidget;
				var verifyLastTab=false;
				if(selectedPane.postClose != null && selectedPane.postClose != undefined && selectedPane.postCloseScope != undefined &&
						selectedPane.postCloseScope != null){
					var scp=dijit.byId(selectedPane.postCloseScope);
					if(scp != null){//mantis 19499 hs. 
					selectedPane.postClose.apply(scp,selectedPane.postCloseArgs);
					}
				} else {
					verifyLastTab=true;
				}
//				if(this.isSequence != null && this.isSequence == "true"){
//					ec.fisa.navigation.utils.closeSequenceBreadCrumb(this.breadcrumbId);
//				} else {
					ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
//				}
				//this is used only in agenda. when postbt is showed, then close the bt too.
				if(selectedPane != null && selectedPane.postCloseArgs!= null 
						&& selectedPane.postCloseArgs!= undefined &&
						selectedPane.postCloseArgs.btBreadCrumbId !=null && selectedPane.postCloseArgs.btBreadCrumbId != undefined
						&& selectedPane.postClose != undefined && selectedPane.postCloseScope != undefined){
					ec.fisa.navigation.utils.closeCurrentBreadCrumb(selectedPane.postCloseArgs.btBreadCrumbId);
				}
				if(verifyLastTab){
					ec.fisa.menu.utils.addEmptyTabAllClosed(dojo.config.fisaNewTabLabel);
				}
			} else if(outcome.wAxn=="cnfrm"){
				this.handleConfirmationBt(outcome);
			} else if(outcome.wAxn=="error"){
				this.updateMsgsPanel(outcome.aMsgs);
				this.refreshTableRegistry();
			} else if(outcome.wAxn=="close&refresh"){
				ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
				var refControlller=ec.fisa.controller.utils.getPageController(outcome.parentFisaTabId,outcome.parentFisaPageScopeId);
				if (refControlller != undefined && refControlller instanceof BtController) {
					var ttr = dijit.byId(refControlller.tableRegistry[outcome.parentBtId][outcome.parentEntityId]);
					if (ttr != undefined && ttr != null) {
						ttr.refresh();
					}
					//<<HD19508 JCVQ Se ejecuta el refresco de data del padre luego de ejecutar rutinas de campos de multiregistros
					if(outcome.msg){
						outcome.wAxn = "refresh";
						refControlller.handleCallBackBackFieldRoutine(refControlller.removeCurrentMRFromOutcome(outcome,ttr));
					}
					//HD19508 JCVQ>>
				}
			} else if(outcome.wAxn == "showDlg"){
				if(this.isSequence != undefined && this.isSequence != null && this.isSequence === "true"){
					ec.fisa.navigation.utils.templateSequenceDlgShowAction(outcome.respBtLabels,this.tabId,this.pageScopeId,this.sequenceId);
				}else{
					ec.fisa.navigation.utils.templateDlgShowAction(outcome.respBtLabels,this.tabId,this.pageScopeId,this.btId,this.btActionMode,this.isSequence);
				}
			}
			else {
				alert("unknown action!");
			}
		},

		/**
		 * to handle confirmation verify if there is parametrized in visualbt a
		 * postsequence bt if not show confirmation.
		 */
		handleConfirmationBt:function(outcome){
			
			var title =outcome.respBtLabels[0];
			var msg = outcome.aMsgs;
			var postBtId= outcome.postBtId;
			var principalBtId = outcome.pBtId;
			var postBtIdDataKey = outcome.postBtIdDataKey;
			var principalPostBtIdDataKey =outcome.principalPostBtIdDataKey;
			var parentBtInAuthorization = outcome.parentBtInAuthorization;
			
			var showReportModule= outcome.showReportModule;
			var showReportAuto = outcome.showReportAuto;
			
			var messagesPanel = dijit.byId(this.messagesPanelId);
			messagesPanel.clearAllMessages();
			this.model.clearAllMessages();
			if(postBtId == null){
				ec.fisa.navigation.utils.showNewBreadCrumbConfirmation(title,msg,this.breadcrumbId,this.tabId,
						this.pageScopeId,this.btId,this.btActionMode,this.isSequence,showReportModule,showReportAuto);
			} else {
				var breadcrumb = dijit.byId(this.breadcrumbId);
				ec.fisa.navigation.utils.showPostBtBreadCrumb(breadcrumb.params.title,msg,this.tabId,
						this.pageScopeId,postBtId,principalBtId,this.btContentPaneId,postBtIdDataKey,
						principalPostBtIdDataKey,this.isSequence,showReportModule,showReportAuto,parentBtInAuthorization,false);
			}
		},


		setMessagesPanel:function(messagesPanel){
			this.inherited(arguments);
			if(typeof this.breadcrumbId === 'undefined' || this.breadcrumbId == null){
				var breadCrumb=ec.fisa.controller.utils.findCurrentBreadCrumb(messagesPanel);
				if(breadCrumb){
					this.breadcrumbId=breadCrumb.id;
				}
			}
			this.updateMsgsPanel(this.initMsgs);

			this.btContentPaneId = messagesPanel.getParent().getParent().id;
			delete this.initMsgs;
		},
		/** Sets the data for documents, this is the data for the grid . */
		setDocumentData:function(documentData){
			this.documentData = documentData;
		},
		/* sets combo data for future use. */
		setComboStatusData:function(comboData){
			/* transform to store the combo status data. */
			this.comboStatusOptions =  comboData;
		},
		/* sets btId for future use. */
		setBtId:function(btId){
			this.btId =  btId;
		},
		/* sets btId for future use. */
		setActionId:function(actionId){
			this.actionId =  actionId;
		},
		setShortDateFormatTree:function(shortDateFormatTree){
			this.shortDateFormatTree = shortDateFormatTree;
		},
		setLabels:function(/* objeto con los labels */labels){
			this.labels = labels;
		},
		/** inits the treegrid. */
		initTreeGrid:function(component){
			var layout = [ 
			              {
			            	  name : this.labels["treeTableNameColumn"],
			            	  field : "description" ,
			            	  width : "290px"
			            		  ,'editable':false,cellType:dojox.grid.cells._Widget,
			            		  widgetClass: fisaLink,
			            		  titlePopUp:this.labels["titlePopUp"],
			            		  formatter:function(data, rowIndex,treepath,column)
			            		  {return ec.fisa.format.utils.linkPopUpFormatter(data, rowIndex,treepath,column);}
			              },
			              {
			            	  name : this.labels["detailColumn"],
			            	  field : "complement",
			            	  width : "100px",
			            	  formatter:function(data, rowIndex,treepath,p4)
			            	  {return ec.fisa.format.utils.formatterDetail(data, rowIndex,treepath,p4);}

			              }, {
			            	  name : this.labels["statusColumn"],
			            	  field : "status",
			            	  width : "100px",
			            	  cellType:dojox.grid.cells._Widget,
			            	  editable:false,
			            	  widgetClass: dijit.form.Select,
			            	  formatter:function(data, rowIndex,treepath,column)
			            	  {return ec.fisa.format.utils.formatterCombo(data, rowIndex,treepath,column);}
			              },
			              {
			            	  name : this.labels["requiredColumn"],
			            	  field : "required",
			            	  width : "105px",
			            	  cellType:dojox.grid.cells._Widget,
			            	  editable:false,
			            	  widgetClass: dijit.form.CheckBox,
			            	  formatter:function(data, rowIndex,treepath,p4)
			            	  {return ec.fisa.format.utils.formatterBooleanCheckbox(data, rowIndex,treepath,p4);}
			              } ,
			              {
			            	  name : this.labels["maxDeliveryColumn"],
			            	  field : "maxDeliveryDate",
			            	  width : "100px", 
			            	  formatter:function(data, rowIndex,treepath,p4)
			            	  {return ec.fisa.format.utils.formatterMaxDeliveryDate(data, rowIndex,treepath,p4);}
			              },

			              {
			            	  name : this.labels["receptionColumn"],
			            	  field : "receptionDate",
			            	  width : "100px",
			            	  formatter:function(data, rowIndex,treepath,p4)
			            	  {return ec.fisa.format.utils.formatterRecepcionDate(data, rowIndex,treepath,p4);}
			              } ,

			              {
			            	  name : this.labels["expirationColumn"],
			            	  field : "expirationDate",
			            	  width : "100px",
			            	  formatter:function(data, rowIndex,treepath,p4)
			            	  {return ec.fisa.format.utils.formatterExpiracionDate(data, rowIndex,treepath,p4);}
			              } ,
			              {
			            	  name : this.labels["optionsColumn"],
			            	  field : "a",
			            	  width : "100px",
			            	  cellType:dojox.grid.cells._Widget,
			            	  editable:false,
			            	  widgetClass: DocumentActions,
			            	  formatter:function(data, rowIndex,treepath,col)
			            	  {
			            		  return ec.fisa.format.utils.formatterDocumentsOptions(data, rowIndex,treepath,col);}
			              } 
			              ];
			var store = new ItemFileWriteStore({ data: this.documentData });
			var treeModel = new dijit.tree.ForestStoreModel({
				store : store,
				rootId : 'rootNode',
				rootLabel : 'Documentos',
				childrenAttrs : [ 'children' ]
			});

			/** Creates a div inside an dom node component. */
			var creationDiv = domConstruct.create("div", null,
					component.domNode);

			// domClass.add(creationDiv, "grid");

			this.treeGridDocuments = new TreeGrid({
				treeModel : treeModel,
				structure : layout,
				defaultOpen : true,
				autoHeight:true,
				autoWidth:true

			}, /* lugar de creacion */creationDiv);
			this.treeGridDocuments.contextPath=this.contextpath;
			this.treeGridDocuments.cusDateFormat=this.shortDateFormatTree;
			this.treeGridDocuments.comboStatusOptions=this.comboStatusOptions;

			this.treeGridDocuments.tabIdvar=this.tabId;
			this.treeGridDocuments.btIdvar=this.btId;
			this.treeGridDocuments.actionIdvar=this.actionId;	        
			this.treeGridDocuments.pageScopeIdvar=this.pageScopeId;
			this.treeGridDocuments.labelsColm=this.labels;
			this.treeGridDocuments.isDisabled=this.isDisabled;

			this.treeGridDocuments.startup();
		},

		loadSelectData:function(component,ignoreSetOptions) {
			var iso=ignoreSetOptions||false;
			var btId = component["bt-id"];
			var qtId = component["qt-id"];
			var fieldId = component["field-id"];
			
			if(component.parentEditableGrid == true && component.gridRealRowIndex != null){
				fieldId = fieldId +"|"+ component.gridRealRowIndex;
			}
			
			var listOfOptions = [];
			if(this.selectDataMap && this.selectDataMap[btId] != null && this.selectDataMap[btId][fieldId] != null && this.selectDataMap[btId][fieldId]["data"]!= null){
				listOfOptions =this._obtainListOptionsFromMap(fieldId, btId, component);
			}
			else{
				//in case was not found data for the grid. obtains from the map of the bt bt fieldId.
				if(component.parentEditableGrid == true){
					var originalFieldId = component["field-id"];
					listOfOptions =this._obtainListOptionsFromMap(originalFieldId, btId, component);
						var dataInicial =		this.selectDataMap[btId][originalFieldId]["data"];
						if(this.selectDataMap[btId][fieldId] == undefined){
							this.selectDataMap[btId][fieldId] = {};
						}
						this.selectDataMap[btId][fieldId]["data"] = dataInicial;
				}
				
			}
			if(!iso){
				component.set("options", listOfOptions);
			}
			return listOfOptions;
		},
		
		//internal and private function to obtain the correct options from the select
		_obtainListOptionsFromMap:function(fieldId,btId,component){
			var listOfOptions = [];
			var selectItems = this.selectDataMap[btId][fieldId]["data"];
			listOfOptions[0] = {value : "" , label : dojo.config.fisaSelectLabel, selected:true};
			dojo.forEach(selectItems, function(item, index){
				listOfOptions[index+1]  = {value : "" + item[component.valueColumn], label : item[component.labelColum]};
			},this);
			return listOfOptions;
		},
		
		findComboBoxOptions:function(btId, fieldId){
			var outcome = null;
			if(this.selectDataMap && this.selectDataMap[btId][fieldId]["data"]){
				outcome = this.selectDataMap[btId][fieldId]["data"];
			}
			return outcome;
		},
		findDescription:function(btId, fieldId, value){
			var outcome = "";
			var optionsData = this.findComboBoxOptions(btId, fieldId);
			if(optionsData){
				dojo.forEach(optionsData, function(row){
					if(value == row[0]){
						outcome = row[1];
					}
				});
			}
			return outcome;
		},
		setBreadcrumb:function(breadcrumb){
			this.breadcrumbId = breadcrumb.id;
		}, 
		/** only for documents opened in qt */
		setQtDocBreadcrumb:function(component){
			var breadCrumb=ec.fisa.controller.utils.findCurrentBreadCrumb(component);
			if(breadCrumb){
				this.breadcrumbId=breadCrumb.id;
			}
		}, 

		addFieldRoutineEvent: function(component, actionMode){
			var eid=component["bt-id"];
			var fid=component["field-id"];
			component.fw = this;
			// TODO: VERIFICAR QUE OTROS MODOS NO AÑADEN FIELDROUTINE EVENT.
			if(actionMode!='QY' && actionMode!='DE'){
				if( component.attachOnChangeEvent &&  lang.isFunction(component.attachOnChangeEvent)){	
					component.attachOnChangeEvent(this,eid, fid, actionMode);
				}
				else{
					//verify if this is called at all 
//					component.connect(component,"onChange", function (){
//						if(this._fStarted){
//							this.fw.executeFieldRoutines(eid, fid,actionMode, component.id);
//						} else {
//							this._fStarted=true;
//						}
//					});
				}
			}
		},
		attachCCYFormatEvent : function(component,actionMode){
			var eid=component["bt-id"];
			component.fw = this;
			if(actionMode!='QY' && actionMode!='DE'){
				component.connect(component,"onChange", function (){
					this.fw.formatCCYRelatedField(eid, component,true);
				});
			}
		},
		executeFieldRoutines:function(btId, fieldId,  actionMode, componentId){
			this.clearPanelMessage();
			var callObj = {
					callbackScope : this
			};
			callObj.callback = function(outcome) {
				this.handleCallBackBackFieldRoutine(outcome,true);
			};
			callObj.errorHandler = dojo.hitch(this,this.errorHandler);
			var fm = this.model.toPlainObject();
			EventActionDWR.executeFieldRoutines(this.tabId,this.pageScopeId,btId, fieldId, actionMode,fm,componentId,callObj);
		},
		
		//handles component on change routine and notify combo to change
		handleOnChangeComponent:function(fieldId,btId,routineActionMode,notifyComboId,isARoutineField,
				comboSelectedIndex,parentEditableGrid,entityMrId,/*Number indice real de la grilla*/gridRealRowIndex){
			this.clearPanelMessage();
			var model =this.model.toPlainObject();
			if(parentEditableGrid == true && entityMrId != undefined && entityMrId != null){
				//updates the model of the mr to the model of the bt
				var btTables=this.tableRegistry[btId];
				if(btTables!=null){
					var ftableId=btTables[entityMrId];
					if(ftableId!=null){
						var ftable= dijit.byId(ftableId);
						
						var modelMulti = null;
						
						//mr editable direct
						if(dojo.isArray(ftable.model) == true){
							var modelTable =	ftable.model[gridRealRowIndex];
							if(modelTable != undefined && modelTable != null){
								modelMulti = modelTable.toPlainObject();
									}
						}else{
							//mr editable normal
							modelMulti =ftable.model.toPlainObject();
						}
						//add the current row data multi to the model-> this is used
						//ath onchangecomponent cause the input params are not looking 
						if(modelMulti != null && model != null){
						dojox.lang.functional.forIn(modelMulti,dojo.hitch(this,function(value,fId){
							
							var fields=	model[btId]["dataMessage"]["fields"];
							fields[fId] = {value:value};
							
							//this.model.setValue([btId,'dataMessage','fields',fId,'value'],value);
						}));
						}
					}
				}
			}
			
			var callObj = {
					callbackScope : {"ctrl":this,"notifyComboId":notifyComboId,"gridRealRowIndex":gridRealRowIndex}};
			callObj.callback = this.handleCallBackOnChangeComponent;
			callObj.errorHandler = dojo.hitch(this,this.errorHandler);
			EventActionDWR.handleOnChangeComponent(this.tabId,this.pageScopeId,fieldId,btId,routineActionMode,model,notifyComboId,isARoutineField,comboSelectedIndex,parentEditableGrid,gridRealRowIndex,callObj);

		},
		
		//handles onCallBack on change component.
		handleCallBackOnChangeComponent:function(outcome){
			var aMsgs = outcome.aMsgs;
			// if msgs came from onchange an error ocurred
			if(outcome.wAxn=="error"){
				//added to avoid duplicate message
				this.ctrl.clearPanelMessage();
				this.ctrl.updateMsgsPanel(aMsgs);
				//<< JCVQ Se aplica este cambio para que se limpie el campo que lanzó la rutina en caso de que se presenten errores en la ejecución de la rutina invocada.
				outcome.wAxn = "refresh";
				dojo.hitch(this.ctrl,this.ctrl.handleCallBackBackFieldRoutine(outcome));
				return;
				//>>
			}
			
			if(outcome.wAxn == "refresh_dataType"){
				//show errors and updates the bt.
				//added to avoid duplicate message
				this.ctrl.clearPanelMessage();
				this.ctrl.updateMsgsPanel(aMsgs);
				outcome.wAxn = "refresh";
				// if has routines.
				dojo.hitch(this.ctrl,this.ctrl.handleCallBackBackFieldRoutine(outcome));
				
			}
			else{
				// if has to update combos.
				if(outcome.dataUpdate!= null &&outcome.dataUpdate != undefined){
					var comboIdMap =	outcome.dataUpdate;
					if(comboIdMap != null && comboIdMap != undefined){
						dojox.lang.functional.forIn(comboIdMap,dojo.hitch(this,function(data,/* key */notifyComboId){
							this.ctrl.updateSelectByOutcome(notifyComboId,data,this.ctrl,this.gridRealRowIndex);
						}));
					}
				}
				
				
				
				// needs to update a multiregister values.
				if(outcome.multiMsg != null && outcome.multiMsg != undefined && outcome.multiRegisterEntity != undefined && outcome.multiRegisterEntity != null){
					var mAffectedFieldData = outcome.multiMsg;
					var entity=	outcome.multiRegisterEntity;
					dojox.lang.functional.forIn(mAffectedFieldData,dojo.hitch(this,function(ftm,btId){
						if(this.ctrl.model.contains([btId])){

							var btTables=this.ctrl.tableRegistry[btId];
							if(btTables!=null){
								var ftableId=btTables[entity];
								if(ftableId!=null){
									var ftable= dijit.byId(ftableId);
									var modelMulti = null;
									if(dojo.isArray(ftable.model) == true){
										var modelTable =	ftable.model[this.gridRealRowIndex];
										if(modelTable != undefined && modelTable != null){
											modelMulti = modelTable;
										}
									}
									else{
										modelMulti = ftable.model;
									}
									var ftmFlds =ftm.dataMessage.fields;
									dojox.lang.functional.forIn(ftmFlds,dojo.hitch(this,function(f,fId){

										modelMulti.setValue([fId],f.value, false);

									}));

								}
							}


						}
					}));
				}

				// if has routines.
				dojo.hitch(this.ctrl,this.ctrl.handleCallBackBackFieldRoutine(outcome));
			}
		},
		
		//update combo with new value
		updateSelectByOutcome:function(notifyComboId,data,ctrl,gridRealRowIndex){
				var selectData =  data;
				var selectId = ctrl.selectIdMap[notifyComboId];
				if(gridRealRowIndex != undefined &&  gridRealRowIndex != null){
				var selectIdRow = ctrl.selectIdMap[notifyComboId+"|"+gridRealRowIndex];
				//add to the map the one needed
				if(selectIdRow == undefined || selectIdRow == null){
					 ctrl.selectIdMap[notifyComboId+"|"+gridRealRowIndex] =selectId;
				}
				else{
					selectId = selectIdRow;
				}
				}
				
				var component = dijit.byId(selectId);
				var btId = component["bt-id"];
				var fieldId = component["field-id"];
				//gridrealrowindex -- indicates that must update a mr combo.
				if(gridRealRowIndex != undefined && gridRealRowIndex != null){
					fieldId = fieldId+"|"+gridRealRowIndex;
				}
				ctrl.selectDataMap[btId][fieldId]["data"] = selectData;
				
				component.setControlValue("");
				component.removeOption(component.getOptions());
				ctrl.loadSelectData(component);
				//component.set("value","",false);
			
		},
		
		formatCCYRelatedField:function(btId,  component, propagateOnChangeEvent ){
			var ccyFields = component.CCYDependentFields;
			var currencyCode = component.get('value');
			var callObj = {
					callbackScope : this
			};
			callObj.callback = function(outcome) {
				this.handleCallBackBackFormatCCYRelatedField(outcome,ccyFields,btId,propagateOnChangeEvent);
			};
			callObj.errorHandler = dojo.hitch(this,this.errorHandler);
			EventActionDWR.getCurrencyPatternByCode(currencyCode,callObj);
			
		},
		
		handleCallBackBackFormatCCYRelatedField: function(outcome,ccyFields,btId,propagateOnChangeEvent) {
			var m = this.model;
			var patternCCY = outcome.CCYPattern;
			dojo.forEach(ccyFields,function(fieldId, index){
				if(m._fldDta[btId].dataMessage.fields[fieldId]){
					var cmpId = m._fldDta[btId].dataMessage.fields[fieldId].value._cmpId;
					var dComp = dijit.byId(cmpId);
					//console.debug('valor antes de getValue' + dComp._componentNode._componentNode.textbox.value);
					//console.debug('_lastValueReported antes de reformatear' + dComp._componentNode._componentNode._lastValueReported);
					var valueToReFormat= dComp.get('value');
					//console.debug('valueToReFormat' + valueToReFormat);
					dComp._componentNode._componentNode.numericFormat=patternCCY;
				    dComp._componentNode._componentNode.set("constraints", {pattern: patternCCY });
					dComp._setValueAttr(valueToReFormat,propagateOnChangeEvent);
					//console.debug('valor despues de reformatear' + dComp._componentNode._componentNode.textbox.value);
				}
			});
		},
		
		
		handleCallBackBackFieldRoutine: function(outcome,nf) {
			this.showMessages(outcome);
			if(outcome.wAxn=="refresh"){
				if(this.model&&outcome&&outcome.msg){
					//TODO: ESTE CAMPO BORRABA LA DATA INICIAL, CUANDO EL OUTCOME.MSG VIENE VACIO. FAVOR VERIFICAR FUNCIONAMEINTEO
					//ROMPIA CON FUNCIONAMIENTO DE BTGROUPS AL DESAPARECER LA DATA.
					//this.data=outcome.msg;
					affectedFieldData = outcome.msg;
					dojox.lang.functional.forIn(affectedFieldData,function(ftm,btId){
						if(this.model.contains([btId])){
							var ftmFlds = null;
							if(typeof ftm.dataMessage==="undefined"){
								//Esto se utiliza en la respuesta de los multiregistros editables
								ftmFlds =ftm;
							}else{
								ftmFlds =ftm.dataMessage.fields;
							}
							dojox.lang.functional.forIn(ftmFlds,function(f,fId){
								// MANTIS 0014774 - JG: se agrega verificacion de nulo en las 2 condiciones
								if(f!=null&&f.multivalue===true){
									var btTables=this.tableRegistry[btId];
									if(btTables!=null){
										var ftableId=btTables[fId];
										if(ftableId!=null){
											var ftable= dijit.byId(ftableId);
											ftable.model = null;
											ftable.refresh();
										}
									}
								}else if(f!=null&&f.multivalue===false){
									var priorityChange = false;
									//means its a lov.
									if(this.lovData != undefined && this.lovData[btId] != undefined && this.lovData[btId][fId] != undefined){
										// if ist lov provoke intentionally a change.
										if(outcome && outcome.priorityChange && outcome.priorityChange === "false"){
											priorityChange = false;
										} else {
											priorityChange = true;
										}
									}else if(outcome && outcome.priorityChange && outcome.priorityChange === "true"){
										//Ingresa por aquí cuando se está seleccionando un beneficiario (Transferencias)
										priorityChange = true;
									}
									
									
									this.model.setValue([btId,'dataMessage','fields',fId,'value'],f.value, priorityChange);
									this.model.setValue([btId,'dataMessage','fields',fId,'complement'],f.complement);
									if(f.enabled != undefined && f.enabled != null){
										this.setFieldModelEnabled(btId,fId,f.enabled);
									}
								}
							},this);
						}
					},this);
				}
			}
			//if came open list
			if(outcome.openListUpdate != null && outcome.openListUpdate != undefined){
				var openListFieldId = outcome.openListUpdate;
				dojo.forEach(openListFieldId,dojo.hitch(this,function(openListFid){
						var widgtId=	this.openListIdMap[openListFid];
						var olfw = dijit.byId(widgtId);
						//refresh data with the last changes of bt
						if(olfw != null){
						olfw.refreshDataBt();
						}
				}));
			}
//			if(nf&&lastFocusWidget!=null&&ec.fisa.widget.utils.isDiferentExec()){
//			ec.fisa.widget.utils.execFocused(lastFocusItem);
//			}
		},
		showMessages : function(outcome) {
			if (outcome != null) {
				this.clearPanelMessage();
				this.updateMsgsPanel(outcome.aMsgs);
			}
		},
		clearPanelMessage:function(){
			if(this.messagesPanelId){
				var messagesPanel = dijit.byId(this.messagesPanelId);
				messagesPanel.clearAllMessages();
				this.model.clearAllMessages();
			}
		},

		/** Next sequence action to validate, then navigate to next value. */
		sequenceNextAction:function(callerCmp ){
			var previousButton = callerCmp["previous_button"];
			var messagesPanel = dijit.byId(this.messagesPanelId);
//			if(messagesPanel.messagesPanelEmpty() === false && callerCmp["fisa-action-id"] != "QY" && callerCmp["fisa-action-id"] != "HD" && previousButton == undefined){
//				console.log("ERROR AT THE BT DO NOTHING! UNTIL FIXED.");
//				return;
//			}
			this.clearPanelMessage();
			if(callerCmp&&callerCmp["next_step"]){
				var nextStep = callerCmp["next_step"];
				var sequenceId = callerCmp["seq_id"];
				var action = callerCmp["fisa-action-id"];
				var btId = callerCmp["fisa-bt-id"];
				var tabId = callerCmp["tab_id"];
				var pageScopeId =  callerCmp["page_scope_id"];
				var isLastBt = callerCmp["is_last_bt"];
				var isSequence = callerCmp["is_sequence"];
				var hasDocuments = callerCmp["has_documents"];
				var showDocuments = callerCmp["show_documents"];
				var isAcceptButton = callerCmp["accept_button"];
				var hasConfirmationBt = callerCmp["has_confirmation_bt"];
				var showConfirmation = callerCmp["show_confirmation"];
				var nextButton = callerCmp["next_button"];
				var sequenceMode = callerCmp["sequence_mode"];

				var sequenceStep = callerCmp["sequence_step"];
				var holdButton = callerCmp["hold_button"];
				
				//Mantis 18073 
				var isScheduling = callerCmp["is-scheduling"];
				var periodicityId = callerCmp["sch-frequency"];

				this.sequenceMode = sequenceMode;
				this.isSequence = isSequence;
				this.sequenceId=sequenceId;
				this.nextStep=nextStep;
				this.tabId = tabId;
				this.pageScopeId = pageScopeId;
				this.hasDocuments = hasDocuments;
				this.showDocuments = showDocuments;
				this.hasConfirmationBt = hasConfirmationBt;
				this.showConfirmation = showConfirmation;
				this.previousButton = previousButton;
				this.actionMode = action;
				this.sequenceStep = sequenceStep;

				var fm = this.model.toPlainObject();
				var callObj={callbackScope:this};
				callObj.errorHandler=dojo.hitch(this,this.errorHandler);

				// indicates that documents was shown.
				if(showDocuments != null && showDocuments == "true" && showConfirmation == "null"){
					if((holdButton!= null && holdButton == "true") || isAcceptButton=="true" || nextButton =="true"){
						callObj.callback=this.handleNextSequence;
						EventSequenceActionDWR.validateDocuments(this.tabId,this.pageScopeId,sequenceId,action,fm,callObj);
					}else{
						// is for going back
						ec.fisa.navigation.utils.navigateSequenceFromDocTo(sequenceId,nextStep,this.btContentPaneId,this.tabId , this.pageScopeId,this.sequenceMode,this.previousButton,"true");	
					}
				}
				// shows confirmation bt.
				else if(showDocuments == "null" && showConfirmation == "true"){
					if(isAcceptButton!= null && isAcceptButton == "true"){
						this.verifyAfterSecurityLast(sequenceId);
					}else{
						if(hasDocuments == "true"){
							this.sequenceHasDocumentsAction(sequenceId,this.previousButton);
						}
						else{
							// is for going back
							ec.fisa.navigation.utils.navigateSequenceTo(sequenceId,nextStep,this.btContentPaneId,this.tabId , this.pageScopeId,this.sequenceMode,this.previousButton);
						}
					}
				}
				// only core sequence shown.
				else{
					callObj.callback=this.handleNextSequence;
					var notificationVal = this._addNotificationValData();
					
					
					// if it is the last bt call to validate all the bt in the
					// fm.
					if(isLastBt == "true"){
						EventSequenceActionDWR.validateBtInSequence(this.tabId,this.pageScopeId,btId,sequenceId,action,fm,true,nextButton,previousButton,null,this.sequenceMode,notificationVal,isScheduling,periodicityId,callObj);
					}
					else{
						EventSequenceActionDWR.validateBtInSequence(this.tabId,this.pageScopeId,btId,sequenceId,action,fm,false,nextButton,previousButton,nextStep,this.sequenceMode,notificationVal,isScheduling,periodicityId,callObj);
					}
				}
			}
		},
		handleNextSequence:function(outcome){
//			if(this.model&&outcome&&outcome.ftMsgs){
//			this.data=outcome.ftMsgs;
//			dojox.lang.functional.forIn(this.data,function(ftm,prop){
//			if(this.model.contains([prop])){
//			var ftmFlds =ftm.dataMessage.fields;
//			dojox.lang.functional.forIn(ftmFlds,function(f,fId){
//			this.model.setValue([prop,'dataMessage','fields',fId,'value'],f.value);
//			this.model.setValue([prop,'dataMessage','fields',fId,'complement'],f.complement);
//			},this);
//			}
//			},this);
//			}
			this.handleSeqNextAction(outcome,this.sequenceId, this.nextStep);
		},
		/**
		 * Depending of the outcome object take the necesary path of error
		 * confirm , or documents, confirmBt.
		 */
		handleSeqNextAction:function(outcome , /* String */sequenceId,/* String */ nextStep){
			if(outcome.wAxn=="cnfrm"){
				
				this.verifyAfterSecuenceSecurity(sequenceId,nextStep);
				
			} else if(outcome.wAxn=="error"){
				this.updateMsgsPanel(outcome.aMsgs);
			}  else {
				alert("unknown action!");
			}
		},
		/** Handles the action internally, when action is confirm.*/
		_handleSeqNextActionInternal:function(/* String */sequenceId,/* String */ nextStep){
			var messagesPanel = dijit.byId(this.messagesPanelId);
			messagesPanel.clearAllMessages();
			this.model.clearAllMessages();
			// ec.fisa.navigation.utils.showMsgCloseCurrentBreadCrumb(outcome.aMsgs[0].summary,outcome.aMsgs[0].summary,this.breadcrumb);
			if(nextStep == "null"){ 
				// indicates last step.
				// verify this. ( in this case is for sequence.)
				if(this.hasDocuments == "true" && this.showDocuments == "null"){
					this.sequenceHasDocumentsAction(sequenceId,this.previousButton);
				}
				else if(this.hasDocuments == "true" && this.showDocuments == "true" && this.hasConfirmationBt == "true"){
					this.sequenceHasConfirmationAction(sequenceId,this.previousButton);
				}
				else if(this.hasConfirmationBt == "true" && this.showConfirmation == "null"){
					this.sequenceHasConfirmationAction(sequenceId,this.previousButton);
				}
				else{
					this.sequenceLastAction(sequenceId);
				}
			}else{
				ec.fisa.navigation.utils.navigateSequenceTo(sequenceId,nextStep,this.btContentPaneId,this.tabId , this.pageScopeId,this.sequenceMode,this.previousButton);
			}
		},
		
		sequencePrevAction:function(callerCmp){
			var messagesPanel = dijit.byId(this.messagesPanelId);
			messagesPanel.clearAllMessages();
			this.model.clearAllMessages();
			if(callerCmp&&callerCmp["prev_step"]){
				var nextStep = callerCmp["prev_step"];
				var sequenceId = callerCmp["seq_id"];
				var tabId = callerCmp["tab_id"];
				var pageScopeId =  callerCmp["page_scope_id"];
				ec.fisa.navigation.utils.navigateSequenceTo(sequenceId,nextStep,this.btContentPaneId,tabId,pageScopeId,this.previousButton);
			}
		},
		/** called at the end of the sequence */
		sequenceLastAction:function(/* String */sequenceId){
			var callObj={callbackScope:this};
			callObj.errorHandler=dojo.hitch(this,this.errorHandler);
			// Para acciones
			// "IN"==action||"DE"==action||"UP"==action||"HD"==action
			callObj.callback=this.handleInAction;

			var valueTemplate = false;
			if(this.saveAsTemplateChckBoxId != null){
				var checkBoxSt = dijit.byId(this.saveAsTemplateChckBoxId);
				if(checkBoxSt.get('checked') == true){
					valueTemplate = true;
				}
			}
			EventSequenceActionDWR.callExecAction(this.tabId,this.pageScopeId,sequenceId,this.sequenceMode,this.actionMode,this.sequenceStep,valueTemplate,this.templateOverCall,callObj);
		}
		,

		/** Actions to be called from the popup of the last action template */
		sequenceTemplateLastAction:function(sequenceId,templateOverCall){
			this.templateOverCall = templateOverCall;
			this.sequenceLastAction(sequenceId);
		},
		/** Handles if the sequence has documents. */
		sequenceHasDocumentsAction:function(/* String */sequenceId,/* String */previousButton){
			var url = "";
			url = dojo.config.fisaContextPath;
			url += "/";
			url += "BUSINESS_TEMPLATE";
			url += "/";
			url += sequenceId;
			url += "/FISATabId/";
			url += this.tabId;
			url += "/FisaPageScopeId/";
			url += this.pageScopeId;
			url += "/REQUEST_SEQUENCE_DRAW_DOCUMENTS/";
			url += "true";
			url += "/SEQUENCE_PRINCIPAL_BT_MODE/";
			url += this.sequenceMode;
			if(previousButton === "true"){
				url += "/PREVIOUS_BUTTON_CLICKED/";
				url += previousButton;
			}

			var newSubTabPaneArg = {};
			// newSubTabPaneArg.title=title;
			// newSubTabPaneArg.iconClass="breadcrumbIcon";
			newSubTabPaneArg.href=url;
			// newSubTabPaneArg.postClose = this.cargarTareas2;
			// newSubTabPaneArg.postCloseScope = this.id;
			// newSubTabPaneArg.postCloseArgs = [this.tabId];
			ec.fisa.navigation.utils.updateCurrentBreadCrumb(newSubTabPaneArg, this.btContentPaneId,this.tabId, this.pageScopeId);

		},

		/**
		 * Handles if the sequence has a confirmation bt just before call
		 * process engine and execute the fisa message.
		 */
		sequenceHasConfirmationAction:function(/* String */sequenceId,/* String */previousButton){
			var url = "";
			url = dojo.config.fisaContextPath;
			url += "/";
			url += "BUSINESS_TEMPLATE";
			url += "/";
			url += sequenceId;
			url += "/FISATabId/";
			url += this.tabId;
			url += "/FisaPageScopeId/";
			url += this.pageScopeId;
			url += "/REQUEST_SEQUENCE_DRAW_CONFIRMATION/";
			url += "true";
			url += "/SEQUENCE_PRINCIPAL_BT_MODE/";
			url += this.sequenceMode;
			if(previousButton === "true"){
				url += "/PREVIOUS_BUTTON_CLICKED/";
				url += previousButton;
			}

			var newSubTabPaneArg = {};
			// newSubTabPaneArg.title=title;
			// newSubTabPaneArg.iconClass="breadcrumbIcon";
			newSubTabPaneArg.href=url;
			// newSubTabPaneArg.postClose = this.cargarTareas2;
			// newSubTabPaneArg.postCloseScope = this.id;
			// newSubTabPaneArg.postCloseArgs = [this.tabId];
			ec.fisa.navigation.utils.updateCurrentBreadCrumb(newSubTabPaneArg, this.btContentPaneId,this.tabId, this.pageScopeId);

		},
		isComponentMsg:function(message){
			return (('fieldId' in message)&&('ftmId' in message)&&(message.fieldId!=null)&&(message.fieldId!="")&&(message.ftmId!=null)&&(message.ftmId!=""));
		},
		/**
		 * Search the field, and in the model mvc obtains the id
		 * and sets the message for field.
		 * */
		addComponentMsg:function(message){
			var fieldFind=	this.model.setMessage([message.ftmId,'dataMessage','fields',message.fieldId,'value'],message.fieldMsg, message.origLevel);
			return fieldFind;
		},

		saveDocumentsQtButton:function(){
			// callbackscope: object that contains variables to
			// be passed on callback methods.
			var callObj = {
					callbackScope : this
			}
			callObj.errorHandler = dojo.hitch(this,this.errorHandler);
			callObj.callback = this.saveDocumentsQtFnctnDwr;
			DocumentControllerDWR.saveDocumentAction(this.tabId,this.pageScopeId,callObj);

		},

		/** Save documents callback */
		saveDocumentsQtFnctnDwr:function(outcome){
			if(outcome.wAxn=="cnfrm"){
				var title = outcome.respBtLabels[0];
				var msg = outcome.respBtLabels[1];
				ec.fisa.navigation.utils.showNewBreadCrumbConfirmation(title,msg,this.breadcrumbId,this.tabId, this.pageScopeId,null,null,null);

			} else if(outcome.wAxn=="error"){
				this.updateMsgsPanel(outcome.aMsgs);
			}
		},
		/* Cancela y cierra la pantalla de transaccion */
		cancelDocumentsQtButton:function(){
			ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
		},
//		attachOnChangeComboBoxEvent:function(component){
//			this.initSubscription(component);
//			if(!component.hasFieldRoutineOrPolicy){//Si el combo box no tiene rutinas de campo.
//				//Cuando el combo tiene rutinas de campo, se invoca el método addFieldRoutineEvent en la misma clase Select.js
//				var publishId = this.buildPublishId(component);
//				component.connect(component,"onChange", function (){
//						topic.publish(publishId, component);
//				});
//			}
//		},
//		attachOnChangeEvent:function(component){
//			if(component && component.attachNotificationOnChangeEvent && lang.isFunction(component.attachNotificationOnChangeEvent)){
//				component.attachNotificationOnChangeEvent();
//			}else{
//				//console.log("El componente no tiene definido el método attachNotificationOnChangeEvent", component);
//			}
//		},
//		initSubscription:function(component){
//			var btId = component["bt-id"];
//			var subscription = this.subscriptions[btId];
//			if(!subscription || subscription == null){
//				subscription = topic.subscribe(this.buildPublishId(component), lang.hitch(this,this.updateDependantComponents));
//				this.subscriptions[btId] = subscription;
//			}
//		},
//		buildPublishId:function(component){
//			var btId = component["bt-id"];
//			var tabId = this["tabId"];
//			var pageScopeId = this["pageScopeId"];
//			return btId + "|" + tabId + "|"  + pageScopeId;
//		},
//		updateDependantComponents:function(){
//			var changedComboBox = arguments[0];
//			var selectedIndex = this.getSelectedIndex(changedComboBox);
//			var btId = changedComboBox["bt-id"];
//			var fieldId = changedComboBox["field-id"];
//			var data = this.selectDataMap[btId][fieldId]["data"];
//			var rowData = data[selectedIndex];
//			var tabId = changedComboBox["tabId"];
//			var pageScopeId = changedComboBox["pageScopeId"];
//			//console.log("updateDependantComponents", rowData);
//			//Actualizar los output parameters
//			this.updateOutputParams(changedComboBox, rowData);
//			//Comunica que cambió, quien este escuchando en la subscripción de la BT/QT padre
//			this.publishChange(btId, tabId, pageScopeId, changedComboBox);
//		},
		getSelectedIndex:function(component){
			var outcome = -1;
			var options = component.getOptions();
			var i = 0;
			for(i = 0 ; i < options.length; i++){
				var option = options[i];
				if(option.selected === true){
					outcome = i;
					break;
				}
			}
			return outcome - 1;//Se resta 1 ya que la primera opcion del combo es seleccione
		},
//		updateOutputParams: function(changedComboBox, rowData){
//			var outputParams = changedComboBox.findOutputParameters();
//			var complemets = changedComboBox.findComplemenParams();
//			var btId = changedComboBox["bt-id"];
//			var fieldId = "";
//			var value = "";
//			dojo.forEach(outputParams,function(outputParam, index, allOutputParams){
//				fieldId = outputParam.parameterFieldId;
//				if(rowData){
//					var colum = parseInt(outputParam.parameterQt, 10);
//					value = rowData[colum];
//					this.setFieldModelValue(btId,fieldId,value, false);
//				}else{
//					this.setFieldModelValue(btId,fieldId,"", false);
//				}
//			},this);
//			
//			dojo.forEach(complemets, function(complement, index, alComplements){
//				fieldId = complement.destParameterFieldId;
//				if(rowData){
//					var colum = parseInt(complement.parameterFieldId, 10);
//					value = rowData[colum];
//					this.setFieldModelComplement(btId, fieldId,value);
//				}else{
//					this.setFieldModelComplement(btId, fieldId,"");
//				}
//			}, this);
//		},
		fetchSelectOptions:function(selectComponentId, qtId, inputParameters, btId){
			this.clearPanelMessage();
			var callObj={callbackScope:this,errorHandler:dojo.hitch(this,this.errorHandler),callback:this.callBackFetchSelectOptions};
			var modelObject = this.model.toPlainObject();
			BtControllerDWR.loadBtSelectOptionsData(selectComponentId,btId,qtId,inputParameters,modelObject,callObj);
		},
		reloadSelectOptions:function(selectComponentId, qtId, inputParameters, btId, fieldId, tabId, pageScopeId){
			//Creada para la funcionalidad de seleccion de beneficiarios JCVQ
			this.clearPanelMessage();
			var callObj={callbackScope:this,errorHandler:dojo.hitch(this,this.errorHandler),callback:this.callBackFetchSelectOptions};
			var modelObject = this.model.toPlainObject();
			BtControllerDWR.reloadSelectOptions(selectComponentId,btId,fieldId, qtId,inputParameters,modelObject,tabId, pageScopeId, callObj);
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
				//component.set("value","");// Se comenta para usar en la selección de datos de Beneficiarios JCVQ
			}
		},
		
		//reports
		
		launchReportAuto:function(){
			this.clearPanelMessage();
			var callObj={callbackScope:this};
			callObj.errorHandler=dojo.hitch(this,this.errorHandler);
			callObj.callback=this._launchReportAutoCallBack;
			EventReportActionDWR.openReportAuto(this.tabId,this.parentConfBtPageScopeId,callObj);	
			
		},
		
		launchReportModule:function(){
			this.clearPanelMessage();
			var callObj={callbackScope:this};
			callObj.errorHandler=dojo.hitch(this,this.errorHandler);
			callObj.callback=this._launchReportModuleCallBack;
			EventReportActionDWR.openReportModule(this.tabId,this.parentConfBtPageScopeId,callObj);	
			
		},
		
		_launchReportAutoCallBack:function(outcome){
			if(outcome.wAxn=="error"){
				this.updateMsgsPanel(outcome.aMsgs);
			}
			else{
				ec.fisa.navigation.utils.showNewReportBreadCrumb(outcome.responseReportLabels.title,
						this.breadcrumbId,this.tabId,this.parentConfBtPageScopeId,outcome.responseReportUrl,
						outcome.responseShowNextReportButton ,outcome.responseShowEndReportButton);
			}
		},
		
		_launchReportModuleCallBack:function(outcome){
			if(outcome.wAxn=="error"){
				this.updateMsgsPanel(outcome.aMsgs);
			}
			else{
				ec.fisa.navigation.utils.showNewReportBreadCrumb(outcome.responseReportLabels.title,
						this.breadcrumbId,this.tabId,this.parentConfBtPageScopeId,outcome.responseReportUrl,
						null,null);
			}
		},
		///SETS DOCUMENT WIDGET ID
		setDocumentContentPaneWdgId:function(documentContentPaneWdgId){
			this.documentContentPaneWdgId = documentContentPaneWdgId;
		},
		/*sets tab container*/
		setBtTabContainerId:function(btTabContainerId){
			this.btTabContainerId = btTabContainerId;
			var tabs = dijit.byId(btTabContainerId);
			tabs.tabId = this.tabId;
			tabs.pageScopeId = this.pageScopeId;
			

			aspect.around(tabs, "selectChild", function(selectChild) {
				return function(page) {
					//only in change tab
					if(this.selectedChildWidget != page){
						
						var btActionMode = this.selectedChildWidget["action_mode"];
						var btId = this.selectedChildWidget["field-id"];
					
						var btController = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
						btController.clearPanelMessage();
						if(btController.model != null){
							btController.model.clearAllMessages();
						}
						var callObj={callbackScope:{btController:btController,selectChild:selectChild,arguments:arguments,tabContainer:this}};
						callObj.errorHandler=dojo.hitch(btController,btController.errorHandler);
						callObj.callback=btController._updatedFtmLaunchCallBack;
						var fm = btController.model.toPlainObject();
						
						EventActionDWR.validateBtKeys(fm,this.tabId,this.pageScopeId,btActionMode,btId,callObj);	
					}	
					
				}
			});
		},
		
		//call back function after being ftm updated
		_updatedFtmLaunchCallBack:function(outcome){
			if(outcome.wAxn=="open"){
						 this.selectChild.apply(this.tabContainer, this.arguments);
			} else if(outcome.wAxn=="error"){
				this.btController.updateMsgsPanel(outcome.aMsgs);
			}
		},
		
		refreshTableRegistry:function(){			
			
			for (var parentBtId in this.tableRegistry ){				 
				for (var parentEntityId in this.tableRegistry[parentBtId] ){					  
					var ttr = dijit.byId(this.tableRegistry[parentBtId][parentEntityId]);
						if (ttr != undefined && ttr != null) {
							ttr.refresh();
						}					
				}
			}
		},
		//updates the sequence button data, cause in schedule the sequence is contained.
		updateBtSequenceButtonScheduleData:function(cmp){
			this.sequenceBtScheduleButtonData = cmp;

			//obtain parent controller.
			var pageParentScopeId = this.pageScopeId;
			pageParentScopeId = pageParentScopeId.replace("_resourceIn","");
			var btSchedulingController =  ec.fisa.controller.utils.getPageController(this.tabId,pageParentScopeId);

			var prevbId = btSchedulingController.sequencePrevButtonId;
			var nextbId = btSchedulingController.sequenceNextButtonId;
			
			var acceptBtId = btSchedulingController.schedulingAcceptButtonId;

			if(prevbId != undefined && prevbId != null && nextbId != undefined && nextbId != null && acceptBtId != undefined && acceptBtId != null)
			{
				var prevButton = dijit.byId(prevbId);
				var nextButton = dijit.byId(nextbId);
				var acceptButton = dijit.byId(acceptBtId);
				
				var showPrevButton =cmp['showPrevButton'];
				var showNextButton =cmp['showNextButton']; 
				var showAcceptButton = cmp['showAcceptButton'];

				if(showPrevButton == 'true'){
					domStyle.set(prevButton.domNode,"display","block");
				}
				else{
					domStyle.set(prevButton.domNode,"display","none");
				}

				if(showNextButton == 'true'){
					domStyle.set(nextButton.domNode,"display","block");
				}
				else{
					domStyle.set(nextButton.domNode,"display","none");
				}
				
				
				if(showAcceptButton == 'true'){
					domStyle.set(acceptButton.domNode,"display","block");
				}
				else{
					domStyle.set(acceptButton.domNode,"display","none");
				}


			}
			
		},
		//schedule prev button actions.
		schedulePrevButtonAction:function(){
			var cloneData=	lang.clone(this.sequenceBtScheduleButtonData);
			//in prev the data came from prev.
			cloneData['next_step'] = cloneData['prev_step'];
			cloneData['is_last_bt'] ='false';
			cloneData['previous_button'] = 'true';
			this.sequenceNextAction(cloneData);	
		},
		
		//schedule next button actions.
		scheduleNextButtonAction:function(currentComponent){
			if(currentComponent !== undefined){
				var parentController = ec.fisa.controller.utils.getPageController(currentComponent["tab-id"], currentComponent["pagescope-id"]);
				this.sequenceBtScheduleButtonData["is-scheduling"] = true;
				this.sequenceBtScheduleButtonData["sch-frequency"] = parentController.model.getValue(["frequency","value"]);
			}
			
			var cloneData=	lang.clone(this.sequenceBtScheduleButtonData);
				cloneData['next_button']='true'; 
			this.sequenceNextAction(cloneData);	
		},
		removeCurrentMRFromOutcome:function(/*Mapa de resultados de la ejecución de un metodo DWR*/outcome,/*Grid no editable*/grid){
			//HD19508 JCVQ
			if(outcome.msg!=null&&outcome.msg[grid.btId]&&outcome.msg[grid.btId][grid.entId]){
				delete outcome.msg[grid.btId][grid.entId];
			}
			return outcome;
		}
		
		
		
		
		
});
	return BtController;
});

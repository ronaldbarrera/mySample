define([ "dijit/_Widget", 
        "dojo/_base/declare",
        "dojo/_base/lang",
        "ec/fisa/controller/mobile/BaseController",
        "ec/fisa/format/Utils",
        "ec/fisa/navigation/Utils",
        "dojo/dom-construct",
        "ec/fisa/widget/DocumentActions",
        "ec/fisa/mvc/StatefulModel",
        "dojo/on",
        "ec/fisa/controller/custom/QtController",
        "ec/fisa/mobile/widget/_MvcMixin",
        "ec/fisa/dwr/proxy/EventSequenceActionDWR",
        "ec/fisa/widget/DialogSecurity",
        "./_base",
        "dojox/lang/functional/object",
        "ec/fisa/dwr/proxy/BtControllerDWR",
        "ec/fisa/dwr/proxy/EventReportActionDWR",
        "ec/fisa/dwr/proxy/RuleFieldSelectorControllerDWR",
        "dojox/lang/functional"
        ],function(_Widget,declare,lang,BaseController,formatUtils,navigationUtils
        		,domConstruct,DocumentActions,
        		StatefulModel,on, QtController, MvcMixin,ContentPane){

	var BtController = declare("ec.fisa.mobile.widget.BtController", [_Widget,BaseController,MvcMixin], {
		fisatabid:"",
		fisapageid:"",
		btId:'',
		data:null,
		initData:"",
		initMsgs:"",
		selectData:"",
		selectDataMap:"",
		lovData:"",
		btActionMode:"",
		isSequence:false,
		//this is for security it has the factors applied to the bt.
		secBeforeListFactor:"",
		secAfterListFactor:"",
		initLabels:null,
		parentConfBtPageScopeId:null,
		sequenceDontInitiateBt: false,
		contextPath:dojo.config.fisaContextPath,
		/*TEMPLATE*/
		saveAsTemplateChckBoxId:null,
		tableRegistry:null,
		model:null,
		/*notification widget*/
		notificationAdditionalsWdgId:null,
		subscriptions:null,
		selectIdMap:null,
		initializer:"",
		btContentPaneId:"",
		sequence_mode:"",
		ftype:'',
		
		constructor: function () {
			this.tableRegistry={};
			this.model=new StatefulModel({});
			this.notificationAdditionalsWdgId=[];
			this.subscriptions = {};
			this.selectIdMap = {};
		},
		
		postMixInProperties:function(){
			this.inherited(arguments);
			if(this.isSequence){
				var controller = ec.fisa.controller.utils.getPageController(this.fisatabid,this.fisapageid);
				if(controller!=null){
					controller =null;
					ec.fisa.controller.utils.uninitializeController(this.fisatabid,this.fisapageid);
				}
			}
			ec.fisa.controller.utils.initPageController(this.fisatabid,this.fisapageid,this,true);
			
			
			this.addParamToModel(this,false);	
			var funct = new Function(this.initializer);
			this.initializer = null;
			var init = funct.call();
			funct = null;
			this.initData = init.initData;
			this.data = this.initData;
			this.initMsgs = init.initMsgs;
			this.selectData=init.selectData
			this.selectDataMap = init.selectDataMap;
			this.lovData = init.lovData;
			this.btActionMode = init.btActionMode;
			this.secBeforeListFactor = init.secBeforeListFactor;
			this.secAfterListFactor = init.secAfterListFactor;			
			var viewPort = dijit.byId("viewPort");
			if(viewPort != null || viewPort != undefined){
				this.btContentPaneId = viewPort.containerNode.children[0].id;
				viewPort.fisaTabId = this.fisatabid
			}
		},
		
		copyInitData: function (fisatabid,fisapageid,initData,initMsgs,selectDataMap,lovData,secBeforeListFactor,secAfterListFactor,initLabels) {
			
			this.fisatabid=tabId;
			this.fisapageid=pageScopeId;
			this.initData=initData;
			this.data = initData;
			this.initMsgs=initMsgs;
			this.selectDataMap=selectDataMap;
			this.lovData=lovData;
			this.tableRegistry={};
			this.model=new StatefulModel({});
			this.notificationAdditionalsWdgId=[];
			this.secBeforeListFactor = secBeforeListFactor;
			this.secAfterListFactor = secAfterListFactor;
			this.initLabels = initLabels;
//			this.verifyBeforeSecurity();
			this.subscriptions = {};
		},
		
		renewInitData:function(initData){
			this.initData=initData;
		},
		loadSelectData:function(component,ignoreSetOptions) {
			var iso=ignoreSetOptions||false;
			var btId = component["bt-id"];
			var fieldId = component["field-id"];
			var listOfOptions = [];
			if(this.selectDataMap && this.selectDataMap[btId]
				&& this.selectDataMap[btId][fieldId]["data"]){
				var selectItems = this.selectDataMap[btId][fieldId]["data"];
				listOfOptions[0] = {value : "" , label : dojo.config.fisaSelectLabel, selected:true};
				dojo.forEach(selectItems, function(item, index){
					listOfOptions[index+1]  = {value : "" + item[component.valueColumn], label : item[component.labelColum]};
				},this);
			}
			if(!iso){
				component.set("options", listOfOptions);
			}
			return listOfOptions;
		},
		
		/** Next sequence action to validate, then navigate to next value. */
		sequenceNextAction:function(callerCmp ){
			var previousButton = callerCmp["previous_button"];
			var messagesPanel = dijit.byId(this.messagesPanelId);
			this.clearPanelMessage();
			if(callerCmp&&callerCmp["next_step"]){
				var nextStep = callerCmp["next_step"];
				var sequenceId = callerCmp["seq_id"];
				var action = callerCmp["fisa-action-id"];
				var btId = callerCmp["fisa-bt-id"];
				var tabId = callerCmp["fisatabid"];
				var pageScopeId =  callerCmp["fisapageid"];
				var isLastBt = callerCmp["is_last_bt"];
				this.isLastBt = isLastBt;/*Jonathan G: variable para usarla en messagePanel*/
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

				this.sequenceMode = sequenceMode;
				this.isSequence = isSequence;
				this.sequenceId=sequenceId;
				this.nextStep=nextStep;
				this.fisatabid = tabId;
				this.fisapageid = pageScopeId;
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
				if(showDocuments && showConfirmation == null){
					if(holdButton || isAcceptButton || nextButton){
						callObj.callback=this.handleNextSequence;
						EventSequenceActionDWR.validateDocuments(this.fisatabid,this.fisapageid,sequenceId,action,fm,callObj);
					}else{
						// is for going back
						ec.fisa.mobile.navigation.utils.navigateSequenceFromDocTo(sequenceId,nextStep,this.btContentPaneId,this.fisatabid , this.fisapageid,this.sequenceMode,this.previousButton,"true");	
					}
				}
				// shows confirmation bt.
				else if(showDocuments == null && showConfirmation){
					if(isAcceptButton){
						this.sequenceLastAction(sequenceId);
					}else{
						if(hasDocuments){
							this.sequenceHasDocumentsAction(sequenceId,this.previousButton);
						}
						else{
							// is for going back
							ec.fisa.mobile.navigation.utils.navigateSequenceTo(sequenceId,nextStep,this.btContentPaneId,this.fisatabid , this.fisapageid,this.sequenceMode,this.previousButton);
						}
					}
				}
				// only core sequence shown.
				else{
					callObj.callback=this.handleNextSequence;
					var notificationVal = this._addNotificationValData();
					
					
					// if it is the last bt call to validate all the bt in the
					// fm.
					if(isLastBt){
						EventSequenceActionDWR.validateBtInSequence(this.fisatabid,this.fisapageid,btId,sequenceId,action,fm,true,nextButton,previousButton,null,this.sequenceMode,notificationVal,callObj);
					}
					else{
						EventSequenceActionDWR.validateBtInSequence(this.fisatabid,this.fisapageid,btId,sequenceId,action,fm,false,nextButton,previousButton,nextStep,this.sequenceMode,notificationVal,callObj);
					}
				}
			}
		},
		
		handleNextSequence:function(outcome){
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
		
		addControllerRef:function(component){
			component.fc=this;
		},
		
		/**Called after the bt was shown, and before it goes to the pe.*/
		verifyAfterSecuenceSecurity:function(/* String */sequenceId,/* String */ nextStep){
			//TODO: comentado poruqe esta seccion mostraba el panel con la imagen de autenticacion
//			if(this.secAfterListFactor != null && this.secAfterListFactor != undefined 
//					&& this.secAfterListFactor.length > 0
//					&& (this.showDocuments != "true" || this.showConfirmation != "true")){
//				var thirdDlg = this.createDialogSecurityFactor(this.secAfterListFactor);
//				thirdDlg["dlgSuccessEvent"]=dojo.hitch(this,function(sequenceId,nextStep,argument){
//					this._handleSeqNextActionInternal(sequenceId,nextStep);
//				},sequenceId,nextStep);
//			}
//			else{
				this._handleSeqNextActionInternal(sequenceId,nextStep);
//			}
		},
		
		/** Handles the action internally, when action is confirm.*/
		_handleSeqNextActionInternal:function(/* String */sequenceId,/* String */ nextStep){
			var messagesPanel = dijit.byId(this.messagesPanelId);
			messagesPanel.clearAllMessages();
			this.model.clearAllMessages();
			// ec.fisa.navigation.utils.showMsgCloseCurrentBreadCrumb(outcome.aMsgs[0].summary,outcome.aMsgs[0].summary,this.breadcrumb);
			if(nextStep == null || nextStep=="null"){ 
				// indicates last step.
				// verify this. ( in this case is for sequence.)
				if(this.hasDocuments && this.showDocuments == null){
					this.sequenceHasDocumentsAction(sequenceId,this.previousButton);
				}
				else if(this.hasDocuments && this.showDocuments && this.hasConfirmationBt){
					this.sequenceHasConfirmationAction(sequenceId,this.previousButton);
				}
				else if(this.hasConfirmationBt && this.showConfirmation == null){
					this.sequenceHasConfirmationAction(sequenceId,this.previousButton);
				}
				else{
					this.sequenceLastAction(sequenceId);
				}
			}else{/*TODO: this.btContentPaneId cambiar por mi viewPort? */
				ec.fisa.navigation.utils.navigateSequenceTo(sequenceId,nextStep,this.btContentPaneId,this.fisatabid, this.fisapageid,this.sequenceMode,this.previousButton);
			}
		},
		
		//TODO: CREAR DIALOGO PARA MOBILES SIMPLEDIALOG
		/**Creates the security dialog*/
		createDialogSecurityFactor:function(/*array*/secListFactor){
			
			var dialog = new SimpleDialog({},domConstruct.create("div",{},win.doc.body));
			
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
				'style': {width: dialogStyle.w+'px', height:dialogStyle.h+'px'},
				'dlgCancelEvent':dojo.hitch(this,function(argument){
					var outcome ={wAxn:'close'};
					this.handleWindowAction(outcome);
				})
			});
			thirdDlg.show();
			return thirdDlg;
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
			EventSequenceActionDWR.callExecAction(this.fisatabid,this.fisapageid,sequenceId,this.sequenceMode,this.actionMode,this.sequenceStep,valueTemplate,this.templateOverCall,callObj);
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
			url += this.fisatabid;
			url += "/FisaPageScopeId/";
			url += this.fisapageid;
			url += "/REQUEST_SEQUENCE_DRAW_CONFIRMATION/";
			url += "true";
			url += "/SEQUENCE_PRINCIPAL_BT_MODE/";
			url += this.sequenceMode;
			if(previousButton){
				url += "/PREVIOUS_BUTTON_CLICKED/";
				url += previousButton;
			}
			var cntnPn = new dojox.mobile.ContentPane({
				href:url, 'ioArgs':'null'
			},domConstruct.create("div",{'class':'mblContentBodyClass'},ec.fisa.mobile.util.buildContentBody.call(this).containerNode));
			cntnPn.startup();
			 ec.fisa.controller.utils.resetControllerData(this.fisatabid,this.fisapageid);

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
			url += this.fisatabid;
			url += "/FisaPageScopeId/";
			url += this.fisapageid;
			url += "/REQUEST_SEQUENCE_DRAW_DOCUMENTS/";
			url += "true";
			url += "/SEQUENCE_PRINCIPAL_BT_MODE/";
			url += this.sequenceMode;
			if(previousButton === "true"){
				url += "/PREVIOUS_BUTTON_CLICKED/";
				url += previousButton;
			}
			var newSubTabPaneArg = {};
			newSubTabPaneArg.href=url;
			ec.fisa.navigation.utils.updateCurrentBreadCrumb(newSubTabPaneArg, this.btContentPaneId,this.fisatabid, this.fisapageid);

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
				//var fromAgenda = callerCmp["from-agenda"];

				this.btId = btId;
				this.btActionMode = action;
				this.isSequence = isSequence;
				//this.fromAgenda = fromAgenda;
				
				var callObj={callbackScope:this};
				callObj.errorHandler=dojo.hitch(this,this.errorHandler);
				ec.fisa.widget.utils.resetFocusManager();
				if("CANCEL"==action || "closeBt" == action){
					callObj.callback=this.handleCancelAction;
					EventActionDWR.executeCommandButtonCancel(this.fisatabid,this.fisapageid,btId,callObj);
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
					/*TODO: EL CHECKBOX DEL BTSEQUENCEACTIONBUTTON SE EMPLEA ACA*/
					if(this.saveAsTemplateChckBoxId != null){
						var checkBoxSt = dijit.byId(this.saveAsTemplateChckBoxId);
						if(checkBoxSt.get('checked') == true){
							valueTemplate = true;
						}
					}
					EventActionDWR.executeCommandButtonAction(this.fisatabid,this.fisapageid,btId,action,valueTemplate,templateOverCall,fm,notificationVal,callObj);
				}
			}
		},
		
		/**called after bt being validated.*/
		_validateBtCallBack:function(outcome){
			 if(outcome.wAxn=="cnfrm"){
				var callerCmp = {};
				callerCmp["fisa-action-id"] = outcome.btAction;
				callerCmp["fisa-bt-id"] =outcome.btId;
				this._execActionInternal(callerCmp);
//				this.verifyAfterSecurity(callerCmp); TODO: la parte de factor de autenticacion
			 } else if(outcome.wAxn=="error"){
					this.updateMsgsPanel(outcome.aMsgs);
			}
			
		},
		
		/**Called after the bt was shown, and before it goes to the pe.*/
		verifyAfterSecurity:function(callerCmp){
			if(this.secAfterListFactor != null && this.secAfterListFactor != undefined && this.secAfterListFactor.length > 0){
				var thirdDlg = this.createDialogSecurityFactor(this.secAfterListFactor,callerCmp["fisa-bt-id"] );
				thirdDlg["dlgSuccessEvent"]=dojo.hitch(this,function(callerCmp,argument){
					this._execActionInternal(callerCmp);
					},callerCmp);
			}
			else{
				this._execActionInternal(callerCmp);
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
			
			EventActionDWR.executeValidatedBtAction(this.fisatabid,this.fisapageid,btId,action,callObj);
		},
		
		/**Handles action for the bt updates the model withe new values of the fm.*/
		handleInAction:function(outcome){
			if(this.model&&outcome&&outcome.ftMsgs && this.fromAgenda && this.fromAgenda != "true"){
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
		
		/**TODO:MODIFICAR PARA QUE FUNCIONE PARA MOVILES*/
		/**Handles the window action based on the outcome of the eventactiondwr or eventsequencedwr*/
		handleWindowAction:function(outcome){
			//overrides agenda behavior-> to just close the current breadcrum
			if(this.fromAgenda != null && this.fromAgenda == "true" && outcome.wAxn!="error"){/*no esta implementado fromagenda*/
				outcome.wAxn = "close";
			}
			if(outcome.wAxn=="close"){//TODO: verificar en donde se usa el close
				//var breadCrumb = dijit.byId(this.breadcrumbId);
				//var selectedPane = breadCrumb.selectedChildWidget;
				var verifyLastTab=false;
				if(selectedPane.postClose != null && selectedPane.postClose != undefined && selectedPane.postCloseScope != undefined &&
						selectedPane.postCloseScope != null){
					var scp=dijit.byId(selectedPane.postCloseScope);
					selectedPane.postClose.apply(scp,selectedPane.postCloseArgs);
				} else {
					verifyLastTab=true;
				}
				if(this.isSequence != null && this.isSequence == "true"){
					ec.fisa.navigation.utils.closeSequenceBreadCrumb(this.breadcrumbId);
				} else {
					ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
				}
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
				this.updateMsgsPanel(outcome.aMsgs);
//				this.handleConfirmationBt(outcome);
			} else if(outcome.wAxn=="error"){
				this.updateMsgsPanel(outcome.aMsgs);
//				this.refreshTableRegistry();
			} else if(outcome.wAxn=="close&refresh"){
				ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
				var refControlller=ec.fisa.controller.utils.getPageController(outcome.parentFisaTabId,outcome.parentFisaPageScopeId);
				if (refControlller != undefined && refControlller instanceof BtController) {
					var ttr = dijit.byId(refControlller.tableRegistry[outcome.parentBtId][outcome.parentEntityId]);
					if (ttr != undefined && ttr != null) {
						ttr.refresh();
					}
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
		
		//handles component on change routine and notify combo to change
		handleOnChangeComponent:function(fieldId,btId,routineActionMode,notifyComboId,isARoutineField,
				comboSelectedIndex,parentEditableGrid,entityMrId,/*Number indice real de la grilla*/gridRealRowIndex){
			this.clearPanelMessage();
			var model =this.model.toPlainObject();
			//NOTE: eliminado segmento(ver en Btcontroller de desktop)
			
			var callObj = {
					callbackScope : {"ctrl":this,"notifyComboId":notifyComboId,"gridRealRowIndex":gridRealRowIndex}};
			callObj.callback = this.handleCallBackOnChangeComponent;
			callObj.errorHandler = dojo.hitch(this,this.errorHandler);
			EventActionDWR.handleOnChangeComponent(this.fisatabid,this.fisapageid,fieldId,btId,routineActionMode,model,notifyComboId,isARoutineField,comboSelectedIndex,parentEditableGrid,gridRealRowIndex,callObj);

		},
		
		//handles onCallBack on change component.
		handleCallBackOnChangeComponent:function(outcome){
			var aMsgs = outcome.aMsgs;
			// if msgs came from onchange an error ocurred
			if(outcome.wAxn=="error"){
				//added to avoid duplicate message
				this.ctrl.clearPanelMessage();
				this.ctrl.updateMsgsPanel(aMsgs);
			}
			
			if(outcome.wAxn = "refresh_dataType"){
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
											ftable.refresh();
										}
									}
								}else if(f!=null&&f.multivalue===false){
									var priorityChange = false;
									//means its a lov.
									if(this.lovData != undefined && this.lovData[btId] != undefined && this.lovData[btId][fId] != undefined){
										// if ist lov provoke intentionally a change.
										priorityChange = true;
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
//			if(nf&&lastFocusWidget!=null&&ec.fisa.widget.utils.isDiferentExec()){
//			ec.fisa.widget.utils.execFocused(lastFocusItem);
//			}
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
		
		showMessages : function(outcome) {
			if (outcome != null) {
				this.clearPanelMessage();
				this.updateMsgsPanel(outcome.aMsgs);
			}
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
		
		//TODO: Verificar donde se usa y modificarlo para moviles
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
		/**show document*/
		showDocument:function(/** component */callerCmp){
			var messagesPanel = dijit.byId(this.messagesPanelId);
			if(messagesPanel != null){
				messagesPanel.clearAllMessages();
			}
			if(this.model != null){
				this.model.clearAllMessages();
			}
			if(callerCmp){
				var action = callerCmp["action_mode"];
				var btId = callerCmp["fisa-bt-id"];
				var tabId = callerCmp["fisatabid"];
				var pageScopeId =  callerCmp["fisapageid"];
				var label = callerCmp["label"];

				var newSubTabPaneArg = {};
				newSubTabPaneArg.title=label;
				newSubTabPaneArg.href= dojo.config.fisaContextPath+ "/pages/static/mobile/documentos/mobile_documentos.jsp";

				newSubTabPaneArg.ioArgs = {
						content : {
							'btId':btId,
							'FisaPageScopeId' : pageScopeId,
							'actionMode':action,
							'FISATabId':tabId
						}
				};

				newSubTabPaneArg.ioMethod = dojo.xhrPost;
				ec.fisa.mobile.navigation.utils.openDocumentBreadCrumb(newSubTabPaneArg);
			};


		}

		
	});
		return BtController;
});
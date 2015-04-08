define([ "dojo/_base/kernel", 
         "dojo/_base/declare", 
         "dojo/_base/lang", 
         "ec/fisa/controller/BaseController",
         "dojo/dom-construct",
         "ec/fisa/message/ConfirmationPanel",
         "ec/fisa/mvc/StatefulModel",
         "./_base",
         "ec/fisa/widget/security/Keyboard"], function(dojo, declare, lang, BaseController, domConstruct, MessagePanel, StatefulModel) {

	var ChangePasswordController = declare("ec.fisa.controller.security.ChangePasswordController", BaseController, {

		tabId : null,

		pageScopeId : null,
		
		keyboardId : null,
		
		currentPasswdId : null,
		
		newPasswdId : null,
		
		repeatPasswdId : null,
		
		breadcrumbId : null,
		
		inputPasswdType : null,
		
		keyboard : null,
		
		model : null,
		
		currentSelectedTxtId : null,
		
		isVirtualKeyboardEnable:true,
		
		data : {},

		constructor : function(tabId, pageScopeId) {
			this.tabId = tabId;
			this.pageScopeId = pageScopeId;
			this.model = new StatefulModel({});
		},
		
		setVirtualKeyboardEnable: function(isVirtualKeyboardEnable){
			if(isVirtualKeyboardEnable && isVirtualKeyboardEnable==='false'){
				this.isVirtualKeyboardEnable=false;
			}
		},
		
		handleWindowAction : function(outcome) {
			this.clearPanelMessage();
			if(outcome.dst){
				//this.updateMsgsPanel(outcome.aMsgs);
				//se hace esto para bloquear la interaccion con los botones
				dwr.engine._batchesLength++;
				ec.fisa.dwr.proxy.standby.show();
				document.location.reload(true);
				ec.fisa.dwr.proxy.standby.show();
			} else if(outcome.wAxn=="cnfrm"){
				ec.fisa.navigation.utils.showNewBreadCrumbConfirmation(outcome.confirmationDialogTitle,outcome.aMsgs,this.breadcrumbId,this.tabId, this.pageId,null,null,false);	
			} else if(outcome['GEN_ERROR_PROCESS']!=null){
				this.updateMsgsPanel(outcome.aMsgs);
			}
		},

		setKeyboardWidgetId : function(id) {
			this.keyboardId = id;
		},
		
		setCurrentPasswdId : function(component) {
			this.currentPasswdId = component.id;
			if(this.isVirtualKeyboardEnable==true){
				component.set('disabled', true);
				component.set('readOnly', true);
			}
		},
		
		setNewPasswdId : function(component) {
			this.newPasswdId = component.id;
			if(this.isVirtualKeyboardEnable==true){
				component.set('disabled', true);
				component.set('readOnly', true);
			}
		},
		
		setRepeatPasswdId : function(component) {
			this.repeatPasswdId = component.id;
			if(this.isVirtualKeyboardEnable==true){
				component.set('disabled', true);
				component.set('readOnly', true);
			}
		},
		
		setModelVal : function(modelProp, value) {
			this.model.setValue([modelProp],value);
//			this.data[modelProp] = value; 
		},
		
		initKeyboard : function(component, data) {
			/** Creates a div inside an dom node component. */
			var creationDiv = domConstruct.create("div", null, component.domNode);
			var inputPasswdType = this.inputPasswdType;
			var currentPasswdId = this.currentPasswdId;
			var newPasswdId = this.newPasswdId;
			var repeatPasswdId = this.repeatPasswdId;
			var tabId = this.tabId;
			var pageScopeId = this.pageScopeId;
			var corr = data;
			this.keyboard = new ec.fisa.widget.security.Keyboard({
				tabId : tabId,
				pageScopeId : pageScopeId,
				currentPasswdId : currentPasswdId,
				newPasswdId : newPasswdId,
				inputPasswdType : inputPasswdType,
				repeatPasswdId : repeatPasswdId,
				data : corr,
				isLogin : true,
				onClick :function(domImg,item) {
					var value = item.value;
					this.inherited("onClick", arguments);
					if(this.inputPasswdType == null){
						return;
					}
					var textbox = null;
					var textId = null;
					if(this.inputPasswdType == "currentPasswd"){
						textbox = dijit.byId(this.currentPasswdId);
						textId = this.currentPasswdId;
					} else if(this.inputPasswdType == "newPasswordId"){
						textbox = dijit.byId(this.newPasswdId);
						textId = this.newPasswdId;
					} else {
						textbox = dijit.byId(this.repeatPasswdId);
						textId = this.repeatPasswdId;
					}
					
					var textVal = textbox.get('value');
					textbox.set('value',textVal + '*');
					
				},
				onClickSpecialBtn : function(td, value) {
					this.inherited("onClickSpecialBtn", arguments);
					
					var textbox = null;
					var textId = null;
					if(this.inputPasswdType == "currentPasswd"){
						textbox = dijit.byId(this.currentPasswdId);
						textId = this.currentPasswdId;
					} else if(this.inputPasswdType == "newPasswordId"){
						textbox = dijit.byId(this.newPasswdId);
						textId = this.newPasswdId;
					} else {
						textbox = dijit.byId(this.repeatPasswdId);
						textId = this.repeatPasswdId;
					}
					
					//Se evalua si es el boton borrar
					if(value == "DELETE"){
						textbox.set('value','');
						// console.log("onClickSpecialBtn-textId ["+textId+"]" );
						this._setValueAttr('');
						this.setSelectedValueById(textId, '');
					}
				}
			}, creationDiv);
			this.keyboardId = this.keyboard.id;
			this.keyboard.registrySelectedValue(this.currentPasswdId);
			this.keyboard.registrySelectedValue(this.newPasswdId);
			this.keyboard.registrySelectedValue(this.repeatPasswdId);
			this.keyboard.startup();
		},
		
		setMessagesPanel : function(messagesPanel){
			this.inherited(arguments);
			if(typeof this.breadcrumbId === 'undefined' || this.breadcrumbId == null){
				var breadCrumb=ec.fisa.controller.utils.findCurrentBreadCrumb(messagesPanel);
                if(breadCrumb){
                    this.breadcrumbId=breadCrumb.id;
                }
			}
			this.updateMsgsPanel(this.initMsgs);
			//this.btContentPaneId = messagesPanel.getParent().getParent().id;
			delete this.initMsgs;
		},
		
		setKeyboardCols : function(maxCols) {
			this.keyboardCols = maxCols;
		},
		
		bindToModel : function(/* widget */component,/* String */modelProp) {
			// console.log("modelProp [" + modelProp + "]");
			var modelData = this.data[modelProp];
			if (typeof modelData === "undefined") {
				modelData = "";
			}
			this.model.appendObject([modelProp],modelData,component.id,'value',null,false);
//			var stf = new dojox.mvc.StatefulModel({
//				data : modelData
//			});
//			this.model.add(modelProp, stf);
//			component.set("ref", this.model[modelProp]);
//			component.set('disabled', true);
		},
		
		setOnChageCurrentPasswd : function(component) {
			component.on("change", dojo.hitch(this, function(isChecked){
				var currentPasswd =  dijit.byId(this.currentPasswdId);
				if(isChecked){
					this.currentSelectedTxtId = this.currentPasswdId;
					if(this.isVirtualKeyboardEnable==true){
						var keyboard = dijit.byId(this.keyboardId);
						keyboard.onChangeSelectedValue(this.currentPasswdId);
						keyboard.inputPasswdType = "currentPasswd";
						currentPasswd.set('disabled', false);
						dojo.removeAttr(currentPasswd.domNode,"disabled");
					}
				} else {
					if(this.isVirtualKeyboardEnable==true){
						currentPasswd.set('disabled', true);
					}
				}
			}), true);
		},
		
		setOnChageNewPasswd : function(component) {
			component.on("change", dojo.hitch(this, function(isChecked){
				var newPasswd =  dijit.byId(this.newPasswdId);
				if(isChecked){
					this.currentSelectedTxtId = this.newPasswdId;
					if(this.isVirtualKeyboardEnable==true){
						var keyboard = dijit.byId(this.keyboardId);
						keyboard.onChangeSelectedValue(this.newPasswdId);
						keyboard.inputPasswdType = "newPasswordId";
						newPasswd.set('disabled', false);
						dojo.removeAttr(newPasswd.domNode,"disabled");
					}
				} else {
					if(this.isVirtualKeyboardEnable==true){
						newPasswd.set('disabled', true);
					}
				}
			}), true);
		},
		
		setOnChageRepeatPasswd : function(component) {
			component.on("change", dojo.hitch(this, function(isChecked){
				var repeatPasswd =  dijit.byId(this.repeatPasswdId);
				if(isChecked){
					this.currentSelectedTxtId = this.repeatPasswdId;
					if(this.isVirtualKeyboardEnable==true){
						var keyboard = dijit.byId(this.keyboardId);
						keyboard.onChangeSelectedValue(this.repeatPasswdId);
						keyboard.inputPasswdType = "repeatPasswordId";
						repeatPasswd.set('disabled', false);
						dojo.removeAttr(repeatPasswd.domNode,"disabled");
					}
				} else {
					if(this.isVirtualKeyboardEnable==true){
						repeatPasswd.set('disabled', true);
					}
				}
			}), true);
		},
		
		changePassword : function(isLoginVal) {
			var isLogin = false;
			if(isLoginVal != null && isLoginVal === true){
				isLogin = true;
			}
			var callObj = {
					callbackScope : this
			};
			callObj.callback = this.handleWindowAction;
			callObj.errorHandler = this.errorHandler;
			if(this.isVirtualKeyboardEnable==true){
				var keyboard = dijit.byId(this.keyboardId);
				ChangePasswordControllerDWR.changeEncodedPassword(this.tabId, this.pageScopeId, keyboard.getSelectedValueById(this.currentPasswdId),
					keyboard.getSelectedValueById(this.newPasswdId), keyboard.getSelectedValueById(this.repeatPasswdId), isLogin, callObj);
			}
			else{
				var value1 = dijit.byId(this.currentPasswdId).get("value");
				var value2 = dijit.byId(this.newPasswdId).get("value");
				var value3 = dijit.byId(this.repeatPasswdId).get("value");
				ChangePasswordControllerDWR.changePassword(this.tabId, this.pageScopeId, value1,
						value2, value3, isLogin, callObj);
			}
		},
		
		close : function(isLogin) {
			if (isLogin == true) {
				ChangePasswordControllerDWR.invalidateSession({
					callbackScope : this,
					callback : dojo.hitch(this, function(outcome) {
						document.location.reload(true);
					}),
					errorHandler : dojo.hitch(this,this.errorHandler)
				});
			} else {
				ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
				ec.fisa.menu.utils.addEmptyTabAllClosed(dojo.config.fisaNewTabLabel);
			}
		},
		
		updateExpiredPasswordMsg : function(/*Boolean*/contains,/*ErrorBean*/updateMsgPanel) {
			if(contains){
				var messagesPanel = dijit.byId(this.messagesPanelId);
				messagesPanel.clearAllMessages();
				this.updateMsgsPanel([updateMsgPanel]);		
			}
		},
		
		updateSuccessMsg : function(/*Boolean*/updateMsgPanel) {
			if(updateMsgPanel){
				ChangePasswordControllerDWR.generateSuccessMsg({
					callbackScope : this,
					callback : dojo.hitch(this, function(outcome) {
						var messagesPanel = dijit.byId(this.messagesPanelId);
						messagesPanel.clearAllMessages();
						this.updateMsgsPanel(outcome.aMsgs);		
					}),
					errorHandler : dojo.hitch(this,this.errorHandler)
				});
			}
		},
		
		closeCnfrm : function() {
			ChangePasswordControllerDWR.closeCnfrm({
				callbackScope : this,
				callback : dojo.hitch(this, function(outcome) {
					var messagesPanel = dijit.byId(this.messagesPanelId);
					messagesPanel.clearAllMessages();
					this.updateMsgsPanel(outcome.aMsgs);
//					if(outcome.dst){
//					}
				}),
				errorHandler : dojo.hitch(this,this.errorHandler)
			});
			document.location.reload(true);
		},
		setConfirmationMessage:function(msgs){
			var creationDiv=dojo.byId("changePswMsgCntnr");
			var messageDiv = domConstruct.create("div", {'class':'fisaConfirmation'},
					creationDiv);
			var output = new MessagePanel({
			},messageDiv);
			output.startup();
			output.update(msgs);
		}
	});
	return ChangePasswordController;
});
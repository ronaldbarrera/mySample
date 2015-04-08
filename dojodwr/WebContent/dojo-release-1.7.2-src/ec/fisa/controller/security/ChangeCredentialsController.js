define([ "dojo/_base/kernel", 
         "dojo/_base/declare", 
         "dojo/_base/lang", 
         "ec/fisa/controller/BaseController",
         "dojo/dom-construct",
         "ec/fisa/message/ConfirmationPanel",
         "ec/fisa/mvc/StatefulModel",
         "./_base",
         "ec/fisa/widget/security/Keyboard"], function(dojo, declare, lang, BaseController, domConstruct, MessagePanel,StatefulModel) {

	var ChangeCredentialsController = declare("ec.fisa.controller.security.ChangeCredentialsController", BaseController, {

		tabId : null,
		pageScopeId : null,
		keyboardId : null,
		currentPasswordId : null,
		newPasswordId : null,
		newPasswordConfirmId : null,
		breadcrumbId : null,
		currentInput : null,
		keyboard : null,
		model : null,
		currentSelectedTxtId : null,
		data : {},
		isVirtualKeyboardEnable:true,

		constructor : function(tabId, pageScopeId) {
			this.tabId = tabId;
			this.pageScopeId = pageScopeId;
			this.model = new StatefulModel({});
		},

		handleWindowAction : function(outcome) {
			this.clearPanelMessage();
			if(outcome.dst){
				//se hace esto para bloquear la interaccion con los botones
				dwr.engine._batchesLength++;
				ec.fisa.dwr.proxy.standby.show();
				document.location.reload(true);
				ec.fisa.dwr.proxy.standby.show();
			} else if(outcome.wAxn=="cnfrm"){
				ec.fisa.navigation.utils.showNewBreadCrumbConfirmation(outcome.confirmationDialogTitle,outcome.aMsgs,this.breadcrumbId,this.tabId, this.pageId,null,null,false);	
			} else if(outcome.wAxn=="error"){
				this.updateMsgsPanel(outcome.aMsgs);
			}
		},

		setKeyboardWidgetId : function(id) {
			this.keyboardId = id;
		},
		
		setCurrentPasswordId : function(component) {
			this.currentPasswordId = component.id;
			if(this.isVirtualKeyboardEnable==true){
				component.set('disabled', true);
				component.set('readOnly', true);
			}
		},
		
		setNewPasswordId : function(component) {
			this.newPasswordId = component.id;
			if(this.isVirtualKeyboardEnable==true){
				component.set('disabled', true);
				component.set('readOnly', true);
			}
		},
		
		setNewPasswordConfirmId : function(component) {
			this.newPasswordConfirmId = component.id;
			if(this.isVirtualKeyboardEnable==true){
				component.set('disabled', true);
				component.set('readOnly', true);
			}
		},
		
		setModelVal : function(modelProp, value) {
			this.model.setValue([modelProp],value);
//			this.data[modelProp] = value; 
		},
		setVirtualKeyboardEnable: function(isVirtualKeyboardEnable){
			if(isVirtualKeyboardEnable && isVirtualKeyboardEnable==='false'){
				this.isVirtualKeyboardEnable=false;
			}
		},
		
		initKeyboard : function(component, data) {
			
			/** Creates a div inside an dom node component. */
			var creationDiv = domConstruct.create("div", null, component.domNode);
			var currentInput = this.currentInput;
			var currentPasswordId = this.currentPasswordId;
			var newPasswordId = this.newPasswordId;
			var newPasswordConfirmId = this.newPasswordConfirmId;
			var tabId = this.tabId;
			var pageScopeId = this.pageScopeId;
			var corr = data;
			
			this.keyboard = new ec.fisa.widget.security.Keyboard({
				tabId : tabId,
				pageScopeId : pageScopeId,
				currentPasswordId : currentPasswordId,
				newPasswordId : newPasswordId,
				newPasswordConfirmId : newPasswordConfirmId,
				currentInput: currentInput,
				data : corr,
				isLogin : true,
				onClick :function(domImg,item) {
					var value = item.value;
					this.inherited("onClick", arguments);
					
					if(this.currentInput == null){
						return;
					}
					
					var textbox = null;
					var textId = null;
					if (this.currentInput == "currentPassword") {
						textbox = dijit.byId(this.currentPasswordId);
						textId = this.currentPasswordId;
					} else if(this.currentInput == "newPassword") {
						textbox = dijit.byId(this.newPasswordId);
						textId = this.newPasswordId;
					} else if(this.currentInput == "newPasswordConfirm") {
						textbox = dijit.byId(this.newPasswordConfirmId);
						textId = this.newPasswordConfirmId;
					}
					
					var textVal = textbox.get('value');
					textbox.set('value', textVal + '*');
				},
				onClickSpecialBtn : function(td, value) {
					this.inherited("onClickSpecialBtn", arguments);
					
					var textbox = null;
					var textId = null;
					if (this.currentInput == "currentPassword") {
						textbox = dijit.byId(this.currentPasswordId);
						textId = this.currentPasswordId;
					} else if(this.currentInput == "newPassword") {
						textbox = dijit.byId(this.newPasswordId);
						textId = this.newPasswordId;
					} else if(this.currentInput == "newPasswordConfirm") {
						textbox = dijit.byId(this.newPasswordConfirmId);
						textId = this.newPasswordConfirmId;
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
			this.keyboard.registrySelectedValue(this.currentPasswordId);
			this.keyboard.registrySelectedValue(this.newPasswordId);
			this.keyboard.registrySelectedValue(this.newPasswordConfirmId);
			
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
//			component.set('disabled', false);
		},
		
		setOnChangeCurrentPassword : function(component) {
			component.on("change", dojo.hitch(this, function(isChecked){
				var currentPassword =  dijit.byId(this.currentPasswordId);
				if(isChecked){
					var keyboard = dijit.byId(this.keyboardId);
					
					if(this.isVirtualKeyboardEnable==true){
						keyboard.onChangeSelectedValue(this.currentPasswordId);
						keyboard.currentInput = "currentPassword";
						this.currentSelectedTxtId = this.currentPasswordId;
						currentPassword.set('disabled', false);
						dojo.removeAttr(currentPassword.domNode,"disabled");
					}
				} else {
					if(this.isVirtualKeyboardEnable==true){
						currentPassword.set('disabled', true);
					}
				}
			}), true);
		},
		
		setOnChangeNewPassword : function(component) {
			component.on("change", dojo.hitch(this, function(isChecked){
				var newPassword =  dijit.byId(this.newPasswordId);
				if(isChecked){
					var keyboard = dijit.byId(this.keyboardId);
					if(this.isVirtualKeyboardEnable==true){
						keyboard.onChangeSelectedValue(this.newPasswordId);
						keyboard.currentInput = "newPassword";
						this.currentSelectedTxtId = this.newPasswordId;
						newPassword.set('disabled', false);
						dojo.removeAttr(newPassword.domNode,"disabled");
					}
				} else {
					if(this.isVirtualKeyboardEnable==true){
						newPassword.set('disabled', true);
					}
				}
			}), true);
		},
		
		setOnChangeNewPasswordConfirm : function(component) {
			component.on("change", dojo.hitch(this, function(isChecked){
				var newPasswordConfirm =  dijit.byId(this.newPasswordConfirmId);
				if(isChecked){
					var keyboard = dijit.byId(this.keyboardId);
					if(this.isVirtualKeyboardEnable==true){
						keyboard.onChangeSelectedValue(this.newPasswordConfirmId);
						keyboard.currentInput = "newPasswordConfirm";
						this.currentSelectedTxtId = this.newPasswordConfirmId;
						newPasswordConfirm.set('disabled', false);
						dojo.removeAttr(newPasswordConfirm.domNode,"disabled");
					}	
				} else {
					if(this.isVirtualKeyboardEnable==true){
						newPasswordConfirm.set('disabled', true);
					}
				}
			}), true);
		},
		
		changeCredentials : function() {
			var keyboard = dijit.byId(this.keyboardId);
			var callObj = {
					callbackScope : this
			};
			callObj.callback = this.handleWindowAction;
			callObj.errorHandler = this.errorHandler;
			if(this.isVirtualKeyboardEnable==true){
				ChangeCredentialsControllerDWR.changeEncodedCredentials(this.tabId, this.pageScopeId, 
						this.model.getValue(["_currentUsername"]),
						keyboard.getSelectedValueById(this.currentPasswordId), 
						this.model.getValue(["_newUsername"]), 
						keyboard.getSelectedValueById(this.newPasswordId),
						keyboard.getSelectedValueById(this.newPasswordConfirmId),
						callObj);
			}else{
				var value1 = dijit.byId(this.currentPasswordId).get("value");
				var value2 = dijit.byId(this.newPasswordId).get("value");
				var value3 = dijit.byId(this.newPasswordConfirmId).get("value");
				ChangeCredentialsControllerDWR.changeCredentials(this.tabId, this.pageScopeId, 
						this.model.getValue(["_currentUsername"]),
						value1,
						this.model.getValue(["_newUsername"]), 
						value2, value3, callObj);
			}
		},
		
		close : function() {
			ChangeCredentialsControllerDWR.invalidateSession({
				callbackScope : this,
				callback : dojo.hitch(this, function(outcome) {
					document.location.reload(true);
				}),
				errorHandler : dojo.hitch(this,this.errorHandler)
			});
		},
		
		closeCnfrm : function() {
			ChangeCredentialsControllerDWR.closeCnfrm({
				callbackScope : this,
				callback : dojo.hitch(this, function(outcome) {
					var messagesPanel = dijit.byId(this.messagesPanelId);
					messagesPanel.clearAllMessages();
					this.updateMsgsPanel(outcome.aMsgs);
				}),
				errorHandler : dojo.hitch(this,this.errorHandler)
			});
			document.location.reload(true);
		},
		
		setConfirmationMessage:function(msgs){
			var creationDiv=dojo.byId("changeCredentialsMsgCntnr");
			var messageDiv = domConstruct.create("div", {'class':'fisaConfirmation'},
					creationDiv);
			var output = new MessagePanel({
			},messageDiv);
			output.startup();
			output.update(msgs);
		}
	});
	return ChangeCredentialsController;
});
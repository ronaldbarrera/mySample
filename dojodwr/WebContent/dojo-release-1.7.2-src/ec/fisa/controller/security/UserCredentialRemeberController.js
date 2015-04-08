define([ "dojo/_base/kernel", 
         "dojo/_base/declare", 
         "dojo/_base/lang", 
         "ec/fisa/controller/BaseController",
         "dojo/dom-construct",
         "./_base"], function(dojo, declare, lang, BaseController, domConstruct, baseSecurity) {

	var UserCredentialRemeberController = declare("ec.fisa.controller.security.UserCredentialRemeberController", BaseController, {

		tabId : null,

		pageScopeId : null,
		
		breadcrumbId : null,
		
		userTextId : null,
		
		principalIdentificationTextId : null,
		
		secondaryIdentificationTextId : null,
		
		principalTypeId : null,
		
		principalTypeValue : null,
		
		secondaryTypeId : null,
		
		secondaryTypeValue : null,

		constructor : function(tabId, pageScopeId) {
			this.tabId = tabId;
			this.pageScopeId = pageScopeId;
		},

		handleWindowAction : function(outcome) {
			var messagesPanel = dijit.byId(this.messagesPanelId);
			messagesPanel.clearAllMessages();
			this.updateMsgsPanel(outcome.aMsgs);
		},

		setUsernameId : function(component) {
			this.userTextId = component.id;
		},
		
		setPrincipalIdentificationId : function(component) {
			this.principalIdentificationTextId = component.id;
		},
		
		setSecondaryIdentificationId : function(component) {
			this.secondaryIdentificationTextId = component.id;
		},
		
		setPrincipalTypeComboId : function(id) {
			this.principalTypeId = id;
			var node = dijit.byId(id);
			this.principalTypeValue = node.getValue();
			var component=dijit.byId(id);
			component.connect(component, "onChange", dojo.hitch(this,this.setPrincipalId));
		},
		
		setSecondaryTypeComboId : function(id) {
			this.secondaryTypeId = id;
			var node = dijit.byId(id);
			this.secondaryTypeValue = node.getValue();
			var component=dijit.byId(id);
			component.connect(component, "onChange", dojo.hitch(this,this.setSecondaryId));
		},
		
		rememberPassword : function() {
			var textbox = dijit.byId(this.userTextId);
			var userValue = textbox.get('value');
			var callObj = {
					callbackScope : this
			};
			callObj.callback = this.handleWindowAction;
			callObj.errorHandler = this.errorHandler;
			UserCredentialRemeberControllerDWR.rememberPassword(this.tabId, this.pageScopeId, userValue, callObj);
		},
		
		rememberUser : function() {
			var principalTextbox = dijit.byId(this.principalIdentificationTextId);
			var principalUserValue = principalTextbox.get('value');
			
			var secondaryTextbox = dijit.byId(this.secondaryIdentificationTextId);
			var secondaryUserValue = secondaryTextbox.get('value');
			
			var callObj = {
					callbackScope : this
			};
			callObj.callback = this.handleWindowAction;
			callObj.errorHandler = this.errorHandler;
			UserCredentialRemeberControllerDWR.rememberUser(this.tabId, this.pageScopeId, this.principalTypeValue, principalUserValue, this.secondaryTypeValue, secondaryUserValue, callObj);
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
			delete this.initMsgs;
		},
		
		closeRemeberPassword : function() {
			var dialog = dijit.byId("forgotPasswordDialogId");
			dialog.destroy();
		},
		
		closeRemeberUser : function() {
			var dialog = dijit.byId("rememberUserDialogId");
			dialog.destroy();
		},
		
		setPrincipalId : function(newValue) {
			this.principalTypeValue = newValue;
		},
		
		setSecondaryId : function(newValue) {
			this.secondaryTypeValue = newValue;
		}


	});
	return UserCredentialRemeberController;
});
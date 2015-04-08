define([ "dojo/_base/kernel", 
         "dojo/_base/declare", 
         "dojo/_base/lang", 
         "ec/fisa/controller/security/BaseSecurityController",
         "dojo/dom-construct",
         "ec/fisa/widget/security/Keyboard",
         "./_base",
         "ec/fisa/controller/Utils"
         ], function(dojo, declare, lang, BaseSecurityController, domConstruct, keyBoard, baseSecurity) {

	var TokenValidatorController = declare("ec.fisa.controller.security.TokenValidatorController", BaseSecurityController, {

		breadcrumbId : null,
		
		tokenTextId : null,
		
		keyboardId : null,
		
		serviceId : null,
		
		isVirtualKeyboardEnable: false,
		
		initMsgs : null,

		constructor: function (tabId,pageScopeId,initData,serviceId,calledByDlg) {
			this.tabId = tabId;
			this.pageScopeId = pageScopeId,
			this.serviceId = serviceId;
		},
		
		setTokenTextId : function(component,isVirtualKeyboardEnable) {
			this.tokenTextId = component.id;
			if(isVirtualKeyboardEnable && isVirtualKeyboardEnable=='true'){
				this.isVirtualKeyboardEnable=true;
				component.set('readOnly', true);
			}
		},
		
		validateToken : function() {
			var callObj = {
					callbackScope : this
			};
			callObj.callback = this.handleWindowAction;
			callObj.errorHandler = dojo.hitch(this,this.errorHandler);
			if(this.isVirtualKeyboardEnable){
				var keyboard = dijit.byId(this.keyboardId);
				var encodedValue=keyboard._getValueAttr();
				TokenValidatorControllerDWR.validateEncodedToken(this.tabId, this.pageScopeId, this.serviceId, encodedValue, callObj);
			}else{
				var value = dijit.byId(this.tokenTextId).get("value");
				TokenValidatorControllerDWR.validateToken(this.tabId, this.pageScopeId, this.serviceId, value, callObj);
			}
		},
		
		setMessagesPanel:function(messagesPanel){
			this.inherited(arguments);
			if(this.calledByDlg == false){
			if(typeof this.breadcrumbId === 'undefined' || this.breadcrumbId == null){
				var breadCrumb=ec.fisa.controller.utils.findCurrentBreadCrumb(messagesPanel);
                if(breadCrumb){
                    this.breadcrumbId=breadCrumb.id;
                }
			}
			}
			this.updateMsgsPanel(this.initMsgs);
			//this.btContentPaneId = messagesPanel.getParent().id;
			delete this.initMsgs;
		},
		
		initKeyboard : function(component, data) {
			
			/** Creates a div inside an dom node component. */
			var creationDiv = domConstruct.create("div", null, component.domNode);
			var tokenTextId = this.tokenTextId;
			var tabId = this.tabId;
			var pageScopeId = this.pageScopeId;
			var corr = data;
			
			this.keyboard = new ec.fisa.widget.security.Keyboard({
				tabId : tabId,
				pageScopeId : pageScopeId,
				tokenTextId : tokenTextId,
				data : corr,
				isLogin : true,
				onClick :function(domImg,item) {
					this.inherited("onClick", arguments);
					
					var textbox = dijit.byId(this.tokenTextId);
					var textVal = textbox.get('value');
					textbox.set('value',textVal + '*');
				},
				onClickSpecialBtn : function(td, value) {
					this.inherited("onClickSpecialBtn", arguments);
					var textbox = dijit.byId(this.tokenTextId);
					
					//Se evalua si es el boton borrar
					if(value == "DELETE"){
						this._setValueAttr('');
						textbox.set('value','');
						this.setSelectedValueById(this.tokenTextId, '');
					}
				}
			}, creationDiv);
			
			this.keyboardId = this.keyboard.id;
			this.keyboard.registrySelectedValue(this.tokenTextId);
			
			this.keyboard.startup();
		},
		
		close : function() {
			this.onCancelEvent();
			if(this.calledByDlg == false){
			ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
			}
		}


	});
	return TokenValidatorController;
});

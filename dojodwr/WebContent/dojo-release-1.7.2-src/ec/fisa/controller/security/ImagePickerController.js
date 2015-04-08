define([ "dojo/_base/kernel", 
         "dojo/_base/declare", 
         "dojo/_base/lang", 
         "dojo/dom-style",
         "./BaseSecurityController",
         "ec/fisa/dwr/proxy/security/ImagePickerControllerDWR",
         "./_base",
         "ec/fisa/controller/Utils"
         ], function(dojo, declare, lang, domStyle, BaseSecurityController) {

	var ImagePickerController = declare("ec.fisa.controller.security.ImagePickerController", [BaseSecurityController], {
		"-chains-": {
		      constructor: "manual"
		},
		
		imagePickerId : null,
		
		acceptButtonId: null,
		
		titleBarId:null,
		
		breadcrumbId : null,
		
		initMsgs : null,
		
		_isReloadable:false,
		
		initLabels:[],

		constructor: function (tabId,pageScopeId,initData,serviceId,calledByDlg) {
			this.inherited(arguments);
		},

		handleWindowAction : function(outcome) {
			this.inherited(arguments);
			if(outcome.dst && this.calledByDlg == false){
				//se hace esto para bloquear la interaccion con los botones
				dwr.engine._batchesLength++;
				ec.fisa.dwr.proxy.standby.show();
				var h=document.location.href;
				if(h.indexOf(dojo.config.fisaContextPath+'/pages/index.jsp')!=-1){
					setTimeout(function(){document.location.reload(true);},3000);
				} else {
					setTimeout(function(){document.location.href=dojo.config.fisaContextPath+'/pages/index.jsp';},3000);
				}
				ec.fisa.dwr.proxy.standby.show();
			} else if(outcome.wAxn=="cnfrm"){
				this._isReloadable=outcome.isReloadable;
				ec.fisa.navigation.utils.showNewBreadCrumbConfirmation(outcome.confirmationDialogTitle,outcome.aMsgs,this.breadcrumbId,this.tabId, this.pageId,null,null,false);	
			}
			if(outcome.cancelValitation){
				//Ocultar botón aceptar y el selector de imagen.
				this.disableImagePickerWidget();
			}
			
			
		},
		disableImagePickerWidget:function(){
			var imgWidget = dijit.byId(this.imagePickerId);
			var acceptButton = dijit.byId(this.acceptButtonId);
			var titleBar= dijit.byId(this.titleBarId);
			if(imgWidget)
				domStyle.set(imgWidget.domNode,"display","none");	
			if(acceptButton)
				domStyle.set(acceptButton.domNode,"display","none");	
			if(titleBar)
				domStyle.set(titleBar.domNode,"display","none");	
		},
		
		setImagePickerWidgetId : function(id) {
			this.imagePickerId = id;
		},
		
		setAcceptButtonId: function(id){
			this.acceptButtonId =id;
		},
		
		setTitleBarId : function(id){
			this.titleBarId=id;
		},
		saveSelectedImg : function(isEnroll) {
			var imgWidget = dijit.byId(this.imagePickerId);
			var selectedImg = imgWidget._getValueAttr();
			var callObj = {
					callbackScope : this
			};
			callObj.callback = this.handleWindowAction;
			callObj.errorHandler = dojo.hitch(this,this.errorHandler);
			ImagePickerControllerDWR.saveSelectedImage(this.tabId, this.pageScopeId, selectedImg, isEnroll, callObj);
			
		},
		
		validateSelectedImg : function() {
			var imgWidget = dijit.byId(this.imagePickerId);
			var selectedImg = imgWidget._getValueAttr();
			
			var callObj = {
					callbackScope : this
			};
			callObj.callback = this.handleWindowAction;
			callObj.errorHandler = dojo.hitch(this,this.errorHandler);
			ImagePickerControllerDWR.validateSelectedImage(this.tabId, this.pageScopeId, selectedImg, callObj);
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
		
		close : function(isEnroll) {
			this.onCancelEvent();
			if(this.calledByDlg == false){
				if(isEnroll){
					var callObj = {
							callbackScope : this
					};
					callObj.callback = this.handleWindowAction;
					callObj.errorHandler = dojo.hitch(this,this.errorHandler);
					ImagePickerControllerDWR.closeController(isEnroll, callObj);
				} else {
					ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
				}
			}
		},
		
		cancel : function() {
			this.close(false);
		},
		
		updateExpiredMsg : function(/*Boolean*/updateMsgPanel) {
			if(updateMsgPanel){
				this.initMsgs =updateMsgPanel.aMsgs;
			}
		},

		destroy:function(){
			var flag=this._isReloadable;
			this.inherited(arguments);
			if(flag==true){
				setTimeout(function(){document.location.reload(true);},500);
			}
		}
	});
	return ImagePickerController;
});
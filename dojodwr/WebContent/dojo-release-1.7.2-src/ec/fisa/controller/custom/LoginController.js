define( [ "dojo/_base/declare", "dojo/_base/lang",
  		"ec/fisa/controller/BaseController","dojo/dom-geometry",
        "dojo/dom-style",
        "dojo/dom-construct",
        "dojox/widget/DialogSimple", "./_base",
        "ec/fisa/widget/security/Keyboard"], function(declare,
		lang, BaseController,domGeometry,domStyle,domConstruct) {

	var LoginController = declare("ec.fisa.controller.custom.LoginController",
			[ BaseController ], {
				currentPasswdId : null,
				currentRPasswdId : null,
				currentTabId : null,
				currentPageScopeId : null,
				launchCreateUser : function() {
					//this.openDlg("Solicitud de Cuenta", dojo.config.fisaContextPath+"/PUBLIC_BUSINESS_TEMPLATE/BUSINESS_TEMPLATE/BPT_PER_MNC_NFIS0001/actionMode/IN/TI/0/FPSC/true/index.jsp","rememberUserDialogId");
					this.openDlg("Solicitue su nombre de Usuario", dojo.config.fisaContextPath+"/pages/static/security/remember-user.jsp","rememberUserDialogId", {w:620,h:300});
				},
				launchForgotPassword : function() {
					this.openDlg("Solicite su Contrase\u00F1a\u003F", dojo.config.fisaContextPath+"/pages/static/security/remember-password.jsp","forgotPasswordDialogId",{w:620,h:300});
				},
				launchAskPaswword : function() {
					this.openDlg("Solicite su Contrase\u00F1a\u003F", dojo.config.fisaContextPath+"/PUBLIC_BUSINESS_TEMPLATE/BUSINESS_TEMPLATE/BPT_PER_MNC_NFIS0004/actionMode/IN/TI/0/FPSC/true/index.jsp","askPasswordDialogId",{w:620,h:195});
				},
				openDlg:function(dialogTitle,url,id,fixedDims){
					var dialogArgs= {'title':dialogTitle, 'href':url, 'executeScripts':true, 'ioMethod':dojo.xhrPost};
					var tabContainerGeoms = domGeometry.getMarginBox(dojo.byId("content"));
					var dialogStyle=null;
					if(fixedDims){
						dialogStyle=fixedDims;
					}else{
						var propo=0.9;
						dialogStyle={h:tabContainerGeoms.h*propo,w:tabContainerGeoms.w*propo};
					}
					dialogArgs.style="height:"+dialogStyle.h+"px;width:"+dialogStyle.w+"px;";
					
					dialogArgs.style="height:"+dialogStyle.h+"px;width:"+dialogStyle.w+"px;overflow: auto;";
					dialogArgs.splitter="true";
					
//					dialogArgs.id = id;
					var lov = new dojox.widget.DialogSimple(dialogArgs);
					lov.show();
					this._resizeContainerNode(lov,dialogStyle);
				},
				_resizeContainerNode:function(lovDialog,dialogStyle){
					var titleDim=domGeometry.getMarginBox(lovDialog.titleNode);
					domStyle.set(lovDialog.containerNode, "height", (dialogStyle.h-titleDim.h-(titleDim.t*4))+"px");
					domStyle.set(lovDialog.containerNode, "overflowY", "auto");
					domStyle.set(lovDialog.containerNode, "overflowX", "auto");
				},
				initKeyboard : function(component, data) {
					
					/** Creates a div inside an dom node component. */
					var creationDiv = domConstruct.create("div", null, component.domNode);
					var currentPasswdId = this.currentPasswdId;
					var currentRPasswdId = this.currentRPasswdId;
					var corr = data;
					
//					var	tabIdText = dijit.byId(this.currentTabId);
//					tabIdText.set('value', data.tabId)
//					var	pageScopeIdText = dijit.byId(this.currentPageScopeId);
//					pageScopeIdText.set('value', data.pageScopeId);
					
					this.keyboard = new ec.fisa.widget.security.Keyboard({
						currentPasswdId : currentPasswdId,
						currentRPasswdId : currentRPasswdId,
						isLogin : true,
						data : corr,
						onClick :function(domImg,item) {
							var value = item.value;
							this.inherited("onClick", arguments);
							var	rTextbox = dijit.byId(this.currentRPasswdId);
							var	textbox = dijit.byId(this.currentPasswdId);
							var textVal = textbox.get('value');
							var rTextVal = rTextbox.get('value');
							
							rTextbox.set('value', this.selectedValue);
							textbox.set('value',textVal + '*');
						},
						onClickSpecialBtn : function(td, value) {
							this.inherited("onClickSpecialBtn", arguments);
							var	rTextbox = dijit.byId(this.currentRPasswdId);
							var	textbox = dijit.byId(this.currentPasswdId);
							
							//Se evalua si es el boton borrar
							if(value == "DELETE"){
								textbox.set('value','');
								rTextbox.set('value','');
							}
						}
					}, /* lugar de creacion */creationDiv);
					
					this.keyboard.startup();
				},
				setRPasswdId : function(component) {
					this.currentRPasswdId = component.id;
				},
				setPasswdId : function(component) {
					this.currentPasswdId = component.id;
					component.set('readOnly', true);
				},
				setTabId : function(component) {
					this.currentTabId = component.id;
				},
				setPageScopeId : function(component) {
					this.currentPageScopeId = component.id;
				}
				
			});
	ec.fisa.controller.custom.loginController = new LoginController();
	return LoginController;
});
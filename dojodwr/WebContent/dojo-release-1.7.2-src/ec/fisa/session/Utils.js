define( [ "dojo/_base/kernel", "dojo/_base/declare", "ec/fisa/session/_base",
		"dojo/_base/connect","dojo/dom-construct","dojo/dom-style", "ec/fisa/dwr/proxy/EventActionDWR" ],
		function(dojo, declare, fisaSession, connect, domConstruct,domStyle) {
			var Utils = declare("ec.fisa.session.Utils", null, {
				_idleTime : null,
				_timers : [],
				idleTime : null,
				time:(dojo.config.fisaTimeout * 1000),
				//warnTime:(dojo.config.fisaTimeout * 1000)/3,
				logout : true,
				unloadActive : false,
				title : dojo.config.fsesTitle,
				question : dojo.config.fsesQuestion,
				logOutUrl : dojo.config.fsesLogOutUrl,
				keepAliveUrl : dojo.config.fsesKeepAliveUrl,
				acceptLabel : dojo.config.fsesAcceptLabel,
				window : null,

				onIdleSubscribeFunction : null,

				constructor : function() {

				},
				resetAndInit:function(){
					this.clearTimers();
					this.setTimer();
				},
				
				//provoke a server call to reset the timer of the session. called from 2.4 or a iframe.
				resetAndInitMaintain:function(){
					var callObj={callbackScope:this};
					callObj.errorHandler=dojo.hitch(this,this.errorHandler);
					callObj.callback=dojo.hitch(this,this.handleResetAndInitCallBack);
					EventActionDWR.mantainSessionCall(callObj);
				},
				
				
				//callback from dwr of reset.
				handleResetAndInitCallBack:function(outcome){
					if(outcome == "success"){
						this.resetAndInit();
					}
				},
				
				setTimer : function() {
					this._timers.push(setTimeout(function() {
						ec.fisa.session.utils.raiseQueryDialog();
					}, ec.fisa.session.utils.time));
				},
				clearTimers : function() {
					if (this._timers) {
						for ( var i = 0; i < this._timers.length; i++) {
							clearTimeout(this._timers[i]);
						}
					}
					this._timers = [];
				},
				/** Initialize the timers to show idle message to logout. */
				addOnLoadIdle : function(
						window) {
					this.setTimer();
					this.window = window;
				},
				/** logout the system */
				logoutNow : function() {
					ec.fisa.session.utils.disableUnloadWindow();
					window.location.replace(dojo.config.fisaContextPath
							+ this.logOutUrl);
				},
				onActive : function(args) {
					ec.fisa.session.utils.clearTimers();
				},
				chooseTimersOrLogout : function(isContinue) {
					var logoutTimeout = setTimeout(this.logoutNow, 60000); // Show
																			// the
					if (isContinue) {
						clearTimeout(logoutTimeout);
						this.clearTimers();
					} else {
						this.logoutNow();
					}
				},
				commonCallback : function(logout) {
					ec.fisa.session.utils.dlgConfirm.hide();
					ec.fisa.session.utils.dlgConfirm.destroyRecursive(false);
					ec.fisa.session.utils.chooseTimersOrLogout(!logout);
				},
				goOut : function(mouseEvent) {
					this.logout = true;
					ec.fisa.session.utils.commonCallback(this.logout);
				},
				/* Create dialog and methods to stay or logout. */
				raiseQueryDialog : function() {
					var dialogAttrs={
							acceptDialogLabel : this.acceptLabel,
							title : this.title,
							content : this.question,
							acceptAction : ec.fisa.session.utils.goOut,
							disableCloseButton : true,
							disableCancelButton : true
						};
					var dlgConfirm = null;
					if(dojo.config.fisaMobile){
						dlgConfirm = new ec.fisa.mobile.widget.ConfirmDialog( dialogAttrs,domConstruct.create("div",{}, dojo.byId("modals")));
						dlgConfirm.show();
					}else{
						dlgConfirm = new ec.fisa.widget.ConfirmDialog( dialogAttrs);
						dlgConfirm.show();
					}
					//setTimeout(ec.fisa.session.utils.logoutNow,ec.fisa.session.utils.warnTime);
					ec.fisa.session.utils.dlgConfirm=dlgConfirm;
				},
				/**
				 * @author christian mora
				 * @date 2014-11-25
				 * @mantis 19580
				 * 
				 * 		Se soluciona el problema de bloqueo de sesion al cerrar el navegador
				 * 		a traves de la X, se hace una llamada al logout para que se ejecute
				 * 		el proceso de cierre de sesion mientras se cierra el navegador.
				 */
				onUnloadWindow:function(event){
					var outcome = undefined;
					if(ec.fisa.session.utils.unloadActive){
						ec.fisa.session.utils.closeWindow();
						if(dojo.isIE){
							outcome= "Intentaremos cerrar su sesión automáticamente";
						}else{
							outcome= true;
						}
					}
					return outcome;
				},
				enableUnloadWindow:function(){
					ec.fisa.session.utils.unloadActive = true;
				},
				disableUnloadWindow:function(){
					ec.fisa.session.utils.unloadActive = false;
				},
				closeWindow:function(){
					ec.fisa.session.utils.disableUnloadWindow();
					dojo.xhrPost({url:'../logout.jsp',load:ec.fisa.session.utils.disableUnloadWindow});
					for(var i=0;i<document.body.childNodes.length;i++){
						var node=document.body.childNodes[i];
						var nn=node.nodeName.toLowerCase();
						if(nn!="#text" && nn!="#comment" && nn!="#document"){
							domStyle.set(node, "display", "none");
							domStyle.set(node, "visibility", "hidden");
						}
					}
					domStyle.set(document.body, "background", "none");
					domConstruct.create("span",{innerHTML:"Close"},domConstruct.create("a",{href:"javascript:window.close()"},document.body));
				}
			});
			fisaSession.utils = new Utils();
			ec.fisa.session.utils = fisaSession.utils;
			return Utils;
		});
                                                                                                                                                                                            

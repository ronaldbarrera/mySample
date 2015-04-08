define([
		"dojo/_base/declare",
		"ec/fisa/widget/Link",
		"dojo/_base/kernel",
		"dojo/text!ec/fisa/widget/templates/BtLink.html",
		"dojo/dom-geometry",
	    "dojo/has",
		"ec/fisa/widget/Utils",      
		"./_base" ],
		function(declare,Link, dojo, template, domGeometry, has) {

			return declare("ec.fisa.mobile.widget.BtLink", [Link ], {
				btId:'',
				fieldId:'',
				fisatabid:'',
				fisapageid:'',
				ftype:'',
				actionMode:'',
				btPos:-1,
				imageSrc:"",
				showLabel:true,
				tabIndex:null,
				_tabIndex:0,
				templateString : template,
				destroyRendering:function(){
					delete this.btId;
					delete this.fieldId;
					delete this.fisatabid;
					delete this.fisapageid;
					delete this.actionMode;
					delete this.btPos;
					delete this.imageSrc;
					delete this.showLabel;
					this.inherited(arguments);
				},
				postMixInProperties:function(){
					this.inherited(arguments);
					if (isNaN(this.btPos)){
						this.btPos=0;
					}
					if(this.tabIndex != null){
						this._tabIndex = this.tabIndex;
					}
				},
				onClick:function(){
					var controller = ec.fisa.controller.utils.getPageController(this.fisatabid,this.fisapageid);
					var messagesPanel = dijit.byId(controller.messagesPanelId);
//					var notificationVal = controller.addNotificationValDataForLinkAction(); COMENTADO PORQUE NO SE HACE TODAVIA NOTIFICACIONES
					messagesPanel.clearAllMessages();
					BtControllerDWR.execLink(this.btId,this.btPos,this.actionMode,this.fieldId,this.fisatabid,this.fisapageid,controller.model.toPlainObject(),/*notificationVal*/null,{callbackScope:this,callback:this.handleButtonResponse});
				},
				handleButtonResponse:function(outcome){
					var controller = ec.fisa.controller.utils.getPageController(this.fisatabid,this.fisapageid);
					if(outcome.aMsgs){
						controller.updateMsgsPanel(outcome.aMsgs);
						//controller.doPanelsLayout();
					}
					if(outcome.format&&outcome.wAxn&&outcome.wAxn=="open"){
						var borderContainerTwo = dijit.byId("borderContainerTwo");
//						var newSize = domGeometry.getMarginBox(borderContainerTwo.domNode);
//						var newSize= ec.fisa.controller.utils.getGlobalModalSize(0.80);
						var href = dojo.config.fisaContextPath;
						var format=outcome.format.toLowerCase();
						var url=dojo.config.fisaContextPath+'/multiregisterLink/format/'+outcome.format;
						if(has("webkit")){
							url+='/browser/webkit';
						}
						url+='/dst/'+outcome.dst;
						if(format=="pdf"){
							href+="/pages/static/image/pdf-viewer.jsp";
						} else {
							href+="/pages/static/image/image-viewer.jsp";
						}
						var args = {imagePath:url, _format: format};
						if(format=="pdf"){
							args.imageWidth=newSize.w;
							args.imageHeight=newSize.h;
						}else{
							if(outcome.width){
								args.imageWidth=outcome.width;
							}
							if(outcome.height){
								args.imageHeight=outcome.height;
							}
						}
						
						  if(has("webkit") && format == "pdf"){
							  var downloadPdfIframeName = "downloadPdfIframe"; 
							  var iframe = dojo.io.iframe.create(downloadPdfIframeName);
							  dojo.io.iframe.setSrc(iframe, url, true);
						  }else{
							  var dialog = ec.fisa.navigation.utils.openHrefFisaDlg("",href,{content:args});
							  if(format=="pdf"){
								
									dialog.resize({w: newSize.w, h: newSize.h}, {w: newSize.w, h: newSize.h});
							  }
						  }
					} else if(outcome.wAxn&&outcome.wAxn=="open"){
						var aditionalParams = {content:{linkParentFisaTabId:this.fisatabid, linkParentFisaPageScopeId:this.fisapageid, linkParentBtId:this.btId}};						
						var newSubTabPaneArg = {href:outcome.dst,title:outcome.dialogName,ioArgs:aditionalParams};
//						if(newSubTabPaneArg.href.slice(-1)!='?'){
//							newSubTabPaneArg.href +="?linkParentBtId="+this.btId+"&linkParentFisaTabId="+this.fisatabid+"&linkParentFisaPageScopeId="+this.fisapageid;
//						}
						ec.fisa.mobile.navigation.utils.openNewBreadCrumb(newSubTabPaneArg/*,controller.breadcrumbId*/);
					}
				},
				postCreate: function(){
					this.inherited(arguments);
					this._init();
				},
				_init:function(){
					if(!this.showLabel){
						this._span.style.display="none";
					}
					if(this.imageSrc){
						//this._span.innerHTML= '';
						//Mantis 0014517: Links aparecen de diferente forma en los navegadores JCVQ
						//Cuando no se puede cargar la imagen se presenta una por defecto.
						var noImagePath = dojo.config.fisaContextPath + "/imageNotFound.jpg";
						var onerrorCall = "this.src = '" + noImagePath + "'";
						
						var linkA = this._span.parentNode;
						linkA.style.color = "transparent"
						var img = dojo.create("img",{'src':this.imageSrc, 'alt':this.label, 'title':this.label, onerror:onerrorCall},this._span.parentNode);
					}
				},
				
				_setEnabledAttr:function(value){
					if(value != null){
						if(value){
							ec.fisa.widget.utils.enableWidget(this);
						} else {
							ec.fisa.widget.utils.disableWidget(this);
						}
					}
				},
				_getEnabledAttr:function(){
					return ec.fisa.widget.utils.isEnabled(this);
				}
			});
		});

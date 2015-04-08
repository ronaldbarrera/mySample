define( [ "dojo/_base/declare",
          "ec/fisa/widget/BtLink",
          "dojo/_base/kernel",
          "dojo/dom-geometry",
          "dojo/has",
          "ec/fisa/dwr/proxy/MultiregisterLinkControllerDWR",
          "./_base",
          "dojo/_base/sniff",
          "dojo/io/iframe"],
		function(declare,BtLink, dojo, domGeometry, has) {

			return declare("ec.fisa.widget.MultiregisterLink", [BtLink ], {
				rowIndex:-1,
				entityId:'',
				_destroyOnRemove: true,
				onClick:function(){
					var controller = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
					MultiregisterLinkControllerDWR.executeAction(this.entityId,this.rowIndex,this.btId,this.fieldId,this.tabId,this.pageScopeId,this.btPos,controller.model.toPlainObject(),{callbackScope:this,callback:this.handleButtonResponse});
					controller = null;
				},
				handleButtonResponse:function(outcome){
					if(outcome.aMsgs){
						this.controller.updateMsgsPanel(outcome.aMsgs);
						this.controller.doPanelsLayout();
					}
					if(outcome.wAxn&&outcome.wAxn=="open"){
						var borderContainerTwo = dijit.byId(dojo.config.fisaStandbyId);
						var newSize= ec.fisa.controller.utils.getGlobalModalSize(0.80);
//						var newSize = domGeometry.getMarginBox(borderContainerTwo.domNode);
						
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
					}
				}
			});
		});

define( [ "dojo/_base/declare",
          "ec/fisa/widget/BtLink",
          "dojo/_base/kernel",
          "dojo/dom-geometry",
          "dojo/has",
          "ec/fisa/dwr/proxy/QueryTemplateFieldRoutineControllerDWR",
          "./_base",
          "dojo/_base/sniff",
          "dojo/io/iframe"],
		function(declare,BtLink, dojo, domGeometry, has) {

			return declare("ec.fisa.widget.QueryTemplateFieldRoutineLink", [BtLink ], {
				rowIndex:-1,
				routine:"",
				fieldId:-1,
				_destroyOnRemove: true,
				onClick:function(){
					QueryTemplateFieldRoutineControllerDWR.executeAction(this.fieldId,this.rowIndex,this.tabId,this.pageScopeId,this.routine,{callbackScope:this,callback:this.handleButtonResponse});
				},
				handleButtonResponse:function(outcome){
					var controller = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
					controller.clearPanelMessage();
					if(outcome.aMsgs){
						controller.updateMsgsPanel(outcome.aMsgs);
						//controller.doPanelsLayout();
					}
					if(outcome.wAxn&&outcome.wAxn=="open"){
						var borderContainerTwo = dijit.byId(dojo.config.fisaStandbyId);
						var newSize = domGeometry.getMarginBox(borderContainerTwo.domNode);
						
						var href = dojo.config.fisaContextPath;
						var format=outcome.format.toLowerCase();
						var url=dojo.config.fisaContextPath+'/multiregisterLink/format/'+outcome.format;
						if(has("webkit")){
							url+='/browser/webkit';
						}
						url+='/dst/'+outcome.dst;
						if(format=="pdf"){
							href+="/pages/static/image/pdf-viewer.jsp";
						} else if(format=="html"){
							href+="/pages/static/image/html-viewer.jsp";
							url = outcome.dst;
						} else {
							href+="/pages/static/image/image-viewer.jsp";
						}
						var args = {imagePath:url, _format: format};
						if(format=="pdf" || format == "html"){
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
						//mantis 18263 for ipad it must not show this iframe but the desktop dialog.
						  if(has("webkit") && format == "pdf" && navigator.userAgent.match(/iPad/i) == null){
							  var downloadPdfIframeName = "downloadPdfIframe"; 
							  var iframe = dojo.io.iframe.create(downloadPdfIframeName);
							  dojo.io.iframe.setSrc(iframe, url, true);
						  }else{
							  
							  if(format == "html"){
								  window.open(url);	  
							  }
							  else{
								  var dialog = ec.fisa.navigation.utils.openHrefFisaDlg("",href,{content:args});
								  if(format=="pdf" ){
									  dialog.resize({w: newSize.w, h: newSize.h}, {w: newSize.w, h: newSize.h});
								  }
							  }
						  }
						
						
					} 					
				}
			});
		});

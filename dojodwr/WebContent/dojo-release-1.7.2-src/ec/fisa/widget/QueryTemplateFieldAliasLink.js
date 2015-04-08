define( [ "dojo/_base/declare",
          "ec/fisa/widget/BtLink",
          "dojo/_base/kernel",
          "dojo/dom-geometry",
          "dojo/has",
          "ec/fisa/widget/ConfirmDialog",
          "ec/fisa/dwr/proxy/QueryTemplateFieldAliasControllerDWR",
          "./_base",
          "dojo/_base/sniff",
          "dojo/io/iframe",
          "ec/fisa/grid/Utils"],
		function(declare,BtLink, dojo, domGeometry, has, ConfirmDialog) {

			return declare("ec.fisa.widget.QueryTemplateFieldAliasLink", [BtLink ], {
				rowIndex:-1,
				fieldIndex:-1,
				maskedValue:null,
				gridId:null,
				originalValueIndex:null,
				maskId:null,
				substitutionFdk:null,
				_destroyOnRemove: true,
				colDef:null,
				onClick:function(){
					//<<Mantis 18523 JCVQ, Se calcula correctamente el indice de fila.
					var qtGrid = dijit.byId(this.gridId);
					var realIndex = ec.fisa.grid.utils.obtainInitialViewableMrIndex(qtGrid) +  parseInt(this.rowIndex,10);
					QueryTemplateFieldAliasControllerDWR.executeAction(this.fieldIndex,realIndex,this.originalValueIndex,this.maskId, this.tabId,this.pageScopeId,this.substitutionFdk, this.gridId,{callbackScope:this,callback:this.handleButtonResponse});
					//Mantis 18523>>
				},
				handleButtonResponse:function(outcome){
					var controller = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
					if(outcome.aMsgs){
						controller.updateMsgsPanel(outcome.aMsgs);
						controller.doPanelsLayout();
					}
					if(outcome.wAxn&&outcome.wAxn=="open"){
						//var ioArgs = {'maskId': outcome.maskId,'discriminationData':outcome.discriminationData,'originalValue':outcome.originalValue};
						var dlgConfirm = new ConfirmDialog({
							acceptDialogLabel : "Aceptar",
							cancelDialogLabel : "Cancelar",
							disableCloseButton:true,
							href: outcome.hrefAlias,
							acceptAction:this.dlgAccept,
							cancelAction:this.dlgCancel,
							//style:"height:250px;width:450px;overflow: auto;",
							showTitle:false
						});
						dlgConfirm.tabId = this.tabId;
						dlgConfirm.pageScopeId = this.pageScopeId + "_aliasDialog";
						dlgConfirm.show();
					}
				},
				
				dlgAccept:function(){
					var controller = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
					controller.save();
				},
				dlgCancel:function(){
					var controller = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
					controller.cancel();
				}
			});
		});

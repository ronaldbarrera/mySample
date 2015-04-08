/**
 * Custom widget of confirmation.
 * */
define(["dojo", "dojox/widget/DialogSimple", "dijit/_WidgetBase",
        "dojo/dom-style",
        "./_base","dojox/layout/ContentPane","ec/fisa/controller/Utils"], 
        function(dojo,  DialogSimple ,_WidgetBase,domStyle){
	return dojo.declare("ec.fisa.widget.DialogSecurity", [_WidgetBase], {
		_closeButtonNode:null,
		_contentPane:null,
		_bw:null,
		/**list of security factors to be shown.*/
		secListFactor:null,
		wdgtWidth:null,
		wdgtHeight:null,
		disableCloseButton: true,
		secBeforeListFactorIndex:0,
		tabId:null,
		pageScopeId:null,
		draggable:false,
		pageScopeIdFactor:null,

		/* *********************************************************** postCreate */
		buildRendering:function(){
			//secBeforeListFactorIndex = 0;
			this.initContentPane();
		},
			
		initContentPane: function(){
			
			if(this.secListFactor != null && this.secListFactor.length > 0 && this.secListFactor.length > this.secBeforeListFactorIndex){
				var factorConf = this.secListFactor[this.secBeforeListFactorIndex];
				this.pageScopeIdFactor = this.pageScopeId+"_factor_"+this.secBeforeListFactorIndex ;
				this.href = dojo.config.fisaContextPath+ factorConf.contextFactor.businessId;
				var argsCnt = {content:{'serviceId':factorConf.contextFactor.serviceId,'FTabId':this.tabId, 'FPageScopeId':this.pageScopeIdFactor,'calledFrmDlg':true}};
				this._bw=new dojox.widget.DialogSimple({'href':this.href,'title':this.title,'disableCloseButton':this.disableCloseButton,'ioArgs':argsCnt,'style':this.style,'draggable':this.draggable,
				'onDownloadEnd':dojo.hitch(this,function(){
//					console.log("Download complete!");
					var factorController = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeIdFactor);
					//connect onSuccessEvent all factor must implement this 
					this._bw.connect(factorController,"onSucessEvent",dojo.hitch(this,function(argument){
						this.dlgSuccessEvent(argument);
						ec.fisa.controller.utils.uninitializeController(this.tabId, this.pageScopeIdFactor);
						this.secBeforeListFactorIndex= this.secBeforeListFactorIndex+1;
						this.destroyDialog();
					}));
					
					this._bw.connect(factorController,"onCancelEvent",dojo.hitch(this,function(argument){
						ec.fisa.controller.utils.uninitializeController(this.tabId, this.pageScopeIdFactor);
						this.dlgCancelEvent(argument);
						this.destroy(false);
					}));
					})
				});
				this._bw._onKey = function(evt){
					if(this.disableCloseButton && evt.charOrCode == dojo.keys.ESCAPE){
						return;
					}
					console.log("Onkey over DialogSecurity");
					//this.inherited(arguments);
				};
				this._bw.show();
				this._updateCloseButtonState();
				domStyle.set(this._bw.containerNode, "height", this.wdgtHeight-60 + "px");
				domStyle.set(this._bw.containerNode, "overflow", "auto");
			}else{
				// closes the dialog and opens success event for the bt.
				this.dlgSuccessEvent("Closed dialog event successful");
			}
		},
		
		destroyDialog:function(){
				var t=this._bw;
				this._bw=null;
				t.destroy(false);
		
		},
		
		/**Event launched when all the factors being sucessful. */
		dlgSuccessEvent:function(arg){
			//this.destroy(false);
			//override this method on instance constructor.
		},
		
		/**Event launched when an error has ocurred. */
		dlgCancelEvent:function(arg){
			//override this method on instance constructor.
		},
		/* ********************************************** _updateCloseButtonState */
		_updateCloseButtonState: function()
		{
			dojo.style(this._bw.closeButtonNode,
					"display",this.disableCloseButton ? "none" : "block");
		},

		show:function(){
			if(this._bw){
				this._bw.show();
			}
		},
		
		_acceptAction: function(){
			this.destroy(false);
		},
		destroy:function(){
			if(this._bw){
				this._bw.destroy(false);
			}
			this.inherited(arguments);
		}
	});
});

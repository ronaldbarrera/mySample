define( [ "dijit/_WidgetBase", "dijit/_Templated", "dojo/_base/declare","dojo/text!./templates/ConfirmDialog.html","dojox/mobile/SimpleDialog","./_base"],
		function(_Widget, _Templated, declare,template) {

			return declare("ec.fisa.mobile.widget.ConfirmDialog", [ _Widget, _Templated], {
				widgetsInTemplate : true,
				templateString : template,
				title:"",
				content:"",
				acceptDialogLabel:"",
				cancelDialogLabel:"",
				disableCancelButton:false,
				_dialog:null,
				_acceptBtn:null,
				_cancelBtn:null,
				acceptAction:function(){
					
				},
				cancelAction:function(){
					
				},
				postMixInProperties:function(){
					this.inherited(arguments);
				},
				startup:function(){
					this.inherited(arguments);
				},
				buildRendering:function(){
					this.inherited(arguments);
					//this._dialog.removeCover();
					if(this.disableCancelButton){
						this._cancelBtn.domNode.style.display="none";
					} else {
						//this._cancelBtn.connect(this,"onClick",this.cancelAction);
						this._cancelBtn.onClick=this.cancelAction;
					}
					//this._acceptBtn.connect(this,"onClick",this.acceptAction);
					this._acceptBtn.onClick=this.acceptAction;
				},
				show:function(){
					this._dialog.show();
				},
				hide:function(){
					this._dialog.hide();
				},
				destroy:function(){
					if(this._dialog!=null){
						this._dialog.destroy(arguments);
					}
					this.inherited(arguments);
				}
			});
		});

define( [ "dojo/_base/declare","dojox/mobile/Button","ec/fisa/controller/Utils","./_base"],
		function(declare, Button) {

			return declare("ec.fisa.mobile.widget.QtParameterButton", [ Button], {
				'field-id':"",
				fisatabid:'',
				fisapageid:'',
				buildRendering:function(){
					this.inherited(arguments);
					var fid=this['field-id'];
					if(fid=='LBL_SEARCH'){
						this.onClick=this.searchAction;
					}
				},
				searchAction:function(){
					this.getController().search(true,true);
				},
				getController:function(){
					return ec.fisa.controller.utils.getPageController(this.fisatabid,this.fisapageid);
				}
			});
		});

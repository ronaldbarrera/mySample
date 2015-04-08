define( [ "dojo/_base/declare",
          "dojo/_base/kernel",
          "dijit/form/Select",
          "ec/fisa/controller/Utils",
          "./_base" ],
		function(declare, dojo, Select) {
			return declare("ec.fisa.widget.tsc.ChannelAppOptionsManagerSelect", [ Select ], {
				tabId:"",
				pageScopeId:"",
				postCreate:function(){
					this.inherited(arguments);
					var controller = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
					controller.setChannelComboId(this.id);
				}
			});
		});
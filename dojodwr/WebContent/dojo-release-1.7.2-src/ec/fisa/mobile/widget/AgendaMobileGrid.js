define( [ "dojo/_base/declare",
          "dojo/_base/kernel",
          "ec/fisa/mobile/widget/Grid",
          "dojox/mobile/TabBar",
  		  "dojox/mobile/TabBarButton",
  		  "dojo/dom-construct",
          "./_base"],
		function(declare,dojo,Grid,TabBar,TabBarButton,domConstruct) {

			return declare("ec.fisa.mobile.widget.AgendaMobileGrid", [Grid], {
				fisatabid:"",
				fisapageid:"",
				constructor: function(btId,fisatabid,fisapageid){
					this.btId = btId;
					this.fisatabid = fisatabid;
					this.fisapageid = fisapageid;
				},
				
				postMixInProperties:function(){
					this.inherited(arguments);
//					this.actionTabBar();
				},
				
//				actionTabBar:function(){
//					var viewn=dijit.byId("viewPort");
//					var tabBar = new TabBar({
//						'class':'mblActionTabBar',
//						'single':'true',
//						'fixed':'bottom',
//						'barType':'slimTab',
//						'fill':'always'
//					},domConstruct.create("ul",null,viewn.containerNode));
//					var tab0 = new TabBarButton({
//						'label':'Nuevo',
//						'class':'mblActionTabBarButton'},domConstruct.create("li",null,tabBar.domNode));
//				},
				attachActions:function(item,checkBox){
					var itemuno=item;
					var check=checkBox;
				},
				
				startup:function(){
					this.inherited(arguments);
					var ctrlr=ec.fisa.controller.utils.getPageController(this.fisatabid,this.fisapageid);
					ctrlr.agendaDataGrid=this.id;
					//ctrlr.initAgendaGrid(this.id);
				},
				
				buildRendering:function(){
					this.inherited(arguments);
				},
				
				destroy:function(){
					this.inherited(arguments);
				},
				
				getFisaStore: function(){
					return ec.fisa.controller.utils.getPageController(this.fisatabid,this.fisapageid).store;
				}
			});
		});

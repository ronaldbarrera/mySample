define( [ "dojo/_base/declare",
          "dojo/_base/kernel",
          "ec/fisa/mobile/widget/Grid",
          "dojox/mobile/TabBar",
  		  "dojox/mobile/TabBarButton",
  		  "dojo/dom-construct",
  		  "dojox/mobile/Button",
          "./_base"],
		function(declare,dojo,Grid,TabBar,TabBarButton,domConstruct,Button) {

			return declare("ec.fisa.mobile.widget.QtGrid", [Grid], {
				fisatabid:"",
				fisapageid:"",
				actions:null,
				independentActions:null,
				newActions:null,
				newIndependentActions:null,
				hideQTGridIfNoResultsFound:false,
				hideQTPortletIfNoResultsFound:false,
				pageLength:0,
				paginationLabelBack:'',
				paginationLabelNext:'',
				paginationLabelof:'',
				
//				constructor: function(btId,fisatabid,fisapageid){
//					this.btId = btId;
//					this.fisatabid = fisatabid;
//					this.fisapageid = fisapageid;
//				},
				
				postMixInProperties:function(){
					this.inherited(arguments);
					this.newActions=[];
					this.newIndependentActions=[];
					dojo.forEach(this.actions,function(action){
						var contains=false;
						if(this.independentActions!=null){
							for(var i =0; i<=this.independentActions.length;i++){
								if(action.value==this.independentActions[i]){
									contains=true;
									break;
								}
							}
						}
						if(contains){
							this.newIndependentActions.push({value:action.value,label:action.label});
						} else {
							this.newActions.push({value:action.value,label:action.label});
						}
					},this);
					
				},
				
				startup:function(){
					this.inherited(arguments);
					var ctrlr=ec.fisa.controller.utils.getPageController(this.fisatabid,this.fisapageid);
					if(this.pageLength){
						ctrlr.model.setValue(['count'],this.pageLength);
						ctrlr.model.setValue(['start'],0);
					}
					var plainModel = ctrlr.model.toPlainObject();
					this.setQuery(plainModel);
					ctrlr.qtGridId=this.id;
				},
				
				buildRendering:function(){
					this.inherited(arguments);
					var fc = ec.fisa.controller.utils.getPageController(this.fisatabid,this.fisapageid);
					if(this.independentActions!=null){
						var table = domConstruct.create("table",{'border':0,'cellpading':0,'cellspacing':0,'width':'100%','class':'qtTableQtActions'});
						var tr = domConstruct.create("tr",null,table);
						
						dojo.forEach(this.getActionsNoSelectables(),function(independentAction){
							var td = domConstruct.create("td",null,tr);
							var actionBtn = new Button({'class':'mblQtActionBtn','label':independentAction.label},domConstruct.create("div",{},td));
							actionBtn.on("click",dojo.hitch(fc,fc.executeAction,false,independentAction.value,null));
						},this);
						this.getParent().containerNode.insertBefore(table,this.getParent().containerNode.children[0].nextSibling);
					}
					
				},
				
				getActionsSelectables: function(){
					return this.newActions;
				},
				
				getActionsNoSelectables:function(){
					return this.newIndependentActions;
				},
				
				destroy:function(){
					this.inherited(arguments);
				},
				
				getFisaStore: function(){
					return ec.fisa.controller.utils.getPageController(this.fisatabid,this.fisapageid).store;
				}
			});
		});

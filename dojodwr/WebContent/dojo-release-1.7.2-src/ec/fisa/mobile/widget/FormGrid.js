define( [ "dijit/_WidgetBase",
          "dojo/_base/declare",
          "dojo/_base/kernel",
          "dojox/mobile/GridLayout",
          "dojox/mobile/_DataListMixin",
  		  "dojo/dom-construct",
  		  "dojo/_base/array",
  		  "dojox/mobile/ContentPane",
  		  "dojox/mobile/TextBox",
          "./_base"],
		function(_Widget,declare,dojo,GridLayout,DataListMixin,domConstruct,array,ContentPane,TextBox) {

			return declare("ec.fisa.mobile.widget.FormGrid", [_Widget,DataListMixin], {
				fisatabid:"",
				fisapageid:"",
				
				pageLength:"",
				newButtonLabel:"",
				selectButtonLabel:"",
				editButtonLabel:"",
				deleteButtonLabel:"",
				addNewButton:"",
				btId:"",
				entId:"",
				structure:null,
				selectionMode:"",
				initialWidth:"",
				style:"",
				autoHeight:"",
				keys:null,
				block:"",
				btPos:"",
				selectable:"",
								
				constructor:function(){
					this.addNewButton = false;
				},
				
				startup:function(){
					this.inherited(arguments);
					var ctrlr=ec.fisa.controller.utils.getPageController(this.fisatabid,this.fisapageid);
					ctrlr.registerTable(this);
					ctrlr.addParamToModel(this,false);
//					var ctrlr=ec.fisa.controller.utils.getPageController(this.fisatabid,this.fisapageid);
//					var plainModel = ctrlr.model.toPlainObject();
//					this.setQuery(plainModel);
//					ctrlr.qtGridId=this.id;
				},

				postMixInProperties:function(){
					this.inherited(arguments);
					this.pKeyStr = dojo.toJson(this.keys.PK);
					this.fKeyStr = dojo.toJson(this.keys.FK);
					this.store=new ec.fisa.dwr.Store("BtControllerDWR","viewEditableMultivalueDataDirect",this.fisatabid, this.fisapageid,[this["fisa-bt-id"],this.btId,this.entId,this.pKeyStr]);
					this.store.onNew=this.handleNew;
					this.store.onSet=this.handleSet;
				
					/*if(this.addNewButton === false){
						//dont show new button.
						this.block.n = true;
					}
					
					var pagination={newBlocked:this.block.n, onNewExecute:this.execNew,tabIndexField:this.tabIndexField};
					if(this.plugins){
						this.plugins.fisaPagination=pagination;
					} else {
						this.plugins={fisaPagination:pagination};
					}*/
				},
								
				buildRendering:function(){
					this.inherited(arguments);
//					var fc = ec.fisa.controller.utils.getPageController(this.fisatabid,this.fisapageid);
					
				},
				
				/**
				 * sobreescibe el Metodo generateList del DataListMixin
				 */
				generateList: function(/*Array*/items, /*Object*/dataObject){
					// summary:
					//		Given the data, generates a list of items.
					if(!this.append){
						array.forEach(this.getChildren(), function(child){
							child.destroyRecursive();
						},this);
					}
					var widget = new GridLayout({cols:this.numberOfCols()},domConstruct.create("div",{'class':'multiRegistryGridLayout','style':'width:'+(window.innerWidth-49)+'px;'},this.domNode));
					array.forEach(items, function(item, itemIndex){
						array.forEach(this.structure[0].cells, function(column,columnIndex){
							column.grid=this;
							column.grid.id = this.id;
							var value = this.store.getValue(item, column.field);
							var formated_column;
							if(column.formatter!=null /*&& value != null*/){
								formated_column = column.formatter(value,itemIndex,column,item);
							}
							var pane = null;
							if(columnIndex%2==0){
								pane = new ContentPane({'class':'multiregistryOddPane'});
								domConstruct.place(formated_column,pane.domNode,"first");	
							}else{
								pane = new ContentPane({'class':'multiregistryEvenPane'});
								formated_column.placeAt(pane.domNode);
							}
							widget.addChild(pane);	
							
						},this);
					}, this);
					
				},
				
				numberOfCols:function() {
					return 1;
				},
				
				handleSet:function(){
				},
				handleNew:function(/*item*/ newItem, /*object?*/ parentInfo){
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

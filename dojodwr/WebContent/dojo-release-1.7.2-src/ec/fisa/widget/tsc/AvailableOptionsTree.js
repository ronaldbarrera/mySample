define( [ "dojo/_base/declare",
          "dojo/_base/kernel",
          "dojo/dom-construct",
          "dijit/Tree",
          "ec/fisa/dwr/Store",
          "ec/fisa/dwr/proxy/tsc/MenuEditionAdminControllerDWR",
          "dojo/data/ItemFileWriteStore",
          "dijit/tree/dndSource",
          "ec/fisa/dwr/TreeStoreModel",
          "./_base" ],
		function(declare, dojo, domConstruct, Tree) {

			return declare("ec.fisa.widget.tsc.AvailableOptionsTree", [ Tree ], {
				tabId:'',
				pageScopeId:'',
				copyOnly:true,
				selfAccept:false,
				_selectedNode:null,
				showRoot:false,
				additionalParams:[],
				isFindItem : false,
				dndParams: ["onDndDrop","itemCreator","onDndCancel","checkAcceptance", "checkItemAcceptance", "dragThreshold", "betweenThreshold", "deleteSelectedNodes"],
				dndController:"dijit.tree.dndSource",
				//Contiene el modelo con todos los nodos del arbol, necesario para realizar varias busquedas.
				modelAllTree : null,
				postMixInProperties:function(){
					this.inherited(arguments);
					this.store=new ec.fisa.dwr.Store("MenuEditionAdminControllerDWR","viewAvailableTransacctions",this.tabId,this.pageScopeId,this.additionalParams,null);
					var itemModel=new ec.fisa.dwr.TreeStoreModel({childrenAttrs:["items"],labelAttr:"name",query:{},store:this.store});
					this.model=itemModel;
					this.dragThreshold=8;
					this.betweenThreshold=5;
					this.persist=false;
				},
				postCreate:function(){
					var params=this.store.getAdditionalParams();
					params[0]=this.getChannelValue();
					this.store.setAdditionalParams(params);
					this.inherited(arguments);
				},
				checkAcceptance:function(source,nodes){
					return true;
				},
				checkItemAcceptance:function(node,source,position){
					return false;
				},
				deleteSelectedNodes:function(){
					return true;
				},
				getIconClass:function(item){
					if(!item) {
						return "itemFolder";
					}
					if(this.store.getValue(item, "leaf")===true){
						if(this.store.getValue(item,"type") == "ITEM_QUERY_TEMPLATE"){
							return "qtIconMenu";
						}
						else{
							return "itemLeaf";
						}
					}
					return "itemFolder";
				},
				refreshAvailableTree : function() {
					this.set("store",new ec.fisa.dwr.Store("MenuEditionAdminControllerDWR","viewAvailableTransacctions",this.tabId,this.pageScopeId,[this.getChannelValue(),"isReloadTree"],null));
				},
				_onNodeMouseEnter : function(node) {
					if(this.isFindItem == true){
						this._setSelectedItemAttr(node.item);
						this.isFindItem = false;
					} 
				},
				getNodeById: function(id){
			        return this._itemNodesMap[id][0];
			    },
				getChannelValue:function(){
					var ctrlr=ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
					var cmpChannels=dijit.byId(ctrlr.channelComboId);
					return cmpChannels.get("value");
				}
			});

		});

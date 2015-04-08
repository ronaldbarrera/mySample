define( [ "dojo/_base/declare",
          "dojo/_base/kernel",
          "dojo/dom-construct",
          "dijit/Tree",
          "ec/fisa/dwr/Store",
          "ec/fisa/dwr/proxy/tsc/TranslatorTreeDWR",
          "dojo/data/ItemFileWriteStore",
          "dijit/tree/dndSource",
          "ec/fisa/dwr/TreeStoreModel",
          "./_base" ],
		function(declare, dojo, domConstruct, Tree) {
	
			return declare("ec.fisa.widget.tsc.TranslatorTargetTree", [ Tree ], {
				tabId:'',
				pageScopeId:'',
				copyOnly:true,
				selfAccept:false,
				_selectedNode:null,
				showRoot:false,
				dndParams: ["onDndDrop","itemCreator","onDndCancel","checkAcceptance", "checkItemAcceptance", "dragThreshold", "betweenThreshold", "deleteSelectedNodes"],
				dndController:"dijit.tree.dndSource",
				translatorTarget : null,
				postMixInProperties:function(){
					this.inherited(arguments);
					var ctrl = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
					this.store=new ec.fisa.dwr.Store("TranslatorTreeDWR","viewTargetTransacctions",this.tabId,this.pageScopeId,[ctrl.translatorTarget,ctrl.targetType],null);
					var itemModel=new ec.fisa.dwr.TreeStoreModel({childrenAttrs:["items"],labelAttr:"name",query:{},store:this.store});
					this.model=itemModel;
					this.dragThreshold=8;
					this.betweenThreshold=5;
					this.persist=false;
				},
				checkAcceptance:function(source,nodes){
							
					return false;
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
					if(this.store.getValue(item, "leaf")===false){
						return "itemFolder";
					}
					return "itemLeaf"
				}
			});

		});

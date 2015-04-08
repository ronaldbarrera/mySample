define( [ "dojo/_base/declare",
          "dojo/_base/kernel",
          "dojo/dom-construct",
          "dijit/Tree",
          "ec/fisa/dwr/Store",
          "ec/fisa/dwr/proxy/UserHomeAdminDWR",
          "dojo/data/ItemFileWriteStore",
          "dijit/tree/dndSource",
          "ec/fisa/dwr/TreeStoreModel",
          "./_base" ],
		function(declare, dojo, domConstruct, Tree) {
			return declare("ec.fisa.widget.tsc.RouteComponentTree", [ Tree ], {
				copyOnly:true,
				selfAccept:false,
				_selectedNode:null,
				showRoot:false,
				/*Id del Tab actual*/
				tabId:'',
				/*Id de la pagina actual*/
				pageScopeId:'',
				/*Controller DWR a ejecutar*/
				controller:'',
				/*Metodo del Controler DWR a ejecutar*/
				method:'',
				/*Define el tipo de elementos se debe obtener*/
				elementType:'',
				dndParams: ["onDndDrop",
				            "itemCreator",
				            "onDndCancel",
				            "checkAcceptance", 
				            "checkItemAcceptance", 
				            "dragThreshold", 
				            "betweenThreshold", 
				            "deleteSelectedNodes"],
				dndController:"dijit.tree.dndSource",
				postMixInProperties:function() {
					this.inherited(arguments);
					this.store = new ec.fisa.dwr.Store(
							this.controller, 
							this.method,
							this.tabId, 
							this.pageScopeId, 
							[this.elementType], 
							null);
					var itemModel = new ec.fisa.dwr.TreeStoreModel({childrenAttrs:["items"], labelAttr:"name", query:{}, store:this.store});
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
					var elementClass='class_';
					if(!item) {
						return "class_generic";
					}else{
						var arr = item.split("_");
						if(arr[2]!=null){
							elementClass=elementClass.concat(arr[2]);
							return elementClass;
						}
						
					}
					if(this.store.getValue(item, "leaf")===true){
						return "class_generic";
					}
					return "class_generic"
				}
			});

		});

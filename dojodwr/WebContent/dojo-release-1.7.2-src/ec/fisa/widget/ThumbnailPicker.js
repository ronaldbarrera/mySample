define(
		[
		"dojo/_base/declare",
		"dojo/_base/kernel",
		"dojo/dom-construct",
		"dojox/image/ThumbnailPicker",
		"dojo/text!ec/fisa/widget/templates/ThumbnailPicker.html",
		"ec/fisa/dwr/Store",
		"./_base" ],
		function(declare, dojo, domConstruct, ThumbnailPicker,template) {

			return declare("ec.fisa.widget.ThumbnailPicker", [ ThumbnailPicker ], {
				tabId:'',
				pageScopeId:'',
				_selectedNode:null,
				templateString: template,
				buildRendering:function(){
					this.inherited(arguments);
					var itemRequest = {
							query: {},
							count: 20
					};
					var itemNameMap = {
						imageThumbAttr: "thumb",
						imageLargeAttr: "large"
					};
					this.setDataStore(new ec.fisa.dwr.Store("UserHomeAdminDWR","viewAvailableLayouts",this.tabId,this.pageScopeId,[this.pageScopeId],null), itemRequest, itemNameMap);
					this.subscribe(this.getClickTopicName(), this.selectOne);
				},
				destroy:function(){
					delete this.selectedNode;
					this.inherited(arguments);
				},
				selectOne:function(item){
					this._selectedNode.innerHTML="";
					domConstruct.create("img",{src:item.largeUrl,alt:"Cargando..."},this._selectedNode);
					this.selectedId=item.data;
					var tr=this.getParent().getParent().getChildren()[2].domNode.firstElementChild.firstElementChild.firstElementChild;
					var img =tr.cells[1].firstElementChild;
					img.src=item.largeUrl;
				}
			});

		});

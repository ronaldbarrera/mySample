define([
	"dojo/_base/declare",
	"dojox/mobile/RoundRect",
	"dojo/dom-construct",
	"dojox/mobile/_DataListMixin",
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/_WidgetBase",
	"dojo/_base/array",
	"dojox/mobile/SwapView",
	"dojox/mobile/Heading",
	"dojo/number",
	"dojo/dom-attr",
	"dojox/mobile/ScrollableView" 
], function(declare, RoundRect, domConstruct, DataListMixin,Contained,Container,WidgetBase,array,SwapView,Heading,number,domAttr,ScrollableView){

	return declare("ec.fisa.mobile.widget.RoundRectSwapDataList", [Contained,Container,WidgetBase,DataListMixin], {
		
		/*ids de los swapViews que se generan*/
		swapViewId: null,
		/*ids de los roundrects que se generan */
		roundRectIds: null,
		
		islayout:null,
		
		/*Paginacion*/
		currentPage: 0,
		pageLength: 0,
		paginationLabelBack:'',
		paginationLabelNext:'',
		paginationLabelof:'',
		
		// summary:
		//		A dojo/data-enabled version of RoundRectList.
		// description:
		//		RoundRectDataList is an enhanced version of RoundRectList. It
		//		can generate ListItems according to the given dojo/data store.
		
		buildRendering: function(){
			this.domNode = this.srcNodeRef || domConstruct.create(this.tag);
			this.inherited(arguments);
		},
		
		
		createHeaderListItem:function(column,columnIndex){
			//funcion sobreescrita por la implementacion
		},
		
		createListItem: function(/*Object*/item,index,parentBody){
			//funcion sobreescrita por la implementacion
		},

		countVisibleColumns: function(){
			//funcion sobreescrita por la implementacion
		},
		
		numberColumns: function(){
			//funcion sobreescrita por la implementacion
		},
		
		numberColsPerSwap: function(){
			//funcion sobreescrita por la implementacion
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
				
				array.forEach(this.swapViewId,function(id){
					var sv = dijit.byId(id);
					if(sv){
						sv.destroyRecursive(false);
					}
				});
				
			}
			/*numero de columnas por cada swapView*/
			var numberCols = this.numberColumns();
			/*total de items de la lista*/
			var totalItems = dataObject._totalMatchedItems;
			var totalPages = Math.ceil(totalItems/this.pageLength);
			
			
			/*headers*/
			headers = [];
			headerTables = [];
			headerTbody = [];
			/*body*/
			var roundRects = [];
			var tables = [];
			var tbody = [];
			this.swapViewId=[];
			this.roundRectIds=[];
			
			for(i = 0;i<=numberCols;i++){
				var swapView;
				if(this.islayout){
					swapView = new dojox.mobile.ContentPane(null,domConstruct.create("div",{'style':'heigth:auto;'},this.domNode));
				}else{
					swapView = new SwapView(null,domConstruct.create("div",{'style':'heigth:auto;'},this.domNode));
					swapView.resize=function(){
							this.domNode.style.height = 'auto';
							array.forEach(this.getChildren(), function(child){
								if(child.resize){ child.resize(); }
							});
					};
				}
							
				/*headers*/
				headers[i] = new Heading({},domConstruct.create("div",{'class':'qtHeadingTableSwapView'},swapView.domNode));
				headerTables[i] = domConstruct.create("table",{'border':0,'cellpading':0,'cellspacing':0,'width':'100%'},headers[i].domNode);
				headerTbody[i] = domConstruct.create("tbody",{},headerTables[i]);
				/*body*/
				roundRects[i] = new RoundRect({},domConstruct.create("div",{'class':'qtRoundRectSwapView'},swapView.domNode));
				this.roundRectIds[i] = roundRects[i].id;
				var tableid = roundRects[i].id+'table'+i;
				var tbodyid = roundRects[i].id+'tbody'+i;
				tables[i] = domConstruct.create("table",{'border':0,'cellpading':0,'cellspacing':0,'width':'100%','id':tableid,'class':'qtTableSwapView'},roundRects[i].domNode);
				tbody[i] = domConstruct.create("tbody",{'id':tbodyid},tables[i]);
				
				swapView.startup();
				this.swapViewId[i] = swapView.id;/*añade el id de cada swapView en el arreglo*/
			}
			
			array.forEach(this.getParent().structureNoHidden, function(column,columnIndex){
				this.createHeaderListItem(column,columnIndex);
			}, this);
			
			array.forEach(items, function(item, index){
				this.createListItem(item,index,tbody);/*implementado en Grid.js*/
//				this.addChild(this.createListItem(item));/*codigo orignal*/
			}, this);
			
			/*paginacion*/
			if(this.pageLength<=totalItems){
				array.forEach(tbody, function(tbody, index){
					this.createPagination(roundRects[index].domNode,totalPages,this.currentPage);
				},this);
			}
		},
		
		
		createPagination:function(fatherNode,totalPages,currentPage){
			//funcion sobreescrita por la implementacion
		},
		
		paginationBack: function(){
			//funcion sobreescrita por la implementacion
		},
		
		paginationNext: function(){
			//funcion sobreescrita por la implementacion
		},
		
		updateModel: function(/*Array*/valueOfModel,/*Object*/newValue){
			//funcion sobreescrita por la implementacion
		},
		
		nextSwap: function(){
			//funcion sobreescrita por la implementacion
		},
		
		previousSwap: function(){
			//funcion sobreescrita por la implementacion
		},
		
		onSelect: function(){
			//funcion sobreescrita por la implementacion
		}
		
	});
});
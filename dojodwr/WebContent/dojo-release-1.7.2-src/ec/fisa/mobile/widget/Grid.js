define( [ "dijit/_WidgetBase",
          "dojo/_base/declare",
          "ec/fisa/mobile/widget/RoundRectSwapDataList",
          "dojox/mobile/ListItem",
          "dojo/dom-construct",
          "dojo/_base/array",
          "dojox/mobile/SimpleDialog",
          "dojox/mobile/Button",
          "dojo/_base/window",
          "dojo/_base/kernel",
          "dojox/mobile/Heading",
          "dojox/mobile/CheckBox",
          "dojo/number",
          "dojo/on",
          "dojo/dom-attr",
          "dojo/_base/lang",
          "dojox/grid/DataGrid",
          "ec/fisa/mobile/_base"],
      function(_Widget,declare,RoundRectSwapDataList,ListItem,domConstruct,array,SimpleDialog,Button,Window,dojo,Heading,CheckBox,number,on,domAttr,lang,DataGrid) {
		
	return declare("ec.fisa.mobile.Grid", [ _Widget], {
		_input:null,
		ftype:"qt",
		classStyle:"",
		_dataList:null,
		structure:null,
		structureNoHidden:null,
		selectionMode:"",
		actions:null,
		_simpleDialog:null,
		indexSelected: null,	
		islayout:false,
		
		
		postMixInProperties:function(){
			this.inherited(arguments);
			var newStructure = [];
			var i=0;
			/*agrega un booleano para identificar en que lado de la columna va a ir un TD extra para colocar las flechas de 
			 * navegacion del SwapView*/
			array.forEach(this.structure, function(column,index){
				var hidden = column.hidden||false;
				if(!hidden){
					newStructure[i] = column;
					column.left=false;
					column.right=false;
					i++;
				}
			},this);
			this.structureNoHidden = newStructure;
			
			/*coloca el respectivo booleano en true identificando la columna donde se puede agregar el TD, se implementa 
			 * en la funcion createHeaderListItem y createTableItem*/
			array.forEach(this.structureNoHidden,function(column,index){
				/*right Side*/
				if((index%this.numberColsPerSwap())+1==this.numberColsPerSwap() && index!=this.structureNoHidden.length){
					column.right = true;
				}
				/*left side*/
				if((index%this.numberColsPerSwap())==0 && index!=0){
					column.left = true;
				}
			},this);
			
			
			if(this.independentActions && lang.isString(this.independentActions)){
				this.independentActions=lang.getObject(this.independentActions);
			}
		},
		
		
		buildRendering:function(){
			this.inherited(arguments);
			this._dataList = new RoundRectSwapDataList({
				'store':null,
				'createListItem':this.createListItem,
				'createTableItem':this.createTableItem,
				'createHeaderListItem':this.createHeaderListItem,
				'select':this.selectionMode,
				'countVisibleColumns':this.countVisibleColumns,
				'numberColumns':this.numberColumns,
				'numberColsPerSwap':this.numberColsPerSwap,
				'nextSwap':this.nextSwap,
				'previousSwap':this.previousSwap,
				'onSelect':this.onSelect,
				'islayout':this.islayout,
				'onComplete':this.onComplete,
				'pageLength': this.pageLength,
				'paginationLabelBack':this.paginationLabelBack,
				'paginationLabelNext':this.paginationLabelNext,
				'paginationLabelof':this.paginationLabelof,
				'createPagination':this.createPagination,
				'paginationBack':this.paginationBack,
				'paginationNext':this.paginationNext,
				'updateModel':this.updateModel},domConstruct.create("div",{},this.domNode));

			this._dataList.gridId = this.id;
		},
		
		createHeaderListItem:function(column,columnIndex){
			var reciduo = columnIndex % this.getParent().numberColsPerSwap();
			var dividendo = parseInt(number.format(columnIndex / this.getParent().numberColsPerSwap(),{round:-1,pattern:"0"}));
			if(reciduo == 0){
				tr = domConstruct.create("tr",{},headerTbody[dividendo]);
				domAttr.set(tr,"_index", columnIndex);/*añade el index al ListItem*/
			}

			//td que se aumenta para el checkbox de acciones seleccionables en la parte izquierda de la tabla
			var selectablesActions = this.getParent().getActionsSelectables()
			if(columnIndex==0 && selectablesActions !=null && selectablesActions.length>0 && !this.islayout){
				domConstruct.create("td",{'class':'noContentQtLeft'},tr);
			}
			
			//aumenta td en la parte izquierda
			if(column.left && !this.islayout){
				var tdid = this.id+dividendo+'left';
				var td_left = domConstruct.create("td",{'class':'mblSwapViewLeftTd','rowSpan':1,'id':tdid,'valign':'top'},tr);
				var buttonL = new Button({'class':'mblBottonSwapLeft','fisa-view-index':dividendo,'fsv':this.swapViewId},td_left);
				buttonL.connect(buttonL,'onClick',this.previousSwap);
				domConstruct.create("img",{'class':'mblSwapViewLeftImage','src':dojo.config.fisaContextPath+'/resources/blank.gif'},buttonL.domNode);
			}
			
			//valor de la cabecera
			var td=domConstruct.create("td",{'style':'text-align:left;','class':'mobileQtGridHeaderCell','width':column.width},tr);
			td.innerHTML = column.name;
			//aumenta td en la parte derecha
			if(column.right && !this.islayout){
				var tdid = this.id+dividendo+'right';
				var td_right = domConstruct.create("td",{'class':'mblSwapViewRightTd','rowSpan':1,'id':tdid,'valign':'top'},tr);
				var buttonR = new Button({'class':'mblBottonSwapRight','fisa-view-index':dividendo,'fsv':this.swapViewId},td_right);
				buttonR.connect(buttonR,'onClick',this.nextSwap);
				domConstruct.create("img",{'class':'mblSwapViewRightImage','src':dojo.config.fisaContextPath+'/resources/blank.gif'},buttonR.domNode);
			} 
			
		},
		
		createListItem: function(/*Object*/item,itemIndex,parentBody){
			return this.createTableItem(parentBody,item,itemIndex);
		},
		attachActions:function(item,checkBox){
			
		},
		
		createTableItem:function(tbody,item,itemIndex){
			var structure = this.getParent().structureNoHidden;
			var tr = null;
			
			array.forEach(structure, function(column,columnIndex){
				var reciduo = columnIndex % this.getParent().numberColsPerSwap();
				var dividendo = parseInt(number.format(columnIndex / this.getParent().numberColsPerSwap(),{round:-1,pattern:"0"}));
				if(reciduo == 0){
					/*seccion TR*/
					tr = domConstruct.create("tr",{'class':'qtTableTrValue'},tbody[dividendo]);
					domAttr.set(tr,"_index", itemIndex);/*añade el index al ListItem*/
					/*seccion check*/
					var selectablesActions = this.getParent().getActionsSelectables()
					if(selectablesActions !=null && selectablesActions.length>0 && !this.islayout){
						var td_left = domConstruct.create("td",{'class':'mblSwapLeftTd','rowSpan':1/*,'id':tdid*/,'valign':'top'},tr);
						var checkbox = new CheckBox({'fisatabid':this.getParent().fisatabid,'fisapageid':this.getParent().fisapageid,'_index':itemIndex,'actions':selectablesActions},domConstruct.create("div",null,td_left));
						checkbox.connect(checkbox,'onClick',this.onSelect);
						//this.getParent().attachActions(item,checkbox);
					}
				}
				
				//td que se aumenta para que tenga la mismo numero de columnas del header
				if(column.left && !this.islayout && this.getParent().getActionsSelectables() 
						&& this.getParent().getActionsSelectables().length<=0){
					domConstruct.create("td",{'class':'noContentQtLeft'},tr);
				}
				
				//aumenta td en la parte izquierda
				/*if(itemIndex==0 && column.left){
					var tdid = tbody[dividendo].id+'left';
				}else if(itemIndex!=0 && column.left){
					var td_left = dojo.byId(tbody[dividendo].id+'left');
					td_left.rowSpan++;
				}*/
				/*valor de la columna*/
				var td=domConstruct.create("td",{'class':'mblSwapValueTd'},tr);
				//aumenta td en la parte derecha
				if(itemIndex==0 && column.right){
					var tdid = tbody[dividendo].id+'right';
					var td_right = domConstruct.create("td",{'class':'mblSwapRightTd','rowSpan':1,'id':tdid,'valign':'top'},tr);
//					domConstruct.create("img",{'class':'mblSwapViewRightImage','src':dojo.config.fisaContextPath+'/resources/blank.gif'},td_right);
				} else if(itemIndex!=0 && column.right){
					var td_right = dojo.byId(tbody[dividendo].id+'right');
					td_right.rowSpan++;
				}
				//ingresa el valor en el td
				var value = this.store.getValue(item, column.field);
				var formated_column;
				if(column.formatter!=null /*&& value != null*/){
					formated_column = column.formatter(value,itemIndex,column);
					if(formated_column != null){
						if(typeof formated_column =="string"){
							td.innerHTML = formated_column;
						} else if (typeof formated_column == "object"){
							domConstruct.place(formated_column.domNode,td);
						} else if (formated_column.domNode!=undefined){
							domConstruct.place(formated_column.domNode,td);
						} else{
							td.innerHTML = value;
						}
					}
				}else if(value!=null){
					td.innerHTML = value;
				}
//				else if(value == null){
//					formated_column = column.formatter();
//					if(formated_column != null){
//						if(typeof formated_column == "object"){
//							
//						}
//					}
//				}
				
				//td que se aumenta para que tenga la mismo numero de columnas del header
				if(column.right && !this.islayout){
					domConstruct.create("td",{'class':'noContentQtRight'},tr);
				}
			}, this);
		},

		createPagination:function(fatherNode,totalPages,currentPage){
			var next = dijit.byId(this.gridId).paginationLabelNext;
			var back = dijit.byId(this.gridId).paginationLabelBack;
			var of = (currentPage+1)+' '+dijit.byId(this.gridId).paginationLabelof+' '+totalPages;
			
			var table_pag = domConstruct.create("table",{'border':0,'cellpading':0,'cellspacing':0,'width':'100%','id':'tablePag_'+currentPage,'class':'qtTableSwapView'},fatherNode);
			var tbody_pag = domConstruct.create("tbody",{'id':'tbodyPag_'+currentPage},table_pag);
			var tr = domConstruct.create("tr",{'class':'qtTableTrValue'},tbody_pag);
			var td_back = domConstruct.create("td",{'className':'qtPaginationBack'},tr);
			var td_current = domConstruct.create("td",{'className':'qtPaginationInfo'},tr);
			var td_next = domConstruct.create("td",{'className':'qtPaginationNext'},tr);
			var span_back = domConstruct.create("span",{'innerHTML':this.paginationLabelBack,'className':'qtPaginationEnable'},td_back);
			var span_next = domConstruct.create("span",{'innerHTML':this.paginationLabelNext,'className':'qtPaginationEnable'},td_next);
			var span_current = domConstruct.create("span",{'innerHTML':(currentPage+1)+' '+this.paginationLabelof+' '+totalPages,'className':'qtPaginationDisable'},td_current);

			if(currentPage==0){
				span_back.className = "qtPaginationDisable";
				on(span_next, "click", dojo.hitch(this,this.paginationNext));
			}else if((currentPage+1) == totalPages){
				span_next.className = "qtPaginationDisable";
				on(span_back, "click", dojo.hitch(this,this.paginationBack));
			}else{
				span_back.className = "qtPaginationEnable";
				on(span_next, "click", dojo.hitch(this,this.paginationNext));
				span_next.className = "qtPaginationEnable";
				on(span_back, "click", dojo.hitch(this,this.paginationBack));
			}
		},
		paginationBack: function(){
			this.currentPage--;
			dojo.hitch(this,this.updateModel(['start'],dijit.byId(this.gridId).pageLength*this.currentPage));
		},
		paginationNext: function(){
			this.currentPage++;			
			dojo.hitch(this,this.updateModel(['start'],dijit.byId(this.gridId).pageLength*this.currentPage));
		},
		
		updateModel: function(/*Array*/valueOfModel,/*Object*/newValue){
			this.store.callbackScope.model.setValue(valueOfModel,newValue);
			this.query = this.store.callbackScope.model.toPlainObject();
			this.refresh();
		},
		
		onSelect:function(){
			var fc = ec.fisa.controller.utils.getPageController(this.fisatabid,this.fisapageid);
			fc.selection = {};
			fc.selection.indexSelected = this._index;
			if(this.checked){
				this._simpleDialog = new SimpleDialog({"closeButton":true});
				fc.actionsDialogId = this._simpleDialog.get("id");
				
				Window.body().appendChild(this._simpleDialog.domNode);
				var message = domConstruct.create("div",{'class': "mblSimpleDialogHeader",innerHTML: "Seleccione una acci&#243;n."},this._simpleDialog.domNode);
				var table = domConstruct.create("table",{'border':0,'cellpading':0,'cellspacing':0,'width':'100%'},this._simpleDialog.domNode);
				var tbody = domConstruct.create("tbody",{},table);
				
				array.forEach(this.actions,dojo.hitch(this,function(object){
					var tr = domConstruct.create("tr",{'class':'mobileQtGridHeader'},tbody);
					var td=domConstruct.create("td",{'class':'mobileQtGridHeaderCell','width':'auto'},tr);
					var lbl = object.label;
					var btn = new Button({'class': "mblSimpleDialogButton",innerHTML: lbl});
					btn.placeAt(td);
					btn.connect(btn,'onClick',dojo.hitch(fc,fc.executeAction,true,object.value,null));
				}));
				this._simpleDialog.show();
				this.checked=false;
			}
		},
		
		onComplete: function(items, req){
			
			this.inherited(arguments);
			if(this.getParent().hideQTGridIfNoResultsFound==true ){

				if(req._totalMatchedItems==0){
					var controller = ec.fisa.controller.utils.getPageController(this.getParent().fisatabid,this.getParent().fisapageid);
					controller.unDisplayQTGrid();
					controller.unDisplayMessagesPanel();
				}
			}
			
			if(this.getParent().hideQTPortletIfNoResultsFound==true){
				if(req._totalMatchedItems>0){
					var controller = ec.fisa.controller.utils.getPageController(this.getParent().fisatabid,this.getParent().fisapageid);
					controller.makeQTPortletVisible();
				}else{
					var controller = ec.fisa.controller.utils.getPageController(this.getParent().fisatabid,this.getParent().fisapageid);
					controller.unDisplayQTPortlet();
				}
			}else{
				var controller = ec.fisa.controller.utils.getPageController(this.getParent().fisatabid,this.getParent().fisapageid);
				controller.makeQTPortletVisible();
			}
				
		},

		
		nextSwap: function(){
			var i= this['fisa-view-index'];/*indice del SwapView que se encuentra actualmente*/
			var fsv=this['fsv'];/*array de todos los swapView*/
			var swapView = dijit.byId(fsv[i]);
			swapView.goTo(1);
		},
		
		previousSwap: function(){
			var i= this['fisa-view-index'];/*indice del SwapView que se encuentra actualmente*/
			var fsv=this['fsv'];/*array de todos los swapView*/
			var swapView = dijit.byId(fsv[i]);
			swapView.goTo(-1);
		},
		
		/**
		 * Retorna el numero total de columnas que se van a presentar en la QT
		 */
		countVisibleColumns: function(){
			return this.getParent().structureNoHidden.length;
		},
		
		/**
		 * Retorna el las Columnas renderizadas por cada SwapView
		 */
		numberColumns: function(){
			if(this.islayout){
				return 0;
			}else{
				return (this.countVisibleColumns()/this.numberColsPerSwap());
			}
			
		},
		
		/**
		 * Retorna el numero de columnas que se presentan en mobiles
		 */
		numberColsPerSwap: function(){
			if(this.islayout){
				return this.structureNoHidden.length;
			}else{
				return 2;
			}
			
		},
		
		destroy:function(){
			if(this._dataList!=null){
				this._dataList.destroy(arguments);
				delete this._dataList;
			}
			this.inherited(arguments);
		},
		
		setQuery:function(query){
			/*se cambia a este lugar el store, ya que se llamaba 2 veces el DWR del Qtcontroller, porque el setStore hace un
			 * llamado al refresh y al hacer un setQuery para los paremetros por defecto se vuelve a llamar al refresh, lo que causaba
			 * problemas en la renderizacion antes y despues de los parametros por defecto*/
			this._dataList.query=query;
			if(this._dataList.store == null){
				this._dataList.store=this.getFisaStore();			
			}
			this._dataList.refresh();
			
		},
		
		getActionsSelectables: function(){
			//implement on each grid
		},
		
		getActionsNoSelectables:function(){
			//implement on each grid
		},
		
		getFisaStore:function(){
			//implement on each grid
		}
	});
});

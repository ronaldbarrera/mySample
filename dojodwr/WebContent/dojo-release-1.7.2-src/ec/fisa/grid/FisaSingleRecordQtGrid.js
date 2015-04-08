define(["dojo/dom-construct","dojo/_base/kernel", 
        "dojo/_base/declare",
        "dijit/_Widget",
		"dijit/_Templated",
		"dojo/text!./templates/SingleRecordGrid.html",
		"dojo/dom-construct","./_base"], function(construct, dojo, declare, _Widget, _Templated,template,domConstruct){
	return declare("ec.fisa.grid.FisaSingleRecordQtGrid",[ _Widget, _Templated ], {
		id:"",
		qtId:"",
		tabId:"",
		pageScopeId:"",
		islov:false,
		parentFisaTabId:"",
		parentFisaPageScopeId:"",
		parentBtId:"",
		parentFieldId:"",
		parentType:"",
		parentWidgetId:"",
		execButtonLabel:"",
		selectButtonLabel:"",
		selectable:true,
		hasActions:false,
		fieldsNumber:0,
		resultsLayout:0,
		rowsNumber:0,
		store: {},
		query: {},
		templateString : template,
		actions:null,
		select:null,
		execButton:null,
		structure:"",
		structureArray:null,
		data:null,
		constructor : function() {

		},
		postCreate : function() {
			this.inherited(arguments);
		},
		startUp : function() {
			this.inherited(arguments);
			this.structureArray = eval(this.structure);
			this._initStore();
			var controller = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
			this.setQuery(controller.model.toPlainObject());
			
		},
		setQuery: function(queryData){
			this.query = queryData;
			var self = this;
			this.store.fetch({query:this.query,onComplete: function(data){
				if(data.length == 0){
					self.processResults(data);
				}else{
					self.processResults(this.store.getResults());
				}
				
			},callbackScope:ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId),scope:this, onError:this.onError});
		},
		postMixInProperties:function(){
			this.inherited(arguments);
			if(this.actions != null && this.actions.length > 0){
				this.hasActions = true;
			}
		},
		postCreate : function() {
			this.inherited(arguments);
			this._createActions();
		},
		_createActions:function(){
			if(this.hasActions === true){
					var _optsId=this.id+"_options";
					var _execId=this.id+"_execButton";
					this.select =new dijit.form.Select({id:_optsId,options:this.actions},this._actionsContainer);
					this.execButton=new dijit.form.Button({id:_execId,label:this.execButtonLabel},this._buttonContainer);
					this.connect(this.execButton,"onClick",this._execAction);
			}
		},
		_execAction:function(){
			var index = 0;
			if(this.data.length == 0){
				index = null;
			}
			this.executeAction(this.qtId,this.select.get("value"),index);
		},
		_initStore:function(){
			var controller = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
			this.store= new ec.fisa.dwr.Store("QtControllerDWR","viewData",this.tabId,this.qtId,[this.pageScopeId],null);
			this.store.callbackScope = controller;
		},
		processResults:function(data){
			this.data = data;
			domConstruct.empty(this._dataContainer);
			var table = domConstruct.create("table",{'border':'0','cellpadding':'5','cellspacing':'0', style:{'margin':'auto'}},this._dataContainer);
			var currentCol = 0;
			var rowData = this.data[0];
			if(rowData && rowData.data){
				
				for(var i = 0 ; i < this.rowsNumber; i++){
					var tr = domConstruct.create("tr",{},table);
					for(var j = 0 ; j < this.resultsLayout; j++){
						var colDataIndex = currentCol ++;
						var colData = this.structureArray[colDataIndex];
						if(colData){
							var labelTd = domConstruct.create("td",{'class':'sigleRecordQtLabel'},tr);
							var dataTd = domConstruct.create("td",{'class':'sigleRecordQtvalue'},tr);
							var label = domConstruct.create("label",{'class':'fisaLabel','innerHTML':colData.name + ':'},labelTd);
							var dataString = rowData.data[colDataIndex];
							if(colData.formatter){
								dataString = colData.formatter(dataString, 0);
							}
							
							if(dataString.placeAt){
								var data = domConstruct.create("span",{},dataTd);
								dataString.placeAt(data);
							}else{
								var data = domConstruct.create("span",{"innerHTML":dataString},dataTd);
							}
							
						}
					}
				}
			}
			
		},
		onError:function(ex,request){
		}
	});
});
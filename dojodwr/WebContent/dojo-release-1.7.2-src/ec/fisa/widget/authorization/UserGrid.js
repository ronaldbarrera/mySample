define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/connect",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"ec/fisa/grid/EnhancedGrid",
	"dojox/grid/enhanced/plugins/IndirectSelection",
	"dojox/grid/EnhancedGrid",
	"./_base"
], function(dojo, declare, lang, connect, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, FisaEnhancedGrid, IndirectSelection, EnhancedGrid){

var UserGrid = declare("ec.fisa.widget.authentication.UserGrid", [EnhancedGrid], {
	tabId:"",
	pageScopeId:"",
	parentFisaPageScopeId:'',
	parentBtId:'',  
	parentFieldId:'',
	parentWidgetId:'',
	onlyRead:false,
	//selectionMode:"extended",
	_onSelectionUpdate:false,
	fsv:null,
	label:"",
	isMain: false,
	selectUsers:[],
	postCreate: function(){
		this.inherited(arguments);
		
		if (this.isMain) {
			
			var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
			ctrlr.listUserDataGrid = this;
			
		}
	},
	postMixInProperties:function(){
		this.inherited(arguments);
		
		var indirectSelection={headerSelector:!this.onlyRead, width: '10%', styles: 'text-align: center;'};
		//var indirectSelection = false;
		//this.keepSelection = true;
		
		if(this.plugins){
			this.plugins.indirectSelection=indirectSelection;
		} else {
			this.plugins={'indirectSelection':indirectSelection};
		}
		this.autoHeight=true;
		this.selectable = !this.onlyRead;
		var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
	
		this.structure=[[{name: this.label, field: 'value',width:'100%'}]];
		this.store=ctrlr.userStore;
		
	},
	execSelectionChange:function(){
		var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
		//ctrlr.obtenerSeleccionados();
	},
	startup:function(){
		this.inherited(arguments);
	
	},
	_onFetchComplete:function(){
		this.inherited(arguments);
		var selectionList = null;
		var index = [];
		
		var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);

		if (this.isMain) {
			selectionList = ctrlr.selectUsers;
		} else {
			
			selectionList = this.selectUsers;
		}
		
		
		dojo.forEach(selectionList, function(value, i){
			
			var indexGrid = this.getItemIndex(value.toString());
			
			if (!this.onlyRead) {
				this.selection.addToSelection(indexGrid);	
			} else {
				index.push(indexGrid);	
			}
					
		},this);
		
		if (this.onlyRead) {
			for (i = 0; i<this.rowCount; i++) {
				var validador = this._indexValue(index, i);
				this.rowSelectCell.setDisabled(i, true);
				if (validador < 0) {
					this.rowSelectCell.toggleRow(i, false);
				} else {
					this.rowSelectCell.toggleRow(i, true);
				}
			}
		}	
	},
	
	_indexValue : function(component, index) {
				
		for (var i = 0; i < component.length; i++) {
			
			if(component[i]==index){return i;}
		}
		
		return -1;		
	}
});

return UserGrid;

});
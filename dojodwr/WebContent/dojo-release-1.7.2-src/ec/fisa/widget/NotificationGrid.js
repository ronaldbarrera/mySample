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
	"dojox/grid/EnhancedGrid"
], function(dojo, declare, lang, connect, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, FisaEnhancedGrid, IndirectSelection, EnhancedGrid){

var NotificationGrid = declare("ec.fisa.widget.NotificationGrid", [EnhancedGrid], {
	
	tabId:"",
	pageScopeId:"",
	parentFisaPageScopeId:'',
	parentBtId:'',
	parentFieldId:'',
	parentWidgetId:'',
	onlyRead : false,
	label : "",
	//selectionMode:"extended",
	_onSelectionUpdate:false,
	fsv:null,
	isMeans : false,
	labelRole:'',
	postCreate: function(){
		this.inherited(arguments);
		
		var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
		if (this.isMeans) {
			
			ctrlr.meansDataGrid = this;		
		} else {
			ctrlr.listUserDataGrid = this;
		}
	},
	postMixInProperties:function(){	

	
		this.inherited(arguments);	
		
		var indirectSelection={width: '10%', styles: 'text-align: center;'};
		if(this.plugins){
			this.plugins.indirectSelection=indirectSelection;
		} else {
			this.plugins={'indirectSelection':indirectSelection};
		}
		this.autoHeight=true;
		this.selectable = !this.onlyRead;
		var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
	
		if (this.isMeans) {
			
			this.structure=[[{name: this.label, field: 'value',width:'100%'}, {name:'defaultId', field: 'default',width:'100%', hidden: true}]];
			this.store=ctrlr.meanStore;
		} else {
			this.structure=[[{name: this.label, field: 'value',width:'50%'},{name: this.labelRole, field: 'role',width:'50%'}]];
			this.store=ctrlr.userStore;
		}
	},
	execSelectionChange:function(){
		var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
		ctrlr.obtenerSeleccionados();
	},
	startup:function(){
		this.inherited(arguments);
	
	},
	_onFetchComplete:function(){
		
		this.inherited(arguments);
		var selection = null;
		var index = [];
		
		var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
				
		if (this.isMeans) {			
			selectionList = ctrlr.selectMeans;
		} else {
			selectionList = ctrlr.selectUsers;
		}
		
		dojo.forEach(selectionList, function(value, i){
			
			if (value != "indexOf") {
				
				var indexGrid = this.getItemIndex(value.toString());
				
				if (!this.onlyRead) {
					this.selection.addToSelection(indexGrid);	
				} else {
					index.push(indexGrid);	
				}
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
		} else {
			
			if (this.isMeans) {					
			
				for (i = 0; i<this.rowCount; i++) {				
									
					var defaultId = this.getItem(i);
					var validador = this.getCell(2).get(i, defaultId)
					
					if (validador == "1") {
						
						this.rowSelectCell.setDisabled(i, true);
						this.rowSelectCell.toggleRow(i, true);
					}
				}
			}
		}
	
		if (!this.onlyRead && this.isMeans) {
			
			this.connect(this,"onSelectionChanged",this.execSelectionChange);
		}
	},
	
	_indexValue : function(component, index) {
				
		for (var i = 0; i < component.length; i++) {
			
			if(component[i]==index){return i;}
		}
		
		return -1;		
	}
});

return NotificationGrid;

});
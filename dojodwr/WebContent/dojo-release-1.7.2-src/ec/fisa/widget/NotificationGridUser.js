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

var NotificationGrid = declare("ec.fisa.widget.NotificationGridUser", [EnhancedGrid], {
	
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
	labelRole:'',
	postCreate: function(){
		this.inherited(arguments);
		var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
			ctrlr.listUserDataGrid = this;
	},
	postMixInProperties:function(){	
		this.inherited(arguments);	
	
		this.autoHeight=true;
		this.selectable = !this.onlyRead;
		//var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
			this.structure=[[{name: this.label, field: 'value',width:'50%'},{name: this.labelRole, field: 'role',width:'50%'}]];
			//this.store=ctrlr.userStore;
			
			this.store =  new ec.fisa.dwr.Store(
					'NotificationTransactionControllerDWR',
					'viewDataUsers', this.tabId,
					this.pageScopeId, [], null);
	
			
	},
	execSelectionChange:function(){
		var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
		ctrlr.obtenerSeleccionados();
	},
	startup:function(){
		this.inherited(arguments);
	
	}

});

return NotificationGrid;

});
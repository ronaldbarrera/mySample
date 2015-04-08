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

var ApplicationGrid = declare("ec.fisa.widget.authorization.ApplicationGrid", [EnhancedGrid], {
	tabId:"",
	pageScopeId:"",
	parentFisaPageScopeId:'',
	parentBtId:'',  
	parentFieldId:'',
	parentWidgetId:'',
	onlyRead:false,
	selectionMode:"single",
	_onSelectionUpdate:false,
	fsv:null,
	packageName:"",
	appName:"",
	btName:"",
	selectButtonLabel:"seleccionar",
	postCreate: function(){
		this.inherited(arguments);
		
		var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
		ctrlr.listAppDataGrid = this;
		
	},
	postMixInProperties:function(){
		
		this.inherited(arguments);
		
		var indirectSelection={headerSelector:false, width:"64px", name: this.selectButtonLabel, styles:"text-align: center;"};
//		var indirectSelection = false;
		var pagination = {
							pageSizes: [],
							description: false,
							sizeSwitch: true,
							pageStepper: true,
							gotoButton: true,
							maxPageStep: 4,
							position: 'bottom'
					};
		
		if(this.plugins){
			this.plugins.indirectSelection=indirectSelection;
			this.plugins.pagination=pagination;
		} else {
			this.plugins={'indirectSelection':indirectSelection, 'pagination': pagination};
		}
		this.autoHeight=true;
		this.selectable = !this.onlyRead;
		var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
	
		this.structure=[[
		                 {name: this.packageName, field: 'packageName',width:'50%'},
		                 {name: this.appName, field: 'appName',width:'50%'},
		                 {name: this.btName, field: 'btId',width:'40%', hidden: true},
		                 {name: this.btName, field: 'id',width:'40%', hidden: true}
		                 ]];
		this.store=ctrlr.appStore;
		
	},
	execSelectionChange:function(){
		var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
		//ctrlr.obtenerSeleccionados();
	},
	startup:function(){
		this.inherited(arguments);
	
	}	
});

return ApplicationGrid;

});
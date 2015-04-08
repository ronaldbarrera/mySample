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
	"./_base"
], function(dojo, declare, lang, connect, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, FisaEnhancedGrid, IndirectSelection){

var FieldsGrid = declare("ec.fisa.widget.rules.FieldsGrid", [FisaEnhancedGrid], {
	tabId:"",
	pageScopeId:"",
	parentFisaPageScopeId:'',
	parentBtId:'',
	parentFieldId:'',
	parentWidgetId:'',
	selectionMode:"single",
	_onSelectionUpdate:false,
	fsv:null,
	postCreate: function(){
		this.inherited(arguments);
		this.connect(this,"onSelectionChanged",this.execSelectionChange);
		var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
		ctrlr.fieldsGridId=this.id;
	},
	postMixInProperties:function(){
		this.inherited(arguments);
		var indirectSelection={headerSelector:false, width:"64px", name: '', styles:"text-align: center;",'noresize':true};
		if(this.plugins){
			this.plugins.indirectSelection=indirectSelection;
		} else {
			this.plugins={'indirectSelection':indirectSelection};
		}
		this.autoHeight=true;
		this.selectable=true;
		this.structure=[[{'name': 'Nombre del Campo', 'field': 'prompt','width':'150px','editable':false,'noresize':true}]];
		var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
		this.store=ctrlr.fieldsStore;
		if(ctrlr.dataKey!=null&&ctrlr.dataKey.t=="F"){
			this.fsv=ctrlr.dataKey.id;
		}
	},
	execSelectionChange:function(){
		var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
		ctrlr.changeSelection(this.id);
	},
	_onFetchComplete:function(){
		this.inherited(arguments);
		if(this.fsv!=null){
			this.selection.select(this.store._getItemByIdentity(this.fsv)['_0']);
		}
	}
});

return FieldsGrid;

});
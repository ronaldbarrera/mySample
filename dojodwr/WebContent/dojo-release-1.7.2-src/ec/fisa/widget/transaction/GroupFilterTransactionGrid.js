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
	"dijit/form/CheckBox",
	"./_base"
], function(dojo, declare, lang, connect, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, FisaEnhancedGrid, IndirectSelection, EnhancedGrid){

var GroupFilterTransactionGrid = declare("ec.fisa.widget.transaction.GroupFilterTransactionGrid", [EnhancedGrid], {
	tabId:"",
	pageScopeId:"",
	parentFisaPageScopeId:'',
	parentBtId:'',  
	parentFieldId:'',
	parentWidgetId:'',
	onlyRead:false,
	appName:"Aplicacion",
	optionName:"Opcion",
	selectionMode:"single",
	_onSelectionUpdate:false,
	fsv:null,
	postCreate: function(){
		this.inherited(arguments);
		
		var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
		ctrlr.listAppDataGrid = this;
		
	},
	postMixInProperties:function(){
		
		this.inherited(arguments);
		
		//var indirectSelection={headerSelector:!this.onlyRead, width: '10%', styles: 'text-align: center;'};
		var pagination = {
							pageSizes: [],
							description: true,
							sizeSwitch: true,
							pageStepper: true,
							gotoButton: true,
							maxPageStep: 4,
							position: 'bottom'
					};
		
		if(this.plugins){
			//this.plugins.indirectSelection=indirectSelection;
			this.plugins.pagination=pagination;
		} else {
			this.plugins={/*'indirectSelection':indirectSelection,*/ 'pagination': pagination};
		}
		this.autoHeight=true;
		//this.selectable = !this.onlyRead;
		var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
		
		var layout = [[  {name: 'codigo', field: 'codigo',width:'60px', hidden: true},
		                 {name: this.optionName, field: 'option',width:'400px'}
				     ]];
		
		for ( var i = 0; i < ctrlr.channelList.length; i++) {
			var j = i + 2;
			var channel = ctrlr.channelList[i];
			var channelValidador = ctrlr.channelValid[i];
			layout[0][j] = {
				name : channel[1],
				field : channel[0],
				width : "auto",
				hidden: channelValidador,
				styles: 'text-align: center;',
				widgetClass : dijit.form.CheckBox,
				formatter : dojo.hitch(this, function(data, rowIndex, treepath, p4) {
					return this.formatterCheckbox(data, rowIndex, treepath, p4, this, this.onlyRead);
				})
			}
		}
		
		this.structure=layout;
		
		this.store=ctrlr.appStore;
		
	},
	execSelectionChange:function(){
		var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
		//ctrlr.obtenerSeleccionados();
	},
	startup:function(){
		this.inherited(arguments);
	
	},
	
	formatterCheckbox : function(value, idx, allContent, disabled, attribute, tabId, pageScopeId){
		if(value != null){			
			if(idx >= 0) {
				var taskId =	allContent.grid.getItem(idx);
				//var checkBox = new dijit.form.CheckBox({
				var checkBox = new ec.fisa.widget.tsc.MixedCheckBox({
					name: "checkBox",
					value: value,
					checked: value,
					disabled:disabled
				});
				
				return checkBox;
			}else{
				// for summary cell
				return "";
			}
		}
	},
	
	updateData : function () {
		
		var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
		
		var layout = [[  {name: 'codigo', field: 'codigo',width:'60px', hidden: true},
		                 {name: this.optionName, field: 'option',width:'400px'}
				     ]];
		
		for ( var i = 0; i < ctrlr.channelList.length; i++) {
			var j = i + 2;
			var channel = ctrlr.channelList[i];
			var channelValidador = ctrlr.channelValid[i];
			layout[0][j] = {
				name : channel[1],
				field : channel[0],
				width : "auto",
				hidden: channelValidador,
				styles: 'text-align: center;',
				widgetClass : dijit.form.CheckBox,
				formatter : dojo.hitch(this, function(data, rowIndex, treepath, p4) {
					return this.formatterCheckbox(data, rowIndex, treepath, p4, this, this.onlyRead);
				})
			}
		}		
		
		this.setStructure(layout);		
	}
});

return GroupFilterTransactionGrid;

});
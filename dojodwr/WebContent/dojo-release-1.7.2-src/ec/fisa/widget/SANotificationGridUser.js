define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/connect",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"ec/fisa/grid/EnhancedGrid",
	"dijit/form/CheckBox"
], function(dojo, declare, lang, connect, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, FisaEnhancedGrid, CheckBox){

var SANotificationGridUser = declare("ec.fisa.widget.SANotificationGridUser", [FisaEnhancedGrid], {
	selectButtonLabel:"Activar Env\u00EDo",
	tabId:"",
	pageScopeId:"",
	parentFisaPageScopeId:'',
	parentBtId:'',
	parentFieldId:'',
	parentWidgetId:'',
	onlyRead : false,
	label : "",
	selectionMode:"none",
	_onSelectionUpdate:false,
	fsv:null,
	labelRole:'',
	postMixInProperties:function(){	
		this.inherited(arguments);	
		this.autoHeight=true;
		var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
		var strtr=[];
		var ats={name: this.selectButtonLabel, field:'slctd', width:"100px",styles:"text-align: center;", formatter:function(data, rowIndex, colDef){
			var d=data.split("-");
			var at={'checked':d[0]==='true','fval':d[1]+'-'+d[2]};
			if(colDef.fReadOnly){
				at['readOnly']=true;
			}
			var c =new CheckBox(at);
			colDef.grid.fisaChecks.push(c.id);
			return c;
		}};
		if(this.onlyRead){
			ats['fReadOnly']=true;
		}else{
			this.fisaChecks=[];
		}
		strtr.push(ats);
		strtr.push({name: this.label, field: 'value', width:'200px'});
		strtr.push({name: this.labelRole, field: 'profile', width:'200px'});
		this.structure=[strtr];
	
	},
	startup:function(){
		this.inherited(arguments);
		var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
		ctrlr.setListUserDataGridId(this);
	}

});

return SANotificationGridUser;

});
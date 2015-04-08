define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/connect",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"ec/fisa/grid/EnhancedGrid",
	"dijit/form/CheckBox",
	"ec/fisa/widget/Link",
	"dijit/form/Select"
], function(dojo, declare, lang, connect, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, FisaEnhancedGrid, CheckBox, Link, Select){

var SANotificationGridProduct = declare("ec.fisa.widget.SANotificationGridProduct", [FisaEnhancedGrid], {
	selectButtonLabel:"Activar Env\u00EDo",
	tabId:"",
	pageScopeId:"",
	parentFisaPageScopeId:'',
	parentBtId:'',
	parentFieldId:'',
	parentWidgetId:'',
	onlyRead : false,
	labelNumber : "",
	selectionMode:"none",
	_onSelectionUpdate:false,
	fsv:null,
	labelProduct:'',
	labelFormat:'',	
	labelFrecuency:'',
	selectWidth:'180px',
	labelNotifyTo:'',
	postMixInProperties:function(){	
		this.inherited(arguments);	
		this.autoHeight=true;
		var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
		
		
		if (ctrlr.skinParameters) {
			this.selectWidth = (ctrlr.skinParameters["stextCharWidth"] * ctrlr.skinParameters["sdefaultVisualSize"] ) + "px";
		}
		
		
		var strtr=[];
		
		var ats={name: this.selectButtonLabel, field:'slctd', width:"100px",styles:"text-align: center;", 
				widgetClass : dijit.form.CheckBox,formatter:function(data, rowIndex, colDef){
			var d=data.split("-");
			
			if (colDef.grid.fisaChecksValues[rowIndex] == undefined) {
				colDef.grid.fisaChecksValues[rowIndex] = d[0]==='true';
				colDef.grid.fisaUserSelect[rowIndex] = d[0]==='true';
			} 
				
			var at={'checked':colDef.grid.fisaChecksValues[rowIndex],'fval':d[1],'fvalLine':d[2]};
			
			
			if(colDef.fReadOnly){
				at['readOnly']=true;
			}
			var c=new CheckBox(at);
			c.gridId=colDef.grid.id
			colDef.grid.fisaChecks[rowIndex] = c.id;
		
			
			c.onChange = function(value) {
				var grid = dijit.byId(this.gridId);
				var index = grid.getItemIndex(this.fval);
				var linkId = grid.fisaLinks[index];
				var selectformatId = grid.fisaSelectFormat[index];
				var selectFrecuencyId = grid.fisaSelectFrecuency[index];
				
				var link = dijit.byId(linkId);
				var selectformat = dijit.byId(selectformatId);
				var selectFrecuency = dijit.byId(selectFrecuencyId);
				
				selectformat.set("disabled", !value);				
				selectFrecuency.set("disabled", !value);
				
				if (!value) {
					selectformat.set("value", '-1');				
					selectFrecuency.set("value", '-1');
				}
				
				link.set("enabled", value);
				
				
				grid.fisaChecksValues[rowIndex] = value;
			}
			
			return c;
		}};
		if(this.onlyRead){
			ats['fReadOnly']=true;
		}else{
			this.fisaChecks=[];
		}
		strtr.push(ats);
		strtr.push({name: this.labelNumber, field: 'cta',width:'auto'});
		strtr.push({name: this.labelProduct, field: 'prd',width:'auto'});
		
		strtr.push({
			name : this.labelFormat,
			field : "format",
			width : this.selectWidth,
			styles:"text-align: center;",
			widgetClass : dijit.form.Select,
			formatter : dojo.hitch(this, function(data, rowIndex, colDef) {	
				
				return this.formatterGridFormatCombo(data, rowIndex, colDef, ctrlr);
			})
		});
		
		strtr.push({
			name : this.labelFrecuency,
			field : "frecuency",
			width : this.selectWidth,
			styles:"text-align: center;",
			widgetClass : dijit.form.Select,
			formatter : dojo.hitch(this, function(data, rowIndex, colDef) {	
				
				return this.formatterGridFrecuencyCombo(data, rowIndex, colDef, ctrlr);
			})
		});
	
		strtr.push({
			name : this.labelNotifyTo,
			field : "slctd",
			width : "auto",
			styles:"text-align: center;",
			widgetClass : ec.fisa.widget.Link,
			formatter : dojo.hitch(this, function(data, rowIndex, colDef) {	
				
				return this.formatterGridLink(data, rowIndex, colDef, ctrlr);
			})
		});
		
		this.fisaLinks=[];
		this.fisaSelectFormat=[];
		this.fisaSelectFrecuency=[];
		this.fisaChecksValues=[];
		this.fisaUserSelect=[];
		
		
		this.structure=[strtr];
		this.store =  new ec.fisa.dwr.Store(
			"StatementAccountControllerDWR", 'viewDataProds', this.tabId,
			this.pageScopeId, ctrlr.getSelectedProds(), null);
	},
	startup:function(){
		this.inherited(arguments);
		var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
		ctrlr.setListProdDataGridId(this);
	},
	// formatter que genera el link
	formatterGridLink : function(data, idx, colDef, controller) {
	

		var d=data.split("-");
		var at={'checked':d[0]==='true','fval':d[1]};
		var disabled = false;
		var rowGridItem = colDef;
		
		if(at.checked || rowGridItem.fReadOnly){
			at['readOnly']=true;
			disabled = true;
		}
		// if (value != null) {
			if (idx >= 0) {
				
				// crear nuevo link
				var link = new Link({
					label:controller.labelsData.addUsersTo,
					title:controller.labelsData.addUsersTo
				});
				
				link.set("enabled", this.fisaChecksValues[idx]);

				link.onClick =controller.openAdditionalUsersSelection;
				link.rowData=at;

				link.fisaRowItem = rowGridItem;
				link.field = colDef.field;
				link.parentBtId = controller.parentBtId;
				link.tabId = controller.tabId;
				link.pageScopeId = controller.pageScopeId;
				link.urlToAdditionalUserPage = controller.urlToAdditionalUserPage;
				link.breadCrumbId = controller.breadcrumbId;

				colDef.grid.fisaLinks[idx]=link.id;
				
				return link;
		
		}
	},
	
	// formatter que genera el combo de formato
	formatterGridFormatCombo : function(data, idx, colDef, controller) {
		
		var d=data.split("-");
		var productId = d[0]; 
		var productLineId = d[1];
	
		// if (value != null) {
		if (idx >= 0) {
			
			var formatSelect = controller.selectedFormat[productId];
			var disabled = false;
			
			if (formatSelect === undefined) {
				formatSelect = '-1';
				disabled = true;
			}
			// crear nuevo combo
			var select = new Select({
				baseClass:'dijit dijitReset dijitInline dijitLeft dijitDownArrowButton dijitSelectFixedWidth dijitValidationTextBoxFixedWidth dijitSelect dijitValidationTextBox',
				options:controller.formatListData[productLineId],
				value:formatSelect
			});
			
			select.set("disabled", disabled);
			select.gridId=colDef.grid.id;
			select.productId=productId;
			select.tabId=controller.tabId;
			select.pageScopeId=controller.pageScopeId;
			
			select.onChange = function(value) {
				var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
				ctrlr.selectedFormat[this.productId] = value;
			}
			
			colDef.grid.fisaSelectFormat[idx]=select.id;
			
			return select;		
		}
	},
	
	// formatter que genera el Combo de Frecuencia
	formatterGridFrecuencyCombo : function(data, idx, colDef, controller) {
		
		var d=data.split("-");
		var productId = d[0]; 
		var productLineId = d[1];
	
		// if (value != null) {
		if (idx >= 0) {
			
			var frecuencySelect = controller.selectedFrecuency[productId];
			var disabled = false;
			
			if (frecuencySelect === undefined) {
				frecuencySelect = '-1';
				disabled = true;
			}
			// crear nuevo combo
			var select = new Select({
				baseClass:'dijit dijitReset dijitInline dijitLeft dijitDownArrowButton dijitSelectFixedWidth dijitValidationTextBoxFixedWidth dijitSelect dijitValidationTextBox',
				options:controller.frecuencyListData[productLineId],
				value:frecuencySelect
			});
			
			
			select.set("disabled", disabled);
			
			
			select.gridId=colDef.grid.id;
			select.productId=productId;
			select.tabId=controller.tabId;
			select.pageScopeId=controller.pageScopeId;
			
			select.onChange = function(value) {
				var grid = dijit.byId(this.gridId);
				var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
				ctrlr.selectedFrecuency[this.productId] = value;
			}
			
			colDef.grid.fisaSelectFrecuency[idx]=select.id;
			
			return select;		
		}
	}

});

return SANotificationGridProduct;

});
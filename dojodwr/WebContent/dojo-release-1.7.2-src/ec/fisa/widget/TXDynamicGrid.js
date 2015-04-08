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
	"dijit/form/Select",
	"dijit/form/TextBox",
	"ec/fisa/widget/OutputTextComplement"
], function(dojo, declare, lang, connect, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, FisaEnhancedGrid, CheckBox, Link, Select, TextBox, outputTextBox){

var TXDynamicGrid = declare("ec.fisa.widget.TXDynamicGrid", [FisaEnhancedGrid], {
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
	readWidth:'90px',
	readWidthSummary:'177px',
	txtWidth:'105',
	montoId:'monto',
	montoIdAux:'monto_aux',
	descId:'desc',
	
	//read fields
	montoReadId:'montoRead',
	descReadId:'descRead',
	chargeId : 'charge',
	totalAmountId : 'totalAmount',
	summaryId : 'summary',
	summarySaveId : 'summarySave',

	isSortable : true,
	postMixInProperties:function(){	
		this.inherited(arguments);	
		this.autoHeight=true;
		this.selectable="true";
		this.fisaEditableGrid=true;
		this.autoWidth = true;
		
		
		var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
		
		
		if (ctrlr.skinParameters) {
//			this.selectWidth = (ctrlr.skinParameters["stextCharWidth"] * ctrlr.skinParameters["sdefaultVisualSize"] ) + "px";
			this.selectWidth = '177px';
			this.txtWidth = '90px';
			this.readWidth ='90px';
//			this.txtWidth = ((ctrlr.skinParameters["tbtextCharWidth"] * ctrlr.skinParameters["tbdefaultVisualSize"]) / 2) + "px";
		}
		
		
		var strtr=[];
		
		strtr.push({name: "id", field: 'id',width:'auto', hidden: true, sortable:this.isSortable});  //0
		strtr.push({name: "Id Transacción", field: 'transactionType',width:'auto', hidden: true,noresize:true, sortable:this.isSortable});  //1
		strtr.push({name: ctrlr.initLabels.transactionName, field: 'transactionName',width:'94px', noresize:true,sortable:this.isSortable}); //2
		strtr.push({name: ctrlr.initLabels.outAccount, field: 'outAccount',width:'130px', noresize:true,sortable:this.isSortable});  //3
		strtr.push({name: ctrlr.initLabels.outAccountTypeName, field: 'outAccountTypeName',width:'90px', noresize:true,sortable:this.isSortable});    //4
		strtr.push({name: ctrlr.initLabels.beneficiaryBankName, field: 'beneficiaryBankName',width:'90px',noresize:true, sortable:this.isSortable}); //5		
		strtr.push({name: ctrlr.initLabels.beneficiaryName, field: 'beneficiaryName',width:'147px', noresize:true,sortable:this.isSortable});  //6
		
		strtr.push({
			name : ctrlr.initLabels.amount,
			field : this.montoId,
			width : this.selectWidth,
			widgetClass : ec.fisa.widget.NumberTextBox,
			sortable:this.isSortable,
			noresize:true,
			formatter : dojo.hitch(this, function(data, rowIndex, colDef) {	
				
				return this.formatterGridNumberTextBox(data, rowIndex, colDef, ctrlr);
			})
		});  //7
		
		strtr.push({
			name :  ctrlr.initLabels.desc,
			field : this.descId,
			width : this.selectWidth,
			widgetClass : dijit.form.TextBox,
			sortable:this.isSortable,
			noresize:true,
			formatter : dojo.hitch(this, function(data, rowIndex, colDef) {	
				
				return this.formatterGridTextBox(data, rowIndex, colDef, ctrlr);
			})
		});  //8
		//read fields
		
		strtr.push({name: ctrlr.initLabels.desc, field: this.descReadId, width: this.readWidth, hidden: true,
			widgetClass : ec.fisa.widget.OutputTextComplement,
			sortable:this.isSortable,
			noresize:true,
			formatter : dojo.hitch(this, function(data, rowIndex, colDef) {	
				
				return this.formatterGridReadTextBox(data, rowIndex, colDef, ctrlr);
			})
		});  //9
		
		
		strtr.push({name: ctrlr.initLabels.amount, field: this.montoReadId, width: '60px', hidden: true,
			widgetClass : ec.fisa.widget.OutputTextComplement,
			sortable:this.isSortable,
			noresize:true,
			formatter : dojo.hitch(this, function(data, rowIndex, colDef) {	
				
				return this.formatterGridReadNumberTextBox(data, rowIndex, colDef, ctrlr);
			})
		});  //10
		
		
		strtr.push({name: ctrlr.initLabels[this.chargeId], field: this.chargeId, width:'60px', hidden: true,
			widgetClass : ec.fisa.widget.OutputTextComplement,
			sortable:this.isSortable,
			noresize:true,
			formatter : dojo.hitch(this, function(data, rowIndex, colDef) {	
				
				return this.formatterGridReadNumberTextBox(data, rowIndex, colDef, ctrlr);
			})
		});  //11
		

		
		strtr.push({name: ctrlr.initLabels[this.totalAmountId], field: this.totalAmountId,width: this.readWidth,hidden: true,
			widgetClass : ec.fisa.widget.OutputTextComplement,
			sortable: this.isSortable,
			noresize:true,
			formatter : dojo.hitch(this, function(data, rowIndex, colDef) {	
				
				return this.formatterGridReadNumberTextBox(data, rowIndex, colDef, ctrlr);
			})
		}); //12
		
		strtr.push({name: ctrlr.initLabels[this.summaryId], field: this.summaryId, width: this.readWidthSummary, hidden: true,
			widgetClass : ec.fisa.widget.OutputTextComplement,
			sortable:this.isSortable,
			noresize:true,
			formatter : dojo.hitch(this, function(data, rowIndex, colDef) {	
				
				return this.formatterGridReadTextBox(data, rowIndex, colDef, ctrlr);
			})
		}); //13
		
		strtr.push({name: ctrlr.initLabels[this.summaryId], field: this.summarySaveId, width: this.readWidthSummary, hidden: true,
			widgetClass : ec.fisa.widget.OutputTextComplement,
			sortable:this.isSortable,
			noresize:true,
			formatter : dojo.hitch(this, function(data, rowIndex, colDef) {	
				
				return this.formatterGridReadTextBox(data, rowIndex, colDef, ctrlr);
			})
		});  //14
		
		//Mantis 18371 - CM Un campo aux para guardar el valor de monto ingresado
		strtr.push({
			name : ctrlr.initLabels.amount,
			field : this.montoIdAux,
			width : this.selectWidth,
			hidden: true,
			widgetClass : ec.fisa.widget.NumberTextBox,
			noresize:true,
			formatter : dojo.hitch(this, function(data, rowIndex, colDef) {	
				
				return this.formatterGridReadNumberTextBox(data, rowIndex, colDef, ctrlr);
			})
		});  //15
			
		this.fisaTextBoxAcc=[];
		this.fisaTextBoxDesc=[];
		this.structure=[strtr];
		this.store =  new ec.fisa.dwr.Store(
			"MultipleTransfersControllerDWR", 'viewDataTransactions', this.tabId,
			this.pageScopeId, [], null);
	},
	startup:function(){
		this.inherited(arguments);
		var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
		ctrlr.setTxMDinamicGridId(this.id);
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
	},// formatter que genera el link
	formatterGridNumberTextBox : function(data, idx, colDef, controller) {
		
		colDef.sortable =  this.isSortable;	
		
		var rowGridItem=colDef.grid.getItem(idx);
		
		if (controller.listGridData[rowGridItem] == undefined) {
			controller.listGridData[rowGridItem] = {};
		}
		
		
		var txtBox = new ec.fisa.widget.NumberTextBox({
			value: controller.listGridData[rowGridItem][this.montoId],
			readOnly:controller.inputDisabled,
			maxLength : 8,
			baseClass: "dijit dijitReset dijitInline dijitLeft dijitTextBox dijitNumberTextBox"
		});
		
		txtBox.grid = {};
		txtBox.grid.tabId=this.tabId;
		txtBox.grid.pageScopeId=this.pageScopeId;
		txtBox.rowGridItem = rowGridItem;
		txtBox.name = this.montoId;
		txtBox.idx = idx;
		
		txtBox.connect(txtBox,"onChange",function(value){
			if(this != window){
				
					var ctrlr = ec.fisa.controller.utils.getPageController(this.grid.tabId, this.grid.pageScopeId);

					ctrlr.listGridData[this.rowGridItem]["id"] = rowGridItem;
					
					if(value != "" || value < 0){
					
						ctrlr.listGridData[this.rowGridItem][this.name] = value;
					} else {
						ctrlr.listGridData[this.rowGridItem][this.name] = 0;
					}
			}
		});	
		
	
		
		return txtBox;
		
	},// formatter que genera el link
	formatterGridTextBox : function(data, idx, colDef, controller) {
		
		colDef.sortable =  this.isSortable;	
		
		var rowGridItem=colDef.grid.getItem(idx);
		
		if (controller.listGridData[rowGridItem] == undefined) {
			controller.listGridData[rowGridItem] = {};
		}
		
		var txtBox = new TextBox({
			value: controller.listGridData[rowGridItem][this.descId],
			readOnly:controller.inputDisabled,
			maxLength : 30,
			baseClass: "dijitTextBox"
		});
		
		txtBox.grid = {};
		txtBox.grid.tabId=this.tabId;
		txtBox.grid.pageScopeId=this.pageScopeId;
		txtBox.rowGridItem = rowGridItem;
		txtBox.name = this.descId;
		txtBox.idx = idx;
		txtBox.connect(txtBox,"onChange",function(value){
			if(this != window){
				if(value != ""){
					
					var ctrlr = ec.fisa.controller.utils.getPageController(this.grid.tabId, this.grid.pageScopeId);
		
					ctrlr.listGridData[this.rowGridItem]["id"] = rowGridItem;
					ctrlr.listGridData[this.rowGridItem][this.name] = value;
				}
			}
		});

		return txtBox;
	},// formatter 
	formatterGridReadNumberTextBox : function(data, idx, colDef, controller) {
			
		colDef.sortable =  this.isSortable;	
		
		var rowGridItem=colDef.grid.getItem(idx);
		
		if (controller.listGridData[rowGridItem] == undefined) {
			controller.listGridData[rowGridItem] = {};
		}
		var dinamicWidth = 20;
		
		try {
			dinamicWidth = (dojo.byId(colDef.id).offsetWidth / controller.skinParameters["tbtextCharWidth"])  - 2 ;
		} catch (e) {
			console.log(e);
		}
		
		
		var opTextBox = new ec.fisa.widget.OutputTextComplement({
			format:'4',
			value: controller.listGridData[rowGridItem][colDef.field],
			baseClass: "textboxBaseClass",
			complementBaseClass : "fisaOutputText",
//			visualSize:((controller.skinParameters["tbdefaultVisualSize"]/2 ))
			visualSize: dinamicWidth
		});
		
		return opTextBox;		
	}
	,// formatter
	formatterGridReadTextBox : function(data, idx, colDef, controller) {
		
		colDef.sortable =  this.isSortable;	
		
		var rowGridItem=colDef.grid.getItem(idx);
		
		if (controller.listGridData[rowGridItem] == undefined) {
			controller.listGridData[rowGridItem] = {};
		}
		
//		var opTextBox = new ec.fisa.widget.OutputTextComplement({
//			value: controller.listGridData[rowGridItem][colDef.field],
//			baseClass: "textboxBaseClass",
//			complementBaseClass : "fisaOutputText"
//		});
		
		return controller.listGridData[rowGridItem][colDef.field];		
	}
	
});

return TXDynamicGrid;

});
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

var PaymentDynamicGrid = declare("ec.fisa.widget.PaymentDynamicGrid", [FisaEnhancedGrid], {
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
	readWidth:'12%',
	readWidthSummary:'20%',
	txtWidth:'105',
	montoId:'monto',
	montoIdAux:'monto_aux',
	
	//read fields
	montoReadId:'montoRead',
	
	chargeId : 'charge',
	totalAmountId : 'totalAmount',
	summaryId : 'summary',
	summarySaveId : 'summarySave',
	
	//payments
	contractId : 'contract',
	descId:'desc',
	
	//readFields

	disabledId : 'disabledId',
	contractReadId:'contractReadId',
	descReadId:'descRead',
	

	isSortable : true,
	postMixInProperties:function(){	
		this.inherited(arguments);	
		this.autoHeight=true;
		this.selectable="true";
		this.fisaEditableGrid=true;
		
		
		var ctrlr = ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
		
		
		if (ctrlr.skinParameters) {
//			this.selectWidth = (ctrlr.skinParameters["stextCharWidth"] * ctrlr.skinParameters["sdefaultVisualSize"] ) + "px";
			this.selectWidth = '10%';
			this.txtWidth = '10%';
			this.readWidth ='10%';
//			this.txtWidth = ((ctrlr.skinParameters["tbtextCharWidth"] * ctrlr.skinParameters["tbdefaultVisualSize"]) / 2) + "px";
		}
		
		
		var strtr=[];
		
		strtr.push({name: "id", field: 'id',width:'auto', hidden: true, sortable:this.isSortable});  //0
		strtr.push({name: "Id Transacción", field: 'transactionType',width:'auto', hidden: true, sortable:this.isSortable, noresize:true});  //1
		strtr.push({name: ctrlr.initLabels.transactionName, field: 'transactionName',width:'10%', sortable:this.isSortable, noresize:true,headerstyle:'text-align:left'}); //2
		strtr.push({name: ctrlr.initLabels.companyName, field: 'companyName',width:'1%', hidden: true, sortable:this.isSortable, noresize:true}); //3
		strtr.push({name: ctrlr.initLabels.serviceName, field: 'serviceName',width:'8%', sortable:this.isSortable, noresize:true,headerstyle:'text-align:left'}); //4
		strtr.push({name: ctrlr.initLabels.contract, field: 'outAccount',width:'10%', sortable:this.isSortable, noresize:true,headerstyle:'text-align:left'});  //5

		strtr.push({ 
			name : ctrlr.initLabels.amount,
			field : this.montoIdAux,
			width : this.selectWidth,
			widgetClass : ec.fisa.widget.NumberTextBox,
			sortable:false,
			hidden: false,
			noresize:true,
			formatter : dojo.hitch(this, function(data, rowIndex, colDef) {	
				var renderReadInput=this.store.getValue(colDef.grid.getItem(rowIndex),this.disabledId);
				if(renderReadInput===true){
					return this.formatterGridReadTextBox(data, rowIndex, colDef, ctrlr);
				}
				return this.formatterGridNumberTextBoxAux(data, rowIndex, colDef, ctrlr);
			}),
			headerstyle:'text-align:left'
		});  //6 Mantis 18523 CM -> Auxiliar para poner el monto
		
		strtr.push({
			name :  ctrlr.initLabels.desc,
			field : this.descId,
			width : this.selectWidth,
			widgetClass : dijit.form.TextBox,
			sortable:this.isSortable,
			noresize:true,
			formatter : dojo.hitch(this, function(data, rowIndex, colDef) {	
				return this.formatterGridTextBox(data, rowIndex, colDef, ctrlr);
			}),
			headerstyle:'text-align:left'
		});  //7
		
		//read fields
		
		strtr.push({name: ctrlr.initLabels.desc, field: this.descReadId, width: this.readWidth, hidden: true,
			widgetClass : ec.fisa.widget.OutputTextComplement,
			sortable:this.isSortable,
			noresize:true,
			formatter : dojo.hitch(this, function(data, rowIndex, colDef) {	
				
				return this.formatterGridReadTextBox(data, rowIndex, colDef, ctrlr);
			}),
			headerstyle:'text-align:left'
		});  //8
		
		strtr.push({
			name : ctrlr.initLabels.amount,
			field : this.montoId,
			width : this.selectWidth,
			widgetClass : ec.fisa.widget.NumberTextBox,
			sortable:this.isSortable,
			hidden: true,
			noresize:true,
			formatter : dojo.hitch(this, function(data, rowIndex, colDef) {	
				
				return this.formatterGridNumberTextBox(data, rowIndex, colDef, ctrlr);
			}),
			headerstyle:'text-align:right'
		});  //9
		
		
		strtr.push({name: ctrlr.initLabels[this.chargeId], field: this.chargeId, width:this.readWidth, hidden: true,
			widgetClass : ec.fisa.widget.OutputTextComplement,
			sortable:this.isSortable,
			noresize:true,
			formatter : dojo.hitch(this, function(data, rowIndex, colDef) {	
				
				return this.formatterGridReadNumberTextBox(data, rowIndex, colDef, ctrlr);
			}),
			headerstyle:'text-align:right'
		});  //10
		

		
		strtr.push({name: ctrlr.initLabels[this.totalAmountId], field: this.totalAmountId,width: this.readWidth,hidden: true,
			widgetClass : ec.fisa.widget.OutputTextComplement,
			sortable: this.isSortable,
			noresize:true,
			formatter : dojo.hitch(this, function(data, rowIndex, colDef) {	
				
				return this.formatterGridReadNumberTextBox(data, rowIndex, colDef, ctrlr);
			}),
			headerstyle:'text-align:right'
		}); //11
		
		
		strtr.push({name: ctrlr.initLabels[this.summaryId], field: this.summaryId, width: this.readWidthSummary, hidden: false,
			widgetClass : ec.fisa.widget.OutputTextComplement,
			sortable:this.isSortable,
			noresize:true,
			formatter : dojo.hitch(this, function(data, rowIndex, colDef) {	
				
				return this.formatterGridReadTextBox(data, rowIndex, colDef, ctrlr);
			}),
			headerstyle:'text-align:left'
		}); //12
		
		strtr.push({name: ctrlr.initLabels[this.summarySaveId], field: this.summarySaveId, width: this.readWidthSummary, hidden: true,
			widgetClass : ec.fisa.widget.OutputTextComplement,
			sortable:this.isSortable,
			noresize:true,
			formatter : dojo.hitch(this, function(data, rowIndex, colDef) {	
				
				return this.formatterGridReadTextBox(data, rowIndex, colDef, ctrlr);
			}),
			headerstyle:'text-align:left'
		});  //13

		
		this.fisaTextBoxAcc=[];
		this.fisaTextBoxDesc=[];
		this.structure=[strtr];
		this.store =  new ec.fisa.dwr.Store(
			"MultiplePaymentsControllerDWR", 'viewDataTransactions', this.tabId,
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
		//var isDisable = controller.listGridData[rowGridItem][this.disabledId];	
//		if (isDisable === 'true') {
			
			var dinamicWidth = 20;
			
			try {
				dinamicWidth = (dojo.byId(colDef.id).offsetWidth / controller.skinParameters["tbtextCharWidth"])  - 2 ;
			} catch (e) {
				console.log(e);
			}
			
			
			var opTextBox = new ec.fisa.widget.OutputTextComplement({
				format:'4',
				value: controller.listGridData[rowGridItem][this.montoId],
				baseClass: "textboxBaseClass",
				complementBaseClass : "fisaOutputText",
//				visualSize:((controller.skinParameters["tbdefaultVisualSize"]/2 ))
				visualSize: dinamicWidth
			});
			
			return opTextBox;
		/*} else {
			
			var txtBox = new ec.fisa.widget.NumberTextBox({
				value: controller.listGridData[rowGridItem][this.montoId],
//				readOnly:controller.inputDisabled,
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
		}		*/
	},
	
formatterGridNumberTextBoxAux : function(data, idx, colDef, controller) {
		
		//colDef.sortable =  this.isSortable;	
		
		var rowGridItem=colDef.grid.getItem(idx);
		
		if (controller.listGridData[rowGridItem] == undefined) {
			controller.listGridData[rowGridItem] = {};
		}
		var isDisable = false;
		if(data){
			isDisable = data['disabledId'];	
		}
		if (isDisable) {
			
			var dinamicWidth = 20;
			
			try {
				dinamicWidth = (dojo.byId(colDef.id).offsetWidth / controller.skinParameters["tbtextCharWidth"])  - 2 ;
			} catch (e) {
				console.log(e);
			}
			
			
			var opTextBox = new ec.fisa.widget.OutputTextComplement({
				format:'4',
				value: data,
				baseClass: "textboxBaseClass",
				complementBaseClass : "fisaOutputText",
//				visualSize:((controller.skinParameters["tbdefaultVisualSize"]/2 ))
				visualSize: dinamicWidth
			});
			
			return opTextBox;
		} else {
			
			var txtBox = new ec.fisa.widget.NumberTextBox({
				value: data,
				//readOnly:data['disabledId'],
				maxLength : 8,
				baseClass: "dijit dijitReset dijitInline dijitLeft dijitTextBox dijitNumberTextBox"
			});
			
			txtBox.grid = {};
			txtBox.grid.tabId=this.tabId;
			txtBox.grid.pageScopeId=this.pageScopeId;
			txtBox.rowGridItem = rowGridItem;
			txtBox.name = this.montoIdAux;
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
		}		
	},
	
	formatterGridTextBox : function(data, idx, colDef, controller) {
		
		colDef.sortable =  this.isSortable;	
		
		var rowGridItem=colDef.grid.getItem(idx);
		
		if (controller.listGridData[rowGridItem] == undefined) {
			controller.listGridData[rowGridItem] = {};
		}
		
		var dinamicWidth = 20;
		
		try {
			dinamicWidth = dojo.byId(colDef.id).offsetWidth - 40 ;
		} catch (e) {
			console.log(e);
		}
		var width = "width: " + dinamicWidth + "px;";
		
		var txtBox = new TextBox({
			value: controller.listGridData[rowGridItem][colDef.field],
			readOnly:controller.inputDisabled,
			maxLength : 30,
			style: width,
			baseClass: "dijitTextBox"
		});
		
		txtBox.grid = {};
		txtBox.grid.tabId=this.tabId;
		txtBox.grid.pageScopeId=this.pageScopeId;
		txtBox.rowGridItem = rowGridItem;
		txtBox.name = colDef.field;
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
		if(controller.listGridData[rowGridItem][colDef.field]==null){
			controller.listGridData[rowGridItem][colDef.field]=data;
		}
		
		var opTextBox = new ec.fisa.widget.OutputTextComplement({
			value: controller.listGridData[rowGridItem][colDef.field],
			baseClass: "textboxBaseClass",
			complementBaseClass : "fisaOutputText"
		});
		
		return opTextBox;		
	},
	
	canSort:function(){
		return false;
	}
	
});

return PaymentDynamicGrid;

});
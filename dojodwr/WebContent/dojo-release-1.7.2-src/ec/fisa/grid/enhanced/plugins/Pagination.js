define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dojo/dom-construct",
	"dojo/_base/connect",
	"dojo/dom-style",
	"dojox/grid/EnhancedGrid",
	"dojox/grid/enhanced/plugins/Pagination",
	"dijit/form/Button"
], function(kernel, declare, domConstruct, connect, domStyle, EnhancedGrid, DojoPagination, Button){
		
var Pagination = declare("ec.fisa.grid.enhanced.plugins.Pagination", [DojoPagination], {
	name: "fisaPagination",
	description: false,
	pageStepper: true,
	pageSizes: null,
	maxPageStep: 4,
	position: 'bottom',
	isFormGrid:false,
	
	init: function(){
		var pageLength;
		if(this.grid.declaredClass === 'ec.fisa.grid.FisaFormGrid'){
			//La longitud de la pagina es de 10000 ya que todos los elementos deben presentarse en la misma página. JCVQ
			pageLength = 100000;
			this.isFormGrid = true;
		}else if(this.grid.pageLength){
			pageLength = this.grid.pageLength;
		}else{
			pageLength = 10;
		}
		
		this.pageSizes = [pageLength];
		this.inherited(arguments);
		this.initExecOptions();
		if(this.isFormGrid === true){
			this.hidePaginator();//JCVQ Grid que se presenta como formulario 
		}else{
			this.hidePageSizes();
		}
		
	},
	initExecOptions:function(){
		if(!this.option.newBlocked){
			var _execId=this.grid.id+"_newButton";
			this.grid.newButton =new dijit.form.Button({id:_execId,label:this.grid.newButtonLabel,iconClass:"imgAdd",tabIndex:this.option.tabIndexField},domConstruct.create("div",null,this._paginator.descriptionTd));
			this.grid.newButton.fautoexec=true;
			this.grid.newButton.fisaEditableGridId=this.grid.id;
			this.grid.newButton.connect(this.grid.newButton,"onClick",this.option.onNewExecute);
		}
	},
	hidePageSizes:function(){
		domStyle.set(this._paginator.sizeSwitchTd, "visibility", "hidden");
		domStyle.set(this._paginator.sizeSwitchTd, "width", "0%");
		domStyle.set(this._paginator.descriptionTd, "width", "65%");
		
		if(this.option.hidePaginationNumber != undefined && this.option.hidePaginationNumber  === true){
		domStyle.set(this._paginator.pageStepperTd, "visibility", "hidden");
		}
		
	},
	hidePaginator:function(){/*Creado para soportar los grids que se presentan como formulario JCVQ*/
		domStyle.set(this._paginator.domNode, "display", "none");
	}
});

EnhancedGrid.registerPlugin(Pagination/*name:'fisaPagination'*/);

return Pagination;

});
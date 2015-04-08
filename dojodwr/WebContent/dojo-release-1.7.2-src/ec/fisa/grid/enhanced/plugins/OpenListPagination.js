define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dojo/dom-construct",
	"dojo/_base/connect",
	"dojo/dom-style",
	"dojox/grid/EnhancedGrid",
	"dojox/grid/enhanced/plugins/Pagination",
	"dijit/form/Button", 
	"dijit/form/Select"
], function(kernel, declare, domConstruct, connect, domStyle, EnhancedGrid, DojoPagination, Button, Select){
		
var Pagination = declare("ec.fisa.grid.enhanced.plugins.OpenListPagination", [DojoPagination], {
	name: "openListPagination",
	description: false,
	pageStepper: true,
	pageSizes: null,
	maxPageStep: 4,
	position: 'bottom',
	select:null,
	
	buttonArray:null,
	
	init: function(){
		
		var pageLength;
		if(this.grid.pageLength){
			pageLength = this.grid.pageLength;
		}else{
			pageLength = 10;
		}
		
		this.pageSizes = [pageLength];
		this.inherited(arguments);
		this.initExecOptions();
		this.hidePageSizes();
		this._paginator._updatePageStepNodesStyleBK=this._paginator._updatePageStepNodesStyle;
		this._paginator._updatePageStepNodesStyle=this._updatePageStepNodesStyle;
	},
	destroy:function(){
		if(this.option){
			if(this.option.onSelect){
				delete this.option.onSelect;
			}
			if(this.option.onExecute){
				delete this.option.onExecute;
			}
			if(this.option.onClose){
				delete this.option.onClose;
			}
		}
		this.inherited(arguments);
		
	},
	initExecOptions:function(){
		this.grid._messagesId=this.grid.id+"_messages";
		domConstruct.create("span",{id:this.grid._messagesId,'class':'dojoxGridMessages'},this._paginator.descriptionTd);
	},
	hidePageSizes:function(){
		domStyle.set(this._paginator.sizeSwitchTd, "visibility", "hidden");
		domStyle.set(this._paginator.sizeSwitchTd, "width", "0%");
		domStyle.set(this._paginator.descriptionTd, "width", "65%");
	},
	_updatePageStepNodesStyle:function(){
		this._updatePageStepNodesStyleBK();
		var pageCount = this.plugin.getTotalPageNum();
		if((!this.islov)&&(this.options ==null|| this.options.length==0)){
			if(pageCount<=1){
				//domStyle.set(this.domNode,"display","none");
				//Mantis 17673 solo se oculta paginador, se mantiene visible panel de mensajes
				domStyle.set(this.plugin._paginator.pageStepperTd,"visibility","hidden");
			
			} else {
				//domStyle.set(this.domNode,"display",""); // Mantis 18331 JCVQ 
				domStyle.set(this.plugin._paginator.pageStepperTd,"visibility","");// Mantis 18331 JCVQ Se asegura de mostrar el paginador luego de hacer la consulta
			}
		}
	}
});

EnhancedGrid.registerPlugin(Pagination/*name:'fisaQtPagination'*/);

return Pagination;

});
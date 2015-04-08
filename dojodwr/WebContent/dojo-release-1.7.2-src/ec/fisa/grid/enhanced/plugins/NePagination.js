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
		
var Pagination = declare("ec.fisa.grid.enhanced.plugins.NePagination", [DojoPagination], {
	name: "fisaNePagination",
	description: false,
	pageStepper: true,
	pageSizes: null,
	maxPageStep: 4,
	position: 'bottom',
	newButton:null,
	editButton:null,
	deleteButton:null,
	queryButton:null,
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
	},
	destroy:function(){
		if(this.option){
			if(this.option.onNewExecute){
				delete this.option.onNewExecute;
			}
			if(this.option.onEditExecute){
				delete this.option.onEditExecute;
			}
			if(this.option.onDeleteExecute){
				delete this.option.onDeleteExecute;
			}
			if(this.option.onQueryExecute){
				delete this.option.onQueryExecute;
			}
		}
		this.inherited(arguments);
		if(this.newButton){
			var newButton = this.newButton;
			delete this.newButton;
			newButton.destroy(false);
		}
		if(this.editButton){
			var editButton= this.editButton;
			delete this.editButton;
			editButton.destroy(false);
		}
		if(this.deleteButton){
			var deleteButton = this.deleteButton;
			delete this.deleteButton;
			deleteButton.destroy(false);
		}
		if(this.queryButton){
			var queryButton = this.queryButton;
			delete this.queryButton;
			queryButton.destroy(false);
		}
	},
	initExecOptions:function(){
		if(!this.option.newBlocked){
			var _execId=this.grid.id+"_newButton";
			this.newButton =new dijit.form.Button({id:_execId,label:this.grid.newButtonLabel},domConstruct.create("div",null,this._paginator.descriptionTd));
			this.newButton.fautoexec=true;
			this.connect(this.newButton,"onClick",this.option.onNewExecute);
		}
		if(!this.option.editBlocked){
			var _execId=this.grid.id+"_editButton";
			this.editButton =new dijit.form.Button({id:_execId,label:this.grid.editButtonLabel},domConstruct.create("div",null,this._paginator.descriptionTd));
			this.editButton.fautoexec=true;
			this.connect(this.editButton,"onClick",this.option.onEditExecute);
		}
		if(!this.option.deleteBlocked){
			var _execId=this.grid.id+"_deleteButton";
			this.deleteButton =new dijit.form.Button({id:_execId,label:this.grid.deleteButtonLabel},domConstruct.create("div",null,this._paginator.descriptionTd));
			this.deleteButton.fautoexec=true;
			this.connect(this.deleteButton,"onClick",this.option.onDeleteExecute);
		}
		if(!this.option.queryBlocked){
			var _execId=this.grid.id+"_queryButton";
			this.queryButton =new dijit.form.Button({id:_execId,label:this.grid.queryButtonLabel},domConstruct.create("div",null,this._paginator.descriptionTd));
			this.queryButton.fautoexec=true;
			this.connect(this.queryButton,"onClick",this.option.onQueryExecute);
		}
	},
	hidePageSizes:function(){
		domStyle.set(this._paginator.sizeSwitchTd, "visibility", "hidden");
		domStyle.set(this._paginator.sizeSwitchTd, "width", "0%");
		domStyle.set(this._paginator.descriptionTd, "width", "65%");
	}
});

EnhancedGrid.registerPlugin(Pagination/*name:'fisaQtPagination'*/);

return Pagination;

});
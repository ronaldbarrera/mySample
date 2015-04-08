define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dojo/dom-construct",
	"dojo/_base/connect",
	"dojo/dom-style",
	"dojo/dom-attr",
	"dojox/grid/EnhancedGrid",
	"dojox/grid/enhanced/plugins/Pagination",
	"dijit/form/Button",
	"dijit/form/Select",
	"ec/fisa/report/QtReport"
], function(kernel, declare, domConstruct, connect, domStyle, domAttr, EnhancedGrid, DojoPagination, Button, Select, QtReport){
		
var Pagination = declare("ec.fisa.grid.enhanced.plugins.QtPagination", [DojoPagination], {
	name: "fisaQtPagination",
	description: false,
	pageStepper: true,
	pageSizes: null,
	maxPageStep: 4,
	position: 'bottom',
	selectButton:null,
	execButton:null,
	closeButton:null,
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
		this._paginator._createPageStepNodesBK=this._paginator._createPageStepNodes;
		this._paginator._createPageStepNodes=this._createPageStepNodes;
		this._paginator._updatePageStepperBK=this._paginator._updatePageStepper;
		this._paginator._updatePageStepper=this._updatePageStepper;
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
		if(this.selectButton){
			var selectButton = this.selectButton;
			delete this.selectButton;
			selectButton.destroy(false);
		}
		if(this.execButton){
			var execButton= this.execButton;
			delete this.execButton;
			execButton.destroy(false);
		}
		if(this.closeButton){
			var closeButton= this.closeButton;
			delete this.closeButton;
			closeButton.destroy(false);
		}
		if(this.select){
			var select = this.select;
			delete this.select;
			select.destroy(false);
		}
		if(this.buttonArray != null){
			dojo.forEach(this.buttonArray,function(buttonItem){
				delete buttonItem;
				buttonItem.destroy(false);
			});
		}
		
	},
	initExecOptions:function(){
		var tr =domConstruct.create("tr",{},domConstruct.create("tbody",{},domConstruct.create("table",{cellspacing:0,cellpadding:0,border:0},this._paginator.descriptionTd)));
		if (this.option.islov) {
			if(this.option.indirectSelectionVar != false){
			
			var _selectButtonId=this.grid.id+"_selectButton";
			this.selectButton = new dijit.form.Button({id:_selectButtonId,label:this.grid.selectButtonLabel,tabIndex:0},domConstruct.create("div",null,domConstruct.create("td",{},tr)));
			this.connect(this.selectButton,"onClick",this.option.onSelect);
			}
			//just close button.
			else if(this.option.lovInfoMode == true){
				var _closeButtonId=this.grid.id+"_closeButton";
				this.closeButton = new dijit.form.Button({id:_closeButtonId,label:this.grid.closeButtonLabel,tabIndex:0},domConstruct.create("div",null,domConstruct.create("td",{},tr)));
				this.connect(this.closeButton,"onClick",this.option.onClose);
				
			}
		} else if(this.option.options && this.option.options.length) {
			
			if(this.option.isFinalUser == "1"){
				this.buttonArray = [];
				dojo.forEach(this.option.options,dojo.hitch(this,function(optionItem){
					
					var buttonItem=new dijit.form.Button({id:_execId,label:optionItem.label,tabIndex:0},domConstruct.create("div",null,domConstruct.create("td",{},tr)));
					this.connect(buttonItem,"onClick",dojo.hitch(this,function(){
						this.grid.executeAction(this.grid.qtId,optionItem.value);
					}));
					
					this.buttonArray.push(buttonItem);
					
				}));
				
				
			}else{
				var _optsId=this.grid.id+"_options";
				var _execId=this.grid.id+"_execButton";
				this.select =new dijit.form.Select({id:_optsId,options:this.option.options,tabIndex:0},domConstruct.create("div",null,domConstruct.create("td",{},tr)));
				this.execButton=new dijit.form.Button({id:_execId,label:this.grid.execButtonLabel,tabIndex:0},domConstruct.create("div",null,domConstruct.create("td",{},tr)));
				this.connect(this.execButton,"onClick",this.option.onExecute);
			}
			
		}
		if(this.grid.showReportsButton&&this.grid.buttonsOnFooter){
			var _attrs={reportData:this.grid.reportData,async:false,exportLabel:this.grid.reportExportLabel,
					languageLabel:this.grid.reportLanguageLabel,'qt-id':this.grid.qtId,
					'fisa-tab-id':this.grid.tabId,
					'fisa-page-scope-id':this.grid.pageScopeId,
					popup:this.grid.reportPopup,
					showQtButtonMail:this.grid.showQtButtonMail,
					reportSendMailLabel:this.grid.reportSendMailLabel,
					hideLanguageSlct:this.grid.hideLanguageSlct};
			var report=new QtReport(_attrs,domConstruct.create("div",{},domConstruct.create("td",{},tr)));
			report.startup();
			this.grid.reportData=null;
			classNamePag=this._paginator.domNode.children[0].className;
			this._paginator.domNode.children[0].className=classNamePag+" bgGrayPaginator";
			
		}
		this.grid._messagesId=this.grid.id+"_messages";
		domConstruct.create("span",{id:this.grid._messagesId,'class':'dojoxGridMessages'},domConstruct.create("td",{},tr));
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
		if(!this.grid.showPaginationNumbers){
			var toHidde=[];
			var prevLabelNode=null;
			var nextLabelNode=null;
			dojo.forEach(this.pageStepperDiv.childNodes, function(node){
				var _value = domAttr.get(node,"value");
				if("firstPage"==_value||"lastPage"==_value){
					toHidde.push(node);
				} else if("prevPage"==_value){
					prevLabelNode=node;
				} else if("nextPage"==_value){
					nextLabelNode=node;
				}
			}, this);
			dojo.forEach(toHidde, function(node){
				domStyle.set(node,"display","none");
				domStyle.set(node,"visibility","hidden");
			}, this);
			if(prevLabelNode){
				var prevLabelNodeTitle = dojo.config.fisaQtPrevLabel;
				var css="dojoxGridWardButtonLabel";
				if(domAttr.get(prevLabelNode,"class").indexOf("Disable")>=0){
					css+="Disable";
				}
				var prev=domConstruct.place("<span class=\""+css+" "+css+"Prev\">"+prevLabelNodeTitle+"</span>",prevLabelNode,"after");
				domAttr.set(prev,"value","prevPageLabel");
			}
			if(nextLabelNode){
				var nextLabelNodeTitle = dojo.config.fisaQtNextLabel;
				var css="dojoxGridWardButtonLabel";
				if(domAttr.get(nextLabelNode,"class").indexOf("Disable")>=0){
					css+="Disable";
				}
				var next=domConstruct.place("<span class=\""+css+" "+css+"Next\">"+nextLabelNodeTitle+"</span>",nextLabelNode,"before");
				domAttr.set(next,"value","nextPageLabel");
			}
		}
	},
	_createPageStepNodes:function(){
		if(this.grid.showPaginationNumbers){
			this._createPageStepNodesBK(arguments);
		}
	},
	_updatePageStepper:function(){
		if(!this.grid.showPaginationNumbers){
			var toHidde=[];
			var toDestroy=[];
			dojo.forEach(this.pageStepperDiv.childNodes, function(node){
				var _value = domAttr.get(node,"value");
				if("firstPage"==_value||"lastPage"==_value){
					toHidde.push(node);
				}else if("prevPageLabel"==_value||"nextPageLabel"==_value){
					toDestroy.push(node);
				}
			},this);
			dojo.forEach(toHidde, function(node){
				domStyle.set(node,"display","block");
				domStyle.set(node,"visibility","");
			}, this);
			dojo.forEach(toDestroy, function(node,i){
				toDestroy[i]=null;
				domConstruct.destroy(node);
			}, this);
		}
		this._updatePageStepperBK();
	}
});

EnhancedGrid.registerPlugin(Pagination/*name:'fisaQtPagination'*/);

return Pagination;

});
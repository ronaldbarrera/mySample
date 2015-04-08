define([
		"./_base",
		"dijit/_Widget",
		"dijit/_Templated",
		"dojo/_base/declare",
		"dojo/_base/connect",
		"dojo/dom-construct",
		"dojo/text!ec/fisa/mobile/message/templates/ConfirmationPanel.html",
		"dojo/dom-attr",
		"dojo/on",
		"dojox/mobile/SimpleDialog"
	], function(_panelBase,_Widget, _Templated, declare, connect, domConstruct,template, domAttr, on, SimpleDialog){

		return declare("ec.fisa.mobile.message.ConfirmationPanel", [_Widget, _Templated], {
			_parentPanelCnt:null,
			/*variable indicating mode in it is presented the panel error*/
			errorAdded:"",
			_msgQuantity:0,
			tabId:"",
			pageScopeId:"",
			bindToController:false,
			_fisaOns:null,
			widgetsInTemplate : false,
			templateString: template,
			constructor:function(){
				this._fisaOns=[];
				this._msgQuantity = 0;
				errorAdded= 0;
			},
			
			buildRendering:function(){
				this.inherited(arguments);
			},
			
			destroyRendering:function(){
				errorAdded= "";
				this._msgQuantity = 0;
				delete this._parentPanelCnt;
			},

			startup:function(){
				this.inherited(arguments);
				if(this.bindToController){
					ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId).setMessagesPanel(this);
				}
			}

		});
	});

define(["dojo/_base/kernel",
    	"dojo/_base/declare",
    	"dijit/_Widget",
    	"dijit/_Templated",
    	"dojo/text!./templates/Retype.html",
    	"dijit/form/Button",
    	"dijit/form/TextBox",
    	"ec/fisa/widget/ConfirmDialog",
    	"dojo/dom-class",
    	"dojo/dom-construct"], function(dojo, declare, _Widget, _Templated,template,dojoButton, dojoTextBox, ConfirmDialog, domClass, domConstruct){
	var Retype = declare("ec.fisa.widget.Retype",[_Widget, _Templated], {
		'bt-id':'',
		'field-id':'',
		_btn:null,
		tabId:"",
		pageScopeId:"",
		acceptLabel:"Aceptar",
		modalTitle:dojo.config.fisaRetypeInstruction,
		wrongValueLabel:dojo.config.fisaRetypeError,
		iconClass:'fisaRetypeIcon',
		widgetsInTemplate:true,
		newValue:"",
		style:"",
		title:"",
		_kg:true,
		_destroyOnRemove: true,
		templateString: template,
		constructor: function(){
		},
		postCreate: function(){
			this.inherited(arguments);
			this.connect(this._btn,"onClick",this._onClick);
		},
		destroy: function(){
			this.inherited(arguments);
		},
		_onClick:function(){
			if(this._kg){
				this._dlgcnf = new ConfirmDialog( {
					acceptDialogLabel : this.acceptLabel,
					title : this.modalTitle,
					content : "",
					acceptAction : dojo.hitch(this, this._accept),
					cancelAction : dojo.hitch(this, this._cancel),
					disableCloseButton : false,
					disableCancelButton : true,
					destroyOnAccept:false
				});
				this._dlgcnf.show();
				var div = domConstruct.create("div",{},this._dlgcnf._bw.containerNode,"first");
				this._cmpCnf=new dijit.form.TextBox({},div);
				div = domConstruct.create("div",{},this._dlgcnf._bw.containerNode,"first");
				this._cmpMsg= new ec.fisa.message.Panel({},div);
			}
		},
		_acceptCallback:function(){
			domClass.replace(this._btn.iconNode,"fisaRetypeConfirmed",this.iconClass);
			this.destroyInputs();
			this.destroyModal();
			var cntrlr=ec.fisa.controller.utils.getPageController(this.tabId, this.pageScopeId);
			var rbt=cntrlr.retyped[this['bt-id']];
			if(rbt==null){
				cntrlr.retyped[this['bt-id']]=[];
				rbt=cntrlr.retyped[this['bt-id']];
			}
			rbt.push(this['field-id']);
			this._kg=false;
		},
		_accept:function(){
			if(this.newValue==this._cmpCnf.get("value")){
				this._acceptCallback();
			} else {
				this._cmpMsg.clearAllMessages();
				this._cmpMsg.update([{'summary':this.wrongValueLabel,'detail':null,'level':{'level':30000}}],null,null,null);
			}
		},
		_cancel:function(){
			this.destroyInputs();
		},
		destroyModal:function(){
			var _dlgcnf=this._dlgcnf;
			this._dlgcnf=null;
			_dlgcnf.destroyRecursive(false);
		},
		destroyInputs:function(){
			var cmp=this._cmpCnf;
			var _cmpMsg=this._cmpMsg;
			this._cmpCnf=null;
			this._cmpMsg=null;
			cmp.destroyRecursive(false);
			_cmpMsg.destroyRecursive(false);
		}
	} );
	
	return Retype;
	
});
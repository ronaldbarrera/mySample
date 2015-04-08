/**
 * Custom widget of confirmation.
 * */
define(["dojo", "dojox/widget/DialogSimple","dijit/_WidgetBase", "dijit/form/Button", "dojo/dom-construct", "dojo/dom-style",
        "./_base", "dojox/layout/ContentPane"], 
        function(dojo,  DialogSimple, _WidgetBase, Button, domConstruct, domStyle){
	return dojo.declare("ec.fisa.widget.ConfirmDialog", [_WidgetBase], {
		acceptDialogLabel:"",
		cancelDialogLabel:"",
		_acceptBtn:null,
		_cancelBtn:null,
		content:"",
		title:"",
		disableCancelButton:false,
		disableCloseButton: false,
		destroyOnAccept:true,
		_bw:null,
		href:null,
		ioArgs:{},
		style:null,
		showTitle:true,
		customStyle:"confDialogTitle",
		postCreate:function(){
			if(this.href == null || this.href == undefined){
				var cnt = "<span>"+this.content+"</span><br/>";
			}else{
				this.ioArgs.confirmDialogId = this.id;
				var contentPane = new dojox.layout.ContentPane(
						{title: this.title,
						 href:this.href,
						 ioArgs:this.ioArgs});
				var cnt = contentPane;
			}
			//Crea objeto de inicializacion del dialogo
			var dialogParams = {};
			dialogParams.content = cnt;
			if(this.showTitle == true){
				dialogParams.title = this.title;	
			}
			dialogParams.disableCloseButton = this.disableCloseButton;
			
			if(this.style != null){
				dialogParams.style = this.style;
			}
			
			//Crea el nuevo DialogSimple
			this._bw=new DialogSimple(dialogParams);
			
			if(this.showTitle == false){
				domStyle.set(this._bw.titleBar,"display","none");
				
			}
			//custom style
			this._bw.titleBar.className =  this._bw.titleBar.className + " " + this.customStyle;
			
			this._bw._onKey= function(evt)
			{
				if(this.disableCloseButton && evt.charOrCode == dojo.keys.ESCAPE) return;
			};
			var buttonsTable = domConstruct.create("table",{'class':'fisaBTActionBtns confDialogBtns'}, this._bw.containerNode);
			var buttonsTableBoddy = domConstruct.create("tbody",{}, buttonsTable);
			var buttonsRow = domConstruct.create("tr",{}, buttonsTableBoddy);
			var acceptButtonTd = domConstruct.create("td",{}, buttonsRow);

			var acceptDiv=domConstruct.create("div",{},acceptButtonTd);
			this._acceptBtn=new Button({'label':this.acceptDialogLabel,'baseClass':'dijitButton confDialogAcceptBtn','type':'button'},acceptDiv);
			this._acceptBtn.connect(this._acceptBtn,"onClick",dojo.hitch(this,"_acceptAction"));
			if(!this.disableCancelButton){
				var cancelButtonTd = domConstruct.create("td",{}, buttonsRow);
				var _cancelDiv=domConstruct.create("div",{},cancelButtonTd);
				this._cancelBtn=new Button({'label':this.cancelDialogLabel,'baseClass':'dijitButton confDialogCancelBtn','type':'button'},_cancelDiv);
				this._cancelBtn.connect(this._cancelBtn,"onClick",dojo.hitch(this,"_cancelAction"));
			}
			if(this.disableCloseButton){
				domStyle.set(this._bw.closeButtonNode,"display","none");
			} else {
				this.connect(this._bw.closeButtonNode,"onClick",dojo.hitch(this,"_cancelAction"));
			}
		},
		show:function(){
			this._bw.show();
		},
		hide:function(){
			this._bw.hide();
		},
		destroy:function(){
			if(this._acceptBtn){
				this._acceptBtn.destroy(false);
				this._acceptBtn=null;
			}
			if(this._cancelBtn){
				this._cancelBtn.destroy(false);
				this._cancelBtn=null;
			}
			if(this._bw){
				this._bw.destroy(false);
				this._bw=null;
			}
			this.inherited(arguments);
		},


		acceptAction: function(){
			//has to be passed as parameter
		},
		cancelAction: function(){

		},

		_acceptAction: function(){

			if(this.acceptAction){
				this.acceptAction(arguments);
			}
			if(this.destroyOnAccept){
				this.destroy();
			}
		},

		_cancelAction: function(){
			if(this.cancelAction){
				this.cancelAction(arguments);
			}
			this.destroy();
		}
	});
});

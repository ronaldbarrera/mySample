/**
 * Custom widget of confirmation.
 * */
define(["dojo", "dojox/widget/DialogSimple", "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/text!./templates/confirm_tmp_dialog.html",
        "./_base"], 
        function(dojo,  DialogSimple ,_WidgetBase,  _TemplatedMixin,_WidgetsInTemplateMixin, template){
	return dojo.declare("ec.fisa.widget.ConfirmTemplateDialog", [_WidgetBase,DialogSimple,_TemplatedMixin,_WidgetsInTemplateMixin], {
		widgetsInTemplate : true,
		acceptDialogLabel:"",
		cancelDialogLabel:"",
		overWriteDialogLabel:"",
		_acceptDialogButton:null,
		_cancelDialogButton:null,
		_overWriteDialogButton:null,
		_closeButtonNode:null,
		templateString: template,

		disableCloseButton: false,

		/* *********************************************************** postCreate */
		postCreate: function()
		{
			this.inherited(arguments);
			this._updateCloseButtonState();
			this._updateCancelButtonState();
		},

		/* *************************************************************** _onKey */
		_onKey: function(evt)
		{
			if(this.disableCloseButton && evt.charOrCode == dojo.keys.ESCAPE) return;
			this.inherited(arguments);
		},

		
		/* ************************************************ setCloseButtonDisabled*/
		setCloseButtonDisabled: function(flag)
		{
			this.disableCloseButton = flag;
			this._updateCloseButtonState();
		},
		
		/* ********************************************** _updateCloseButtonState */
		_updateCloseButtonState: function()
		{
			dojo.style(this._closeButtonNode,
					"display",this.disableCloseButton ? "none" : "block");
		},

		/* ********************************************** _updateCancelButtonState */
		_updateCancelButtonState: function()
		{
			if(this.disableCancelButton){
				this._cancelDialogButton.destroy(false);
			}
		},

		acceptAction: function(){
			//has to be passed as parameter
		},
		cancelAction: function(){

		},
		overWriteAction: function(){

		},

		_acceptAction: function(){

			if(this.acceptAction){
				this.acceptAction(arguments);
			}
			this.destroy();
		},

		_cancelAction: function(){
			if(this.cancelAction){
				this.cancelAction(arguments);
			}
			this.destroy();
		},
		
		/**OverWrite Action */
		_overWriteAction: function(){
			if(this.overWriteAction){
				this.overWriteAction(arguments);
			}
			this.destroy();
		}
		
	});
});

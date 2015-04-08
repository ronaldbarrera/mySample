define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/fx",
	"dojo/_base/window",
	"dojo/dom-style",
	"dojo/_base/sniff",
	"dojox/form/FileInputAuto",
	"dojo/io/iframe"
], 
function(declare, lang, fx, win, domStyle, has,  FileInput, ioIframe){

var FileInputAuto = declare("ec.fisa.widget.file.FileInputAutoAutomatic", FileInput, 
	{

	_matchValue: function(){
		this.inherited(arguments);
		this._sendFile();
	}
	,
	_onBlur:function(){
		//do nothing. to prevent duplicate  calls
	},
	
	_sendFile: function(/* Event */e){
		// summary: triggers the chain of events needed to upload a file in the background.
		if(this._sent || this._sending || !this.fileInput.value){ return; }
		this._sending = true;
		domStyle.set(this.fakeNodeHolder,"display","none");
		domStyle.set(this.overlay,{
			opacity:0,
			display:"block"
		});
		this.setMessage(this.uploadMessage);
		fx.fadeIn({ node: this.overlay, duration:this.duration }).play();
		var _newForm;
		if(has('ie') < 9 || (has('ie') && has('quirks'))){
			// just to reiterate, IE is a steaming pile of code.
			_newForm = document.createElement('<form enctype="multipart/form-data" method="post">');
			_newForm.encoding = "multipart/form-data";
			_newForm.acceptCharset = "UTF-8";
			
		}else{
			// this is how all other sane browsers do it
			_newForm = document.createElement('form');
			_newForm.setAttribute("enctype","multipart/form-data");
			_newForm.setAttribute("accept_charset","UTF-8");
			_newForm.acceptCharset = "UTF-8";
		}
		_newForm.appendChild(this.fileInput);
		win.body().appendChild(_newForm);
		ioIframe.send({
			url: this.url,
			form: _newForm,
			handleAs: "json",
			method:"POST",
			handle: lang.hitch(this,"_handleSend"),
			content: this.onBeforeSend()
		});
	}
	
});

return FileInputAuto;
});

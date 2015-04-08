define([
        "dojo/_base/declare",
        "dojo/_base/connect",
        "dojo/_base/lang",
        "dojo/dom-attr",
        "dojo/dom-style",
        "dojo/dom-geometry",
        "dojo/on",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/text!ec/fisa/widget/file/templates/UploadTemplate.html",
        "dijit/form/Button",
        "dijit/form/TextBox",
        "ec/fisa/controller/Utils",
        "ec/fisa/widget/OutputText",
        "ec/fisa/controller/custom/BtController",
        "ec/fisa/controller/custom/QtController",
        "./_base"
        ], function(declare, connect, lang, domAttr,domStyle, domGeometry, on, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, fileUploadTemplate, Button, TextBox, controllerUtils){
	return declare("ec.fisa.widget.file.FileUploader", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		_textBox:null,
		_button:null,
		_readOnlyExpr:"",
		readOnly:false,
		actionModeReq:'QY',		
		description:"",
		tabId:"",
		pageScopeId:"",
		hasFieldRoutineOrPolicy:false,
		templateString: fileUploadTemplate,
		selectIconClass:'uploaderIcon',
		selectBaseClass:'fisaLov',
		onChangeTextBoxConnect:null,
		prompt:"",
		postMixInProperties:function(){
			this.inherited(arguments);
	    	if(this.readOnly){
				this._readOnlyExpr="disabled=true";
			}
	    	this.tabId=this['fisa-tab-id'];
	    	this.pageScopeId=this['fisa-page-scope-id'];

		},
		postCreate: function(){
			this.inherited(arguments);
			this.connect(this._button,"onClick", this._onButtonClick);

		},
		startup: function(){
			this.inherited(arguments);
			domStyle.set(this.domNode, "visibility", "");
			var cntrlr = ec.fisa.controller.utils.getPageController(this["fisa-tab-id"],this["fisa-page-scope-id"]);
			cntrlr.addParamToModel(this);
			if(this.hasFieldRoutineOrPolicy==true){
				cntrlr.addFieldRoutineEvent( this , this.actionModeReq);
				this._fStarted=true;
			}

			
			
		},
		
		attachOnChangeEvent : function(controller, btId, fid, actionMode) {
			if (this._fStarted == true) {
				this._textBox._fStarted = true;
				delete this._fStarted;
			}
			var toConnect=this._textBox;
			toConnect.connect(toConnect, "onChange", dojo.hitch(this,this.execRoutine,btId,fid,actionMode));
			//this.onFChange=dojo.hitch(this,this.execRoutine,btId,fid,actionMode);
		},
		execRoutine : function(btId, fid,actionMode) {
			var id = this.id;
			if (this._textBox._fStarted) {
				var ctrllr = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId); 
				ctrllr.executeFieldRoutines(btId, fid, actionMode,id);
			} else {
				this._textBox._fStarted = true;
			}
		},
		
		
		_onButtonClick:function(){
			var btId = this["bt-id"];
			var fieldId = this["field-id"];
			var fisaTabId = this["fisa-tab-id"];
			var fisaPageScopeId = this["fisa-page-scope-id"];
			var height = 300;
			var width = 750;
			var title = this["prompt"];
			var qtHref = dojo.config.fisaContextPath+"/pages/static/file/fileUploader.jsp";
			var fuId = btId + "_" + fieldId + "_fileUploader";
			var qtParams = {content:{tabId:fisaTabId, pageScopeId:fisaPageScopeId, btId:btId, parentWidgetId:this.id, fieldId:fieldId}};
			var dialogArgs= {id:fuId, title:title, href:qtHref, executeScripts:true, ioArgs:qtParams, ioMethod:dojo.xhrPost};
			var dialogStyle=null;
			if (height & width) {
				dialogStyle={w:width, h:height};
			} 
			dialogArgs.style="height:"+dialogStyle.h+"px;width:"+dialogStyle.w+"px;";
			var fileUploaderDialogue = new dojox.widget.DialogSimple(dialogArgs);
			fileUploaderDialogue.connect(fileUploaderDialogue,"onHide",function(){
				this.destroyRecursive(false);
			});
			fileUploaderDialogue.show();
			this._resizeContainerNode(fileUploaderDialogue,dialogStyle);
			
		},
		
		_resizeContainerNode:function(fileUploaderDialogue,dialogStyle){
			var titleDim=domGeometry.getMarginBox(fileUploaderDialogue.titleNode);
			domStyle.set(fileUploaderDialogue.containerNode, "height", (dialogStyle.h-titleDim.h-(titleDim.t*4))+"px");
			domStyle.set(fileUploaderDialogue.containerNode, "overflowY", "auto");
			domStyle.set(fileUploaderDialogue.containerNode, "overflowX", "auto");
		},
		
		getController : function (){
			var fisaTabId = this["fisa-tab-id"];
			var fisaPageScopeId = this["fisa-page-scope-id"];
			var fc = ec.fisa.controller.utils.getPageController(fisaTabId, fisaPageScopeId);
			return fc;
		},
		
		_getBindingAttr : function(value) {
			return this._textBox.get("binding");
		},
		_setBindingAttr : function() {
			this._textBox.set("binding", value);
		},
		_getValueAttr : function() {
			return this._textBox.get("value");
		},
		_setValueAttr : function(value, /* Boolean? */priorityChange, /* String? */
				formattedValue) {
			
			this._textBox.set("value", value, priorityChange);//Mantis 18288 JCVQ se envía priorityChange en la invocacion al metodo set
			var fileName = value;
			
			if(value!=null && value!=""){
				var index =  value.indexOf('_f_');
				fileName = value.substring(index+3);
			}
			this._fileNameNode.innerHTML= fileName;
		}
	});
});

define([
		"dijit/_Widget", 
		"dijit/_Templated", 
		"dojo/_base/declare",
		"dojo/dom-style",
		"dojo/html",
		"dojo/on",
		 "dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin",
		"dojo/text!ec/fisa/widget/templates/AgendaActions.html",
		"dijit/form/Button",
		"dijit/form/Select",
		"./_base"
		],
		function(_Widget, _Templated, declare, domStyle, html, on, _TemplatedMixin,_WidgetsInTemplateMixin, template) {

			return declare("ec.fisa.widget.AgendaActions", [ _Widget, _Templated, _TemplatedMixin, _WidgetsInTemplateMixin ], {
				widgetsInTemplate : true,
				_seleccionNode:null,
				_botonNode: null,
				_textoNode: null,
				_destroyOnRemove: true,
				botonNodeLabel : null,
				textoNodeMensaje: null,
				tarea : null,
				tabId: null,
				pageScopeId: null, 
				templateString : template,
				constructor: function(){
				
				},
				postCreate: function(){
						this.inherited(arguments);
						this._init();
				},
				logger: function(obj){
//					if(typeof console != "undefined"){
//						console.log(obj);
//					}
				},_init:function(){
					this._initSeleccionNode();
					this._initBotonNode();
					this._initTextoNode();
				},_initSeleccionNode:function(){
					if(this.tarea.canBeDispatched && !this.tarea.isPersonalizedTask){
							domStyle.set(this._seleccionNode.domNode,"display","block");
							var data2 = {
								identifier: "value",
								label: "label",
								items: this.tarea.taskActions
							};
						//	var readStore = new dojo.data.ItemFileWriteStore({data:dojo.clone(data2)});
							this._seleccionNode.set("options", this.tarea.taskActions);
							//this._seleccionNode.set("value", "-1");
							
							if(this.tarea.retypeNeeded || this.tarea.isFlowTask){
								this._seleccionNode.set("disabled", true);
							}
							//this._attachEvents.push(this.connect(this._seleccionNode, "onChange", "_setupSelectedAction"));
						this._seleccionNode.fw=this;
						on(this._seleccionNode,"change",this._setupSelectedAction); // al usar "on" la referencia 'this' cambia al select en lugar del widget.
					
					}else{
						domStyle.set(this._seleccionNode.domNode,"display","none");
					}
				},_initBotonNode:function(){
					if(this.tarea.canBeDispatched && !this.tarea.isPersonalizedTask){
						if(!(this.tarea.retypeNeeded || this.tarea.isFlowTask)){
							domStyle.set(this._botonNode.domNode,"display","block");
							this._botonNode.set("label",this.botonNodeLabel);
							this._botonNode.fw=this;
							on(this._botonNode,"click",this._dispatchTask);
							//this._attachEvents.push(this.connect(this._botonNode, "onClick", "_dispatchTask"));
						}else{
							domStyle.set(this._botonNode.domNode,"display","none");
						}
						//	on(this._botonNode, "click", this._dispatchTask);
						
					}else{
						domStyle.set(this._botonNode.domNode,"display","none");
					}
				}, _initTextoNode:function(){
					if(this.tarea.retypeNeeded){
						html.set(this._textoNode,this.textoNodeMensaje);
					}
				},_dispatchTask:function(){
					var tarea = this.fw.tarea;
					var tareaVO={
							taskId:tarea.taskId,
							customizedActionId:tarea.customizedActionId,
							customizedActionFilter: tarea.customizedActionFilter,
							newActionStatusFilter: tarea.newActionStatusFilter,
							status: tarea.status,
							urlInfo: tarea.urlInfo,
							dataKey:tarea.dataKey,
							btKeys:tarea.btKeys,
							taskSystem:tarea.taskSystem,
							taskSubSystem:tarea.taskSubSystem,
							referenceCode:tarea.referenceCode,
							taskTypeId:tarea.taskTypeId,
							taskComment:tarea.taskComment,
							$dwrClassName: "TaskVO"
						};
					
						var controller =ec.fisa.controller.utils.getPageController(this.fw.tabId,this.fw.pageScopeId);
						controller.dispatchTask(tareaVO, this.fw.tabId,this.fw.pageScopeId);
				},_setupSelectedAction:function(value){
					this.fw.tarea.newActionStatusFilter=value;
				},_getTareaAttr : function(){
						return this.tarea;
				},_setTareaAttr : function(tarea){
						this.tarea=tarea;
				},_getBotonNodeLabelAttr : function () {
						return this.botonNodeLabel
				},_setBotonNodeLabelAttr : function (botonNodeLabel) {
						this.botonNodeLabel=botonNodeLabel;
				},_getTextoNodeMensajeAttr : function (){
					return this.textoNodeMensaje;
				},_setTextoNodeMensajeAttr : function (textoNodeMensaje){
					 this.textoNodeMensaje=textoNodeMensaje;
				},_getTabIdAttr : function(){
						return this.tabId;
				},_setTabIdAttr : function(tabId){
						this.tabId=tabId;
				},_getPageScopeIdAttr : function(){
						return this.pageScopeId;
				},_setPageScopeIdAttr : function(pageScopeId){
						this.pageScopeId=pageScopeId;
				}
			});
		});
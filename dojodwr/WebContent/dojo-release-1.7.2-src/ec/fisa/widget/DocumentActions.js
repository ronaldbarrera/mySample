define([
		"dijit/_Widget",
		"dijit/_Templated",
		"dojo/_base/declare",
		"dojo/dom-style",
		"dojo/html",
		"dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin",
		"dojo/text!ec/fisa/widget/templates/documents_actions.html",
		"ec/fisa/controller/Utils",
		"./_base"
		],
		function(_Widget, _Templated, declare, domStyle, html, _TemplatedMixin, _WidgetsInTemplateMixin, template) {

			return declare("ec.fisa.widget.DocumentActions", [ _Widget, _Templated, _TemplatedMixin, _WidgetsInTemplateMixin ], {
				widgetsInTemplate : true,
				
				_descarga:null,
				_undo:null,
				_history:null,
				_preview:null,
				rowItemData:null,
				descargaTitle:null,
				undoTitle:null,
				historyTitle:null,
				previewTitle:null,

				descargaHref:null,
				previewHref:null,
				labels:null,
				treeGrid:null,
				
				descargaVisible:null,
				undoVisible:null,
				historyVisible:null,
				previewVisible:null,
				templateString : template,

				//scopevars.
				historyAction:function(){
				//to be overrided.	
				},
				undoAction:function(){
					//to be overrided.	
				},
				
				descargaAction:function(){
				},
				
				previewAction:function(){
				},
				
				
				constructor: function(){
				},
				postCreate: function(){
						// this.logger("Invoca postCreate...");
						this.inherited(arguments);
						this._init();
				}
				,_init:function(){
					this._initDescargaNode();
					this._initUndoNode();
					this._initPreviewNode();
					this._initHistoryNode();
				}
				,
				
				_initDescargaNode:function(){
					// TODO: AGREGAR LOS DISABLED.
					if(this.descargaVisible == true){
							domStyle.set(this._descarga,"display","block");
					}else{
						domStyle.set(this._descarga,"display","none");
					}
				},
				_initUndoNode:function(){
					// TODO: AGREGAR LOS DISABLED.
					if(this.undoVisible == true){
							domStyle.set(this._undo,"display","block");
					}else{
						domStyle.set(this._undo,"display","none");
					}
				},
				
				
				_initPreviewNode:function(){
					// TODO: AGREGAR LOS DISABLED.
					if(this.previewVisible == true){
							domStyle.set(this._preview,"display","block");
					}else{
						domStyle.set(this._preview,"display","none");
					}
				},
				_initHistoryNode:function(){
					// TODO: AGREGAR LOS DISABLED.
					if(this.historyVisible == true){
							domStyle.set(this._history,"display","block");
					}else{
						domStyle.set(this._history,"display","none");
					}
				},
				_historyAction:function(){
					if(this.historyAction){
						this.historyAction(arguments);
					}
					
					
					
				},
				
				_descargaAction:function(){
					if(this.descargaAction){
						this.descargaAction(arguments);
					}
					
				},
				_previewAction:function(){
					if(this.previewAction){
						this.previewAction(arguments);
					}
					
				},
				
				//UNDO ACTIONS
				_undoAction:function(){
					if(this.undoAction){
						this.undoAction(arguments);
					}
				},
				
				
				
				_getLabelsAttr : function() {
					return this.labels;
				},
				_setLabelsAttr : function(labels) {
					this.labels = labels;
					
				}
				
			});
		});
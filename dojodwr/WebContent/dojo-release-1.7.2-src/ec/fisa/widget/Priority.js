define([
		"dijit/_Widget", 
		"dijit/_Templated", 
		"dojo/_base/declare",
		"dojo/dom-style",
		"dojo/html",
		"dojo/on",
		"dojo/dom-attr",
		 "dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin",
		"dojo/text!ec/fisa/widget/templates/Priority.html",
		"dijit/form/DropDownButton",
		"dijit/MenuItem",
		"./_base"
		],
		function(_Widget, _Templated, declare, domStyle, html, on, domAttr, _TemplatedMixin,_WidgetsInTemplateMixin, template) {

			return declare("ec.fisa.widget.Priority", [ _Widget, _Templated, _TemplatedMixin, _WidgetsInTemplateMixin ], {
				widgetsInTemplate : true,
				_priority_style: null,
				_priority_menu : null,
				_priority_button: null,
				_destroyOnRemove: true,
				tarea : null,
				initialPriorityValue:null,
				tabId: null,
				pageScopeId: null, 
				agendaController:null,
				templateString : template,
					
				readOnlyMode:false,
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
				},
				_init:function(){
					this.agendaController =ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
					this.initialPriorityValue=this._validatePriorityValue(this.initialPriorityValue);
					if(this.readOnlyMode){
						this._initPriorityMenu();
					}else{
						domStyle.set(this._priority_button.domNode,"display","none");
					}
					this._updatePriorityStyle(this.initialPriorityValue);
				},
				_initPriorityMenu:function(){
						var options = this.agendaController.dataGridPriorityList;
						for(var i=0; i<options.length; i++){
							var itemMap = options[i];
							var labelW= itemMap['label'];
							var valueW= itemMap['value'];
							
							var menuItem = new dijit.MenuItem({
										label: labelW,
										fw:this,
										priorityV:valueW,
										onClick: function(){
											this.fw._updatePriority(this.priorityV);}
									});
							
							
							this._priority_menu.addChild(menuItem);
						}
				},
				_updatePriority:function(value){
					var tarea = this.tarea;
					var taskId = tarea.taskId;
					var currentValue = this._validatePriorityValue(this.tarea.priority);
					this._updatePriorityStyle(value);
					if(value==currentValue){
						
					}else{
						this.tarea.priority=value;
						this.agendaController.updateSingleTaskPriority(taskId, value);
					}
				}, 
				 _validatePriorityValue : function (value){
					if(value=="" || value==null){
						return "-1";
					}else{
						return value;
					}
				 },
				 _updatePriorityStyle:function(value){
					 if(value=='1'){
						domAttr.set(this._priority_style, "class", "low_priority");
					 } else if(value=='2'){
						domAttr.set(this._priority_style, "class", "normal_priority");
					 }else if(value=='3'){
						domAttr.set(this._priority_style, "class", "high_priority");
					 } 
						
				},
				_getTareaAttr : function(){
						return this.tarea;
				},
				_setTareaAttr : function(tarea){
						this.tarea=tarea;
				},
				_getTabIdAttr : function(){
						return this.tabId;
				},
				_setTabIdAttr : function(tabId){
						this.tabId=tabId;
				},
				_getPageScopeIdAttr : function(){
						return this.pageScopeId;
				},
				_setPageScopeIdAttr : function(pageScopeId){
						this.pageScopeId=pageScopeId;
				},
				_getInitialPriorityValueAttr : function(){
					return this.initialPriorityValue;
				},
				_setInitialPriorityValueAttr : function(initialPriorityValue){
					this.initialPriorityValue=initialPriorityValue;
				},
				_getReadOnlyModeAttr : function(){
					return this.readOnlyMode;
				},
				_setReadOnlyModeAttr : function(readOnlyMode){
					this.readOnlyMode=readOnlyMode;
				},
				destroy:function(){
					delete this.agendaController;
					delete this.tarea;
					this.inherited(arguments);
				}
			});
		});
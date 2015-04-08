define(
		[
		"./_base","dijit/_Widget",
		"dijit/_Templated",
		"dojo/_base/declare",
		"dojo/number",
		"dojo/text!ec/fisa/widget/templates/ReadOnlySelect.html"
		],
		function(_widgetBase,_Widget, _Templated, declare,number,template) {

			return declare("ec.fisa.widget.ReadOnlySelect", [ _Widget, _Templated ], {
				tabId:'',
				pageScopeId:'',
				styleClass:"",
				hasFieldRoutineOrPolicy:false,
				actionModeReq:'QY',
				parentGridId:null,
				qtId:"",
				fieldId:"",
				valueColumn:0,
				labelColum:1,
				options:[],
				templateString : template,
				_destroyOnRemove: true,
				postMixInProperties:function(){
					this.inherited(arguments);
					this.qtId=this["qt-id"];
					var cntrlr = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
					
					if(this.parentGridId==null){
						this.value=cntrlr.obtainInitialValue(this);
					}
					this.options=cntrlr.loadSelectData(this,true);
				},
				
				postCreate:function(){
					this._componentNode.innerHTML="";
					for(var i=0;i<this.options.length;i++){
						var item = this.options[i];
						var value = item.value;
						if(value==this.value && value!=""){
							var label = item.label;
							this._componentNode.innerHTML=label;
							break;
						}
					}
				},
				
				startup:function(){
					this.inherited(arguments);
					
				},
				destroy:function(){
					this.inherited(arguments);
				},
				
				
				_setEnabledAttr:function(value){
					if(value != null){
						if(value){
							ec.fisa.widget.utils.enableWidget(this);
						} else {
							ec.fisa.widget.utils.disableWidget(this);
						}
					}
				},
				_getEnabledAttr:function(){
					return ec.fisa.widget.utils.isEnabled(this);
				}
			});


		});

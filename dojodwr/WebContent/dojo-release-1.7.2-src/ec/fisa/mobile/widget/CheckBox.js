define([
	"dojo/_base/declare",
		"dojo/dom-attr",
		"dojo/on",
		"dijit/_Widget",
		"dijit/_Templated",
		"dojo/text!ec/fisa/mobile/widget/templates/CheckBox.html",
		"./_MvcMixin",
		"ec/fisa/controller/Utils",
		"ec/fisa/widget/Utils",
		"dijit/form/CheckBox",
		"./_base"] ,
	function(declare,  domAttr, dojoOn,  _Widget, _Templated, template,MvcMixin) {
			return declare("ec.fisa.mobile.widget.CheckBox",[ _Widget, _Templated, MvcMixin], {
				isARoutineField:false,
				baseClass:"",
				_baseClassInner:"dijitCheckBox",
				routineBtId:null,
				routineFieldId:null,
				routineActionMode:null,
				tabId:"",
				pageScopeId:"",
				widgetsInTemplate : true,
				templateString : template,
				_componentNode:null,
				_labelNode:null,
				placeHolder: "",
				_destroyOnRemove: true,
				value:"1",
				readOnlyValue: false,
				parentEditableGrid:false,
				entityMrId:null,
				gridRealRowIndex:null,
				gridId:null,
				tabIndexField:null,
				_tabIndex:0,
				fieldId:null,
				
				constructor: function(){
//					var fieldId = data.fieldId || '';
				},
				postMixInProperties:function(){
					this.inherited(arguments);
					var readOnly = this.readOnly || false;
					this.readOnlyValue = readOnly;
					this.value = this.value || '0';
					if(this.tabIndexField != null){
						this._tabIndex = this.tabIndexField;
					}
					if(this.baseClass!=null&&this.baseClass!=""){
						this._baseClassInner=this.baseClass;
						this.baseClass="";
					}
				},
				startup: function(){
					this.inherited(arguments);
					this.addParamToModel();
					this._componentNode.node=this;
					this._labelNode.className = "dijitCheckBoxLabel";
					if(this.ftype=="QT"){
						this._labelNode.innerHTML =this.placeHolder;
						this._labelNode.style.display="block";
					}else{
						this._labelNode.style.display="none";
					}
					if(false === this.readOnlyValue){
						
						this._componentNode.connect(this._componentNode, "onChange",dojo.hitch(this,this._execChange));
					}else{
						this._componentNode.set("readOnly", this.readOnlyValue);
					}
					this._componentNode.set("value", this.value=="1",false);
					delete this.value;
				},
				attachOnChangeEvent : function(controller, btId,fId,actionMode){
					if (this._fStarted == true) {
						this._componentNode._fStarted = true;
						delete this._fStarted;
					}
					this.isARoutineField=true;
					this.routineBtId = btId;
					this.routineFieldId = fId;
					this.routineActionMode = actionMode;
				},
				
				_setValueAttr: function(/*String|Boolean*/ newValue, /*Boolean*/ priorityChange){
					var value = this._processValue(newValue);
					if(this.value!=null){
						this.value = newValue;
					}
					var realValue = "1"==value;
					//this to ensure not onChange is called.
					this._componentNode.set('_lastValueReported',realValue, priorityChange);
					this._componentNode.set('checked',realValue,priorityChange);
				},
				_getValueAttr: function(){
					return (this._componentNode.checked ? "1" : "0");
				},
				
				destroy: function(){
					ec.fisa.widget.utils.destroyMultiregisterWidget(this);
					this.inherited(arguments);
				},
				
				_execChange:function(/*String|Boolean*/ newValue, /*Boolean*/ priorityChange){
					var notifyComboId = this["notify-combo-id"];
					if((notifyComboId != null && notifyComboId != undefined) || this.isARoutineField == true){
						var btId = this["bt-id"];
						var tabId = this["tabId"];
						var pageScopeId = this["pageScopeId"];

						var fieldId = this["field-id"];
						var ctrllr = ec.fisa.controller.utils.getPageController(tabId,pageScopeId);
						if(ctrllr != undefined && ctrllr != null){
						ctrllr.handleOnChangeComponent(fieldId,btId,this.routineActionMode,notifyComboId,this.isARoutineField,null,this.parentEditableGrid,this.entityMrId,this.gridRealRowIndex);
					}
					}
				},
				_processValue: function(value){
					if(typeof value == "string"){
						if(value != "1"){
							value = "0";
						}
					}else if(typeof value  == "boolean"){
						value = value ? "1":"0";
					}else{
						value = "0";
					}
					return value;
				},
				_setEnabledAttr:function(value){
					if(value != null){
						if(value){
							ec.fisa.widget.utils.enableWidget(this._componentNode);
						} else {
							ec.fisa.widget.utils.disableWidget(this._componentNode);
						}
					}
				},
				_getEnabledAttr:function(){
					return ec.fisa.widget.utils.isEnabled(this._componentNode);
				}
			});
	});

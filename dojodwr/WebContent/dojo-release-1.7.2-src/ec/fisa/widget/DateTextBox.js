define([
		"dijit/form/DateTextBox",
		"dojo/_base/declare",
		"dojo/date",
		"dojo/number",
		"dojo/_base/lang",
		"ec/fisa/format/Utils",
		"ec/fisa/widget/Utils",
		"dojo/date/locale",
		"dijit/_Widget",
		"dijit/_Templated",
		"dojo/text!ec/fisa/widget/templates/DateTextBox.html",
		"ec/fisa/controller/Utils",
		"./_base"],
	function(DateTextBox, declare, date, number, lang, formatUtils,widgetUtils,locale,_Widget, _Templated, template) {
	dojo.config.fisaDateExp=/[0-9\-]+/g;
	dojo.config.fisaDateTypeExp=/[dmyDMY]/g;
	dojo.config.fisaDateFullExp=/[0-9\-]+[dmyDMY]/g;

	return declare("ec.fisa.widget.DateTextBox", [ _Widget, _Templated ], {
		fisaFormat:0,
		fisaFormatPattern:dojo.config.fisaShortDatePattern,
		minDate:"",
		maxDate:"",
		widgetsInTemplate : true,
		readOnly:false,
		_readOnlyExp:"",
		_destroyOnRemove: true,
		templateString : template,
		_componentNode:null,
		dateTextboxBaseClass:"",
		inputInvalidLabel:"",
		widgetVisualConfig:dojo.fromJson(dojo.cache("skin","Widget.conf")).DateTextBox,
		visualSize:-1,
		parentEditableGrid:false,
		entityMrId:null,
		gridRealRowIndex:null,
		tabIndexField:null,
		_tabIndex:0,
		fieldId:null,
		gridId:null,
		_destroyOnRemove: true,
		postMixInProperties:function(){
			this.inherited(arguments);
			if(this.readOnly===true){
				this._readOnlyExp="disabled='disabled'";
			}
			this.dateTextboxBaseClass=this.baseClass;
			this.baseClass="";
			if(this.tabIndexField != null){
				this._tabIndex = this.tabIndexField;
			}
		},
		
		destroy: function(){
			ec.fisa.widget.utils.destroyMultiregisterWidget(this);
			this.inherited(arguments);
		},
		
		buildRendering: function(){ // change value string to Date object
			this.inherited(arguments);
			if(!this._componentNode.constraints){
				this._componentNode.constraints={};
			}
			this._componentNode.constraints.datePattern=this.fisaFormatPattern;
			this._componentNode.constraints.selector="date";
			if(this.minDate&&this.minDate!=""){
				this._componentNode.constraints.min=this.minDate;
			}
			if(this.maxDate&&this.maxDate!=""){
				this._componentNode.constraints.max=this.maxDate;
			}
			//this._componentNode._setBlurValue=this._setBlurValue;
			this._componentNode._refreshState=this._refreshState;
			this._componentNode._fisaAddDate=this._fisaAddDate;
			this._componentNode._resetComponentErrorStatus=this._resetComponentErrorStatus;


			var fisaTabId = this["fisa-tab-id"];
			var fisaPageScopeId = this["fisa-page-scope-id"];
			this._componentNode.btId = this["bt-id"];
			this._componentNode.notifyComboId = this["notify-combo-id"];
			this._componentNode.fieldId = this["field-id"];
			this._componentNode.fisaTabId = fisaTabId;
			this._componentNode.fisaPageScopeId = fisaPageScopeId;
			this._componentNode.validator = this.validator;
			this._componentNode._validatorInterno= this._validatorInterno;
			this._componentNode._internalOnChange=this._internalOnChange;
			this._componentNode._routineEvent = this._routineEvent;
			this._componentNode.handleErrorMsg = this.handleErrorMsg;
			this._componentNode.inputInvalidLabel = this.inputInvalidLabel;
			this._componentNode._notificationEvent = this._notificationEvent;
			this._componentNode.isARoutineField=false;
			this._componentNode.hasError = false;
			this._componentNode.parentEditableGrid = this.parentEditableGrid;
			this._componentNode.gridRealRowIndex = this.gridRealRowIndex;
			
			this._componentNode.entityMrId = this.entityMrId;
			
			
			var visualSizeAttr = null;
			if(this.visualSize>=0){
				visualSizeAttr = this.visualSize;
			}
			else{
				visualSizeAttr = this.widgetVisualConfig[dojo.config.fisaTheme].defaultVisualSize;
			}
			// se agrega esta linea porque se esta montando el icono de seleccion
			visualSizeAttr++;
			
			var fw =(this.widgetVisualConfig[dojo.config.fisaTheme].textCharWidth*visualSizeAttr);
			fw +=this.widgetVisualConfig[dojo.config.fisaTheme].padding;
			//fix to avoid spaces in multiregisters
			if(this.parentEditableGrid == true && this.tdParentWidth != null){
				if(fw < this.tdParentWidth){
					fw = this.tdParentWidth - 10;
				}
			}
			
			this._componentNode.domNode.style.width=fw+'px';
			

		},
		_setValueAttr: function(/*Date|String*/ value, /*Boolean?*/ priorityChange, /*String?*/ formattedValue){
			var _val=null;
			
			if(value!=null)//&&""!=value se comento esta extra validacion dado que al setear un valor con "" simplemente debe borrar el componente
				{
				//AVI en el caso de que se sete con un tipo Date directamente se envia ese valor al componente.
				if (typeof value != "string") {
					this._componentNode.set("value",value, priorityChange, formattedValue);
					return;
				}
				if (value != ""){
					_val = ec.fisa.format.utils.parseLongDate(value);
				}
				else{
					_val = null;
				}
			}else{
				var _curVal=this._componentNode.get("value");
				if(_curVal==null){
					return;
				}
				this._componentNode.value=null;
			
				if(this._componentNode.onChange&&lang.isFunction(this._componentNode.onChange)){
					this._componentNode.onChange();
				}
				return;
			}
			this._componentNode.setByCode = true;
			this._componentNode.set("value",_val, priorityChange, formattedValue);
		},
		_getValueAttr:function(){
			var _val=this._componentNode.get("value");
			if(_val!=null){
				_val=ec.fisa.format.utils.formatLongDate(_val);
			}
			return _val;
		},
		//we added this refreshstate cause it wasnt calling the onchange.
		_refreshState: function(){
			this.inherited(arguments);
		},
		_fisaAddDate:function(textVal){
			var _time=new String(textVal);
			_time=_time.replace(dojo.config.fisaDateTypeExp,"");
			var _type=new String(textVal);
			_type=_type.toLowerCase();
			_type=_type.replace(dojo.config.fisaDateExp,"");
			var type="day";
			if(_type=="m"){
				type ="month";
			} else if(_type=="y"){
				type="year";
			}
			return date.add(new Date(),type,number.parse(_time));
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
		},

		//override
		displayMessage:function(message){
			//do nothing
		},

		hasErrorCmp:function(){
			return this._componentNode.hasError;
		},
		
		attachOnChangeEvent : function(controller, btId,fId,actionMode){
			this._componentNode.isARoutineField=true;
			this._componentNode.routineBtId = btId;
			this._componentNode.routineFieldId = fId;
			this._componentNode.routineActionMode = actionMode;
		},
		
		//called when onchange occurs.
		_internalOnChange:function(){
			if((this.notifyComboId != null && this.notifyComboId != undefined) || this.isARoutineField == true){
				var ctrllr = ec.fisa.controller.utils.getPageController(this.fisaTabId,this.fisaPageScopeId);
				if(ctrllr != undefined && ctrllr != null){
				ctrllr.handleOnChangeComponent(this.fieldId,this.btId,this.routineActionMode,this.notifyComboId,this.isARoutineField,null,this.parentEditableGrid,this.entityMrId,this.gridRealRowIndex);
			}
			}
		},

		/*override function from ValidationtextBox*/
		validator:function(value, constraints){
			var result =	this._validatorInterno(value, constraints);
			this.hasError = !result;
			//then its called at onchange value.
			if(this.focused === false && result == true && this.tobeChanged == true){
				if(this.setByCode != true || this.setByCode == undefined){
				this._internalOnChange();
				}
				
			}
			//after the first interaccion 
			this.setByCode = false;
			return result=true;
		},


		_validatorInterno:function(value, constraints){
			//fix to avoid be called every keypress.
			this.tobeChanged = true;
			if(this.focused === true){
				return true;
			}
			else{
				var btController=ec.fisa.controller.utils
				.getPageController(this.fisaTabId,
						this.fisaPageScopeId);

				
				var valueDate = null;
				
				if(value==null || value==''){
					this._resetComponentErrorStatus();
					if(this._oldValue === value){
						this.tobeChanged = false;
					}
					this._oldValue = value;
					return true;
				}
				
				
				if(btController.messagesPanelId != undefined && btController.messagesPanelId != null){
					var messagesPanel = dijit.byId(btController.messagesPanelId);
					messagesPanel.clearAllMessages();
				}

				
				//verify value is a valid date,
				if (typeof value == "string") {
					if(value.search(dojo.config.fisaDateFullExp)==0){
						valueDate = this._fisaAddDate(value);
						 this._lastValueReported = valueDate;
						this._setValueAttr(valueDate);
						this.tobeChanged = false;
						return true;
					}else{
						valueDate =locale.parse(value,{datePattern:this.constraints.datePattern,selector:this.constraints.selector,locale:dojo.config.fisaCurrentLocale});
					}
				}
				var validationResult = this._isInvalidDate(valueDate);
				if(validationResult == true){
					this.handleErrorMsg();
					return false;
				}
					

				if(this._oldValue === value){
					this.tobeChanged = false;
					return true;
				}

				this._oldValue = value;

				//only validate if value is not coming from the calendar dropdown.
				if(this.dropDown  && this.dropDown.value != null 
				){
					//console.log("if came from dropdown dont validate");

					if(!date.compare(this.dropDown.value, valueDate, this._selector)){
						return true;
					}
					this.dropDown.destroyRecursive();
					delete this.dropDown;

				}
			}
			return true;
		},


		handleErrorMsg:function(){
			var message = {summary:this.inputInvalidLabel +" "+ this.displayedValue,detail:"",level:{level:40000}};
			var cntrlr =ec.fisa.controller.utils.getPageController(this.fisaTabId,this.fisaPageScopeId);
			 	cntrlr.updateMsgsPanel([message]);
			
			 	if(cntrlr instanceof ec.fisa.controller.custom.BtController){
			 this.getParent().set("value","",false);	
			 	}
			
		},
		
		_resetComponentErrorStatus:function(){
			this.hasError=false;
		}


	});
});

define([
		"dijit/_Widget",
		"dijit/_Templated",
		"dijit/form/DateTextBox",
		"dojo/_base/declare",
		"ec/fisa/format/Utils",
		"ec/fisa/widget/Utils",
		"ec/fisa/widget/EnhancedCalendar",
		"dojo/date/locale",
		"dojo/_base/lang",
		"dijit/_HasDropDown",
		"dojo/date",
		"dojo/number",
		"dojo/text!ec/fisa/widget/templates/EnhancedDateTextBox.html",
		"./_base",
		"./DateTextBox" ],
		function(_Widget, _Templated, declare, formatUtils, widgetUtils, EnhancedCalendar, locale,lang,
				  hasDropDown,date,number,widgetConfigTxt,template) {

			return declare(
					"ec.fisa.widget.EnhancedDateTextBox",
					[ _Widget, _Templated ],
					{
						minDate : "",
						maxDate : "",
						_destroyOnRemove: true,
						_oldValue:null,
						/* Dates to disable calendar. ejm: festive days. */
						datesToDisable : [],
						visualSize:-1,
						tabIndexField:null,
						_tabIndex:0,
						/*
						 * Days of the week to be disabled in the calendar. 0
						 * sunday, 1 monday 2 tuesday 3 wednesday 4 thursday 5
						 * friday 6 saturday
						 */
						daysOfWeekDisable : [],
						fisaFormat:1,
						fisaFormatPattern:dojo.config.fisaShortDatePattern,
						valueInitialCalendar : null,
						inputInvalidLabel:"",
						gridId:null,
						widgetVisualConfig:dojo.fromJson(dojo.cache("skin","Widget.conf")).DateTextBox,
						skipValidation:false,
						widgetsInTemplate : true,
						templateString : template, 
						_componentNode:null,
						dateTextboxBaseClass:"",
						parentEditableGrid:false,
						gridRealRowIndex:null,
						entityMrId:null,
						fieldId:null,
						//to disable input from user at the textbox.s
						startup:function(){
							this.inherited(arguments);
						},
						postMixInProperties : function() { // change value
							this.inherited(arguments);
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
							if (!this._componentNode.constraints) {
								this._componentNode.constraints = {};
							}
							//delete min max functionality to use the enhanced funcionality.
							delete this._componentNode.constraints.min;
							delete this._componentNode.constraints.max;

							if(!this._componentNode.constraints.datePattern){
								this._componentNode.constraints.datePattern = this.fisaFormatPattern;
							}
							if(!this._componentNode.constraints.selector){
								this._componentNode.constraints.selector = "date";
							}

							if (this.minDate && this.minDate != "") {
								this._componentNode.constraints.minDate = this.minDate;
							}
							if (this.maxDate && this.maxDate != "") {
								this._componentNode.constraints.maxDate = this.maxDate;
							}
							if (this.datesToDisable) {
								this._componentNode.constraints.datesToDisable = this.datesToDisable;
							}
							if (this.daysOfWeekDisable) {
								this._componentNode.constraints.daysOfWeekDisable = this.daysOfWeekDisable;
							}

							var fisaTabId = this["fisa-tab-id"];
							var fisaPageScopeId = this["fisa-page-scope-id"];

							var btId = this["bt-id"];
							var fieldId = this["field-id"];

							this._componentNode.fisaTabId = fisaTabId;
							this._componentNode.fisaPageScopeId = fisaPageScopeId;
							this._componentNode.btId = btId;
							this._componentNode.fieldId = fieldId;
							this._componentNode.notifyComboId = this["notify-combo-id"];

							this._componentNode.btController = ec.fisa.controller.utils
							.getPageController(fisaTabId,
									fisaPageScopeId);

							this._componentNode.popupClass=EnhancedCalendar;
							this._componentNode._oldValue=this._oldValue;
							this._componentNode.valueInitialCalendar=this.valueInitialCalendar;
							this._componentNode.inputInvalidLabel=this.inputInvalidLabel;
							this._componentNode.skipValidation=this.skipValidation;

							this._componentNode.validator=this.validator;
							this._componentNode._validatorInterno=this._validatorInterno;
							this._componentNode._routineEvent = this._routineEvent;
							this._componentNode._internalOnChange=this._internalOnChange;
							this._componentNode._notificationEvent = this._notificationEvent;

							this._componentNode._fisaAddDate=this._fisaAddDate;
							this._componentNode._handleValidatorAction=this._handleValidatorAction;
							this._componentNode.handleErrorMsg=this.handleErrorMsg;
							this._componentNode.openDropDown=this.openDropDown;
							this._componentNode._handleDropDownAction=this._handleDropDownAction;
							this._componentNode._resetComponentErrorStatus=this._resetComponentErrorStatus;
							this._componentNode.isARoutineField=false;
							this._componentNode.parentEditableGrid = this.parentEditableGrid;
							this._componentNode.entityMrId = this.entityMrId;
							this._componentNode.gridRealRowIndex = this.gridRealRowIndex;


							var visualSizeAttr = null;
							if(this.visualSize>=0){
								visualSizeAttr = this.visualSize;
							}
							else{
								visualSizeAttr = this.widgetVisualConfig[dojo.config.fisaTheme].defaultVisualSize;
							}
							var fw =this.widgetVisualConfig[dojo.config.fisaTheme].textCharWidth*visualSizeAttr;
							fw +=this.widgetVisualConfig[dojo.config.fisaTheme].padding;
							//fix to avoid spaces in multiregisters
							if(this.parentEditableGrid == true && this.tdParentWidth != null){
								if(fw < this.tdParentWidth){
									fw = this.tdParentWidth - 10;
								}
							}
							this._componentNode.domNode.style.width=fw+'px';
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

						attachOnChangeEvent : function(controller, btId,fId,actionMode){
							this._componentNode.isARoutineField=true;
							this._componentNode.routineBtId = btId;
							this._componentNode.routineFieldId = fId;
							this._componentNode.routineActionMode = actionMode;
						},

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
								this.setByCode = false;
							}
							return result;
						},

						/*override function from ValidationtextBox*/
						_validatorInterno:function(value, constraints){
//							fix to avoid be called every keypress.
							this.tobeChanged = true;
							if(this.focused === true){
								return true;
							}
							//skip once.
							if(this.skipValidation == true){
								this.skipValidation = false;
								return true;
							}

							if(this.btController.messagesPanelId != undefined && this.btController.messagesPanelId != null){
								var messagesPanel = dijit.byId(this.btController.messagesPanelId);
								messagesPanel.clearAllMessages();
							}

							var valueDate = null;

							if(value==null || value==''){
								this._resetComponentErrorStatus();
								if(this._oldValue === value){
									this.tobeChanged = false;
								}
								this._oldValue = value;
								return true;
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
									valueDate =locale.parse(value,{datePattern:this.constraints.datePattern,selector:this.constraints.selector,locale:"en"});
								}
							}
							if(this._isInvalidDate(valueDate) == true){
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
							var btId = this.btId;
							var fieldId = this.fieldId;
							var fisaTabId = this.fisaTabId;
							var fisaPageScopeId = this.fisaPageScopeId;


							var callObj = {
									callbackScope : this
							};
							callObj.errorHandler =dojo.hitch(this.btController,this.btController.errorHandler);
							callObj.callback = this._handleValidatorAction;
							var fm = this.btController.model
							.toPlainObject();
							EventActionDWR
							.verifyDateFieldTextProperty(fisaTabId,
									fisaPageScopeId, btId, fieldId,valueDate, fm,
									callObj);
							this.tobeChanged = false;
							return true;
						},


						handleErrorMsg:function(){
							var message = {summary:this.inputInvalidLabel +" "+ this.displayedValue,detail:"",level:{level:40000}};
							this.btController.updateMsgsPanel([message]);
							this.skipValidation = true;
							this._oldValue = "";
							this.set("value",null);
						},

						/**
						 * handle results from validator action.
						 * */
						_handleValidatorAction:function(outcome){
							var result = true;
							if(outcome != null && outcome.calIsValidValue != null){
								result =	outcome.calIsValidValue;
								if(result === false){
									this.handleErrorMsg();
								}
								else{
									if(this.setByCode != true || this.setByCode == undefined){
										this._internalOnChange();
									}
									this.setByCode = false;
								}
							}
							else if(outcome.wAxn == "enhanceDateNoProperty"){
								if(this.setByCode != true || this.setByCode == undefined){
									this._internalOnChange();
								}
								this.setByCode = false;
							}
							return result;
						},


						/** override from _DateTimeTextBox.js */
						openDropDown : function(/* Function */callback) {

							this.disabled = true;
							// rebuild drop down every time, so that constraints
							// get copied (#6002)
							if (this.dropDown) {
								this.dropDown.destroy();
							}

							var btId = this.btId;
							var fieldId = this.fieldId;
							var fisaTabId = this.fisaTabId;
							var fisaPageScopeId = this.fisaPageScopeId;

							var callObj = {
									callbackScope : this
							};
							callObj.errorHandler = dojo.hitch(this.btController,this.btController.errorHandler);
							callObj.callback = this._handleDropDownAction;
							var fm = this.btController.model
							.toPlainObject();
							EventActionDWR
							.verifyDateFieldProperty(fisaTabId,
									fisaPageScopeId, btId, fieldId, fm,
									callObj);

						},
						_setValueAttr: function(/*Date|String*/ value, /*Boolean?*/ priorityChange, /*String?*/ formattedValue){
							var _val=null;
							if (value != null)// &&""!=value se comento esta
								// extra validacion dado que al
								// setear un valor con ""
								// simplemente debe borrar el
								// componente
							{
								// AVI en el caso de que se sete con un tipo
								// Date directamente se envia ese valor al
								// componente.
								if (typeof value != "string") {
									this._componentNode.set("value", value,
											priorityChange, formattedValue);
									return;
								}
								if (value != "") {
									_val = ec.fisa.format.utils
									.parseLongDate(value);
								} else {
									_val = null;
								}
							}
							else{
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
						/**
						 * Check if this date textbox has a parametrizacion at
						 * the current ftm by looking in his id.
						 */
						_handleDropDownAction : function(outcome) {

							this.constraints.minDate = null;
							this.constraints.maxDate = null;
							this.constraints.datesToDisable = null;
							this.constraints.daysOfWeekDisable = null;

							if (outcome.wAxn == "enhanceDatePropertyEvaluate") {
								var calendarVo = outcome.enhancedCalVal;
								this.constraints.minDate = calendarVo.minDate;
								this.constraints.maxDate = calendarVo.maxDate;
								this.constraints.datesToDisable = dojo.fromJson(calendarVo.datesToDisable);
								this.constraints.daysOfWeekDisable =calendarVo.daysOfWeekDisable.split(",");

							}

							var PopupProto = lang.isString(this.popupClass) ? lang
									.getObject(this.popupClass, false)
									: this.popupClass, textBox = this, value = this
									.get("value");

									if (this.constraints.minDate) {
										this.valueInitialCalendar = ec.fisa.format.utils
										.parseLongDate(this.constraints.minDate
												.concat(" 00:00:00.0"));
									} else {
										this.valueInitialCalendar = this.dropDownDefaultValue;
									}

									this.dropDown = new PopupProto(
											{
												onChange : function(value) {
													// this will cause InlineEditBox and
													// other handlers to do stuff so
													// make sure it's last
													textBox.set('value', value, true);
												},
												id : this.id + "_popup",
												dir : textBox.dir,
												lang : textBox.lang,
												value : value,
												currentFocus : !this
												._isInvalidDate(value) ? value
														: this.valueInitialCalendar,
														constraints : textBox.constraints,
														filterString : textBox.filterString, // for
														// TimeTextBox,
														// to
														// filter
														// times
														// shown

														datePackage : textBox.datePackage,
														constraints : textBox.constraints
											});

									// avoid direct parent openDropDown method and apply
									// the hasdropdown inherited method
									// by calling with prototype.
									hasDropDown.prototype.openDropDown.apply(this,
											arguments);
									this.disabled = false;
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
						_resetComponentErrorStatus:function(){
							this.hasError=false;
						}
					});
		});


define(
		[ "dijit/form/DateTextBox", "dojo/_base/declare",
		  "ec/fisa/format/Utils", "ec/fisa/widget/Utils", "dijit/Calendar","dojo/date/locale",
		  "dojo/_base/lang", "dijit/_HasDropDown","dojo/date", "dojo/number", "./_base" ],
		  function(DateTextBox, declare, formatUtils, widgetUtils, Calendar, locale,lang,
				  hasDropDown,date,number) {

			return declare(
					"ec.fisa.widget.EnhancedSchedulingDateTextBox",
					[ DateTextBox ],
					{
						popupClass : Calendar,
						_destroyOnRemove: true,
						minDate : "",
						maxDate : "",
						_oldValue:null,
						openOnClick : false,

						valueInitialCalendar : null,
						inputInvalidLabel:"",
						
						skipValidation:true,
						
						btController:null,
						
						decWldcrd:null,
						typeWldcrd:null,
						fullWldcrd:null,

						//to disable input from user at the textbox.s
						startup:function(){
							this.inherited(arguments);
						},

						postMixInProperties : function() { // change value

							this.decWldcrd=/[0-9\-]+/g;
							this.typeWldcrd=/[dmyDMY]/g;
							this.fullWldcrd=/[0-9\-]+[dmyDMY]/g;
							
							if (!this.constraints) {
								this.constraints = {};
							}
							//delete min max functionality to use the enhanced funcionality.
							delete this.constraints.max;

							// string to Date
							// object
							this.inherited(arguments);


							if(!this.constraints.datePattern){
								this.constraints.datePattern = "dd/MM/yyyy";
							}
							if(!this.constraints.selector){
								this.constraints.selector = "date";
							}

							var fisaTabId = this["fisa-tab-id"];
							var fisaPageScopeId = this["fisa-page-scope-id"];

							this.btController = ec.fisa.controller.utils
							.getPageController(fisaTabId,
									fisaPageScopeId);

							if (this.minDate && this.minDate != "") {
								this.constraints.minDate = this.minDate;
							}else{
								if(this.btController.processDate){
								var minDateTemp =	dojo.date.locale.format(this.btController.processDate, {datePattern: "yyyy-MM-dd", selector: "date"});
								this.constraints.minDate = minDateTemp;	
								}
							}
							this.constraints.min= this.constraints.minDate;
							
							if (this.maxDate && this.maxDate != "") {
								this.constraints.maxDate = this.maxDate;
							}
						},
						
						
						_fisaAddDate:function(textVal){
							var _time=new String(textVal);
							_time=_time.replace(this.typeWldcrd,"");
							var _type=new String(textVal);
							_type=_type.toLowerCase();
							_type=_type.replace(this.decWldcrd,"");
							var type="day";
							if(_type=="m"){
								type ="month";
							} else if(_type=="y"){
								type="year";
							}
							return date.add(new Date(),type,number.parse(_time));
						},


						/*override function from ValidationtextBox*/
						validator:function(value, constraints){
//							fix to avoid be called every keypress.
							if(this.focused === true){
								return true;
							}

							//skip once.
							if(this.skipValidation == true){
								this.skipValidation = false;
								return true;
							}
							
							if(value == ""){
								return true;
							}
							
							
							if(this.btController.messagesPanelId != undefined && this.btController.messagesPanelId != null){
							var messagesPanel = dijit.byId(this.btController.messagesPanelId);
							messagesPanel.clearAllMessages();
							}
							var valueDate = null;
							//verify value is a valid date,
							if (typeof value == "string") {
								if(value.search(this.fullWldcrd)==0){
									valueDate = this._fisaAddDate(value);
									this._setValueAttr(valueDate);
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
								return true;
							}
							
							if(this.constraints.minDate != undefined && this.constraints.minDate != null){
							var minDate = locale.parse(this.constraints.minDate,{datePattern:"yyyy-MM-dd",selector:this.constraints.selector,locale:"en"})
							//date if min disable
							if(date.compare(valueDate, minDate, "date") === -1){
								this.handleErrorMsg();
								return false;
							}
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
							
							return true;
						},

						
						
						validate: function(/*Boolean*/ isFocused){
							// summary:
							//		Called by oninit, onblur, and onkeypress.
							// description:
							//		Show missing or invalid messages if appropriate, and highlight textbox field.
							// tags:
							//		protected
							var message = "";
							var isValid = this.disabled || this.isValid(isFocused);
							if(isValid){ this._maskValidSubsetError = true; }
							var isEmpty = this._isEmpty(this.textbox.value);
							var isValidSubset = !isValid && isFocused && this._isValidSubset();
							this._set("state", isValid ? "" : (((((!this._hasBeenBlurred || isFocused) && isEmpty) || isValidSubset) && this._maskValidSubsetError) ? "Incomplete" : "Error"));
							this.focusNode.setAttribute("aria-invalid", isValid ? "false" : "true");

//							if(this.state == "Error"){
//								this._maskValidSubsetError = isFocused && isValidSubset; // we want the error to show up after a blur and refocus
//								message = this.getErrorMessage(isFocused);
//							}else if(this.state == "Incomplete"){
//								message = this.getPromptMessage(isFocused); // show the prompt whenever the value is not yet complete
//								this._maskValidSubsetError = !this._hasBeenBlurred || isFocused; // no Incomplete warnings while focused
//							}else if(isEmpty){
//								message = this.getPromptMessage(isFocused); // show the prompt whenever there's no error and no text
//							}
//							this.set("message", message);

							return isValid;
						},
						
						handleErrorMsg:function(){
								var message = {summary:this.inputInvalidLabel +" "+ this.displayedValue,detail:"",level:{level:40000}};
								var fisaTabId = this["fisa-tab-id"];
								var fisaPageScopeId = this["fisa-page-scope-id"];
								var ctrl = ec.fisa.controller.utils.getPageController(fisaTabId, fisaPageScopeId+'_resourceIn');
								if(ctrl.messagesPanelId != undefined && ctrl.messagesPanelId != null){
									var messagesPanel = dijit.byId(btController.messagesPanelId);
									messagesPanel.clearAllMessages();
								}
								ctrl.updateMsgsPanel([message]);
								this.skipValidation = true;
								this._oldValue = "";
								this.set("value","");
						},

						/** override from _DateTimeTextBox.js */
						openDropDown : function(/* Function */callback) {

							this.disabled = true;
							// rebuild drop down every time, so that constraints
							// get copied (#6002)
							if (this.dropDown) {
								this.dropDown.destroy();
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
												currentFocus : !this._isInvalidDate(value) ? value: this.valueInitialCalendar,
														constraints : textBox.constraints,
														filterString : textBox.filterString, // for
														// TimeTextBox,
														// to
														// filter
														// times
														// shown

														datePackage : textBox.datePackage,
														isDisabledDate: function(/*Date*/ date){
															// summary:
															// 	disables dates outside of the min/max of the _DateTimeTextBox
															return !textBox.rangeCheck(date, textBox.constraints);
														}
											});

									// avoid direct parent openDropDown method and apply
									// the hasdropdown inherited method
									// by calling with prototype.
									hasDropDown.prototype.openDropDown.apply(this,
											arguments);
									this.disabled = false;
							
							
							
							

						},

						_setValueAttr : function(/* Date|String */value, /* Boolean? */ priorityChange, /* String? */formattedValue) {
							var inValue;
							if (typeof value == "string") {
								value = ec.fisa.format.utils.parseLongDate(value);
							} 

							if(value != null && value !== undefined && value != ''){
								inValue =locale.format(value,{datePattern:this.constraints.datePattern,selector:this.constraints.selector,locale:"en"});
							}
							
							//Compara si son diferentes las fechas antes de continuar
							if(inValue == this._oldValue){
								priorityChange = false;
							}
							
							//Se setea el viejo valor con el nuevo, 
							//esto es debido a que no se actualizaba este valor 
							//y si no se perdia el foco continuaba calculado.
							if(this._isInvalidDate(inValue) == true){
								this._oldValue = inValue;
							}
							
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


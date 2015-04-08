define( [ "dijit/_Widget",
          "dijit/_Templated",
          "dojo/_base/declare",
          "dojo/_base/kernel",
          "dijit/form/Select",
          "dojo/_base/lang",
          "dojo/text!./templates/Select.html",
          "dojo/topic",
          "dojo/_base/array",
          "ec/fisa/controller/Utils",
          "ec/fisa/widget/Utils",
          "./_base" ],
		function(_Widget, _Templated, declare, dojo, Select, lang, template, topic,array) {

			return declare("ec.fisa.widget.Select", [ _Widget, _Templated ], {
				readOnlyValue:false,
				tabId:'',
				pageScopeId:'',
				hasFieldRoutineOrPolicy:false,
				actionModeReq:'QY',				
				parentGridId:null,
				gridId:"",
				qtId:"",
				fieldId:"",
				valueColumn:0,
				labelColum:1,
				textBoxConfig:dojo.fromJson(dojo.cache("skin","Widget.conf")).Select,
				visualSize:0,
				ioParametters:null,
				publishId:"",
				templateString : template,
				isARoutineField:false,
				maxHeight:-1,
				parentEditableGrid:false,
				entityMrId:null,
				tabIndexField:null,
				_tabIndex:0,
				gridRealRowIndex:null,
				tdParentWidth:null,
				CCYDependentFields:null,  // campos a ser formateados una vez que se lance el evento onchange.
				hasBeneficiarySelectionLink:null,//Campo que indica si el componente tiene asociado un link de selección de Beneficiario. Si es true, las opciones del combo se recargaran cada vez que se retorne de la qt de selección de beneficiarios.  JCVQ
				_destroyOnRemove: true,
				postMixInProperties:function(){
					this.inherited(arguments);
					var cntrlr = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
					if(this.parentGridId==null){
						this.value=cntrlr.obtainInitialValue(this);
					}
					this.options=cntrlr.loadSelectData(this,true);
					
					if(typeof this.ioParametters  == 'string'){
						//ioParameters es un string al momento de crear el componente
						//Para poder usarlo se lo evalua y se convierte en un array de objetos
						this.ioParametters = eval(this.ioParametters); 
					}
					
				},
				startup:function(){
					this.inherited(arguments);
					//var cntrlr = null;
					//if(this.parentGridId==null||this.hasFieldRoutineOrPolicy==true){
					var	cntrlr = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
					//}
					//add to a object the id.
					var selectMap =	cntrlr.selectIdMap;
					if(selectMap != null && selectMap != undefined){
						var fieldId = this["field-id"];
						
						if(this.parentEditableGrid == true && this.gridRealRowIndex != undefined && this.gridRealRowIndex != null){
							fieldId = fieldId + "|"+ this.gridRealRowIndex;
						}
						selectMap[fieldId] = this.id;
					}
					
					if(this.parentGridId==null){
						cntrlr.addParamToModel(this);
					}
					if(this.hasFieldRoutineOrPolicy==true){
						cntrlr.addFieldRoutineEvent( this , this.actionModeReq);
						this._fStarted=true;
					}
					if(this.readOnlyValue===true){
						this._componentNode.set("disabled", this.readOnlyValue);
					}
					//para setear el formato de los campos dependientes. En caso de que el valor del componente sea diferente de null o ""
					if(this.CCYDependentFields!=null){
						var v = this.get('value');
						if(v!=null && v!=""){
							cntrlr.formatCCYRelatedField(this["bt-id"] ,this, false);
						}
					}
					var toConnect=this._componentNode;
					toConnect.connect(toConnect,"onChange",dojo.hitch(this,this._execChange));
					
					

					if(this.parentEditableGrid === true){
						//obtain the parent td cell width. 
						var width=	this.tdParentWidth; //this.domNode.parentNode.parentNode.style.width;
						if(width != null){
						var finalWidth = width - this.textBoxConfig[dojo.config.fisaTheme].selectorWidth;//30 value from watching the best looking scenario respecting the td.
							//cause in ie only understand 
							//	dojo.style(this._componentNode.containerNode, "width",this.finalWidth + "px");
							finalWidth +=this.textBoxConfig[dojo.config.fisaTheme].padding;
							dojo.style(this._componentNode.containerNode, "width", finalWidth + "px");
							}
						
					} else if(this.visualSize>0){
						//AVI - Mantis 17905 - se valida si el width es positivo, solo en esos casos se setea
						//la propiedad respectiva caso contrario no se toma en cuenta, con este mantis se detecto
						//que habia tamaños negativos.
						var width = (this.widthCompCalc-this.textBoxConfig[dojo.config.fisaTheme].selectorWidth);
						if(width > 0){
							width = (this.widthCompCalc-this.textBoxConfig[dojo.config.fisaTheme].selectorWidth);
							dojo.style(this._componentNode.containerNode, "width", width + "px");
						}
					}
//					if(cntrlr.attachOnChangeComboBoxEvent && lang.isFunction(cntrlr.attachOnChangeComboBoxEvent)){
//						cntrlr.attachOnChangeComboBoxEvent(this._componentNode);
//					}
//					Id de la subiscripcion de la BT/QT padre de este componente
//					this.publishId = "verifiyUpdate_" + this["bt-id"] + '_' + this.tabId + '_' + this.pageScopeId;
//					//Se subscribe a la QT padre para escuchar cualquier cambio en los combos
//					this.subscription = topic.subscribe(this.publishId, lang.hitch(this,this.verifyReloadOptionsNeeded));
//					if(this.CCYDependentFields!=null){
//						cntrlr.attachCCYFormatEvent(this._componentNode);
//					}
				},
				
				attachOnChangeEvent : function(controller, btId, fid, actionMode) {
					this.isARoutineField=true;
					this.routineBtId = btId;
					this.routineFieldId = fid;
					this.routineActionMode = actionMode;
				},
				
				_execChange:function(){
					var notifyComboId = this["notify-combo-id"];

						var btId = this["bt-id"];
						var tabId = this["tabId"];
						var pageScopeId = this["pageScopeId"];

						var fieldId = this["field-id"];
						var ctrllr = ec.fisa.controller.utils.getPageController(tabId,pageScopeId);
						ctrllr.clearPanelMessage();
						if(ctrllr != undefined && ctrllr != null){
						ctrllr.handleOnChangeComponent(fieldId,btId,this.routineActionMode,notifyComboId,this.isARoutineField,ctrllr.getSelectedIndex(this),this.parentEditableGrid,this.entityMrId,this.gridRealRowIndex);
						}
				},
				
				buildRendering : function() {
					this.inherited(arguments);
					
					if(this.tabIndexField != null){
						this._tabIndex = this.tabIndexField;
					}
					
					var attrs = {'bt-id':this["bt-id"],'qt-id':this["qt-id"],'field-id':this["field-id"],'tabId':this["tabId"],'pageScopeId':this["pageScopeId"],'options':this.options,'ioParametters':this.ioParametters,'tabIndex': this._tabIndex};
					if(this.value!=null){
						attrs.value=this.value;
					}
						if(this.visualSize>0){
							var width_comp =(this.textBoxConfig[dojo.config.fisaTheme].textCharWidth*this.visualSize)+5;
							this.widthCompCalc = width_comp;
							attrs.style={'width':width_comp+'px'};
						}	
					attrs.maxHeight = this.maxHeight;
					this._componentNode = new Select(attrs,this._componentNode);
					this._componentNode.findOutputParameters=this.findOutputParameters;
					this._componentNode.findComplemenParams=this.findComplemenParams;
					this._componentNode.findParametersbByType=this.findParametersbByType;
					this._componentNode._loadChildren =  this._loadChildren;
				},
				
				
				destroy:function(){
					if(this.subscription && this.subscription.remove && lang.isFunction(this.subscription.remove)){
						this.subscription.remove();
					}
					ec.fisa.widget.utils.destroyMultiregisterWidget(this);
					this.inherited(arguments);
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
				verifyReloadOptionsNeeded:function(){
					var changedComponent = arguments[0];
					var rowData = arguments[1];
					
					var myInParams = this.findInputParameters();
					if(this.verifyMyInParamChange(myInParams, changedComponent)){
						this._componentNode.set("value", null);
						this._componentNode.removeOption(this._componentNode.options);
						var cntrlr = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
						cntrlr.fetchSelectOptions(this.id, this["qt-id"], myInParams,this["bt-id"]);
					}
				},
				doForceReloadOptions:function(){//Obliga a recargar las opciones del combo. Usada en selección de Beneficiarios.
					var myInParams = this.findInputParameters();
					this._componentNode.removeOption(this._componentNode.options);
					var cntrlr = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
					cntrlr.reloadSelectOptions(this.id, this["qt-id"], myInParams,this["bt-id"],this["field-id"], this.tabId, this.pageScopeId);
				},
				findParametersbByType: function(typeParameter){
					var outcome = [];
					dojo.forEach(this.ioParametters, function(ioParam, index, ioParameters){
						if(ioParam.typeParameter == typeParameter){
							outcome.push(ioParam);
						}
					}, this);
					return outcome;
				},
				findInputParameters:function(){
					return this.findParametersbByType("0");
				},
				findOutputParameters:function(){
					return this.findParametersbByType("1");
				},
				findComplemenParams:function(){
					return this.findParametersbByType("2");
				},
				verifyMyInParamChange:function(myInParams, changedComponent){
					var outcome = false;
					dojo.forEach(myInParams, function(inParam, index, inParameters){
						if(changedComponent["field-id"] == inParam.parameterFieldId){
							inParam.value = changedComponent.get("value");
							outcome = true;
						}
					}, this);
					return outcome;
				},
				_setValueAttr:function(value, /* Boolean? */priorityChange, /* String? */
						formattedValue){
					//JG: agregado para solucionar incidente mantis 17042
					if(value==null){
						value="";
					}
					// fin solución mantis 17042
					//Hw: added for select to always pass the value as String. cause 
					//the value 0 was discarded.
					this._componentNode.set("value",value+"",priorityChange,formattedValue);
					/*if(typeof priorityChange==="boolean"&& (!priorityChange)){
						this._componentNode._pendingOnChange=false;
						this._componentNode._lastValueReported=value;
					}*/
				},
				_getValueAttr:function(){
					return this._componentNode.get("value");
				},
				
				
				getOptions: function(/*anything*/ valueOrIdx){
					return this._componentNode.getOptions(valueOrIdx);
				},

				addOption: function(/*dijit.form.__SelectOption|dijit.form.__SelectOption[]*/ option){
					this._componentNode.addOption(option);
				},

				removeOption: function(/*String|dijit.form.__SelectOption|Number|Array*/ valueOrIdx){
					//fix cause this _loadingStore was causing at removing to set any value, then call onchange.
					if(valueOrIdx !=undefined && valueOrIdx.length>0){
						var cloneOptions=	lang.clone(valueOrIdx);
						
						if(cloneOptions[0].value == ""){
							cloneOptions.splice("0","1");
						}
						
						this._componentNode.removeOption(cloneOptions);
					}
				},

				updateOption: function(/*dijit.form.__SelectOption|dijit.form.__SelectOption[]*/ newOption){
					this._componentNode.updateOption(newOption);
				},
				
				_setOptionsAttr:function(){
					this._componentNode.set("options",arguments[0]);
				},
				
				_loadChildren: function(/*Boolean*/ loadMenuItems){
					// summary:
					// Resets the menu and the length attribute of the button - and
					// ensures that the label is appropriately set.
					// loadMenuItems: Boolean
					// actually loads the child menu items - we only do this when we are
					// populating for showing the dropdown.
					if(loadMenuItems === true){
						// this.inherited destroys this.dropDown's child widgets (MenuItems).
						// Avoid this.dropDown (Menu widget) having a pointer to a destroyed widget (which will cause
						// issues later in _setSelected). (see #10296)
						if(this.dropDown){
							delete this.dropDown.focusedChild;
						}
						if(this.options.length){
							this.inherited(arguments);
						}else{
							// Drop down menu is blank but add one blank entry just so something appears on the screen
							// to let users know that they are no choices (mimicing native select behavior)
							array.forEach(this._getChildren(), function(child){ child.destroyRecursive(); });
							var item = new MenuItem({label: "&#160;"});
							this.dropDown.addChild(item);
						}
					}else{
						this._updateSelection();
					}
					this._isLoaded = false;
					this._childrenLoaded = true;
					if(!this._loadingStore){
						// Don't call this if we are loading - since we will handle it later
						this._lastValueReported = this.value;
						this._setValueAttr(this.value);
					}
				},
				
				setControlValue:function(value){
					this._componentNode._lastValueReported = "";
					this._componentNode.set("value",value,true);
				}
				
			});

		});

define( [ "dijit/_Widget", "dijit/_Templated","dojo/text!./templates/TextBox.html", "dojo/_base/declare",
          "dojo/number","dojo/on","./_MvcMixin","dojox/mobile/TextBox",
          "ec/fisa/desktop/widget/OutputText","./_base" ],
		function(_Widget, _Templated,template, declare, number, on, MvcMixin) {

			return declare("ec.fisa.mobile.widget.TextBox", [ _Widget, _Templated, MvcMixin ], {
				fisatabid:"",
				fisapageid:"",
				btId:"",
				fieldId:"",
				readOnly : false,
				ftype:'bt',
				_type : "text",
				format : 0,
				uppercase:false,
				maskall : false,
				password: false,
				maxLength: "",
				trim: true,
				numeric:false,
				style:"",
				hasCompl:true,
				hasFieldRoutineOrPolicy:false,
				actionModeReq:"",
				placeHolder: "",
				widgetsInTemplate : true,
				readOnlyValue : false,
				maxLength : -1,
				onChangeAttached:false,/*indica si un evento fue atachado*/
				textTransform: "",
				_complementNode : null,
				_componentNode : null,
				_separatorNode : null,
				templateString : template,
				parentEditableGrid:false,
				gridRealRowIndex:null,
				entityMrId:null,
				numericFormat: dojo.config.fisaNumericPattern,
				tasasFormat: dojo.config.interestRateFormat, 
				porcentajeFormat: dojo.config.percentageFormat,
				startup:function(){
					this.inherited(arguments);
					this.addParamToModel();
					
					var _addnode=null;
					if (this.format == 4) {
						this._componentNode.set("constraints", { pattern : this.numericFormat});
						_addnode=this._componentNode;
					}else if (this.format == 5) {
						this._componentNode.set("constraints", { pattern : this.tasasFormat});
						_addnode=this._componentNode;
					}else if (this.format == 6) {
						this._componentNode.set("constraints", { pattern : 	this.porcentajeFormat});
						_addnode=this._componentNode;
					}else if(this.numeric){
						this._componentNode.textbox.style.textAlign="right";
					}
					
					if(_addnode!=null){
						_addnode.btId = this.btId || this["bt-id"];				
						_addnode.fieldId = this.fieldId || this["field-id"];
					}
					
					if(this.maskall || this.password){
						this._type = "password";
					}
					
					if(this.textTransform=="1"){
						this._componentNode.textbox.style.textTransform = "uppercase";
					}
					else if(this.textTransform=='2'){
						this._componentNode.textbox.style.textTransform = "lowercase";
					}
					else if(this.textTransform=='3'){
						this._componentNode.textbox.style.textTransform = "capitalize";
					}
//					
//					if(this.uppercase){
//						this._componentNode.textbox.style.textTransform="uppercase";
//					}
				},
				
				buildRendering: function(){
					this.inherited(arguments);
					var cntrlr = ec.fisa.controller.utils.getPageController(this.fisatabid,this.fisapageid);
					if(this.ftype==="QT" || this.ftype==="BT"){
						this._separatorNode.style.display="none";
						this._complementNode.style.display="none";
					}
					//para la ejecucion de rutinas
					if(this.hasFieldRoutineOrPolicy==true){
						cntrlr.addFieldRoutineEvent( this , this.actionModeReq);
						this._fStarted=true;
					}
					if(this.readOnlyValue===true){
						this._componentNode.set("disabled", this.readOnlyValue);
					}
//					else{
//						 var toConnect=this._componentNode;
//							toConnect.connect(toConnect, "onChange", dojo.hitch(this,this._execChange));
//							this.onChangeAttached = true;
//					}
					
				},
				
				_getValueAttr : function() {
					return this._componentNode.get("value");
				},
				_setValueAttr : function(value, /* Boolean? */priorityChange, /* String? */
						formattedValue) {
					this._componentNode.set("value", value);
				},
				_getComplementAttr : function() {
					return this._complementNode.get("value");
				},
				_setComplementAttr : function(value, /* Boolean? */priorityChange, /* String? */
						formattedValue) {
					this._complementNode.set("value", value);
				},
				attachOnChangeEvent : function(controller, btId,fid,actionMode){
					this.isARoutineField=true;
					this.routineBtId = btId;
					this.routineFieldId = fid;
					this.routineActionMode = actionMode;
					
					if(this.onChangeAttached == false){
						 var toConnect=this._componentNode;
						toConnect.connect(toConnect, "onChange", dojo.hitch(this,this._execChange));
						this.onChangeAttached = true;
					}
				},
				/*called after the component wrapped was changed.*/
				_execChange:function(){
					var fieldId = this["field-id"];
					var ctrllr = ec.fisa.controller.utils.getPageController(this.fisatabid,this.fisapageid);
					//var isValidValue = ctrllr.applyValidator(this); TODO: verificar si debe ejecutar validacion JS
					if(/*isValidValue == */true){
						var notifyComboId = this["notify-combo-id"];
						if((notifyComboId != null && notifyComboId != undefined) || this.isARoutineField == true){
							var btId = this["bt-id"];
							if(ctrllr != undefined && ctrllr != null){
								ctrllr.handleOnChangeComponent(fieldId,btId,this.routineActionMode,notifyComboId,this.isARoutineField,null,this.parentEditableGrid,this.entityMrId,this.gridRealRowIndex);
							}
						}
					}
				}
			});
		});

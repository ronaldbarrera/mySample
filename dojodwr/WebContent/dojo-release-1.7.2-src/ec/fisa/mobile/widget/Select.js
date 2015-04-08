define( [ "dijit/_WidgetBase", 
          "dijit/_Templated",
          "dojo/text!./templates/Select.html",
          "dojo/on",
          "dojo/dom-construct",
          "./_MvcMixin", 
          "dojo/_base/declare",
          "dojo/window",
          "dijit/_TemplatedMixin",
          "dijit/_WidgetsInTemplateMixin",
          "dijit/_base/manager","dojox/mobile",		
          "dojox/mobile/compat",
          "dojox/mobile/parser",
          "dojox/mobile/TextBox",
          "./_base"],
		function(_Widget, _Templated,template,on,domConstruct,MvcMixin, declare, Window,_TemplatedMixin,_WidgetsInTemplateMixin) {

			return declare("ec.fisa.mobile.widget.Select", [ _Widget, _Templated, MvcMixin], {
				_select:null,
				ftype:"bt",
				_options:[],
				widgetsInTemplate : true,
				classStyle:"",
				ioParametters:null,
				valueColumn:-1,
				labelColum:-1,
				initOptions: "",
				templateString : template,
				hasFieldRoutineOrPolicy:false,
				actionModeReq:'QY',
				readOnlyValue:false,
				placeHolder:'',
				/**campos enviados en combos dependientes***/
				isARoutineField:false,
				routineActionMode:null,
				parentEditableGrid:false,
				entityMrId:null,
				gridRealRowIndex:null,
				/******/
				
				postMixInProperties:function(){
					this.inherited(arguments);
					var cntrlr = ec.fisa.controller.utils.getPageController(this.fisatabid,this.fisapageid);
					if(cntrlr != null){
						if(this.parentGridId==null){
							this.value=cntrlr.obtainInitialValue(this);
						}
						this.options=cntrlr.loadSelectData(this,true);
					}
					
					if(typeof this.ioParametters  == 'string'){
						//ioParameters es un string al momento de crear el componente
						//Para poder usarlo se lo evalua y se convierte en un array de objetos
						this.ioParametters = eval(this.ioParametters); 
					}
					//para la ejecucion de rutinas
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
					this._setOptionsAttr();
					
				},
				startup:function(){
					this.addParamToModel();
				},
				buildRendering:function(){
					this.inherited(arguments);
					this.on("change",dojo.hitch(this,this._execChange));
					initOptions=null;
				},
				
				attachOnChangeEvent : function(controller, btId, fid, actionMode) {
					this.isARoutineField=true;
					this.routineBtId = btId;
					this.routineFieldId = fid;
					this.routineActionMode = actionMode;
				},
				
				_setOptionsAttr : function(options) {
					this.options=options||this.options;
//					this._select.innerHTML="";
					if(this.options){
						dojo.forEach(this.options,function(opt,index){
							this.initOptions += "<option value='"+opt.value+"'";							
							if(this.value==opt.value){
								this.initOptions += "selected='true'";
							}
							this.initOptions += index==0?">"+this.placeHolder+"</option>":">"+opt.label+"</option>"
							
//							var opt1 = domConstruct.create("option",{'value':opt.value},this._select);
//							opt1.text=opt.label;
						},this);
					}
				},
				
				_getValueAttr : function() {
					return this._select.value;
				},
				
				_setValueAttr : function(value, /* Boolean? */priorityChange, /* String? */
						formattedValue) {
					this._select.value=value;
				},
				
				_execChange : function(){
					var notifyComboId = this["notify-combo-id"];
					var btId = this["bt-id"];
					var tabId = this.fisatabid;
					var pageScopeId = this.fisapageid;
					var fieldId = this["field-id"];
					var ctrllr = ec.fisa.controller.utils.getPageController(this.fisatabid,this.fisapageid);
					ctrllr.clearPanelMessage();
					if(ctrllr != undefined && ctrllr != null){
					ctrllr.handleOnChangeComponent(fieldId,btId,this.routineActionMode,notifyComboId,this.isARoutineField,this._select.selectedIndex-1,this.parentEditableGrid,this.entityMrId,this.gridRealRowIndex);
					}
				}
				
			});
		});

define([
	"dijit/_WidgetBase", "dijit/_Templated", "dojo/_base/declare","dojo/window",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!ec/fisa/mobile/widget/templates/DatePicker.html",
	"dojox/mobile/SimpleDialog",
	"./_MvcMixin",
	"dojox/mobile/Opener",
	"dojox/mobile/Heading","dojox/mobile/ToolBarButton","dojox/mobile/SpinWheelDatePicker",
	"dojox/mobile/ValuePickerDatePicker",
	"dijit/_base/manager","dojox/mobile",
	"ec/fisa/format/Utils",
	"dojox/mobile/compat",
	"dojox/mobile/parser","dojox/mobile/TextBox","./_base"],
		function(_Widget, _Templated, declare, Window,_TemplatedMixin,_WidgetsInTemplateMixin,template, SimpleDialog,MvcMixin) {
			return declare("ec.fisa.mobile.widget.DatePicker", [ _Widget, _Templated , _TemplatedMixin, _WidgetsInTemplateMixin,MvcMixin], {
				fisaFormat:1,
				ftype:"",
				label : '',
				lblDone:'Aceptar',
				lblCancel:'Cancelar',
				lblInput:'',
				_BtnDone:null,
				_BtnCancel:null,
				_cal : null,
				_calPicker:null,
				_value:null,
				_inputDate:null,
				_dialog:null,
				placeHolder:"",
				widgetsInTemplate : true,
				classStyle:"",
				headingButtonStyleClass:"mblColorBlue",
				headingButtonStyle1:"position:absolute;width:45px;left:0;",
				headingButtonStyle2:"position:absolute;width:45px;right:0;",
				templateString : template,
				
				postMixInProperties: function(){
					this.inherited(arguments);
					if(this.ftype == "QT"){
						this.fisaFormat = 1;
					}
				},
				startup: function(){
					this.inherited(arguments);
					this.addParamToModel();
				},
				showDialog: function(){
					this._dialog.show();
				},
				
				accept: function(init){			
					var date = this._cal.get("value");
					var formatDate = ec.fisa.format.utils.getStrDateByFormatIdStrDate(this._cal.get("value")+" 00:00:00.0",this.fisaFormat);
					dijit.byId(this.id+"_date3").set("value",formatDate);
					if(!init){
						this.cancel();
					}						
				},
				
				cancel:function(){
					this._dialog.hide();
				},
								
				_getDate2:function(node, v){
					if(v === true){ // Done clicked
						var date;
						try {
							date =  this._cal.value;
						} catch (e) {

							return;
						}
						this._inputDate.set("value",date);
					}
				},
				
				_setDate2:function(node){

					var v = this._inputDate.get("value").split(/-/);
					if(v.length == 3){
						 this._cal.value = v;						
					}
				},
				
				_getValueAttr : function() {
					var _val=this._inputDate.get("value");
					var res = _val.split("/");
					var result = res[2]+"-"+res[1]+"-"+res[0]+" 00:00:00.0";
					return result;
				},
				_setValueAttr : function(value, /* Boolean? */priorityChange, /* String? */
					formattedValue) {
					var vale = ec.fisa.format.utils.getStrDateByFormatIdStrDate(value,this.fisaFormat);
					this._inputDate.set("value",vale);																
				},
				
				_getRefAttr : function() {
					return this._inputDate.get("ref");
				},
				_setRefAttr : function(value) {
					this._inputDate.set("ref", value);
				},
				_getBindingAttr : function(value) {
					return this._inputDate.get("binding");
				},
				_setBindingAttr : function() {
					this._inputDate.set("binding", value);
				}
				
			});
		});

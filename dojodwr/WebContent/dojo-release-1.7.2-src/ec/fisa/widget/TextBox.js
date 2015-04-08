define( [ "dijit/_Widget", "dijit/_Templated", "dojo/_base/declare",
          "dojo/number", "dojo/on", "dojo/keys", "dijit/form/TextBox",
          "ec/fisa/widget/NumberTextBox", "ec/fisa/widget/Utils","dojo/text!./templates/TextBox.html",
          "dojo/topic","dojo/dom-attr",
          "ec/fisa/widget/OutputText","ec/fisa/controller/Utils", "./_base","ec/fisa/dwr/proxy/EventActionDWR" ], 
          function(_Widget, _Templated,
        		  declare, number, on, keys, TextBox, NumberTextBox, widgetUtils,template, topic, domAttr) {

	return declare("ec.fisa.widget.TextBox", [ _Widget, _Templated ], {
		readOnlyValue : false,
		_readOnlyExp : "",
		maxLength : -1,
		_maxLengthExp : "",
		_dojoProps : "trim:true",
		numeric : false,
		title : "",
		style : "",
		format : 0,
		textboxBaseClass : 'dijitTextBox',
		complementBaseClass : 'fisaOutputTextComplement',
		showComplement:true,
		hasCompl : true,
		widgetsInTemplate : true,
		gridSelectedRowIndex:null,
		_complementNode : null,
		_componentNode : null,
		_cmpType : "",
		maskall : false,
		password: false,
		textTransform: "",
		parentEditableGrid:false,
		gridId:"",
		_type : "text",
		_numeric:false,
		tabId:"",
		pageScopeId:"",
		btId:"",
		fieldId:"",
		visualSize:-1,
		isARoutineField:false,
		tabIndexField:null,
		_tabIndex:0,
		gridRealRowIndex:null,
		
		tdParentWidth:null,
		textBoxConfig:dojo.fromJson(dojo.cache("skin","Widget.conf")).TextBox,
		//indicates the event onchange is attached
		onChangeAttached:false,
		templateString : template,
		tasasFormat: dojo.config.interestRateFormat, 
		porcentajeFormat: dojo.config.percentageFormat,
		numericFormat: dojo.config.fisaNumericPattern,
		currencyFormat:dojo.config.fisaDefaultCurrency,
		inputConstraint:'',
		javaScriptValidator:'',
		additionalInfo:'',
		_destroyOnRemove: true,
		//Mantis 17612
		customMsgParent:false,
		postMixInProperties : function() {
			this.inherited(arguments);
			if (this.format == 4 || this.format == 5 || this.format == 6) {
				this.textboxBaseClass = this.textboxBaseClass + " dijitNumberTextBox";
				this._baseClassExp="textboxBaseClass='"+this.textboxBaseClass+"'";
				this._cmpType = "ec.fisa.widget.NumberTextBox";
				this._numeric=true;
			} else {
				this._baseClassExp="baseClass='"+this.textboxBaseClass+"'";
				this._cmpType = "dijit.form.TextBox";
			}
		
			if(this.maxLength>=0){
				this._maxLengthExp="maxLength='"+this.maxLength+"'";
			}
			if(this.maskall || this.password){
				this._type = "password";
			}
			if(this.textTransform=="1"){
				this._dojoProps+=", uppercase:true ";
			}else if (this.textTransform=="2"){
				this._dojoProps+=", lowercase:true ";	
			}else if (this.textTransform=="3"){
				this._dojoProps+=", propercase:true ";
			}else{
				this._dojoProps="";
			}
			
			if(this.tabIndexField != null){
				this._tabIndex = this.tabIndexField;
			}
		},
		buildRendering : function() {
			this.inherited(arguments);
			
			this._componentNode.btId = this.btId || this["bt-id"];				
			this._componentNode.fieldId = this.fieldId || this["field-id"];
			
			var _addnode=null;
			if (this.format == 4) {
				this._componentNode._componentNode.set("constraints", { pattern : this.numericFormat });
				_addnode=this._componentNode._componentNode;
			}else if (this.format == 5) {
				this._componentNode._componentNode.set("constraints", { pattern : this.tasasFormat	});
				_addnode=this._componentNode._componentNode;
			}else if (this.format == 6) {
				this._componentNode._componentNode.set("constraints", { pattern : 	this.porcentajeFormat });
				_addnode=this._componentNode._componentNode;
			}else if (this.numeric) {
				this._componentNode.textbox.style.textAlign = "right";
				widgetUtils.setAcceptOnlyNumeric(this._componentNode,true);
			}
			if(_addnode!=null){
				_addnode.btId = this.btId || this["bt-id"];				
				_addnode.fieldId = this.fieldId || this["field-id"];
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
			var visualSizeAttr = null;
			
			if(this.visualSize>=0){
				visualSizeAttr = this.visualSize;
			}
			else{
				visualSizeAttr = this.textBoxConfig[dojo.config.fisaTheme].defaultVisualSize;
			}
			var fw =this.textBoxConfig[dojo.config.fisaTheme].textCharWidth*visualSizeAttr;
			fw +=this.textBoxConfig[dojo.config.fisaTheme].padding;
			var _node=this.getComponentNode();
			//fix to avoid spaces in multiregisters
			if(this.parentEditableGrid == true && this.tdParentWidth != null){
				if(fw < this.tdParentWidth){
					fw = this.tdParentWidth - 10;
				}
			}
			_node.domNode.style.width=fw+'px';
			if(this.inputConstraint!=null && this.inputConstraint!=""){
				widgetUtils.inputConstraint(this._componentNode,this.inputConstraint);
			}
			
			if(this.parentEditableGrid)
			{
				this._complementNode.domNode.parentNode.style.display= "none";
			}
			this._complementNode._componentNode.style.display="none";
//			if(!this.showComplement){
//				
//			}
		},
		startup: function(){
			this.inherited(arguments);
			if(this.readOnlyValue===true){
				//this._readOnlyExp="disabled='disabled'";
				var _node=this.getComponentNode();
				_node.set("disabled", this.readOnlyValue);
			}//Se llevo este codigo a la funcion attachOnChangeEvent debido a que no se sabe si realmente tiene que ejecutar rutina solo en este momento y en algun momento un campo read puede ser habilitado y lanzar rutina 
			 else{// se habilita dado que eliminaba la fncionalidad de los combos si se deshabilita.
				 var toConnect=this.getComponentNode();
					toConnect.connect(toConnect, "onChange", dojo.hitch(this,this._execChange));
					this.onChangeAttached = true;
			}
			
		},
		destroy: function() {
			ec.fisa.widget.utils.destroyMultiregisterWidget(this);
			this.inherited(arguments);
		},
		_getRefAttr : function() {
			return this._componentNode.get("ref");
		},
		_setRefAttr : function(value) {
			this._componentNode.set("ref", value);
		},
		_getRefCmplAttr : function() {
			return this._complementNode.get("ref");
		},
		_setRefCmplAttr : function(value) {
			this._complementNode.set("ref", value);
		},
		_getBindingAttr : function() {
			return this._componentNode.get("binding");
		},
		_setBindingAttr : function(value) {
			this._componentNode.set("binding", value);
		},
		_getValueAttr : function() {
			var value =  this._componentNode.get('value');
			//console.debug('TextBox._getValueAttr ' + this.id);
			if(this.format==1 || this.format==2 || this.format==3){
				value = this.getStrDatebyFormatId(value,this.format);
			}
			return value;
		},
		_setValueAttr : function(value, /* Boolean? */priorityChange, /* String? */
				formattedValue) {
			//console.debug('TextBox._setValueAttr '+ this.id);
			if(this.format==1 || this.format==2 || this.format==3){
				value = this.formatDatebyFormatId(value,this.format);
			}
			//this to ensure not onChange is called.
			this._componentNode.set('value',value, priorityChange, formattedValue);
			if(typeof priorityChange==="boolean"&& (!priorityChange)&&(!this.numeric)){
				this._componentNode._pendingOnChange=false;
				this._componentNode._lastValueReported=value;
			}
		},
		_getComplementAttr : function() {
			return this._complementNode.get("value");
		},
		_setComplementAttr : function(value, /* Boolean? */priorityChange, /* String? */
				formattedValue) {
			if(this.showComplement){
				this._complementNode._componentNode.style.display="block";
				this._complementNode.set("value", value);
			}
		},
		attachOnChangeEvent : function(controller, btId, fid, actionMode) {
			if (this._fStarted == true) {
				this._componentNode._fStarted = true;
				delete this._fStarted;
			}
			this.isARoutineField=true;
			this.routineBtId = btId;
			this.routineFieldId = fid;
			this.routineActionMode = actionMode;
			
			if(this.onChangeAttached == false){
			 var toConnect=this.getComponentNode();
				toConnect.connect(toConnect, "onChange", dojo.hitch(this,this._execChange));
				this.onChangeAttached = true;
			}
			
			
		},
		getComponentNode:function(){
			var toConnect=this._componentNode;
			if (this.format == 4 || this.format == 5 || this.format == 6) {
				toConnect=toConnect._componentNode;
			}
			return toConnect;
		},
		//called after the component wrapped was changed.
		_execChange:function(){
			var pageScopeId = this["pageScopeId"];
			var fieldId = this["field-id"];
			var tabId = this["tabId"];
			var ctrllr = ec.fisa.controller.utils.getPageController(tabId,pageScopeId);
			
			var isValidValue = ctrllr.applyValidator(this);
			
			if(isValidValue == true){
				var notifyComboId = this["notify-combo-id"];
				if((notifyComboId != null && notifyComboId != undefined) || this.isARoutineField == true){

					var btId = this["bt-id"];
					
					if(ctrllr != undefined && ctrllr != null){
						ctrllr.handleOnChangeComponent(fieldId,btId,this.routineActionMode,notifyComboId,this.isARoutineField,null,this.parentEditableGrid,this.entityMrId,this.gridRealRowIndex);
					}
				}
			}
		},

		_setEnabledAttr:function(value){
			if(value != null){
				if (this._numeric) {
					this._componentNode.set("enabled", value);
				} else if (value) {
					ec.fisa.widget.utils.enableWidget(this._componentNode);
				} else {
					ec.fisa.widget.utils.disableWidget(this._componentNode);
				}
			}
		},
		_getEnabledAttr:function(){
			if(this._numeric){
				return this._componentNode.get("enabled");
			}
			return ec.fisa.widget.utils.isEnabled(this._componentNode);
		},
		formatDatebyFormatId: function(value, formatId){
			return ec.fisa.format.utils.formatDateByFormatId(value,formatId);
		},
		getStrDatebyFormatId: function(value, formatId){
			return ec.fisa.format.utils.getStrDatebyFormatId(value,formatId);
		},
		getParentMsgComponent:function(){
			if(this.customMsgParent){
				return this.domNode.parentNode.parentNode.parentNode.parentNode.parentNode;
			}
			return this.domNode.parentNode;
		},
		getBeneficiaryNode:function(){
			if(this.customMsgParent){
				var id;
				//AVI - Mantis 17612 - se obtiene los nodos que forman parte de beneficiario
				var childNodes = this.domNode.parentNode.parentNode.children[1].childNodes;
				if(childNodes !== undefined) {
					//AVI - Mantis 17612 Se realiza un for ya que existia nodos del tipo TextNode, y el que se necesitaba era el tipo BTLink
					//Se asume que solo existe un nodo mas, si al textBox se asocio mas nodos a parte del beneficiario cambiar aqui
					//Para obtener los demas y cambiar al que invoca a este compontente
					dojox.lang.functional.forIn(childNodes,dojo.hitch(this,function(node){
						if(node != undefined && node != null && node.id != undefined && node.id != null && node.id != ''){
							id = node.id;
						}
					}));
				} 
				return dijit.byId(id);
			}
			return this.domNode;
		}

	});
});

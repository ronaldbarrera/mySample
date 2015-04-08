define( [ "dijit/_Widget", "dijit/_Templated", "dojo/_base/declare",
          "dojo/number", "dojo/on", "dojo/keys", "dijit/form/TextBox",
          "ec/fisa/widget/NumberTextBox", "ec/fisa/widget/Utils","dojo/text!ec/fisa/widget/templates/TextArea.html",
          "dojo/text!ec/fisa/widget/TextArea.conf",
          "dojo/_base/sniff",
          "dojo/dom-style",
          "ec/fisa/widget/OutputText","ec/fisa/controller/Utils","dijit/form/SimpleTextarea", "./_base" ], function(_Widget, _Templated,
        		  declare, number, on, keys, TextBox, NumberTextBox, widgetUtils,template, textAreaConfigTxt,has, domStyle) {

	return declare("ec.fisa.widget.TextArea", [ _Widget, _Templated ], {
		readOnly : false,
		_readOnlyExp : "",
		title : "",
		style : "",
		textAreaBaseClass : "",
		textAreaConfig:dojo.fromJson(textAreaConfigTxt),
		widgetsInTemplate : true,
		_componentNode : null,
		actionMode:"",
		tabId:"",
		pageScopeId:"",
		maxLength:-1,
		visualSize:-1,
		cols:50,
		rows:5,
		styleExp:"",
		tabIndexField:null,
		_tabIndex:0,
		templateString : template,
		isARoutineField:false,
		routineActionMode:null,
		parentEditableGrid:false,
		inputConstraint:'',
		entityMrId:null,
		hasBeneficiarySelectionLink:false,//Especifica si el componente va a tener un link de selección de beneficiario asociado.
		javaScriptValidator:'',
		additionalInfo:'',
		_destroyOnRemove: true,
		gridId:null,
		fieldId:null,
		//Mantis 17612
		customMsgParent:false,
		_dojoProps : "trim:true",
		textTransform: "",//Mantis 20145 JCVQ
		postMixInProperties : function() {
			this.inherited(arguments);
			//this.textAreaBaseClass = 'dijitTextBox dijitTextArea';
			
			
			if(this.maxLength>=0){
				this._maxLengthExp="maxLength="+this.maxLength;
			}
			var vs=ec.fisa.widget.utils.parseTextAreaSize(this.visualSize);
			if(vs.cols!=null){
				this.cols=vs.cols;
			}
			if(vs.rows!=null){
				this.rows=vs.rows;
			}
			this.styleExp="style='";
			if(this.actionMode=='QY' || this.actionMode=='QH' || this.actionMode=='DE' || this.actionMode=='DH'  ){
				this.styleExp+="border-color:white;background:white;";
			}
			if(this.cols>0){
				this.styleExp+="width:";
				this.styleExp+=(this.textAreaConfig[dojo.config.fisaTheme].textCharWidth*this.cols)+this.textAreaConfig[dojo.config.fisaTheme].vOffset;
				this.styleExp+="px;";
			}
			if(this.rows>0){
				this.styleExp+="height:";
				this.styleExp+=(this.textAreaConfig[dojo.config.fisaTheme].textCharHeight*this.rows)+this.textAreaConfig[dojo.config.fisaTheme].hOffset;
				this.styleExp+="px;";
			}
			
			if(this.tabIndexField != null){
				this._tabIndex = this.tabIndexField;
			}
			//<<Mantis 20145 JCVQ
			if(this.textTransform=="1"){
				this._dojoProps+=", uppercase:true ";
				this.styleExp+="text-transform:uppercase;";
			}else if (this.textTransform=="2"){
				this._dojoProps+=", lowercase:true ";	
				this.styleExp+="text-transform:lowercase;";
			}else if (this.textTransform=="3"){
				this._dojoProps+=", propercase:true ";
				this.styleExp+="text-transform:capitalize;";
			}else{
				this._dojoProps="";
			}
			
			this.styleExp+="'";//Se cierra el apostrofe de styleExresion
			//<<Mantis 20145
		},
		buildRendering:function(){
			this.inherited(arguments);
			if(this.readOnly==true || this.actionMode=='QY' || this.actionMode=='QH' || this.actionMode=='DE' || this.actionMode=='DH'){
				this._componentNode.set("disabled", this.readOnly);
			}
			if(this.inputConstraint!=null && this.inputConstraint!=""){
				widgetUtils.inputConstraint(this._componentNode,this.inputConstraint);
			}
			if(has("ie")){
				widgetUtils.setAcceptByLength(this._componentNode,this.maxLength);
			}
		},
		startup: function(){
			this.inherited(arguments);
				var toConnect=this._componentNode;
				toConnect.connect(toConnect, "onChange", dojo.hitch(this,this._execChange));
				if(this.hasBeneficiarySelectionLink == true || this.hasBeneficiarySelectionLink == "true"){
					//Cuando el componente tiene asociado un link de selección, debe tener como estilo float;left. JCVQ Seleccion de beneficiarios
					domStyle.set(this.domNode,"float","left");
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

		_getValueAttr : function() {
			return this._componentNode.get('value');
		},
		_setValueAttr : function(value, /* Boolean? */priorityChange, /* String? */
				formattedValue) {
			//this to ensure not onChange is called.
			//this._componentNode.set('_lastValueReported',value, priorityChange, formattedValue);
			this._componentNode.set('value',value, priorityChange, formattedValue);
			if(typeof priorityChange==="boolean"&& (!priorityChange)){
				this._componentNode._pendingOnChange=false;
				this._componentNode._lastValueReported=value;
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
						ctrllr.handleOnChangeComponent(fieldId,btId,this.routineActionMode,notifyComboId,this.isARoutineField,null,this.parentEditableGrid,this.entityMrId);
					}
				}			
			}
		},
		
		
		_setEnabledAttr:function(value){
			if(value != null){
				if(value){
					ec.fisa.widget.utils.enableWidget(this._componentNode);
				}else{
					ec.fisa.widget.utils.disableWidget(this._componentNode);
				}
			}
		},
		_getEnabledAttr:function(){
			return	ec.fisa.widget.utils.isEnabled(this._componentNode);
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

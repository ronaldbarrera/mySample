define(["dojo/_base/kernel",
        "dojo/_base/declare",
        "dijit/_Widget",
        "dijit/_Templated",
        "dojo/text!./templates/template.html",
        "dijit/form/Button",
        "dijit/form/SimpleTextarea",
        "dojox/lang/functional/object",
        "dojo/dom-style",
        "dojo/dom-attr",
        "dojo/dom",
        "dojo/dom-construct",
        "dijit/dijit",
        "dojo/on",
        "dijit/focus",
        "ec/fisa/widget/Utils",
        "dojo/string",
        "./_base"], function(dojo, declare, _Widget, _Templated,template,dojoButton, simpleTextarea,fuctionalObject, domStyle, domAttr, dom, domConstruct, dijit,on, focusUtil,widgetUtils){
	var I18nTextarea = declare("ec.fisa.widget.i18n.I18nTextarea",[_Widget, _Templated], {
		supportedLanguages:[],
		defaultLanguage:"",/*Lenguaje por defecto, indica la traduccion que se mostrara por defecto*/
		supportedLanguagesNumber:0,/*Numero de lenguajes soportados por la plataforma*/
		tapdFieldLenght:0,/*Longitud del campo en la base de datos*/
		translationsDivs:null,/*Almacena los divs usados para la presentacion de las traducciones*/
		translationsTextareas:null,/*Almancena las cajas de texto de las traducciones soportadas por la plataforma*/
		isoCodes: null,
		translationMaxLength:0,/*Longitud maxima de cada uno de los elementos del campo multilenguaje*/
		requestedAction:"",
		collapsed:true,
		actualTranslations:0,/*Numero de traducciones que tiene el componente*/
		actualValue:"",
		isARoutineField:false,
		routineBtId:null,
		routineFieldId:null,
		routineActionMode:null,
		tabId:"",
		pageScopeId:"",
		styleClass:'i18nTextArea',
		widgetsInTemplate:true,
		parentEditableGrid:false,
		readOnly:false,
		_disabledExp:"",
		textTransform: "",
		_connections:null, 
		_fovt:null,
		cols:50,
		rows:5,
		visualSize:0,
		tabIndexField:null,
		_tabIndex:0,
		autho:false,
		oldValue:"",
		templateString: template,
		inputConstraint:'',
		entityMrId:null,
		_destroyOnRemove: true,
		gridId:"",//Mantis 20145 JCVQ
		gridSelectedRowIndex:null,//Mantis 20145
		constructor: function(supportedLanguages,translationsMap, defaultLanguage, tapdFieldLenght,requestedAction){
			try{
				this.supportedLanguages = supportedLanguages;
				this.translationsMap = translationsMap;
				this.defaultLanguage = defaultLanguage;
				this.tapdFieldLenght = tapdFieldLenght;
				this.requestedAction = requestedAction;
				this.translationsDivs = [];
				this.translationsTextareas = [];
				this.isoCodes = [];
				this._connections = [];
			}catch(e){
				this.logger(e);
			}
		},

		postMixInProperties : function() {
			var vs=ec.fisa.widget.utils.parseTextAreaSize(this.visualSize);
			if(vs.cols!=null){
				this.cols=vs.cols;
			}
			if(vs.rows!=null){
				this.rows=vs.rows;
			}
			if(this.readOnly===true){
				this._disabledExp="readonly='readonly'";
			}
		},
		buildRendering: function(){
			this.inherited(arguments);
			this._init();
			if(this.autho){
				domStyle.set(this._tcn,"border","1px solid #FF0000");
				this._ov = this.oldValue.split(String.fromCharCode(255));
			}
		},
		destroy: function(){
			delete this._fovt;
			delete this.translationsDivs;
			var translationsTextareas=this.translationsTextareas;
			delete this.translationsTextareas;
			dojo.forEach(translationsTextareas,function(translationTextareas){
				translationTextareas.destroy(false);
			},this);
			ec.fisa.widget.utils.destroyMultiregisterWidget(this);
			this.inherited(arguments);
		},
		logger: function(obj){
//			if(typeof console != "undefined"){
//				console.log(obj);
//			}
		},
		_createTranslationTextarea:function(isoCode, translation, contador){
			var translationNode = domConstruct.create("table",{id:this.id+ "_" + isoCode + "_translation",cellpadding:"0",cellspacing:"0",border:"0"}, this._tcn);
			var translationNodeBody = domConstruct.create("tbody",{id:this.id+ "_" + isoCode + "_translation"}, translationNode);
			var translationNodeRow = domConstruct.create("tr",{id:this.id+ "_" + isoCode + "_translation"}, translationNodeBody);
			var textAreaDiv = domConstruct.create("td",{}, translationNodeRow);
			var translationTagContainer =domConstruct.create("td",{}, translationNodeRow);
			//domAttr.set(translationTagContainer, "class", "i18nTextAreaTranslationTagContainerClass");
			var translationTagDiv = domConstruct.create("span",null, translationTagContainer);
			domAttr.set(translationTagDiv, "class","i18nTextBoxTranslationTagClassImg");

			var path = dojo.config.fisaContextPath+"/"+dojo.config.fisaImages+"/languages/"+isoCode+".png"
			//formatPattern -> url of the image came from componentfactory
			domConstruct.create("img",{src:path,alt:isoCode, title:isoCode, onerror:this.onerrorCall},translationTagDiv);

			if(this.tabIndexField != null){
				this._tabIndex = this.tabIndexField;
			}
			
			var textArea = new dijit.form.SimpleTextarea({style:{width:"auto"},value:translation,maxLength:this.translationMaxLength, cols:this.cols, rows:this.rows,tabIndex:this._tabIndex},isoCode);
			textArea.set("trim",true);
			if(this.textTransform=="1"){
				textArea.set("uppercase",true);
				textArea.textbox.style.textTransform = "uppercase";
			}else if (this.textTransform=="2"){
				textArea.set("lowercase",true);
			}else if (this.textTransform=="3"){
				textArea.set("propercase",true);
			}
			textArea.placeAt(textAreaDiv);
			if(this.inputConstraint!=null && this.inputConstraint!=""){
				widgetUtils.inputConstraint(textArea,this.inputConstraint);
			}
			if(this.autho&&this._ov!=null&&this._ov.length>contador&&this._ov[contador]!==translation){
				domConstruct.create("br",{},textAreaDiv);
				var oldValueSpan = domConstruct.create("span",{'style':{'color':'#FF0000'}},textAreaDiv);
				oldValueSpan.innerHTML=dojox.html.entities.encode(this._ov[contador]);
				if(contador==0){
					this._fovt=oldValueSpan;
					if(this.collapsed){
						domStyle.set(oldValueSpan,"display","none");
					}
				}
			}
			textArea.fwId = this.id;
			this._connectTextBoxEvents(textArea, contador);
			this.translationsDivs[contador] = translationNode;
			this.translationsTextareas[contador] = textArea;
			this.isoCodes[contador] = isoCode;

			return textArea;
		},
		_setTranslations:function(){
			var contador = 0;
			var langVals = null;
			if(this.actualValue!=null){
				langVals = this.actualValue.split(String.fromCharCode(255));
			}
			dojo.forEach(this.supportedLanguages, function(isoCode){
				if(langVals&&langVals[contador]){
					var langVal = langVals[contador];
					var ta=this._createTranslationTextarea(isoCode, langVal, contador++);
					if(langVal==null||""==langVal){
						ta._fStarted=true;
					}
					this.actualTranslations = contador;

				}
			}, this);
			if(contador==0){
				var ta=this._createTranslationTextarea(this.defaultLanguage, "", contador++);
				ta._fStarted=true;
				this.actualTranslations = contador;
			}
		},
		_init:function(){
			this.supportedLanguagesNumber = this.supportedLanguages.length;
			this.translationMaxLength = Math.floor(this.tapdFieldLenght/this.supportedLanguagesNumber);
		},
		_connectTextBoxEvents: function(textArea, contador){
			this._connections[contador]={kp:null,ch:null};
			if(dojo.isIE){
				this._connections[contador].kp = textArea.connect(textArea.textbox, 'onkeyup',dojo.hitch(this,this._execChange));
			}
			this._connections[contador].ch = textArea.connect(textArea, 'onChange',dojo.hitch(this,this._execChange));
		},
		/**Ejecuta el cambio.*/
		_execChange:function(){
			this._upLangValue();
			var notifyComboId = this["notify-combo-id"];
			if((notifyComboId != null && notifyComboId != undefined) || this.isARoutineField == true){

				var btId = this["bt-id"];
				var tabId = this["tabId"];
				var pageScopeId = this["pageScopeId"];

				var fieldId = this["field-id"];
				var ctrllr = ec.fisa.controller.utils.getPageController(tabId,pageScopeId);
				if(ctrllr != undefined && ctrllr != null){
				ctrllr.handleOnChangeComponent(fieldId,btId,this.routineActionMode,notifyComboId,this.isARoutineField,null,this.parentEditableGrid,this.entityMrId);
				}
			}
		},

		_showTranslation: function(event){
			try{
				/*Se encarga de mostrar una nueva traduccion siempre y
				 *  cuando se haya ingresado el valor de la traduccion por defecto.
				 *  La traduccion que se muestra secuencialmente*/
				var defaultTranslationValue = domAttr.get(this.translationsTextareas[0], "value");
				if(defaultTranslationValue != null &&
						dojo.string.trim(defaultTranslationValue).length >0 &&
						!this.collapsed &&
						this.actualTranslations < this.supportedLanguagesNumber){
					var translationDiv = this.translationsDivs[this.actualTranslations];
					if(translationDiv){//El div ya existe, hay que mostrarlo
					}else{//El div no existe, hay que craerlo
						var ta=this._createTranslationTextarea(this.supportedLanguages[this.actualTranslations], "", this.actualTranslations);
						ta._fStarted=true;
						//Se recupera el div creado en la invocacion de la linea anterior para hacerlo
						//visible ya que por defecto no se muestra en pantalla
						translationDiv = this.translationsDivs[this.actualTranslations];

					}

					this.actualTranslations++;
					ec.fisa.widget.utils.updateGridRowHeight(this.gridSelectedRowIndex, this.gridId);//Mantis 20145 JCVQ
				}else{
					this.logger("No se puede a\u006Eadir una traducci\u00F3n.");
					return false;
				}
			}catch(e){
				this.logger("Error a\u006Eadir una traducci\u00F3n.");
				this.logger(e);

			}
		},
		_removeTranslation:function(event){
			/*Solo se puede remover una traduccion siempre y cuando no sea el lenguaje por defecto, 
			 * En resumen solo se puede eliminar una tracuccion cuando hay mas de un elemento*/
			if(!this.collapsed && this.actualTranslations > 1){
				var translationDiv = this.translationsDivs[this.actualTranslations - 1];
				var translationTextarea = this.translationsTextareas[this.actualTranslations - 1];
				var cttb=this._connections[this.actualTranslations - 1];
				this._setNotVisible(translationDiv);
				dijit.byId(translationTextarea.id).set("value", "");
				this.translationsDivs.splice(this.actualTranslations - 1,1);
				this.isoCodes.splice(this.actualTranslations - 1,1);
				var textBoxConnections = this._connections.splice(this.actualTranslations - 1,1);
				dojo.forEach(textBoxConnections[0],function(connection,i){
					this.disconnect(connection[i].ch);
					if(connection[i].kp!=null){
						this.disconnect(connection[i].kp);
					}
				},this);
				this.actualTranslations--;
				this.translationsDivs.splice(this.actualTranslations,1);
				this.translationsTextareas.splice(this.actualTranslations,1);
				domConstruct.destroy(translationDiv);
				//cttb.remove();
				translationTextarea.destroy(false);
				this.actualValue="";
				for(var i=0;i<this.actualTranslations;i++) {
					if(i!=0){
						this.actualValue+=String.fromCharCode(255);
					}
					this.actualValue+=this.translationsTextareas[i].get("value");
				}
				ec.fisa.widget.utils.updateGridRowHeight(this.gridSelectedRowIndex, this.gridId);//Mantis 20145 JCVQ
				ec.fisa.widget.utils.programaticChange(focusUtil.curNode);
				/*this._upLangValue();
				this._routineEvent();*/
			}
		},
		_collapaseTranslations:function(){
			try{
				if(this._fovt!=null){
					this._setNotVisible(this._fovt);
				}
				for(i = 0; i < this.translationsDivs.length; i++){
					if(this.isoCodes[i] != this.defaultLanguage &&  this.translationsDivs.length>1){
						var translationDiv = this.translationsDivs[i];
						this._setNotVisible(translationDiv);
					}else{
						var translationTextarea = this.translationsTextareas[i];
						ec.fisa.widget.utils.disableWidget(translationTextarea.id);
					}
				}
				ec.fisa.widget.utils.updateGridRowHeight(this.gridSelectedRowIndex, this.gridId);//Mantis 20145 JCVQ
			}catch(e){
				this.logger(e);
			}
		},
		_expandTranslations:function(){
			/*
			 *Se encarga de desplegar todas las traducciones.
			 * 
			 */
			try{
				dojox.lang.functional.forIn(this.translationsTextareas, function(translationTextarea, isoCode){
					if(this.readOnly==true){
						ec.fisa.widget.utils.disableWidget(translationTextarea.id);
					} else {
						ec.fisa.widget.utils.enableWidget(translationTextarea.id);
					}
				}, this);
				if(this._fovt!=null){
					this._setVisible(this._fovt);
				}
				for(i = 0; i < this.actualTranslations; i++){
					this._setVisible(this.translationsDivs[i]);
				}
				ec.fisa.widget.utils.updateGridRowHeight(this.gridSelectedRowIndex, this.gridId);//Mantis 20145 JCVQ
			}catch(e){
				this.logger(e);
			}

		},
		_toggleCollapsed: function(){
			if(this.collapsed){
				domAttr.set(this.collapseLanguagesButton_node, "iconClass", "colapseLanguages");
				this._expandTranslations();

			}else{
				domAttr.set(this.collapseLanguagesButton_node, "iconClass", "expandLanguages");
				this._collapaseTranslations();

			}
			this.collapsed = !this.collapsed;
		},
		_upLangValue: function(newVal, comp){
			//var cmp = dijit.byId(this.fwId);
			var cmp = this;
			var langVals = cmp.actualValue.split(String.fromCharCode(255));;
			var _actualValue = "";
			dojo.forEach(cmp.isoCodes,function(item,i){
				var t = null;
				if(dojo.isIE){
					t=this.translationsTextareas[i].textbox.value;
				}else{
					t=this.translationsTextareas[i].get("value");
				}
				_actualValue += t;
				if(i < (this.actualTranslations - 1)){
					_actualValue += String.fromCharCode(255);
				}
			},cmp);
			cmp.actualValue=_actualValue;
			if(cmp.binding){
				cmp.binding.set("value",cmp.actualValue);
			}
		},
		_setVisible: function(component){
			domStyle.set(component,"display","block");
			//	domStyle.set(component,"float","left");
		},
		_setNotVisible: function(component){
			domStyle.set(component,"display","none");
		},
		_getValueAttr: function(){
			return this.actualValue;
		},
		_setValueAttr: function(value, /*Boolean?*/ priorityChange, /*String?*/ formattedValue){
			if(value === null || value === undefined){ value = ''; }
			else if(typeof value != "string"){ value = String(value); }
			this.actualValue=value;
			var langVals = this.actualValue.split(String.fromCharCode(255));
			var oldlangVals = this.oldValue.split(String.fromCharCode(255));
			if(langVals.length<oldlangVals.length){
				for(var i=oldlangVals.length-1;i>=langVals.length;i--){
					oldlangVals[i-1]=oldlangVals[i-1]+String.fromCharCode(255)+oldlangVals[i];
				}
				this._ov=oldlangVals.splice(0,langVals.length);
			}
			if(this.translationsTextareas.length<langVals.length) {
				var contador=this.translationsTextareas.length;
				for(;contador<=this.supportedLanguages.length;contador++){
					if(langVals&&langVals[contador]&&!(this.translationsTextareas[contador])){
						var langVal = langVals[contador];
						var ta=this._createTranslationTextarea(this.supportedLanguages[contador], langVal, contador);
						if(langVal==null||""==langVal){
							ta._fStarted=true;
						}
						this.actualTranslations = contador+1;
					}
				}
			}

			if(this.translationsTextareas.length==0){
				this._createTranslationTextarea(this.supportedLanguages[0], "", 0);
				this.actualTranslations=1;
			}

			if(this.translationsTextareas){
				dojo.forEach(this.translationsTextareas,function(currentTextArea,i){
					currentTextArea.set("value",langVals[i],priorityChange);
				},this);
				if('IN'!=this.requestedAction){
					this.collapsed=false;
				}else{
					this.collapsed=true;
				}
				this._toggleCollapsed();
			}
		},
		attachOnChangeEvent : function(controller, btId,fId,actionMode){
			this.isARoutineField=true;
			this.routineBtId = btId;
			this.routineFieldId = fId;
			this.routineActionMode = actionMode;
		}
	} );

	return I18nTextarea;

});

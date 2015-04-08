define(["dojo/_base/kernel",
    	"dojo/_base/declare",
    	"dijit/_Widget",
    	"dijit/_Templated",
    	"dojo/text!./templates/I18nOutputText.html",
    	"dijit/form/Button",
    	"dijit/form/TextBox",
    	"dojox/lang/functional/object",
    	"dojo/dom-style",
    	"dojo/dom-attr",
    	"dojo/dom",
    	"dojo/dom-construct",
    	"dijit/dijit",
    	"dojo/on",
    	"ec/fisa/widget/OutputText",
    	"./_base"], function(dojo, declare, _Widget, _Templated,template,dojoButton, dojoTextBox,fuctionalObject, domStyle, domAttr, dom, domConstruct, dijit,on){
	var I18nOutputText = declare("ec.fisa.widget.i18n.I18nOutputText",[_Widget, _Templated], {
		supportedLanguages:[],
		defaultLanguage:"",/*Lenguaje por defecto, indica la traduccion que se mostrara por defecto*/
		supportedLanguagesNumber:0,/*Numero de lenguajes soportados por la plataforma*/
		tapdFieldLenght:0,/*Longitud del campo en la base de datos*/
		translationsDivs:null,/*Almacena los divs usados para la presentacion de las traducciones*/
		translationsTextBoxes:null,/*Almancena las cajas de texto de las traducciones soportadas por la plataforma*/
		isoCodes: null,
		collapsed:false,
		actualTranslations:0,/*Numero de traducciones que tiene el componente*/
		actualValue:"",
		isARoutineField:false,
		routineController: null,
		routineBtId:null,
		routineFieldId:null,
		routineActionMode:null,
		tabId:"",
		pageScopeId:"",
		styleClass:'i18nOutputText',
		widgetsInTemplate:true,
		_fovt:null,
		autho:false,
		oldValue:"",
		templateString: template,
		constructor: function(supportedLanguages, defaultLanguage){
			try{
				this.supportedLanguages = supportedLanguages;
				this.defaultLanguage = defaultLanguage;
				this.translationsDivs = [];
				this.translationsTextBoxes = [];
				this.isoCodes = [];
			}catch(e){
				this.logger(e);
			}
		},
		buildRendering: function(){
			this.inherited(arguments);
			if(this.autho){
				domStyle.set(this._tcn,"border","1px solid #FF0000");
				this._ov = this.oldValue.split(String.fromCharCode(255));
			}
		},
		destroy: function(){
			delete this._fovt;
			delete this.translationsDivs;
			var translationsTextBoxes=this.translationsTextBoxes;
			delete this.translationsTextBoxes;
			dojo.forEach(translationsTextBoxes,function(translationTextBox){
				translationTextBox.destroy(false);
			},this);
			this.inherited(arguments);
		},
		logger: function(obj){
//			if(typeof console != "undefined"){
//				console.log(obj);
//			}
		},
		_createTranslationTextBox:function(isoCode, translation, contador){
			//if(this.defaultLanguage != isoCode){
				//dojo.create("br",null, this._tcn);
			//}
			var translationNode = dojo.create("div",{id:this.id+ "_" + isoCode + "_translation"}, this._tcn);
			var textBoxDiv = dojo.create("div",{style:{'float':"left",'width':"185px",'padding-top': "3px"}}, translationNode);
			var translationTagContainer =dojo.create("div",{}, translationNode);
			domAttr.set(translationTagContainer, "class", "i18nOutputTextTranslationTagContainerClass");
			var translationTagDiv = dojo.create("span",null, translationTagContainer);
domAttr.set(translationTagDiv, "class","i18nTextBoxTranslationTagClassImg");
			
			var path = dojo.config.fisaContextPath+"/"+dojo.config.fisaImages+"/languages/"+isoCode+".png"
			//formatPattern -> url of the image came from componentfactory
			domConstruct.create("img",{src:path,alt:isoCode, title:isoCode, onerror:this.onerrorCall},translationTagDiv);
			var textBox = new ec.fisa.widget.OutputText({value:translation},isoCode);
			textBox.placeAt(textBoxDiv);
			if(this.autho&&this._ov!=null&&this._ov.length>contador&&this._ov[contador]!==translation){
				domConstruct.create("br",{},textBoxDiv);
				var oldValueSpan = domConstruct.create("span",{'style':{'color':'#FF0000'}},textBoxDiv);
				oldValueSpan.innerHTML=dojox.html.entities.encode(this._ov[contador]);
				if(contador==0){
					this._fovt=oldValueSpan;
					if(this.collapsed){
						domStyle.set(oldValueSpan,"display","none");
					}
				}
			}
			textBox.fwId = this.id;
			this.translationsDivs[contador] = translationNode;
			this.translationsTextBoxes[contador] = textBox;
			this.isoCodes[contador] = isoCode;
		},
		_init:function(){
			this.supportedLanguagesNumber = this.supportedLanguages.length;
		},
		_upLangValue: function(newVal, comp){
			var cmp = dijit.byId(this.fwId);
			var langVals = cmp.actualValue.split(String.fromCharCode(255));;
			var _actualValue = "";
			dojo.forEach(cmp.isoCodes,function(item,i){
				var t = null;
				t=domAttr.get(this.translationsTextBoxes[i], "value");
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
			domStyle.set(component,"float","left");
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
			if(this.translationsTextBoxes.length<langVals.length) {
				var contador=this.translationsTextBoxes.length;
				for(;contador<=this.supportedLanguages.length;contador++){
					if(langVals&&langVals[contador]&&!(this.translationsTextBoxes[contador])){
						var langVal = langVals[contador];
						this._createTranslationTextBox(this.supportedLanguages[contador], langVal, contador);
						this.actualTranslations = contador+1;
					}
				}
			}
			if(this.translationsTextBoxes.length==0){
				this._createTranslationTextBox(this.supportedLanguages[0], "", 0);
			}
			
			if(this.translationsTextBoxes){
				dojo.forEach(this.translationsTextBoxes,function(currentTextBox,i){
					currentTextBox.set("value",langVals[i]);
				},this);
				this.collapsed=false;
				this._toggleCollapsed();
			}
		},
		attachOnChangeEvent : function(controller, btId,fId,actionMode){
		},
		_routineEvent: function(){
		},
		_collapaseTranslations:function(){
			try{
				if(this._fovt!=null){
					this._setNotVisible(this._fovt);
				}
				if(this.translationsDivs.length>1){
					for(i = 0; i < this.translationsDivs.length; i++){
						if(this.isoCodes[i] != this.defaultLanguage){
							var translationDiv = this.translationsDivs[i];
							this._setNotVisible(translationDiv);
						}
						
					}
				}
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
				if(this._fovt!=null){
					this._setVisible(this._fovt);
				}
				for(i = 0; i < this.actualTranslations; i++){
					this._setVisible(this.translationsDivs[i]);
				}
				
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
		}
	} );
	
	return I18nOutputText;
	
});
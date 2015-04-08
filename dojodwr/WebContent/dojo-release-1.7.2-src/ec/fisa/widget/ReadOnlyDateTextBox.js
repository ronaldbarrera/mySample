define([
		"dijit/form/DateTextBox",
		"dojo/_base/declare",
		"dojo/date",
		"dojo/number",
		"dojo/_base/lang",
		"ec/fisa/format/Utils",
		"ec/fisa/widget/Utils",
		"dojo/date/locale",
		"dijit/_Widget",
		"dijit/_Templated",
		"dojo/text!ec/fisa/widget/templates/ReadOnlyDateTextBox.html",
		"ec/fisa/controller/Utils",
		"./_base"],
		function(DateTextBox, declare, date, number, lang, formatUtils,widgetUtils,locale,_Widget, _Templated, template) {
	dojo.config.fisaDateExp=/[0-9\-]+/g;
	dojo.config.fisaDateTypeExp=/[dmyDMY]/g;
	dojo.config.fisaDateFullExp=/[0-9\-]+[dmyDMY]/g;

	return declare("ec.fisa.widget.ReadOnlyDateTextBox", [ _Widget, _Templated ], {
		tabId:'',
		pageScopeId:'',
		fisaFormat:0,
		styleClass:'',
		fisaFormatPattern:dojo.config.fisaShortDatePattern,
		widgetsInTemplate : false,
		templateString : template,
		_componentNode:null,
		_destroyOnRemove: true,
		dateTextboxBaseClass:"",
		postMixInProperties:function(){
			this.inherited(arguments);
			this.dateTextboxBaseClass=this.baseClass;
			this.baseClass="";
			//var cntrlr = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
			//this.value=cntrlr.obtainInitialValue(this);
		},
		
		startup:function(){
			this.inherited(arguments);
			//oscar: se requiere añadir al modelo cuando es MODO CONSULTA 
			//var cntrlr = null;
			//cntrlr = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
			//cntrlr.addParamToModel(this);			
		},		
		
		postCreate:function(){
			var value =  this.value;
			if(value && value!=''){
				value =''+ ec.fisa.format.utils.formatDateForStringValue(this.fisaFormatPattern,value);
			}
			this._componentNode.innerHTML=value;
			
	
		}
		
	});
});
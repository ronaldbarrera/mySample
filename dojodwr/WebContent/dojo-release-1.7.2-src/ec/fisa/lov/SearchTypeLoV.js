define([
        "dojo/_base/kernel",
        "dojo/_base/declare",
        "dojo/_base/lang",
        "ec/fisa/lov/ListOfValues",
		"dojo/text!ec/fisa/lov/templates/SearchTypeLoV.html",
		"dijit/_Templated", 
		"dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin",
	     "ec/fisa/mvc/StatefulModel"
		], function(dojo,declare,l,lov, template,_Templated,_TemplatedMixin,_WidgetsInTemplateMixin,StatefulModel){
	return declare("ec.fisa.lov.SearchTypeLoV", [lov,_Templated,_TemplatedMixin,_WidgetsInTemplateMixin], {

		templateString: template,
		widgetsInTemplate:true,
		readOnly:false,
		editable:true,
		
		_titleInterno:"",
		
		postMixInProperties:function(){
			this._titleInterno = this["title_interno"];
			this.inherited(arguments);
		},
		buildRendering :function(){
			this.inherited(arguments);
		},
		
		destroy: function() {
			this.inherited(arguments);
		},
		postCreate: function(){
			this.inherited(arguments);
			this.connect(this._button,"onClick", this._onButtonClick);
		},

		startup: function(){
				this.inherited(arguments);
		},
		_onButtonClick:function(){
			var controller = this.getController();
			//inicializo manualmente lovData para el campo respectivo.
			controller.lovData=[];
			var eid = this["bt-id"];
			controller.lovData[eid]={};
			var fid = this["field-id"];
			controller.lovData[eid][fid]={};
			controller.model=new StatefulModel({});
			
		
			var comboSearchType=	dijit.byId(controller.searchTypeComboId);
			var qtIdToOpen = comboSearchType.get("value");
			var options =	comboSearchType.getOptions();
			var qtTitle = "";
			dojo.forEach(options,dojo.hitch(this,function(option){
				if(option.value == qtIdToOpen){
					qtTitle = option.label;
				}
			}));
			var outcome ={};
			outcome.wAxn = "open";
			this["qt-id"]=qtIdToOpen;
			this["qtTitle"] = qtTitle;
			this._onButtonClickHandler(outcome);
			
		},
		 _setBindingAttr : function() {

		 },

		_executeAutoLovCallback:function(data) {
			var fc = this.getController();
			if(data.wAxn === "error"){
				fc.updateMsgsPanel(data.aMsgs);
			//} else if(data.wAxn === "refresh") {
			}else{
				var numberValue = data.selectedRow[2];
				var documentType = data.selectedRow[1];
				var clientType = ''+data.selectedRow[4];
			    fc.findCustomerData(numberValue,documentType,clientType);
			}
		}
	});
});

define([
        "dojo/_base/kernel","dojo/_base/declare","dojo/_base/lang","dijit/focus",
        "ec/fisa/controller/custom/BaseSchedulingController","ec/fisa/format/Utils","ec/fisa/widget/Link","ec/fisa/navigation/Utils",
        "dojo/data/ItemFileWriteStore","dojo/dom-construct","dojo/dom-geometry","dijit/tree/ForestStoreModel","dojox/grid/TreeGrid",
        "ec/fisa/widget/DocumentActions",
        "ec/fisa/mvc/StatefulModel","dojo/on","dojox/mvc","./_base","ec/fisa/widget/DateTextBox", "dojox/lang/functional/object", "ec/fisa/dwr/proxy/SchedulingActionDWR"
        ],function(dojo,declare,lang,focusUtil,BaseSchedulingController,formatUtils,fisaLink,navigationUtils,
        		ItemFileWriteStore,domConstruct,domGeometry,ForestStoreModel,TreeGrid,DocumentActions,
        		StatefulModel,on,mvc){

	var QtSchedulingController = declare("ec.fisa.controller.custom.QtSchedulingController", [BaseSchedulingController], {
		parentPageScopeId:null,
		parentBreadCrumbId:null,
		qtId:null,

		constructor: function (tabId,pageScopeId,data,componentCondId,calType,qtId,parentPageScopeId,parentBreadCrumbId ) {
			this.qtId = qtId;
			this.parentPageScopeId = parentPageScopeId;
			this.parentBreadCrumbId = parentBreadCrumbId;
		},
		/**Process the scheduling form to the pe and validate required fields.*/
		accept:function(){
			this.clearPanelMessage();
			var callObj = {
					callbackScope : this
			};
			callObj.errorHandler = dojo.hitch(this,this.errorHandler);
			callObj.callback = this.callBckFnAcceptSchedulingDwr;
			var formValues = {};
			
			formValues.allowRetries  = this.model.getValue(["allowRetries","value"]);
			formValues.endDate  = this.model.getValue(["endDate","value"]);
			formValues.frequency  = this.model.getValue(["frequency","value"]);
			formValues.repeat  = this.model.getValue(["repeat","value"]);
			formValues.startDate  = this.model.getValue(["startDate","value"]);
			formValues.termsAccept = this.model.getValue(["termsAccept","value"]);
			formValues.exportFormat = this.model.getValue(["exportFormat","value"]);
			formValues.calType = this.calType;
			formValues.componentCondId = this.componentCondId;
			
			SchedulingActionDWR.acceptQtScheduling(formValues,this.tabId,this.pageScopeId+"_resourceIn",callObj);
//				var msg = [{"detail":null,"fieldId":null,"fieldMsg":null,"ftmId":null,"label":null,"level":{"level":20000},"origLevel":null,"summary":"Su transacción ha sido programada.","zipable":false}];
//		ec.fisa.navigation.utils.showNewBreadCrumbConfirmation("",msg,this.breadcrumbId,this.tabId, this.pageScopeId,"","","");
			
		}

	});
	return QtSchedulingController;
});

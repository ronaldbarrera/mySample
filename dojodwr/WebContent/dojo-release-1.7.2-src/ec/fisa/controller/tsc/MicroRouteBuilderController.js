define([
	"dojo/_base/kernel","dojo/_base/declare","dojo/_base/lang","dojo/dom-construct","ec/fisa/controller/BaseController",
	"dojox/mvc","dojox/mvc/StatefulModel","ec/fisa/format/Utils","dojo/data/ItemFileWriteStore","./_base","ec/fisa/grid/FisaQtGrid","ec/fisa/dwr/proxy/QtControllerDWR",
	"dojox/lang/functional/object","ec/fisa/widget/DateTextBox",
	"dijit/layout/AccordionContainer","dojo/dnd/Source","dojo/data/ItemFileWriteStore","dijit/tree/TreeStoreModel",
	"dijit/tree/ForestStoreModel","dijit/Tree","dijit/tree/dndSource","dijit/registry","dijit/form/TextBox","dojox/grid/DataGrid",
	"dojox/grid/cells","dojox/grid/cells/dijit","dojo/currency","dijit/Editor","dojox/grid/cells","dijit/form/CurrencyTextBox"
],function(dojo,declare,lang,domConstruct,BaseController,mvc,StatefulModel,formatUtils,ItemFileWriteStore){
	
	var MicroRouteBuilderController = declare("ec.fisa.controller.tsc.MicroRouteBuilderController", BaseController, {
		tabId:null,
		pageScopeId:null,
		parentTabId:null,
		parentPageScopeId:null,
		parentBtId:null,
		parentFieldId:null,
		parentData:null,
		model:null,
		modelComplement:null,
		qtGridId:null,
		fisaChartId:null,		
		mainOptionsData : null,
		treeData : null,
		mainRouteTreeId:null,
		attributesTableId:null,
		gridLayout:null,
		attrGridData:null,
		attrGridDataList:null,
		attrGridStore:null,
		attrGrid:null,
		elementAttributeList:null,
		buttonId:null,
		model : null,
		microRouteObjectData:null,
		data : {},
		constructor: function (tabId, pageScopeId, parentTabId, parentPageScopeId, parentBtId, parentFieldId) {
			this.tabId = tabId;
			this.pageScopeId = pageScopeId;
			this.parentTabId = parentTabId;
			this.parentPageScopeId = parentPageScopeId;
			this.parentBtId = parentBtId;
			this.parentFieldId = parentFieldId;
			this.mainOptionsData={identifier: 'id',label: 'name',items: []};
			this.model = dojox.mvc.newStatefulModel({
				data : {}
			});
			this.initData();
			
		},
		initData:function(){
			this.elementAttributeList=[];
			//this.getElementAttributeData();
		},
		setMainRouteTreeId:function(treeGrid){
			this.mainRouteTreeId=treeGrid.id;
			
			/*treeGrid.model.onChildrenChange= dojo.hitch(this,function(parent, newChildrenList) {
				var store = this.store;
				var idOriginal=store._entries[newChildrenList[0]].data.id;
				var elmParent = idOriginal.split("_");
				//this.displayOndropAttributesTable(elmParent[2]);
			};*/
			
			
		},
		setMicroRouteObjectData:function(objectData){
			this.microRouteObjectData=objectData;
		},
		setRouteAttributesTableId:function(component){
			this.attributesTableId=component.id;
			var currentMainTree=dijit.byId(this.mainRouteTreeId);
			currentMainTree.setDataTableGeneratedId(this.attributesTableId);
			//this.createInitialAttributesTable();
			//alert(this.attributesTableId);
		},
		getElementAttributeData:function(){
			MicroRouteControllerDWR.findAllElementAttributesWithParent({
				callbackScope : this,
				callback : function(data) {
					this.fillElementAttributeList(data);
				},
				errorHandler : this.errorHandler
			});
		},
		saveItemInformation:function(item){
			var currentTable = dijit.byId(this.attributesTableId);
			var currentMainTree=dijit.byId(currentTable.parentTreeId);
			var store = currentTable.store;
			var realName=item.data.elementId;
			var completeAttributesArray = "";
			realName = realName.concat('( ');
			for (var i = 0; i < store._arrayOfAllItems.length; i++){
				var row = store._arrayOfAllItems[i];
				if (row.widget!=null&&row.widget!=''){
					currentMainTree.store.setValue(item.itemId,"attributeId_"+i,row.attr[0]);
					currentMainTree.store.setValue(item.itemId,"attributeValue_"+i,row.widget);
					currentMainTree.store.setValue(item.itemId,"isLabel_"+i,row.isLabel[0]);
					completeAttributesArray=completeAttributesArray.concat(row.attr[0]+"TPT"+row.widget+"TAT");
					currentMainTree.store.setValue(item.itemId,"attrArray",completeAttributesArray);
					if(row.isLabel == "1"){
						realName=realName.concat(row.attr[0].concat(' [ '+row.widget+' ] '));
						realName=realName.concat('  ');
						currentMainTree.store.setValue(item.itemId,"name",realName.toString().concat(' )'));
					}
				}
			}
		
		},
		saveMainRouteTree:function(){
			var callObj = {
					scope : this
				};
			callObj.onComplete = this.onSaveComplete;
			callObj.onError = this.errorHandler;
			var tree = dijit.byId(this.mainRouteTreeId);
			tree.store.dwrCache.additionalParams.push(this.model._microRouteName.value);
			tree.store.dwrCache.additionalParams.push(this.model._microRouteDescription.value);
			tree.store.dwrCache.additionalParams.push(this.model._microRouteId.value);
			tree.store.save(callObj);
		},
		deleteMainRouteTree:function(){
			var dlgConfirm = new ec.fisa.widget.ConfirmDialog({
				acceptDialogLabel : 'Eliminar',
				cancelDialogLabel : 'Cancelar',
				title : 'Eliminar Ruta',
				content : 'Desea eliminar la ruta actual?',
				acceptAction : dojo.hitch(this, function() {
					var callObj = {
							callbackScope : this
					};
					callObj.callback = this.handleWindowAction;
					callObj.errorHandler = this.errorHandler;
					MicroRouteControllerDWR.deleteCurrentMicroRoute(this.tabId, this.pageScopeId,callObj);
					ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
				})
			});
			dlgConfirm.show();
		},
		cancelMicroRoute:function(isSequence){		
			
			var callObj = {
					callbackScope : this
				};
			callObj.callback = function(outcome) {
				this.clearPanelMessage(); //operaciones
			};
			callObj.errorHandler = this.errorHandler;
			
			//UserRolAdminControllerDWR.cancelUserRoleImpl(this.tabId, this.pageScopeId, callObj);

			if(isSequence != null && isSequence == "true"){
				 ec.fisa.navigation.utils.closeSequenceBreadCrumb(this.breadcrumbId);
			} else {
				 ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
			} 	 						
		},
		setMessagesPanel:function(messagesPanel){
			this.inherited(arguments);
			if(typeof this.breadcrumbId === 'undefined' || this.breadcrumbId == null){
			this.breadcrumbId=messagesPanel.getParent().getParent().getParent().id;
			}
			this.updateMsgsPanel(this.initMsgs);
			this.btContentPaneId = messagesPanel.getParent().getParent().id;
			delete this.initMsgs;
		},
		onSaveComplete : function(data) {
			//this.executeSaveTree = false;
			//alert("onSaveComplete "+data);
			var callObj = {
					callbackScope : this.scope
			};
			callObj.callback = this.scope.handleWindowAction;
			callObj.errorHandler = this.scope.errorHandler;
			//MicroRouteControllerDWR.viewAvailableRouteElementTreeByElementType(this.scope.tabId, this.scope.pageScopeId, this.scope.channelComboValue, callObj);
			ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.scope.breadcrumbId);
		},
		bindToModel : function(/* widget */component,/* String */modelProp, /* String */textId) {
			var tree = dijit.byId(this.mainRouteTreeId);
			var data = this.bindDataRoute();
			var modelData = data[modelProp];
			if (typeof modelData === "undefined") {
				modelData = "";
			}
			var stf = new dojox.mvc.StatefulModel({
				data : modelData
			});
			this.model.add(modelProp, stf);
			component.set("ref", this.model[modelProp]);
		},
		bindDataRoute:function(){
			var mapData = {};
			if(this.microRouteObjectData!=null){
				mapData["_microRouteName"]=this.microRouteObjectData[0];
				mapData["_microRouteDescription"]=this.microRouteObjectData[1];
				mapData["_microRouteId"]=this.microRouteObjectData[2];
			}
			return mapData;
		},
		setButtonId:function(component){
			this.buttonId=component.id;
			var currentMainTree=dijit.byId(this.mainRouteTreeId);
			currentMainTree.setButtonDataTableId(this.buttonId);
		},
		fillElementAttributeList:function(data){
			this.elementAttributeList=data;
		},
		setAttributesTableProperties:function(){
			
		},
		errorHandler : function(data) {
			alert("errorHandler "+data);
		},
		destroy:function(){
		}
	});
	return MicroRouteBuilderController;
});

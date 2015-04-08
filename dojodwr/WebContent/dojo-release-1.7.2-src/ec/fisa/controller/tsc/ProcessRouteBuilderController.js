define([
	"dojo/_base/kernel","dojo/_base/declare","dojo/_base/lang","dojo/dom-construct","ec/fisa/controller/BaseController",
	"dojox/mvc","dojox/mvc/StatefulModel","ec/fisa/format/Utils","dojo/data/ItemFileWriteStore","ec/fisa/mvc/StatefulModel","./_base","ec/fisa/grid/FisaQtGrid","ec/fisa/dwr/proxy/QtControllerDWR",
	"dojox/lang/functional/object","ec/fisa/widget/DateTextBox","ec/fisa/controller/Utils",
	"dijit/layout/AccordionContainer","dojo/dnd/Source","dojo/data/ItemFileWriteStore","dijit/tree/TreeStoreModel",
	"dijit/tree/ForestStoreModel","dijit/Tree","dijit/tree/dndSource","dijit/registry","dijit/form/TextBox","dojox/grid/DataGrid",
	"dojox/grid/cells","dojox/grid/cells/dijit","dojo/currency","dijit/Editor","dojox/grid/cells","dijit/form/CurrencyTextBox"
],function(dojo,declare,lang,domConstruct,BaseController,mvc,StatefulModel,formatUtils,ItemFileWriteStore,StatefulModelA){
	
	var ProcessRouteBuilderController = declare("ec.fisa.controller.tsc.ProcessRouteBuilderController", BaseController, {
		tabId:null,
		pageScopeId:null,
		parentTabId:null,
		parentPageScopeId:null,
		parentBtId:null,
		parentFieldId:null,
		actionId:null,
		parentData:null,
		model:null,
		model2:null,
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
		processRouteObjectData:null,
		data : {},
		initData:null,
		lovData:null,
		initDataFT:null,
		processDefinitionId:null,
		contentPanel:null,
		breadcrumbId:null,
		constructor: function (tabId, pageScopeId, parentTabId, parentPageScopeId, parentBtId, parentFieldId, actionId, initData,lovData,initDataFT) {
			this.tabId = tabId;
			this.pageScopeId = pageScopeId;
			this.parentTabId = parentTabId;
			this.parentPageScopeId = parentPageScopeId;
			this.parentBtId = parentBtId;
			this.parentFieldId = parentFieldId;
			this.actionId = actionId;
			this.mainOptionsData={identifier: 'id',label: 'name',items: []};
			this.model2 = dojox.mvc.newStatefulModel({
				data : {}
			});
			
			
			this.elementAttributeList=[];
			this.initData=initData;
			this.lovData=lovData;
			this.data = initDataFT;
			this.model = new StatefulModelA({
				data : this.initData
			});
			
		},
		setMainRouteTreeId:function(treeGrid){
			this.mainRouteTreeId=treeGrid.id;
		},
		setRouteAttributesTableId:function(component){
			this.attributesTableId = component.id;
			var currentMainTree = dijit.byId(this.mainRouteTreeId);
			currentMainTree.setDataTableGeneratedId(this.attributesTableId);
		},
		getElementAttributeData:function(){
			ProcessRouteControllerDWR.findAllElementAttributesWithParent({
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
			var callObj = {scope : this};
			callObj.onComplete = this.onSaveMainRouteComplete;
			callObj.onError = this.errorHandler;
			var tree = dijit.byId(this.mainRouteTreeId);
			tree.store.dwrCache.additionalParams.push(this.model2._processRouteName.value);
			tree.store.dwrCache.additionalParams.push(this.model2._processRouteDescription.value);
			tree.store.dwrCache.additionalParams.push(this.model2._internalProcessId.value);
			tree.store.dwrCache.additionalParams.push(this.model2._processRouteId.value);
			tree.store.save(callObj);
		},
		onSaveMainRouteComplete:function(data) {
			var callObj = {
					callbackScope : this.scope
			};
			callObj.callback = this.scope.handleWindowAction;
			callObj.errorHandler = this.scope.errorHandler;
			ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.scope.breadcrumbId);
			if (this.scope.actionId == 'IN') {
				ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.scope.breadcrumbId);
			}
		},
		bindToModel : function(/* widget */component,/* String */modelProp, /* String */textId) {
			// Se obtiene el arbol a partir del Id
			var currentMainTree=dijit.byId(this.mainRouteTreeId);
			if (this.attributesTableId != null) {
				currentMainTree.setDataTableGeneratedId(this.attributesTableId);
			}
			var tree = dijit.byId(this.mainRouteTreeId);
			var data = this.bindDataRoute();//tree.itemData;
			var modelData = data[modelProp];
			if (typeof modelData === "undefined") {
				modelData = "";
			}
	
			var stf = new dojox.mvc.StatefulModel({
				data : modelData
			});
	
			this.model2.add(modelProp, stf);
			component.set("ref", this.model2[modelProp]);
		},
		bindDataRoute:function(){
			var mapData = {};
			if(this.processRouteObjectData!=null){
				mapData["_processRouteName"]=this.processRouteObjectData[0];
				mapData["_processRouteDescription"]=this.processRouteObjectData[1];
				mapData["_internalProcessId"]=this.processRouteObjectData[2];
				mapData["_processRouteId"]=this.processRouteObjectData[3];
			}
			return mapData;
		},
		setProcessRouteObjectData:function(objectData){
			this.processRouteObjectData=objectData;
		},
		setButtonId:function(component){
			this.buttonId = component.id;
			var currentMainTree=dijit.byId(this.mainRouteTreeId);
			currentMainTree.setButtonDataTableId(this.buttonId);	
		},
		addParamToModel:function(component){
			var eid=component["bt-id"];
			var fid=component["field-id"];
			

			var field = null;
			if(this.data&&this.data[eid]&&this.data[eid].dataMessage){
				field = this.data[eid].dataMessage.fields[fid];
			}
			if(field == null) {
				field={value:'',complement:null};
				component._fStarted=true;
			} else if(field.value==null){
				field.value="";
				component._fStarted=true;
			}
			
			if (fid === 'EFP-TTSC_PROCESS_ROUTE-PROCESS_ID') {
				this.processDefinitionId=field.value;
			}
		
			if(this.model.contains(eid)){
				//if exists yet updates new value.
				if(this.model.contains([eid,'dataMessage','fields',fid]) ) {
					this.model.setValue([eid,'dataMessage','fields',fid,'value'],field.value);
				}
			} else {
				var formater=null;
				if(component instanceof ec.fisa.widget.DateTextBox){
					formater=ec.fisa.format.utils.formatLongDate;
				}
				this.model.appendObject([eid,'dataMessage','fields',fid,'value'],field.value,component.id,'value',formater,true);
				
				var enabled = null;
				if(field.enabled != undefined ){
					enabled = field.enabled;
				}
				this.model.appendObject([eid,'dataMessage','fields',fid,'enabled'],enabled,component.id,'enabled',null,false);
					
				
				if(component.hasCompl){
					this.model.appendObject([eid,'dataMessage','fields',fid,'complement'],field.complement,component.id,'complement',null,false);
				}
				
				
			}
			
		},
		containsFieldModel:function(eid, fid){
			return this.model.contains([eid,'dataMessage','fields',fid,'value']);
		},
		getFieldModel:function(eid, fid){
			return this.model.getValue([eid,'dataMessage','fields',fid,'value']);
		},
		setFieldModelValue:function(eid, fid, value) {
			this.model.setValue([eid,'dataMessage','fields',fid,'value'],value);
			
		},
		/**updates the mvc with the enabled attribute.*/
		setFieldModelEnabled:function(/*String businesstemplate id*/btId,/*String fieldId*/ fid,/*boolean */ value) {
			this.model.setValue([btId,'dataMessage','fields',fid,'enabled'],value);
		},
		setFieldModelComplement:function(eid, fid, complement) {
			this.model.setValue([eid,'dataMessage','fields',fid,'complement'],complement);
		},
		getFieldModelComplement:function(eid, fid) {
			return this.model.getValue([eid,'dataMessage','fields',fid,'complement']);
		},
		handleCallBackBackFieldRoutine : function(outcome, nf) {
			this.showMessages(outcome);
			//							
		},
		showMessages : function(outcome) {
			if (outcome != null) {
				this.updateMsgsPanel(outcome.aMsgs);
			}
		},
		goToNewProcessRoute:function(isSequence){
			this.processDefinitionId = this.getFieldModel("EFP_TSC_PRR_NFIS0000","EFP-TTSC_PROCESS_ROUTE-PROCESS_ID");
			this.callNewProcessRouteDialog();
			
		},
		openNewProcessRouteDialog : function(){
			//this.clearPanelMessage();
			
			this.contentPanel = new dojox.widget.DialogSimple({
				//i can call this.titleDlg cause the scope previously inserted.
				title : 'Nueva Ruta de Proceso',
				href : './static/tsc/newProcessRouteBuilder.jsp?',
				ioArgs : {
					content : {
						FISATabId : this.tabId,
						FisaPageScopeId : this.pageScopeId
					}
				},
				ioMethod : dojo.xhrPost
			});
			this.contentPanel.set("dimensions", [400, 200]);
			this.contentPanel.layout();
			this.contentPanel.show();
		},
		callNewProcessRouteDialog:function(){
			
			//this.contentPanel.destroy();
			
			var callObj = {
					callbackScope : this
				};
			callObj.callback = function(outcome) {
				/*this.contentPanel = new dojox.widget.DialogSimple({
					//i can call this.titleDlg cause the scope previously inserted.
					title : 'Nueva Ruta de Proceso',
					href : './static/tsc/newProcessRouteBuilder.jsp',
					ioArgs : {
						content : {
							FISATabId : this.tabId,
							FisaPageScopeId : this.pageScopeId
						}
					},
					ioMethod : dojo.xhrPost
				});
				this.contentPanel.set("dimensions", [600, 600]);
				this.contentPanel.layout();
				this.contentPanel.show();*/
				var newSubTabPaneArg = {};
				newSubTabPaneArg.title="Nueva Ruta de Proceso";
				newSubTabPaneArg.iconClass="breadcrumbIcon";
				newSubTabPaneArg.href=outcome.nextUrl;
				newSubTabPaneArg.postClose = this.refresh;
				newSubTabPaneArg.postCloseScope = this.id;
				newSubTabPaneArg.postCloseArgs = [this.tabId];
				var ctrler=ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
				ec.fisa.navigation.utils.openNewBreadCrumb(newSubTabPaneArg,ctrler.breadcrumbId);
			};
			callObj.errorHandler = this.errorHandler;
			
			ProcessRouteControllerDWR.getNewProcessRoutePage(this.tabId, this.pageScopeId, this.actionId, this.processDefinitionId, callObj);
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
		cancelProcessRoute:function(isSequence){		
			
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
					ProcessRouteControllerDWR.deleteCurrentProcessRoute(this.tabId, this.pageScopeId,callObj);
					ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
				})
			});
			dlgConfirm.show();
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
	return ProcessRouteBuilderController;
});

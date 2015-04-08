define([ "dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/lang", "ec/fisa/controller/BaseController",
		"ec/fisa/format/Utils", "ec/fisa/navigation/Utils", "dojo/data/ItemFileWriteStore", "dojo/dom-construct",
		"dijit/tree/ForestStoreModel", "dijit/Tree", "dijit/Menu", "dijit/tree/dndSource", "dojox/mvc",
		"ec/fisa/mvc/StatefulModel", "ec/fisa/widget/ConfirmDialog", "ec/fisa/widget/tsc/AvailableOptionsTree",
		"ec/fisa/widget/tsc/EditableOptionsTree","ec/fisa/controller/custom/QtController", "dojo/dom-style"], function(dojo, declare, lang, BaseController, formatUtils,
		navigationUtils, ItemFileWriteStore, domConstruct, ForestStoreModel, Tree, Menu, dndSource, mvc, StatefulModel,
		ConfirmDialog, AvailableOptionsTree, EditableOptionsTree, QtController, domStyle) {

	var ChannelAppOptionController = declare("ec.fisa.controller.tsc.ChannelAppOptionController", BaseController, {

		tabId : null,
		
		pageScopeId : null,
		
		parentTabId : null,
		
		isDelete : false,
		
		parentPageScopeId : null,

		/* Opciones principàles */
		mainOptionsData : null,
		/* Nuevas Opciones */
		editableOptionsData : null,

		treeData : null,

		editableOptionsTree : null,
		
		breadcrumbId : null,

		model : null,

		dialogId : null,

		data : {},

		dialogIdByItemId : {},

		scheduleList : null,

		parameterList : null,

		channelList : null,

		newItemId : null,

		identifierId : null,
		
		editableTreeId : null,
		
		availableTreeId : null,
		
		executeSaveTree : true,
		
		channelComboId : null,
		
		channelComboValue : null,
		
		requiredFieldMessage : null,
		
		globalMessagePanelId : null,
		
		combo : null,
		
		supportedLanguages : [],
		
		languageCode : null,
		
		componentsNames : [ "nameI18n", "parameter", "schedule", "routine", "relatedURL", "leaf" ],

		constructor : function(tabId, pageScopeId) {
			this.tabId = tabId;
			this.pageScopeId = pageScopeId;
			
			this.model = new StatefulModel({});

			MenuEditionAdminControllerDWR.loadComboOptionsOptions(this.tabId, {
				callbackScope : this,
				callback : function(data) {
					delete data.tabId;
					this.fillComboOptions(data);
				},
				errorHandler : dojo.hitch(this,this.errorHandler)
			});
			
			MenuEditionAdminControllerDWR.getRequiredFieldMessage({
				callbackScope : this,
				callback : function(data) {
					this.requiredFieldMessage = data;
				},
				errorHandler : dojo.hitch(this,this.errorHandler)
			});
		},

		fillComboOptions : function(data) {
			this.scheduleList = data.scheduleList;
			this.parameterList = data.parameterList;
			this.channelList = data.channelList;
			delete data.scheduleList;
			delete data.parameterList;
			delete data.channelList;
		},
		
		setEditableOptionsId : function(tree) {
			this.editableTreeId = tree.id;
		},
		
		setAvailableOptionsId : function(treeId) {
			this.availableTreeId = treeId;
		},
		
		setChannelComboId : function(comboId) {
			this.channelComboId = comboId;
			this.combo = dijit.byId(comboId);
			this.combo.connect(this.combo, "onChange", dojo.hitch(this,this.setChannelId));
		},
		
		setAvailableMenuData : function(mainOptionsData) {
			this.mainOptionsData = mainOptionsData;
		},

		setEditableMenuData : function(editableOptionsData) {
			this.editableOptionsData = editableOptionsData;
		},
		deleteEditTree: function(idMenu) {
			var dlgConfirm = new ec.fisa.widget.ConfirmDialog({
				acceptDialogLabel : this.labelsData.yesLabel,
				cancelDialogLabel : this.labelsData.noLabel,
				title : this.labelsData.deleteMenuLabel,
				content : this.labelsData.deleteWarnLabel,
				acceptAction : dojo.hitch(this, this.deleteEditTreeCnfrm, idMenu)
			});
			dlgConfirm.show();
		},
		deleteEditTreeCnfrm : function(idMenu) {
			var callObj = {
					callbackScope : this
			};
			callObj.callback = this.handleWindowAction;
			callObj.errorHandler = this.errorHandler;
			MenuEditionAdminControllerDWR.deleteMenu(this.tabId, this.pageScopeId,idMenu,callObj);
		},
		saveEditTree : function() {
			var channelCombo = dijit.byId(this.channelComboId);
			
			this.channelComboValue = channelCombo.getValue();
			
			//Se valida campo obligatorio canal 
			var channelComboValidation = {field: "ADM_CHANNEL", value : channelCombo.getValue()};
			
			if(this.validateFields([channelComboValidation], true)){
				return;
			}
			
			this.executeSaveTree = true;
			var callObj = {
				scope : this
			};
			callObj.onComplete = this.onSaveComplete;
			callObj.onError = dojo.hitch(this,this.errorHandler);
			
			var tree = dijit.byId(this.editableTreeId);
			
			tree.store.save(callObj);
		},
		
		onSaveComplete : function(data) {
			this.executeSaveTree = false;
			var callObj = {
					callbackScope : this.scope
			};
			callObj.callback = this.scope.handleWindowAction;
			callObj.errorHandler = dojo.hitch(this.scope,this.scope.errorHandler);
			MenuEditionAdminControllerDWR.saveEditableTree(this.scope.tabId, this.scope.pageScopeId, this.scope.channelComboValue, callObj);
		},
		
		handleWindowAction : function(outcome) {
			var tabId=null;
			var pageId=null;
			if(outcome.wAxn=="cnfrm"){
				tabId=this.tabId;
				pageId=this.pageScopeId;
			} else {
				tabId=this.parentTabId;
				pageId=this.parentPageScopeId;
			}
			var controller = ec.fisa.controller.utils.getPageController(tabId, pageId);
			controller.clearPanelMessage();
			controller.updateMsgsPanel(outcome.aMsgs);
			//this.close();
			if(outcome.wAxn=="cnfrm"){
				ec.fisa.navigation.utils.showNewBreadCrumbConfirmation(outcome.confirmationDialogTitle,outcome.aMsgs,this.breadcrumbId,this.tabId, this.pageId,null,null,false);	
			}
		},

		bindToModel : function(/* widget */component,/* String */modelProp, /* String */treeId) {
			// console.log("modelProp [" + modelProp + "]");
			var modelData;
			if((typeof treeId !== undefined) && treeId != null){
				// Se obtiene el arbol a partir del Id
				var tree = dijit.byId(treeId);
				var data = tree.itemData;
				modelData= data[modelProp];
			}
			
			if (typeof modelData === "undefined") {
				modelData = "";
			}
			this.model.appendObject([modelProp],modelData,component.id,'value',null,true);
		},

		addNewFolder : function(parentItemId, treeId) {
			//alert('addNewFolder');
			//Se valida campos obligatorios
			var paramName = parentItemId + "_nameI18n";
			var valModel = this.model.getValue([paramName]);
//			console.log("paramName ["+paramName+"]");
//			console.log("valModel ["+valModel+"]");
//			if((typeof valModel === undefined) || (valModel == "") || (valModel == "-1") || (valModel == "-1000")){
//				alert('esta vacio');
//			}
			var nameValidation = {field: "CAL_NAME", value : valModel};
			
			if(this.validateFields([nameValidation])){
				return;
			}
			
			var tree = dijit.byId(treeId);

			var paramNameIcon = parentItemId + "_iconUrl";
			var iconUrlVal = this.model.getValue([paramNameIcon]);
			var paramMenuCss = parentItemId + "_menuCss";
			var menuCssVal = this.model.getValue([paramMenuCss]);
			tree.model.newItem({
				name : ec.fisa.controller.utils.getCurrentTranslation(valModel, this.languageCode, this.supportedLanguages),
				nameI18n : valModel,
				type : "EXTERNAL_FOLDER",
				isLeaf : false,
				editableTreeItem : true,
				iconUrl: iconUrlVal,
				menuCss:menuCssVal
			}, parentItemId, tree.lastFocused.getChildren().length);

			var dialogId = tree.dialogIdByItemId[parentItemId];
			// Se vacia el mapa
			tree.itemData = {};
			this.model.removeObject([paramName]);
			dijit.byId(dialogId).destroy();
		},

		changeFolderName : function(itemId, treeId) {
			//alert('changeFolderName');
			//Se valida campos obligatorios
			var paramName = itemId + "_nameI18n";
			var valModel = this.model.getValue([paramName]);
			
			var nameValidation = {field: "CAL_NAME", value : valModel};
			
			if(this.validateFields([nameValidation])){
				return;
			}
			
			var tree = dijit.byId(treeId);
			var store = tree.store;
			
			var paramNameIcon = itemId + "_iconUrl";
			var iconUrlVal = this.model.getValue([paramNameIcon]);
			
			var paramMenuCss = itemId + "_menuCss";
			var menuCssVal = this.model.getValue([paramMenuCss]);

			store.setValue(itemId, "name", ec.fisa.controller.utils.getCurrentTranslation(valModel, this.languageCode, this.supportedLanguages));
			store.setValue(itemId, "nameI18n", valModel);
			store.setValue(itemId, "iconUrl", iconUrlVal);
			store.setValue(itemId, "menuCss", menuCssVal);

			var dialogId = tree.dialogIdByItemId[itemId];
			// Se vacia el mapa
			tree.itemData = {};
			this.model.removeObject([paramName]);

			//Se seta a false siempre la variable modificacion en caso de que se este modificando
			tree.isModifyOption = false;

			dijit.byId(dialogId).destroy();
		},

		saveItemInformation : function(itemId, treeId) {
			//alert('saveInfo');
			var tree = dijit.byId(treeId);
			var store = tree.store;
			var entry = store.getEntryById(itemId);
			// se valida que se haya seleccionado un objeto
			if (!entry) {
				// alerta en el caso que no exista objeto seleccionado
				return alert("entry doesn't exist");
			}

			var item = entry.data;
			var returnVal = false;
			
			var schedule = "-1", parameter = "-1";
			//Se valida campos obligatorios
			var nameValidation = {field: "CAL_NAME", value : this.model.getValue([itemId + "_nameI18n"])};
			if(this.model.contains([itemId + "_schedule"]) == true){
				schedule = this.model.getValue([itemId + "_schedule"]);
			}
			var type = item.type;
			
			if(type != "ITEM_LAYOUT_TEMPLATE"){
				var scheduleValidation = {field: "ADM_SCHEDULE", value : schedule};
				if(this.model.contains([itemId + "_parameter"]) == true){
					parameter = this.model.getValue([itemId + "_parameter"]);
				}
			
				var parameterValidation = {field: "ADM_PARAMETER", value : parameter};
				
				if(type == "ITEM_QUERY_TEMPLATE" || type == "BUSINESS_TEMPLATE_URL"){
					returnVal = this.validateFields([nameValidation, scheduleValidation]);
				} else if(type == "EXTERNAL_URL"){
					//Se valida campos obligatorios
					var urlValidation = {field: "ADM_URL", value : this.model.getValue([itemId + "_relatedURL"])};
					returnVal = this.validateFields([urlValidation, nameValidation])
				} else {
					returnVal = this.validateFields([nameValidation, scheduleValidation, parameterValidation]);
				} 
			} else {
				//Se valida que ingrese el valor del portlet
				var urlValidation = {field: "ADM_IDENTIFIER", value : this.model.getValue([itemId + "_relatedURL"])};
				returnVal = this.validateFields([urlValidation, nameValidation])
			}
			
			if(returnVal === false){
				
				for ( var i = 0; i < this.componentsNames.length; i++) {
					var name = this.componentsNames[i];
					var componentValue = this.model.getValue([itemId + "_" + name]);
					if ((typeof componentValue !== undefined) && (componentValue != null)) {
						item[name] = componentValue;
						store.setValue(itemId, name, componentValue);
						//Si es el valor de i18n se setea tambien el campo name
						if(name == 'nameI18n'){
							var currentValue = ec.fisa.controller.utils.getCurrentTranslation(componentValue, this.languageCode, this.supportedLanguages);
							item['name'] = currentValue;
							store.setValue(itemId, 'name', currentValue);
						}
					}
					this.model.removeObject([itemId + "_" + name]);
				}
				store.setValue(itemId, 'leaf',item['leaf']);
				store.setValue(itemId, 'editableTreeItem', true);
	
				var dialogId = tree.dialogIdByItemId[itemId];
				// Se vacia el mapa
				tree.itemData = {};
				//Se seta a false siempre la variable modificacion en caso de que se este modificando
				tree.isModifyOption = false;
				dijit.byId(dialogId).destroy();
			}
		},
		
		cancelItemInformation : function(itemId, treeId) {
			var tree = dijit.byId(treeId);
			var dialogId = tree.dialogIdByItemId[itemId];
			dijit.byId(dialogId).onCancel();
		},

		saveExternalURLInformation : function(itemId, treeId) {
			//alert('saveExternalURLInformation');
			//Se valida campos obligatorios
			var urlValidation = {field: "ADM_URL", value : this.model.getValue([itemId + "_relatedURL"])};
			var nameValidation = {field: "CAL_NAME", value : this.model.getValue([itemId + "_nameI18n"])};
			
			if(this.validateFields([urlValidation, nameValidation])){
				return;
			}
			
			var tree = dijit.byId(treeId);
			tree.model.newItem({
				name : ec.fisa.controller.utils.getCurrentTranslation(this.model.getValue([itemId + "_nameI18n"]), this.languageCode, this.supportedLanguages),
				nameI18n : this.model.getValue([itemId + "_nameI18n"]),
				routine : this.model.getValue([itemId + "_routine"]),
				relatedURL : this.model.getValue([itemId + "_relatedURL"]),
				type : "EXTERNAL_URL",
				leaf : true,
				editableTreeItem : true
			}, itemId, tree.lastFocused.getChildren().length);

			var dialogId = tree.dialogIdByItemId[itemId];
			// Se vacia el mapa
			tree.itemData = {};
			this.model.removeObject([itemId + "_nameI18n", itemId + "_routine", itemId + "_relatedURL"]);
			dijit.byId(dialogId).destroy();
		},		
		
		findAvailableTree : function() {
			var pattern = this.model.getValue(["availableValuePattern"]);
			var idsAsString = '';
			var tree = dijit.byId(this.availableTreeId);
			
			//Si el attr del tree (modelAllTree) es null se setea el modelo.
			var modelAllTree = null;
			if(tree.modelAllTree == null){
				tree.modelAllTree = tree.model;
			}
			
			modelAllTree = tree.modelAllTree;
			
			if((typeof pattern !== "undefined") && pattern != null && pattern != ""){
				var paths = modelAllTree.findTreeItem(pattern, "id");
				idsAsString = this.setFoundNodesIdsAsString(paths);
			} else{
				pattern = '';
			}
			var childDiv = domConstruct.create('div',{},tree.domNode.parentNode);
			var newTreeParms = {'tabId':tree.tabId,'pageScopeId':tree.pageScopeId,'additionalParams':[tree.getChannelValue(),"isTreeFinder", idsAsString, pattern],'style':'overflow: visible;'};
			tree.destroyRecursive(false);
			var treeNew=new ec.fisa.widget.tsc.AvailableOptionsTree(newTreeParms,childDiv);
			this.availableTreeId=treeNew.id;
			if(idsAsString != ''){
				treeNew.autoExpand = true;
			}
			//En cada Busqueda se pasa al nuevo arbol el modelo original que contiene todos los items y que es necesario para las busquedas.
			treeNew.modelAllTree = modelAllTree;
		},
		
		findEditablebleTree : function() {
			var pattern = this.model.getValue(["editableValuePattern"]);
			var idsAsString = null;
			var tree = dijit.byId(this.editableTreeId);

			tree.constructDomNodesArr();
			
			if((typeof pattern !== "undefined") && pattern != null && pattern != ""){
				var paths = tree.model.findTreeItem(pattern, "id");
				idsAsString = this.setFoundNodesIdsAsString(paths);
			} 
			
			if(idsAsString != '' && idsAsString != null){
				var idsArr = idsAsString.split('#');
				var treeNodes = tree._itemNodesMap;
				//Se oculta todos los nodos
				for ( var nodeId in treeNodes) {
					var domNode = tree.getDomNodeById(nodeId);
					domStyle.set(domNode, "display", "none");
					//Y se habilita solo los de busqueda
					for ( var i = 0; i < idsArr.length; i++) {
						if(idsArr[i] != "" && nodeId == idsArr[i]){
							domStyle.set(domNode, "display", "");
							var node = treeNodes[nodeId][0];
							node.expand();
							break;
						}
					}
				}
				
				
			} else if(idsAsString == ''){
				//Si no existe ningun resultado se oculta todo
				var treeNodes = tree._itemNodesMap;
				for ( var nodeId in treeNodes) {
					var domNode = tree.getDomNodeById(nodeId);
					domStyle.set(domNode, "display", "none");
				}
			} else {
				//Si el patron de busqueda es en blanco se presenta todos
				var treeNodes = tree._itemNodesMap;
				for ( var nodeId in treeNodes) {
					var node = treeNodes[nodeId][0];
					var domNode = tree.getDomNodeById(nodeId);
					domStyle.set(domNode, "display", "");
				}
			}
			
		},
		
		validateFields : function(evalValues, isMainPanel) {
			var level = new Object();
			level.level = 40000;			
			var errorMsg = {};
			errorMsg["level"] = level;
			errorMsg["summary"] = this.requiredFieldMessage["I18N_REQUIRED_FIELDS"];
			
			dojo.forEach(evalValues, function(values){
				if((typeof values.value === "undefined") || (values.value == "") || (values.value == "-1") || (values.value == "-1000")){
					if(typeof errorMsg["detail"] !== "undefined"){
						errorMsg["detail"] = errorMsg["detail"] + " ** " + this.requiredFieldMessage[values.field]; 	
					} else{
						errorMsg["detail"] = "** "+this.requiredFieldMessage[values.field];
					}
				}
			},this);
			
			if(typeof errorMsg["detail"] !== "undefined"){
				var messagesPanel = null;
				if(isMainPanel !== undefined && isMainPanel){
					messagesPanel = dijit.byId(this.globalMessagePanelId);
					this.setMessagesPanel(messagesPanel, isMainPanel);
				}else{
					messagesPanel = dijit.byId(this.messagesPanelId);
				}
				
				messagesPanel.clearAllMessages();
				this.updateMsgsPanel([errorMsg]);
				
				//Retorna true si hubo mensajes
				return true;
			}
			
			//Retorna false si no hubo mensajes
			return false;
		},
		
		close : function() {
			ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
//			var refControlller=ec.fisa.controller.utils.getPageController(this.parentTabId,this.parentPageScopeId);
//			if (refControlller != undefined && refControlller instanceof QtController) {
//				refControlller.search();
//			}
		},
		
		setMessagesPanel:function(messagesPanel, isMainPanel){
			// console.log("messagePanelId [" + messagesPanel.id + "]");
			if(isMainPanel !== undefined && isMainPanel === true){
				this.globalMessagePanelId = messagesPanel.id;
			}
			// console.log("globalMessagePanelId [" + this.globalMessagePanelId + "]");
			this.inherited(arguments);
			if(typeof this.breadcrumbId === 'undefined' || this.breadcrumbId == null){
			this.breadcrumbId=ec.fisa.controller.utils.findCurrentBreadCrumb(messagesPanel);
			}
			this.updateMsgsPanel(this.initMsgs);
			//this.btContentPaneId = messagesPanel.getParent().getParent().id;
			delete this.initMsgs;
		},
		
		setChannelId : function(newValue) {
			this.clearPanelMessage();
			this.reloadAvailableTree();
			this.reloadEditableTree();
//			var tree=dijit.byId(this.availableTreeId);
//			var childDiv = domConstruct.create('div',{},tree.domNode.parentNode);
//			var newTreeParms = {'tabId':tree.tabId,'pageScopeId':tree.pageScopeId,'additionalParams':[tree.getChannelValue()],'style':'overflow: visible;'};
//			tree.destroyRecursive(false);
//			var treeNew=new ec.fisa.widget.tsc.AvailableOptionsTree(newTreeParms,childDiv);
//			this.availableTreeId=treeNew.id;
		},
		
		reloadAvailableTree : function() {
			var tree = dijit.byId(this.availableTreeId);
			var childDiv = domConstruct.create('div',{},tree.domNode.parentNode);
			var newTreeParms = {'tabId':tree.tabId,'pageScopeId':tree.pageScopeId,'additionalParams':[tree.getChannelValue(),"isReloadTree"],'style':'overflow: visible;'};
			tree.destroyRecursive(false);
			var treeNew=new ec.fisa.widget.tsc.AvailableOptionsTree(newTreeParms,childDiv);
			this.availableTreeId=treeNew.id;
			tree.modelAllTree = treeNew.model;
			treeNew.startup();
		},
		
		reloadEditableTree : function() {
			var tree = dijit.byId(this.editableTreeId);
			var childDiv = domConstruct.create('div',{},tree.domNode.parentNode);
			var newTreeParms = {'tabId':tree.tabId,'pageScopeId':tree.pageScopeId,'additionalParams':[tree.getChannelValue(),"isReloadTree"],'style':'overflow: visible;'};
			tree.destroyRecursive(false);
			var treeNew=new ec.fisa.widget.tsc.EditableOptionsTree(newTreeParms,childDiv);
			this.editableTreeId=treeNew.id;
			tree.modelAllTree = treeNew.model;
			treeNew.startup();
		},
		
		setSelectedChannelValue : function(component, selected) {
			if(selected == true){
				component.set('selected', 'selected');
			}
		},
		
		setParentTabId : function(parentTabId) {
			this.parentTabId = parentTabId;
		},
		
		setParentPageScopeId : function(parentPageScopeId) {
			this.parentPageScopeId = parentPageScopeId;
		},
		
		setSupportedLanguages : function(supportedLanguages) {
			this.supportedLanguages = supportedLanguages;
		},
		
		setLanguageCode : function(languageCode) {
			this.languageCode = languageCode;
		},
		
		setFoundNodesIdsAsString : function(paths) {
			//Coloca en un string todos los ids de los items encontrados
			var ids = '';
			
			for (var i = 0; i < paths.length; i++) {
				var path = paths[i];
				for (var j = 0; j < path.length; j++) {
					var item = path[j];
					if(ids.indexOf(item) == -1){
						ids = ids + item + '#'; 
					}
				}
			}
			
			return ids;
		}
	});
	return ChannelAppOptionController;
});
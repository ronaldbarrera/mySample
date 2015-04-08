define(
		[ "dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/lang",
				"ec/fisa/controller/BaseController", "ec/fisa/format/Utils",
				"dojo/_base/window", "dojo/dom", "dojox/mvc",
				"ec/fisa/mvc/StatefulModel", "dojox/lang/functional/object",
				"dojo/store/Memory", "dojo/data/ItemFileReadStore",
				"dojo/date/locale", "ec/fisa/navigation/Utils",
				"ec/fisa/dwr/Store", "dojox/widget/DialogSimple",
				"ec/fisa/controller/Utils","ec/fisa/widget/Utils" ],
		function(dojo, declare, lang, BaseController, formatUtils, win, dom,
				mvc, StatefulModel, FisaUtils) {
			var TranslatorController = declare(
					"ec.fisa.controller.tsc.TranslatorController",
					BaseController,
					{
						tiMappingId : null,
						dropAreaSource : null,
						dropAreaTarget : null,
						controllerList : null,
						handlerPropertiesDataGrid : null,
						data : null,
						tabId : null,
						pageScopeId : null,
						model : null,
						cmps : null,
						initData : null,
						breadcrumb : null,
						bindingContentPane : null,
						sourceTargetDataGrid : null,
						propertiesDataGrid : null,
						paneSearcher : null,
						messagesPanel : null,
						translatorInstanceId : null,
						translatorName : null,
						translatorDesc : null,
						translatorId : null,
						translatorSource : null,
						translatorTarget : null,
						local : null,
						contentPanel : null,
						contentPanelProperties : null,
						breadcrumbId : null,
						initMsgs : null,
						lovData : null,
						validador : null,
						sourceQtId : null,
						targetQtId : null,
						sourceComponent : null,
						targetComponent : null,
						propertiesName : null,
						propertiesValor : null,
						disabled : null,
						actionId : null,
						buttonTiMapping : null,
						requiredFieldMessage : null,
						proNameList : null,
						priorityId : null,
						sourceType : null,
						targetType : null,
						expression : null,
						sourceBTApplyTo : null,
						isBTSource : false,
						targetBTApplyTo : null,
						comboSourceApplyToId:null,
						comboTargetApplyToId:null,
						hasMappings:null,
						constructor : function(tabId, pageScopeId, initData,
								lovData, initDataFT) {
							this.initData = initData;
							this.tabId = tabId;
							this.pageScopeId = pageScopeId;
							this.model = {};
							this.cmps = {};
							this.initMsgs = [];
							this.data = initDataFT;
							this.lovData = lovData;
							this.init(initData);
							this.buttonTiMapping = false;
						},
						init : function(data) {

							this.disabled = data.disabled;
							this.translatorId = data.translatorId;
							this.sourceQtId = data.sourceQtId;
							this.targetQtId = data.targetQtId;
							this.validador = data.validador;
							this.actionId = data.actionId;
							this.requiredFieldMessage = data.requiredFieldMessage;
							this.sourceType = data.sourceType;
							this.targetType = data.targetType;
							this.hasMappings = data.hasMappings;
							
							if (this.sourceType == "1"){
								this.isBTSource = true;
							}

							delete data.translatorId;
							delete data.sourceQtId;
							delete data.targetQtId;
							delete data.validador;
							delete data.disabled;
							delete data.actionId;
							delete data.requiredFieldMessage;
							delete data.targetType;
							delete data.sourceType;
							delete data.hasMappings;

							this.model = new StatefulModel({
								data : data
							});
						},
						validarTiMapping : function() {

							this.buttonTiMapping = false;
						},
						cargarTareas : function(tabId, sourceItems,
								targetItems, criteria) {
							this.clearPanelMessage();
							var store = null;

							store = new ec.fisa.dwr.Store(
									'TranslatorControllerDWR', 'viewData',
									this.tabId, this.pageScopeId,
									[ sourceItems, targetItems, criteria ],
									null);

							this.sourceTargetDataGrid.setStore(store);
						},
						cargarTareasProperties : function(tabId, criteria) {
							this.clearPanelMessage();
							var store = null;

							store = new ec.fisa.dwr.Store(
									'TranslatorControllerDWR',
									'viewDataProperties', this.tabId,
									this.pageScopeId, [], null);

							this.propertiesDataGrid.setStore(store);
						},
						saveDropArea : function() {
							//<<Mantis 18025 Punto 7 JCVQ
							//Se asegura de recuperar el valor actual de los combos apply to en fuente y destino.
							this.processApplyToValues();
							//>>
							var sourceItems = null;
							var targetItems = null;
							var criteria = 'true';
							
							if(this.sourceBTApplyTo == null){
								this.sourceBTApplyTo = "1";
							}
							
							if(this.targetBTApplyTo == null){
								this.targetBTApplyTo = "1";
							}
							
							var selectionsSource = dojox.lang.functional
									.keys(this.dropAreaSource.selection);
							var itemsSource = dojox.lang.functional
									.keys(this.dropAreaSource.map);

							var itemIdSource = selectionsSource[0];

							if (itemsSource.length > 0) {
								dojo
										.forEach(
												itemsSource,
												function(item) {
						if (item == itemIdSource) {

														var sourceTemp = this.dropAreaSource.map[itemIdSource];
														sourceItems = sourceTemp.data.id;
														/*if(this.btApplyTo == "1"){
															sourceItems = sourceItems.substring(sourceItems.lastIndexOf('-')+1);
														}*/
													}
												}, this);

							}

							var selectionsTarjet = dojox.lang.functional
									.keys(this.dropAreaTarget.selection);
							var itemsTarget = dojox.lang.functional
									.keys(this.dropAreaTarget.map);

							var itemIdTarget = selectionsTarjet[0];

							if (itemsTarget.length > 0) {
								dojo
										.forEach(
												itemsTarget,
												function(item) {
													if (item == itemIdTarget) {

														var targetTemp = this.dropAreaTarget.map[itemIdTarget];
														targetItems = targetTemp.data.id;
													}
												}, this);

							}

							var callObj = {
								callbackScope : this
							};
							callObj.callback = function(outcome) {
								this.clearPanelMessage();
								if(outcome.wAxn=="error"){
									//Se guarda el id del panel de mensajes del tab principal
									var principalMessagesPanelId = this.messagesPanelId;
									//Se usa el id del panel de mensajes del tab de mapeos
									this.messagesPanelId = this.mappingMessagesPanelId;
									//Se actualizan los mensajes en la pantalla de mapeos
									this.updateMsgsPanel(outcome.aMsgs);
									//Se vuelve a restaurar el id del panel de mensajes del tab principal
									this.messagesPanelId = principalMessagesPanelId;
									return;
								}
								this.cargarTareas(this.tabId, sourceItems,
										targetItems, criteria);
							};
							callObj.errorHandler = this.errorHandler;

							if (sourceItems != null && targetItems != null) {
								if (sourceItems == "COMMONS|EXPRESSION") {
									sourceItems = sourceItems + "|" + this.expression;
								}
								TranslatorControllerDWR.saveHomeLayout(this.tabId, this.pageScopeId, 
										[sourceItems, targetItems, criteria, this.translatorInstanceId, this.translatorId, this.sourceType, this.targetType, this.sourceBTApplyTo,this.targetBTApplyTo],
										callObj);

							} else {

								alert('Ingresar valores para proceder a agregar');
							}

						},
						deleteRegistro : function() {

							var criteria = 'true';

							var selectionGrid = this.sourceTargetDataGrid.selection
									.getSelected();

							var callObj = {
								callbackScope : this
							};
							callObj.callback = function(outcome) {
								this.clearPanelMessage(); 
								this.cargarTareas(this.tabId, null, null,
										criteria);
							};
							callObj.errorHandler = this.errorHandler;

							TranslatorControllerDWR.deleteHomeLayout(this.tabId, this.pageScopeId,
									selectionGrid, callObj);

						},
						destroy : function() {

							this.inherited(arguments);
							delete this.dropAreaSource;
							delete this.dropAreaTarget;
						},
						bindDropAreaSource : function(dropAreaSource) {
							this.dropAreaSource = dropAreaSource;
						},
						bindDropAreaTarget : function(dropAreaTarget) {
							this.dropAreaTarget = dropAreaTarget;
						},
						openTiMapping : function() {
							this.processApplyToValues();
							if(this.sourceType == '1'){
								var val = {field: "Campos de origen se aplican a", value : this.sourceBTApplyTo};
								if(this.validateFields([val])){
									return;
								}	
							}
							
							if(this.targetType == '1'){
								var val = {field: "Campos de destino se aplican a", value : this.targetBTApplyTo};
								if(this.validateFields([val])){
									return;
								}
							}
							
							var newSubTabPaneArg = {};
							newSubTabPaneArg.title="Mapping";
							newSubTabPaneArg.iconClass="breadcrumbIcon";
							newSubTabPaneArg.href='./static/tsc/fragment/tiMapping.jsp';
							newSubTabPaneArg.ioArgs = {
								content : {
									'FISATabId' : this.tabId,
									'FisaPageScopeId' : this.pageScopeId,													
									'actionId' : this.actionId,
									'showSourceApplyTo':this.verifyShowApplyTo(this.sourceType),
									'showTargetApplyTo':this.verifyShowApplyTo(this.targetType)
								}
							};
							newSubTabPaneArg.ioMethod = dojo.xhrPost;
							var ctrler=ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
							ec.fisa.navigation.utils.openNewBreadCrumb(newSubTabPaneArg,ctrler.breadcrumbId);
						},
						closeTiMapping : function() {
							//this.contentPanel.destroy();
							var callObj = {
								callbackScope : this
							};
							callObj.callback = function(outcome) {
								this.clearPanelMessage();
								ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
							};
							callObj.errorHandler = this.errorHandler;
							TranslatorControllerDWR.cancelTiMapping(this.tabId, this.pageScopeId, callObj);
						},
						closeTI : function(isSequence) {

							var callObj = {
								callbackScope : this
							};
							callObj.callback = function(outcome) {
								this.clearPanelMessage(); 
								if (this.isSequence != null
										&& this.isSequence == "true") {
									ec.fisa.navigation.utils
											.closeSequenceBreadCrumb(this.breadcrumbId);
								} else {
									ec.fisa.navigation.utils
											.closeCurrentBreadCrumb(this.breadcrumbId);
								}
							};
							callObj.errorHandler = this.errorHandler;

							TranslatorControllerDWR.cancelTI(this.tabId,
									this.pageScopeId, callObj);

						},
						saveTI : function(isSequence) {
							//<<Mantis 18025 Punto 7 JCVQ
							//Se asegura de recuperar el valor actual de los combos apply to en fuente y destino.
							this.processApplyToValues();
							//>>
							var translatorIdVal = {field: "_Id", value : this.translatorInstanceId};
							var translatorInsVal = {field: "_Transformador", value : this.translatorId};
							
							if(this.validateFields([translatorIdVal, translatorInsVal])){
								return;
							}
							
							if(this.sourceType == '1'){
								var val = {field: "Campos de origen se aplican a", value : this.sourceBTApplyTo};
								if(this.validateFields([val])){
									return;
								}	
							}
							
							if(this.targetType == '1'){
								var val = {field: "Campos de destino se aplican a", value : this.targetBTApplyTo};
								if(this.validateFields([val])){
									return;
								}
							}
							
							var callObj = {
								callbackScope : this
							};
							callObj.callback = function(outcome) {

								if (outcome.validadorId) {

									this.showMessages(outcome);
								} else {

									this.clearPanelMessage(); 
									if (this.isSequence != null
											&& this.isSequence == "true") {
										ec.fisa.navigation.utils
												.closeSequenceBreadCrumb(this.breadcrumbId);
									} else {
										ec.fisa.navigation.utils
												.closeCurrentBreadCrumb(this.breadcrumbId);
									}
								}
								
							};
							TranslatorControllerDWR.saveTranslatorInstance(
									this.tabId, this.pageScopeId, [
											this.translatorInstanceId,
											this.translatorName,
											this.translatorDesc,
											this.translatorId,
											this.translatorSource,
											this.translatorTarget,
											this.local,
											this.sourceBTApplyTo,
											this.targetBTApplyTo], callObj);

						},
						saveTiMapping : function() {

							var callObj = {
								callbackScope : this
							};
							callObj.callback = function(outcome) {
								this.clearPanelMessage(); 
								//this.contentPanel.destroy();
								ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
								
								var ctrler=ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
								ctrler.hasMappings = outcome.hasMappings;
								ctrler.processHasMappings();
							};
							callObj.errorHandler = this.errorHandler;

							TranslatorControllerDWR.saveTiMapping(this.tabId, this.pageScopeId, callObj);
						},
						setMessagesPanel : function(messagesPanel) {
							this.inherited(arguments);
							if (typeof this.breadcrumbId === 'undefined'
									|| this.breadcrumbId == null) {
								this.breadcrumbId = messagesPanel.getParent()
										.getParent().getParent().id;
							}
							this.updateMsgsPanel(this.initMsgs);
							this.btContentPaneId = messagesPanel.getParent()
									.getParent().id;
							delete this.initMsgs;
						},
						addParamToModel : function(component) {

							var eid = component["bt-id"];
							var fid = component["field-id"];

							var field = null;
							if (this.data && this.data[eid]
									&& this.data[eid].dataMessage) {
								field = this.data[eid].dataMessage.fields[fid];
							}
							if (field == null) {
								field = {
									value : '',
									complement : null
								};
								component._fStarted = true;
							} else if (field.value == null) {
								field.value = "";
								component._fStarted = true;
							}

							if (this.disabled) {

								component.set('disabled', this.disabled);
								field.enabled = false;
							}

							if (fid === 'EFP-TTSC_TRANSLATOR_INSTANCE-TRANSLATOR_INSTANCE_ID') {

								if (this.actionId === 'UP') {

									component.set('disabled', this.disabled);
									field.enabled = false;
								}

								this.translatorInstanceId = field.value;
							} else if (fid === 'EFP-TTSC_TRANSLATOR_INSTANCE-NAME') {

								this.translatorName = field.value;
							} else if (fid === 'EFP-TTSC_TRANSLATOR_INSTANCE-DESCRIPTION') {

								this.translatorDesc = field.value;
							} else if (fid === 'EFP-TTSC_TRANSLATOR_INSTANCE-TRANSLATOR_ID') {

								if (this.actionId === 'UP') {

									component.set('disabled', this.disabled);
									field.enabled = false;
								}

								this.translatorId = field.value;
							}else if (fid === 'EFP-TTSC_TRANSLATOR_INSTANCE-LOCAL') {
								this.local = field.value;
							} 
							
							else if (fid === 'EFP-TTSC_TRANSLATOR_INSTANCE-SOURCE') {

								this.translatorSource = field.value;
								this.sourceComponent = component;

								if (this.translatorSource == null) {

									component.set('disabled', true);
									field.enabled = false;
								}
								
								if (!this.disabled && (this.translatorSource != null && this.translatorSource.length != 0
										&& this.translatorTarget != null && this.translatorTarget.length != 0)) {
									this.buttonTiMapping = true;
								}
								
							} else if (fid === 'EFP-TTSC_TRANSLATOR_INSTANCE-TARGET') {

								this.translatorTarget = field.value;
								this.targetComponent = component;

								if (this.translatorTarget == null) {

									component.set('disabled', true);
									field.enabled = false;
								}
								
								if (!this.disabled && (this.translatorSource != null && this.translatorSource.length != 0
										&& this.translatorTarget != null && this.translatorTarget.length != 0)) {
									this.buttonTiMapping = true;
								}
							}else if(fid == 'EFP-TTSC_TRANSLATOR_INSTANCE-SOURCE_APPLIES_TO'){
								if(this.sourceType == "1" && (field.value == null || field.value == "" || typeof field.value == 'undefined')){
									//Si ingresa por aquí se trata de una edición de un transformador que se creó con la versión anterior del administrador de instancias de transformadores.
									//Por defecto los campos de origen se aplican por aplicación
									field.value = "1";
									this.sourceBTApplyTo = field.value;
								}else {
									this.sourceBTApplyTo = field.value;
								}
								this.processHasMappings();
							}else if (fid == 'EFP-TTSC_TRANSLATOR_INSTANCE-TARGET_APPLIES_TO'){
								if(this.targetType == "1" && (field.value == null || field.value == "" || typeof field.value == 'undefined')){
									//Si ingresa por aquí se trata de una edición de un transformador que se creó con la versión anterior del administrador de instancias de transformadores.
									//Por defecto los campos de destino se aplican por aplicación
									field.value = "1";
									this.targetBTApplyTo = field.value;
								}else{
									this.targetBTApplyTo = field.value;
								}
								this.processHasMappings();
							}

							if (this.model.contains(eid)) {
								// if exists yet updates new value.
								if (this.model.contains([ eid, 'dataMessage',
										'fields', fid ])) {
									this.model.setValue([ eid, 'dataMessage',
											'fields', fid, 'value' ],
											field.value, false);
								}
							} else {
								var formater = null;
								if (component instanceof ec.fisa.widget.DateTextBox) {
									formater = ec.fisa.format.utils.formatLongDate;
								}
								this.model.appendObject([ eid, 'dataMessage',
										'fields', fid, 'value' ], field.value,
										component.id, 'value', formater, true);

								var enabled = null;
								if (field.enabled != undefined) {
									enabled = field.enabled;
								}
								this.model.appendObject([ eid, 'dataMessage',
										'fields', fid, 'enabled' ], enabled,
										component.id, 'enabled', null, false);

								if (component.hasCompl) {
									this.model.appendObject([ eid,
											'dataMessage', 'fields', fid,
											'complement' ], field.complement,
											component.id, 'complement', null,
											false);
								}
							}
						},
						containsFieldModel : function(eid, fid) {
							return this.model.contains([ eid, 'dataMessage',
									'fields', fid, 'value' ]);
						},
						getFieldModel : function(eid, fid) {
							return this.model.getValue([ eid, 'dataMessage',
									'fields', fid, 'value' ]);
						},
						setFieldModelValue : function(eid, fid, value) {
							this.model.setValue([ eid, 'dataMessage', 'fields',
									fid, 'value' ], value, false);

							if (fid === 'EFP-TTSC_TRANSLATOR_INSTANCE-TRANSLATOR_ID') {

								this.translatorId = value;

								this.updateTranslatorId();

							} else if (fid === 'EFP-TTSC_TRANSLATOR_INSTANCE-SOURCE') {

								this.translatorSource = value;
								
								if (this.translatorSource != null && this.translatorSource.length != 0
										&& this.translatorTarget != null && this.translatorTarget.length != 0) {
									this.buttonTiMapping = true;
								}
							} else if (fid === 'EFP-TTSC_TRANSLATOR_INSTANCE-TARGET') {

								this.translatorTarget = value;
								
								if (this.translatorSource != null && this.translatorSource.length != 0
										&& this.translatorTarget != null && this.translatorTarget.length != 0) {
									this.buttonTiMapping = true;
								}
							}
						},
						/** updates the mvc with the enabled attribute. */
						setFieldModelEnabled : function(
								/* String businesstemplate id */btId,/*
																	 * String
																	 * fieldId
																	 */
								fid,/* boolean */value) {
							this.model.setValue([ btId, 'dataMessage',
									'fields', fid, 'enabled' ], value, false);
						},

						setFieldModelComplement : function(eid, fid, complement) {
							this.model.setValue([ eid, 'dataMessage', 'fields',
									fid, 'complement' ], complement);
						},
						getFieldModelComplement : function(eid, fid) {
							return this.model.getValue([ eid, 'dataMessage',
									'fields', fid, 'complement' ]);
						},
						updateTranslatorId : function() {
							
							var eids = this.sourceComponent["bt-id"];
							var fids = this.sourceComponent["field-id"];
							
							var eidt = this.targetComponent["bt-id"];
							var fidt = this.targetComponent["field-id"];
							
							var callObj = {
								callbackScope : this
							};
							callObj.callback = function(outcome) {
								this.clearPanelMessage();

								this.sourceComponent["qt-id"] = outcome.sourceQtId;
								this.targetComponent["qt-id"] = outcome.targetQtId;
								this.sourceType = outcome.sourceType;
								this.targetType = outcome.targetType;
								if(this.sourceType == '1'){
									ec.fisa.widget.utils.enableWidget(this.comboSourceApplyToId);
									this.setFieldModelEnabled(eids, fids, true);
								}else{
									ec.fisa.widget.utils.disableWidget(this.comboSourceApplyToId);
									this.setFieldModelValue('EFP_TSC_TIS_NFIS0000', 'EFP-TTSC_TRANSLATOR_INSTANCE-SOURCE_APPLIES_TO', '');
								}
								
								if(this.targetType == '1'){
									ec.fisa.widget.utils.enableWidget(this.comboTargetApplyToId);
									this.setFieldModelEnabled(eids, fids, true);
								}else{
									ec.fisa.widget.utils.disableWidget(this.comboTargetApplyToId);
									this.setFieldModelValue('EFP_TSC_TIS_NFIS0000', 'EFP-TTSC_TRANSLATOR_INSTANCE-TARGET_APPLIES_TO', '');
								}
								
								if  (outcome.hasQtSource) {
									this.sourceComponent.set('disabled', false);
									this.setFieldModelEnabled(eids, fids, true);
								}
								
								if  (outcome.hasQtTarget) {
									this.targetComponent.set('disabled', false);
									this.setFieldModelEnabled(eidt, fidt, true);
								}
								
								this.cargarTareasProperties(this.tabId, null);
								this.setFieldModelValue('EFP_TSC_TIS_NFIS0000', 'EFP-TTSC_TRANSLATOR_INSTANCE-SOURCE', '');
								this.setFieldModelValue('EFP_TSC_TIS_NFIS0000', 'EFP-TTSC_TRANSLATOR_INSTANCE-TARGET', '');
							};
							callObj.errorHandler = this.errorHandler;

							TranslatorControllerDWR.updateTranslatorId(this.tabId, this.pageScopeId,
									this.translatorId, null, callObj);
						},
						bindToModel : function(/* widget */component,/* String */
								modelProp, /* boolean */disabled) {
							//console.log("modelProp [" + modelProp + "]");
							var modelData = this.data[modelProp];

							if (modelData === undefined || modelData == null) {
								modelData = "";
							}

							var stf = new dojox.mvc.StatefulModel({
								data : modelData
							});
							// this.model.add(modelProp, stf);
							component.set("ref", this.model[modelProp]);
							component.set('disabled', disabled);
						},
						saveProperties : function() {

							var criteria = true;

							var callObj = {
								callbackScope : this
							};
							callObj.callback = function(outcome) {
								this.clearPanelMessage(); 
								this.contentPanelProperties.destroy();
								this.cargarTareasProperties(this.tabId,
										criteria);
							};
							callObj.errorHandler = this.errorHandler;

							
							if ((this.propertiesName != null && this.propertiesName.length > 0) &&
								(this.propertiesValor != null && this.propertiesValor.length > 0)) {
								if(this.propertiesName != '-1'){
									TranslatorControllerDWR.saveProperties(this.tabId, this.pageScopeId, 
											this.propertiesName, this.propertiesValor, [this.translatorInstanceId, this.translatorId],
											callObj);
								}else{
									alert('Seleccionar un nombre de propiedad para continuar...');
								}
							} else {
								
								alert('Ingresar valores para proceder a agregar');
							}							
						},
						eliminarProperties : function() {

							var criteria = true;

							var selectionGrid = this.propertiesDataGrid.selection
									.getSelected();

							var callObj = {
								callbackScope : this
							};
							callObj.callback = function(outcome) {
								// this.clearPanelMessage; //operaciones
								this.cargarTareasProperties(this.tabId,
										criteria);
							};
							callObj.errorHandler = this.errorHandler;

							TranslatorControllerDWR.eliminarProperties(this.tabId, this.pageScopeId, 
									selectionGrid, callObj);
						},
						// métodos para cargar tiMapping
						openTiProperties : function() {

							this.clearPanelMessage();

							if ((this.translatorInstanceId != null && this.translatorInstanceId.length == 0)
									|| (this.translatorId != null && this.translatorId.length == 0)) {
								
								return;
							} 
							
							var callObj = {
									callbackScope : this
								};
								callObj.callback = function(outcome) {	
									
									this.proNameList = outcome.proNameList
									this.priorityId = outcome.priorityId;
									
									this.contentPanelProperties = new dojox.widget.DialogSimple(
											{
												// i can call this.titleDlg cause the
												// scope previously inserted.
												title : 'Transformador Properties',
												href : './static/tsc/fragment/tiProperties.jsp',
												ioArgs : {
													content : {
														FISATabId : this.tabId,
														FisaPageScopeId : this.pageScopeId
													}
												},
												ioMethod : dojo.xhrPost
											});
									this.contentPanelProperties.show();									
									
								};
								callObj.errorHandler = this.errorHandler;

								TranslatorControllerDWR.getComboPropertiesName(null, this.translatorId,this.tabId, callObj);
							
						},
						closeTiProperties : function() {

							this.contentPanelProperties.destroy();
							this.clearPanelMessage();
							
						},
						deshabilitar : function(commponent) {

							if (this.disabled) {

								component.set('disabled', this.disabled);
							}
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
						
						validateFields : function(evalValues) {
							var level = new Object();
							level.level = 40000;			
							var errorMsg = {};
							errorMsg["level"] = level;
							errorMsg["summary"] = this.requiredFieldMessage["I18N_REQUIRED_FIELDS"];
							
							dojo.forEach(evalValues, function(values){
								if((typeof values.value === "undefined") || (values.value == "") || (values.value == "-1")){
									if(typeof errorMsg["detail"] !== "undefined"){
										errorMsg["detail"] = errorMsg["detail"] + " * " + this.requiredFieldMessage[values.field]; 	
									} else{
										errorMsg["detail"] = "* "+values.field;
									}
								}
							},this);
							
							if(typeof errorMsg["detail"] !== "undefined"){
								var messagesPanel = dijit.byId(this.messagesPanelId);
								messagesPanel.clearAllMessages();
								this.updateMsgsPanel([errorMsg]);
								//Retorna true si hubo mensajes
								return true;
							}
							
							//Retorna false si no hubo mensajes
							return false;
						}, limpiarTranslator : function() {
							
							var callObj = {
								callbackScope : this
							};
							callObj.callback = function(outcome) {
								this.clearPanelMessage(); 
								this.cargarTareasProperties(this.tabId, null);
								this.setFieldModelValue('EFP_TSC_TIS_NFIS0000', 'EFP-TTSC_TRANSLATOR_INSTANCE-SOURCE', '');
								this.setFieldModelValue('EFP_TSC_TIS_NFIS0000', 'EFP-TTSC_TRANSLATOR_INSTANCE-TARGET', '');
							};
							callObj.errorHandler = this.errorHandler;
							
							TranslatorControllerDWR.limpiarTranslator(this.tabId, this.pageScopeId, callObj);
						},
						onBlurExpression : function(textarea) {
							this.expression = textarea.get("value");
						},
						processApplyToValues : function(){
							var comboSourceApplyTo = dijit.byId(this.comboSourceApplyToId);
							if(comboSourceApplyTo && lang.isFunction(comboSourceApplyTo.get)){
								this.sourceBTApplyTo = comboSourceApplyTo.get("value");
							}
							
							var comboTargetApplyTo = dijit.byId(this.comboTargetApplyToId);
							if(comboTargetApplyTo && lang.isFunction(comboTargetApplyTo.get)){
								this.targetBTApplyTo = comboTargetApplyTo.get("value");
							}
						},
						initApplyToOptions:function(component, fieldNameForApplyTo){
							component.set("options",this._getListOfOptions());
							this[fieldNameForApplyTo] = component.get("id");
						},
						_getListOfOptions:function(){
							var listOfOptions = [];
							listOfOptions[0] = {value : "" , label : dojo.config.fisaSelectLabel, selected:true};
							listOfOptions[1] = {value : "1" , label : "Aplicación"};
							listOfOptions[2] = {value : "2" , label : "BT"};
							return listOfOptions;
						},
						getLabel:function(value, component){
							var outcome = '';
							var options = this._getListOfOptions();
							if(value && '' != value){
								dojo.forEach(options, function(item, index){
									if(value == item.value){
										outcome = item.label;
									}
								});
							}
							component.set("value", outcome);
							return outcome;
						},
						verifyShowApplyTo:function(applyTo){
							return applyTo == '1';
						},
						processHasMappings:function(){
							 hasMappings = this.hasMappings
							if((this.actionId == 'IN' || this.actionId == 'UP') && '1' == this.sourceType && hasMappings == false){
								ec.fisa.widget.utils.enableWidget(this.comboSourceApplyToId);
							}else{
								ec.fisa.widget.utils.disableWidget(this.comboSourceApplyToId);
							}
							
							if((this.actionId == 'IN' || this.actionId == 'UP') && '1' == this.targetType && hasMappings == false){
								ec.fisa.widget.utils.enableWidget(this.comboTargetApplyToId);
							}else{
								ec.fisa.widget.utils.disableWidget(this.comboTargetApplyToId);
							}
						},
						setMappingMessagesPanel:function(mappingMessagesPanel){
							this.mappingMessagesPanelId = mappingMessagesPanel.id;
						}
					});
			return TranslatorController;
		});
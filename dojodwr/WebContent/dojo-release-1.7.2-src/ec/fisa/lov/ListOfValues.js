define([
		"dojo/_base/declare",
		"dojo/_base/connect",
		"dojo/_base/lang",
		"dojo/dom-attr",
		"dojo/dom-style",
		"dojo/dom-class",
		"dojo/dom-geometry",
		"dojo/on",
		"dijit/focus",
		"dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin",
		"dojo/text!ec/fisa/lov/templates/ListOfValues.html",
		"dijit/form/Button",
		"dijit/form/TextBox",
		"ec/fisa/widget/Utils",
		"ec/fisa/widget/OutputText",
		"ec/fisa/controller/custom/BtController",
		"ec/fisa/controller/custom/QtController",
		"ec/fisa/dwr/proxy/EventActionDWR"
		], function(declare, connect, lang, domAttr,domStyle,domClass, domGeometry, on, focusUtil, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, fisaListOfValuesTemplate, Button, TextBox, widgetUtils){
	return declare("ec.fisa.lov.ListOfValues", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		_textBox:null,
		_button:null,
		_complementNode:null,
		_readOnlyExpr:"",
		_readOnlyExprButton:"",
		_initialValue:"",
		readOnly:false,
		editable:false,
		description:"",
		selectLabel:"",
		selectLabelOrig:"",
		hasFieldRoutineOrPolicy:null,
		templateString: fisaListOfValuesTemplate,
		hasCompl:true,
		textboxBaseClass:'dijitTextBox',
		selectIconClass:'magnifierIcon',
		selectBaseClass:'fisaLov',
		complementBaseClass:'fisaLink',
		maxLength:-1,
		_maxLengthExp:"",
		qtTitle: "",
		textTransform: "",
		_dojoProps : "trim:true",
		parentEditableGrid:false,
		gridId:"",
		//only came when its called from a multiregister
		gridSelectedRowIndex:null,
		onChangeTextBoxConnect:null,
		parentType:"",
		_fromSelection:false,
		tabIndexField:null,
		_tabIndex:0,
		_buttonId:'',
		_destroyOnRemove: true,
		visualSize:-1,
		btPos:0,
		actionMode:"",
		gridRealRowIndex:null,
		numeric:false,
		listOfValuesConfig:dojo.fromJson(dojo.cache("skin","Widget.conf")).ListOfValues,
		postMixInProperties:function(){
			this.inherited(arguments);

			if(this.editable == false){
				this._readOnlyExpr="disabled";
				this.selectBaseClass="fisaLovOnlySelect";
			}

			if(this.readOnly == true){
				this._readOnlyExpr="disabled";
				this._readOnlyExprButton="disabled";
				this.selectBaseClass="fisaLovDisabled";
			}
			if(this.maxLength>=0){
				this._maxLengthExp="maxLength='"+this.maxLength+"'";
			}

			var cntrlr = this.getController();
			this._initialValue="value='";
			if(this.parentEditableGrid){
				this._initialValue+=this['initial-value'];
				delete this['initial-value'];
			}else{
				var _val =cntrlr.obtainInitialValue(this);
				if(_val!=null){
					this._initialValue+=_val;
				}
			}
			this._initialValue+="'";
			if(this.readOnly){
				this.selectLabelOrig = this.selectLabel;
				this.selectLabel="";
			}
			if(this.textTransform=="1"){
				this._dojoProps+=", uppercase:true ";
			}else if (this.textTransform=="2"){
				this._dojoProps+=", lowercase:true ";	
			}else if (this.textTransform=="3"){
				this._dojoProps+=", propercase:true ";
			}
			
			if(this.numeric==true){
				this.textboxBaseClass+=' dijitTextBoxAlignRight';
			}
			
			if(this.tabIndexField != null){
				this._tabIndex = this.tabIndexField;
			}
		},
		
		destroy: function() {
			ec.fisa.widget.utils.destroyMultiregisterWidget(this);
			this.inherited(arguments);
		},
		postCreate: function(){
			this.inherited(arguments);
			if(this._textBox){
				this._textBox.connect(this._textBox,"onChange", dojo.hitch(this,this._onTextBoxBlur));
				this.connect(this._button,"onClick", this._onButtonClick);
			}
			
			this._buttonId=this.id+'_button';
		},
		buildRendering : function() {
			this.inherited(arguments);
			var visualSizeAttr = null;
			
			if(this.visualSize>=0){
				visualSizeAttr = this.visualSize;
			}
			else{
				visualSizeAttr = this.listOfValuesConfig[dojo.config.fisaTheme].defaultVisualSize;
			}
			
			var fw =this.listOfValuesConfig[dojo.config.fisaTheme].textCharWidth*visualSizeAttr;
			if(fw>=(this.listOfValuesConfig[dojo.config.fisaTheme].buttonWidth*1.5)){
				fw -=this.listOfValuesConfig[dojo.config.fisaTheme].buttonWidth;
			}
			fw +=this.listOfValuesConfig[dojo.config.fisaTheme].padding;
			//fix to avoid spaces in multiregisters
			if(this.parentEditableGrid == true && this.tdParentWidth != null){
				if(fw < this.tdParentWidth){
					fw = this.tdParentWidth - this.listOfValuesConfig[dojo.config.fisaTheme].gridOffset;
				}
			}
			if(this._textBox){
				this._textBox.domNode.style.width=fw+'px';
				
				if(this.textTransform=="1"){
					this._textBox.textbox.style.textTransform = "uppercase";
				}
				if(this.numeric==true){
					this._textBox.textbox.style.textAlign="right";
				}
			}
			if(this.parentEditableGrid == true && this._complementNode){
				this._complementNode._componentNode.style.display="none";
			}
			
		},
		startup: function(){
			this.inherited(arguments);
			domStyle.set(this.domNode, "visibility", "");
			if(this.parentEditableGrid === false){
				//Solo se ejecuta si el lov no esta en un grid editable
				//Cuando esta en un multiregistro debe hacer binding al modelo del grid al que pertenece, ver getMRComponent en ec.fisa.grid.Utils
				var cntrlr = ec.fisa.controller.utils.getPageController(this["fisa-tab-id"],this["fisa-page-scope-id"]);
				if(lang.isFunction(cntrlr.addParamToModel)){
					cntrlr.addParamToModel(this);
				}
			}
		},
		_onButtonClick:function(){
			if(this.parentType=="BT" || this.parentType == "BT_HOLD"){
				var fisaTabId = this["fisa-tab-id"];
				var fisaPageScopeId = this["fisa-page-scope-id"];
				var btId = this["bt-id"];
				var fieldId = this["field-id"];
				var cntrlr = ec.fisa.controller.utils.getPageController(fisaTabId,fisaPageScopeId);
				var callObj={callbackScope:this,
						callback:this._onButtonClickHandler,
						errorHandler:dojo.hitch(this,cntrlr.errorHandler)};
				var ftms=cntrlr.model.toPlainObject();
				if(this.parentEditableGrid === true){
					var grid= dijit.byId(this.gridId);
					EventActionDWR.handleLaunchQueryActionLovMultiregister(fisaTabId,fisaPageScopeId, btId, grid.entId, fieldId, this.btPos, ftms,
					this.actionMode,this.gridRealRowIndex,callObj);
				}else{
					EventActionDWR.handleLaunchQueryActionLov(fisaTabId,fisaPageScopeId, btId, fieldId, this.btPos, ftms,
					this.actionMode,callObj);
				}
			}else{
				var outcome ={};
				outcome.wAxn = "open";
				this._onButtonClickHandler(outcome);
			}
		},
		/**Callback function called after dwr on clicked button on lov.*/ 
		_onButtonClickHandler:function(outcome){
			var controller = this.getController();
			controller.clearPanelMessage();
			
			if(outcome.wAxn == "error"){
				controller.updateMsgsPanel(outcome.aMsgs);
			}
		else if(outcome.wAxn == "open"){

				var qtId = this["qt-id"];
				var btId = this["bt-id"];
				var fieldId = this["field-id"];
				var fisaTabId = this["fisa-tab-id"];
				var fisaPageScopeId = this["fisa-page-scope-id"];
				var height = this["lov-height"];
				var width = this["lov-width"];
				var lovInfoMode = this["lov-info-mode"];
				
				var qtTitle = "[" + this["qtTitle"] + "]";
				var qtHref = dojo.config.fisaContextPath+"/ITEM_QUERY_TEMPLATE/";
				qtHref+= qtId;
				//if(this.parentEditableGrid === true){
				qtHref+= "/FISATabId/";
				qtHref+= fisaTabId;
				//}
				qtHref+= "/doLayout/false/content.jsp";
				var lovId = btId + "_" + fieldId + "_fisaLov";
				var qtParams = {content:{parentFisaTabId:fisaTabId, parentFisaPageScopeId:fisaPageScopeId, parentBtId:btId, parentWidgetId:this.id, parentResourceType:this.parentType, parentFieldId:fieldId, islov:true}};
				if(this.parentEditableGrid === true){
					//Esto es procesado en qtContainer.jsp
					qtParams.content.isLovFromEditableGrid = true;
					var controller = this.getController();
					controller.dojoFromLovId = this.id;
				}
				
				if(lovInfoMode == true || lovInfoMode == "true"){
					qtParams.content.lovInfoMode = true;
				}
				
				var dialogArgs= {resizeOnLoad:false,id:lovId, title:qtTitle, href:qtHref, executeScripts:true, ioArgs:qtParams, ioMethod:dojo.xhrPost};
				var dialogStyle=ec.fisa.controller.utils.getGlobalModalSize(0.90);
				if (height&&height<dialogStyle.h) {
					dialogStyle.h=height;
				}
				if (width&&width<dialogStyle.w) {
					dialogStyle.w=width;
				}
				dialogArgs.style="height:"+dialogStyle.h+"px;width:"+dialogStyle.w+"px;";
				var controller = ec.fisa.controller.utils.getPageController(fisaTabId, fisaPageScopeId);
				var modalParentId = null;
				if(controller.declaredClass =='ec.fisa.controller.custom.QtController'){
					var  isLov = controller.isLovModal;
					if(isLov==true){
						modalParentId = this.getParent().getParent().getParent().id;
						//console.debug('modal parent id : ' +modalParentId);
						var  w = dijit.byId(modalParentId);
						//console.debug('setting child id: ' +lovId);
						w._childId = lovId;

					}
				}
				
				var lov = new dojox.widget.DialogSimple(dialogArgs);
				lov.modalParentId= modalParentId;
				lov.resizeContainerNode=this._resizeContainerNode;


				lov.connect(lov,"onHide",function(a){
					var destroyLovContent = true;
					var childId = this._childId;
					if(childId!=null && childId!=undefined){
						var c =   dijit.byId(childId);
						if(c){
							destroyLovContent=false;
						}			

					}
					if(destroyLovContent==true){
						this.closeF();
					}
					return false;			


				});
				lov.closeF=function(){
					var _modalParentId = this.modalParentId;
					this.destroyRecursive(false);
					if(_modalParentId!=null){
						var w = dijit.byId(_modalParentId);
						w.show();
						w.resizeContainerNode(w,w.dialogStyle);
					}
				};
				lov.show();
				this._resizeContainerNode(lov,dialogStyle);
				lov.dialogStyle=dialogStyle;
			}
			
			
		},
		_resizeContainerNode:function(lovDialog,dialogStyle){
			var titleDim=domGeometry.getMarginBox(lovDialog.titleNode);
			domStyle.set(lovDialog.containerNode, "height", (dialogStyle.h-titleDim.h-(titleDim.t*4))+"px");
			//JG: Correccion de incidente mantis 17040
			domStyle.set(lovDialog.containerNode, "width", (dialogStyle.w-this.listOfValuesConfig[dojo.config.fisaTheme].dialogWidthOffset)+'px');
			//JG: Fin correccion de incidente mantis 17040
			domStyle.set(lovDialog.containerNode, "display", "block");
			domStyle.set(lovDialog.containerNode, "overflowY", "auto");
			domStyle.set(lovDialog.containerNode, "overflowX", "auto");
			domClass.add(lovDialog.containerNode,"lovContentPane");
		},
		//either on change directly on the text box or clicked on the button then returned pass by this method
		//and do the routines
		_onTextBoxBlur:function(){
			var btId = this["bt-id"];
			var fieldId = this["field-id"];
			var fisaTabId = this["fisa-tab-id"];
			var fisaPageScopeId = this["fisa-page-scope-id"];
			var callObj = {
					callbackScope : this
			};
			callObj.errorHandler = dojo.hitch(this,this.errorHandler);
			callObj.callback = this._executeAutoLovCallback;
			var fc = this.getController();
			var messagesPanel = dijit.byId(fc.messagesPanelId);
			messagesPanel.clearAllMessages();
			if(fc.model!=null){
				fc.model.clearAllMessages();
			}
			var qtBt="BT";
			var actionLov=null;
			var qtfm = null;
			var btfm = fc.model.toPlainObject();
			if(fc instanceof ec.fisa.controller.custom.QtController){
				qtfm = btfm;
				btfm = null;
				qtBt = "QT";
				actionLov = this["action-lov"]||null;
			};
			var qtId = this["qt-id"];
			var gridFieldId=null;
			var gridModel = null;
			var fisaEditableDirectGrid = false;
			if(this.parentEditableGrid){
				gridFieldId=this.entityMrId;
				var grid = dijit.byId(this.gridId);
				if(grid.fisaEditableDirectGrid == true){
					fisaEditableDirectGrid = true;
				}else{
					gridModel = grid.model.toPlainObject();
				}
			}
			EventActionDWR.loadDataLovTextBoxBlur(fisaTabId,fisaPageScopeId,btId,fieldId,qtBt,qtId,qtfm,btfm,actionLov,gridFieldId,this.gridRealRowIndex,this.hasFieldRoutineOrPolicy,gridModel,fisaEditableDirectGrid,callObj);
		},
		
		/*
		textBoxBlurCallBack:function(outcome){
			var fc = this.getController();
			if (fc!=null&&((this._fromSelection==true&&this.hasFieldRoutineOrPolicy)||(this._fromSelection==false))) {
				var eid = this["bt-id"];
				var fid = this["field-id"];
				var lovData = fc.lovData[eid][fid];
				if (lovData) {
					var qtId = this["qt-id"];
					var lovModel = {}
					var currentValue = fc.getFieldModel(eid,fid);
					var currentComplement = fc.getFieldModelComplement(eid,fid);
					if ((currentValue!= null && currentValue != "") || ((currentValue!= null && currentValue == "")&& (currentComplement!= null && currentComplement != "") ) ) {
						var column = null;
						dojo.forEach(lovData["input"], function(outputParam, index){
							var fieldId = outputParam[0];
							var paramId = outputParam[1];
							var fieldModel = fc.getFieldModel(eid, fieldId);
							if (fieldModel!=null) {
								lovModel[paramId] = "" + fieldModel;
							}
						},this);
						
						if(outcome.msg != undefined && outcome.msg != null){
							dojox.lang.functional.forIn(outcome.msg,function(value,paramId){
								if(value!=null){
									lovModel[paramId] = value;
								}
							},this);
						}
						
						
						dojo.forEach(lovData["output"], function(outputParam, index){
							var fieldId = outputParam[0];
							if (fieldId == fid) {
								column = outputParam[1];
							}
						},this);
						var fm = null;
						var callObj={ callbackScope:this,
								callback:this._executeAutoLovCallback,
								errorHandler:dojo.hitch(fc,fc.errorHandler)};
						if(){
							fm = fc.model.toPlainObject();
							QtControllerDWR.executeValidateLovRoutineQt(fisaTabId, qtId, currentValue, column, lovModel, 
									fisaPageScopeId,eid,fid,fm,	this["action-lov"],this.parentEditableGrid,this.gridSelectedRowIndex,lovData["output"],this.hasFieldRoutineOrPolicy,this._selectedRow,callObj);
						} else {
							fm = fc.model.toPlainObject();
							QtControllerDWR.executeValidateLovRoutineBt(fisaTabId, qtId, currentValue, column, lovModel, 
									fisaPageScopeId,eid,fid,fm,this.parentEditableGrid,this.gridSelectedRowIndex,lovData["output"],this.hasFieldRoutineOrPolicy,this._selectedRow, callObj);
						}
					}
					else if(currentComplement!= null && currentComplement!=""){
						this._fromSelection=true;
						this.clearOutputLovData(fc);

					}
				}
			}
			this._fromSelection=false;
			this._selectedRow =null;
			return false;
			
		},*/

		/**method called after bein validate and run the routines from a lov.*/
		_executeAutoLovCallback:function(data) {
			var fc = this.getController();
			if(data.wAxn === "error"){
				fc.updateMsgsPanel(data.aMsgs);
				this.clearOutputLovData(fc);
			} else if(data.wAxn === "refresh") {
				
				var tabId = this["fisa-tab-id"];
				var pageScopeId = this["fisa-page-scope-id"];
				//Se publica el mensaje indicando que se ha actualizado el lov
				//Si hay alguna qt de combo box que dependa de este lov sera notificada.
				var ctrl = ec.fisa.controller.utils.getPageController(tabId, pageScopeId);
				//if has to update combos.
				if(data.dataUpdate!= null &&data.dataUpdate != undefined){
					var comboIdMap =	data.dataUpdate;
					if(comboIdMap != null && comboIdMap != undefined){
						 dojox.lang.functional.forIn(comboIdMap,dojo.hitch(this,function(dataCombo,/*key*/notifyComboId){
								ctrl.updateSelectByOutcome(notifyComboId,dataCombo,ctrl,this.gridRealRowIndex);
							}));
					}
				}
				
				this.setOutputLovData(fc, data);
				if(fc instanceof ec.fisa.controller.custom.QtController) {
					//FIXME: Do not know what to do in QTs
				} else {
					var nextFocus=focusUtil.curNode;
					var nf=true;
					if(nextFocus!=null&&nextFocus.id===this._buttonId){
						nf=false;
					}
					fc.handleCallBackBackFieldRoutine(data,nf);
				}
				var btId = this["bt-id"];
				var tabId = this["fisa-tab-id"];
				var pageScopeId = this["fisa-page-scope-id"];
				//Se publica el mensaje indicando que se ha actualizado el lov
				//Si hay alguna qt de combo box que dependa de este lov sera notificada.
				var ctrl = ec.fisa.controller.utils.getPageController(tabId, pageScopeId);
				
				//if has to update combos.
				if(data.dataUpdate!= null &&data.dataUpdate != undefined){
					var comboIdMap =	data.dataUpdate;
					if(comboIdMap != null && comboIdMap != undefined){
						 dojox.lang.functional.forIn(comboIdMap,dojo.hitch(this,function(dataCombo,/*key*/notifyComboId){
								ctrl.updateSelectByOutcome(notifyComboId,dataCombo,ctrl,this.gridRealRowIndex);
							}));
					}
				}
//				ctrl.publishChange(btId, tabId, pageScopeId, this);
				
				
			}
		},
		clearOutputLovData: function(fc){

			this.setOutputLovData(fc, null);

		},
		setOutputLovData: function(fc,data){
			var eid = this["bt-id"];
			var fid = this["field-id"];
			var lovData = fc.lovData[eid][fid];
			if (lovData) {
				dojo.forEach(lovData["complement"], function(complementParam, index){
					var column = complementParam[0];
					var complementVal="";
					if ( data && data.selectedRow) {
						complementVal=data.selectedRow[column];
					}
					if(this.parentEditableGrid){
						
						var grid = dijit.byId(this.gridId);
						var gridComplementModel =null;
						
						if(grid.fisaEditableDirectGrid == true){
							gridComplementModel= grid.complementModel[this.gridRealRowIndex];
						}
						else{
							gridComplementModel = grid.complementModel;
						}
						gridComplementModel.setValue([fid+'--CMPLMNT'], complementVal,false);
					}else {
						fc.setFieldModelComplement(eid, fid, complementVal);
					}
				},this);
				dojo.forEach(lovData["output"], function(outputParam, index){
					var fieldId = outputParam[0];
					var column = outputParam[1];
					var val=null;
					if (data && data.selectedRow) {
						val=data.selectedRow[column];
					}
					if(this.parentEditableGrid){
						
						var grid = dijit.byId(this.gridId);
						var gridModel =null;
						
						if(grid.fisaEditableDirectGrid == true){
							gridModel= grid.model[this.gridRealRowIndex];
						}
						else{
							gridModel = grid.model;
						}
						gridModel.setValue([fieldId], val,false);
					}else{
						fc.setFieldModelValue(eid, fieldId, val, false);
					}
				},this);
			}
		},
		getController : function (){
			var fisaTabId = this["fisa-tab-id"];
			var fisaPageScopeId = this["fisa-page-scope-id"];
			var fc = ec.fisa.controller.utils.getPageController(fisaTabId, fisaPageScopeId);
			return fc;
		},
		_getRefAttr : function() {
			return this._textBox.get("ref");
		},
		_setRefAttr : function(value) {
			this._textBox.set("ref", value);
		},
		_getRefCmplAttr : function() {
			return this._complementNode.get("ref");
		},
		_setRefCmplAttr : function(value) {
			this._complementNode.set("ref", value);
		},
		_getBindingAttr : function(value) {
			return this._textBox.get("binding");
		},
		_setBindingAttr : function() {
			this._textBox.set("binding", value);
		},
		_getValueAttr : function() {
			return this._textBox.get("value");
		},
		_setValueAttr : function(value, /* Boolean? */priorityChange, /* String? */
				formattedValue) {
			var _val=null;
			if(value == null){
				_val = "";
			}else{
				_val=""+value;
			}
			this._textBox.set("value", _val, priorityChange);
			if(typeof priorityChange==="boolean"&& (!priorityChange)){
				this._textBox._pendingOnChange=false;
				this._textBox._lastValueReported=_val;
			}
			
			
		},
		_getComplementAttr : function() {
			return this._complementNode.get("value");
		},
		_setComplementAttr : function(value, /* Boolean? */priorityChange, /* String? */
				formattedValue) {
			if(this.parentEditableGrid == true){
				this._complementNode._componentNode.style.display="block";
			}
			this._complementNode.set("value", value);
		},
		_setEnabledAttr:function(value){
			if(value != null){
				if(value){
					this.selectLabel = this.selectLabelOrig;
					ec.fisa.widget.utils.enableWidget(this._button);
					
					if(this.editable){
						dojo.removeClass(this._button.domNode, "fisaLovDisabled");
						ec.fisa.widget.utils.enableWidget(this._textBox);
					} else {
						dojo.replaceClass(this._button.domNode, "fisaLovOnlySelect", "fisaLovDisabled");
						ec.fisa.widget.utils.disableWidget(this._textBox);
					}

				}else{
					ec.fisa.widget.utils.disableWidget(this._textBox);
					ec.fisa.widget.utils.disableWidget(this._button);
					if(this.editable){
						dojo.addClass(this._button.domNode, "fisaLovDisabled");
					} else {
						dojo.replaceClass(this._button.domNode, "fisaLovDisabled", "fisaLovOnlySelect");
					}
				}
			}
		},
		_getEnabledAttr:function(){
			return ec.fisa.widget.utils.isEnabled(this._button);
		}

	});
});

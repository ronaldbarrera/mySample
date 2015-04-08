define( [
		"dijit/_Widget", 
		"dijit/_Templated", 
		"dojo/_base/declare",
		"dojo/text!./templates/RowActions.html",
		"dojo/dom-style",
		"dojo/html",
		"dojo/on",
		"dojo/_base/connect",
		"dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin",
		"ec/fisa/controller/Utils",
		"dojox/form/BusyButton"
		],
		function(_Widget, _Templated, declare,template, domStyle, html, on,connect, _TemplatedMixin,_WidgetsInTemplateMixin) {

			return declare("ec.fisa.grid.RowActions", [ _Widget, _Templated, _TemplatedMixin, _WidgetsInTemplateMixin ], {
				widgetsInTemplate : true,
				_editComponent:null,
				_cancelComponent: null,
				_applyComponent: null,
				_deleteComponent: null,
				_addComponent:null,
				data:null,
				rowIndex:null,
				viewRowIndex:null,
				tabId: null,
				gridId:null,
				pageScopeId: null,
				editBlocked:false,
				deleteBlocked:false,
				
				tabIndex:null,
				_tabIndex:0,
				edit_title:"",
				delete_title:"",
				apply_title:"",
				cancel_title:"",
				add_title:"",
				//handle obtained from connect method.
				editHandle:null,
				deleteHandle:null,
				
				_destroyOnRemove: true,
				
				templateString : template,
				constructor: function(){
				
				},
				
				postMixInProperties : function() {
					this.inherited(arguments);
					if(this.tabIndex != null){
						this._tabIndex = this.tabIndex;
					}
				},
				
				postCreate:function(){
					this.inherited(arguments);
					this.connect(this._cancelComponent,"onClick",this._onClickCancel);
					this.connect(this._applyComponent,"onClick",this._onClickApply);
					this.editHandle =this.connect(this._editComponent,"onClick",this._onClickEdit);
					this.deleteHandle = this.connect(this._deleteComponent,"onClick",this._onClickDelete);
					this._cancelComponent.fautoexec=true;
					this._applyComponent.fautoexec=true;
					this._editComponent.fautoexec=true;
					this._deleteComponent.fautoexec=true;
					//this add always non show, only in qy mode from a bt in hold
					this._addComponent.domNode.style.display="none";
					this.changeBehavior();
				},
				/**modify behavior of what to show to the user based on the data number.*/
				changeBehavior:function(){
					var data = this.data%10;
					if(data==4){
						this._cancelComponent.domNode.style.display="none";
						this._applyComponent.domNode.style.display="none";
						if(this.editBlocked){
							this._editComponent.domNode.style.display="none";
						}else{
							this._editComponent.domNode.style.display="";
						}
						if(this.deleteBlocked){
							this._deleteComponent.domNode.style.display="none";
						}else{
							this._deleteComponent.domNode.style.display="";
						}
					} else if (data==5){
						this._editComponent.domNode.style.display="none";
						this._deleteComponent.domNode.style.display="none";
						this._cancelComponent.domNode.style.display="";
						this._applyComponent.domNode.style.display="";
					}  
					//this is coming hold and show the add button cause was a previous insert.
					else if (data==6){
						this.hideAllButtons();
						this._addComponent.domNode.style.display="";
						}
					//update and show edit 
					else if (data==7){
						this.hideAllButtons();
						this._editComponent.domNode.style.display="";
						//disconnect the button from action
						connect.disconnect(this.editHandle);
						}
					//delete and show delete
					else if (data==8){
						this.hideAllButtons();
						this._deleteComponent.domNode.style.display="";
						connect.disconnect(this.deleteHandle);
						}
					
					else {
						this._editComponent.domNode.style.display="none";
						this._deleteComponent.domNode.style.display="none";
						this._cancelComponent.domNode.style.display="none";
						this._applyComponent.domNode.style.display="none";
					}
				},
				
				
				hideAllButtons:function(){
					this._addComponent.domNode.style.display="none";
					this._editComponent.domNode.style.display="none";
					this._deleteComponent.domNode.style.display="none";
					this._cancelComponent.domNode.style.display="none";
					this._applyComponent.domNode.style.display="none";
					
				},
				
				obtainRowData:function(){
					var grid = dijit.byId(this.gridId);
					return grid.model.toPlainObject();
				},
				obtainRowComplementData:function(){
					var grid = dijit.byId(this.gridId);
					return grid.complementModel.toPlainObject();
				},
				_onClickCancel:function(){
					this._execAction(BtControllerDWR.execEGridCancel,null,dijit.byId(this.gridId),null);
				},
				_onClickApply:function(){
					this._execAction(BtControllerDWR.execEGridApply,this.obtainRowData(),dijit.byId(this.gridId),this.obtainRowComplementData());
				},
				_onClickEdit:function(){
					var grid=dijit.byId(this.gridId);
					if(!grid.model){
						this._execAction(BtControllerDWR.execEGridEdit,null,grid,null);
					}
				},
				_onClickDelete:function(){
					var grid=dijit.byId(this.gridId);
					if(!grid.model){
						this._execAction(BtControllerDWR.execEGridDelete,null,grid,null);
					}
				},
				_execAction:function(execFtn,nd,scope,cd){
					var dataKey=scope.getItem(this.rowIndex);
					var callObj={callbackScope:this,callback:this._handleEditResponse};
					var controller = ec.fisa.controller.utils.getPageController(scope.tabId,scope.pageScopeId);
					controller.clearPanelMessage();
					if(cd==null){
						execFtn(scope.entId,dataKey,this.rowIndex,this.viewRowIndex,scope.btId,scope.pKeyStr,scope.fKeyStr,scope.btPos,scope.tabId,scope.pageScopeId,nd,callObj);
					}else{
						execFtn(scope.entId,dataKey,this.rowIndex,this.viewRowIndex,scope.btId,scope.pKeyStr,scope.fKeyStr,scope.btPos,scope.tabId,scope.pageScopeId,nd,cd,callObj);
					}
				},
				_handleEditResponse:function(outcome){
					var grid=dijit.byId(this.gridId);
					if(outcome.wAxn=="edit&refresh"){
						ec.fisa.grid.utils.updateRowData(outcome,grid,false);
						grid.refresh();
					} else if(outcome.wAxn=="refresh"){
						delete grid.model;
						grid.refresh();
						var controller = ec.fisa.controller.utils.getPageController(outcome.FISATabId,outcome.FisaPageScopeId);
						controller.handleCallBackBackFieldRoutine(this.removeCurrentMRFromOutcome(outcome,grid));
					} else if (outcome.wAxn=="delete"){

						if(outcome.multiregisterSize!= undefined && outcome.multiregisterSize != null){	
							var dataKey=grid.getItem(this.viewRowIndex);

							if(grid.store.getEntryById(dataKey)!= null){
								var item =grid.store.getEntryById(dataKey).data;

								if(item!= undefined && item != null){

									var grid=dijit.byId(this.gridId);
									var pageScopeId =grid.pageScopeId;
									var tabId=grid.tabId;
									var btController = ec.fisa.controller.utils.getPageController(tabId, pageScopeId);
									var selectIdMap = btController.selectIdMap;
									var btId = grid.btId;
									var selectDataMap = btController.selectDataMap;

									var btSelectDataMap = selectDataMap[btId];


									dojox.lang.functional.forIn(item,function(value,fieldId){

										if(this.selectIdMap != undefined && this.selectIdMap !=null){
											var rowIndex = this.rowActionScope.rowIndex;
											if(this.selectIdMap[fieldId + "|"+rowIndex]!= undefined){

												delete this.selectIdMap[fieldId + "|"+rowIndex];

												for(var i=rowIndex+1;i< this.multiregisterSize ;i++){
													var idSelectToChange= this.selectIdMap[fieldId + "|"+i];
													if(idSelectToChange!= undefined && idSelectToChange!= null){
													this.selectIdMap[fieldId + "|"+(i-1)] = idSelectToChange;
													}
												}
												var lastRowKey = this.multiregisterSize-1;
												delete this.selectIdMap[fieldId + "|"+lastRowKey];

											}
										}
										//the same to the data map.
										if(this.btSelectDataMap != undefined &&  this.btSelectDataMap != null && this.btSelectDataMap[fieldId + "|"+rowIndex]!= undefined){

											delete this.btSelectDataMap[fieldId + "|"+rowIndex];
											for(var i=rowIndex+1;i< this.multiregisterSize ;i++){
												var selectDataMap= this.btSelectDataMap[fieldId + "|"+i];
												if(selectDataMap!=undefined && selectDataMap!=null){
												this.btSelectDataMap[fieldId + "|"+(i-1)] = selectDataMap;
												}
											}
											var lastRowKey = this.multiregisterSize-1;
											delete this.btSelectDataMap[fieldId + "|"+lastRowKey];

										}



									},{rowActionScope:this,selectIdMap:selectIdMap,multiregisterSize:outcome.multiregisterSize,btSelectDataMap:btSelectDataMap});
								}



							}
						}
						
						delete grid.model;
						grid.refresh();
						//<<HD19508 JCVQ Se refresca del padre, esto se hace puesto que pudo haber cambio de datos luego de una rutina de campo ejecutada al eliminar un registro del multiregistro
						if(outcome.msg){
							outcome.wAxn = "refresh";
							var controller = ec.fisa.controller.utils.getPageController(outcome.FISATabId,outcome.FisaPageScopeId);
							controller.handleCallBackBackFieldRoutine(this.removeCurrentMRFromOutcome(outcome,grid));
						}
						//HD19508>>
					} else if (outcome.wAxn=="error") {
						var controller = ec.fisa.controller.utils.getPageController(outcome.FISATabId, outcome.FisaPageScopeId);
						controller.updateMsgsPanel(outcome.aMsgs);
						var _sts = null;
						if (outcome.recordId != null) {
							_sts = grid.store.getValue(outcome.recordId, "rowSts");
						}
						if (_sts == null) {
							this.activateComponents();
						} else {
							var sts = _sts % 10;
							if (sts != 5) {
								delete grid.model;
								this.activateComponents();//HD19508 JCVQ Se vuelven a activar los botones luego de presentarse un error.
							} else {
								this.activateComponents();
							}
						}
					}
				},
				activateComponents:function(){
					this.activateCmp(this._addComponent);
					this.activateCmp(this._editComponent);
					this.activateCmp(this._deleteComponent);
					this.activateCmp(this._applyComponent);
					this.activateCmp(this._cancelComponent);
				},
				activateCmp:function(_cmp){
					if(_cmp.domNode.style.display!="none"){
						_cmp.cancel();
					}
				},
				_getTabIdAttr : function(){
					return this.tabId;
				},
				_setTabIdAttr : function(tabId){
					this.tabId=tabId;
				},
				_getPageScopeIdAttr : function(){
					return this.pageScopeId;
				},
				_setPageScopeIdAttr : function(pageScopeId){
					this.pageScopeId=pageScopeId;
				},
				removeCurrentMRFromOutcome:function(outcome,grid){
					if(outcome.msg!=null&&outcome.msg[grid.btId]&&outcome.msg[grid.btId][grid.entId]){
						delete outcome.msg[grid.btId][grid.entId];
					}
					return outcome;
				}
			});
		});
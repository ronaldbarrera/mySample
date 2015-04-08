/**
 * This controller contains variables, and objects related to a page. Ex:
 * messagespanel.
 * 
 * In this case works for tabs with bt(business template) who has documents.
 * 
 */

define([ "dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/lang","./_base","dojox/form/Uploader",
         "dojo/_base/connect","dojox/grid/DataGrid","dojo/data/ItemFileWriteStore","ec/fisa/widget/OutputText",
         "dojo/dom-construct", "ec/fisa/controller/BaseController","dojox/form/uploader/plugins/IFrame","ec/fisa/widget/DocumentActions",
         "dojox/mvc","dojox/mvc/StatefulModel", "dojo/dom-class", "dijit/form/TextBox", "dojox/lang/functional/object", "ec/fisa/controller/Utils"  ],
         function(dojo, declare, lang, fisaBaseController,uploader,connect,DataGrid,ItemFileWriteStore,OutputText,
        		 domConstruct, BaseController,Iframe, DocumentActions,mvc, StatefulModel,domClass,TextBox) {

	var BtDocumentController = declare(
			"ec.fisa.controller.custom.BtDocumentController",
			[BaseController], {
				tabId : null,
				model : null,
				pageScopeId:null,
				/* pageScopeId from the tree grid page. */
				pageTreeGridScopeId:null,
				// this is the data coming from the treegrid.
				data:null,
				// component that contains outputext. where the
				// fileuploaded is setted.
				componentFileUploadedText:null,
				// full path of the file uploaded.
				fileUploadedFullPath: null,
				fileName:null,
				fileContentType:null,
				fileLength:null,
				shortDateFormatTree:null,
				dialogComponentId:null,
				/* store that contains the keywords. */
				keywordStore:null,
				
				isLovModal:true,

				constructor : function(tabId,pageScopeId, pageTreeGridScopeId) {
					this.tabId = tabId,
					this.pageScopeId= pageScopeId,
					this.pageTreeGridScopeId = pageTreeGridScopeId;
					this.inherited(arguments);
					this.model = dojox.mvc.newStatefulModel({ data : {} });
					this.keywordStore=[];
				},
				
				
				/** find and set the component dialog at the file_upload.jsp*/
				setDialogComponent:function(component){
					var dialog = component.getParent().getParent();
					this.data = dialog.data;
					dialog.treeGridNodeId = this.data.treeGridNodeId;
					dialog.popupPageScopeId = this.pageScopeId;
					this.dialogComponentId = dialog.id;
				
					
				},
				/** find and set the component dialog at the file_upload.jsp*/
				setDialogComponentHistory:function(component){
					var dialogComponent = component.getParent();
					this.dialogComponentId = dialogComponent.id;
				},

				initMvc:function(/** component */component,/*
				 * string to be
				 * binded
				 */modelProp){
					var modelData = this.data[modelProp];
					var stf=new dojox.mvc.StatefulModel({data:modelData});
					// add the modelProp to the model, for mvc to be
					// updated.
					this.model.add(modelProp,stf);
					component.set("ref",this.model[modelProp]);
				}
				,

				_getDataAttr:function(){
					return this.data;
				},
				_setDataAttr:function(data){
					this.data= data;
				},
				setComponentFileUploadedText:function(/* dojo widget */component){
					this.componentFileUploadedText = component;
					var compOutText = component;
					// obtains the label node to hide it
					var spanNode =	dojo.byId("spanFileName"); // compOutText.domNode.parentNode.parentNode.firstElementChild.firstElementChild;
					spanNode.style.display= "none";
					compOutText.set("value","");

					if(this.data){
						if(this.data.newDocument == false){
							compOutText.set("value",this.data.fileName);
							spanNode.style.display= "block";
						}
					}


				},
				setShortDateFormatTree:function(shortDateFormatTree){
					this.shortDateFormatTree = shortDateFormatTree;
				},

				/* function after a document has been uploaded. */
				documentCallBack:function(data,ioArgs,widgetRef){
					if(data){
						if(data.status && data.status == "success"){
							widgetRef.overlay.innerHTML = "success!";
							widgetRef.reset();


							this.fisaController.fileUploadedFullPath = data.details.completeFileName;
							this.fisaController.fileName = data.details.fileName;
							this.fisaController.fileContentType=data.details.contentType;
							this.fisaController.fileLength=data.details.fileLength;

							// show td with the filename. recently
							// uploaded.
							var compOutText = this.fisaController.componentFileUploadedText;
							compOutText.set("value",data.details.fileName);
							// obtains the spannode to reset the value
							var spanNode =	dojo.byId("spanFileName"); // compOutText.domNode.parentNode.parentNode.firstElementChild.firstElementChild;
							//var spanNode =	compOutText.domNode.parentNode.parentNode.firstElementChild.firstElementChild;
							spanNode.style.display= "block";

						}else{
							var msgs =	data.details;
							this.fisaController.clearPanelMessage();
							this.fisaController.updateMsgsPanel(msgs);
							widgetRef.reset();

							widgetRef.overlay.innerHTML = "error";
							// console.log('error',data,ioArgs);
						}
					}else{
						// debug assist
						// console.log('no data',arguments);
					}
				},

				attachDocumentCallBack:function(component){
					component.fisaController = this;
					connect.connect(component, "onComplete", null, this.documentCallBack);	
					// component.onComplete = this.documentCallBack;
				},

				
				

				/** inits the datagrid. */
				initDataGrid:function(component,inputInvalidValueLabel){
					/** Creates a div inside an dom node component. */
					var creationTable = domConstruct.create("table", {'cellpadding':0,'cellspacing':10,'border':0,'width':'100%'},
							component.containerNode);
					var creationTBody = domConstruct.create("tbody", null,
							creationTable);
					
//					grid.inputInvalidValueLabel = inputInvalidValueLabel;
					if(this.data!=null&&this.data.fisaPopupDocumentKeywords!=null){
						dojo.forEach(this.data.fisaPopupDocumentKeywords,function(item,index){
							var creationTr = domConstruct.create("tr", null,
									creationTBody);
							var creationTdI = domConstruct.create("td", {'width':'40%'},
									creationTr);
							var creationTdD = domConstruct.create("td", null,
									creationTr);
							var spanLabel = domConstruct.create("span", null,
									creationTdI);
							spanLabel.innerHTML=item.keywordName;
							var spanCmp = domConstruct.create("span", null,
									creationTdD);
							var _val=item.value==null?"":item.value;
							var tb=new TextBox({'value':_val,'keyword-id':item.id,'maxLength':item.maximumLength},spanCmp);
							tb.startup();
							item.cmpid=tb.id;
							this.keywordStore[index]=item;
						},this);
					}
				},



				/** inits the history datagrid. */
				initHistoryGrid:function(component){
					
					var dialogComponent = dijit.byId(this.dialogComponentId);
					
					var labels = dialogComponent.labels;
					var dataHis = dialogComponent.documentHisArray;

					var creationDiv = domConstruct.create("div", null,
							component.domNode);

					if(dataHis == null  || dataHis.length <= 0){

						var text = new OutputText({
							value:labels["emptyRowLabel"]
						},creationDiv);


					}else
					{
						var layout = [
						              {
						            	  name : labels["auditRecordNumber"],
						            	  field : "recordNumber",
						            	  width : "100px"
						              },
						              {
						            	  name :  labels["auditInputUserId"],
						            	  field : "userName" ,
						            	  width : "100px"
						              },
						              {
						            	  name :  labels["auditInputDate"],
						            	  field : "iDate" ,
						            	  width : "100px",
						            	  editable:false,
						            	  formatter:function(data, rowIndex,column)
						            	  {return ec.fisa.format.utils.formatDataGridDate(data, rowIndex,column);}
						              },
						              {
						            	  name :  labels["auditInstitucion"],
						            	  field : "companyName" ,
						            	  width : "100px"
						              },
						              {
						            	  name :  labels["treeTableDetailColumn"],
						            	  field : "description" ,
						            	  width : "100px",
						            	  formatter:function(data, rowIndex,column)
						            	  {return ec.fisa.format.utils.formatDataGridHistoryDetail(data, rowIndex,column);}
						              },
						              {
						            	  name : labels["optionsColumn"],
						            	  field : "a",//this is a nothing value.
						            	  width : "100px",
						            	  cellType:dojox.grid.cells._Widget,
						            	  editable:false,
						            	  widgetClass: DocumentActions,
						            	  formatter:function(data, rowIndex,col)
						            	  {
						            		  return ec.fisa.format.utils.formatterDocumentsHistoryOptions(data, rowIndex,col);}
						              } 




						              ];
						var gridData = {
								identifier: "id",
								items: dataHis
						};
						var store = new ItemFileWriteStore({ data: gridData });

						// domClass.add(creationDiv, "grid");
						/* create a new grid: */
						var grid = new DataGrid({
							store: store,
							structure: layout,
							autoHeight:true,
							autoWidth:true,
							selectionMode:"none"
						},
						creationDiv);

						grid.shortDateFormatTree=this.shortDateFormatTree;
						grid.labels = labels;

						grid.tabIdvar = this.tabId;
						grid.pageScopeIdvar = this.pageTreeGridScopeId;
						grid.contextPath = dojo.config.fisaContextPath;
						grid.startup();
					}
				},

				popUpCancel:function(){
					var dialogComponent = dijit.byId(this.dialogComponentId);
					dialogComponent.hide();

				},
				popUpAccept:function(){
					
					var messagesPanel = dijit.byId(this.messagesPanelId);
					messagesPanel.clearAllMessages();
							// preparing object to be passed to java.
							var fisaPopUpDocumentData = this.model
									.toPlainObject();
							var _vals=[];
							dojo.forEach(this.keywordStore,function(item,index){
								var _item=dojo.clone(item);
								var cmp=dijit.byId(item.cmpid);
								_item.value=cmp.get("value");
								delete _item.cmpid;
								_vals[index]=_item;
							},this);
							fisaPopUpDocumentData.fisaPopupDocumentKeywords = _vals;

							if (this.data.newDocument == true
									&& this.fileUploadedFullPath == null) {
								var levelObj = {
									level : 40000
								};
								var errorList = [ {
									level : levelObj,
									summary : this.data.msgErrorNoDocument
								} ];
								this.updateMsgsPanel(errorList);
							} else {

								if (this.data.newDocument == false
										&& this.fileUploadedFullPath == null) {
									fisaPopUpDocumentData.fileUploaded = true;
								}

								// callbackscope: object that contains variables
								// to
								// be passed on callback methods.
								var callObj = {
									callbackScope : {
										tabId : this.tabId,
										pageTreeGridScopeId : this.pageTreeGridScopeId,
										btDocController : this
									}
								};
								callObj.errorHandler = dojo.hitch(this,
										this.errorHandler);
								callObj.callback = this.callBckFnctnDwr;
								fisaPopUpDocumentData.fileUploadedFullPath = this.fileUploadedFullPath;
								fisaPopUpDocumentData.fileName = this.fileName;
								fisaPopUpDocumentData.fileContentType = this.fileContentType;
								fisaPopUpDocumentData.fileLength = this.fileLength;
								fisaPopUpDocumentData.treeGridNodeId = this.data.treeGridNodeId;
								DocumentControllerDWR
										.processReturnPopupDocument(
												fisaPopUpDocumentData,
												this.tabId,
												this.pageTreeGridScopeId,
												callObj);

							}

				},
				/* function called after the dwr process. */
				callBckFnctnDwr:function(/* object */outcome){
					if(outcome.status == "success"){
						var dialogComponent = dijit.byId(this.btDocController.dialogComponentId);
						
						var treeGrid =dialogComponent.treeGrid;
						// only if exists.
						// reloads the tree grid data that was set
						// at the creation of the dialog.
						if (treeGrid) {
							ec.fisa.controller.utils.updateRowTreeGrid(treeGrid, outcome);
							//updates parent treegrid document page panel.
							var btController = ec.fisa.controller.utils.getPageController(this.tabId,this.pageTreeGridScopeId);
							btController.clearPanelMessage();
						}
						// close the dialog.
						dialogComponent.destroyRecursive();
					}else{
						
						// show td with the filename. recently
						// uploaded.
						var compOutText = this.btDocController.componentFileUploadedText;
						compOutText.set("value","");
						// obtains the spannode to reset the value
						var spanNode =	dojo.byId("spanFileName"); // compOutText.domNode.parentNode.parentNode.firstElementChild.firstElementChild;
						//var spanNode =	compOutText.domNode.parentNode.parentNode.firstElementChild.firstElementChild;
						spanNode.style.display= "none";
						
						this.btDocController.updateMsgsPanel(outcome.details);
					}
				},

				setSizeUploadComponents:function(component){
					component.resize(ec.fisa.controller.utils.getModalSize(0.65));
				}
			});
	return BtDocumentController;
});

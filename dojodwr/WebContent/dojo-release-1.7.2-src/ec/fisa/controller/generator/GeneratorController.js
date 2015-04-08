define(
		["dojo/_base/kernel", 
		 "dojo/_base/declare", 
		 "dojo/_base/lang",
		 "ec/fisa/controller/BaseController", 
		 "ec/fisa/controller/custom/CustomBtController",
		 "dojo/on",
		 "dijit/Dialog",
		 "dojo/_base/array",
		 "dojo/dom-construct",
		 "ec/fisa/mvc/StatefulModel",
		 "ec/fisa/dwr/proxy/GeneratorControllerDWR",
		 "ec/fisa/widget/SANotificationGridUser",
		 "ec/fisa/format/Utils", 
		 "ec/fisa/navigation/Utils" ],
		function(dojo,declare, lang, BaseController, CustomBtController,on,Dialog,array,domConstruct,StatefulModel) {
			return declare("ec.fisa.controller.generator.GeneratorController", CustomBtController, {
				
				systemQtData:null,
				sourceQtData:null,
				channelQtData:null,
				qtType:null,
				serviceTypeQtData:null,
				sourceObjectId:"",
				systemComboId:"",
				subsystemComboId:"",
				aplicationComboId: "",
				serviceTypeId:"",
				listComboId:"",
				txtStNameId:"",
				txtServiceTemplateId:"",
				txtSTImplementationId:"",
				sourceObjectValue:null,
				qtGridId:"",
				btGridId:"",
				stGridId:"",
				btnSearchId:"",
				btnNextId:"",
				objectGridForAction:null,
				searchParams:null,
				channelId:"",
				servAuthGridId:"",
				dialogTitle:"",
				authDialogId:"",
				authenticationType:0,
				
				constructor : function(tabId, pageScopeId, initData) {					
					if (initData.aMsgs == undefined) {	
						this.systemQtData = initData.systemQtData;
						this.sourceQtData = initData.sourceQtData;
						this.qtType = initData.qtType;
						this.serviceTypeQtData = initData.serviceTypeQtData;
						//this.channelQtData = initData.channelQtData;//TODO: borrar
						
					} 
					this.model = new StatefulModel({});
					delete initData.systemQtData;
					delete initData.sourceQtData;
					delete initData.qtType;
					delete initData.serviceTypeQtData;
					//delete initData.channelQtData;//TODO: borrar
				},
				
				fillComboBox: function(data,component){
					var listOfOptions = [];
					
					if(data != null){
						dojo.forEach(data, function(item, index){							
							listOfOptions[index]  = {value : "" + item.value, label : item.label};
							if(index==0){
								listOfOptions[index].selected=true;
							}
						},this);
					}else{
						listOfOptions[0] = {value : "" , label : dojo.config.fisaSelectLabel, selected:true};
					}
					component.set("options",listOfOptions);
					component.set("value","-1");
					//return listOfOptions;
				},			
				
				onChangeCombo: function(component,tabId,pageScopeId){
					var fc = ec.fisa.controller.utils.getPageController(tabId,pageScopeId);
					var itemSelectedValue = component.get("value");//component.focusedChild.option.value;
					if(component.id==this.sourceObjectId){
						fc.renderComboBox(fc,parseInt(component.value));
						fc.sourceObjectValue = itemSelectedValue;
					}
					
					var callObj={ callbackScope:fc,
							callback:fc.executeActionComboCallback,
							errorHandler:dojo.hitch(fc,fc.errorHandler)};
					
					if((component.fatherId==null || component.fatherId==undefined) && component.id==this.systemComboId){//combo1				
						if(itemSelectedValue!="-1"){
							GeneratorControllerDWR.loadComboData(itemSelectedValue, component.id, 1,tabId,callObj);
						}else{
							this.fillComboBox(null,dijit.byId(this.subsystemComboId));
							this.fillComboBox(null,dijit.byId(this.aplicationComboId));
						}
					} else if(component.fatherId==this.systemComboId){//combo2
						if(itemSelectedValue!="-1"){
							GeneratorControllerDWR.loadComboData(itemSelectedValue, component.id, 2,tabId,callObj);
						}else{
							this.fillComboBox(null,dijit.byId(this.aplicationComboId));
						}
						
					} else if(component.fatherId == this.subsystemComboId){ //combo3		
						if(itemSelectedValue!="-1"){
							switch (parseInt(fc.sourceObjectValue)) {
							case 1://BTs
								fc.searchParams={"appId":itemSelectedValue};
								break;
							case 2://QTs
								fc.searchParams = {"typeId":itemSelectedValue};
								break;
							}
						}
						
					}					
				},
				
				searchAction: function(){
					switch (parseInt(this.sourceObjectValue)) {
					case 1://BTs						
						var grid = dijit.byId(this.btGridId);
						dijit.byId(this.qtGridId).domNode.style.display="none";
						dijit.byId(this.stGridId).domNode.style.display="none";
						grid.domNode.style.display = "";
						grid.setQuery(this.searchParams);
						this.objectGridForAction = grid;
						break;
					case 2://QTs
						var grid = dijit.byId(this.qtGridId);
						dijit.byId(this.btGridId).domNode.style.display="none";
						dijit.byId(this.stGridId).domNode.style.display="none";
						grid.domNode.style.display = "";
						grid.setQuery(this.searchParams);
						this.objectGridForAction = grid;
						break;
					case 3://STs
						var grid = dijit.byId(this.stGridId);
						dijit.byId(this.qtGridId).domNode.style.display="none";
						dijit.byId(this.btGridId).domNode.style.display="none";
						grid.domNode.style.display = "";
						this.searchParams = {"stImplId":dijit.byId(this.txtSTImplementationId).value,
								"stId":dijit.byId(this.txtServiceTemplateId).value,
								"stNameId":dijit.byId(this.txtStNameId).value};
						grid.setQuery(this.searchParams);
						this.objectGridForAction = grid;
						break;
					}
				},
 				
				wizardStep:1,
				
				nextAction:function(){
					var callObj={ callbackScope:this,
							callback:this.executeNextActionSequence,
							errorHandler:dojo.hitch(this,this.errorHandler)};
					switch (this.wizardStep) {
					case 1:
						var index = this._getRealIndex(this.objectGridForAction);
						if (index >= 0){
							var selection = this.objectGridForAction.store.getEntryById(index).data;
							var mainTab = dijit.byId("mainTabContainer");
							mainTab.selectChild("tabAuthServ");
							var params = {"objectReference":selection[0],"objectType":this.sourceObjectValue};
							dojo.byId("itemSelected").value = selection[0];
							dojo.byId("itemNameSelected").value = selection[1];
							//dojo.byId("itemSelected2").value = selection[0];//tercer Tab TODO: el tercer tab ya no existe
							//dojo.byId("itemNameSelected2").value = selection[1];//tercer Tab TODO: el tercer tab ya no existe
							
							GeneratorControllerDWR.next(this.wizardStep,params,callObj);
							this.wizardStep++;
						} else {
							this.errorHandler("Debe seleccionar un Objeto");
						}
						
						break;
					case 2:
						var params={};
						//if(dijit.byId(this.channelId).get("value")!=-1){
							//var selectedChannel = dijit.byId(this.channelId).options[dijit.byId(this.channelId).get("value")].label;
							//params.channelSelected=selectedChannel;
							var grid = dijit.byId(this.servAuthGridId);
							var index = this._getRealIndex(grid);
							if(index > 0){
								var selection = grid.store.getEntryById(index).data;
								params.servAuth = selection[0];
							}
							
							var mainTab = dijit.byId("mainTabContainer");
							mainTab.selectChild("tabTrxAuth");
							//dojo.byId("itemChannel2").value = selectedChannel;
							GeneratorControllerDWR.next(this.wizardStep,params,callObj);
							this.wizardStep++;
						//}else{
							//this.errorHandler("El Canal es Obligatorio");
							break;
						//}
						break;
					case 3:
					
						break;
					}
				},
				
				createAuthenticationPanel: function(data){
					var grid = dijit.byId(this.servAuthGridId)
					var index = this._getRealIndex(grid);
					var selection =grid.store.getEntryById(index).data;
					this.dialogTitle = this.capitaliseFirstLetter(selection[1].toLowerCase());
					var callObj={ callbackScope:this,
							callback:this.renderDialog,
							errorHandler:dojo.hitch(this,this.errorHandler)};
					GeneratorControllerDWR.obteinFieldsByType(selection[0],callObj);
				},
				
				renderDialog:function(data){
					if(data.popup){
						if(data.autheticacionType==this.authenticationType){
							dijit.byId(this.authDialogId).show();
						}else{
							var dialog = this.authDialogId==""? new Dialog({
								title: this.dialogTitle,
								style: "width: 550px; height: auto;padding-bottom: 10px;"
							}):dijit.byId(this.authDialogId);
							
							this.authDialogId = dialog.id;
							if(dojo.byId('tableForDialog')){
								domConstruct.destroy("tableForDialog");
								domConstruct.destroy("actionTable");
							}
							var table = domConstruct.create("table",{
											'id':'tableForDialog', 
											'border':0,
											'cellpading':0,
											'cellspacing':0,
											'width':'100%',
											'className':'fisaComponentGrid'},dialog.domNode);
							array.forEach(data.labelList, function(element){
								var tr = domConstruct.create("tr",{'className':'evenFieldBt'},table);
								var td_label = domConstruct.create("td",{'className':'fisaComponentGridLeftCell'},tr);
								var label = domConstruct.create("label",{'innerHTML':element.label},td_label);
								var td_comp = domConstruct.create("td",{'className':'fisaComponentGridRightCell'},tr);
								var component = dijit.form.TextBox({'className':'dijitReset dijitInputInner','name':element.label,'type': element.encrypted==1?'password':'text'},td_comp);
							},this);
							
							var actionSection = domConstruct.create("table",{'id':'actionTable','className':'fisaBTActionBtns'},dialog.domNode);
							var tr=domConstruct.create("tr",{},actionSection);
							var td = domConstruct.create("td",{},tr);
							
							 var button = new dijit.form.Button({
							        'label': data.labelButton,
							        'onClick': dojo.hitch(this,this.saveAuthenticationData)},td);
							 
							dialog.show();
						}
						this.authenticationType = data.autheticacionType;
					}
					
				},
				
				saveAuthenticationData: function(){
					alert("Información Almacenada");
					dijit.byId(this.authDialogId).hide();
				},
				
				backAction: function(){
					var mainTab = dijit.byId("mainTabContainer");
					switch (this.wizardStep) {
					case 2:
						mainTab.selectChild("tabObjSele");
						this.wizardStep--;
						break;
					case 3:
						mainTab.selectChild("tabAuthServ");
						this.wizardStep--;
						break;
					}
				},
				
				executeNextActionSequence:function(response){
					//alert(response);
				},
				
				executeActionComboCallback: function(response){
					if(response.parentId==this.systemComboId){
						this.fillComboBox(response.data,dijit.byId(this.subsystemComboId));
					}else if(response.parentId == this.subsystemComboId){
						this.fillComboBox(response.data,dijit.byId(this.aplicationComboId));
					}
				},
				
				errorHandler:function(error){
					this.updateMsgsPanel(error);
				},
				
				renderComboBox: function(controller,value){
					switch (value) {
					case 1://Business Template
						controller.displayForSt("none");
						controller.displayForQt("none");
						controller.displayForBt("");
						break;
					case 2://Query Template
						controller.displayForSt("none");
						controller.displayForBt("none");
						controller.displayForQt("");
						break;
					case 3://Service Template
						controller.displayForQt("none");
						controller.displayForBt("none");
						controller.displayForSt("");
						break;
					}
				},
				
				displayForBt:function(display){
					dojo.byId("variableRowBt").style.display=display;
					dojo.byId("lblSystem").style.display=display;
					dojo.byId("lblSubSystem").style.display=display;
					dojo.byId("lblAplication").style.display=display;
					dijit.byId(this.systemComboId).domNode.style.display = display;
					dijit.byId(this.subsystemComboId).domNode.style.display = display;
					dijit.byId(this.aplicationComboId).domNode.style.display = display;
					
				},
				
				displayForQt:function(display){
					dojo.byId("variableRowBt").style.display=display;
					dojo.byId("lblSystem").style.display=display;
					dojo.byId("lblSubSystem").style.display=display;
					dojo.byId("lblListado").style.display=display;
					dijit.byId(this.systemComboId).domNode.style.display = display;
					dijit.byId(this.subsystemComboId).domNode.style.display = display;
					dijit.byId(this.listComboId).domNode.style.display = display;
				},
				
				displayForSt:function(display){
					dojo.byId("variableRowBt").style.display=display;
					dojo.byId("lblImplName").style.display=display;
					dojo.byId("lblServiceTemplete").style.display=display;
					dojo.byId("lblServiceTemplateImpl").style.display=display;
					dijit.byId(this.txtStNameId).domNode.style.display = display;
					dijit.byId(this.txtServiceTemplateId).domNode.style.display = display;
					dijit.byId(this.txtSTImplementationId).domNode.style.display = display;
				},
				
				_getRealIndex: function(grid){
					var currentPage = grid.fisaQtPagination.plugin._currentPage;
					var pageSize = grid.fisaQtPagination.plugin._currentPageSize;
					var index = grid.selection.selectedIndex 
					return index>=0?pageSize*(currentPage-1)+index:-1;
				},
				
				capitaliseFirstLetter: function(string){
				    return string.charAt(0).toUpperCase() + string.slice(1);
				}
			});
});
define([ "dojo/_base/kernel",
         "dojo/_base/declare",
         "dojo/_base/lang",
         "./_base",
         "ec/fisa/controller/BaseController",
		"ec/fisa/mvc/StatefulModel",
		"dojo/dom-style",
		"ec/fisa/navigation/Utils"], function(dojo, declare, lang, fisaBaseController, BaseController, StatefulModel, domStyle) {
	var PersonalTaskController = declare(
			"ec.fisa.controller.custom.PersonalTaskController", [BaseController],
			{
				tabId : null,
				pageId : null,
				model : null,
				breadcrumb : null,
				bindingContentPane : null,
				dataGridPriorityList:null,
				componentIds: null,
				data:null,
				constructor : function(tabId, pageId,initData) {
					this.data = initData || {};
					this.tabId = tabId;
					this.pageId = pageId;
					this.dataGridPriorityList=initData.dataGridPriorityList;
					this.model=new StatefulModel({});
					this.componentIds = [];
				},
				setBindingContentPane : function(newBindingContentPane) {
					this.bindingContentPane = newBindingContentPane;
				},
				addParamToModel:function(component, fieldId){
					this.componentIds.push(component.id);
					var field = null;
					if(this.data&&this.data[fieldId]){
						field = {value:this.data[fieldId],complement:null};
					}
					if(field == null) {
						field={value:'',complement:null};
						component._fStarted=true;
					} else if(field.value==null){
						field.value="";
						component._fStarted=true;
					}
					if(this.model.contains(fieldId)){
						//if exists yet updates new value.
						if(this.model.contains([fieldId]) ) {
							this.model.setValue([fieldId,'value'],field.value);
						}
					} else {
						this.model.appendObject([fieldId,'value'],field.value,component.id,'value',null,false);

						var enabled = null;
						if(field.enabled != undefined ){
							enabled = field.enabled;
						}
						this.model.appendObject([fieldId,'enabled'],enabled,component.id,'enabled',null,false);


						if(component.hasCompl){
							this.model.appendObject([fieldId,'complement'],field.complement,component.id,'complement',null,false);
						}
					}
				},
				setMessagesPanel : function(/* ec.fisa.message.Panel */newMessagesPanel) {
					this.messagesPanelId = newMessagesPanel.id;
					this.breadcrumbId = newMessagesPanel.getParent()
					.getParent().getParent().id;
				},
				saveTask : function() {
					if(this.validate() == true){
						return;
					}
					this.clearPanelMessage();
					var callObj={callbackScope:this};
					callObj.callback=this.handleWindowAction;
					callObj.errorHandler=dojo.hitch(this,this.errorHandler);
					
					PersonalTaskControllerDWR.saveTask(this.model.toPlainObject(), callObj);
				},
				
				markNotificationAsReaded:function(){
					var taskId =	this.data.taskId;
				
					this.clearPanelMessage();
					var callObj={callbackScope:this};
					callObj.callback=this.handleWindowAction;
					callObj.errorHandler=dojo.hitch(this,this.errorHandler);
					
					PersonalTaskControllerDWR.markNotificationAsReaded(taskId, callObj);
					
					
				},
				
				cancelAction:function(){
					ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
				},
				handleWindowAction:function(outcome){
					if(outcome.wAxn=="close"){
						ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
					} else if(outcome.wAxn=="cnfrm"){
						var messagesPanel = dijit.byId(this.messagesPanelId);
						messagesPanel.clearAllMessages();
						
						var breadcrumb = dijit.byId(this.breadcrumbId);
						var postClose = breadcrumb.selectedChildWidget.postClose;
						var postCloseArgs = breadcrumb.selectedChildWidget.postCloseArgs;
						
						ec.fisa.navigation.utils.showNewBreadCrumbConfirmation(outcome.confirmationDialogTitle,outcome.aMsgs,this.breadcrumbId,this.tabId, this.pageId,null,null,false);
						//ec.fisa.navigation.utils.showMsgCloseCurrentBreadCrumb(outcome.confirmationDialogTitle,outcome.aMsgs[0].summary,this.breadcrumbId);
						//Restaurando las versiones originales
						breadcrumb.selectedChildWidget.postClose = postClose;
						breadcrumb.selectedChildWidget.postCloseArgs = postCloseArgs;
						breadcrumb.selectedChildWidget.postCloseScope = ec.fisa.controller.utils.getPageController(postCloseArgs[0], postCloseArgs[1]);
					} else if(outcome.wAxn=="error"){
						var messagesPanel = dijit.byId(this.messagesPanelId);
						messagesPanel.clearAllMessages();
						this.updateMsgsPanel(outcome.aMsgs);
					}
				},
				initPriorityOptions:function(selectComponent){
					selectComponent.set("options",this.dataGridPriorityList);
				},
				validate:function(){
					var findError = false;
					dojox.lang.functional.forIn(this.componentIds, function(item, idx) {
						var cmp =dijit.byId(item);
						if(cmp != undefined && cmp != null){
							if(findError == false){
								if(cmp._componentNode != undefined && cmp._componentNode != null){
									dijit.focus(cmp._componentNode.domNode);
								}
								else{
									dijit.focus(cmp.domNode);
								}
							}
							if(cmp.hasErrorCmp != undefined && cmp.hasErrorCmp() === true){
								findError = true;
							}else if(cmp.isValid != undefined && !cmp.isValid() === true){
								findError = true;
							}
						}

					}, this);
					return findError;
				},
				hideComponent:function(component){
					domStyle.set(component,"display","none");
				}
			});
	return PersonalTaskController;
});

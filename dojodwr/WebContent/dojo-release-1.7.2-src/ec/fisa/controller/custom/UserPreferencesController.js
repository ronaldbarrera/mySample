define([
	"dojo/_base/kernel","dojo/_base/declare","dojo/_base/lang","./_base","ec/fisa/controller/BaseController","ec/fisa/mvc/StatefulModel","dojo/store/DataStore","dojo/data/ObjectStore","dojo/store/Memory"
],function(dojo,declare,lang, fisaBaseController,BaseController,StatefulModel,DataStore,ObjectStore,MemoryStore){
	
	var UserPreferencesController = declare("ec.fisa.controller.custom.UserPreferencesController", [BaseController], {
		tabId:null,
		pageScopeId:null,
		model:null,
		idSelectLanguage:null,
		idSelectStyle:null,
		idSelectMenu:null,
		breadcrumbId:null,
		idSelectMenuPref:null,
		constructor: function (tabId,pageScopeId) {
			this.tabId=tabId;
			this.pageScopeId=pageScopeId;
			UserPreferencesDWR.init(this.tabId,{callbackScope:this,
				callback:function(data){
				delete data.tabId;
				this.init(data);
			}
			,errorHandler:dojo.hitch(this,this.errorHandler)});
		},
		setMessagesPanel : function(messagesPanel){
			this.inherited(arguments);
			if(typeof this.breadcrumbId === 'undefined' || this.breadcrumbId == null){
				var breadCrumb=ec.fisa.controller.utils.findCurrentBreadCrumb(messagesPanel);
				if(breadCrumb){
					this.breadcrumbId=breadCrumb.id;
				}
			}
		},
		init:function(data){
			var languageList=data.languageList;
			var styleList=data.styleList;
			var styleMenuList=data.styleMenuList;
			//SPM menu preferencias
			var preferenceList=data.preferenceList;
			/*delete data.languageList;
			delete data.styleList;
			delete data.styleMenuList;*/
			//Favor generar el modelo despues de haber limpiado la data que sirve para poblar la pantalla inicialmente, excepto los items de las grillas
			this.model = new StatefulModel( {} );
			this.idSelectLanguage.set("options",languageList);
			//appendObject:function(/*Array*/prefix,/*Object*/value, componentId, cmpProp, cmpFrmt,cmpChng)
			this.model.appendObject(['selectedLanguage'],data.selectedLanguage,this.idSelectLanguage.id,'value',null,null);
			
			//this.idSelectLanguage.set("ref",this.model.selectedLanguage);
			this.idSelectStyle.set("options",styleList);
			//this.idSelectStyle.set("ref",this.model.selectedStyle);
			this.model.appendObject(['selectedStyle'],data.selectedStyle,this.idSelectStyle.id,'value',null,null);
			
			this.idSelectMenu.set("options",styleMenuList);
			//this.idSelectMenu.set("ref",this.model.selectedStyleMenu);
			this.model.appendObject(['selectedStyleMenu'],data.selectedStyleMenu,this.idSelectMenu.id,'value',null,null);
			
			//menu preferencias SPM
			this.idSelectMenuPref.set("options",preferenceList);
			//this.idSelectMenuPref.set("ref",this.model.selectedStyleMenuPref);
			this.model.appendObject(['selectedStyleMenuPref'],data.selectedStyleMenuPref,this.idSelectMenuPref.id,'value',null,null);
		},
		submitAction:function(){
			this.clearPanelMessage();
			UserPreferencesDWR.save(this.tabId, this.pageScopeId, this.model.toPlainObject(),{
				callbackScope:this,
				callback:this.submitActionHandler,
				errorHandler:dojo.hitch(this,this.errorHandler)
			});
		},
		submitActionHandler:function(outcome){
			var messagesPanel = dijit.byId(this.messagesPanelId);
			messagesPanel.clearAllMessages();
			this.updateMsgsPanel(outcome.aMsgs);
			if(outcome.dst){
				document.location.reload(true);
			}
		},
		close:function(){
			ec.fisa.navigation.utils.closeCurrentBreadCrumb(this.breadcrumbId);
			ec.fisa.menu.utils.addEmptyTabAllClosed(dojo.config.fisaNewTabLabel);
		}
    });
	return UserPreferencesController;
});
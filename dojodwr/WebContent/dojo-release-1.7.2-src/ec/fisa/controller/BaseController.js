define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/_base/connect",
	"./_base",
	"dojo/dom-geometry",
	"dojo/dom-style",
	"ec/fisa/controller/Utils",
	"ec/fisa/print/Utils",
	"dojo/topic",
	"ec/fisa/navigation/Utils",
	"ec/fisa/validation/Utils"
],function(dojo,declare,lang,array,connect,fisaBaseController,domGeom,domStyle,fisaControllerUtils,fisaPrint,topic){
	
	var BaseController = declare("ec.fisa.controller.BaseController", null, {
		/*String*/
		messagesPanelId:null,
		penddingMessages:null,
		bindingForm:null,
		dojoComponents:null,//Objeto pensado para almacenar referencias de los componentes visuales de una página, actualmente se llena al momento de invocar al método addParamToModel en QtController
		constructor:function(){
			
		},
		setPenddingMessages:function(penddingMessages){
			this.penddingMessages=penddingMessages;
		},
		setMessagesPanel:function(messagesPanel){
			this.messagesPanelId=messagesPanel.id;
			if(this.penddingMessages!=null){
				this.updateMsgsPanel(this.penddingMessages);
			}
		},
		updateMsgsPanel:function(msgs){
			if(msgs){
				var messagesPanel = dijit.byId(this.messagesPanelId);
				if(messagesPanel){
					messagesPanel.update(msgs, this.isComponentMsg,this.addComponentMsg,this);
				}
			}
		},
		//close popup msg panel
		closePopupMsgPanel:function(){
			var messagesPanel = dijit.byId(this.messagesPanelId);
			messagesPanel.closePopup();
		},
		
		clearPanelMessage:function(){
			if(this.messagesPanelId){
				var messagesPanel = dijit.byId(this.messagesPanelId);
				messagesPanel.clearAllMessages();
			}
		},
		
		/* This function has to be override by each controller*/
		isComponentMsg:function(message){
			return false;
		},
		/* This function has to be override by each controller*/
		addComponentMsg:function(message){
		},
		errorHandler:function(msg,ex){
			this.updateMsgsPanel([{level:{level:40000},summary:msg, detail:ex.javaClassName}]);
		},
		obtainInitialValue:function(component){
			var eid=component["bt-id"];
			var fid=component["field-id"];
			var field = null;
			if(this.data&&this.data[eid]&&this.data[eid].dataMessage){
				field = this.data[eid].dataMessage.fields[fid];
			}
			if((field == null)||(field.value==null)) {
				return "";
			} else {
				return field.value;
			}
		},
		printLog: function(obj){/*Permite presentar un mensaje en la consola de javascript.  Usarlo solo en desrrollo*/
			//if(typeof console != "undefined"){
				//console.log(obj);
			//}
		},
		printPage:function(button){
			var fisaTheme=dojo.config.fisaTheme;
			var fisaSkinContextPath=dojo.config.fisaSkinContextPath;
			var fisaContextPath=dojo.config.fisaContextPath;
			var node=ec.fisa.navigation.utils.obtainParentBreadCrumb(button).selectedChildWidget;
			var dimen=domGeom.getMarginBox(node.domNode);
			var h=dimen.h+50;
			var w=dimen.w+50;
			var WindowObject = window.open('', 'PrintWindow', 'width='+w+',height='+h+',top=0,left=0,toolbars=no,scrollbars=yes,status=no,resizable=yes');
		 
			var imageNode= dojo.byId("logoCompanyUserBar");
			var imageSrc=null;
			if(imageNode){
				 imageSrc=ec.fisa.controller.utils.parseCssUrl(domStyle.get(imageNode,"backgroundImage"));
			}
			var strHtml = '';
			strHtml +='<script type="text/javascript">';
			strHtml +='var data=';
			var data=this.extractPrintData(node.domNode);
			data=dojo.toJson(data);
			if(data){
				strHtml +=data;
			} else {
				strHtml +='{}';
			}
			strHtml +=';';
			strHtml +='</script>';
			var children = node.getChildren();
			dojo.forEach(children,function(item){
				strHtml +=item.domNode.innerHTML;
			},this);
			var pHtml=fisaPrint.replaceVariables({'inject':strHtml,'currentStyle':fisaTheme, 'contextPath':fisaContextPath,'logoImg':imageSrc,'skinContextPath':fisaSkinContextPath,'dojoReleaseName':dojo.config.dojoRelaseName,'themeVersion':dojo.config.fisaThemeVersion});
			pHtml=pHtml.replace("inline-table","block");
			delete strHtml;
			WindowObject.document.writeln(pHtml);
			WindowObject.document.close();
			WindowObject.focus();
		}, extractPrintData:function(parentNode) {
			var outcome = {};
			if(parentNode){
				var inputs = parentNode.getElementsByTagName("input");
				if(inputs){
					dojo.forEach(inputs,this.addPrintComponent,outcome);
				}
				var textas = parentNode.getElementsByTagName("textarea");
				if(textas){
					dojo.forEach(textas,this.addPrintComponent,outcome);
				}
			}
			return outcome;
		},
		addPrintComponent:function(inpt){
			if(inpt.id!=""){
				this[inpt.id]=inpt.value;
			}
		},
		publishChange:function(btId, tabId, pageScopeId, changedComponent){
			topic.publish("verifiyUpdate_" + btId + '_' + tabId + '_' + pageScopeId, changedComponent);
		},
		//just generate msg to send to panel
		generateMsg:function(/*string*/label,/*string*/detail ,/*int*/level){
			var message = [{summary: label ,detail:detail,level:{level:level}}];
			return message;
		},
		applyValidator:function(component){
			//Se determina si el componente tiene validador asociado.
			var validator = ec.fisa.validation.utils.findValidator(component);
			
			var outcome = true;
			if(validator != undefined && lang.isFunction(validator)){
				outcome = validator(component);
				this.clearPanelMessage();
			}
			if(outcome == false){
				component.set("value", null, false);
				var message =this.generateMsg(component.validationMessage,"",40000);
				this.updateMsgsPanel(message);
			}
			return outcome;
		}
	});
	return BaseController;
});

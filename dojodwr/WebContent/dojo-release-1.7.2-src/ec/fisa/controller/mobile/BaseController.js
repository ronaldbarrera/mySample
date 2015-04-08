define(["dojo/_base/kernel",
    	"dojo/_base/declare",
    	"./_base"],function(dojo,declare,fisaBaseController){
	
	var BaseController = declare("ec.fisa.mobile.BaseControler",null,{
		/*variables*/
		messagesPanelId:null,
		penddingMessages:null,
		isLastBt:null,
		bindingForm:null,
//		dojoComponents:null,//Objeto pensado para almacenar referencias de los componentes visuales de una página, actualmente se llena al momento de invocar al método addParamToModel en QtController
		constructor:function(){
			
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
				messagesPanel.isLastBt = this.isLastBt;
				if(messagesPanel){
					console.log(msgs);
					messagesPanel.update(msgs, this.isComponentMsg,this.addComponentMsg,this);
				}
			}
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
			console.log("msg", msg);
			console.log("ex", msg);
		}
		
	});
	return BaseController;
});
define(["dojo/_base/kernel",
        "dojo/_base/declare",
        "dijit/_WidgetBase", 
        "dijit/_Templated",
        "dojo/text!./templates/MessagePanel.html",
        "dojox/mobile/Button",
        "dojo/dom-construct",
        "dojo/dom-style",
        "dojo/_base/window",
        "ec/fisa/message/_MessagePanelMixin",
        "dojox/mobile/SimpleDialog"],
    function(dojo, declare, _WidgetBase, _Templated,template,Button,domConstruct,domStyle,win, _MessagePanelMixin,SimpleDialog){
        return declare("ec.fisa.mobile.widget.MessagePanel",[_WidgetBase, _Templated, _MessagePanelMixin], {
        	
    		templateString: template,
    		fisatabid:"",
    		fisapageid:"",
    		ispopup: false,
        	_acceptBtn:null,
        	simpleDialog:null,
        	simpleDialogId:"",
        	initializer:"",
        	_parentPanelCnt:null,
        	widgetsInTemplate : true,
        	isLastBt:null,
        	
        	constructor:function(){
				this._fisaOns=[];
				this._msgQuantity = 0;
			},
			
			postCreate: function(){
        		this.inherited(arguments);
        		if(dijit.byId(this.simpleDialogId)){
        			this.destroy();
        		}
        		if(this.ispopup){
        			var dialog = new SimpleDialog({},domConstruct.create("div",{},win.doc.body));
        			this.simpleDialogId = dialog.id;
        			domStyle.set(this._acceptBtn.domNode,"display","block");
        			domConstruct.place(this._parentPanelCnt,dialog.containerNode);
        			domConstruct.create("span",{innerHTML:dojo.config.fsesAcceptLabel},this._acceptBtn.domNode);
        			this._acceptBtn.value=dojo.config.fsesAcceptLabel;
        			this._acceptBtn.on("click",dojo.hitch(this,this.hideSimpleDialog));
        		}
        	},
        	
        	startup: function(){
        		this.inherited(arguments);
        		this._fisaOns=[];
        		var ctrlr=ec.fisa.controller.mobile.utils.getPageController(this.fisatabid,this.fisapageid);
        		if(ctrlr){
        			ctrlr.setMessagesPanel(this);
        		}
        		if(this.initializer && this.initializer!=""){
        			var funct = new Function(this.initializer);
        			this.initializer = null;
        			var init = funct.call();
        			funct = null;
        			if(init.initmsg){
        				dojo.forEach(init.initmsg,function(msg){
        					if(msg.level==null){
        						msg.level = {level:40000};
        						msg.summary=msg.comments;
        						msg.detail=msg.description;
        						
        					}
        				},this);
        			}
        			this.update(init.initmsg,null,null,this);
        		}
        	},
        	
        	update:function(msgs,isComponentMsgFnctn,addComponentMsgFnctn,scopeObj){
        		if(msgs && msgs.length>0 && this.ispopup){
        			var dialog = dijit.byId(this.simpleDialogId)
        			dialog.show();
        			domStyle.set(this._parentPanelCnt,"display","inline");
        			domStyle.set(this._parentPanelCnt,"visibility","visible");
        		}
        		this.inherited(arguments);
        	},
        	
        	hideSimpleDialog: function(){
        		var dialog = dijit.byId(this.simpleDialogId);
        		if(dialog){
        			dialog.hide();
        		}
        		if(this.isLastBt){
        			var tohome = dijit.byId("viewPort");
        			tohome.performTransition("home",1,"fade",null);
        		}
        	},
        	
        	destroy:function(){
        		if(this.ispopup){
        			var dialog = dijit.byId(this.simpleDialogId);
        			if(dialog){
        				dialog.destroy(false);
        				this.simpleDialog=null;
        			}
        		}
        		this.inherited(arguments);
        	}
        });
});
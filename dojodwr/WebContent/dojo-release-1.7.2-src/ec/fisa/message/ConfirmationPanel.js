define([
		"./_base",
		"dijit/_Widget",
		"dijit/_Templated",
		"dojo/_base/declare",
		"dojo/_base/connect",
		"dojo/dom-construct",
		"dojo/text!ec/fisa/message/templates/ConfirmationPanel.html",
		"dojo/dom-attr",
		"dojo/on",
		"dojox/widget/DialogSimple",
		"dojox/html/entities"
	], function(_panelBase,_Widget, _Templated, declare, connect, domConstruct,template, domAttr, on, DialogSimple){

		return declare("ec.fisa.message.ConfirmationPanel", [_Widget, _Templated], {
			_errorPanel:null,
			_warnPanel:null,
			_infoPanel:null,
			_errorPanelCnt:null,
			_warnPanelCnt:null,
			_infoPanelCnt:null,
			_errorPanelDetail:null,
			_warnPanelDetail:null,
			_infoPanelDetail:null,
			_parentPanelCnt:null,
			/*variable indicating mode in it is presented the panel error*/
			errorAdded:"",
			
			
			
			_msgQuantity:0,
			tabId:"",
			pageScopeId:"",
			bindToController:false,
			_fisaOns:null,
			widgetsInTemplate : false,
			templateString: template,
			constructor:function(){
				this._fisaOns=[];
				this._msgQuantity = 0;
				errorAdded= 0;
			},
			destroyRendering:function(){
				errorAdded= "";
				this._msgQuantity = 0;
				this.removeOns(true);
				delete this._errorPanel;
				delete this._warnPanel;
				delete this._infoPanel;
				delete this._errorPanelCnt;
				delete this._warnPanelCnt;
				delete this._infoPanelCnt;
				delete this._errorPanelDetail;
				delete this._warnPanelDetail;
				delete this._infoPanelDetail;
				delete this._parentPanelCnt;
			},
			appendMsgToPanel:function(panel,panelCnt,msg,msgDetail){
				
				this._msgQuantity = this._msgQuantity +1;
				var row1 = panel.insertRow(panel.rows.length);
				var cell1 = row1.insertCell(row1.cells.length);
				/*if(msgDetail){
					var row2 = panel.insertRow(panel.rows.length);
					var cell2=row2.insertCell(row2.cells.length);
					this.createDetailLink(cell2,msgDetail);
				}*/
				cell1.innerHTML=dojox.html.entities.encode(msg);
				if(panelCnt.style.display=="none"){
					panelCnt.style.display="";
					this._parentPanelCnt.style.display="";
				}
				if(panelCnt.style.visibility=="hidden"){
					panelCnt.style.visibility="";
					this._parentPanelCnt.style.visibility="";
				}
			},
			addInfoMessage:function(infoMsg,infoMsgDetail){
				this.appendMsgToPanel(this._infoPanelDetail,this._infoPanelCnt,infoMsg,infoMsgDetail);
			},
			addWarnMessage:function(warnMsg,warnMsgDetail){
				this.appendMsgToPanel(this._warnPanelDetail,this._warnPanelCnt,warnMsg,warnMsgDetail);
		   	},
			addErrorMessage:function(errorMsg,errorMsgDetail){
				this.appendMsgToPanel(this._errorPanelDetail,this._errorPanelCnt,errorMsg,errorMsgDetail);
				this.errorAdded= "true";
			},
			
			messagesPanelEmpty:function(){
				if(this._msgQuantity === 0){
					return true;
				}
				return false;
			},
			
			/**Obtains if the messages panel has an error.*/
			messagesPanelWithErrors:function(){
			 var result = false;
				var isEmpty =this.messagesPanelEmpty();
			 if(isEmpty == false){
				 if(this.errorAdded == "true"){
					 result = true;
				 }
			 }
			 return result;
			},
			
			
			
			
			clearAllMessages:function(){
				this._msgQuantity  = 0;
				errorAdded= "";
				this.removeOns();
				this._parentPanelCnt.style.display="none";
				this._parentPanelCnt.style.visibility="hidden";
				this._infoPanelCnt.style.display="none";
				this._infoPanelCnt.style.visibility="hidden";
				this._warnPanelCnt.style.display="none";
				this._warnPanelCnt.style.visibility="hidden";
				this._errorPanelCnt.style.display="none";
				this._errorPanelCnt.style.visibility="hidden";
				var l = this._infoPanelDetail.rows.length;
				var i=0;
				for(; i < l; ++i){
					this._infoPanelDetail.deleteRow(0);
				}
				l = this._warnPanelDetail.rows.length;
				i=0;
				for(; i < l; ++i){
					this._warnPanelDetail.deleteRow(0);
				}
				l = this._errorPanelDetail.rows.length;
				i=0;
				for(; i < l; ++i){
					this._errorPanelDetail.deleteRow(0);
				}
			},
			createDetailLink:function(container,msgDetail){
				var anchor = domConstruct.create("span",{'class':'link'},container);
				anchor.innerHTML='Ver Detalle';
				anchor.fisaDetail=this.replaceCarret(msgDetail);
				this._fisaOns.push(on(anchor,"click",function(){
					var dialogArgs={title:"Detalle",content:this.fisaDetail,executeScripts:false};
					var currentFisaModal = new dojox.widget.DialogSimple(dialogArgs);
					currentFisaModal.startup();
					currentFisaModal.set("draggable",false);
					connect.connect(currentFisaModal,"hide",function(){
						this.destroyRecursive();
					});
					currentFisaModal.resize({w:250,h:150});
					currentFisaModal.show();
					var stl= currentFisaModal.containerNode.style;
					stl.wordWrap="break-word";
					stl.overflow="auto";
				}));
			},
			replaceCarret:function(msg){
				if(msg!=null){
					var outcome = "";
					var parts=msg.split("\n");
					dojo.forEach(parts,function(part,i){
						if(i!=0){
							outcome+="<br/>";
						}
						outcome+=dojox.html.entities.encode(part);
					},this);
					return outcome;
				}
				return "";
			},
			removeOns:function(destroy){
				var d=destroy||false;
				if(this._fisaOns){
					dojo.forEach(this._fisaOns,function(item){
						item.remove();
					},this);
					if(destroy){
						delete this._fisaOns;
					}else{
						this._fisaOns=[];
					}
				}
			},
			startup:function(){
				this.inherited(arguments);
				if(this.bindToController){
					ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId).setMessagesPanel(this);
				}
			},
			update:function(msgs,isComponentMsgFnctn,addComponentMsgFnctn,scopeObj){
				if (msgs) {
					var isComponentMsg=isComponentMsgFnctn||function(){return false;};
					var addComponentMsg=addComponentMsgFnctn||function(){};
					var scope=scopeObj||dojo.global;
					dojo.forEach(msgs, function(message) {
						/* Error level */
						if (message.level.level == 40000) {
							this.addErrorMessage(message.summary,
								message.detail);
							if (isComponentMsg.call(scope,message)) {
								addComponentMsg.call(scope,message);
							}
						/* Warning level */
						} else if (message.level.level == 30000) {
							this.addWarnMessage(message.summary,
								message.detail);
							if (isComponentMsg.call(scope,message)) {
								addComponentMsg.call(scope,message);
							}
						/* info level */
						} else if (message.level.level == 20000) {
							this.addInfoMessage(message.summary,
								message.detail);
							if (isComponentMsg.call(scope,message)) {
								addComponentMsg.call(scope,message);
							}
						}
					}, this);
				}
			}
		});
	});

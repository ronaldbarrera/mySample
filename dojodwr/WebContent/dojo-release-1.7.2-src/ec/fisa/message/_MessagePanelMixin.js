define([
	"dojo/_base/declare",
	"./_base",
	"dojo/dom-construct",
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/on"
], function(declare,_base,domConstruct,domClass,domStyle,on){
	return declare("ec.fisa.message.MessagePanelMixin",null,{
		_parentPanelCnt:null,
		_errorPanelCnt:null,
		_warnPanelCnt:null,
		_infoPanelCnt:null,
		_errorPanelDetail:null,
		_warnPanelDetail:null,
		_infoPanelDetail:null,
		_errorn:null,
		_warnn:null,
		_infon:null,
		_errori:null,
		_warni:null,
		_infoi:null,
		_errornc:0,
		_warnnc:0,
		_infonc:0,
		_ddbtnid:null,
		_msgQuantity:0,
		popup:false,
		_fisaOns:null,
		createdInsideConfirmation:"false",
		
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
			if(this.popup){
				this._errornc=0;
				this._warnnc=0;
				this._infonc=0;
				var btn=dijit.byId(this._ddbtnid);
				domStyle.set(btn.domNode,"display","none");
				domStyle.set(this._errorn,"display","none");
				domStyle.set(this._errori,"display","none");
				domStyle.set(this._warnn,"display","none");
				domStyle.set(this._warni,"display","none");
				domStyle.set(this._infon,"display","none");
				domStyle.set(this._infoi,"display","none");
				btn.closeDropDown();
			}
		},
		update:function(msgs,isComponentMsgFnctn,addComponentMsgFnctn,scopeObj){
			if (msgs) {
				var isComponentMsg=isComponentMsgFnctn||function(){return false;};
				var addComponentMsg=addComponentMsgFnctn||function(){};
				
				var scope=scopeObj||dojo.global;
				dojo.forEach(msgs, function(message) {
					var fieldFound = false;
					/* Error level */
					if (message.level.level == 40000) {
						if (isComponentMsg.call(scope,message)) {
							fieldFound =addComponentMsg.call(scope,message);
						} 
						if(fieldFound == false){
							this.addErrorMessage(message.summary,
									message.detail);
						}
					/* Warning level */
					} else if (message.level.level == 30000) {
						if (isComponentMsg.call(scope,message)) {
							fieldFound =addComponentMsg.call(scope,message);
						} 
						if(fieldFound == false){
							fileFound =this.addWarnMessage(message.summary,
									message.detail);
						}
					/* info level */
					} else if (message.level.level == 20000) {
						if (isComponentMsg.call(scope,message)) {
							fileFound =addComponentMsg.call(scope,message);
						} 
						if(fieldFound == false){
							this.addInfoMessage(message.summary,
									message.detail);
						}
					}
				}, this);
			}
		},
		
		addInfoMessage:function(infoMsg,infoMsgDetail){
			this.appendMsgToPanel(this._infoPanelDetail,this._infoPanelCnt,infoMsg,infoMsgDetail,this._infon,this._infoi,"_infonc");
		},
		addWarnMessage:function(warnMsg,warnMsgDetail){
			this.appendMsgToPanel(this._warnPanelDetail,this._warnPanelCnt,warnMsg,warnMsgDetail,this._warnn,this._warni,"_warnnc");
		},
		addErrorMessage:function(errorMsg,errorMsgDetail){
			this.appendMsgToPanel(this._errorPanelDetail,this._errorPanelCnt,errorMsg,errorMsgDetail,this._errorn,this._errori,"_errornc");
			this.errorAdded= "true";
		},
		
		appendMsgToPanel:function(panel,panelCnt,msg,msgDetail,countcontainer,countimage,countf){
			//inside confirmation dont apped any messages.
			if(this.createdInsideConfirmation != "true"){
			
			this._msgQuantity = this._msgQuantity +1;
			var row1 = panel.insertRow(panel.rows.length);
			var cell1 = row1.insertCell(row1.cells.length);
			var cellSpan1 = domConstruct.create("span",{},cell1);
			cellSpan1.innerHTML=msg;
			if(dojo.config.fisaFinalUser=="0"){
				var cell2=row1.insertCell(row1.cells.length);
				domClass.add(cell2,"tddetail");
				if(msgDetail){
					this.createDetailLink(cell2,msgDetail);
				}
			}
			if(panelCnt.style.display=="none"){
				panelCnt.style.display="";
				this._parentPanelCnt.style.display="";
			}
			if(panelCnt.style.visibility=="hidden"){
				panelCnt.style.visibility="";
				this._parentPanelCnt.style.visibility="";
			}
			if(this.popup){
				this[countf]=this[countf]+1;
				countcontainer.innerHTML=this[countf];
				domStyle.set(countcontainer,"display","inline-block");
				domStyle.set(countimage,"display","inline-block");
				var btn=dijit.byId(this._ddbtnid);
				domStyle.set(btn.domNode,"display","inline-block");
				btn.loadAndOpenDropDown();
			}
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
				currentFisaModal.connect("hide",function(){
					this.destroyRecursive();
				});
				currentFisaModal.resize({w:280});
				currentFisaModal.show();
				var stl= currentFisaModal.containerNode.style;
				stl.wordWrap="break-word";
				stl.overflow="auto";
			}));
		},
		
		removeOns:function(destroy){
			var d=destroy||false;
			if(this._fisaOns){
				dojo.forEach(this._fisaOns,function(item){
					item.remove();
				},this);
				if(d){
					delete this._fisaOns;
				}else{
					this._fisaOns=[];
				}
			}
		}
		
	});
});
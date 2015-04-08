define([
		"dijit/_Widget",
		"dijit/_Templated",
		"dojo/_base/declare",
		"dojo/_base/connect",
		"dojo/dom-construct",
		"dojo/on",
		"dojox/mobile/SimpleDialog",
		"dojo/text!ec/fisa/mobile/message/templates/Panel.html",
		"dojox/html/entities",
		"./_base"
	], function(_Widget, _Templated, declare, connect, domConstruct, on, DialogSimple, template){

		return declare("ec.fisa.mobile.message.Panel", [_Widget, _Templated], {
			_errorPanel:null,
			_warnPanel:null,
			_infoPanel:null,
			_errorPanelTitle:null,
			_warnPanelTitle:null,
			_infoPanelTitle:null,
			_errorPanelCnt:null,
			_warnPanelCnt:null,
			_infoPanelCnt:null,
			_parentPanelCnt:null,
			widgetsInTemplate : false,
			templateString: template,
			appendMsgToPanel:function(panel,panelCnt,msg,msgDetail){
				var row = panel.insertRow(panel.rows.length);
				var cell1 = row.insertCell(row.cells.length);
				var cell2 = row.insertCell(row.cells.length);
				if(msgDetail){
					this.createDetailLink(cell1,msgDetail);
				}
				cell2.innerHTML=dojox.html.entities.encode(msg);
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
				this.appendMsgToPanel(this._infoPanel,this._infoPanelCnt,infoMsg,infoMsgDetail);
			},
			addWarnMessage:function(warnMsg,warnMsgDetail){
				this.appendMsgToPanel(this._warnPanel,this._warnPanelCnt,warnMsg,warnMsgDetail);
		   	},
			addErrorMessage:function(errorMsg,errorMsgDetail){
				this.appendMsgToPanel(this._errorPanel,this._errorPanelCnt,errorMsg,errorMsgDetail);
			},
			clearAllMessages:function(){
				this._parentPanelCnt.style.display="none";
				this._parentPanelCnt.style.visibility="hidden";
				this._infoPanelCnt.style.display="none";
				this._infoPanelCnt.style.visibility="hidden";
				this._warnPanelCnt.style.display="none";
				this._warnPanelCnt.style.visibility="hidden";
				this._errorPanelCnt.style.display="none";
				this._errorPanelCnt.style.visibility="hidden";
				var l = this._infoPanel.rows.length;
				var i=0;
				for(; i < l; ++i){
					this._infoPanel.deleteRow(0);
				}
				l = this._warnPanel.rows.length;
				i=0;
				for(; i < l; ++i){
					this._warnPanel.deleteRow(0);
				}
				l = this._errorPanel.rows.length;
				i=0;
				for(; i < l; ++i){
					this._errorPanel.deleteRow(0);
				}
			},
			createDetailLink:function(container,msgDetail){
				var anchor = domConstruct.create("span",{href:"javascript:;",innerHTML:'Ver Detalle'},container);
				anchor.fisaDetail=msgDetail;
				on(anchor,"click",function(){
					var dialogArgs={title:"Detalle",content:dojox.html.entities.encode(this.fisaDetail),executeScripts:false};
					var currentFisaModal = new DialogSimple(dialogArgs);
					currentFisaModal.startup();
					connect.connect(currentFisaModal,"hide",function(){
						this.destroyRecursive();
					});
					currentFisaModal.resize({w:250,h:150});
					currentFisaModal.show();
				});
			}
		});
	});

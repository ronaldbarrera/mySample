define([
    "./_base",
    "dojo/_base/declare",
	"dojo/_base/connect",
	"dojo/_base/lang",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!ec/fisa/report/templates/QtReport.html",
	"dijit/form/Button",
	"dijit/form/Select",
	"dojo/on",
	"dijit/form/DropDownButton",
	"dijit/MenuItem",
	"ec/fisa/dwr/proxy/QtControllerDWR"
], function(_fisaBase,declare, connect, lang, domConstruct, domStyle, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, qtReportTemplate, Button, Select, on,DropDownButton){
	return declare("ec.fisa.report.QtReport", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		_pdfLink:null,
		_excelLink:null,
		_wordLink:null,
		_languageSelect:null,
		_report_Link:null,
		_format_button:null,
		exportLabel:"Export",
		languageLabel:"Language",
		templateString:qtReportTemplate,
		model:null,
		async:true,
		reportData:null,
		_tdBtn:null,
		_tdLan:null,
		popup:true,
		showQtButtonMail:false,
		reportSendMailLabel:"",
		hideLanguageSlct:false,
		startup: function(){
			this.inherited(arguments);
			
			var fisaTabId = this["fisa-tab-id"];
			var fisaPageScopeId = this["fisa-page-scope-id"];
			
			var qtController = ec.fisa.controller.utils.getPageController(fisaTabId,fisaPageScopeId);
			if(qtController!= null && qtController != undefined ){
				qtController.reportWdgtId = this.id;
			}
			
			if(this.async){
				QtControllerDWR.initQTReportData({ 
					callbackScope:this,
					callback:this.postStart
				});
			}else{
				this.postStart(this.reportData);
				this.reportData=null;
			}
		},
		postStart:function(data){
			this.languageIsoList=data.languageIsoList;
			var _sel=new Select({options:data.languageList},domConstruct.create("div",{},this._tdLan));
			_sel.startup();
			this.connect(_sel,"onChange",dojo.hitch(this,this._onLanguageChange));
			this._languageSelect=_sel.id;
			if(this.hideLanguageSlct){
				domStyle.set(_sel.domNode,"display","none");
				domStyle.set(_sel.domNode,"visibility","hidden");
			}
			var exportFormatList = data.exportFormatList;
			delete data.languageList;
			delete data.exportFormatList;
			this._format_button=[];
			if(this.popup){
				var menu = new dijit.Menu({ });
				var tr =domConstruct.create("tr",{},domConstruct.create("tbody",{},domConstruct.create("table",{cellspacing:0,cellpadding:0,border:0},this._tdBtn)));
				this._initFormatMenu(exportFormatList,menu);
				var _btn=new DropDownButton({
					label: this.exportLabel,
					dropDown: menu
				},domConstruct.create("div",{},domConstruct.create("td",{},tr)));
				this.createSendMailButton(tr);
				this._format_button.push(_btn.id);
			} else {
				this._initFormatBtns(exportFormatList);
			}
			this._onLanguageChange();
		},
		_initFormatBtns:function(options){
			if (options && options.length>0) {
				var tr =domConstruct.create("tr",{},domConstruct.create("tbody",{},domConstruct.create("table",{cellspacing:0,cellpadding:0,border:0},this._tdBtn)));
				dojo.forEach(options, function(outputParam, index){
					if(index!=0){
						domConstruct.place("<span>&nbsp;<span>",domConstruct.create("td",{},tr));
					}
					var labelW= outputParam[1];
					var valueW= outputParam[0];
					var iconClassW = outputParam[4];
					var btn =new Button({
						label:labelW,
						fwid:this.id,
						tooltip:labelW,
						formatV:valueW,
						iconClass:iconClassW,
						onClick: function(){
							var widget=dijit.byId(this.fwid);
							window.open(widget._report_Link+this.formatV);
						}
					},domConstruct.create("div",{},domConstruct.create("td",{},tr)));
					btnClass=btn.domNode.className;
					btn.domNode.className=btnClass+" buttonDownloadPDF buttonDownloadExcel buttonSendEmail buttonDownloadWord";
					this._format_button.push(btn.id);
				},this);
				this.createSendMailButton(tr);
			}
		},
		
		//button for send mail with report in pdf
		createSendMailButton:function(/*Object*/tr){
			if(this.showQtButtonMail){
				domConstruct.place("<span>&nbsp;<span>",domConstruct.create("td",{},tr));
				var btnMail = new Button({
					label:this.reportSendMailLabel,
					fwid:this.id,
					tooltip:this.reportSendMailLabel,
					iconClass:"email_icon",
					onClick: dojo.hitch(this, function(){
						var fisaTabId = this["fisa-tab-id"];
						var fisaPageScopeId = this["fisa-page-scope-id"];
						
						var qtController = ec.fisa.controller.utils.getPageController(fisaTabId,fisaPageScopeId);
						var callObj={ callbackScope:this,
								callback:this.sendQtReportMailCallback,
								errorHandler:dojo.hitch(qtController,qtController.errorHandler)};
						
						
						QtControllerDWR.sendQtReportMail(fisaTabId,fisaPageScopeId,this._report_Link,callObj);
						
					})
				},domConstruct.create("div",{},domConstruct.create("td",{className:"qtSendMailButton"},tr)));
				btnClass=btnMail.domNode.className;
				btnMail.domNode.className=btnClass+" buttonSendEmail";
				this._format_button.push(btnMail.id);
			}
		},
		//call back del metodo de envio del mail
		sendQtReportMailCallback:function(/*object*/outcome){
			var fisaTabId = this["fisa-tab-id"];
			var fisaPageScopeId = this["fisa-page-scope-id"];
			var qtController = ec.fisa.controller.utils.getPageController(fisaTabId,fisaPageScopeId);
			
			qtController.clearPanelMessage();
			qtController.model.clearAllMessages();
			if(outcome.wAxn=="error"){
				qtController.updateMsgsPanel(outcome.aMsgs);
			}
			else if(outcome.wAxn=="cnfrm"){
				qtController.updateMsgsPanel(outcome.aMsgs);
			}
		},
		
		_initFormatMenu:function(options,menu){
			if (options && options.length>0) {
				dojo.forEach(options, function(outputParam, index){
					var labelW= outputParam[1];
					var valueW= outputParam[0];
					var iconClassW = outputParam[4];
					var iconFile= dojo.config.fisaSkinContextPath+'/cache/'+dojo.config.fisaThemeVersion+'/images/word_icon.png';
					var menuItem = new dijit.MenuItem({
								label:labelW,
								fwid:this.id,
								tooltip:labelW,
								formatV:valueW,
								iconClass:iconClassW,
								onClick: function(){
									var widget=dijit.byId(this.fwid);
									window.open(widget._report_Link+this.formatV);
								}
							});
					menu.addChild(menuItem);
				},this);
			}
		},
		_onLanguageChange:function(){
			var qtId = this["qt-id"];
			var fisaTabId = this["fisa-tab-id"];
			var fisaPageScopeId = this["fisa-page-scope-id"];
			var language = null;
			var languageIso = null;
			if(this._languageSelect!=null){
				var sel=dijit.byId(this._languageSelect);
				if(sel!=null){
					language =sel.get("value");
				}
				if(this.languageIsoList!=null){
					dojo.forEach(this.languageIsoList, function(iso, index){
						var languageId = iso.value;
						if (languageId == language) {
							var isoCode = iso.label;
							languageIso = isoCode;
						}
					},this);
				}
			}
			var report = dojo.config.fisaContextPath+"/qtReport?tabId=" + fisaTabId 
				+ "&pageScopeId=" + fisaPageScopeId
				+ "&qtId=" + qtId
				+ "&language=" + language
				+ "&languageIso=" + languageIso;
			this._report_Link = report + "&format=";
		},
		disableBtns:function(totalMatchCount){
				dojo.forEach(this._format_button,function(key){
					var wdgtButton = dijit.byId(key);
					this.disableBtn(totalMatchCount, wdgtButton);
				},this);
			
		},
		disableBtn:function(totalMatchCount, wdgtButton){
			if(wdgtButton != null){
				if(totalMatchCount == 0){
					dojo.setAttr(wdgtButton,"disabled",true);
				} else {
					dojo.setAttr(wdgtButton,"disabled",false);
				}
				dijit.focus(wdgtButton.domNode);
			}
		}
	});
});

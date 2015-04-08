define([
        "dojo/_base/kernel","dojo/_base/declare","dojo/_base/lang","./_base",
        "ec/fisa/controller/BaseController","ec/fisa/navigation/Utils","ec/fisa/menu/Utils","dojo/dom-style",
        "dojo/dom-construct","dojo/dom-geometry",
        "dojox/mvc","dojo/on","ec/fisa/message/ConfirmationPanel","ec/fisa/dwr/proxy/PlataformaComercialDWR",
        "ec/fisa/widget/Utils"

        ],function(dojo,declare,lang, fisaBaseController,BaseController,navigationUtils,menuUtils,domStyle,
        		domConstruct,domGeometry,mvc,on, MessagePanel){

	var PlataformaController = declare("ec.fisa.controller.custom.PlataformaComercialController", [BaseController,menuUtils], {
		tabId:null,
		pageScopeId:null,
		breadCrumbId: null,
		msg:null,
		currentBreadCrumbId:null,
		btContentPaneId:null,
		parentPageScopeId:null,
		initData:null,
		tabContainerId:null,
		apellidoPaternoIdTxtBox:null,
		apellidoMaternoIdTxtBox:null,
		primerNombreIdTxtBox:null,
		segundoNombreIdTxtBox:null,
		juridicoNombreIdText:null,
		nombreCompletoId:null,
		agencyTxt:null,
		executiveTxt:null,
		sourceTxt:null,
		clienteNaturalContentPaneId:null,
		juridicoContentPaneId:null,
		documentTypeComboId:null,
		personTypeComboId:null,
		searchTypeComboId:null,
		searchTypeLovId:null,
		documentNumberTxId:null,
		borderContainerId:null,
		juridicoNewButtonId:null,
		menuBarId:null,
		menuEnabled:null,
		titlePaneId:null,
		labels:null,
		selectDataMap:null,
		clientNewButtonId:null,
		itemDisabled:null,
		
		
		constructor: function (tabId,pageScopeId,initData,labels,selectDataMap) {
			this.tabId=tabId;
			this.pageScopeId=pageScopeId;
			this.initData= initData;
			this.labels=labels;
			this.menuEnabled = false;
			this.selectDataMap=selectDataMap;
		},
		


		initMenu:function(contentPaneId){
			this.menuBarId = contentPaneId+"menuBarId";
			this.itemDisabled  = {};
			this.updateHorizontalMenu(this.initData.menuItems,contentPaneId,this.menuBarId,true);
			this.findParentMenuItemByHotkey("M_CLIENT");
			this.disableMenu();
		},
		
		
		findParentMenuItemByHotkey:function(/*String*/hotKey){
			var menuBar = dijit.byId(this.menuBarId);
			dojo.forEach(menuBar.getChildren(),dojo.hitch(this,function(/*Widget*/popupMenuBarItem){
				if(hotKey ==popupMenuBarItem.hotKey){
					this.itemDisabled[hotKey] = popupMenuBarItem.id;
				}
			}));
			
		},
		
		enableMenu:function(){
			ec.fisa.widget.utils.enableWidget(this.menuBarId);
			var menuBarWdg = dijit.byId(this.menuBarId);
			dojo.forEach(menuBarWdg.getChildren(),dojo.hitch(this,function(childComp){
				ec.fisa.widget.utils.enableWidget(childComp.id);
			}));
			
		},
		
		loadPlatformPersonTypeCombo:function(component){
			var component = dijit.byId(this.personTypeComboId);
			var listOfOptions =  this.selectDataMap["REQUEST_PLATFORM_PERSON_TYPE"];
			component.set("options", listOfOptions);
			component.reset();
		},
		
		loadDefaultPlatformDocumentTypeCombo:function(){
			this.loadPlatformDocumentTypeCombo(1);
		},
		
		loadPlatformDocumentTypeCombo:function(value){
			var component = dijit.byId(this.documentTypeComboId);
			var listOfOptions =  this.selectDataMap["REQUEST_PLATFORM_DOCUMENT_TYPE"+value];
			component.set("options", listOfOptions);
			component.reset();
		},
		
		loadPlatformSearchTypeCombo:function(){
			var component = dijit.byId(this.searchTypeComboId);
			var listOfOptions =  this.selectDataMap["REQUEST_PLATFORM_SEARCH_TYPE"];
			component.set("options", listOfOptions);
			component.reset();
		},
		
		disableMenu:function(){
			ec.fisa.widget.utils.disableWidget(this.menuBarId);
			var menuBarWdg = dijit.byId(this.menuBarId);
			dojo.forEach(menuBarWdg.getChildren(),dojo.hitch(this,function(childComp){
				ec.fisa.widget.utils.disableWidget(childComp.id);
			}));
		},
		
		//override from menu.utils
		addHorizontalMenuItems:function(parentItem,subItems){
			if(subItems!=null){
				dojo.forEach(subItems,function(subItem){
					var hotKey=	subItem.hotKey;
					if(subItem.childrenItems!=null){
						var item = new dijit.Menu({parentMenu:parentItem,baseClass: "dijitHorizontalSubMenu"});
						var itemSubMenu=new dijit.PopupMenuItem({label:subItem.name, popup:item, baseClass: "dijitHorizontalSubMenuItem"});
						parentItem.addChild(itemSubMenu);
						domStyle.set(itemSubMenu.arrowWrapper, "visibility", "");
						this.addHorizontalMenuItems(item, subItem.childrenItems);
						
						if(hotKey != null){
							this.itemDisabled[hotKey] = itemSubMenu.id;
						}
						
					}else{
						var params ={
								onClick:dojo.hitch(this,function(subItem){
									this.menuTreeOnClick(subItem,null);
								},subItem)
						};
						//lang.mixin(params,subItem);
						params.label=subItem.name;
						params.baseClass= "dijitHorizontalMenuItem";
						var menuItem =	new dijit.MenuItem(params);
						parentItem.addChild(menuItem);
						if(hotKey != null){
							this.itemDisabled[hotKey] = menuItem.id;
						}
						
					}
				},this);
			}
		},
		
		//override to prevent inicio window to be opened
		closeTab:function(){
			
		},
		
		//overrride from parente menu.utils
		menuTreeOnClick : function(item, nodeWidget) {
			try {
				if (item != null) {
					if (nodeWidget && nodeWidget.isExpandable) {
						//Do nothing
					} else {
						
						this.clearPanelMessage();
						//if click is enabled the search was succesful.
						//so add params to url
						var docTypeWdg = dijit.byId(this.documentTypeComboId);
						var documentType = docTypeWdg.get('value');

						var personTypeWdg = dijit.byId(this.personTypeComboId);
						var clientType = personTypeWdg.get('value');
						var numberTxt = dijit.byId(this.documentNumberTxId);
						var number = numberTxt.get('value');
						
						var apellidoPaterno = dijit.byId(this.apellidoPaternoIdTxtBox).get('value');
						var apellidoMaterno = dijit.byId(this.apellidoMaternoIdTxtBox).get('value');
						var primerNombre = dijit.byId(this.primerNombreIdTxtBox).get('value');
						var segundoNombre = dijit.byId(this.segundoNombreIdTxtBox).get('value');
						var datakey=documentType+"|"+number+"|"+apellidoPaterno+"|"+apellidoMaterno+"|"+primerNombre+"|"+segundoNombre+"|"+clientType;
						var param	= {"P_PERSON_LEGAL_ID":number,"P_PERSON_LEGAL_TYPE":documentType,"P_PERSON_TYPE":clientType,
								"_AUTO":"1","dataKey":datakey};
						item.customParam = dojo.toJson(param);
						item.FISATabId=this.tabId;
						item.FisaPageScopeId=this.pageScopeId;
						ec.fisa.menu.utils.loadMenuTabContainer(item,false,this.tabContainerId,this.tabContainerId+"inicio",true);
					}
				}
			} catch (e) {
				console.log(e);
			}

		},
		//just set variable
		tabIdAdd:function(tabContainerId){
			this.tabContainerId= tabContainerId;

		},

		apellidoPaternoSet:function(apellidoPaternoIdTxtBox){
			this.apellidoPaternoIdTxtBox = apellidoPaternoIdTxtBox;
			var apellidoPaternoSet = dijit.byId(apellidoPaternoIdTxtBox);
			apellidoPaternoSet.connect(apellidoPaternoSet,"onChange",dojo.hitch(this,function(value){
				var apellidoPaternoSet = dijit.byId(this.apellidoPaternoIdTxtBox);
				if(apellidoPaternoSet.notCallOnChange != true)
				{
					this.clearPanelMessage();
					var callObj={callbackScope:this};
					callObj.errorHandler=dojo.hitch(this,this.errorHandler);
					callObj.callback=this._valueValidationCallBack;
					PlataformaComercialDWR.valueValidation(apellidoPaternoSet.fid,value,apellidoPaternoSet.id,callObj);
				}
				apellidoPaternoSet.notCallOnChange = false;
			}));
		},
		apellidoMaternoSet:function(apellidoMaternoIdTxtBox){
			this.apellidoMaternoIdTxtBox = apellidoMaternoIdTxtBox;
			var apellidoMaternoSet = dijit.byId(apellidoMaternoIdTxtBox);
			apellidoMaternoSet.connect(apellidoMaternoSet,"onChange",dojo.hitch(this,function(value){
				var apellidoMaternoSet = dijit.byId(this.apellidoMaternoIdTxtBox);
				if(apellidoMaternoSet.notCallOnChange != true)
				{
					this.clearPanelMessage();
					var callObj={callbackScope:this};
					callObj.errorHandler=dojo.hitch(this,this.errorHandler);
					callObj.callback=this._valueValidationCallBack;
					PlataformaComercialDWR.valueValidation(apellidoMaternoSet.fid,value,apellidoMaternoSet.id,callObj);
				}
				apellidoMaternoSet.notCallOnChange = false;
			}));
			
		},
		primerNombreSet:function(primerNombreIdTxtBox){
			this.primerNombreIdTxtBox = primerNombreIdTxtBox;
			var primerNombreSet = dijit.byId(primerNombreIdTxtBox);
			primerNombreSet.connect(primerNombreSet,"onChange",dojo.hitch(this,function(value){
				var primerNombreSet = dijit.byId(this.primerNombreIdTxtBox);
				if(primerNombreSet.notCallOnChange != true)
				{
					this.clearPanelMessage();
					var callObj={callbackScope:this};
					callObj.errorHandler=dojo.hitch(this,this.errorHandler);
					callObj.callback=this._valueValidationCallBack;
					PlataformaComercialDWR.valueValidation(primerNombreSet.fid,value,primerNombreSet.id,callObj);
				}
				primerNombreSet.notCallOnChange = false;
			}));
			
		},
		segundoNombreSet:function(segundoNombreIdTxtBox){
			this.segundoNombreIdTxtBox = segundoNombreIdTxtBox;
			var segundoNombreSet = dijit.byId(segundoNombreIdTxtBox);
			segundoNombreSet.connect(segundoNombreSet,"onChange",dojo.hitch(this,function(value){
				var segundoNombreSet = dijit.byId(this.segundoNombreIdTxtBox);
				if(segundoNombreSet.notCallOnChange != true)
				{
					this.clearPanelMessage();
					var callObj={callbackScope:this};
					callObj.errorHandler=dojo.hitch(this,this.errorHandler);
					callObj.callback=this._valueValidationCallBack;
					PlataformaComercialDWR.valueValidation(segundoNombreSet.fid,value,segundoNombreSet.id,callObj);
				}
				segundoNombreSet.notCallOnChange = false;
			}));
		},
		agencyTxtSet:function(agencyTxt){
			this.agencyTxt = agencyTxt ;
		},

		executiveTxtSet:function(executiveTxt){
			this.executiveTxt =executiveTxt;
		},

		sourceTxtSet:function(sourceTxt){
			this.sourceTxt = sourceTxt;
		},

		juridicoNombreSet:function(juridicoNombreIdText){
			this.juridicoNombreIdText = juridicoNombreIdText;
			var juridicoNombreSet = dijit.byId(juridicoNombreIdText);
			juridicoNombreSet.connect(juridicoNombreSet,"onChange",dojo.hitch(this,function(value){
				var juridicoNombreSet = dijit.byId(this.juridicoNombreIdText);
				if(juridicoNombreSet.notCallOnChange != true)
				{
					this.clearPanelMessage();
					var callObj={callbackScope:this};
					callObj.errorHandler=dojo.hitch(this,this.errorHandler);
					callObj.callback=this._valueValidationCallBack;
					PlataformaComercialDWR.valueValidation(juridicoNombreSet.fid,value,juridicoNombreSet.id,callObj);
				}
				juridicoNombreSet.notCallOnChange = false;
			}));
			
			
		},
		//sets the id 
		clienteNaturalContentPanetSet:function(contentPaneId){
			this.clienteNaturalContentPaneId = contentPaneId;
		},

		juridicoContentPaneSet:function(juridicoContentPaneId){
			this.juridicoContentPaneId = juridicoContentPaneId;
			var juridocCp = dijit.byId(this.juridicoContentPaneId);

			domStyle.set(juridocCp.domNode,"display","none");
		},

		
		_valueValidationCallBack:function(outcome){
			if(outcome.wAxn == "error")
			{
				this.updateMsgsPanel(outcome.aMsgs);
				var apellidoPaternoSet = dijit.byId(outcome.id);
				apellidoPaternoSet.notCallOnChange = true;
				apellidoPaternoSet.set("value","");
			}
		},
		
		//sets person type combo id and onchange if this changes repopulate the combo.
		setPersonTypeComboId:function(personTypeComboId){
			this.personTypeComboId = personTypeComboId;
			var ptCombo = dijit.byId(this.personTypeComboId);
			ptCombo.connect(ptCombo,"onChange",dojo.hitch(this,function(value){
				this.personTypeChangeCallBack(value);
				this.resetComponents();
			}));
		},
		//sets combo document type id. and onchange values.
		setDocumentTypeComboId:function(documentTypeComboId){
			this.documentTypeComboId=documentTypeComboId;
			var dtCombo = dijit.byId(this.documentTypeComboId);
			dtCombo.connect(dtCombo,"onChange",dojo.hitch(this,function(value){
				var dtCombo = dijit.byId(this.documentTypeComboId);
				if(dtCombo.notCallOnChange != true)
				{
					this.resetComponents();
				}
				dtCombo.notCallOnChange = false;
			}));
		},

		//call backk from perfson type onchange combo.
		personTypeChangeCallBack:function(value){
			var dtCombo = dijit.byId(this.documentTypeComboId);
			dtCombo.removeOption(dtCombo.getOptions());
			this.loadPlatformDocumentTypeCombo(value);
			var cnContenPane= dijit.byId(this.clienteNaturalContentPaneId);
			var juridocCp = dijit.byId(this.juridicoContentPaneId);
			if(value=="1"){
				domStyle.set(cnContenPane.domNode,"display","block");
				domStyle.set(juridocCp.domNode,"display","none");
			}
			else if (value= "2"){
				domStyle.set(cnContenPane.domNode,"display","none");
				domStyle.set(juridocCp.domNode,"display","block");
			}
		},

		setDocumentNumberTxId:function(documentNumberTxId){
			this.documentNumberTxId = documentNumberTxId;

		},

		//resets all components to empty
		resetComponents:function(){
			this.clearPanelMessage();
			var numberTxt = dijit.byId(this.documentNumberTxId);
			numberTxt.set("value","");
			this.resetComponentsInterno();
			
			this.enableComponents(false);	
			this.closeCurrentTab();
		},
		
		
		resetComponentsInterno:function(){
			
			var apellidoPaternoTxt = dijit.byId(this.apellidoPaternoIdTxtBox);
			if(apellidoPaternoTxt.disabled == true || apellidoPaternoTxt.get("value") != "" ){
				apellidoPaternoTxt.notCallOnChange = true;
			}
			apellidoPaternoTxt.set("value","");
			
			var apellidoMaternoTxt = dijit.byId(this.apellidoMaternoIdTxtBox);
			if(apellidoMaternoTxt.disabled == true || apellidoMaternoTxt.get("value") != ""){
				apellidoMaternoTxt.notCallOnChange = true;
			}
			apellidoMaternoTxt.set("value","");
			
			var primerNombreTxt = dijit.byId(this.primerNombreIdTxtBox);
			if(primerNombreTxt.disabled == true || primerNombreTxt.get("value") != ""){
			primerNombreTxt.notCallOnChange = true;
			}
			primerNombreTxt.set("value","");
			
			var segundoNombreTxt = dijit.byId(this.segundoNombreIdTxtBox);
			if(segundoNombreTxt.disabled == true || segundoNombreTxt.get("value") != ""){
			segundoNombreTxt.notCallOnChange = true;
			}
			segundoNombreTxt.set("value","");
			
			
			var juridicoNombreTxt = dijit.byId(this.juridicoNombreIdText);
			if(juridicoNombreTxt.disabled == true || juridicoNombreTxt.get("value") != ""){
			juridicoNombreTxt.notCallOnChange = true;
			}
			juridicoNombreTxt.set("value","");
			
			
			var agencyTxtWdg = dijit.byId(this.agencyTxt);
			agencyTxtWdg.set("value","");
			var executiveTxtWdg = dijit.byId(this.executiveTxt);
			executiveTxtWdg.set("value","");
			var sourceTxtWdg = dijit.byId(this.sourceTxt);
			sourceTxtWdg.set("value","");
			//var nombreCompletoId = dijit.byId(this.nombreCompletoId);
			//nombreCompletoId.set("value","");
			//also disable the menu
			this.disableMenu();
		},
		
		
		//enable or disable the compoments based on the search
		enableComponents:function(/*boolean*/enable){
			if(enable == false){
				ec.fisa.widget.utils.disableWidget(this.apellidoPaternoIdTxtBox);
				ec.fisa.widget.utils.disableWidget(this.apellidoMaternoIdTxtBox);
				ec.fisa.widget.utils.disableWidget(this.primerNombreIdTxtBox);
				ec.fisa.widget.utils.disableWidget(this.segundoNombreIdTxtBox);
				ec.fisa.widget.utils.disableWidget(this.juridicoNombreIdText);
				var juridicoButtonNew  = dijit.byId(this.juridicoNewButtonId);
				var clienteButtonNew = dijit.byId(this.clientNewButtonId);
				domStyle.set(juridicoButtonNew.domNode,"display","none");
				domStyle.set(clienteButtonNew.domNode,"display","none");
			}
			else{
				var personTypeWdg = dijit.byId(this.personTypeComboId);
				var clientType = personTypeWdg.get('value');
				ec.fisa.widget.utils.enableWidget(this.apellidoPaternoIdTxtBox);
				ec.fisa.widget.utils.enableWidget(this.apellidoMaternoIdTxtBox);
				ec.fisa.widget.utils.enableWidget(this.primerNombreIdTxtBox);
				ec.fisa.widget.utils.enableWidget(this.segundoNombreIdTxtBox);
				ec.fisa.widget.utils.enableWidget(this.juridicoNombreIdText);
				if(clientType == 1){
					var clienteButtonNew  = dijit.byId(this.clientNewButtonId);
					domStyle.set(clienteButtonNew.domNode,"display","block");
				} else if (clientType == 2){
					var juridicoButtonNew = dijit.byId(this.juridicoNewButtonId);
					domStyle.set(juridicoButtonNew.domNode,"display","block");
				}
			};
		},
		
		

		//close current tab
		closeCurrentTab:function(){
			var tabContainer = dijit.byId(this.tabContainerId);
			var currentTab=tabContainer.selectedChildWidget;
			if(currentTab){
				if(currentTab.onClose){
				currentTab.onClose();
				}
				tabContainer.removeChild(currentTab);
				currentTab.destroyRecursive();
			}
			
		},
		

		setSearchTypeComboId:function(searchTypeComboId){
			this.searchTypeComboId = searchTypeComboId;

		},
		setSearchTypeLoVId:function(lovId){
			this.searchTypeLovId= lovId;
		},
		

		//refresh data and search the client
		refreshData:function(){
			this.clearPanelMessage();
			var docWdg = dijit.byId(this.documentNumberTxId);
			var numberValue =	docWdg.get("value");
			if(numberValue == undefined || numberValue == null || numberValue == ""){
				var message =this.generateMsg(this.labels['required'],"",40000);
				this.resetComponents();
				this.updateMsgsPanel(message);
			}
			else{
				var docTypeWdg = dijit.byId(this.documentTypeComboId);
				var documentType = docTypeWdg.get('value');
				var personTypeWdg = dijit.byId(this.personTypeComboId);
				var clientType = personTypeWdg.get('value');
				this.findCustomerData(numberValue,documentType,clientType);
			}
		},
		findCustomerData:function(numberValue,documentType,clientType){
			//String numDocument, String documentType, String clientType, String tabId, String pageScopeId
			var callObj={callbackScope:this};
			callObj.errorHandler=dojo.hitch(this,this.errorHandler);
			callObj.callback=this._findCustomerCallBack;
			PlataformaComercialDWR.findCustomer(numberValue,documentType,clientType,this.tabId,this.pageScopeId,callObj);
		},

		_findCustomerCallBack:function(outcome){

			if(outcome.wAxn == "error")
			{
				this.resetComponents();
				this.updateMsgsPanel(outcome.aMsgs);
				
			}
			else if(outcome.wAxn=="cnfrm"){
				
				if(outcome.response !=undefined){
					if(outcome.response.newClient == true){
						this.enableComponents(true);
						this.resetComponentsInterno();
						
					}
					else{
						this.enableComponents(false);
						//search return client.
						this.resetComponents();
						this.setComponentsValue(outcome);
						if(outcome.response.disableMenu == false){
							this.enableMenu();
						}
						//first enable all the menus.
						dojox.lang.functional.forIn(this.itemDisabled,function(value, key){
							ec.fisa.widget.utils.enableWidget(value);
						}, this);

						if(outcome.response.itmDisabled != null && outcome.response.itmDisabled.length > 0){
							dojo.forEach(outcome.response.itmDisabled,dojo.hitch(this,function(item){
								//var menuWdg = dijit.byId(this.itemDisabled[item]);
								ec.fisa.widget.utils.disableWidget(this.itemDisabled[item]);
							}));
						}
					}

				}
				//show warnings.
				if(outcome.aMsgs != undefined && outcome.aMsgs != null){
					this.updateMsgsPanel(outcome.aMsgs);
				}
			}
		},
		//clear and erase de the data from the form.
		clearData:function(){
			this.resetComponents();
		},
		//SETS value coming from the search.
		setComponentsValue:function(outcome){
			var clientTypeCombo = dijit.byId(this.personTypeComboId);
			clientTypeCombo.set("value",outcome.CLIENT_TYPE,false);
			this.personTypeChangeCallBack(outcome.CLIENT_TYPE);
			var documentTypeCombo=dijit.byId(this.documentTypeComboId);
			documentTypeCombo.notCallOnChange = true;
			documentTypeCombo.set("value",outcome.documentTypeObj,false);
			var documentNumberTxt = dijit.byId(this.documentNumberTxId);
			documentNumberTxt.set("value",outcome.numDocumentObj);
			var responseData = outcome.response;

			var apellidoPaternoTxt = dijit.byId(this.apellidoPaternoIdTxtBox);
			if(apellidoPaternoTxt.disabled == true){
				apellidoPaternoTxt.notCallOnChange = true;
			}
			apellidoPaternoTxt.set("value",responseData.lastName);
			
			var apellidoMaternoTxt = dijit.byId(this.apellidoMaternoIdTxtBox);
			if(apellidoMaternoTxt.disabled == true){
				apellidoMaternoTxt.notCallOnChange = true;
			}
			apellidoMaternoTxt.set("value",responseData.secondLastName);
			
			var primerNombreTxt = dijit.byId(this.primerNombreIdTxtBox);
			if(primerNombreTxt.disabled == true){
			primerNombreTxt.notCallOnChange = true;
			}
			primerNombreTxt.set("value",responseData.name);
			
			var segundoNombreTxt = dijit.byId(this.segundoNombreIdTxtBox);
			if(segundoNombreTxt.disabled == true){
			segundoNombreTxt.notCallOnChange = true;
			}
			segundoNombreTxt.set("value",responseData.middleName);
			
			
			var juridicoNombreTxt = dijit.byId(this.juridicoNombreIdText);
			if(juridicoNombreTxt.disabled == true){
			juridicoNombreTxt.notCallOnChange = true;
			}
			juridicoNombreTxt.set("value",responseData.lastName);
			
			var agencyTxtWdg = dijit.byId(this.agencyTxt);
			agencyTxtWdg.set("value",responseData.agency);
			var executiveTxtWdg = dijit.byId(this.executiveTxt);
			executiveTxtWdg.set("value",responseData.executive);
			var sourceTxtWdg = dijit.byId(this.sourceTxt);
			sourceTxtWdg.set("value",responseData.source);
			
			
		},
		
		nombreCompletoSet:function(nombreCompletoId){
			this.nombreCompletoId = nombreCompletoId;
		},
		setBorderContainerId:function(id){
			this.borderContainerId=id;
		},
		//set id of title pane and connect to resize bordercontainer.
		setTitlePaneId:function(id,titleHide,titleShow){
			dijit.byId(id).watch("open",dojo.hitch(this, function(param, oldValue, newValue) {
				var titlePane=	dijit.byId(id);
				var animation = newValue ? titlePane._wipeIn : titlePane._wipeOut;
				var handler = dojo.connect(animation, "onEnd", titlePane, dojo.hitch(this, function() {
					dijit.byId(this.borderContainerId).resize();  
					var titlePane =	dijit.byId(id);
					if(newValue === true){
						titlePane.set("title",titleHide);
					}else{
						titlePane.set("title",titleShow);
					}
					dojo.disconnect(handler);            
				}));

			}));
		},
		
		clientNewButtonSet:function(id){
			this.clientNewButtonId = id;
			
			
			var clienteButtonNew = dijit.byId(this.clientNewButtonId);
			domStyle.set(clienteButtonNew.domNode,"display","none");
			
		},
		
		juridicoNewButtonSet:function(id){
			this.juridicoNewButtonId = id;
			var juridicoButtonNew  = dijit.byId(this.juridicoNewButtonId);
			domStyle.set(juridicoButtonNew.domNode,"display","none");
		},
		
		/**When a nuew client is created... update data to look in the menu*/
		updateNewClient:function(){
			this.clearPanelMessage();
			var personTypeWdg = dijit.byId(this.personTypeComboId);
			var clientType = personTypeWdg.get('value');
			
			var documentTypeCombo=dijit.byId(this.documentTypeComboId);
			var documentType =documentTypeCombo.get("value");
			
			var primerNombreTxt = dijit.byId(this.primerNombreIdTxtBox);
			var primerNombre =primerNombreTxt.get('value');
			
			var segundoNombreTxt = dijit.byId(this.segundoNombreIdTxtBox);
			var middleName = segundoNombreTxt.get('value');
			
			var apellidoMaternoTxt = dijit.byId(this.apellidoMaternoIdTxtBox);
			var secondLastName = apellidoMaternoTxt.get('value');
			
			var apellidoPaternoTxt = dijit.byId(this.apellidoPaternoIdTxtBox);
			var lastName = apellidoPaternoTxt.get('value');
			var numberTxt = dijit.byId(this.documentNumberTxId);
			var documentNumber = numberTxt.get('value');
			
			var callObj={callbackScope:this};
			callObj.errorHandler=dojo.hitch(this,this.errorHandler);
			callObj.callback=this._updateNewClientCallBack;
			PlataformaComercialDWR.updateNewClient(documentNumber,clientType,documentType,primerNombre,middleName,lastName,secondLastName,this.tabId,this.pageScopeId,callObj);
		},
		
		
		/**When a new juridico is created... update data to look in the menu*/
		updateNewJuridico:function(){
			this.clearPanelMessage();
			var personTypeWdg = dijit.byId(this.personTypeComboId);
			var clientType = personTypeWdg.get('value');
			
			
			var juridicoNombreTxt = dijit.byId(this.juridicoNombreIdText);
			var lastName = juridicoNombreTxt.get('value');
			
			var numberTxt = dijit.byId(this.documentNumberTxId);
			var documentNumber = numberTxt.get('value');
			
			var documentTypeCombo=dijit.byId(this.documentTypeComboId);
			var documentType =documentTypeCombo.get("value");
			
			
			
			var callObj={callbackScope:this};
			callObj.errorHandler=dojo.hitch(this,this.errorHandler);
			callObj.callback=this._updateNewClientCallBack;
			PlataformaComercialDWR.updateNewJuridico(documentNumber,clientType,documentType,lastName,this.tabId,this.pageScopeId,callObj);
			
			
		},
		
		_updateNewClientCallBack:function(outcome){
			if(outcome.wAxn == "error")
			{
				this.updateMsgsPanel(outcome.aMsgs);
			}
			else if(outcome.wAxn=="cnfrm"){
				//show warnings.
				if(outcome.aMsgs != undefined && outcome.aMsgs != null){
					this.updateMsgsPanel(outcome.aMsgs);
				}
				if(outcome.response !=undefined){
						if(outcome.response.disableMenu == false){
							this.enableMenu();
						}
						else if(outcome.response.disableMenu == true){
							this.disableMenu();
						}
						//first enable all the menus.
						dojox.lang.functional.forIn(this.itemDisabled,function(value, key){
							ec.fisa.widget.utils.enableWidget(value);
						}, this);

						if(outcome.response.itmDisabled != null && outcome.response.itmDisabled.length > 0){
							dojo.forEach(outcome.response.itmDisabled,dojo.hitch(this,function(item){
								//var menuWdg = dijit.byId(this.itemDisabled[item]);
								ec.fisa.widget.utils.disableWidget(this.itemDisabled[item]);
							}));
						}
						this.enableComponents(false);	
				}
			}
		}
		
	
		
	});
	return PlataformaController;
});

define([
        "dojo/_base/kernel","dojo/_base/declare","dojo/_base/lang","./_base",
        "ec/fisa/controller/BaseController","ec/fisa/navigation/Utils","ec/fisa/menu/Utils","dojo/dom-style",
        "dojo/dom-construct","dojo/dom-geometry",
        "dojox/mvc","dojo/on","ec/fisa/message/ConfirmationPanel","ec/fisa/dwr/proxy/PlataformaControllerDWR",
        "ec/fisa/widget/Utils"

        ],function(dojo,declare,lang, fisaBaseController,BaseController,navigationUtils,menuUtils,domStyle,
        		domConstruct,domGeometry,mvc,on, MessagePanel){

	var PlataformaController = declare("ec.fisa.controller.custom.PlataformaController", [BaseController,menuUtils], {
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
		agencyTxt:null,
		executiveTxt:null,
		sourceTxt:null,

		clienteNaturalContentPaneId:null,
		juridicoContentPaneId:null,
		documentTypeComboId:null,
		personTypeComboId:null,
		searchTypeComboId:null,

		documentNumberTxId:null,
		borderContainerId:null,
		
		menuBarId:null,
		
		menuEnabled:null,
		titlePaneId:null,

		labels:null,
		constructor: function (tabId,pageScopeId,initData,labels) {
			this.tabId=tabId;
			this.pageScopeId=pageScopeId;
			this.initData= initData;
			this.labels=labels;
			this.menuEnabled = false;
		},

		initMenu:function(contentPaneId){
			this.menuBarId = contentPaneId+"menuBarId";
			this.updateHorizontalMenu(this.initData.menuItems,contentPaneId,this.menuBarId,true);
			this.disableMenu();
			
			
		},
		
		
		enableMenu:function(){
			ec.fisa.widget.utils.enableWidget(this.menuBarId);
			var menuBarWdg = dijit.byId(this.menuBarId);
			dojo.forEach(menuBarWdg.getChildren(),dojo.hitch(this,function(childComp){
				ec.fisa.widget.utils.enableWidget(childComp.id);
			}));
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
					if(subItem.childrenItems!=null){
						var item = new dijit.Menu({parentMenu:parentItem,baseClass: "dijitHorizontalSubMenu"});
						var itemSubMenu=new dijit.PopupMenuItem({label:subItem.name, popup:item, baseClass: "dijitHorizontalSubMenuItem"});
						parentItem.addChild(itemSubMenu);
						domStyle.set(itemSubMenu.arrowWrapper, "visibility", "");
						this.addHorizontalMenuItems(item, subItem.childrenItems);
					}else{
						var params ={
								onClick:dojo.hitch(this,function(subItem){
									this.menuTreeOnClick(subItem,null)
								},subItem)
						};
						//lang.mixin(params,subItem);
						params.label=subItem.name;
						params.baseClass= "dijitHorizontalMenuItem";
						parentItem.addChild(new dijit.MenuItem(params));
					}
				},this);
			}
		},
		//overrride from parente menu.utils
		menuTreeOnClick : function(item, nodeWidget) {
			try {
				if (item != null) {
					if (nodeWidget && nodeWidget.isExpandable) {
						//Do nothing
					} else {
						
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
						ec.fisa.menu.utils.loadMenuTabContainer(item,false,this.tabContainerId,this.tabContainerId+"inicio");
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
		},
		apellidoMaternoSet:function(apellidoMaternoIdTxtBox){
			this.apellidoMaternoIdTxtBox = apellidoMaternoIdTxtBox;
		},
		primerNombreSet:function(primerNombreIdTxtBox){
			this.primerNombreIdTxtBox = primerNombreIdTxtBox;
		},
		segundoNombreSet:function(segundoNombreIdTxtBox){
			this.segundoNombreIdTxtBox = segundoNombreIdTxtBox;
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

		//sets person type combo id and onchange if this changes repopulate the combo.
		setPersonTypeComboId:function(personTypeComboId){
			this.personTypeComboId = personTypeComboId;

			var ptCombo = dijit.byId(this.personTypeComboId);
			ptCombo.connect(ptCombo,"onChange",dojo.hitch(this,function(value){
				var callObj={callbackScope:this};
				callObj.errorHandler=dojo.hitch(this,this.errorHandler);
				callObj.callback=this._personTypeChangeCallBack;
				PlataformaControllerDWR.onChangePersonTypeCombo(value,this.tabId,callObj);
			}));
		},
		//sets combo document type id. and onchange values.
		setDocumentTypeComboId:function(documentTypeComboId){
			this.documentTypeComboId=documentTypeComboId;
			var dtCombo = dijit.byId(this.documentTypeComboId);
			dtCombo.connect(dtCombo,"onChange",dojo.hitch(this,function(value){
				this.resetComponents();
			}));
		},

		//call backk from perfson type onchange combo.
		_personTypeChangeCallBack:function(outcome){
			if(outcome.wAxn == "refresh")
			{
				var newComboOptions = dojo.fromJson(outcome['REQUEST_PLATFORM_DOCUMENT_TYPE']);

				var dtCombo = dijit.byId(this.documentTypeComboId);
				dtCombo._lastValueReported = "";
				dtCombo.set("value","",true);
				dtCombo.removeOption(dtCombo.getOptions());
				dtCombo.set("options",newComboOptions);
				dtCombo.reset();

				this.resetComponents();



				var cnContenPane= dijit.byId(this.clienteNaturalContentPaneId);
				var juridocCp = dijit.byId(this.juridicoContentPaneId);

				if(outcome.msg == "personal"){
					domStyle.set(cnContenPane.domNode,"display","block");
					domStyle.set(juridocCp.domNode,"display","none");
				}
				else if (outcome.msg == "juridico"){
					domStyle.set(cnContenPane.domNode,"display","none");
					domStyle.set(juridocCp.domNode,"display","block");
				}
			}
		},

		setDocumentNumberTxId:function(documentNumberTxId){
			this.documentNumberTxId = documentNumberTxId;

		},

		//resets all components to empty
		resetComponents:function(){
			var numberTxt = dijit.byId(this.documentNumberTxId);
			numberTxt.set("value","");
			var apellidoPaternoTxt = dijit.byId(this.apellidoPaternoIdTxtBox);
			apellidoPaternoTxt.set("value","");
			var apellidoMaternoTxt = dijit.byId(this.apellidoMaternoIdTxtBox);
			apellidoMaternoTxt.set("value","");
			var primerNombreTxt = dijit.byId(this.primerNombreIdTxtBox);
			primerNombreTxt.set("value","");
			var segundoNombreTxt = dijit.byId(this.segundoNombreIdTxtBox);
			segundoNombreTxt.set("value","");
			var juridicoNombreTxt = dijit.byId(this.juridicoNombreIdText);
			juridicoNombreTxt.set("value","");


			var agencyTxtWdg = dijit.byId(this.agencyTxt);
			agencyTxtWdg.set("value","");
			var executiveTxtWdg = dijit.byId(this.executiveTxt);
			executiveTxtWdg.set("value","");
			var sourceTxtWdg = dijit.byId(this.sourceTxt);
			sourceTxtWdg.set("value","");
			
			//also disable the menu
			this.disableMenu();
		},


		setSearchTypeComboId:function(searchTypeComboId){
			this.searchTypeComboId = searchTypeComboId;

		},

		//call the lov by the value of the combobox
		callLovSearchType:function(){


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


				//String numDocument, String documentType, String clientType, String tabId, String pageScopeId
				var callObj={callbackScope:this};
				callObj.errorHandler=dojo.hitch(this,this.errorHandler);
				callObj.callback=this._findCustomerCallBack;
				PlataformaControllerDWR.findCustomer(numberValue,documentType,clientType,this.tabId,this.pageScopeId,callObj);
			}
		},


		_findCustomerCallBack:function(outcome){

			if(outcome.wAxn == "error")
			{
				this.updateMsgsPanel(outcome.aMsgs);
				this.resetComponents();
			}
			else if(outcome.wAxn=="cnfrm"){

				//show warnings.
				if(outcome.aMsgs != undefined && outcome.aMsgs != null){
					this.updateMsgsPanel(outcome.aMsgs);
				}

				if(outcome.response !=undefined){
					this.setComponentsValue(outcome.response);
					this.enableMenu();
				}
			}

		},


		//clear and erase de the data from the form.
		clearData:function(){

			this.resetComponents();
		},

		//SETS value coming from the search.
		setComponentsValue:function(responseData){
			var apellidoPaternoTxt = dijit.byId(this.apellidoPaternoIdTxtBox);
			apellidoPaternoTxt.set("value",responseData.lastName);
			var apellidoMaternoTxt = dijit.byId(this.apellidoMaternoIdTxtBox);
			apellidoMaternoTxt.set("value",responseData.secondLastName);
			var primerNombreTxt = dijit.byId(this.primerNombreIdTxtBox);
			primerNombreTxt.set("value",responseData.name);
			var segundoNombreTxt = dijit.byId(this.segundoNombreIdTxtBox);
			segundoNombreTxt.set("value",responseData.middleName);
			var juridicoNombreTxt = dijit.byId(this.juridicoNombreIdText);
			juridicoNombreTxt.set("value",responseData.lastName);


			var agencyTxtWdg = dijit.byId(this.agencyTxt);
			agencyTxtWdg.set("value",responseData.agency);
			var executiveTxtWdg = dijit.byId(this.executiveTxt);
			executiveTxtWdg.set("value",responseData.executive);
			var sourceTxtWdg = dijit.byId(this.sourceTxt);
			sourceTxtWdg.set("value",responseData.source);
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
		}
	});
	return PlataformaController;
});

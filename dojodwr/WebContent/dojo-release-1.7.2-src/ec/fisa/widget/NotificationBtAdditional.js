/**Used in bt. to show this widget.*/
define(["dojo/_base/kernel",
    	"dojo/_base/declare",
    	"dijit/_Widget",
    	"dijit/_Templated",
    	"dojo/text!./templates/NotificationBTSelection.html",
    	"dojo/regexp",
    	"dijit/form/Button",
    	"dijit/form/TextBox",
    	"dijit/form/ValidationTextBox",
    	"dojox/lang/functional/object",
    	"dojo/dom-style",
    	"dojo/dom-attr",
    	"dojo/dom",
    	"dojo/dom-construct",
    	"dijit/dijit",
    	"dojo/on",
    	"dijit/focus",
    	"ec/fisa/widget/Utils",
    	"dojo/string", "dijit/form/Select"], function(dojo, declare, _Widget, _Templated,template, dregexp, dojoButton, dojoTextBox, dojoValidationTextBox, 
    			fuctionalObject, domStyle, domAttr, dom, domConstruct, dijit,on, focusUtil){
	var NotificationBTSelection = declare("ec.fisa.widget.NotificationBtAdditional",[_Widget, _Templated], {
		tapdFieldLenght:0,/*Longitud del campo en la base de datos*/
		notificationDivs:null,/*Almacena los divs usados para la presentacion de las traducciones*/
		notificationMaxLength:0,/*Longitud maxima de cada uno de los elementos del campo multilenguaje*/
		requestedAction:"",
		collapsed:true,
		actualNotifications:0,/*Numero de traducciones que tiene el componente*/
		actualValue:"",
		isARoutineField:false,
		routineBtId:null,
		routineFieldId:null,
		routineActionMode:null,
		tabId:"",
		pageScopeId:"",
		styleClass:'notificationReceiverSelection',
		widgetsInTemplate:true,
		readOnly:false,
		_disabledExp : "",
		_connections:null,
		_destroyOnRemove: true,
		parentEditableGrid:false,
		gridId:"",
		//only came when its called from a multiregister
		gridSelectedRowIndex:null,
		parentType:"",
		visualSize:20,
		templateString: template,
		notificationMeansList : null,  
		priorityId : null,
		labelDest : "",
		labelNewBeneficiario:"",
		emailRegex : null,
		numberRegex : null,
		//indicates user type if it is beneficiery or receiver, in cod B or R
		userType:"",
		userFavoriteList:null,
		//indicates maxusers 
		maxUsers:0,
		errorMsg:"",
		generalData:null,
		notificationDataVO:null,
		//this are previously inserted users.
		userInsertedList:null,
		btController:null,
		
		constructor: function(attrs, parentNode){
			try{
				
				this.emailRegex = "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@"
					+ "[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$";
				this.numberRegex = "^[0-9]+$";
				
				this.tapdFieldLenght = attrs.tapdFieldLenght|| 0;
				this.requestedAction = attrs.requestedAction|| '';
				this.ref = attrs.ref;
				this.notificationDivs = [];
				this.notificationMeansList = [];
				this._connections = [];	
				//this.createWidget();
				

			}catch(e){
				this.logger("No se pudo ejecutar el constructor");
				this.logger(e);
			}
		},		
		postMixInProperties : function() {
			if(this.readOnly==true){
				this._disabledExp="disabled='disabled'";
			}
			this.userType = this["user-type"]; 
			
			
			
		},		
		buildRendering: function(){
			this.inherited(arguments);
			this._init();
			//var cntrlr =ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
			
			//this._setValueAttr([cntrlr.receiverData, cntrlr.newNotificationMeansList, cntrlr.priorityId, true], null, null);
		},
		destroy: function(){
			delete this.notificationDivs;
			//var destinatarioTextBoxes=this.destinatarioTextBoxes;
			//delete this.destinatarioTextBoxes;
			/*dojox.lang.functional.forIn(destinatarioTextBoxes,function(translationTextBox){
				translationTextBox.destroy(false);
			},this);*/
			this.inherited(arguments);
		},
		logger: function(obj){
//			if(typeof console != "undefined"){
//				console.log(obj);
//			}
		},
		_createNotification:function(value,  valueNotification, contador, nodoDestinatario, create, id){
			
			var tempDest = "";
			var tempComboBox = this.priorityId;
			var tempTextBox = "";
			
			if (value) {
				
				if (value) {
					tempComboBox = value;
				}
			}
			
			if (valueNotification) {
				
				tempComboBox = valueNotification[0];
				tempTextBox = valueNotification[1];
			}
			
			var destinatarioNodeBody = null;
			
			if (nodoDestinatario == null) {
				
				//creando destinatario			
				var destinatarioNode = domConstruct.create("table",{id:this.id+ "_destinatario"}, this._tcn);				
				destinatarioNodeBody = domConstruct.create("tbody",{id:this.id+"_destinatario"}, destinatarioNode);				
				var destinatarioNodeRow = domConstruct.create("tr",{id:this.id+ "_destinatario"}, destinatarioNodeBody);
				
				//secciones destinatario
				var textBoxDivTd = domConstruct.create("td",{}, destinatarioNodeRow);
				//textBoxDivTd.className = "dijitTitlePaneTitle";
				
				var tableTextBoxDiv = domConstruct.create("table",{}, textBoxDivTd);	
				var rowTextBoxDiv = domConstruct.create("tr",{}, tableTextBoxDiv);
				var tdLabelBoxDiv = domConstruct.create("td",{}, rowTextBoxDiv);
				var tdTextBoxDiv = domConstruct.create("td",{}, rowTextBoxDiv);
				
				rowTextBoxDiv.className = "dijitTitlePaneTitle";
				
				var labelDiv = domConstruct.create("div",{}, tdLabelBoxDiv);
				var comboBoxUserDiv = domConstruct.create("div",{}, tdTextBoxDiv);		
				
				//campos de destinatario
				//textBoxDiv.innerHTML = this.labelDest+"&#09;";				
				
				var label = domConstruct.create("label", {innerHTML:this.labelDest}, labelDiv);			
				
				if(this.userType == "B"){
					this.userFavoriteList.push({label:this.labelNewBeneficiario,selected:false,value:"tp_-1"});	
					
				}
				
				//var textBoxDest = new dijit.form.ValidationTextBox({label: "Name", value: tempDest,maxLength:this.notificationMaxLength,size:this.visualSize},comboBoxUserDiv);	
				var comboBoxUser = new dijit.form.Select({options:this.userFavoriteList,value:tempComboBox, style:this.visualSize}, comboBoxUserDiv);
							
				//configurando campos de destinatario	
				comboBoxUser.set("required", true);
				comboBoxUser.fwId = this.id;	
			} else {
				destinatarioNodeBody = nodoDestinatario;
			}
			//here we create the child of the widget- contact media combo and textbox
			if (valueNotification && create || !create) {
				
				//tabla de notificaciones
				var notificationRow = domConstruct.create("tr",{}, destinatarioNodeBody);
				var notificationCol = domConstruct.create("td",{}, notificationRow );
				var notificationNode = domConstruct.create("table",{}, notificationCol);
				var notificationNodeBody = domConstruct.create("tbody",{}, notificationNode);
				var notificationNodeRow = domConstruct.create("tr",{}, notificationNodeBody);
				
				//secciones notificaciones
				var notificacionesDivTd = domConstruct.create("td",{}, notificationNodeRow);
				var comboBoxDivNot = domConstruct.create("div", {}, notificacionesDivTd);
				
				var textBoxDivNotTd = domConstruct.create("td",{}, notificationNodeRow);
				var textBoxDivNot = domConstruct.create("div",{}, textBoxDivNotTd);
				
				//campos de notificaciones
				
				var selectOptions = {options:this.notificationMeansList,value:tempComboBox, style:"width: 150px;"};
				var textOptions= {value: tempTextBox,maxLength:this.notificationMaxLength,size:this.visualSize};
				
				if(tempComboBox != "-1"){
					selectOptions.disable=true;
					textOptions.disable=true;
				}
				var comboBoxNot = new dijit.form.Select(selectOptions, comboBoxDivNot);
				var textBoxNot = new dijit.form.ValidationTextBox(textOptions,textBoxDivNot);
					
				if(tempComboBox != "-1"){
				ec.fisa.widget.utils.disableWidget(comboBoxNot.id);
					ec.fisa.widget.utils.disableWidget(textBoxNot.id);
				
				}
				//tabla de botones
				/*var buttonsRow = domConstruct.create("td",{}, notificationRow);
				//var buttonsTd = domConstruct.create("td",{}, buttonsRow);
				var buttonsDivNode = domConstruct.create("div",{id:this.id+ "_button"},buttonsRow);
				buttonsDivNode.className = "i18nControlBtns";
				//buttonsDivNode.style="float: left;"
				var buttonsNode = domConstruct.create("table",{id:this.id+ "_button"},buttonsDivNode);
				var buttonsNodeBody = domConstruct.create("tbody",{id:this.id+ "_button"}, buttonsNode);
				var buttonsNodeRow = domConstruct.create("tr",{id:this.id+ "_button"}, buttonsNodeBody);
				
				//secciones botones
				/*var buttonAddTd = domConstruct.create("td",{}, buttonsNodeRow);
				var buttonAddDiv = domConstruct.create("div",{}, buttonAddTd);
				var buttonRemoveTd = domConstruct.create("td",{}, buttonsNodeRow);		
				var buttonRemoveDiv = domConstruct.create("div",{}, buttonRemoveTd);		
				*/
				//configurando campos de notificaciones
				comboBoxNot.fwId = this.id;			
				
				textBoxNot.set("required", true);
				textBoxNot.set("trim",true);
				//textBoxNot.placeAt(textBoxDivNot);
				textBoxNot.fwId = this.id;			
			}

			
			//agregando elementos creados
			if (nodoDestinatario == null) {
				var tempId = "";
				
				if (create) {
					if(id == null){
						id = "user_"+contador;
						
					}
					tempId = id;
				} else {
					tempId = "tp_"+contador;
				}
				
				this.notificationDivs[contador] = new Object();
				this.notificationDivs[contador].destinatarioNode = destinatarioNode;
				this.notificationDivs[contador].notification = [];				
				this.notificationDivs[contador].dest = comboBoxUser;	
				this.notificationDivs[contador].id = tempId;
				
				if (!create) {		
					this.notificationDivs[contador].contadorNode = 0;
					this.notificationDivs[contador].notification[0] = new Object();					
					this.notificationDivs[contador].notification[0].notificationRow = notificationRow;
					this.notificationDivs[contador].notification[0].notificationNode = notificationNode;
					this.notificationDivs[contador].notification[0].comboBox = comboBoxNot;
					this.notificationDivs[contador].notification[0].textBox = textBoxNot;
					
					if (this.notificationDivs[contador].dest.get("value") == -1) {
						ec.fisa.widget.utils.disableWidget(comboBoxNot.id);
					}
					
					this._connectEvents(comboBoxNot, contador, 0, "comboBoxNot");
					this._connectEvents(textBoxNot, contador, 0, "textBoxNot");
				}
				
				this._connectEvents(comboBoxUser, contador, null, "comboBoxUser");
				
			} else {
				
				var contadorNode = null;
				
				if (this.notificationDivs[contador].contadorNode == undefined) {
					
					contadorNode = this.notificationDivs[contador].contadorNode = 0;
					
				} else {
					
					contadorNode = ++this.notificationDivs[contador].contadorNode;
				}		
				
				this.notificationDivs[contador].notification[contadorNode] = new Object();
				this.notificationDivs[contador].notification[contadorNode].notificationRow = notificationRow;
				this.notificationDivs[contador].notification[contadorNode].notificationNode = notificationNode;
				this.notificationDivs[contador].notification[contadorNode].comboBox = comboBoxNot;
				this.notificationDivs[contador].notification[contadorNode].textBox = textBoxNot;	
				
				if (this.notificationDivs[contador].dest.get("value") == -1) {
					
					ec.fisa.widget.utils.disableWidget(comboBoxNot.id);
				}
				
				this._connectEvents(comboBoxNot, contador, contadorNode, "comboBoxNot");
				this._connectEvents(textBoxNot, contador, contadorNode, "textBoxNot");
			}
					
			return destinatarioNodeBody;
		},
		_init:function(){
			this.notificationMaxLength = this.tapdFieldLenght;
		},
		_connectEvents: function(component, contador, contadorNode, type){
			
			if (this._connections[contador] == undefined) {
				this._connections[contador] = new Object();
				this._connections[contador].notification = [];
				//this._connections[contador].notification[contadorNode] = new Object();
			} 
			
			if (contadorNode != null && this._connections[contador].notification[contadorNode] == undefined ) {
				this._connections[contador].notification[contadorNode] = new Object();
			}
			
			if (type === "comboBoxUser") {
				this._connections[contador].dest = component.connect(component, 'onChange',dojo.hitch(this,this._upDestinarioValue, contador));
			} 		
		},
		//metodo que es llamado en el onchange del combo del usuario beneficiario/destinatario
		_upDestinarioValue:function(contador){
			//dont exist return.
			if (this.notificationDivs[contador] == undefined) {
				return;
			}
			
			var comboBoxUser = this.notificationDivs[contador].dest;
			var notification = this.notificationDivs[contador].notification;

			//DESTROY ALL NOTIFICATION PRESENT
			this._removeAllMeans(contador);
			//create notification for a user.
			if (comboBoxUser.get("value") !=  -1) {
				var i = comboBoxUser.get("value");
				if(i == "tp_-1"){
					var ta = this.generalData.users[contador].userHtml ;
					this._createNotification(null, ["-1", ""], contador, ta, true, null);
				}else{
					this._addContactMediaData(i,contador);
				}
			}
			this.logger("Cambio detinatario.	"+comboBoxUser.get("value"));
		},
		
		//add contact media data by user value.
		_addContactMediaData:function(comboBoxUserValue,contador){
			var mediaList = this.generalData[comboBoxUserValue].CONTACT_MEDIA_LIST[this.userType]; //lista notificaciones medios de contacto
			var ta = this.generalData.users[contador].userHtml ;
			dojo.forEach(mediaList,dojo.hitch(this,function(entry,i){
				this._createNotification(null, [entry[0], entry[1]], contador, ta, true, null);
			}));	
		},
		
		
		_upComboBoxNot:function(contador, contadorNode){
			if (this.notificationDivs[contador] == undefined || this.notificationDivs[contador].notification[contadorNode] == undefined) {
				return;
			}
			var comboBox = this.notificationDivs[contador].notification[contadorNode].comboBox;
			var textBox = this.notificationDivs[contador].notification[contadorNode].textBox;
			var valueTextBox = textBox.get("value");			
			var id = this.notificationDivs[contador].id;	
			
			if (comboBox.get("value") == -1) {	
				ec.fisa.widget.utils.disableWidget(textBox.id);
			} else {
				ec.fisa.widget.utils.enableWidget(textBox.id);	
				
				if (comboBox.get("value") == "SMS") {					
					textBox.set("regExp",this.numberRegex);
				} else if (comboBox.get("value") == "MAIL") {
					textBox.set("regExp",this.emailRegex);
				} else {
					//TODO implement other validation
				}
			}
			
			textBox.set("value", "");
			this.logger("Cambio comboBox Notif.	"+comboBox.get("value"));
			//this._routineEvent();
		},
		_upTextBoxNotValue:function(contador, contadorNode){
			
			if (this.notificationDivs[contador] == undefined || this.notificationDivs[contador].notification[contadorNode] == undefined) {
				return;
			}
			var comboBox = this.notificationDivs[contador].notification[contadorNode].comboBox;
			var textBox = this.notificationDivs[contador].notification[contadorNode].textBox;
			var id = this.notificationDivs[contador].id;
			var valueTextBox = textBox.get("value");
			if (!textBox.isValid()) {
				textBox.set("value", "");
			}

			
			//this._routineEvent();
		},
		_showNotification: function(component){
			if(this.actualNotifications < this.maxUsers)
			{
				try{
					var valueComboBoxUser = this.notificationDivs[this.actualNotifications-1].dest.get("value");
					
					if(!this.collapsed && !(valueComboBoxUser == -1)){ 
						var notificationDiv = this.notificationDivs[this.actualNotifications];
						
						if(notificationDiv){
							//do nothing
						}else{
							var ta=this._createNotification(null, null, this.actualNotifications, null, true, null);
							this.generalData.users[this.actualNotifications] = {};
							this.generalData.users[this.actualNotifications].userHtml = ta;
							/*ta._fStarted=true;*/
							notificationDiv = this.notificationDivs[this.actualNotifications];
						}
						
						this.actualNotifications++;
						this.updateRowHeight();
					}else{
						this.logger("No se puede a\u006Eadir un destinatario.");
						return false;
					}
				}catch(e){
					this.logger("No se puede a\u006Eadir un destinatario.");			
					this.logger(e);
				}	
			}
			else{
				this.btController = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
				this.btController.clearPanelMessage();
				var message = {summary:this.errorMsg,detail:this.errorMsg,level:{level:40000}};
				this.btController.updateMsgsPanel([message]);
				
			}
		},
		_removeNotification:function(event){
			/*Solo se puede eliminar una medio cuando hay mas de un elemento*/
			if(!this.collapsed && this.actualNotifications > 1){
				var notificationDiv = this.notificationDivs[this.actualNotifications - 1].destinatarioNode;
				var notificationComboBoxUser = this.notificationDivs[this.actualNotifications - 1].dest;
				//var cttb=this._connections[this.actualNotifications - 1];
				this._setNotVisible(notificationDiv);
				
				this.notificationDivs.splice(this.actualNotifications - 1,1);
				var notificationConnections = this._connections.splice(this.actualNotifications - 1,1);
				dojo.forEach(notificationConnections,function(connection,j){
					this.disconnect(connection.dest);					
					dojo.forEach(connection.notification, function(notification, k) {
						this.disconnect(notification.textBox);
						this.disconnect(notification.comboBox);
					},this);
				},this);
				dijit.byId(notificationComboBoxUser.id).set("value", "");
				this.actualNotifications--;
				delete this.generalData.users[this.actualNotifications];
				this.notificationDivs.splice(this.actualNotifications,1);
				domConstruct.destroy(notificationDiv);
				//cttb.remove();
				notificationComboBoxUser.destroy(false);
				//this.actualValue="";
				
				this.updateRowHeight();
				ec.fisa.widget.utils.programaticChange(focusUtil.curNode);
				//this._upNotificationValue();
				/*this._routineEvent();*/
			}
		},
		//commonn function for removing means
		_removeInternalMeans:function(contadorNode,notificationDiv,contador){
			var notificationNodeDiv	 = notificationDiv.notification[contadorNode];
			
			this._setNotVisible(notificationNodeDiv.notificationNode);
			
			var notificationConnections = this._connections[contador].notification.splice(contadorNode, 1);
			
			dojo.forEach(notificationConnections, function(notification, k) {
				this.disconnect(notification.textBox);
				this.disconnect(notification.comboBox);
			},this);
			
			dijit.byId(notificationNodeDiv.textBox).set("value", ""); 
			dijit.byId(notificationNodeDiv.comboBox).set("options", null);		
			
			//eliminando elementos
			domConstruct.destroy(notificationNodeDiv.notificationRow);
			domConstruct.destroy(notificationNodeDiv.notificationNode);
			
			
			notificationDiv.notification.splice(contadorNode,1);
			contadorNode = --notificationDiv.contadorNode;
			
			/*var textBoxConnections = this._connections.splice(this.actualNotifications - 1,1);
			dojo.forEach(textBoxConnections[0],function(connection,i){
				this.disconnect(connection[i]);
			},this);*/ //to do por cada elemento	

			this.updateRowHeight();
			
			ec.fisa.widget.utils.programaticChange(focusUtil.curNode);
			//this._upLangValue();
			/*this._routineEvent();*/
			
			return contadorNode;
			
			
		},
		
		//remove all means of contact
		_removeAllMeans:function(contador){
			var notificationDiv = this.notificationDivs[contador];
			var contadorNode = notificationDiv.contadorNode;
			/*Solo se puede eliminar una medio cuando hay mas de un elemento*/
			if(contadorNode != null && contadorNode != undefined){
			while(contadorNode > -1){				
				contadorNode =this._removeInternalMeans(contadorNode, notificationDiv, contador);
			}
			}
		},
		
		_collapaseNotification:function(){
			try{
				for(i = 0; i < this.notificationDivs.length; i++){
						
						var notificationDestinatario = this.notificationDivs[i].dest;						
						ec.fisa.widget.utils.disableWidget(notificationDestinatario.id);
						
						for(var j=0;j< this.notificationDivs[i].notification.length;j++){
							var row =	this.notificationDivs[i].notification[j].notificationRow;
							this._setNotVisible(row);	
						}
				}
				this.updateRowHeight();
			}catch(e){
				this.logger(e);
			}
		},
		_expandNotification:function(){
			
			try{
				
				for(i = 0; i < this.notificationDivs.length; i++){				
						
					var notificationDestinatario = this.notificationDivs[i].dest;						
					
					if(this.readOnly==true){
						ec.fisa.widget.utils.disableWidget(notificationDestinatario.id);
					} else {
						ec.fisa.widget.utils.enableWidget(notificationDestinatario.id);
					}
					for(var j=0;j< this.notificationDivs[i].notification.length;j++){
						var row =	this.notificationDivs[i].notification[j].notificationRow;
						this._setVisible(row);	
					}
				}
				this.updateRowHeight();
			}catch(e){
				this.logger(e);
			}

		},
		_toggleCollapsed: function(){
			if(this.collapsed){
				domAttr.set(this.collapseLanguagesButton_node, "iconClass", "colapseLanguages");
				this._expandNotification();
				
			}else{
				domAttr.set(this.collapseLanguagesButton_node, "iconClass", "expandLanguages");
				this._collapaseNotification();
				
			}
			this.collapsed = !this.collapsed;
		},
		_setVisible: function(component){
			domStyle.set(component,"display","block");
			//domStyle.set(component,"float","left");
		},
		_setNotVisible: function(component){
			domStyle.set(component,"display","none");
		},
		_getValueAttr: function(){
			
			var newValue = new Object();
			
			for (var i in this.notificationDivs) {
				
				if (i == "indexOf" ) continue;
				
				var id = this.notificationDivs[i].id;
				var dest = this.notificationDivs[i].dest;
				
				if (!dest < 1 && this.notificationDivs[i].notification.length > 0) {					
							
					if (dest.get("value") != -1) {
						
						for (j in this.notificationDivs[i].notification) {
							
							if (j == "indexOf" ) continue;
							
							var idTipo = this.notificationDivs[i].notification[j].comboBox.get("value");
							var valor = this.notificationDivs[i].notification[j].textBox.get("value");
							
							if (idTipo != -1 && !valor < 1) {
								
								if (newValue[id] == undefined) {
									//in java receiverData
									newValue[id] = new Object();
									newValue[id].datos = new Object;
									newValue[id].tipo = new Object;
									newValue[id].datos.name = [dest.attr('displayedValue')];
									newValue[id].datos.value = [dest.get("value")];
									
								}
								
								if (newValue[id].tipo[idTipo] == undefined) {
									
									newValue[id].tipo[idTipo] = [];
								}
								var data = {};
								data.value = valor;
								
								//add adittional values 
								
								var listaMediaDataTemp =		this.notificationDataVO.listContactMediaDataVOs;
								dojo.forEach(listaMediaDataTemp,dojo.hitch(this,function(mediaDataVO,i){
									if(mediaDataVO.contactMediaId == idTipo && mediaDataVO.recipientType == this.userType){
										data.template =mediaDataVO.templateId;
										data.type = mediaDataVO.type;
										data.notificationType = mediaDataVO.notificationType;
										data.condition = mediaDataVO.conditionId;
										return false;
									}
								}));
								newValue[id].tipo[idTipo].push(data);
							}
							
						}
					}					
				}
			}
			
			return newValue;
		},
		_setValueAttr: function(valueArray, /*Boolean?*/ priorityChange, /*String?*/ formattedValue){			
			
			var value = valueArray[0];	
			this.priorityId	= valueArray[1];
			var isInicial = valueArray[2];
			
			this.notificationDataVO = valueArray[3];
			
			this.userFavoriteList = valueArray[4];
			this.notificationMeansList = valueArray[5];	
			this.userInsertedList = valueArray[6];
			
			if(this.userType === "R"){
				this.maxUsers =	this.notificationDataVO.maxRecipients;
			}
			else if(this.userType === "B"){
				this.maxUsers =	this.notificationDataVO.maxBeneficieries;
			}
			
			if (!isInicial) {
				this.updateMeansList();
				this.actualNotifications = 0;
				this.notificationDivs.splice(0,this.notificationDivs.length);
				this._connections.splice(0, this._connections.length);
			}
			
			this.actualValue=value; //to do verficar valor a retornar
			var contador=this.notificationDivs.length; //inicial 0
			
			if (value != null) {
				this.generalData = value;
				//automatically load previously inserted.
				if(this.userInsertedList != null && this.userInsertedList != undefined &&
						this.userInsertedList.length > 0){
					
					for(var k=0; k < this.userInsertedList.length ;k++){
						
						var ta=this._createNotification(this.userInsertedList[k], null, contador, null, true, "user_"+contador);		
						if(value.users == undefined || value.users == null){
						value.users = [];
						}
						value.users[contador] = {};
						value.users[contador].userHtml = ta;
						
						this._addContactMediaData(this.userInsertedList[k],contador);
						this.actualNotifications = ++contador;	
					
					}
					
				}else{
					if(!(this.notificationDivs[contador])){
						var ta=this._createNotification("", null, contador, null, true, "user_"+contador);		
						value.users = [];
						value.users[contador] = {};
						value.users[contador].userHtml = ta;
						this.actualNotifications = ++contador;	
					}	
				}	
				
									
			}
			
			if(this.notificationDivs.length==0){
				this._createNotification( null, null, 0, null, false, null);
				this.actualNotifications=1;
			}
			
			if(this.notificationDivs){
				/*dojo.forEach(this.notificationDivs,function(currentTextBox,i){
					//currentTextBox.set("value",langVals[i],priorityChange);
				},this);*/
				if('IN'!=this.requestedAction){
					this.collapsed=false;
				}else{
					this.collapsed=true;
				}
				this._toggleCollapsed();
			}
		},
		updateRowHeight : function(){
			if(this.gridSelectedRowIndex!=null){
				var grid=dijit.byId(this.gridId);
				grid.scroller.rowHeightChanged(this.gridSelectedRowIndex, true/*fix #11101*/);
			}
		},
		updateMeansList : function(){
			
			var interation = this.notificationDivs.length;
			var i = 0;
			for (i=0; i<interation;) {
								
				var notificationDiv = this.notificationDivs[i].destinatarioNode;				
				var notificationDiv = this.notificationDivs[i].destinatarioNode;
				var notificationTextBox = this.notificationDivs[i].dest;
				//var cttb=this._connections[this.actualNotifications - 1];
				this._setNotVisible(notificationDiv);
				var textBoxConnections = this._connections.slice(i,1);
				dojo.forEach(textBoxConnections,function(connection,j){
					this.disconnect(connection.dest);
				},this);
				dijit.byId(notificationTextBox.id).set("value", "");
				
				
				//cttb.remove();
				notificationTextBox.destroy(false);
				domConstruct.destroy(notificationDiv);
				
				this.updateRowHeight();
				ec.fisa.widget.utils.programaticChange(focusUtil.curNode);
				i++;
			}	
			
			//this._upNotificationValue();
			/*this._routineEvent();*/
		
		},
		
		isValid : function () {
			//TODO
			
		}
	} );
	
	return NotificationBTSelection;
	
});

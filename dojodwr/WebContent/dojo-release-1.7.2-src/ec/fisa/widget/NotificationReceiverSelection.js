define(["dojo/_base/kernel",
    	"dojo/_base/declare",
    	"dijit/_Widget",
    	"dijit/_Templated",
    	"dojo/text!./templates/NotificationReceiverSelection.html",
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
    	"dojo/string",
    	"./_base"], function(dojo, declare, _Widget, _Templated,template, dregexp, dojoButton, dojoTextBox, dojoValidationTextBox, 
    			fuctionalObject, domStyle, domAttr, dom, domConstruct, dijit,on, focusUtil){
	var NotificationReceiverSelection = declare("ec.fisa.widget.NotificationReceiverSelection",[_Widget, _Templated], {
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
		labelChoose:"",
		emailRegex : null,
		numberRegex : null,

		labelAddNotification:"",
		labelRemoveNotification:"",
		labelAddPerson:"",
		labelRemovePerson:"",
		
		labelRemoveNotificationTitle:"",
			labelAddNotificationTitle:"",
			labelAddPersonTitle:"",
			labelRemovePersonTitle:"",
			invalidMessage:"",
		
		constructor: function(attrs, parentNode){
			try{
				
				this.emailRegex = "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@"
					+ "[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$";
				this.numberRegex = "^[0-9]+$";
				
				this.tapdFieldLenght = attrs.tapdFieldLenght|| 0;
				this.requestedAction = attrs.requestedAction|| '';
				this.fieldId = attrs.fieldId || '';
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
					tempDest = value;
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
				
				destinatarioNode.style.border = "thin solid";
				destinatarioNode.style.margin = "5px";
				
				//secciones destinatario
				var textBoxDivTd = domConstruct.create("td",{}, destinatarioNodeRow);
				
				
				//textBoxDivTd.className = "dijitTitlePaneTitle";
				
				var tableTextBoxDiv = domConstruct.create("table",{}, textBoxDivTd);	
				var rowTextBoxDiv = domConstruct.create("tr",{}, tableTextBoxDiv);
				var tdLabelBoxDiv = domConstruct.create("td",{}, rowTextBoxDiv);
				var tdTextBoxDiv = domConstruct.create("td",{}, rowTextBoxDiv);
				
				rowTextBoxDiv.className = "dijitTitlePaneTitle";
				
				var labelDiv = domConstruct.create("div",{}, tdLabelBoxDiv);
				var textBoxDiv = domConstruct.create("div",{}, tdTextBoxDiv);		
				
				//campos de destinatario
				//textBoxDiv.innerHTML = this.labelDest+"&#09;";				
				
				var label = domConstruct.create("label", {innerHTML:this.labelDest}, labelDiv);			
				var textBoxDest = new dijit.form.ValidationTextBox({label: "Name", value: tempDest,maxLength:this.notificationMaxLength,size:this.visualSize},textBoxDiv);	
								
				//configurando campos de destinatario	
				textBoxDest.set("required", true);
//				textBoxDest.placeAt(textBoxDiv);
				textBoxDest.fwId = this.id;	
			} else {
				destinatarioNodeBody = nodoDestinatario;
			}

			if (valueNotification && create || !create) {
				
				//tabla de notificaciones
				var notificationRow = domConstruct.create("tr",{}, destinatarioNodeBody);
				var notificationCol = domConstruct.create("td",{}, notificationRow );
				
				
				
				var notificationNode = domConstruct.create("table",{}, notificationCol);
				var notificationNodeBody = domConstruct.create("tbody",{}, notificationNode);
				
				
				var notificationNodeRowLbl = domConstruct.create("tr",{}, notificationNodeBody);
				var notificationNodeColLbl = domConstruct.create("tr",{}, notificationNodeRowLbl);
				var labelComboDiv = domConstruct.create("div",{}, notificationNodeColLbl);
				var labelCombo = domConstruct.create("label", {innerHTML:this.labelChoose}, labelComboDiv);			
				
				
				
				var notificationNodeRow = domConstruct.create("tr",{}, notificationNodeBody);
				
				//secciones notificaciones
				var notificacionesDivTd = domConstruct.create("td",{}, notificationNodeRow);
				var comboBoxDivNot = domConstruct.create("div", {}, notificacionesDivTd);
				
				var textBoxDivNotTd = domConstruct.create("td",{}, notificationNodeRow);
				var textBoxDivNot = domConstruct.create("div",{}, textBoxDivNotTd);
				
				//campos de notificaciones
				var comboBoxNot = new dijit.form.Select({options:this.notificationMeansList,value:tempComboBox, style:"width: 150px;"}, comboBoxDivNot);
		
				var textBoxNot = new dijit.form.ValidationTextBox({value: tempTextBox,maxLength:this.notificationMaxLength,size:this.visualSize,invalidMessage:this.invalidMessage},textBoxDivNot);
					
				if (tempComboBox == -1) {
					
					ec.fisa.widget.utils.disableWidget(textBoxNot.id);
				}
					
				//tabla de botones
				var buttonsRow = domConstruct.create("td",{}, notificationRow);
				//var buttonsTd = domConstruct.create("td",{}, buttonsRow);
				var buttonsDivNode = domConstruct.create("div",{id:this.id+ "_button"},buttonsRow);
				//buttonsDivNode.className = "i18nControlBtns";
				//buttonsDivNode.style="float: left;"
				var buttonsNode = domConstruct.create("table",{id:this.id+ "_button"},buttonsDivNode);
				var buttonsNodeBody = domConstruct.create("tbody",{id:this.id+ "_button"}, buttonsNode);
				var buttonsNodeRow = domConstruct.create("tr",{id:this.id+ "_button"}, buttonsNodeBody);
				
				//secciones botones
				var buttonAddTd = domConstruct.create("td",{}, buttonsNodeRow);
				var buttonAddDiv = domConstruct.create("div",{}, buttonAddTd);
				var buttonRemoveTd = domConstruct.create("td",{}, buttonsNodeRow);		
				var buttonRemoveDiv = domConstruct.create("div",{}, buttonRemoveTd);		
				
				//configurando campos de notificaciones
				//comboBoxNot.placeAt(comboBoxDivNot);
				comboBoxNot.fwId = this.id;			
				
				textBoxNot.set("required", true);
				textBoxNot.set("trim",true);
				//textBoxNot.placeAt(textBoxDivNot);
				textBoxNot.fwId = this.id;			
			}

			if ((valueNotification && this.notificationDivs[contador].contadorNode == undefined) ||  (nodoDestinatario == null && !create)) {
				
				//Campos de botones y eventos
				var buttonAdd = new dijit.form.Button({baseClass: "dijitButton", type:"button", label:this.labelAddNotification, iconClass:"addLanguage", title:this.labelAddNotificationTitle},buttonAddDiv);
				buttonAdd.connect(buttonAdd, 'onClick',dojo.hitch(this,this._showMeans,buttonAdd, contador, destinatarioNodeBody));
				
				var buttonRemove = new dijit.form.Button({baseClass: "dijitButton", type:"button", label:this.labelRemoveNotification, iconClass:"removeLanguage", title:this.labelRemoveNotificationTitle},buttonRemoveDiv);
				buttonRemove.connect(buttonRemove, 'onClick',dojo.hitch(this,this._removeMeans,buttonRemove, contador, destinatarioNodeBody));
				//var textBoxDest = new dijit.form.Button({value: tempValueDest,maxLength:this.notificationMaxLength,size:this.visualSize});
				
				//configurando campos de botones
				//buttonAdd.placeAt(buttonAddDiv);
				buttonAdd.fwId = this.id;	
				
				//buttonRemove.placeAt(buttonRemoveDiv);
				buttonRemove.fwId = this.id;	
			}
			
			//agregando elementos creados
			if (nodoDestinatario == null) {
				var tempId = "";
				
				if (create) {
					
					tempId = id;
				} else {
					tempId = "tp_"+contador;
				}
				
				this.notificationDivs[contador] = new Object();
				this.notificationDivs[contador].destinatarioNode = destinatarioNode;
				this.notificationDivs[contador].notification = [];				
				this.notificationDivs[contador].dest = textBoxDest;	
				this.notificationDivs[contador].id = tempId;
				
				if (!create) {		
					this.notificationDivs[contador].contadorNode = 0;
					this.notificationDivs[contador].notification[0] = new Object();					
					this.notificationDivs[contador].notification[0].notificationRow = notificationRow;
					this.notificationDivs[contador].notification[0].notificationNode = notificationNode;
					this.notificationDivs[contador].notification[0].comboBox = comboBoxNot;
					this.notificationDivs[contador].notification[0].textBox = textBoxNot;
					
					
					if (this.notificationDivs[contador].dest.get("value") < 1) {
						
						ec.fisa.widget.utils.disableWidget(comboBoxNot.id);
					}
					
					
					this._connectEvents(comboBoxNot, contador, 0, "comboBoxNot");
					this._connectEvents(textBoxNot, contador, 0, "textBoxNot");
				}
				
				this._connectEvents(textBoxDest, contador, null, "textBoxDest");
				
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
				
				if (this.notificationDivs[contador].dest.get("value") < 1) {
					
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
			
			if (type === "textBoxDest") {
				this._connections[contador].dest = component.connect(component, 'onChange',dojo.hitch(this,this._upDestinarioValue, contador));
			} else if (type === "comboBoxNot" ) {
				this._connections[contador].notification[contadorNode].textBox = component.connect(component, 'onChange',dojo.hitch(this,this._upComboBoxNot, contador, contadorNode));
			}else if (type === "textBoxNot" ) {
				this._connections[contador].notification[contadorNode].comboBox = component.connect(component, 'onChange',dojo.hitch(this,this._upTextBoxNotValue, contador, contadorNode));
			}			
		},
		_upDestinarioValue:function(contador){
			
			if (this.notificationDivs[contador] == undefined) {
				
				return;
			}
			
			var textBox = this.notificationDivs[contador].dest;
			var notification = this.notificationDivs[contador].notification;
			
			for (i in notification) {
				
				if (i == "indexOf" ) continue;
				
				var comboBoxNot = notification[i].comboBox
				var textBoxNot = notification[i].textBox
				
				if (textBox.get("value") < 1) {
					ec.fisa.widget.utils.disableWidget(comboBoxNot.id);
					ec.fisa.widget.utils.disableWidget(textBoxNot.id);
				} else {
					ec.fisa.widget.utils.enableWidget(comboBoxNot.id);
					
					if (comboBoxNot.get("value") != -1) {
						ec.fisa.widget.utils.enableWidget(textBoxNot.id);
					}
				}
			}
			
			this.logger("Cambio detinatario.	"+textBox.get("value"));
			//this._routineEvent();
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
		//genera una nueva persona con una notificacion
		_newPersonBlank: function(component){
			try{
				var valueTextBox = null;
				if(this.notificationDivs.length ==0){
					valueTextBox = 2;//just to pass and force create a new one.
				}
				else{
					 valueTextBox = this.notificationDivs[this.actualNotifications-1].dest.get("value");
				}
				
				if(!valueTextBox < 1){ 
					var notificationDiv = this.notificationDivs[this.actualNotifications];
					
					if(notificationDiv){
						//do nothing
					}else{
						var ta=this._createNotification(null, null, this.actualNotifications, null, false, null);
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
		},
		_showMeans: function(component, contador, destinatarioNode){
			try{
				var contadorNode = this.notificationDivs[contador].contadorNode;
				var valueTextBox = this.notificationDivs[contador].notification[contadorNode].textBox.get("value")
				
				if(!valueTextBox < 1){ 
					var notificationDiv = this.notificationDivs[contador].dest;
					var id = this.notificationDivs[contador].id;
					
					if(notificationDiv){
						
						var ta=this._createNotification(null, null, contador, destinatarioNode, false, null);
						/*ta._fStarted=true;*/	
						notificationDiv = this.notificationDivs[contador].dest;	
						//this.actualValue.id.tipo.
					} else{
						//do nothing
					}
					this.updateRowHeight();
				}else{
					this.logger("No se puede a\u006Eadir una notificaci\u00F3n.");
					return false;
				}
			}catch(e){
				this.logger("No se puede a\u006Eadir una notificaci\u00F3n.");		
				this.logger(e);
			}
		},
		_removePerson:function(event){
			var createBlank= false;
			if(this.actualNotifications == 1){
				createBlank = true;
			}
			//no se puede eliminar cuando no hay nada
			if(this.actualNotifications > 0){
				var notificationDiv = this.notificationDivs[this.actualNotifications - 1].destinatarioNode;
				var notificationTextBox = this.notificationDivs[this.actualNotifications - 1].dest;
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
				dijit.byId(notificationTextBox.id).set("value", "");
				this.actualNotifications--;
				this.notificationDivs.splice(this.actualNotifications,1);
				domConstruct.destroy(notificationDiv);
				//cttb.remove();
				notificationTextBox.destroy(false);
				//this.actualValue="";
				
				this.updateRowHeight();
				ec.fisa.widget.utils.programaticChange(focusUtil.curNode);
				//this._upNotificationValue();
				/*this._routineEvent();*/
				
				if(createBlank == true){
					this._newPersonBlank()
				}
			}
		},
		_removeMeans:function(component, contador, destinatarioNode){
				
			var notificationDiv = this.notificationDivs[contador];
			var contadorNode = notificationDiv.contadorNode;
			
			/*Solo se puede eliminar una medio cuando hay mas de un elemento*/
			if(contadorNode > 0){				
				
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
			}
		},
		_collapaseNotification:function(){
			try{
				for(i = 0; i < this.notificationDivs.length; i++){
					
					if(i==0){
						
						var notificationDestinatario = this.notificationDivs[i].dest;						
						ec.fisa.widget.utils.disableWidget(notificationDestinatario.id);
						
						var notificationTypes = this.notificationDivs[i].notification;
						
						for (j in notificationTypes) {
							
							if (j == "indexOf" ) continue;
							
							var notificationComboBox = notificationTypes[j].comboBox;
							var notificationTextBox = notificationTypes[j].textBox;
							
							ec.fisa.widget.utils.disableWidget(notificationComboBox.id);
							ec.fisa.widget.utils.disableWidget(notificationTextBox.id);
						}
					}else{
						var notificationDiv = this.notificationDivs[i].destinatarioNode;
						this._setNotVisible(notificationDiv);
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
					
					var notificationTypes = this.notificationDivs[i].notification;
					
					for (j in notificationTypes) {
						
						if (j == "indexOf" ) continue;
						
						var notificationComboBox = notificationTypes[j].comboBox;
						var notificationTextBox = notificationTypes[j].textBox;
						
						if(this.readOnly==true){
							ec.fisa.widget.utils.disableWidget(notificationComboBox.id);
							ec.fisa.widget.utils.disableWidget(notificationTextBox.id);
						} else {
							ec.fisa.widget.utils.enableWidget(notificationComboBox.id);
							ec.fisa.widget.utils.enableWidget(notificationTextBox.id);
						}
					}
				}
				
				for(i = 0; i < this.actualNotifications; i++){
					this._setVisible(this.notificationDivs[i].destinatarioNode);
				}
				this.updateRowHeight();
			}catch(e){
				this.logger(e);
			}

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
							
					if (!dest.get("value") < 1) {
						
						for (j in this.notificationDivs[i].notification) {
							
							if (j == "indexOf" ) continue;
							
							var idTipo = this.notificationDivs[i].notification[j].comboBox.get("value");
							var valor = this.notificationDivs[i].notification[j].textBox.get("value");
							
							if (idTipo != -1 && !valor < 1) {
								
								if (newValue[id] == undefined) {
									
									newValue[id] = new Object();
									newValue[id].datos = new Object;
									newValue[id].tipo = new Object;
									newValue[id].datos.name = [dest.get("value")];
								}
								
								if (newValue[id].tipo[idTipo] == undefined) {
									
									newValue[id].tipo[idTipo] = [];
								}
								
								newValue[id].tipo[idTipo].push(valor);
							}
							
						}
					}					
				}
			}
			
			return newValue;
		},
		_setValueAttr: function(valueArray, /*Boolean?*/ priorityChange, /*String?*/ formattedValue){			
			
			var value = valueArray[0];	
			this.notificationMeansList = valueArray[1];			
			
			this.priorityId	= valueArray[2];
			var isInicial = valueArray[3];
			
			if (!isInicial) {
				
				this.updateMeansList();
				
				this.actualNotifications = 0;
				this.notificationDivs.splice(0,this.notificationDivs.length);
				this._connections.splice(0, this._connections.length);
			}
			
			this.actualValue=value; //to do verficar valor a retornar
			var contador=this.notificationDivs.length; //inicial 0
			
			if (value != null) {
				
				for (var i in value) {
					
					if (i == "indexOf" ) continue;
					
					if(!(value[i].datos.name.length == 0)&&!(this.notificationDivs[contador])){
						var valueName = value[i].datos.name[0]; //nombre dest
						var valueTipo = value[i].tipo; //lista notificaciones
						
						var ta=this._createNotification(valueName, null, contador, null, true, i);					
						
						
						for (var j in valueTipo) {
							
							if (j == "indexOf" ) continue;
							
							for(var k in valueTipo[j]) {
								
								if (k == "indexOf" ) continue;
								
								this._createNotification(null, [j, valueTipo[j][k]], contador, ta, true, null);
							}
						}
						
						this.actualNotifications = ++contador;	
					}				
				}
			}
			

			
			if(this.notificationDivs.length==0){
				this._createNotification( null, null, 0, null, false, null);
				this.actualNotifications=1;
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
	
	return NotificationReceiverSelection;
	
});

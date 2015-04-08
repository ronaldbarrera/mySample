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
        "ec/fisa/format/Utils",
        "dojo/string", "dijit/form/Select","./_base"], function(dojo, declare, _Widget, _Templated,template, dregexp, dojoButton,
dojoTextBox, dojoValidationTextBox, 
        		fuctionalObject, domStyle, domAttr, dom, domConstruct, dijit,on, focusUtil ){
	var NotificationBTSelection = declare("ec.fisa.widget.NotificationBTSelection",[_Widget, _Templated], {
		/*Longitud del campo en la base de datos*/
		tapdFieldLenght:0,
		/*Longitud maxima de cada uno de los elementos del campo multilenguaje*/
		notificationMaxLength:0,
		requestedAction:"",
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
		labelDest : "",
		labelNewBeneficiario:"",
		invalidValue:"",
		emailRegex : null,
		numberRegex : null,
		textBoxConfig:dojo.fromJson(dojo.cache("skin","Widget.conf")).TextBox,
		errorMsg:"",
		notificationDataVO:null,
		btController:null,
		
		arrayIdTextBox:[],
		ta:null,//Representa la tabla contenedora de los campos de notificacion.
		

		constructor: function(attrs, parentNode){
			try{

				this.emailRegex = "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@"
					+ "[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$";
				this.numberRegex = "^[0-9]+$";

				this.tapdFieldLenght = attrs.tapdFieldLenght|| 0;
				this.requestedAction = attrs.requestedAction|| '';
				this.ref = attrs.ref;
				this._connections = [];	
				this.arrayIdTextBox=[];
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
		},
		destroy: function(){
			this.inherited(arguments);
		},
		logger: function(obj){
//			if(typeof console != "undefined"){
//			console.log(obj);
//			}
		},
		_createNotification:function(mediaDataVO,  nodoDestinatario ,/*number*/ drawEven){

			var tempDest = "";

			var destinatarioNodeBody = null;

			if (nodoDestinatario == null) {

				//creando destinatario			
				var destinatarioNode = domConstruct.create("table",{'class':'fisaComponentGrid'}, this._tcn);				
				destinatarioNodeBody = domConstruct.create("tbody",{}, destinatarioNode);	
				

			} else {
			//here we create the child of the widget- contact media combo and textbox
				//tabla de notificaciones
				var trClass = "";
				if(drawEven == 1){
					trClass = "evenFieldBt";
				}
				else{
					trClass = "oddFieldBt";
				}
				
				var notificationRow = domConstruct.create("tr",{'class':trClass}, nodoDestinatario);
				//secciones notificaciones
				var notificacionesDivTd = domConstruct.create("td",{'class':'fisaComponentGridLeftCell'}, notificationRow);
				var labelDivNot = domConstruct.create("div", {}, notificacionesDivTd);

				var textBoxDivNotTd = domConstruct.create("td",{'class':'fisaComponentGridRightCell'}, notificationRow);
				var textBoxDivNot = domConstruct.create("div",{}, textBoxDivNotTd);

				//campos de notificaciones

				//var textLabelOptions= {value: mediaDataVO.contactMediaShortName,size:this.visualSize-20,disabled:true};
				
				
				var visualSizeAttr = null;
				
				if(this.visualSize>=0){
					visualSizeAttr = this.visualSize;
				}
				else{
					visualSizeAttr = this.textBoxConfig[dojo.config.fisaTheme].defaultVisualSize;
				}
				var fw =this.textBoxConfig[dojo.config.fisaTheme].textCharWidth*visualSizeAttr;
				fw +=this.textBoxConfig[dojo.config.fisaTheme].padding;
				
				var textOptions= {value: mediaDataVO.currentValue,maxLength:this.notificationMaxLength,size:this.visualSize,title:mediaDataVO.contactMediaShortName+" "+this.titlelabeltext};
				var labelTextBoxNot = domConstruct.create("label",{'class':'fisaLabel','innerHTML':mediaDataVO.contactMediaShortName,'title':mediaDataVO.contactMediaShortName+" "+this.titlelabeltext},labelDivNot);//new dijit.form.TextBox(textLabelOptions, labelDivNot);
				
				var textBoxNot = new dijit.form.ValidationTextBox(textOptions,textBoxDivNot);
				textBoxNot.domNode.style.width=fw+'px';
				
				
				textBoxNot.set("required", false);
				textBoxNot.set("trim",true);
				textBoxNot.mediaDataVO = mediaDataVO;
				
				
				if (mediaDataVO.contactMediaId == "SMS") {					
					textBoxNot.set("regExp",this.numberRegex);
				} else if (mediaDataVO.contactMediaId == "MAIL") {
					textBoxNot.set("regExp",this.emailRegex);
				} 
				textBoxNot.tabId = this.tabId;
				textBoxNot.pageScopeId = this.pageScopeId;
				textBoxNot.invalidValue = this.invalidValue;
				textBoxNot.connect(textBoxNot,"onChange",function(value){
					this.mediaDataVO.currentValue = value;
					var controller = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
					if(controller != null){
						if(this.dontClearPanelMsg == true){
						//controller.clearPanelMessage();
						ec.fisa.format.utils.removeFieldError(this.id);
						this.dontClearPanelMsg = false;
						}
					}
					
					if (!this.isValid()) {
								
								if(controller != null){
									//var msg = controller.generateMsg(this.invalidValue,"",40000);
									var level={level:40000};
									 ec.fisa.format.utils.addToFieldError(this.id,this.invalidValue,level,null);
								//	controller.updateMsgsPanel(msg);
								}
						
						this.set("value", "",false);
						this._lastValueReported="";
						this.dontClearPanelMsg= true;
						this.mediaDataVO.currentValue = "";
					}
				});
				
				this.arrayIdTextBox.push(textBoxNot.id);
				
			}

			return destinatarioNodeBody;
		},
		_init:function(){
			this.notificationMaxLength = this.tapdFieldLenght;
		},

		_setVisible: function(component){
			domStyle.set(component,"display","block");
			//domStyle.set(component,"float","left");
		},
		_setNotVisible: function(component){
			domStyle.set(component,"display","none");
		},
		_getValueAttr: function(){
			
			var arrayMediaDataVO = [];
			dojo.forEach(this.arrayIdTextBox,function(textBoxId){
				var textBoxWdgt = dijit.byId(textBoxId);
				var mediaDataVO = textBoxWdgt.mediaDataVO;
				//if(mediaDataVO.currentValue != ""){ // Se comenta por correccion de mantis 18973
				arrayMediaDataVO.push(mediaDataVO);
				//}// Se comenta por correccion de mantis 18973
			});
			

			return arrayMediaDataVO;
		},
		//sets value and inits the widget with the values
		_setValueAttr: function(notificationDataVO, /*Boolean?*/ priorityChange, /*String?*/ formattedValue){			
			this.notificationDataVO = notificationDataVO;
//			if (!isInicial) {
//			this.updateMeansList();
//			this.actualNotifications = 0;
//			this.notificationDivs.splice(0,this.notificationDivs.length);
//			this._connections.splice(0, this._connections.length);
//			}
			if(notificationDataVO.listContactMediaDataVOs != null && notificationDataVO.listContactMediaDataVOs != undefined){
				//create tabl parent
				//Modificado para soportar la actualizacion de la data de notificacion.
				//JCVQ
				if(this.ta == null || this.ta == undefined){
					this.ta = this._createNotification(null, null,null);	
				}else{
					//JCVQ
					dojo.empty(this.ta);//Limpia el contenido antes de actualizar la data
					this.arrayIdTextBox.length = 0; //Limpia el array de indices http://stackoverflow.com/questions/1232040/how-to-empty-an-array-in-javascript
				}
				var i = 1;
				dojo.forEach(notificationDataVO.listContactMediaDataVOs,dojo.hitch(this,function(mediaVo){
					this._createNotification(mediaVo, this.ta,i);
					var refresh= true;
					if( i == 1){
						i = 0;
						refresh=false;
					}
					if(refresh == true && i == 0){
						i = 1;
					}
				}));
			}	
		},
		updateRowHeight : function(){
			if(this.gridSelectedRowIndex!=null){
				var grid=dijit.byId(this.gridId);
				grid.scroller.rowHeightChanged(this.gridSelectedRowIndex, true/*fix #11101*/);
			}
		}

	} );

	return NotificationBTSelection;

});

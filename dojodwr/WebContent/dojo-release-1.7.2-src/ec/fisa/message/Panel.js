define([
		"./_base",
		"dijit/_Widget",
		"dijit/_Templated",
		"dojo/_base/declare",
		"dojo/_base/connect",
		"dojo/dom-style",
		"dojo/dom-construct",
		"dojo/dom-class",
		"dojo/text!ec/fisa/message/templates/Panel.html",
		"dojo/text!ec/fisa/message/templates/PanelPopup.html",
		"dojo/dom-attr",
		"dojo/on",
		"dojox/widget/DialogSimple",
		"./PanelDropDownButton",
		"ec/fisa/message/_MessagePanelMixin",
		"dojo/dom-geometry",
		"dijit/TooltipDialog",
		"dojox/html/entities"
	], function(_panelBase,_Widget, _Templated, declare, connect, domStyle, domConstruct, domClass, template, templatePopup, domAttr, on, DialogSimple,PanelDropDownButton,_MessagePanelMixin,domGeom){

		return declare("ec.fisa.message.Panel", [_Widget, _Templated,_MessagePanelMixin], {
			_errorPanel:null,
			_warnPanel:null,
			_infoPanel:null,
			_onHideTab:null,
			_sequence:false,
			_tabid:null,
			/*variable indicating mode in it is presented the panel error*/
			errorAdded:"",
			openInitially:null,
			insideSequence:"",
			tabId:"",
			pageScopeId:"",
			//_focusA:null,
			bindToController:false,
			
			popupDiagId:null,
			
			widgetsInTemplate : false,
			
			
			
			templateString: "",
			/*Indica que se debe atachar el panel de mensajes con el primer Title que encuentre*/
			renderFirst : false,
			constructor:function(){
				this._fisaOns=[];
				this._msgQuantity = 0;
				errorAdded= 0;
			},
			postMixInProperties:function(){
				this.inherited(arguments);
				if(this.popup){
					this.templateString=templatePopup;
				} else {
					this.templateString=template;
				}
				if(this.insideSequence==="true"){
					this._sequence=true;
				}
				
				this.createdInsideConfirmation = this["inside_confirmation"];
				
			},
			postCreate:function(){
				this.inherited(arguments);
				if(this.popup){
					var tabcontainer=ec.fisa.navigation.utils.obtainParentBreadCrumb(this);
					
					var btTitleDiv = ec.fisa.navigation.utils.obtainBtTitle(this, this.renderFirst);
					
					this._tabid=tabcontainer.id;
					var diag=new dijit.TooltipDialog({'content':''});
					this.popupDiagId= diag.id;
					var attachDiv = domConstruct.create("div",{'style':{'float':'right','padding-right':'10px'}},btTitleDiv);
					var panelAttributes ={'label':'','dropDown':diag};
					// torresm: obtener la posicion del div
					//var pos =dojo.position(attachDiv);
					var pos =domGeom.position(attachDiv,true);
					var x = pos.x;
					if(this._sequence){
						panelAttributes['class']="inSequence";
						// torresm: Desplazamiento del widget en caso de que se presente informacion
						// de paso en BTs de secuencia
						x = x-200;//tamaño de la etiqueta de paso
						}
					if(dojo.config.fisaFinalUser === "1"){
						// torresm: Para usuarios finales se aplica el estilo junto con posicion horizontal 
						// y propiedad rigth en auto
						panelAttributes.style = {top:pos.y+'px',left:x+'px',position:'fixed',right:'auto'};
						}
					else{
						// torresm: Para el caso de usuarios internos no se aplica las dos propiedades antes mencionadas
						// por problemas de estilo en pruebas
						panelAttributes.style = {top:pos.y+'px',position:'fixed'};
					}
					var btn = new PanelDropDownButton(panelAttributes,attachDiv);
					this._ddbtnid=btn.id;
					this._errori=domConstruct.create("span",{'class':'error','style':{'display':'none'}},btn.containerNode,"before");
					this._errorn=domConstruct.create("span",{'class':'errorn','style':{'display':'none'}},btn.containerNode,"before");
					this._warni=domConstruct.create("span",{'class':'warn','style':{'display':'none'}},btn.containerNode,"before");
					this._warnn=domConstruct.create("span",{'class':'warnn','style':{'display':'none'}},btn.containerNode,"before");
					this._infoi=domConstruct.create("span",{'class':'info','style':{'display':'none'}},btn.containerNode,"before");
					this._infon=domConstruct.create("span",{'class':'infon','style':{'display':'none'}},btn.containerNode,"before");
					domStyle.set(btn.domNode,"display","none");
					domConstruct.place(this._parentPanelCnt,diag.containerNode);
					//var parentTabContainer=tabcontainer.getParent();
					this._onHideTab=on(tabcontainer,"hide",dojo.hitch(this,this.closePopup));
					
					//fix cause in dlg the z index has a value very high.
					//so to show this tooltip must have an zindex more high.
					btn.connect(btn,"loadAndOpenDropDown",dojo.hitch(this,function(){
						
						var diag = dijit.byId(this.popupDiagId);
						domStyle.set(diag._popupWrapper,"zIndex",2000);
						
						// torresm: se ubica el popup justo debajo del button
						var btn = dijit.byId(this._ddbtnid);
						var btnHgt = btn.domNode.clientHeight;
						var newHeight = pos.y + btnHgt;
						var newDiagOrientClass = "dijitTooltipBelow dijitTooltipABRight";
						domStyle.set(diag._popupWrapper, "top", newHeight + 'px');
						domClass.replace(diag.domNode, newDiagOrientClass, diag._currentOrientClass || "");
						
					}));
					
				}
			},
			closePopup:function(){
				var btn = dijit.byId(this._ddbtnid);
				if(btn!= undefined){
				btn.closeDropDown(false);
				}
				return btn;
			},
			destroyRendering:function(){
				if(this.popup){
					var btn = this.closePopup();
					if(btn != undefined){
					var diag=btn.dropDown;
					btn.dropDown=null;
					btn.destroy(false);
					diag.destroy(false);
					var con=this._onHideTab;
					delete this._onHideTab;
					con.remove();
					}
				}
				this.removeOns(true);
				this.inherited(arguments);
				errorAdded= "";
				this._msgQuantity = 0;
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
				delete this._errorn;
				delete this._warnn;
				delete this._infon;
				delete this._errori;
				delete this._warni;
				delete this._infoi;
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
			
			startup:function(){
				this.inherited(arguments);
				if(this.bindToController){
					ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId).setMessagesPanel(this);
				}


				if(this.openInitially == true){
					var btn = dijit.byId(this._ddbtnid);
					if(btn!= undefined){
						setTimeout(dojo.hitch(btn,btn.loadAndOpenDropDown),500);
					}
				}
			}

		});
	});

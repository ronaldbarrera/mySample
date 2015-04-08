define([
		"dojo/_base/declare", 
		"ec/fisa/widget/Utils",
		"dojo/dom-construct",
		"dojo/dom-class",
		"dojo/dom-style",
		"dijit/_Widget", 
		"dijit/_Templated",
		"dijit/form/Button",
		"dojo/text!ec/fisa/widget/security/templates/Keyboard.html",
		"./_base"
		],
		function(declare, widgetUtils, domConstruct, domClass, domStyle, _Widget, _Templated, Button, template) {
			return declare("ec.fisa.widget.security.KeyboardLogin", [ _Widget, _Templated ], {
				tabId : '',
				pageScopeId : '',
				_fStarted:true,
				baseClass:"",
				widgetsInTemplate : true,
				_type:"",
				options:[],
				alphOptions:[],
				allOptions:[],
				selectedValue:'',
				context: null,
				templateString : template,
				_tBodyNode:null,
				multipleSelectedVals : {},
				currentId : null,
				lowerUpper : {},
				isUpperCase : false,
				actualAlphStyle : 'lowercase',
				lastULSelectedBtn : null,
				lastACSelectedBtn : null,
				charTrList : [],
				alphTrList : [],
				isLogin : false,
				data : {},

				postMixInProperties : function() {
					this.inherited(arguments);
				},
				
				postCreate: function(){
					this.inherited(arguments);
				},
				
				responseHandler : function(data) {
					var type = data.type
					this.lowerUpper = data.lowerUpper;
					if(data.msg){
						var tr = null;
						dojo.forEach(data.msg,function(item,index){
							var currentColumn = index%data.maxCols;
							if(currentColumn==0){
								tr = domConstruct.create("tr");
								domConstruct.place(tr, this._tBodyNode);
								if(item != null){
									if(item.type == "CHAR"){
										this.charTrList.push(tr);
										domStyle.set(tr, "display", "none");
									} else if(item.type == "ALPH" || item.type == "NUM"){
										this.alphTrList.push(tr);	
									}
								}
							}
							var td = null;
							if(item != null && item.specialProperties != null){
								td = domConstruct.create("td", { colspan : item.specialProperties["colspan"]});
							}else{
								td = domConstruct.create("td");
							}
							
							if(item != null){
								var type = item.type;
								if(type != "SPECIAL"){
									this._addImageComponent(item, td);
								} else{
									this._addButtonComponent(item,td);
								}
							} else {
								this._addImageComponent(item, td);
							}
							
							
							domConstruct.place(td, tr);
						},this);
					} 
				},
				
				_addImageComponent : function(item, td) {
					var a = domConstruct.create("span", { 'class': "link" });
					
					var src = "";
					var itemType = null;
					if(item != null && item.url != null){
						src = item.url;
						itemType = item.type;
					}
					var img = domConstruct.create("img", { src: src});
					if(itemType != null && itemType == "ALPH"){
						domClass.add(img,"lowercase");
						this.alphOptions.push(img);
					} else {
						domClass.add(img,"number");
					}
					
					if(item != null && item.url != null){
						this.connect(img, "onclick", function(event){
							this.onClick(a,item,event);
						});
						this.connect(img, "onmouseover", dojo.hitch(this,this.onMouseOver, img, item));
						this.connect(img, "onmouseout", dojo.hitch(this,this.onMouseOut, img, item));
						this.options.push(a);
						this.allOptions.push(img);
					}
					domConstruct.place(img, a);
					domConstruct.place(a, td);
				},
				
				_addButtonComponent : function(item, td) {
					var label = item.label;
					var value = item.value;
					//Si es uppercase por default se muestar oculto
					if(value == "LOWERCASE"){
						domStyle.set(td, "display", "none");
						this.lastULSelectedBtn = td;
					} else if(value == "LETTERS"){
						domStyle.set(td, "display", "none");
						this.lastACSelectedBtn = td;
					}
					
					var btn = domConstruct.create("div",{width: "64px", height: "32px"},td);
					
					var myButton = new Button({
			            'label': label,
			            'value': value
			        }, btn);
					

					//domConstruct.place(btn, td);
					this.connect(myButton, "onClick", dojo.hitch(this,this.onClickSpecialBtn,td, value));
					//myButton.startup();
				},
				
				onClick : function(domImg, item, evt) {
					var value = item.value;
					//console.log("Value : "+ value);
					dojo.forEach(this.options,function(item,index){
						domClass.remove(item,"selected");
					},this);
					
					var finalValue = value;
					
					if(this.isUpperCase == true){
						finalValue = this.lowerUpper[value];
						//Se evalua si no existe el valor
						if(finalValue == null || finalValue == ""){
							finalValue = value;
						}
					}
					
					this.selectedValue= this.selectedValue + finalValue;
					this.multipleSelectedVals[this.currentId] = this.selectedValue;
					//domClass.add(domImg,"selected");
					dojo.stopEvent(evt);
				},
				
				onClickSpecialBtn : function(td, value){
	                if(value == "LOWERCASE"){
						dojo.forEach(this.alphOptions,function(btn,index){
							domClass.remove(btn,"uppercase");
							domClass.add(btn,"lowercase");
						},this);
						this.isUpperCase = false;
						this.actualAlphStyle = 'lowercase';
					} else 	if(value == "UPPERCASE"){
						dojo.forEach(this.alphOptions,function(img,index){
							domClass.remove(img,"lowercase");
							domClass.add(img,"uppercase");
						},this);
						this.isUpperCase = true;
						this.actualAlphStyle = 'uppercase';
					} else 	if(value == "SPECIALCHARS"){
						dojo.forEach(this.charTrList,function(tr,index){
							domStyle.set(tr, "display", "");
						},this);
						dojo.forEach(this.alphTrList,function(tr,index){
							domStyle.set(tr, "display", "none");
						},this);
					} else 	if(value == "LETTERS"){
						dojo.forEach(this.charTrList,function(tr,index){
							domStyle.set(tr, "display", "none");
						},this);
						dojo.forEach(this.alphTrList,function(tr,index){
							domStyle.set(tr, "display", "");
						},this);
					}
	                
	                if(value == "LOWERCASE" || value == "UPPERCASE"){
		                domStyle.set(td, "display", "none");
		                if(this.lastULSelectedBtn != null){
		                	domStyle.set(this.lastULSelectedBtn, "display", "");
		                }
		                this.lastULSelectedBtn = td;
	                }else if(value == "LETTERS" || value == "SPECIALCHARS"){
	                	domStyle.set(td, "display", "none");
		                if(this.lastACSelectedBtn != null){
		                	domStyle.set(this.lastACSelectedBtn, "display", "");
		                }
		                this.lastACSelectedBtn = td;
	                }
	                
	            },
				
				onMouseOver : function(domImg, item) {
					var type = item.type;
					if(type != null && type == "ALPH"){
						domClass.remove(domImg,this.actualAlphStyle);
						domClass.add(domImg,this.actualAlphStyle+"hover");
					} else {
						domClass.remove(domImg,"number");
						domClass.add(domImg,"numberhover");
					}
				},
				
				onMouseOut : function(domImg, item) {
					var type = item.type;
					if(type != null && type == "ALPH"){
						domClass.remove(domImg,this.actualAlphStyle+"hover");
						domClass.add(domImg,this.actualAlphStyle);
					} else {
						domClass.remove(domImg,"numberhover");
						domClass.add(domImg,"number");
					}
				},
				
				_getValueAttr : function() {
					return this.selectedValue;
				},
				_setValueAttr : function(value, /* Boolean? */priorityChange, /* String? */
						formattedValue) {
					this.selectedValue=value;
				},
				_getContext : function(){
					return this.context;
				},
				registrySelectedValue : function(id) {
					this.multipleSelectedVals[id] = '';
				},
				onChangeSelectedValue : function(currentId) {
					this.selectedValue = this.multipleSelectedVals[currentId];
					this.currentId = currentId;
				},
				getSelectedValueById : function(id) {
					return this.multipleSelectedVals[id];
				},
				
				setSelectedValueById : function(id, value) {
					return this.multipleSelectedVals[id] = value;
				},
				startup : function() {
					if(this.isLogin == true){
						this.responseHandler(this.data);
					}
				}
			});
		});

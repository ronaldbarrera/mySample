define([
		"dojo/_base/declare",
		"ec/fisa/widget/Utils",
		"dojo/dom-construct",
		"dojo/dom-class",
		"dojo/on",
		"dijit/_Widget", 
		"dijit/_Templated",
		"dojo/text!ec/fisa/widget/security/templates/ImagePicker.html",
		"./_base"
		],
		function(declare, widgetUtils, domConstruct, domClass, on, _Widget, _Templated, template) {
			return declare("ec.fisa.widget.security.ImagePicker", [ _Widget, _Templated ], {
				tabId : '',
				pageScopeId : '',
				_fStarted:true,
				baseClass:"",
				widgetsInTemplate : true,
				maxCols:4,
				_type:"",
				options:[],
				aoptions:[],
				selectedValue:null,
				templateString : template,
				_tBodyNode:null,
				_fons:[],
				initData : null,
				isLogin : false,
				
				postMixInProperties : function() {
					this.inherited(arguments);
				},
				
				postCreate: function(){
					this.inherited(arguments);
					this.responseHandler(this.initData);
				},
				
				responseHandler : function(data) {
					if(data.msg){
						//var currentRow = null;
						var tr = null;
						dojo.forEach(data.msg,function(item,index){
							//Maximo numero de columnas seran 4
							var maxCols = this.maxCols;
							var imageSize = data.msg.length;
							var maxColsTmp = Math.ceil(imageSize/2);
							if(imageSize > maxCols && maxColsTmp < maxCols){
								maxCols = maxColsTmp;
							}
							var currentColumn = index%maxCols;
							if(currentColumn==0){
								tr = domConstruct.create("tr");
								domConstruct.place(tr, this._tBodyNode);
							}
							var td = domConstruct.create("td");
							var _aId =this.id+"_a_"+index;
							var a = domConstruct.create("span", { 'id':_aId });
							var _imgId=this.id+"_img_"+index;
							var img = domConstruct.create("img", { 'src': item.url, 'id':_imgId});

							this._fons.push(on(img, "click", dojo.hitch(this,this.changeValue,_imgId,item.value)));
							this._fons.push(on(a, "mouseover", dojo.hitch(this,this.onMouseOver,_aId)));
							this._fons.push(on(a, "mouseout", dojo.hitch(this,this.onMouseOut,_aId)));
							this.aoptions.push(a);
							this.options.push(img);
							domConstruct.place(img, a);
							domConstruct.place(a, td);
							domConstruct.place(td, tr);
						},this);
					}
				},
				changeValue : function(domImgId,value) {
					//console.log("Value : "+ value);
					dojo.forEach(this.options,function(item,index){
						domClass.remove(item,"selected");
					},this);
					this.selectedValue=value;
					var domImg= dojo.byId(domImgId);
					domClass.add(domImg,"selected");
				},
				_getValueAttr : function() {
					return this.selectedValue;
				},
				onMouseOver : function(aId) {
					dojo.forEach(this.aoptions,function(item,index){
						domClass.remove(item,"shadow");
					},this);
					var a=dojo.byId(aId);
					domClass.add(a,"shadow");
				},
				onMouseOut : function(aId) {
					dojo.forEach(this.aoptions,function(item,index){
						domClass.remove(item,"shadow");
					},this);
				},
				_setValueAttr : function(value, /* Boolean? */priorityChange, /* String? */
						formattedValue) {
					this.selectedValue=value;
				},
				destroy:function(){
					dojo.forEach(this._fons,function(item){
						item.remove();
					},this);
					this._fons=null;
					this.aoptions=null;
					this.options=null;
					this.inherited(arguments);
				}
			});
		});

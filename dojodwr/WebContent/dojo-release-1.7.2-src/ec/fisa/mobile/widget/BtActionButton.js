define( [ "dijit/_Widget", 
          "dijit/_Templated",
          "dojo/text!./templates/BtActionButton.html", 
          "dojo/_base/declare",
          "./_MvcMixin",
          "dojox/mobile/Button",
          "./_base"],function(_Widget,_Templated,template,declare,MvcMixin,Button) {
	return declare("ec.fisa.mobile.widget.BtActionButton", [ _Widget, _Templated, Button], {
		fisatabid:"",
		fisapageid:"",
		_componentNode : null,
		label:"",
		ispopup: false,
		controller: null,
		action:"",
		controller:null,
		templateString : template,
		widgetsInTemplate : true,
		
		postMixInProperties:function(){
			this.inherited(arguments);
		},
		
		buildRendering: function(){
			this.inherited(arguments);
		},
		
		startup:function(){
			this.inherited(arguments);
			var fnctn = null;
			this.controller = ec.fisa.controller.utils.getPageController(this.fisatabid,this.fisapageid);
			
			if(this.controller && this.action=="cancel"){
				this.controller.addControllerRef(this);
			}
			if(this.action=="execute"){
				fnctn = this.executeAction;
			}else if(this.action=="cancel"){
				fnctn = this.cancelAction;
			}else if(this.action=="print"){
				fnctn = this.print;
			} else if(this.action=="document"){
				fnctn = this.document;
			} 


			if(fnctn){
				this.on("click",dojo.hitch(this,fnctn));
			}
			
		},
		
		executeAction: function(){
			if(this.ispopup){
				this.controller.execActionPU(this);
			} else {
				this.controller.execAction(this);
			}
		},
		
		cancelAction: function(){
			this.controller.execAction(this);
		},
		
		print: function(){
			this.controller.printPage(this);
		},
		//calls documents on a new page
		document:function(){
			this.controller.showDocument(this);
			
		}
		
		
		
		
		
	});
});
          
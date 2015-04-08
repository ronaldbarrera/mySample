define( [ "dijit/_Widget", 
          "dijit/_Templated",
          "dojo/text!./templates/BtActionButton.html", 
          "dojo/_base/declare",
          "./_MvcMixin",
          "dojox/mobile/Button",
          "./_base"],function(_Widget,_Templated,template,declare,MvcMixin,Button) {
	return declare("ec.fisa.mobile.widget.BtSequenceActionButton", [ _Widget, _Templated, Button], {
		fisatabid:"",
		fisapageid:"",
		label:"",
		tabIndex:null,
		next_step:"",
		seq_id:"",
		buttonActionType:0,
		is_last_bt:false,
		has_documents:null,
		show_documents:null,
		has_confirmation_bt:false,
		sequence_mode:'',
		show_confirmation:null,
		previous_button:false,
		ispopup: false,
		is_sequence:false,
		hold_button:false,
		next_button:false,
		accept_button:false,
		_componentNode : null,
		controller: null,
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
			
			if(this.controller && (this["fisa-action-id"]=="cancel" || this["fisa-action-id"]=="closeBt")){
				this.controller.addControllerRef(this);
			}
			
			this._componentNode.on("click",dojo.hitch(this,this.onClick));
			
			
		},
		
		onClick: function(){
			this.controller = ec.fisa.controller.utils.getPageController(this.fisatabid,this.fisapageid);
			
			switch(this.buttonActionType){
			case 1:
				this.controller.printPage(this);
				break;
			case 2:
				this.controller.sequenceNextAction(this,false);
				break;
			case 3:
				this.ispopup?this.controller.execActionPU(this):this.controller.execAction(this);
				break;
			case 4:
				this.controller.execAction(this)
				break;
			case 5:
				this.controller.sequenceNextAction(this);
				break;
			case 6:
				this.controller.sequenceNextAction(this,true);
				break;
			default:
				break;
			}
		}
		
	});
});
          
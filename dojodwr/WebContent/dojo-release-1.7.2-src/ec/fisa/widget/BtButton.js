define( [ "dojo/_base/declare",
          "dijit/form/Button",
          "dojo/_base/kernel",
          "dojo/on",
          "./_base"],
		function(declare,Button, dojo, on) {

			return declare("ec.fisa.widget.BtButton", [Button ], {
				btId:'',
				'bt-id':'',
				fieldId:'',
				tabId:'',
				pageScopeId:'',
				actionMode:'',
				readOnly:false,
				btPos:-1,
				isARoutineField: false,
				routineBtId:"",
				routineFieldId:"",
				routineActionMode:"",
				tabIndexField:null,
				tabIndex:0,
				_destroyOnRemove: true,
				postMixInProperties:function(){
					this.inherited(arguments);
					if(this.readOnly){
						this.disabled=true;
					}
					if(this['bt-id']==''){
						this['bt-id']=this.btId;
					}
					if(this.tabIndexField != null){
						this.tabIndex = this.tabIndexField;
					}
					
				},
				processClick:function(e){
					if(this.isARoutineField == true){
						var controller = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
						var messagesPanel = dijit.byId(controller.messagesPanelId);
						messagesPanel.clearAllMessages();
						controller.executeFieldRoutines(this.routineBtId, this.routineFieldId,this.routineActionMode);
					}
				},
				handleButtonResponse:function(outcome){
					var controller = ec.fisa.controller.utils.getPageController(this.tabId,this.pageScopeId);
					if(outcome.aMsgs){
						controller.updateMsgsPanel(outcome.aMsgs);
						//controller.doPanelsLayout();
					}
					if(outcome.wAxn&&outcome.wAxn=="open"){
						var newSubTabPaneArg = {href:outcome.dst,title:outcome.dialogName};
						ec.fisa.navigation.utils.openNewBreadCrumb(newSubTabPaneArg,controller.breadcrumbId);
					}
				},
				postCreate: function(){
					this.inherited(arguments);
					//this.attachClickEvent();
				},
				attachClickEvent:function(actionMode){
					if(!this.readOnly){
						this.isARoutineField=true;
						this.routineBtId = this.btId;
						this.routineFieldId = this.fieldId;
						this.routineActionMode = actionMode;
						this.connect(this,"onClick",this.processClick);
					}
				},
				_setEnabledAttr:function(value){
					if(typeof value==="boolean"){
						this.set("disabled",!value);
					}
				},
				_getEnabledAttr:function(){
					return !this.get("disabled");
				}
			});
		});

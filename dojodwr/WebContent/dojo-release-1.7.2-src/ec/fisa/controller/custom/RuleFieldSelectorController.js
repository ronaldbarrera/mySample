define([
        "dojo/_base/kernel","dojo/_base/declare","dojo/_base/lang","./_base","ec/fisa/controller/BaseController","dojo/data/ItemFileWriteStore"
        ],function(dojo,declare,lang,fisaBaseController,BaseController,ItemFileWriteStore){

	var RuleFieldSelectorController = declare("ec.fisa.controller.custom.RuleFieldSelectorController", [BaseController], {
		tabId:'',
		pageScopeId:'',
		parentPageScopeId:'',
		parentBtId:'',
		parentFieldId:'',
		fieldsStore:null,
		variablesStore:null,
		fieldsGridId:'',
		variablesGridId:'',
		parentWidgetId:'',
		selectData:null,
		dataKey:null,
		initMsgs:null,
		constructor: function (tabId, pageScopeId, parentPageScopeId, parentBtId, parentFieldId,parentWidgetId,dataKey,selectData, data, initMsgs) {
			this.tabId = tabId;
			this.pageScopeId = pageScopeId;
			this.parentPageScopeId = parentPageScopeId;
			this.parentBtId = parentBtId;
			this.parentFieldId = parentFieldId;
			this.fieldsStore = new ItemFileWriteStore({ 'data': {'identifier':'id','label':'id','items':data.fields} });
			this.variablesStore = new ItemFileWriteStore({ 'data': {'identifier':'id','label':'id','items':data.variables} });
			this.parentWidgetId=parentWidgetId;
			var table = dojo.byId(parentWidgetId);
			dojo.setAttr(table,'tid',tabId);
			dojo.setAttr(table,'psid',pageScopeId);
			this.selectData=selectData;
			this.dataKey=dataKey;
			this.initMsgs=initMsgs;
		},
		destroy:function(){
			var fieldsGrid=dijit.byId(this.fieldsGridId);
			delete this.fieldsStore;
			delete fieldsGrid.store;
			fieldsGrid.destroy(false);
			var variablesGrid=dijit.byId(this.variablesGridId);
			delete this.variablesStore;
			delete variablesGrid.store;
			variablesGrid.destroy(false);
		},
		setMessagesPanel:function(messagesPanel){
			this.inherited(arguments);
			
			this.breadcrumbId=ec.fisa.navigation.utils.obtainParentBreadCrumb(messagesPanel).id;
			this.updateMsgsPanel(this.initMsgs);
			delete this.initMsgs;
			//obtain contentpane where resides the qt. and is inserted at the breadcrumb.
//			var qtContentPane = messagesPanel.getParent().getParent();
//			qtContentPane.tabId=this.tabId;
//			qtContentPane.pageScopeId=this.pageScopeId;
//			qtContentPane.isQtContentPane = true;
		},
		changeSelection:function(selectedGrid){
			var grid=null;
			var gridCmpl=null;
			if(this.fieldsGridId===selectedGrid){
				grid=dijit.byId(this.variablesGridId);
				gridCmpl=dijit.byId(this.fieldsGridId);
			} else if(this.variablesGridId===selectedGrid){
				grid=dijit.byId(this.fieldsGridId);
				gridCmpl=dijit.byId(this.variablesGridId);
			} else {
				return;
			}
			if(gridCmpl._onSelectionUpdate==false){
				if(grid.selection.selectedIndex>=0){
					grid._onSelectionUpdate=true;
					gridCmpl._onSelectionUpdate=true;
					grid.selection.clear();
				}
			} else {
				grid._onSelectionUpdate=false;
				gridCmpl._onSelectionUpdate=false;
			}
		},
		doSelect:function(){
			var grid=dijit.byId(this.fieldsGridId);
			var type=null;
			if(grid.selection.selectedIndex>=0){
				type='F';
			}else {
				grid=dijit.byId(this.variablesGridId);
				if(grid.selection.selectedIndex>=0){
					type='V';
				} else {
					this.updateMsgsPanel([{level:{level:30000},summary:'Seleccione una opcion',detail:'Seleccione una opcion'}]);
					return;
				}
			}
			var itemStr=grid.getItem(grid.selection.selectedIndex);
			var item={'id':grid.store.getIdentity(itemStr),'fieldName':grid.store.getValue(itemStr,'prompt'),'btId':grid.store.getValue(itemStr,'btId')};
			var qtId=grid.store.getValue(itemStr,'qtId');
			item['operator']=grid.store.getValue(itemStr,'conditionDefault');
			item['conditionEnable']=grid.store.getValue(itemStr,'conditionEnable');
			item['dbDataType']=grid.store.getValue(itemStr,'dbDataType')
			if(qtId!=null){
				var data = this.selectData[qtId];
				if(data!=null){
					var qtLabel=grid.store.getValue(itemStr,'qtDescription');
					var qtValue=grid.store.getValue(itemStr,'qtValue');
					
					var newData=[];
					dojo.forEach(data,function(it){
						newData.push({'label':it['f'+qtLabel],'value':it['f'+qtValue]});
					},this);
					item['qtItems']=newData;
				}
			}
			var tbl = dojo.byId(this.parentWidgetId);
			var str=dojo.getAttr(tbl,'rulescompid');
			var wid=dijit.byId(str);
			wid.addItem(type,item,tbl);
		},
		close:function(){
			var tbl = dojo.byId(this.parentWidgetId);
			var str=dojo.getAttr(tbl,'rulescompid');
			var wid=dijit.byId(str);
			wid.closeFieldSelector();
			
		}
	});
	return RuleFieldSelectorController;
});

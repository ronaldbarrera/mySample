define([
	"dojo/_base/declare", // declare
	"./_base"		// registry.byNode
], function(declare){

// module:
//		dijit/form/_ButtonMixin

return declare("ec.fisa.mobile.widget._ButtonMixin", null, {
	addParamToModel:function(){
		if(this.ftype=="BT"|| this.ftype=="BT_FOR_READ"|| this.ftype=="BT_HOLD"|| this.ftype=="BT_AUTORIZATION"|| this.ftype=="BT_AUTORIZATION_FOR_READ"){
			var ctrlr=ec.fisa.controller.utils.getPageController(this.fisatabid,this.fisapageid);
			this.data=ctrlr.data;
			this.model=ctrlr.model;
			this.addParamToModelBt(this);
			delete this.data;
			delete this.model;
			delete this.parentData;
		}else if(this.ftype=="QT"||this.ftype=="QT_FOR_READ"||this.ftype=="QT_PORTLET"){
			var ctrlr=ec.fisa.controller.utils.getPageController(this.fisatabid,this.fisapageid);
			this.data=ctrlr.data;
			this.model=ctrlr.model;
			this.modelComplement=ctrlr.modelComplement;
			this.parentData=ctrlr.parentData;
			this.parentComplementData=ctrlr.parentComplementData;
			this.addParamToModelQt(this);
			delete this.data;
			delete this.model;
			delete this.modelComplement;
			delete this.parentData;
			delete this.parentComplementData;
		}else if(this.ftype=="AGD"){
			var ctrlr=ec.fisa.controller.utils.getPageController(this.fisatabid,this.fisapageid);
			this.addParamModelAgenda(this,ctrlr);
		}
	},
	addParamToModelBt:function(component){
		var eid=component["bt-id"];
		var fid=component["field-id"];
		var field = null;
		if(this.data&&this.data[eid]&&this.data[eid].dataMessage){
			field = this.data[eid].dataMessage.fields[fid];
		}
		if(field == null) {
			field={value:'',complement:null};
			component._fStarted=true;
		} else if(field.value==null){
			field.value="";
			component._fStarted=true;
		}else if(field.value==''){
			component._fStarted=true;
		}
		if(this.model.contains(eid)){
			// if exists yet updates new value.
			if(this.model.contains([eid,'dataMessage','fields',fid]) ) {
				this.model.setValue([eid,'dataMessage','fields',fid,'value'],field.value);
			}
		} else {
			this.model.appendObject([eid,'dataMessage','fields',fid,'value'],field.value,component.id,'value',null,false);

			var enabled = null;
			if(field.enabled != undefined ){
				enabled = field.enabled;
			}
			this.model.appendObject([eid,'dataMessage','fields',fid,'enabled'],enabled,component.id,'enabled',null,false);


			if(component.hasCompl){
				this.model.appendObject([eid,'dataMessage','fields',fid,'complement'],field.complement,component.id,'complement',null,false);
			}

		}
	},
	addParamToModelQt:function(component){
		var fid=component["field-id"];
		if(!this.model.contains(fid)){
			var eid=component["bt-id"];
			var paramData = this.parentData[fid];
			var stf = null;
			var _data=null;
			if (paramData) {
				var pd=null;
				if(paramData.get){
					pd=paramData.get("value");
				} else {
					pd=paramData;
				}
				_data=pd;
			} else {
				_data="";
			}

			this.model.appendObject([fid],_data,component.id,'value',null,true);
			if(component.hasCompl){
				var complemento=this.parentComplementData[fid];
				if(!complemento){
					complemento="";
				}
				this.modelComplement.appendObject([fid],complemento,component.id,'complement',null,false);
			}

		}
		//Cargando los componentes visuales de la qt
//		if(!this.dojoComponents[eid]){
//			this.dojoComponents[eid]=[];
//		}
//		var componentElement = {fieldId: component["field-id"], component: component.id};
//		this.dojoComponents[eid].push(componentElement);
	},
	addParamModelAgenda:function(component,controller){
		var comp = component;
		var fid=component["field-id"];
		//controller.model.appendObject([taskTypeId],);
		//field = this.data[eid].dataMessage.fields[fid];
		fieldValue=controller.initData[fid];
		if(controller.model.contains(fid)){
			controller.model.setValue([fid],fieldValue);
		}else{
			controller.model.appendObject([fid],fieldValue,component.id,'value',null,false);	
		}
	}
	});
});
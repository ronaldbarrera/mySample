define( [ "dojo/_base/kernel",
          "dojo/_base/declare",
          "ec/fisa/validation/_base",
          "dojox/validate",
          "dojo/_base/lang",
          "dojox/lang/functional/object",
          "ec/fisa/controller/Utils"],
		function(dojo, declare, validation, dojoxValidate, lang) {
			var Utils = declare("ec.fisa.validation.FisaPhoneValidator", null, {
				//Aplica validaciones de telefonos basado en la parametrización de la tabla TCOR_PHONE_TYPE
				isPhoneNumber:function(/*Componente visual*/component){
					var outcome = true;
					if(component){
						var additionalInfo = component.get("additionalInfo");
						if(additionalInfo == null || additionalInfo == undefined || additionalInfo == ""){
							component.validationMessage = dojo.config.validatorsData.phoneValidatorData.phoneValidationMessages.phoneParNotDefinedException;
							outcome = false;
						}else{
							outcome = this._validatePhoneNumber(component);
						}
					}
					return outcome;
				},
				_validatePhoneNumber: function(/*Componente visual*/component){
					var val = "";
					var outcome = true;
					if(component && component.get && lang.isFunction(component.get)){
						val = component.get("value");
						if(val == undefined || val == null){
							val = "";
						}						
					}
					
					if(val != undefined && val != null && val != ""){
						outcome = this._doValidate(component);
					}
					return outcome;
				},
				_doValidate:function(component){
					var outcome = true;
					var validationInfo = this.getValidationInfo(component);
					outcome = this.validateMinLength(component, validationInfo);
					if(outcome == true){
						//Ingresa si pasó la validación de longitud minima
						outcome = this.validateMaxLength(component, validationInfo);
					}
					return outcome;
				},
				validateMinLength:function(component, validationInfo){
					var outcome = true;
					var value = component.get("value");
					if(value.length < validationInfo.MIN_LENGTH){
						outcome = false;
						var message = dojo.config.validatorsData.phoneValidatorData.phoneValidationMessages.tooShortValueException;
						component.validationMessage = message.replace(":replace_this", validationInfo.MIN_LENGTH);
					}
					return outcome;  
				},
				validateMaxLength:function(component, validationInfo){
					var outcome = true;
					var value = component.get("value");
					if(value.length > validationInfo.MAX_LENGTH){
						outcome = false;
						var message = dojo.config.validatorsData.phoneValidatorData.phoneValidationMessages.tooLargeValueException;
						component.validationMessage = message.replace(":replace_this", validationInfo.MAX_LENGTH);
					}
					return outcome;  					
				},
				getValidationInfo:function(component){
					var eid=component["bt-id"];
					var fid=component.get("additionalInfo");
					var tabId = component["tabId"];
					var pageScopeId = component["pageScopeId"];
					var fc = ec.fisa.controller.utils.getPageController(tabId, pageScopeId);
					var phoneType;
					if(fc.model.contains([eid,'dataMessage','fields',fid])){
						//Se busca la data adicional de uno de los campos visibles en pantalla
						phoneType = new String(fc.getFieldModel(eid, fid));
					}else{
						//Se busca la informacion adicional en la data que vino desde initBtData
						phoneType = new String(fc.data[eid].dataMessage.fields[fid].value);
					}
					
					//dojo.config.validatorsData es inicializada en view root. primero se invoca el método ValidationController.initData
					//y luego en la invocacion dojo.addOnLoad al final de view root se define esta variable dojo.config.<%=com.fisa.render.util.RenderConstants.VALIDATORS_DATA%>=<dwr:convert value="<%=request.getAttribute(com.fisa.render.util.RenderConstants.VALIDATORS_DATA)%>" json="true" />;
					var validationInfo = dojo.config.validatorsData.phoneValidatorData.phoneTypeData[phoneType];
					return validationInfo;
				}
			});
			return Utils;
		});

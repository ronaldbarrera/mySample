define( [ "dojo/_base/kernel",
          "dojo/_base/declare",
          "ec/fisa/validation/_base",
          "dojox/validate",
          "dojo/_base/lang",
          "dojox/lang/functional/object",
          "dojox/validate/web",
          "./FisaPhoneValidator"],
		function(dojo, declare, validation, dojoxValidate, lang) {
			var Utils = declare("ec.fisa.validation.Utils", null, {
				ATOM:"[^\\x00-\\x1F^\\(^\\)^\\<^\\>^\\@^\\,^\\;^\\:^\\\\^\\\"^\\.^\\[^\\]^\\s]",
				IP_DOMAIN:"\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\]",
				EMAIL:null,
				RE:null,
				phoneValidator: null,
				emailRegExp:function(){
					var DOMAIN = "(" + this.ATOM + "+(\\." + this.ATOM + "+)*";
					var email = "^" + this.ATOM + "+(\\." + this.ATOM + "+)*@" + DOMAIN + "|" + this.IP_DOMAIN + ")$";
					this.EMAIL = email;
					this.RE = new RegExp(this.EMAIL, "i");
					return email;
				}, 
				isEmailAddress:function(/*Componente visual*/component){
					var val = "";
					var outcome = true;
					if(component && component.get && lang.isFunction(component.get)){
						val = component.get("value");
						if(val == undefined || val == null){
							val = "";
						}
					}
					if(val != undefined && val != null && val != ""){
						outcome = this.RE.test(val)
					}
					if(outcome == false){
						var message = dojo.config.validatorsData.emailValidatorData.errorMessage;
						component.validationMessage = message.replace(":replace_this", val);
					}
					return outcome;
				},
				isPhoneNumber:function(/*Componente visual*/component){
					return this.phoneValidator.isPhoneNumber(component);
				},
				isRegExpComplaint:function(/*Componente visual*/component){
					return true;
				},
				findValidator:function(/*Componente visual*/component){
					var validatorFunction = undefined;
					var componentValidator = component.get("javaScriptValidator");//Esta propiedad se definio en ComponentFactory.setFieldBTtoObject JCVQ
					if(componentValidator != null && componentValidator != undefined && componentValidator != "" && componentValidator != ''){
						switch(componentValidator){//Inicialmente se soporte tres validadores
						case "email":
							validatorFunction = this.isEmailAddress;
						break;
						case "phone":
							validatorFunction = this.isPhoneNumber;
						break;
						case "regExp":
							validatorFunction = this.isRegExpComplaint;
						break;
						}
					}
					if(validatorFunction != undefined){
						validatorFunction = dojo.hitch(this, validatorFunction);
					}
					return validatorFunction;
				}
			});
			
			validation.utils = new Utils();
			ec.fisa.validation.utils = validation.utils;
			validation.utils.emailRegExp();//Se invoca para inicializar la propiedad EMAIL y RE, caso contrario serian NULL
			validation.utils.phoneValidator = new ec.fisa.validation.FisaPhoneValidator();
			return Utils;
		});

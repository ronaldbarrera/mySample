define( [ "dojo/_base/kernel", 
          "dojo/_base/declare", 
          "dojo/on", 
          "dojo/date/locale",
          "dojo/dom-construct", 
		  "ec/fisa/mobile/format/_base", 
		  "ec/fisa/mobile/widget/Link"/*,
		  "ec/fisa/widget/Link"*/
		  ], function(dojo, declare, on, dateLocale, domConstruct,
				 fisaFormat, fisaLink/*,UtilLink*/) {

	var Utils = declare("ec.fisa.mobile.format.Utils", /*[UtilLink]*/null, {
		
		JDBCtimestampFormat:'yyyy-MM-dd HH:mm:ss.S',
		
		formatQtColumn : function(format, formatPattern, valueToFormat, rowIndex, actionToInvoke,description, tabId, pageScopeId, formatterData) {
			var aditionalData = formatterData || {};
			try{
			if(isNaN(format)){
				var outcome = "";
				if (valueToFormat != null){
					outcome = valueToFormat;
				}
				return outcome;
			}else if(format==1||format==2 || format==3){
				if(valueToFormat==null){
					return "";
				}
				var dateValue = ec.fisa.mobile.format.utils.parseLongDate(valueToFormat);
				return dateLocale.format(dateValue,{datePattern:formatPattern,selector:"date",locale:dojo.config.fisaCurrentLocale});
			} else if(format==4||format==6 || format==5){
				if(valueToFormat==null){
					return "";
				}
				return ec.fisa.mobile.format.utils.formatNumber(valueToFormat,formatPattern);
			} else if(format==8){
				if(valueToFormat==null){
					return "";
				} else if (valueToFormat=="0"){
					return "<input type=\"checkbox\" disabled=\"true\" disabled=\"true\"  />";
				}			
				return "<input type=\"checkbox\" disabled=\"true\" checked=\"checked\" />";
			} else if(format==26){
				if(valueToFormat==null||valueToFormat=="0"||valueToFormat==""){
					return "";
				}
				return "<span class=\"qtCellChecked\"/>";
			} else if(format==27){
				if(valueToFormat==null||valueToFormat=="0"||valueToFormat==""){
					return "";
				}
				var noImagePath = dojo.config.fisaContextPath + "/imageNotFound.jpg";
				var onerrorCall = "this.src = '" + noImagePath + "'";
				var imagePath = dojo.config.fisaContextPath + "/fisaImages/"+valueToFormat;
				//formatPattern -> url of the image came from componentfactory
				//var img =domConstruct.create("img",{src:imagePath,alt:description, title:description, onerror:onerrorCall});
				return "<img src=\""+ imagePath+"\"  alt=\""+description+"\" title=\""+description+"\" onerror=\""+onerrorCall+"\" width=\"14\" height=\"14\"  />";
			}
			
			
			
			if(format<0){
				var controller = ec.fisa.controller.utils.getPageController(tabId, pageScopeId);
				var linkAttrs= {
						fakeBtn:{
							fc:controller,
							'fisatabid':tabId,
							'fisapageid':pageScopeId},
						fisaScopeSelectedId:rowIndex,
						fisaScopeSelectedAction:actionToInvoke,
						onClick:function(){
							this.fakeBtn.fc.executeAction.call(this.fakeBtn,false, this.fisaScopeSelectedAction, this.fisaScopeSelectedId);
						}};
				if(format==-1){
					//PromptLink
					linkAttrs.title=description||"";
					linkAttrs.label=valueToFormat||"";
					var outcome = new fisaLink(linkAttrs);
					return outcome;
				} else if(format==-3){
					//TextLink
					linkAttrs.title=description||"";
					linkAttrs.label=formatPattern||"";
					return new fisaLink(linkAttrs);
				} else if(format==-2){
					//Image
					var outcome= new fisaLink(linkAttrs);
					var noImagePath = dojo.config.fisaContextPath + "/imageNotFound.jpg";
					var onerrorCall = "this.src = '" + noImagePath + "'";
					//formatPattern -> url of the image came from componentfactory
					domConstruct.create("img",{src:formatPattern,alt:description, title:description, onerror:onerrorCall,"style":{"display": "block", "margin": "auto"}},outcome.containerNode);
					return outcome;
				}else if(format == -4){//Link de imagen o pdf
					
					var linkData = {
							'fieldId':aditionalData.fieldId,
							'tabId': tabId,
							'pageScopeId':pageScopeId,
							'valueToFormat': valueToFormat,
							'rowIndex': rowIndex,
							'colDef':aditionalData.colDef,
							'routine': aditionalData.routine};
					//return  new fisaLink(linkData);
					return ec.fisa.mobile.format.utils.formatQueryTemplateFieldLink(linkData);
				}else if(format == -5){//Link de alias de cuentas
					var linkData = {
							'fieldId':aditionalData.fieldId,
							'tabId': tabId,
							'pageScopeId':pageScopeId,
							'valueToFormat': valueToFormat,
							'rowIndex': rowIndex,
							'gridId': aditionalData.colDef.grid.id,
							'colDef':aditionalData.colDef,
							'originalValueIndex':aditionalData.colDef.grid.originalValueIndex,
							'maskId': formatPattern};	
					return ec.fisa.format.utils.formatQueryTemplateFieldAliasLink(linkData);
				}
			}
			}
			catch(e){
				valueToFormat  = valueToFormat;
			}
			return valueToFormat;
		},
		//string must comply with this pattern 'yyyy-MM-dd HH:mm:ss.S'
		parseLongDate:function(strValue){
			if(strValue!=null){
				var n=strValue.lastIndexOf(".");
				if(n>=0&&strValue.length>=(n+2)){
					strValue=strValue.substring(0,n+2);
				} else if(n>=0&&strValue.length>=(n+1)){
					strValue=strValue.substring(0,n+1)+"0";
				}
			}
			return dateLocale.parse(strValue,{datePattern:this.JDBCtimestampFormat,selector:"date",locale:dojo.config.fisaCurrentLocale});
		},
		//dont take into account any locale but info found in params.
		formatNumber : function(/*Number*/value, /*String*/pattern){
			if(value==null || value==='' || value===undefined){ // 0=='' is true, use ===.
				return '';
			}
			var formattedValue = String(value);
			if(typeof value != "number"){ value=number.parse(value,{locale:"en"}); }
			if(isNaN(value)){ return ""; }
			var sign='';
			if(value<0)sign='-';
			var places=0;
			var decimal = dojo.config.decimalSeparator;
			var group = dojo.config.groupSeparator;
			if(pattern && pattern.length>0){
				var index = pattern.indexOf(decimal);
				if(index>-1 ){
					var temp = pattern.substring(index+1);
					places=temp.length;
				}
			}
			var patternParts = pattern.split(decimal),
			maxPlaces = places;
			var valueParts = String(Math.abs(value)).split("."),
			fractional = valueParts[1] || "";
			if(patternParts[1] || options.places){
				var pad =places !== undefined ? places : (patternParts[1] && patternParts[1].lastIndexOf("0") + 1);
				if(pad > fractional.length){
					valueParts[1] = dstring.pad(fractional, pad, '0', true);
				}
				if(maxPlaces < fractional.length){
					valueParts[1] = fractional.substr(0, maxPlaces);
				}
			}else{
				if(valueParts[1]){ valueParts.pop(); }
			}
			// Pad whole with leading zeros
			var patternDigits = patternParts[0].replace(decimal, '');
			pad = patternDigits.indexOf("0");
			if(pad != -1){
					pad = patternDigits.length - pad;
					if(pad > valueParts[0].length){
						valueParts[0] = dstring.pad(valueParts[0], pad);
					}
					// Truncate whole
					if(patternDigits.indexOf("#") == -1){
						valueParts[0] = valueParts[0].substr(valueParts[0].length - pad);
					}
			}
			// Add group separators
			var index = patternParts[0].lastIndexOf(group),
			groupSize=3;
			var pieces = [];
			for(var whole = valueParts[0]; whole;){
				var off = whole.length - groupSize;
				pieces.push((off > 0) ? whole.substr(off) : whole);
				whole = (off > 0) ? whole.slice(0, off) : "";
			}
			valueParts[0] = pieces.reverse().join(group);
			var result= valueParts.join(decimal);
		//	console.log("valor formateado con formato: "+pattern+" -> "+  result)
			return sign+result;
		},
		
		formatQueryTemplateFieldLink:function(linkData){
			var colDef = linkData.colDef;
			var value = linkData.valueToFormat;
			var outcome;
			if(value && value !=='0'){
				outcome = new fisaLink({
					fieldId:linkData.fieldId,
					fisatabid:linkData.tabId,
					fisapageid:linkData.pageScopeId,
					rowIndex:linkData.rowIndex,
					label:linkData.valueToFormat,
					routine:linkData.routine
				});
			}else{
				outcome = linkData.valueToFormat;
			}
			return outcome;
		}
	});
	fisaFormat.utils = new Utils();
	ec.fisa.mobile.format.utils=fisaFormat.utils;
	return Utils;
});

/**
 * Util.js
 * 
 * 
 */

define(
		[ "dojo/_base/kernel", "dojo/_base/declare", "dojo/cache", "dojo/_base/lang"
				,"dojo/string", "ec/fisa/print/_base","dojo/text!./templates/print.html" ],
		function(dojo, declare, cache , lang, string, fisaPrint,template) {

			var Utils = declare(
					"ec.fisa.print.Utils",
					null,
					{
						templateString :  template,
						replaceVariables: function(replacements){
							replacements.templateString=this.templateString;
							return string.substitute(replacements.templateString, replacements, function(value, key){
								if(key.charAt(0) == '!'){
									value = lang.getObject(key.substr(1), false, this);
								}
								if(typeof value == "undefined"){ throw new Error(" template:"+key); } // a debugging aide
								if(value == null){ return ""; }
								
								// Substitution keys beginning with ! will skip the transform step,
								// in case a user wishes to insert unescaped markup, e.g. ${!foo}
								return key.charAt(0) == "!" ? value :
								// Safer substitution, see heading "Attribute values" in
								// http://www.w3.org/TR/REC-html40/appendix/notes.html#h-B.3.2
								value.toString().replace(/"/g,"&quot;"); //TODO: add &amp? use encodeXML method?
							}, replacements);
						}
					});
			fisaPrint.utils = new Utils;
			ec.fisa.print.utils=fisaPrint.utils;
			return fisaPrint.utils;
		});
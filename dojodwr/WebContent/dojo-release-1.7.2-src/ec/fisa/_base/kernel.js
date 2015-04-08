define(["dojo/_base/kernel","dojo/_base/lang","dijit/form/_TextBoxMixin"], function(dojo, lang){
	var ec={fisa:{}};
	this["ec"]=ec;
	dojo.fisa=ec.fisa;
	dijit.form._TextBoxMixin.prototype.filter=function(val){
		if(val === null){ return this._blankValue; }
		if(typeof val != "string"){ return val; }
		if(this.trim){
			val = lang.trim(val);
		}
		if(this.uppercase){
			val = val.toUpperCase();
		}
		if(this.lowercase){
			val = val.toLowerCase();
		}
		if(this.propercase){
			val = val.toLowerCase().replace(/[^\s]+/g, function(word){
				return word.substring(0,1).toUpperCase() + word.substring(1);
			});
		}
		return val;
	};
	return ec.fisa;
});
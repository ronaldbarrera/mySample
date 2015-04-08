define([
	"dojo/_base/declare", // declare
	"dijit/form/DateTextBox"
], function(declare, DateTextBox){

	// module:
	//		dijit/form/DateTextBox

	return declare("ec.fisa.widget.SimpleDateTextBox", DateTextBox, {
	
		
		 _setValueAttr: function(/*Date|String*/ value, /*Boolean?*/ priorityChange, /*String?*/ formattedValue){
			 
			// summary:
			// Sets the date on this textbox. Note: value can be a JavaScript Date literal or a string to be parsed.
			if(value !== undefined){
			if(typeof value == "string" && value != ""){
			value = stamp.fromISOString(value);
			}
			if(this._isInvalidDate(value)){
			value = null;
			}
			if(value instanceof Date && !(this.dateClassObj instanceof Date)){
			value = new this.dateClassObj(value);
			}
			}
			this.inherited(arguments);
			if(this.value instanceof Date){
			this.filterString = "";
			}
			if(this.dropDown){
			this.dropDown.set('value', value, false);
			} 
			 
			 
			 
		 }
		
	});
});

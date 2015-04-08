define([
		"dojo/_base/declare",
		"dijit/form/DropDownButton",
		"./_base"
	], function(declare, DropDownButton){

		return declare("ec.fisa.message.PanelDropDownButton", [DropDownButton], {
			openDropDown:function(){
				this.inherited(arguments);
				var p=this.dropDown._popupWrapper;
				p.style.zIndex-=500;
			}
		});
	});

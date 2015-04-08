define([ 
		"dojo/_base/kernel",
		"dojo/_base/declare",
		"dojo/dom-style",
		"dojo/dom-attr", 
		"dojo/ready",
		"dojox/lang/functional",
		"dojox/mobile",
		"dojox/mobile/compat",
		"dojox/mobile/parser",
		"dojox/mobile/Accordion",
		"dojox/mobile/Button",
		"dojox/mobile/CheckBox",
		"dojox/mobile/ComboBox",
		"dojox/mobile/Container",
		"dojox/mobile/ContentPane",
		"dojox/mobile/EdgeToEdgeList",
		"dojox/mobile/FixedSplitter",
		"dojox/mobile/Heading",
		"dojox/mobile/ListItem",
		"dojox/mobile/ScrollableView", 
		"dojox/mobile/ScreenSizeAware",
		"dojox/mobile/SimpleDialog",
		"dojox/mobile/TabBar",
		"dojox/mobile/TextBox",
		"dojox/mobile/View",
		
		
		
		/*"dojo/dnd/AutoSource",*/
		/*"dojo/dnd/Target",*/
		"dojo/fx",
		"dojo/fx/easing",
		"dojo/fx/Toggler",
		"dojox/fx",
		"dojox/fx/_base",
		"dojox/fx/flip",
		"dojox/mobile/IconContainer",
		"dojox/mobile/IconItem",
		/*"dijit/TooltipDialog",*/
		/*"dijit/WidgetSet",*/
		/*"dijit/form/RadioButton",*/
		"dijit/_base",
		"dijit/_base/focus",
		"dijit/_base/place",
		"dijit/_base/popup",
		"dijit/_base/scroll",
		"dijit/_base/sniff",
		"dijit/_base/typematic",
		"dijit/_base/wai",
		"dijit/_base/window",
		"dijit/typematic",
		"dijit/selection",
		
		"ec/fisa/mobile/widget/SimpleSelect",

		/*"ec/fisa/dwr/Store",*/
		"ec/fisa/controller/mobile/Utils",
		/*"ec/fisa/format/Utils",*/
		"ec/fisa/mobile/format/Utils",
		"ec/fisa/mobile/grid/Utils",
		"ec/fisa/mobile/menu/Util",
		"ec/fisa/mobile/navigation/Utils",
		"ec/fisa/mobile/Util"
		/*,
		
		"ec/fisa/mobile/message/Panel",
		"ec/fisa/mobile/widget/AgendaMobileController",
		"ec/fisa/mobile/widget/AgendaMobileGrid",
		"ec/fisa/mobile/widget/BtActionButton",
		"ec/fisa/mobile/widget/BtController",
		"ec/fisa/mobile/widget/BtLink",
		"ec/fisa/mobile/widget/BtSequenceActionButton",
		"ec/fisa/mobile/widget/ConfirmDialog",
		"ec/fisa/mobile/widget/DatePicker",
		"ec/fisa/mobile/widget/FormGrid",
		"ec/fisa/mobile/widget/HiddenInput",
		"ec/fisa/mobile/widget/Layout",
		"ec/fisa/mobile/widget/LayoutController",
		"ec/fisa/mobile/widget/Link",
		"ec/fisa/mobile/widget/QtController",
		"ec/fisa/mobile/widget/QtGrid",
		"ec/fisa/mobile/widget/OutputText",
		"ec/fisa/mobile/widget/OutputTextComplement",
		"ec/fisa/mobile/widget/RoundRectDataList",
		"ec/fisa/mobile/widget/Select",
		"ec/fisa/mobile/widget/TextBox",
		"ec/fisa/mobile/dependencies/_base"
		*/
		
		
		], function(dojo, declare, domStyle,
		functional, domAttr) {
	var ViewRoot = declare("ec.fisa.mobile.dependencies.ViewRoot", null, {
		mobileViewRoot : {}
	});

	ec.fisa.mobile.dependencies.viewRoot = new ViewRoot();
	return ViewRoot;
});

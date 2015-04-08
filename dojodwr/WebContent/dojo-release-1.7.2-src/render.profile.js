var dwrMocks=[
				"dwr/engine",
				"dwr/util",
				"dwr/dto/FisaPopUpDocumentData",
				"dwr/dto/FisaPopupDocumentKeyword",
				"dwr/dto/TaskCriteria",
				"dwr/dto/TaskVO",
				"dwr/interface/AgendaControllerDWR",
				"dwr/interface/AgendaSupervisorControllerDWR",
				"dwr/interface/AuthorizationRuleControllerDWR",
				"dwr/interface/BtControllerDWR",
				"dwr/interface/ChangeCredentialsControllerDWR",
				"dwr/interface/ChangePasswordControllerDWR",
				"dwr/interface/DocumentControllerDWR",
				"dwr/interface/EventActionDWR",
				"dwr/interface/EventReportActionDWR",
				"dwr/interface/EventSequenceActionDWR",
				"dwr/interface/GroupFilterTransactionControllerDWR",
				"dwr/interface/GroupTransactionControllerDWR",
				"dwr/interface/ImagePickerControllerDWR",
				"dwr/interface/KeyboardControllerDWR",
				"dwr/interface/MenuEditionAdminControllerDWR",
				"dwr/interface/MicroRouteControllerDWR",
				"dwr/interface/MultiregisterLinkControllerDWR",
				"dwr/interface/NotificationTransactionControllerDWR",
				"dwr/interface/PasswordExpirationControllerDWR",
				"dwr/interface/PersonalTaskControllerDWR",
				"dwr/interface/ProcessRouteControllerDWR",
//				"dwr/interface/PlataformaComercialDWR",
				"dwr/interface/QtControllerDWR",
				"dwr/interface/QueryTemplateFieldRoutineControllerDWR",
				"dwr/interface/RuleFieldSelectorControllerDWR",
				"dwr/interface/SchedulingActionDWR",
				"dwr/interface/TokenValidatorControllerDWR",
				"dwr/interface/TranslatorTreeDWR",
				"dwr/interface/UserCredentialRemeberControllerDWR",
				"dwr/interface/UserHomeAdminDWR",
				"dwr/interface/UserPreferencesDWR",
				"dwr/interface/UserRolAdminControllerDWR",
				"dwr/interface/UserTransactionControllerDWR",
				"dwr/interface/NotificationAdditionalTransactionControllerDWR",
				"dwr/interface/QueryTemplateFieldAliasControllerDWR",
				"dwr/interface/OpenListControllerDWR"
			];
var mainExcludes = [];
mainExcludes = mainExcludes.concat(dwrMocks);
var unifiedExcludes = ['ec/fisa/layer/Main'/* OJO: con esta dependencia se excluye la capa main*/];
unifiedExcludes = unifiedExcludes.concat(dwrMocks);
var profile = {
	mini : true,
	stripConsole: "none",
	optimize : "closure",
	layerOptimize : "closure",
	selectorEngine : "acme",
	localeList : "en-us",
	layers : {
		'ec/fisa/layer/Main' : {
			include : [
				"dijit/dijit",
				"dijit/TooltipDialog",
				"dijit/form/ComboButton",
				"dijit/form/DropDownButton",
				"dijit/form/Form",
				"dijit/form/ToggleButton",
				"ec/fisa/controller/custom/LoginController",
				"ec/fisa/widget/TextBox"
			],
			exclude : mainExcludes
		},
		'ec/fisa/layer/Unified' : {
			include : [
				"dijit/Tree",
				"dijit/form/RadioButton",
				"dijit/layout/AccordionPane",
				"dijit/layout/TabContainer",
				"dojo/fx/Toggler",
				"dojo/data/ObjectStore",
				"dojo/dnd/AutoSource",
				"dojo/dnd/Target",
				"dojo/io/script",
				"dojo/request/script",
				"dojo/selector/lite",
				"dojox/layout/TableContainer",
				"dojox/data/QueryReadStore",
				"dojox/embed/Flash",
				"dojox/form/FileInputAuto",
				"dojox/form/FileInput",
				"dojox/form/Uploader",
				"dojox/form/uploader/plugins/IFrame",
				"dojox/grid/enhanced/plugins/AutoScroll",
				"dojox/grid/enhanced/plugins/Selector",
				"dojox/mvc/Bind",
				"dojox/mvc/StatefulModel",
				"dojox/widget/Portlet",
				"dojox/widget/Standby",
				"ec/fisa/controller/custom/BtController",
				"ec/fisa/controller/custom/QtController",
				"ec/fisa/controller/security/ChangePasswordController",
				"ec/fisa/dwr/proxy/EventSequenceActionDWR",
				"ec/fisa/grid/FisaQtGrid",
				"ec/fisa/lov/ListOfValues",
				"ec/fisa/message/Panel",
				"ec/fisa/menu/Utils",
				"ec/fisa/report/QtReport",
				"ec/fisa/widget/DateTextBox",
				"ec/fisa/widget/EmptyTabController",
				"ec/fisa/widget/GenericTabController",
				"ec/fisa/widget/NumberTextBox",
				"ec/fisa/widget/Select",
				"ec/fisa/widget/AddTabController",
				"ec/fisa/widget/UserTabController",
				"ec/fisa/widget/SimpleDateTextBox",
				"ec/fisa/widget/SupervisorTabController",
				"ec/fisa/widget/VerticalMenuLink",
				"ec/fisa/widget/i18n/I18nTextarea",
				"ec/fisa/widget/i18n/I18nTextBox",
				"ec/fisa/grid/FisaOpenList"
			],
			exclude : unifiedExcludes
		}
	},

	packages: [
		{
			name: "ec",
			location:"ec"
		},{
			name : "dwr",
			location : "dwr"
		},{
			name : "skin",
			location : "skin"
		},{
			name : "org",
			location : "org"
		},{
			name: "dojo",
			location: "../dojo-release-1.9.1-src/dojo"
		},{
			name: "dijit",
			location: "../dojo-release-1.9.1-src/dijit"
		},{
			name: "dojox",
			location: "../dojo-release-1.9.1-src/dojox"
		}
	]
};

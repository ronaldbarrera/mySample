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
				"dwr/interface/PlataformaComercialDWR",
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
				"dwr/interface/QueryTemplateFieldAliasControllerDWR"
			];
var mainMobileExcludes = [];
mainMobileExcludes = mainMobileExcludes.concat(dwrMocks);

var mainMobileIncludes = [
                          "dojox/mobile/View",
                          "dojox/mobile/TextBox",
                          "dojox/mobile/parser",
                          "dojox/mobile",
                          "dojox/mobile/RoundRect",
                          "dojox/mobile/Heading",
                          "dojox/mobile/ContentPane",
                          "dojox/mobile/FixedSplitter",
                          "dijit/_base/manager",
                          "ec/fisa/mobile/LoginUtil"
                          ];

var unifiedMobileExcludes = [];
unifiedMobileExcludes = unifiedMobileExcludes.concat(dwrMocks);
unifiedMobileExcludes = unifiedMobileExcludes.concat(mainMobileIncludes);
var profile = {
	mini : true,
	stripConsole: "none",
	optimize : "closure",
	layerOptimize : "closure",
	selectorEngine : "acme",
	localeList : "en-us",
	layers : {
		'ec/fisa/layer/MainMobile' : {
			include : mainMobileIncludes,
			exclude : mainMobileExcludes
		},
		'ec/fisa/layer/UnifiedMobile' : {
			include : [
				"ec/fisa/mobile/dependencies/ViewRoot"
			],
			exclude : unifiedMobileExcludes
		}
	},
	
	depsDumpDotFilename:"dojo-mobile-graph.dot",
	dotModules:"ec/fisa/mobile/dependencies/ViewRoot",

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
			location: "../dojo-release-1.9.2-src/dojo"
		},{
			name: "dijit",
			location: "../dojo-release-1.9.2-src/dijit"
		},{
			name: "dojox",
			location: "../dojo-release-1.9.2-src/dojox"
		}
	]
};

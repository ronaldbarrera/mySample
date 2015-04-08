var profile = {
	releaseDir : "/home/advance/java2/proyectos/mcm-web-render/src/main/javascript/dojo-release-1.7.4/",

	basePath : ".",

	action : "release",

	cssOptimize : "comments",

	mini : true,

	optimize : "closure",

	layerOptimize : "closure",

	stripConsole : "all",

	selectorEngine : "acme",
	
	localeList      : "en-us",

	layers : {
		"dojo/dojo":{
	include : [ "dojo/dojo"],
				customBase : true,
				boot : true
		},
		"dijit/dijit":{
			include : [ "dijit/dijit"],
			includeLayer : ["dojo/dojo"]
	},
	"ec/main":{
		include : [ "ec/main"]
	},
  "ec/fisa/controller/custom/BtController": {
  include: [ "ec/fisa/controller/custom/BtController" ]
},
"ec/fisa/controller/custom/QtController": {
  include: [ "ec/fisa/controller/custom/QtController" ]
}
		
		
		
		/*,
		"ec/viewRoot" : {
			include : [ "dijit/form/Select",
					"dijit/layout/ContentPane",
					"dijit/layout/AccordionContainer",
					"dijit/layout/BorderContainer",
					"dijit/layout/TabContainer", "dijit/Tree",
					"dojo/_base/array", "dojo/data/ItemFileReadStore",
					"dojo/data/ObjectStore", "dojo/store/Memory",
					"dojox/layout/ContentPane", "dojox/data/QueryReadStore",
					"ec/fisa/menu/Utils", "ec/fisa/tab/FisaTabContainer", "ec/fisa/tab/FisaSupervisorTabContainer",
					"ec/fisa/grid/_base" ],
			customBase : false,
			boot : false
		}*/
	},

	packages : [ {
		name : "dojo",
		location : "../dojo"
	}, {
		name : "dijit",
		location : "../dijit"
	}, {
		name : "dojox",
		location : "../dojox"
	}, {
		name : "ec",
		location : "../ec"
	} ],

	resourceTags : {
		amd : function(filename, mid) {
			return /\.js$/.test(filename);
		}
	},
	prefixes: [
["dijit", "../dijit"],
["dojox", "../dojox"]
]
};
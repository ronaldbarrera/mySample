define(["dojo/_base/declare", 
        "dojo/_base/kernel", 
        "dojo/dom-construct",
        "dojox/grid/DataGrid",
        "./_base"],
       function(declare, dojo, domConstruct,DataGrid) {
	
	return declare("ec.fisa.widget.tsc.RouteElementAttributesTable", [ DataGrid ], {
		dataTableGeneratedId:null,
		parentTreeId:null,
		postCreate: function(){
			this.inherited(arguments);
			//this.dataTableGeneratedId = this.getParent().getChildren()[2].id;
			this.dataTableGeneratedId = this.id;
		},
		onKeyDown: function(e){		
		}
	});
	
});
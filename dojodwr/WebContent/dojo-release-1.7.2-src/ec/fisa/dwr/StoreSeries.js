define(["dojox/charting/StoreSeries", "dojo/_base/declare", "dojo/_base/Deferred", "dojo/_base/array"], function(ChartStoreSeries, declare, Deferred, arr){
	return declare("ec.fisa.dwr.StoreSeries",[ChartStoreSeries], {
		"-chains-": {
	      constructor: "manual"
	    },
	    tabId: "",
	    pagescopeId: "",
	    dimensionColumn: null,
		measureColum:null,
		refreshAxisLabels:false,
		labels:[],
		constructor: function(store, kwArgs, value){
			this.fisaUpdateLegend=kwArgs.fisaUpdateLegend;
			this.fisaUpdateLegendScope=kwArgs.fisaUpdateLegendScope;
			this.tabId=kwArgs.tabId;
			this.pagescopeId = kwArgs.pageScopeId;
			this.measureColum= kwArgs.measureColum;
			this.dimensionColumn = kwArgs.dimensionColum;
			this.refreshAxisLabels = kwArgs.refreshAxisLabels;
			this.inherited(arguments);
		},
		fetch: function(){
			//	summary:
			//		Fetches data from the store and updates a chart.
			var objects = this.objects = [];
			if(this.observeHandle){
				this.observeHandle.dismiss();
			}
			//var results = this.store.query(this.kwArgs.query, this.kwArgs);
			var qtController = ec.fisa.controller.utils.getPageController(this.tabId,this.pagescopeId);
			this.store.setCallbackScope(qtController);
			this.labels.length = 0;//Limpiamos el array
			this.labels = [{value:0, text:" "}];
			var i = 1;
			var self = this;
			var results = this.store.fetch({query: this.kwArgs.query,onComplete: function (ids){
				var storeData = this.store.getResults();
				this.objects = [];
				this.data = arr.map(storeData, function(objectDwr){
					var object = objectDwr.data;
					this.objects.push(object);
					self.labels[i]= {value:i,text:object[self.dimensionColumn]};
					i++;
					return this.value(object, this.store);
				},this);
				this.fisaUpdateLegendScope.labels = this.labels;
				this._pushDataChanges();
				this.fisaUpdateLegend.call(this.fisaUpdateLegendScope);
			}, callbackScope: qtController, scope:this});
			if(results.observe){
				this.observeHandle = results.observe(update, true);
			}
			
		},
		fisaUpdateLegend:function(){
			//function to be overriden
		},
		_pushDataChanges: function(){
			if(this.series){
				this.series.chart.updateSeries(this.series.name, this);
				this.series.chart.render();
			}
		}
	});
});
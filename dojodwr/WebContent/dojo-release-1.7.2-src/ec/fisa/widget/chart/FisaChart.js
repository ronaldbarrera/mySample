define([
		"dojo/dom-construct","dojo/_base/kernel",
		"dojo/_base/declare",
		"dijit/_Widget",
		"dijit/_Templated",
		"dojox/charting/Chart",
		"dojox/charting/axis2d/Default",
		"dojox/charting/widget/Legend",
		"dojox/charting/action2d/Tooltip",
		"dojox/charting/action2d/Highlight",
		"ec/fisa/charting/themes/Dollar",
		"ec/fisa/charting/themes/Harmony",
		"dojox/charting/plot2d/Pie",
		"dojo/store/Observable",
		"ec/fisa/dwr/Store",
		"dojox/charting/plot2d/Markers",
		"dojo/text!ec/fisa/widget/chart/templates/template.html",
		"dojox/charting/action2d/Magnify",
		"ec/fisa/dwr/StoreSeries",
		"ec/fisa/controller/Utils",
		"./_base"
		], function(construct, dojo, declare, _Widget, _Templated,
				Chart, Default, Legend, Tooltip, Highlight,
				Dollar, Harmony, Pie, Observable, DWRStore, Markers, template,Magnify) {
	return declare("ec.fisa.widget.chart.FisaChart", [ _Widget, _Templated ], {
		tabId: "",
		qtId: "",
		pagescopeId: "",
		chartDesign:"",
		chartStyle:"",
		chartType:"",
		qtForLabels:"",
		parentFisaTabId:"",
		parentFisaPageScopeId:"",
		parentBtId:"",
		parentFieldId:"",
		plotType : {},/*
						 * Objeto con la configuración del Tipo de grafico
						 * {type: Areas}
						 */
		xAxis : {},/*
					 * Objeto con el nombre del eje de coordenadas horizontales,
					 * y configuraciones adicionales del eje, por ejemplo
					 * {axisName:"x", axisData:{vertical: false,...}}
					 */
		yAxis : {},/*
					 * Objeto con el nombre del eje de coordenadas verticales, y
					 * configuraciones adicionales del eje, por ejemplo
					 * {axisName:"y", axisData:{vertical: true,...}}
					 */
		series : [],/*
					 * Array de series usadas en el grafico,
					 * [{seriesLabel:'Serie 1',seriesData:[1,2,3,4,5,6]}]
					 */
		theme : null,/*Cadena de caracteres con el nombre del tema a usar**/
		chartInstance: null,
		dimensionColumn: null,
		measureColum:null,
		measurementColumns:[],
		availableThemes : {
			dollar : dojox.charting.themes.FisaDollar,
			harmony : dojox.charting.themes.FisaHarmony
		},
		templateString : template,
		store : {},
		query:{},
		legend:null,
		_childChartNode: null,
		_childLegendNode:null,
		_processLabels:false,
		labels:[],
		format:4,
		numericFormat: dojo.config.fisaNumericPattern,
		constructor : function() {

		},
		postCreate : function() {
			
			this.inherited(arguments);
		},
		startUp : function() {
			var chartConfig = this._initChartConfig();
			this.plotType = chartConfig.plotType;
			this.xAxis = chartConfig.xAxis;
			this.yAxis = chartConfig.yAxis;
			this.theme = chartConfig.theme;
			
			this._init();
		},
		_init : function() {
			this._childChartNode = construct.create("div", {style:{'width':'600px','height':'400px','float':'left'}}, this._chartNode);
			var chart = new Chart(this._childChartNode);
			this.chartInstance = chart;
			this._processTheme();
			chart.addPlot("default", this.plotType);// Debe existir el plot con
													// nombre default, si no
													// causa errores.
			
			this._procesAxis(this.xAxis);
			this._procesAxis(this.yAxis);
			this._addSeries();
			this._addHighlight();
			this._addTooltip();
		},
		_addSeries : function() {
			if(this.plotType.type == Pie){
				this.store= new ec.fisa.dwr.Store("QtControllerDWR","viewData",this.tabId,this.qtId,[this.pagescopeId],null);
				var self = this;
				var attrFunction = function(object){
					var o = {};
					o.y = object[self.measureColum];
					o.text = object[self.dimensionColumn];
					//AVI - se da formato a los valores de los graficos
					var measureVal = ec.fisa.format.utils.formatNumber(object[self.measureColum], self.numericFormat);
					//o.tooltip = object[self.dimensionColumn] + ' : ' + object[self.measureColum];
					o.tooltip = object[self.dimensionColumn] + ' : ' + measureVal;
					//o.legend = object[self.dimensionColumn] + ' : ' + object[self.measureColum];
					o.legend = object[self.dimensionColumn] + ' : ' + measureVal;
					return o;
				};
				var chart = this.chartInstance;
				var storeSeriesAttr= attrFunction ;
				var storeSeries = new ec.fisa.dwr.StoreSeries(
	                    this.store, {query: this.query,fisaUpdateLegend:this._addLegend,fisaUpdateLegendScope:this, tabId:this.tabId,pageScopeId:this.pagescopeId,refreshAxisLabels:false,measureColum:this.measureColum, dimensionColum:this.dimensionColumn}, storeSeriesAttr);
				chart.addSeries("Data", storeSeries);
				return;
			}
			
			if(this.plotType.type == Markers){
				this.store= new ec.fisa.dwr.Store("QtControllerDWR","viewData",this.tabId,this.qtId,[this.pagescopeId],null);
				var chart = this.chartInstance;
				var self=this;
				var value = function(object){
					return object[self.measureColum];
				}
				var storeSeries = new ec.fisa.dwr.StoreSeries(
	                    this.store, {query: this.query,fisaUpdateLegend:this._addLegend,fisaUpdateLegendScope:this, tabId:this.tabId,pageScopeId:this.pagescopeId, measureColum:this.measureColum, dimensionColum:this.dimensionColumn,refreshAxisLabels:true}, value);
				chart.addSeries("Data", storeSeries);
				return;
			}
		},
		_procesAxis : function(axis) {
			var chart = this.chartInstance;
			if (axis && axis.axisData) {
				chart.addAxis(axis.axisName, axis.axisData);
			} else if(axis){
				chart.addAxis(axis.axisName);
			}
		},
		_processTheme : function() {
			var chart = this.chartInstance;
			if (this.theme) {
				chart.setTheme(this.availableThemes[this.theme]);
			}
		},
		_addLegend:function(){
			this._childLegendNode = construct.create("div", {style:{'float':'left'}}, this._legendNode);
			this.legend = new Legend({chart:this.chartInstance,horizontal:false}, this._childLegendNode);
		},
		_addTooltip:function(){
			var chart = this.chartInstance;
			if(this.plotType.type == Markers){
				var kwArgs = {};
				kwArgs.text = function(o){
					return o.run.source.labels[o.x].text + " : " + o.y;
				};
				var tip = new Tooltip(chart, "default", kwArgs);
			}else{
				var tip = new Tooltip(chart, "default");
				var kwArgs = {};
				kwArgs.scale = 1.05;
				var magnifier = new Magnify(chart, 'default', kwArgs);
			}
			
		},
		_addHighlight:function(){
			var chart = this.chartInstance;
			new Highlight(chart, "default");
		},
		_initChartConfig:function(){
			var chartConfig = {};
			if(this.chartType == "1"){/*1 Pie*/
				this._pieChartConfig(chartConfig);
			}else if(this.chartType == "3"){
				this._lineChartConfig(chartConfig);
			}
			return chartConfig;
		},
		_pieChartConfig: function(chartConfig){
			chartConfig.plotType = {
					type: Pie,
                    radius: 130,
                    startAngle: -10,
					labelOffset:-20,
                    labelStyle: "columns",
                    htmlLabels: true,
					font: "normal bold 7pt Tahoma"
			};
			chartConfig.theme = this._getTheme(this.chartStyle);
			this._processLabels = false;
			
		},
		_lineChartConfig:function(chartConfig){
			var self = this;
			chartConfig.plotType = {type:Markers,font: "normal normal 8pt Tahoma"};
			chartConfig.xAxis = {axisName:"x",
					axisData:{fixLower: "major",
						fixUpper: "major",
						natural: true,
						majorTickStep: 5,
						labelFunc:function(value){	var outcome = " "; 
							var labelObject = self.labels[value];
							if(labelObject){
								outcome =  labelObject.text;
							} 
							return outcome;
						},
						maxLabelSize: 45,
						trailingSymbol: "…",
						rotation:15
																}};
			chartConfig.yAxis = {axisName:"y", axisData:{vertical: true, fixLower: "major", fixUpper: "major", includeZero: true}};
			chartConfig.theme = this._getTheme(this.chartStyle);
			this._processLabels = true;
		},
		_getTheme: function(themeCode){
			var theme;
			if(themeCode == 1){
				theme = "dollar";
			}else if(themeCode == 2){
				theme = "harmony";
			}else{
				theme = "harmony";
			}
			return theme;
		},
		setQuery: function(queryData){
				this.query = queryData;
				var chart = this.chartInstance;
				chart.destroy();
				this.legend.destroy(false);
				construct.destroy(this._childChartNode);
				this._init();
		},
		setInitialQuery: function(queryData){//JCVQ 04/06/2013 Mantis 0014527
			this.query = queryData;
		}
		
	});
});

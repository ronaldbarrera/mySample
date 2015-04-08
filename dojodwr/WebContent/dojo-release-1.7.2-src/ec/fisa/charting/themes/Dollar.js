define([ "dojox/charting/Theme", "dojox/charting/themes/common" ], function(
		Theme, themes) {

	themes.FisaDollar = new Theme({
		colors : [ "#A4CE67", "#739363", "#6B824A", "#343434", "#636563" ],
		axis : {
			font : "normal normal normal 7pt Helvetica,Arial,sans-serif",
			tick : {
				font : "normal normal normal 7pt Helvetica,Arial,sans-serif",
				fontColor : "#999"
			}
		}
	});

	return themes.FisaDollar;
});

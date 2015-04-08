<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
"http://www.w3.org/TR/html4/loose.dtd">
<html>
    <head>
        <title>I18n Components test -</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"></meta>
        <style type="text/css">
            @import "/mcm-web-render/javascript/dojo-release-1.7.2-src/dojo/resources/dojo.css";
            @import "/mcm-web-render/javascript/dojo-release-1.7.2-src/dijit/tests/css/dijitTests.css";
            @import "/mcm-web-render/javascript/dojo-release-1.7.2-src/dijit/themes/claro/claro.css";
            @import "/mcm-web-render/javascript/dojo-release-1.7.2-src/dojox/charting/resources/Legend.css";
        </style>
        <script type="text/javascript"
            src="/mcm-web-render/javascript/dojo-release-1.7.4-src/dojo/dojo.js"
            djConfig="isDebug:false, parseOnLoad: true,modulePaths: {'dwr': '../../../dwr','ec':'../../dojo-release-1.7.2-src/ec'}"></script>

        <script type="text/JavaScript">
            dojo.require("ec.fisa.widget.chart.FisaChart");
            </script>
        </head>
        <body class="fisaClassic">
            <div id="charts">
                    <div data-dojo-type="ec.fisa.widget.chart.FisaChart">
                        <script type="dojo/connect" event="startup">
                            var chart = this;
                            require(["dojox/charting/plot2d/Pie"], function(charType){
                                var chartConfig = {};
                                chartConfig.plotType = {
                                    type: charType,
                                    radius: 150,
                                    labelStyle: "columns",
                                    htmlLabels: true,
                                    startAngle: -10,
									labelOffset:"-20",
									title: "Production(Quantity)",
  									titlePos: "bottom",
									titleGap: 25,
  									titleFont: "normal normal normal 15pt Arial",
									titleFontColor: "orange"
                                };
								chartConfig.xAxis = {axisName:"x", axisData:{title:"Pie",titleGap: 25}};
                                chartConfig.theme = "harmony";

                                chartConfig.series = [{seriesLabel:'Serie 1',seriesData:[{
                                        y: 12.1,
                                        text: "China",
                                        tooltip: "1,210 million"
                                        },{
                                        y: 9.52,
                                        text: "India",
                                        tooltip: "952 million"
                                        }, {
                                        y: 2.66,
                                        text: "USA",
                                        tooltip: "266 million"
                                        }, {
                                        y: 2.06,
                                        text: "Indonisia",
                                        tooltip: "206 million"
                                        }, {
                                        y: 1.63,
                                        text: "Brazil",
                                        tooltip: "163 million"
                                        },{
                                        y: 1.48,
                                        text: "Russian",
                                        tooltip: "148 million"
                                        }]}];
                                chart.startUp(chartConfig);
                            });
                        </script>
                    </div>
                </div>
            <body>
            </body>
        </html>
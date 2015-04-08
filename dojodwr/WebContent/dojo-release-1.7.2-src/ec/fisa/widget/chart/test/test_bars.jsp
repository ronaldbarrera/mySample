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
                            require(["dojox/charting/plot2d/Columns"], function(charType){
                                var chartConfig = {};
                                chartConfig.plotType = {};
                                chartConfig.plotType.type = charType;
                                chartConfig.plotType.gap= 5;
                                chartConfig.theme = "dollar";
                                chartConfig.title = "Lineas";

                                chartConfig.xAxis = {};
                                chartConfig.xAxis.axisName = "X";

                                chartConfig.yAxis = {};
                                chartConfig.yAxis.axisName = "Y";
                                chartConfig.yAxis.axisData = {};
                                chartConfig.yAxis.axisData.vertical = true;

                                chartConfig.series = [{seriesLabel:'Serie 1',seriesData:[1,2,2,3,4,5,5,6,7]}, {seriesLabel:'Serie 2',seriesData:[2,1,4,8,3,1,6,8,9]}];
                                chart.startUp(chartConfig);
                            });
                        </script>
                    </div>          
            </div>
            <body>
            </body>
        </html>
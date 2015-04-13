0<%@page import="com.fisa.render.limit.model.LimitView"%>
<%@page import="com.fisa.render.quota.view.demo.Samples"%>
<%@page import="com.fisa.render.limit.model.CustomLevel"%>

<%  String modo    =  request.getParameter("pm") ;
	String codigop = request.getParameter("pp") ;
	LimitView limitView = Samples.getData();
%>
 <%@page contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>

<%@taglib  prefix="c"    uri="http://java.sun.com/jsp/jstl/core"%>
<% //  prefix="fisa" uri="http://www.fisa.com/jsp/jstl/render"%>
<%@taglib  prefix="fn"   uri="http://java.sun.com/jsp/jstl/functions"%>
<%@taglib prefix="dwr" uri="http://www.directwebremoting.org/dwr/"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
  <link rel="stylesheet" href="http://ajax.googleapis.com/ajax/libs/dojo/1.10.3/dijit/themes/claro/claro.css" />
  <link rel="stylesheet" href="http://ajax.googleapis.com/ajax/libs/dojo/1.10.3/dojox/grid/resources/claroGrid.css" />
  
<script type='text/javascript' src='<c:url value='/dwr/engine.js'/>'> </script>
<script type='text/javascript' src="<c:url value='/dwr/util.js'/>"> </script>
<script type="text/javascript" src="<c:url value='/dwr/interface/LimitProcessDWR.js'/>"></script>
<script type="text/javascript" src="defValorCupoPaquete.js"></script>

 <script src="http://ajax.googleapis.com/ajax/libs/dojo/1.10.3/dojo/dojo.js"
            data-dojo-config="isDebug: true,async: false, parseOnLoad: true">
 console.log(dojo);
 </script>
             
  <script type="text/javascript">

 		dojo.require("dojo.dom"); 
 		dojo.require("dojo.data.ItemFileWriteStore"); 
        dojo.require("dojox.grid.DataGrid");

        dojo.ready(function(){
            var data = {
              identifier: 'id',
              items: []
            };
            var data_list = [
              { nameLimit: "normal",    col2: false, col3: 'uno',  col4: 29.91, col5: 29.91, col6: 29.91, col7: 29.91},
              { nameLimit: "important", col2: false, col3: 'dos',  col4: 9.33, col5: 29.91, col6: 29.91, col7: 29.91},
              { nameLimit: "important", col2: false, col3: 'tres', col4: 19.34, col5: 29.91, col6: 29.91, col7: 29.91}
            ];
            var rows = 3;
            for(var i=0, l=data_list.length; i<rows; i++){
              data.items.push(dojo.mixin({ id: i+1 }, data_list[i%l]));
            }
            var store = new dojo.data.ItemFileWriteStore({data: data});

            /*set up layout*/
            var layoutA = [[
              {'name': 'CUPO', 'field': 'nameLimit'},
              {'name': 'Cupo Maximo', 'field': 'cupoMaximo'},
              {'name': 'Cupo x Defecto', 'field': 'cupoDefecto'},
            ]];

            console.log (json2txt(data, ' x ') );
            
           // alert(layoutA[0][0].field);
            
            var layoutNiveles = [[
                        {'name': 'CANAL', 'field': 'col3'},
                        {'name': 'FORMA PAGO', 'field': 'col3', 'width': '230px'}
  //                      {'name': 'NIVEL DEUDA', 'field': 'col4', 'width': '230px'}
                      ]];
            layoutA.push(layoutNiveles[0]);
			alert(layoutNiveles[0]);
			alert(layoutA[0]);


            
            
            var layoutB = [[
                            {'name': 'Moneda', 'field': 'col5', 'width': '230px'},
                            {'name': 'CMaximo', 'field': 'col6', 'width': '230px'},
                            {'name': 'CxDefecto', 'field': 'col7', 'width': '230px'}
                          ]];
            //  for (var i = 0, item; item = layoutA[i++];) {	
        	for (var j = 0, sub; sub = layoutNiveles[j++];) {
            	console.log('layoutNiveles1 '+j+'   '+sub);
            	console.log('layoutNiveles2 '+j+'   '+sub[0]);
        		//layoutA.push(sub[0]);
        	}
        	for (var j = 0, sub; sub = layoutB[j++];) {
            	//console.log('i:'+i+' j:'+j+'   '+sub.name);
        		//layoutA.push(sub);
        	}
       // }
         	for (var i = 0, item; item = layoutA[i++];) {
        		for (var j = 0, sub; sub = item[j++];) {
        		console.log('layoutA - '+sub.name);
        		}
        	} 
           // alert(layoutB[0][1].name);
            var layout = layoutA;
//            layout = layout.concat.apply(layout,layoutA);
//            alert('layout '+layout.toString());
//            alert(layout[0][1].name);
            
            /*create a new grid:*/
//            var grid = new dojox.grid.EnhancedGrid({
//              document.createElement('div'));

            var grid = new dojox.grid.DataGrid({
                id: 'grid',
                store: store,
                structure: layout,
                rowSelector: '20px'});

            /*append the new grid to the div*/
 //           grid.placeAt("gridDiv");
            dojo.byId("gridDiv").appendChild(grid.domNode);

            /*Call startup() to render the grid*/
            grid.startup();
        });

    </script>           
            
</head>
<body style="font-family: verdana;"  class="claro" onload="getData2();">

    
    
    <div id="gridDiv" style="height: 20em;"></div>
    
    
    
    

<h3 id="titulo"> </h3>

<h3>Definición Valor Cupos por Paquete </h3>
<table align="center">
	<tbody>
		<tr>
			<td style="background:#ccc;" width="200" align="center">Paquete de Cupos</td>
			<td width="600"></td>
		</tr>
		<tr>
			<td></td>
			<td>
			Paquete: <span id="paqueteID" ><b><%= limitView.getCodePackage() %></b></span> 
					 <span id="paqueteName"><b><%= limitView.getNamePackage() %></b></span>
			<br />
			Aplica a: <span id="aplicaA"><b><%= limitView.getAplicaA() %></b></span>
			</td>
		</tr>
	</tbody>
</table>
<br />

<% 
for(CustomLevel item : limitView.getCustonLevel()){
%>
<h4 style="width: 20%;background: #555;color:white">
	<span id="blockTitle" title="code" ><%= item.getName() %></span>
	</h4>



<br />
<br />

<% } %>

















<br /><br />
<br /><br />
<br /><br />




	Hello <b><%= request.getParameter("pa") %></b>!


  
    
    
    








 	<p> Name:
      <input type="text" id="demoName" value="Gizlo"/>
      <input type="button" id="demoSend" value="Saludar" onclick="getData2()"/>
      <br/><br/>
      Respuesta: <span id="demoReply" style="background:#eeffdd; padding-left:4px; padding-right:4px;">&nbsp;</span>
    </p>
    
    <input type="button" id="mover" value="mover" onclick="move()"/>
    
   </body>
   </html>
<%@page import="com.fisa.render.limit.core.LimitView"%>
<%@page import="com.fisa.render.limit.core.Samples"%>
<%@page import="com.fisa.render.limit.core.CustomLevel"%>

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
    
<script type='text/javascript' src='<c:url value='/dwr/engine.js'/>'> </script>
<script type='text/javascript' src="<c:url value='/dwr/util.js'/>"> </script>
<script type="text/javascript" src="<c:url value='/dwr/interface/LimitProcessDWR.js'/>"></script>
<script type="text/javascript" src="defValorCupoPaquete.js"></script>

 <script src="//ajax.googleapis.com/ajax/libs/dojo/1.10.3/dojo/dojo.js"
            data-dojo-config="async: true"></script>
            
    <script type="text/javascript">
    
        dojo.require("dojox.grid.EnhancedGrid");
        dojo.require("dojo.data.ItemFileWriteStore");

        dojo.ready(function(){
            var data = {
              identifier: 'id',
              items: []
            };
            var data_list = [
              { col1: "normal",    col2: false, col3: 'But are not followed by two hexadecimal', col4: 29.91},
              { col1: "important", col2: false, col3: 'Because a % sign always indicates', 		 col4: 9.33},
              { col1: "important", col2: false, col3: 'Signs can be selectively', 				 col4: 19.34}
            ];
            var rows = 60;
            for(var i=0, l=data_list.length; i<rows; i++){
              data.items.push(dojo.mixin({ id: i+1 }, data_list[i%l]));
            }
            var store = new dojo.data.ItemFileWriteStore({data: data});

            /*set up layout*/
            var layout = [[
              {'name': 'Column 1', 'field': 'id'},
              {'name': 'Column 2', 'field': 'col2'},
              {'name': 'Column 3', 'field': 'col3', 'width': '230px'},
              {'name': 'Column 4', 'field': 'col4', 'width': '230px'}
            ]];

            /*create a new grid:*/
            var grid = new dojox.grid.EnhancedGrid({
                id: 'grid',
                store: store,
                structure: layout,
                rowSelector: '20px'},
              document.createElement('div'));

            /*append the new grid to the div*/
            dojo.byId("gridDiv").appendChild(grid.domNode);

            /*Call startup() to render the grid*/
            grid.startup();
        });





    </script>          
            
</head>
<body style="font-family: verdana;">

    
    
    
    
    
    
    

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

	<div id="gridDiv">=</div>


<br />
<br />

<% } %>

















<br /><br />
<br /><br />
<br /><br />




	Hello <b><%= request.getParameter("pa") %></b>!


  
    
    
    








 	<p> Name:
      <input type="text" id="demoName" value="Gizlo"/>
      <input type="button" id="demoSend" value="Saludar" onclick="hiFisa()"/>
      <br/><br/>
      Respuesta: <span id="demoReply" style="background:#eeffdd; padding-left:4px; padding-right:4px;">&nbsp;</span>
    </p>
    
    <input type="button" id="mover" value="mover" onclick="move()"/>
    
   </body>
   </html>
<%@page import="com.fisa.render.limit.model.LimitView"%>
<%@page import="java.util.*"%>
<%@page import="com.fisa.render.limit.model.CustomLevel"%>
<%@page import="com.fisa.render.limit.model.Package"%>
<%@page import="com.fisa.render.limit.model.PersonalizationLevel"%>

<%@page import="com.fisa.render.quota.view.demo.Samples"%>

<%  String modo    =  request.getParameter("pmode") ;
	String codigop = request.getParameter("pcode") ;
	Package pack = Samples.getPack();
	List<CustomLevel> listaCL = Samples.getCustomLevels();
	List<LimitView> limitView = Samples.getData2();
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
<script type="text/javascript" src="<c:url value='/dwr/interface/LimitValuePackageDWR.js'/>"></script>


 <script src="http://ajax.googleapis.com/ajax/libs/dojo/1.10.3/dojo/dojo.js"
            data-dojo-config="isDebug: true,async: false, parseOnLoad: true">
 </script>
         
 <script type="text/javascript" src="limitValuePackage.js"></script>           
</head>
<body style="font-family: verdana;"  class="claro">


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
			Paquete: <span id="paqueteID" ><b><%= pack.getCodePackage() %></b></span> 
					 <span id="paqueteName"><b><%= pack.getNamePackage() %></b></span>
			<br />
			Aplica a: <span id="aplicaA"><b><%= pack.getAplicaA() %></b></span>
			</td>
		</tr>
	</tbody> 
</table> 
<br />
 
<% 
for(CustomLevel item : listaCL){
%>
<h4 style="width: 20%;background: #555;color:white">
	<span id="blockTitle" title="code" ><%= item.getName() %></span>
	</h4>
  <div id="gridDiv<%= item.getCode() %>" class="jsDataGrid"  style="height: 20em;"></div>
<br />
<br />
<% } %>  
 
  
   </body>
   </html>
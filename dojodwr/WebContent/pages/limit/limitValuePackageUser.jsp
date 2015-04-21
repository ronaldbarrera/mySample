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

<script type='text/javascript' src="<c:url value='/dwr/engine.js'/>"> </script>
<script type='text/javascript' src="<c:url value='/dwr/util.js'/>"> </script>
<script type="text/javascript" src="<c:url value='/dwr/interface/LimitValuePackageUserDWR.js'/>"></script>


 <script src="http://ajax.googleapis.com/ajax/libs/dojo/1.10.3/dojo/dojo.js"
            data-dojo-config="isDebug: true,async: false, parseOnLoad: true">
 </script>
       
<script type="text/javascript" >
	alert('ayuda');
	dojo.require("dojo.dom");
	dojo.require("dojo.data.ItemFileWriteStore");
	dojo.require("dojox.grid.DataGrid");
	
	dojo.ready(function() {

		var states = {
			    "Seleccionar":"", 
			    "Limite Diario":"AL", 
			    "Limite Mensual":"AK" 
			};
			var val, Text;
			var i =0;
			var e = document.getElementById('selectCupo');
			e.innerHTML = "";
			for (Text in states) {
			    val = states[Text];
			    e.options[i++] = new Option(Text, val);
			};

			var states2 = {
				    "Seleccionar":"", 
				    "Efectivo":"AL", 
				    "Plazo":"AK" 
				};
				var val, Text;
				var i =0;
				var e = document.getElementById('selectFomaPago');
				e.innerHTML = "";
				for (Text in states2) {
				    val = states[Text];
				    e.options[i++] = new Option(Text, val);
				};

				var states3 = {
					    "Seleccionar":"", 
					    "Web":"AL", 
					    "Canal2":"AK" 
					};
					var val, Text;
					var i =0;
					var e = document.getElementById('selectCanal');
					e.innerHTML = "";
					for (Text in states3) {
					    val = states[Text];
					    e.options[i++] = new Option(Text, val);
					};

					var states4 = {
						    "Seleccionar":"", 
						    "Atm1":"AL"
						};
						var val, Text;
						var i =0;
						var e = document.getElementById('selectAtm');
						e.innerHTML = "";
						for (Text in states4) {
						    val = states[Text];
						    e.options[i++] = new Option(Text, val);
						};
					
				var states5 = {
					    "Seleccionar":"", 
					    "Dolar":"AL"
					};
					var val, Text;
					var i =0;
					var e = document.getElementById('selectMoneda');
					e.innerHTML = "";
					for (Text in states5) {
					    val = states[Text];
					    e.options[i++] = new Option(Text, val);
					};

					//Validaciones al clic en editar
                    var editBtn = document.getElementById('btnEdit');
                    var elimBtn = document.getElementById('btnElim');

                    var onclickVal = function fun(){
                    	var selectCupo = document.getElementById('selectCupo');
                    	var selectFomaPago = document.getElementById('selectFomaPago');
                    	var selectCanal = document.getElementById('selectCanal');                    	
                    	var selectAtm = document.getElementById('selectAtm');
                    	var selectMoneda = document.getElementById('selectMoneda');
                        var valinCupoMax = document.getElementById('inCupoMax');
                        var valinCupoDefecto = document.getElementById('inCupoDefecto');
                        var valinTransMax = document.getElementById('inTransMax');
                        var valinTransDef = document.getElementById('inTransDef');
                        
                        if(!selectCupo.value ){
                            alert('Valor del Combo Cupo es Nulo');
                            return false;
                         }else if(!selectFomaPago.value ){
                            alert('Valor del Combo Forma de Pago es Nulo');
                            return false;
                         }else if(!selectCanal.value ){
                        	 alert('Valor del Combo Canal es Nulo');
                            return false;
                         }else if(!selectAtm.value ){
                        	 alert('Valor del Combo ATM es Nulo');
                             return false;
                         }if(!selectMoneda.value ){
                        	 alert('Valor del Combo Moneda es Nulo');
                             return false;
                         }else if(!valinCupoMax.value ){
                                alert('Valor Cupo Maximo es Nulo');
                                return false;
                        }else if(!valinCupoDefecto.value){
                                alert('Valor Cupo Defecto es Nulo');
                                return false;
                        }else if(!valinTransMax.value){
                                alert('Valor Tranferencias Maxima es Nulo');
                                return false;
                        }else if(!valinTransDef.value){
                            alert('Valor Tranferencias Maxima por Defecto es Nulo');
                            return false;
	                    }else if(!(valinCupoDefecto.value < valinCupoMax.value)){
                            alert('Valor Cupo Maximo debe ser mayor a cupo por defecto');
                            return false;
	                    }else if(!(valinTransDef.value < valinTransMax.value)){
                            alert('Valor Tranferencia Maximo debe ser mayor a Tranferencia Defecto');
                            return false;
	                    }else{
	                            alert("todo esta correcto");
	                            alert('Enviando a Java la data');
	                            return true;
	                        }
                    }

                    var editfn = function(){alert('editando ...')};
                    var elimfn = function(){alert('eliminando ...')};
                    
                    editBtn.onclick = function(){
                         if( onclickVal() ){
                               editfn();
                               }
                            
                    } 
                    elimBtn.onclick = function(){
                            if( onclickVal() ){
                                    elimfn();
                                    }
                            
                    }
					
		
	});
</script>  

<script type="text/javascript">
	function validarNumeros(e) { // 1
		tecla = (document.all) ? e.keyCode : e.which; // 2
		if (tecla==8) return true; // backspace
		if (tecla==109) return true; // menos
    if (tecla==110) return true; // punto
		if (tecla==189) return true; // guion
		if (e.ctrlKey && tecla==86) { return true}; //Ctrl v
		if (e.ctrlKey && tecla==67) { return true}; //Ctrl c
		if (e.ctrlKey && tecla==88) { return true}; //Ctrl x
		if (tecla>=96 && tecla<=105) { return true;} //numpad
 
		patron = /[0-9]/; // patron
 
		te = String.fromCharCode(tecla); 
		return patron.test(te); // prueba
	}
</script>
         
</head>
<body style="font-family: verdana;"  class="claro">


<h3>Definición Valor Cupos por Paquete (Usuario) </h3>
<table align="center">
	<tbody>
		<tr>
			<td style="background:#ccc;" width="200" align="center">Paquete de Cupos</td>
			<td width="600"></td>
		</tr>
		<tr>
			<td></td>
			<td>
			Usuario: <span id="UserID" ><b><%= pack.getCodUsuario() %></b></span> 
					 <span id="UserName"><b><%= pack.getNomUsuario() %></b></span>
			<br />	 
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
   
	<table  >
		 <thead id="theadDefinicionColumns">
		   <tr>
		     <th field="fieldName" width="200px" >Cupo</th>
		     <th field="fieldName" width="200px" >Forma de Pago</th>
		     <th field="fieldName" width="200px">Canal</th>
		     <th field="fieldName" width="200px">ATM</th>
		     <th field="fieldName" width="200px">Moneda</th>
		     <th field="fieldName" width="200px">Cupo Maximo</th>
		     <th field="fieldName" width="200px">Cupo por Defecto</th>
		     <th field="fieldName" width="200px">Nro Transacciones Max</th>
		     <th field="fieldName" width="200px">Nro Transacciones por Defecto</th>
		     <th field="fieldName" width="200px">Fecha Inicio</th>
		     <th field="fieldName" width="200px">Vigencia Hasta</th>
		   </tr>
		 </thead>
		 <tbody id="tbodyPersonalizacionCell">
		         <tr>
		                 <td>Transferencia</td>
		                 <td>MOBIL</td>
		                 <td>PICHINCHA-SUR</td>
		                 <td>DIFERIDOS</td>
		                 <td>CLASE A</td>
		         </tr>
		                 <tr>
		                 <td>Pagos</td>
		                 <td>WEB</td>
		                 <td>MALL-SUR</td>
		                 <td>EFECTIVO</td>
		                 <td>CLASE C</td>
		         </tr>
		 </tbody>
		 
		 <TFOOT>
			<tr> 
			   <td>
					<select id="selectCupo">
						
					</select>
				</td>
				<td>
					<select  id="selectFomaPago">
						
					</select>
				</td>
				<td>
					<select  id="selectCanal">
						
					</select>
				</td> 
			    <td>
					<select  id="selectAtm">
					
					</select>
				</td> 
			    <td>
					<select  id="selectMoneda">
						
					</select>
				 </td>   
				 <td> <input id="inCupoMax" type="text" name="name" size="10" onkeydown="return validarNumeros(event)">    </td> 
				 <td> <input id="inCupoDefecto" type="text" name="name" size="10" onkeydown="return validarNumeros(event)">    </td>  
				 <td> <input id="inTransMax" type="text" name="name" size="10" onkeydown="return validarNumeros(event)">    </td>  
				 <td> <input id="inTransDef" type="text" name="name" size="10" onkeydown="return validarNumeros(event)">    </td>  
				 <td> <input type="text" name="name" size="10">    </td>  
				 <td> <input type="text" name="name" size="10">    </td> 
				 <td>
					<input id="btnEdit" type="button" value="Edit" />
					<input id="btnElim" type="button" value="Eliminar" />
				</td>
			 </tr>
		</TFOOT>
		 
		</table>
		
<% } %>  
 
  
</body>
</html>
dojo.require("dojo.dom");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dojox.grid.DataGrid");

dojo.ready(function() {
	LimitValuePackageDWR.getViewData('Package', getData2Update);
});

function getData2Update(dataDWR) {
	require(["dojo/query",'dijit/form/Button'], function(query, Button){
		
			function formatter(col, rowIndex){
//				alert('dfgdfd');
	            var w = new Button({
	                label: "delete",
	                onClick: function() {
		  			      if (confirm("Seguro Desea Eliminar? rowIndex: "+rowIndex)){
		  			    	 //var rowdata = this.grid.getItem(rowIndex);
		  			    	//console.log("this.grid> "+this.grid);
		  			    	//  alert(rowdata['id']);
		  			    	console.log(json2txt(col, ' col> '));
		  			    	console.log(' gridStore1>> ');
		  			    	for (var i = 0, itemSeleccionado; itemSeleccionado = grid.store[ i++];) {
		  			    		console.log(' gridStore2>> ');
		  			    		console.log(json2txt(itemSeleccionado, ' stItem> '));
		  			    			
		  			    	}
		  			    	console.log(' gridStore3>> ');
		  			    	  console.log( grid.store);
		  			    	console.log(' gridStore4>> ');
		  			    	 console.log(  grid.store[rowIndex] );
		  			    	console.log(' gridStore5>> ');
		  			    	store.deleteItem(  grid.store[rowIndex] );
		  			    	
		  			    	store.save({onComplete: saveDone, onError: saveFailed});
		  			    	
		  			    	  var item = grid.selection.getSelected();
		  			    	  var work_id = grid.store.getValue(item[0], "work_id");
		                        alert(work_id);
		  			      }
	                }
	            });
	            return w;
	        }
	//---------------------------------------------------------------------		
			function formatDate(datum){
	            /* Format the value in store, so as to be displayed.*/
	            var d = stamp.fromISOString(datum);
	            return locale.format(d, {selector: 'date', formatLength: 'long'});
	        }
	//---------------------------------------------------------------------		
		console.log(  '------------- numero Tablas'  );
		var nodes  =query(".jsDataGrid");
		
		/* set up layout */
		var layout = [ [ { 'name' : 'CUPO', 'field' : 'nameLimit' }, 
		                  { 'name' : 'Cupo Maximo', 'field' : 'cupoMaximo' }, 
		                  { 'name' : 'Cupo x Defecto', 'field' : 'cupoDefecto' },
		                  { 'name' : 'Cod Package', 'field' : 'codePackage' },
		                  { 'name' : 'Moneda', 'field' : 'moneda' },
		                  { 'name' : 'Codigo Limite', 'field' : 'codeLimit' },
		                  { 'name' : 'Opciones' , 'field' : 'codeLimit', formatter : formatter}
		                  ] ];
		
		for(var x = 0; x < nodes.length; x++){
			
			var data = { 	identifier : 'id',  items : [] 	};
			
			for (var i = 0, itemSeleccionado; itemSeleccionado = dataDWR[ i++];) {
//				console.log(json2txt(itemSeleccionado, ' dojoMixin> '));
				if( nodes[x].id == 'gridDiv'+itemSeleccionado.codePackage  ){
					data.items.push(dojo.mixin({ id : i + 1 }, itemSeleccionado ));
				}
			}
						
			var store = new dojo.data.ItemFileWriteStore({ data : data });
//			console.log(json2txt(store, ' store> '));
			
			 
			var xnode = {'nameLimit': 'Ronald', 'cupoMaximo' : '000' , 'cupoDefecto' : '001' , 'codePackage' : '002' , 'moneda': 'dolar', 'codeLimit':'555'};
			var add = store.newItem(dojo.mixin({id: 45}, xnode ) );
			function saveDone(){
//				  alert("Done saving.");
				}
				function saveFailed(){
//				  alert("Save failed.");
				}
				store.save({onComplete: saveDone, onError: saveFailed});
//			
			
			console.log('-->> Definicieno grid');
			var grid = new dojox.grid.DataGrid({
				id : 'grid_'+nodes[x].id,
				store : store,
				structure : layout,
				rowSelector : '30px'
			});
		
			/* append the new grid to the div */
			// grid.placeAt("gridDiv");
			grid.placeAt( nodes[x].id );
//			dojo.byId("gridDiv").appendChild(grid.domNode);
			
			/* Call startup() to render the grid */
			grid.startup();
		}
		
		
	});
}

 


function json2txt(obj, path) {
	var txt = '';
	for ( var key in obj) {
		if (obj.hasOwnProperty(key)) {
			if ('object' == typeof (obj[key])) {
				txt += json2txt(obj[key], path + (path ? '.' : '') + key);
			} else {
				txt += path + '.' + key + '\t' + obj[key] + '\n';
			}
		}
	}
	return txt;
}


function emailcheck(){
    var string1=document.example.email.value
    if (string1.indexOf("@")==-1){
        alert("Please input a valid email address!")
        document.example.email.focus()
    }
}

//validar
function emaildasdkja(){

}
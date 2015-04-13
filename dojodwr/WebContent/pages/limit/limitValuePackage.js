dojo.require("dojo.dom");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dojox.grid.DataGrid");

dojo.ready(function() {
	LimitValuePackageDWR.getViewData('Package', getData2Update);
});

function getData2Update(dataDWR) {

	require(["dojo/query",'dijit/form/Button'], function(query, Button){
		
			function formatter(){
				alert('dfgdfd');
	            var w = new Button({
	                label: "Click me!",
	                onClick: function() {
	                    alert("Thanks for all the fish.  ");
	                }
	            });
	            w._destroyOnRemove=true;
	            return w;
	        }
			function formatDate(datum){
	            /* Format the value in store, so as to be displayed.*/
	            var d = stamp.fromISOString(datum);
	            return locale.format(d, {selector: 'date', formatLength: 'long'});
	        }
			
		console.log(  '------------- numero Tablas'  );
		var nodes  =query(".jsDataGrid");
		console.log(nodes);
		
		/* set up layout */
		var layoutA = [ [ { 'name' : 'CUPO', 'field' : 'nameLimit' }, 
		                  { 'name' : 'Cupo Maximo', 'field' : 'cupoMaximo' }, 
		                  { 'name' : 'Cupo x Defecto', 'field' : 'cupoDefecto' },
		                  { 'name' : 'Cod Package', 'field' : 'codePackage' },
		                  { 'name' : 'Moneda', 'field' : 'moneda' },
		                  { 'name' : 'Codigo Limite', 'field' : 'codeLimit' },
		                  { 'name' : 'Opciones' , 'field' : 'codeLimit', formatter : formatter}
		                  ] ];
	
		
		
		for(var x = 0; x < nodes.length; x++){
			
			var data = { 	identifier : 'id',  items : [] 	};
			
			var limits = dataDWR;
			var rows = 4;
			for (var i = 0, l = limits.length; i < rows; i++) {
				var itemSeleccionado = limits[i % l];
//				console.log(i + ' -x-  ' + l);
//				console.log(json2txt(limits[i % l], ' dojoMixin> '));
				console.log("compare"+ itemSeleccionado.codePackage);
				if( nodes[x].id == 'gridDiv'+itemSeleccionado.codePackage  ){
//					alert('exito')
//					itemSeleccionado['Opciones'] = "<a href='#'>hi</a>";
					data.items.push(dojo.mixin({ id : i + 1 }, itemSeleccionado ));
				}
				
			}
			
			console.log(  '------------- dataDWR'  );
			console.log(json2txt(dataDWR, ' DWR> '));
			console.log('\n\n');
			
			console.log(  '------------- limits'  );
			console.log(json2txt(dataDWR, ' limits> '));
			console.log('\n\n');
			
			var store = new dojo.data.ItemFileWriteStore({ data : data });
		
			console.log(  '------------- store'  );
			console.log(json2txt(dataDWR, ' store> '));
			console.log('\n\n\n\n');
			
			var layout = layoutA;
			console.log('-->> Definicieno grid');
			var grid = new dojox.grid.DataGrid({
				id : 'grid_'+nodes[x].id,
				store : store,
				structure : layout,
				rowSelector : '30px'
			});
		
			/* append the new grid to the div */
			// grid.placeAt("gridDiv");
			console.log("___Asinando en div. RESULTADO:  "+nodes[x].id);
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

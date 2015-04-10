dojo.require("dojo.dom");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dojox.grid.DataGrid");

dojo.ready(function() {
	LimitValuePackageClientDWR.getViewData('Client', getData2Update);
});

function getData2Update(dataDWR) {
	var data = {
			identifier : 'id',
			items : []
		};
	console.log(  dataDWR  );
	console.log(json2txt(dataDWR, ' DWR> '));
	console.log('\n\n');

	var limits = dataDWR;
	var rows = 4;
	for (var i = 0, l = limits.length; i < rows; i++) {
		console.log(i + ' -x-  ' + l);
		console.log(json2txt(limits[i % l], ' dojoMixin> '));
		data.items.push(dojo.mixin({ id : i + 1 }, limits[i % l]));
	}
	var store = new dojo.data.ItemFileWriteStore({ data : data });

	console.log('-->> Definicieno Layout');
	/* set up layout */
	var layoutA = [ [ { 'name' : 'CUPO', 'field' : 'nameLimit' }, 
	                  { 'name' : 'Cupo Maximo', 'field' : 'cupoMaximo' }, 
	                  { 'name' : 'Cupo x Defecto', 'field' : 'cupoDefecto' },
	                  { 'name' : 'Cod Package', 'field' : 'codePackage' },
	                  { 'name' : 'Moneda', 'field' : 'moneda' },
	                  { 'name' : 'Codigo Limite', 'field' : 'codeLimit' },
	                  ] ];


	var layout = layoutA;
	console.log('-->> Definicieno grid');
	var grid = new dojox.grid.DataGrid({
		id : 'grid',
		store : store,
		structure : layout,
		rowSelector : '30px'
	});

	/* append the new grid to the div */
	// grid.placeAt("gridDiv");
	dojo.byId("gridDiv").appendChild(grid.domNode);

	/* Call startup() to render the grid */
	grid.startup();
	
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

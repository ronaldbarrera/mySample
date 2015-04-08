define([
	"dojo/_base/declare",
	"dojox/grid/util",
	"dojox/grid/_View","./_base"
], function(declare, util, _View){

	return declare('ec.fisa.grid._AlignHeaderView', [_View], {
		_getHeaderContent: function(inCell){
			var n = inCell.name || inCell.grid.getCellName(inCell);
			if(/^\s+$/.test(n)){
				n = '&nbsp;';//otherwise arrow styles will be messed up
			}
			var tag=null;
			if(inCell.headerstyle){
				tag='<div style="'+inCell.headerstyle+'" class="dojoxGridSortNode';
			} else {
				tag='<div class="dojoxGridSortNode';
			}
			var ret = [ tag ];
			
			if(inCell.index != inCell.grid.getSortIndex()){
				ret.push('">');
			}else{
				ret = ret.concat([ ' ',
				                   inCell.grid.sortInfo > 0 ? 'dojoxGridSortUp' : 'dojoxGridSortDown',
				                		   '"><div class="dojoxGridArrowButtonChar">',
				                		   inCell.grid.sortInfo > 0 ? '&#9650;' : '&#9660;',
				                				   '</div><div class="dojoxGridArrowButtonNode" role="presentation"></div>',
				                				   '<div class="dojoxGridColCaption">']);
			}
			ret = ret.concat([n, '</div></div>']);
			return ret.join('');
		}
	});

});
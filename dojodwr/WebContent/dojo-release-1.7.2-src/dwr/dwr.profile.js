var profile = {

resourceTags : {
	amd : function(filename, mid) {
		return /\.js$/.test(filename);
	},

	miniExclude: function(filename, mid){
		//exclude CVS folder files
		return /\Entries$/.test(filename)||/\Repository$/.test(filename)||/\Root$/.test(filename);
	}
}};
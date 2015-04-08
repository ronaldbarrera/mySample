function openPopUpParentWindowSameSize(url) {
	try {
		var width = screen.availWidth - 10;
		var height = screen.availHeight - 70;
		var props = 'left=0,top=0,border=0,status=yes,scrollbars=no,toolbar=no,menubar=no,location=no,resizable=no,directories=no,width='
				+ width + ',height=' + height;
		var w = window.open(url, "render", props);
		w.focus();
	} catch (e) {

	}
}

function hiFisa() {
	  var name = dwr.util.getValue("demoName");
	  LimitProcessDWR.hiFisa(name, update);
	}

function update(data) {
    dwr.util.setValue("demoReply", data);
}



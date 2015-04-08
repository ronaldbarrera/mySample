define( [ "dojo/_base/kernel", "dojo/_base/declare","dojo/_base/window","dojo/dom-construct",
		"./_base", "dwr/engine", "dwr/util", "ec/fisa/session/Utils",
		"dojo/domReady!" ], function(dojo, declare, win,domConstruct) {
	var li=dwr.engine._pathToDwrServlet.lastIndexOf("-");
	if(li>=0){
		dwr.engine._pathToDwrServlet=dwr.engine._pathToDwrServlet.substr(0,li);
	}
	li=null;
	dwr.engine.setHeaders({"fisaSessionId":dojo.config.fisaSessionId});
	
	ec.fisa.dwr.proxy._execute = dwr.engine._execute;
	ec.fisa.dwr.proxy._handleError = dwr.engine._handleError;
	ec.fisa.dwr.proxy.handleException = dwr.engine.handleException;
	ec.fisa.dwr.proxy.remoteHandleException = dwr.engine.remote.handleException;
	// resolucion de incidente mantis 
//	dwr.engine.transport.xhr._stateChange=dwr.engine.transport.xhr.stateChange;
//	dwr.engine.transport.xhr.stateChange=function(batch){
//		var loginReq = batch.req.getResponseHeader("LoginRequired");
//		if(loginReq==null||"true"!=loginReq){
//			dwr.engine.transport.xhr._stateChange(batch);
//		} else {
//			window.location.replace(dojo.config.fisaContextPath+"/duplicate_session_error.jsp?fisaLanguajeParam="+dojo.config.fisaLanguajeParam);
//		}
//	};
	dwr.engine._execute = function(path, scriptName, methodName, args) {
		// console.log("reiniciando timers");
		if (ec.fisa.session.utils) {
			ec.fisa.session.utils.resetAndInit();
		}
		ec.fisa.dwr.proxy._execute(dwr.engine._pathToDwrServlet, scriptName, methodName, args);
	};
	dwr.engine._handleError = function(batch, ex) {
		var doContinue = true;
		if(ex.name == "java.lang.SecurityException" && ex.message.indexOf("CSRF") != -1){
console.log("wrong session id. another session opened. must close this window");
			
			window.location.replace(dojo.config.fisaContextPath+"/duplicate_session_error.jsp?fisaLanguajeParam="+dojo.config.fisaLanguajeParam);
			doContinue = false;
		}
		if(doContinue){
		dwr.engine._postHook();
		ec.fisa.dwr.proxy._handleError(batch, ex);
		}
	};

	dwr.engine.handleException = function(batchId, callId, ex) {
		dwr.engine._postHook();
		ec.fisa.dwr.proxy.handleException(batchId, callId, ex);
	};
	
	dwr.engine.remote.handleException = function(batchId, callId, ex) {
		var doContinue = true;
		if(ex.javaClassName == "org.directwebremoting.extend.ServerException" && ex.message == "duplicateSessionReload"){
			console.log("wrong session id. another session opened. must close this window");
			
			window.location.replace(dojo.config.fisaContextPath+"/duplicate_session_error.jsp?fisaLanguajeParam="+dojo.config.fisaLanguajeParam);
			doContinue = false;
		}

	
		if(doContinue == true){
			ec.fisa.dwr.proxy.remoteHandleException(batchId, callId, ex);
		}
	};
	
	//UPDATE THE REFERENCE TO OUR FUNCTION to use the Engine.js function.
	var g = dwr.engine._global; 
	dojo.forEach(g.dwr._,function(dwrInstance){
		dwrInstance.handleException = dwr.engine.remote.handleException;
	});
	
	
	if(!dojo.config.fisaMobile){
		var standbyDivId=dojo.config.fisaStandbyId||'borderContainerTwo';
		ec.fisa.dwr.proxy.standby = new dojox.widget.Standby( {
			target : standbyDivId,
			color : '#E2EBFE',
			zIndex : 1500
		});
		//TODO: mover esto al viewRoot
		document.body.appendChild(ec.fisa.dwr.proxy.standby.domNode);
	} else {
		ec.fisa.dwr.proxy.standby = new dojox.mobile.ProgressIndicator({size:40,center:'true'});
		ec.fisa.dwr.proxy.contenStandby = domConstruct.create("div",{'class':'mblSimpleDialogCover'},win.body());
		ec.fisa.dwr.proxy.contenStandby.style.display = "none";
		win.body().appendChild(ec.fisa.dwr.proxy.standby.domNode);
		ec.fisa.dwr.proxy.standby.stop();
	}
	ec.fisa.dwr.proxy.standby.startup();

	dwr.engine.setPreHook(function() {
		if (ec.fisa.dwr.proxy.standby) {
//			var doHook = true;
//			//try to obtain the method name of the dwr called.
//			var batches = dwr.engine._batches;
//			if(batches != undefined && batches != null)
//			{
//				var nextBatchId =	dwr.engine._nextBatchId;
//				if(nextBatchId != undefined && nextBatchId != 0){
//					
//					var batchMap = batches[nextBatchId-1];
//					if(batchMap != undefined){
//						var methodName =	batchMap.map["c0-methodName"];
//						if(methodName === "mantainSessionCall"){
//							doHook = false;
//						}
//					}
//				}
//			}
//			
			
//			if(doHook){
				if(!dojo.config.fisaMobile){
					//Mantis 19336 Se permite que exista mas de un batch call - Esteban Capello
					if (dwr.engine._batchesLength >= 1) {
						ec.fisa.dwr.proxy.standby.show();
					} else {
						//console.log("Actualmente existen " + dwr.engine._batchesLength
						//		+ " ejecuciones pendientes");
					}
				}else{
					ec.fisa.dwr.proxy.contenStandby.style.display = "";
					win.body().appendChild(ec.fisa.dwr.proxy.standby.domNode);
					ec.fisa.dwr.proxy.standby.start();
				}
//			}
			
		} else {
			// console.log("El dialogo no esta definido");
		}
	});

	dwr.engine.setPostHook(function() {
		if (ec.fisa.dwr.proxy.standby) {
			
//			var doHook = true;
			//try to obtain the method name of the dwr called.
//			var batches = dwr.engine._batches;
//			if(batches != undefined && batches != null)
//			{
//				var nextBatchId =	dwr.engine._nextBatchId;
//				if(nextBatchId != undefined && nextBatchId != 0){
//					
//					var batchMap = batches[nextBatchId-1];
//					if(batchMap != undefined && batchMap != null){
//						var methodName =	batchMap.map["c0-methodName"];
//						if(methodName === "mantainSessionCall"){
//							doHook = false;
//						}
//					}
//				}
//			}
//			if(doHook){
			
			if(!dojo.config.fisaMobile){
				if (dwr.engine._batchesLength === 1) {
					ec.fisa.dwr.proxy.standby.hide();
				} else {
					// console.log("Actualmente existen " + dwr.engine._batchesLength
					//		+ " ejecuciones pendientes");
				}
			}else{
				ec.fisa.dwr.proxy.contenStandby.style.display = "none";
				ec.fisa.dwr.proxy.standby.stop();
			}
//			}
			
		} else {
			// console.log("El dialogo no esta definido");
		}
	});
	return declare("ec.fisa.dwr.proxy.Engine", [], {});
});
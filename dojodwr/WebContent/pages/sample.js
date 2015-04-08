
function sayHello() {
	  var name = dwr.util.getValue("demoName");
//	  alert("name "+ ViewServiceDVQuotaP);
	  ViewServiceDVQuotaP.sayHello(name, sayHello_loadinfo);
	}

function sayHello_loadinfo(data) {
    dwr.util.setValue("demoReply", data);
}


function initTable() {
	  dwr.util.useLoadingMessage();
	  fillPackage();
	}


var dataCACHE = { };
var viewed = -1;

function fillPackage() {
	ViewServiceDVQuotaP.getPackages(
	function(responseJV) {
		var packagePrincipal, idPack;
		var groups, quotaDataList ;
		var groupUp, quotaUp;
		var idGroup, idQuota;
		var responseSize = responseJV.length;
		if(responseSize > 0){
			packagePrincipal = responseJV[0];
			groups = packagePrincipal.groups;
			quotaDataList = packagePrincipal.quotaDataList;
		}else{
			return;
		}
	    //package  
	      idPack = packagePrincipal.codePackage;
	      dwr.util.cloneNode("pattern", { idSuffix:idPack });
	      dwr.util.byId("pattern" + idPack).style.display = "";
	      dwr.util.setValue("packageId" + idPack, ". "+packagePrincipal.codePackage);
	      dwr.util.setValue("packageName" + idPack, ""+packagePrincipal.namePackage);
	      dwr.util.setValue("packageAplica" + idPack, ""+packagePrincipal.applyTo );
	      dataCACHE[idPack] = packagePrincipal;
	     
	      //lista de Transacc 
	      for (var i = 0; i < groups.length; i++) {
	    	  groupUp = groups[i];
	    	  idGroup = groupUp.code;
	    	  dwr.util.cloneNode("block", { idSuffix:idGroup });
	    	  dwr.util.byId("block" + idGroup).style.display = "";
	    	  dwr.util.setValue("blockTitle" + idGroup, 
	    			  groupUp.code);
	    	  dwr.util.byId("blockTitle" + idGroup).title = groupUp.name;
	      }
//	      alert("NumGrupos: "+groups.length+"   quotaDataList: "+quotaDataList.length);
	      var indice = 1;
	      for (var j = 0; j < groups.length; j++) {
	    	  groupUp = groups[j];
	    	  idGroup = groupUp.code;
	    	 
	    	  for (var i = 0; i < quotaDataList.length; i++) {
	    		  quotaUp =  quotaDataList[i];
	    		  idQuota =  idGroup + i;
//	    		  alert(indice++);
	    		  if(quotaUp.group_code == idGroup){
//	    			  alert("CLONAR: "+"detailBody"+idGroup);
	    			  dwr.util.cloneNode("detailBody"+idGroup, { idSuffix:idQuota });
	    			  dwr.util.byId("detailBody"+idGroup+idQuota).style.display = "";
		    		  dwr.util.setValue("detailBody_cupo" + idGroup+idQuota, 
		    				  quotaUp.quota);
		    		  dwr.util.setValue("detailBody_canal" + idGroup+idQuota, 
		    				  "ATM");
		    		  dwr.util.setValue("detailBody_monlimite" + idGroup+idQuota, 
		    				  quotaUp.currency);
		    		  dwr.util.setValue("detailBody_cupmax" + idGroup+idQuota, 
		    				  quotaUp.maxQuota);
		    		  dwr.util.setValue("detailBody_cupdef" + idGroup+idQuota, 
		    				  quotaUp.defaultQuota);
		    		  dwr.util.setValue("detailBody_trmax" + idGroup+idQuota, 
		    				  quotaUp.maxNumTransac);
		    		  dwr.util.setValue("detailBody_trdef" + idGroup+idQuota, 
		    				  quotaUp.defaultNumTransac);
		    		  dwr.util.setValue("detailBody_fini" + idGroup+idQuota, 
		    				  quotaUp.starDate);
		    		  dwr.util.setValue("detailBody_vigencia" + idGroup+idQuota, 
		    				  quotaUp.validityTo);
	    		  }
	    	  }
	      }
	      
	      
	      
	  }
	);
	

}


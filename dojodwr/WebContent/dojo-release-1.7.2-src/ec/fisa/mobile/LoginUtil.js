define(["dojo/_base/declare",
        "dojo/window",
        "dojo/_base/window",
        "dojo/dom-style",
        "dojo/query",
        "dojox/mobile/ProgressIndicator",
        "./_base"], 
		function(declare, win, baseWin, domStyle,query) {

	var Util = declare("ec.fisa.mobile.LoginUtil", null,{
		submit:function(){
			var standby=new dojox.mobile.ProgressIndicator({size:40,center:'true'});
			baseWin.body().appendChild(standby.domNode);
			return true;
		},
		initBodyHeight:function(){
			var body=baseWin.body();
			var vs = win.getBox();
			var fmaxh=body['fmaxh'];
			if(fmaxh==null||fmaxh<vs.h){
				domStyle.set(dojo.byId("wrapper"),"height",vs.h+"px");
				var header=query(".mblHeadingLogin")[0];
				var footer=query(".loginFooterCntr")[0];
				var hh=domStyle.get(header,"height");
				var fh=domStyle.get(footer,"height");
				domStyle.set(footer,"top",(-fh-hh)+"px");
				var formDiv=query(".mblLoginContent")[0];
				var dh=domStyle.get(formDiv,"height");
				domStyle.set(formDiv,"top",(vs.h-fh-dh-(vs.h*0.02))+"px");
				body['fmaxh']=vs.h;
			}
		}
		
	});
	ec.fisa.mobile.loginUtil = new Util();
	return Util;
});
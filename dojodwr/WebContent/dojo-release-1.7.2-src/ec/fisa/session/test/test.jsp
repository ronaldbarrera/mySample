<html dir="ltr">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Fisa Business Platform Render</title>
<link rel="icon" href="/mcm-web-skin/images/favicon.ico"
	type="image/x-icon">
<link rel="shortcut icon" href="/mcm-web-skin/images/favicon.ico"
	type="image/x-icon">
<script
	src="/mcm-web-render/javascript/dojo-release-1.7.4-src/dojo/dojo.js"
	djConfig="parseOnLoad: true,modulePaths: {'dwr': '../../../dwr','ec':'../../dojo-release-1.7.2-src/ec'}">
	
</script>
<script type="text/javascript" charset="utf-8">
	dojo.require("dijit.Dialog");
	dojo.require("dijit.form.Button");
</script>
<link rel="stylesheet" type="text/css"
	href="/mcm-web-skin/css/themes/fisaClassic/fisaClassic.css" />
<link rel="stylesheet" type="text/css" href="/mcm-web-skin/css/style.css" />
</head>
<body>
	<script type="text/javascript">
	dojo.addOnLoad(function(){
		var title = '<%=com.fisa.render.core.util.FisaEncodeUtil.formatXml("Tiempo de Sesión por expirar")%>';
		var question = '<%=com.fisa.render.core.util.FisaEncodeUtil.formatXml("Su sesión está por expirar. Desea permanecer dentro del sistema?")%>';
		var errorDialog = new dijit.Dialog({title: title , closable:false});
		var questionDiv = dojo.create('div', { innerHTML: question });
		var buttonsDiv = dojo.create('div',{style:{margin: "auto", width: "25%"}});
		var yesButton = new dijit.form.Button(
	            { label: 'Si', id: 'yesButton'});
		var noButton = new dijit.form.Button(
	            { label: 'No', id: 'noButton'});
		
		buttonsDiv.appendChild(yesButton.domNode);
		buttonsDiv.appendChild(noButton.domNode);
		
		errorDialog.containerNode.appendChild(questionDiv);
	    errorDialog.containerNode.appendChild(buttonsDiv);
	    errorDialog.show();
	});
	</script>
</body>
</html>
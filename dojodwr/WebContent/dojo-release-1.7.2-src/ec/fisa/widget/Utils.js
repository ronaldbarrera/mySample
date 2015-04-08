define( [ "dojo/_base/declare", "./_base", "dojo/keys", "dojo/_base/connect","dojo/_base/lang", "dijit/focus","dojo/has","dojo/_base/sniff" ], function(declare,
		fisaWidget, keys, connect, lang, focusUtil,has) {

	var Utils = declare("ec.fisa.widget.Utils", null, {
		regexpr : /[0-9\-]|\.|,|[mtMT]/,
		regexprNoShorcut : /[0-9\-]|\.|,/,
		curNodeFocus:null,
		prevNodeFocus:null,
		_lastExec:null,
		setAcceptOnlyNumeric : function(componentNode,/*boolean*/ noShortcut) {
			var regExp = null;
			if(noShortcut == false){
			regExp = this.regexpr;
			}
			else{
			regExp = this.regexprNoShorcut;
			}
		
			componentNode.textbox.onkeypress = function(evt) {
				var theEvent = evt || window.event;
				var key = theEvent.keyCode || theEvent.which;
				var convertKey = ec.fisa.widget.utils.verifyKey(theEvent);
				if (convertKey && ec.fisa.widget.utils.verifyKeyPaste(theEvent)) {
					key = String.fromCharCode(key);
					var go = regExp.test(key)
					if (!go) {
						dojo.stopEvent(theEvent);
					}
					return go;
				} else {
					return true;
				}
			}
		},
		//mantis 18458 the event is onkeydown to avoid overwriting the onkeypress of inputconstraint
		setAcceptByLength:function(componentNode,length){
			if(length!=null&&length>0){
				componentNode.domNode.reval=length-1;
				componentNode.domNode.onkeydown = dojo.hitch(componentNode.domNode,function(evt) {
					var theEvent = evt || window.event;
					var key = theEvent.keyCode || theEvent.which;
					var convertKey = ec.fisa.widget.utils.verifyKey(theEvent);
					if (convertKey) {
						var go = this.reval>this.value.length;
						if (!go) {
							dojo.stopEvent(theEvent);
						}
						return go;
					} else {
						return true;
					}
				});
			}
		},
		inputConstraint: function(componentNode, regularExp){
			regularExp = new  RegExp(regularExp);
			//console.debug('Expresion regular para el componente: ' + regularExp);
//			componentNode.textbox.onkeydown = function(evt) {
//				console.log("onkeydown said keyCode: " + evt.keyCode);
//				console.log("onkeydown said charcode: " + evt.charCode);
//			};
			
			componentNode.textbox.onkeypress = function(evt) {
//				console.log("onkeypress said keyCode: " + evt.keyCode);
//				console.log("onkeypress said charcode: " + evt.charCode);
				var theEvent = evt || window.event;
				var key = theEvent.keyCode || theEvent.which;
				var convertKey = ec.fisa.widget.utils.verifyKey(theEvent);
				if (convertKey) {
					key = String.fromCharCode(key);
					var go = regularExp.test(key);
					if (!go) {
						dojo.stopEvent(theEvent);
					}
					return go;
				} else {
					return true;
				}
			}
			
		},
		
		verifyKeyPaste:function(evt){
			var charOrCode =  evt.keyCode;
			if(evt.ctrlKey && evt.charCode == 118){
				dojo.stopEvent(theEvent);
				return false;
			}
			return true;
			
		},
		
		//verifica si son teclas de control.
		verifyKey : function(evt) {
			var outcome = true;
			// se hace esto debido a que chrome no envia las teclas de control al keyPress
			var charOrCode =  evt.keyCode;
			if(dojo.isChrome){
				return outcome;
			}
			else if (dojo.isIE){
				switch (charOrCode) {
				case keys.ENTER:
					outcome = false;
					break;
				case keys.BACKSPACE:
					outcome = false;
					break;
				}
				
				return outcome;
			}
			//THIS MEANS IE 11. 
			else if(has("trident")){
				return outcome;
			}
			if(evt.ctrlKey || evt.altKey){
				return false;
			}
			
			switch (charOrCode) {
			case keys.BACKSPACE:
				outcome = false;
				break;
			case keys.TAB:
				outcome = false;
				break;
			case keys.CLEAR:
				outcome = false;
				break;
			case keys.ENTER:
				outcome = false;
				break;
			case keys.SHIFT:
				outcome = false;
				break;
			case keys.CTRL:
				outcome = false;
				break;
			case keys.ALT:
				outcome = false;
				break;
			case keys.META:
				outcome = false;
				break;
			case keys.PAUSE:
				outcome = false;
				break;
			case keys.CAPS_LOCK:
				outcome = false;
				break;
			case keys.ESCAPE:
				outcome = false;
				break;
			case keys.SPACE:
				outcome = false;
				break;
			case keys.PAGE_UP:
				outcome = false;
				break;
			case keys.PAGE_DOWN:
				outcome = false;
				break;
			case keys.END:
				outcome = false;
				break;
			case keys.HOME:
				outcome = false;
				break;
			case keys.LEFT_ARROW:
				outcome = false;
				break;
			case keys.UP_ARROW:
				outcome = false;
				break;
			case keys.RIGHT_ARROW:
				outcome = false;
				break;
			case keys.DOWN_ARROW:
				outcome = false;
				break;
			case keys.INSERT:
				outcome = false;
				break;
			case keys.DELETE:
				outcome = false;
				break;
			case keys.HELP:
				outcome = false;
				break;
			case keys.LEFT_WINDOW:
				outcome = false;
				break;
			case keys.RIGHT_WINDOW:
				outcome = false;
				break;
			case keys.SELECT:
				outcome = false;
				break;
			case keys.NUMPAD_0:
				outcome = false;
				break;
			case keys.NUMPAD_1:
				outcome = false;
				break;
			case keys.NUMPAD_2:
				outcome = false;
				break;
			case keys.NUMPAD_3:
				outcome = false;
				break;
			case keys.NUMPAD_4:
				outcome = false;
				break;
			case keys.NUMPAD_5:
				outcome = false;
				break;
			case keys.NUMPAD_6:
				outcome = false;
				break;
			case keys.NUMPAD_7:
				outcome = false;
				break;
			case keys.NUMPAD_8:
				outcome = false;
				break;
			case keys.NUMPAD_9:
				outcome = false;
				break;
			case keys.NUMPAD_MULTIPLY:
				outcome = false;
				break;
			case keys.NUMPAD_PLUS:
				outcome = false;
				break;
			case keys.NUMPAD_ENTER:
				outcome = false;
				break;
			case keys.NUMPAD_MINUS:
				outcome = false;
				break;
			case keys.NUMPAD_PERIOD:
				outcome = false;
				break;
			case keys.NUMPAD_DIVIDE:
				outcome = false;
				break;
			case keys.F1:
				outcome = false;
				break;
			case keys.F2:
				outcome = false;
				break;
			case keys.F3:
				outcome = false;
				break;
			case keys.F4:
				outcome = false;
				break;
			case keys.F5:
				outcome = false;
				break;
			case keys.F6:
				outcome = false;
				break;
			case keys.F7:
				outcome = false;
				break;
			case keys.F8:
				outcome = false;
				break;
			case keys.F9:
				outcome = false;
				break;
			case keys.F10:
				outcome = false;
				break;
			case keys.F11:
				outcome = false;
				break;
			case keys.F12:
				outcome = false;
				break;
			case keys.F13:
				outcome = false;
				break;
			case keys.F14:
				outcome = false;
				break;
			case keys.F15:
				outcome = false;
				break;
			case keys.NUM_LOCK:
				outcome = false;
				break;
			case keys.SCROLL_LOCK:
				outcome = false;
				break;
			case keys.UP_DPAD:
				outcome = false;
				break;
			case keys.DOWN_DPAD:
				outcome = false;
				break;
			case keys.LEFT_DPAD:
				outcome = false;
				break;
			case keys.RIGHT_DPAD:
				outcome = false;
				break;
			}
			return outcome;
		},
		initPostRoutineActions:function(){
			dojo.connect(dojo.global, 'onclick', function() {
				ec.fisa.widget.utils.handleMouseInteraction();
			});
			dojo.connect(dojo.global, 'onkeydown', function(evt) {
				ec.fisa.widget.utils.handleKeyboardInteraction(evt);
			});
		},
		programaticChange:function(firingDomId){
			if(firingDomId==null){
				ec.fisa.widget.utils.prevNodeFocus=ec.fisa.widget.utils.curNodeFocus;
				ec.fisa.widget.utils.curNodeFocus=focusUtil.curNode;
			}else{
				ec.fisa.widget.utils.prevNodeFocus=firingDomId;
				ec.fisa.widget.utils.curNodeFocus=focusUtil.curNode;
			}
			if(ec.fisa.widget.utils.curNodeFocus!=null&&ec.fisa.widget.utils.curNodeFocus.id!==null){
				ec.fisa.widget.utils.curNodeFocus=ec.fisa.widget.utils.curNodeFocus.id;
			}
		},
		hasFocusChanged:function(){
			return ec.fisa.widget.utils.prevNodeFocus!=ec.fisa.widget.utils.curNodeFocus;
		},
		handleKeyboardInteraction:function(evt){
			ec.fisa.widget.utils.prevNodeFocus=ec.fisa.widget.utils.curNodeFocus;
			ec.fisa.widget.utils.curNodeFocus=focusUtil.curNode;
			//ec.fisa.widget.utils.isFocusChange = ec.fisa.widget.utils.hasFocusChanged();
			var theEvent = evt || dojo.global.event;
			if(theEvent.charOrCode==keys.ENTER){
				ec.fisa.widget.utils.execDelayedEvent=true;
			} else {
				ec.fisa.widget.utils.execDelayedEvent=false;
			}
		},
		handleMouseInteraction:function(){
			ec.fisa.widget.utils.prevNodeFocus=ec.fisa.widget.utils.curNodeFocus;
			ec.fisa.widget.utils.curNodeFocus=focusUtil.curNode;
			if(ec.fisa.widget.utils.curNodeFocus==null){
				ec.fisa.widget.utils.execDelayedEvent=true;
			} else {
				ec.fisa.widget.utils.execDelayedEvent=false;
			}
		},
		isDiferentExec:function(){
			var lastExec=this._lastExec;
			if(lastExec==null){
				return true;
			} else {
				var dife=this.curNodeFocus==lastExec;
				if(dife){
					this._lastExec=null;
				}
				return !dife;
			}
		},
		execFocused:function(lastFocusItem){
			if(lastFocusItem.click&&lang.isFunction(lastFocusItem.click)){
				this._lastExec=lastFocusItem;
				//TODO: FUNCIONALIDAD DE DOBLE CLICK DESHABILITADA FAVOR CONVERSAR CON ALBERTO SALAZAR
				//lastFocusItem.click();
			}
		},
		resetFocusManager:function(){
			ec.fisa.widget.utils.prevNodeFocus=null;
			ec.fisa.widget.utils.curNodeFocus=null;
			ec.fisa.widget.utils._lastExec=null;
			focusUtil.focus(dojo.byId(dojo.config.fisaStandbyId));
		},
		/**Enables a widget removing disabled attribute. Use this cause contains a fix for IE.
		 * and focus cause it make to refresh it.*/
		enableWidget:function(/*String - Widget*/id){
			var widgetToUse = dijit.byId(id);
			if(widgetToUse!=null){
				widgetToUse.set("disabled",false);
				var domNode=dojo.byId(widgetToUse.id);
				if(domNode){
					dojo.removeAttr(domNode,"disabled");
				}
			}
		},
		/**Disables a widget Use this cause contains a fix for IE.*/
		disableWidget:function(/*String- Widget*/id){
			var widgetToUse = dijit.byId(id);
			if(widgetToUse!=null){
				widgetToUse.set("disabled",true);
				var domNode=dojo.byId(widgetToUse.id);
				if(domNode){
					dojo.setAttr(domNode,"disabled","disabled");
				}
			}
		},
		isEnabled:function(/*String- Widget*/id){
			var widgetToUse = dijit.byId(id);
			if(widgetToUse!=null){
				return !widgetToUse.get("disabled");
			}
			return false;
		},
    	parseTextAreaSize:function(visualSize){ 
    		var outcome={};
    		if(visualSize >0){
				if(visualSize>=1000){
					var remainder =visualSize%1000;
					if(remainder>0){
						outcome.cols=remainder;
						outcome.rows=(visualSize -remainder)/1000;
					}
				}else{
					outcome.cols=visualSize;
				}
			}
    		return outcome;
    	},
    	
    	//in multiregsiters when change view, the widget is destroyed, so the data must be backed up.
    	destroyMultiregisterWidget:function(wdgt){
    	
    		//in multiregisters before destroy the widget backuup de data.
			if(wdgt.parentEditableGrid == true && wdgt._destroyOnRemove == true){
				var gridWdgt = dijit.byId(wdgt.gridId);
				if(gridWdgt !=undefined && gridWdgt != null){
					//obtain this textbox value.
					var value =wdgt.get("value");
					var model =	gridWdgt.model;
					if(model != undefined && model != null){
						//grilla editable
						if(gridWdgt.fisaEditableGrid == true && gridWdgt.fisaEditableDirectGrid == undefined ){
							model.setValueDestroyFldData([wdgt.fieldId],value);
						}
						else if(gridWdgt.fisaEditableGrid == true && gridWdgt.fisaEditableDirectGrid == true ){
							
							if(wdgt.gridRealRowIndex != undefined && wdgt.gridRealRowIndex != null){
								//verify model exist! cause in destroy the model is erased first.
								var modelPerRow=	model[wdgt.gridRealRowIndex];
								if(modelPerRow != undefined){
								modelPerRow.setValueDestroyFldData([wdgt.fieldId],value);
								}
							}
//TODO:VERIFY
						}
					}
					
				}
			}
    		
    	},
    	updateGridRowHeight:function(gridSelectedRowIndex, gridId){//Mantis 20145 JCVQ Se crea método genérico para realizar el ajuste de la altura de la fila de un grid.
			if(gridSelectedRowIndex!=null){
				var grid=dijit.byId(gridId);
				grid.scroller.rowHeightChanged(gridSelectedRowIndex, true/*fix #11101*/);
			}
		}
    	

	});
	fisaWidget.utils = new Utils();
	ec.fisa.widget.utils = fisaWidget.utils;
	return fisaWidget.utils;
});

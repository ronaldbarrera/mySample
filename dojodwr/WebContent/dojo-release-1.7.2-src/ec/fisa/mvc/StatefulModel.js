define([
	"dojo/_base/kernel","dojo/_base/declare","dojo/dom-construct","dojo/dom-attr",
	"dojo/dom-geometry","dojo/dom-style","dijit/Tooltip","dojox/lang/functional/object","dojo/_base/array"
],function(dojo,declare,domConstruct,domAttr,domGeometry,domStyle,Tooltip){
	
	var StatefulModel = declare("ec.fisa.mvc.StatefulModel", null, {
		_data:null,
		_fldDta:null,
		_tt:null,
		constructor:function(initialData){
			if(initialData!=null){
				this._data=initialData;
			}
			this._tt={};
		},
		appendObject:function(/*Array*/prefix,/*Object*/value, componentId, cmpProp, cmpFrmt,cmpChng){
			var pfix=prefix||[];
			var dt=null;
			if(componentId==null){
				if(this._data==null){
					this._data={};
				}
				dt=this._data;
			}else{
				if(this._fldDta==null){
					this._fldDta={};
				}
				dt=this._fldDta;
			}
			dojo.forEach(pfix,function(idtf){
				if(dt[idtf]==null){
					dt[idtf]={};
				}
				dt=dt[idtf];
			},this);
			if(componentId==null){
				dt._fv=value;
			} else {
				dt._cmpId=componentId;
				dt._cmpProp=cmpProp;
				dt._cmpFrmt=cmpFrmt;
				dt._cmpChng=cmpChng;
				var cmp= dijit.byId(componentId);
				cmp.set(dt._cmpProp, value,cmpChng);
			}
		},
		removeObject:function(/*Array*/prefix){
			var _pfx =prefix||[];
			var _fld = this._containsFld(_pfx);
			if(_fld==null){
				var _val = this._containsVal(_pfx);
				//es solo data
				if(_val!=null&&_pfx.length>0){
					var _dat = this._data;
					var _prnt= null;
					for ( var i = 0; i < (_pfx.length-1); i++) {
						if (_pfx[i] in _dat) {
							_prnt=_dat;
							_dat = _dat[_pfx[i]];
						}
					}
					var keys=dojox.lang.functional.keys(_dat);
					if(keys!=null){
						if(keys.length>1||keys.length==1&&_prnt==null){
							delete _dat[_pfx[_pfx.length-1]];
						} else {
							delete _prnt[_pfx[_pfx.length-2]];
						}
					}
				}
			} else {
				//TODO: borrar del arreglo de fields
			}
		},
		_containsFld:function(pfx){
			var _pfx = pfx || [];
			var _dat = null;
			if(_pfx.length==0){
				return this._fldDta;
			}
			for (var i = 0; i < _pfx.length; i++) {
				if(i==0){
					if(this._fldDta==null){
						return null;
					}
					_dat=this._fldDta;
				}
				if (_pfx[i] in _dat) {
					_dat = _dat[_pfx[i]];
				}else{
					return null;
				}
			}
			return _dat;
		},
		_containsVal : function(pfx) {
			var _pfx = pfx || [];
			var _dat = null;
			if(_pfx.length==0){
				return this._data;
			}
			for ( var i = 0; i < _pfx.length; i++) {
				if(i==0){
					if(this._data==null){
						return null;
					}
					_dat=this._data;
				}
				if (_pfx[i] in _dat) {
					_dat = _dat[_pfx[i]];
				}else{
					return null;
				}
			}
			return _dat;
		},
		contains:function(pfx){
			return this._containsFld(pfx)!=null||this._containsVal(pfx)!=null;
		},
		getComponent:function(pfx){
			var _dat=this._containsFld(pfx);
			if(_dat!=null){
				return dijit.byId(_dat._cmpId);
			}
			return null;
		},
		getValue:function(pfx){
			var _dat=this._containsFld(pfx);
			if(_dat!=null){
				var wd=dijit.byId(_dat._cmpId);
				var outcome=wd.get(_dat._cmpProp);
				if(_dat._cmpFrmt!=null&&outcome!=null&&outcome!=""){
					outcome=_dat._cmpFrmt(outcome);
				}
				return outcome;
			}else{
				_dat=this._containsVal(pfx);
				if(_dat!=null){
					return _dat._fv;
				}
			}
			return null;
		},
		setValue:function(pfx,value,priorityChange){
			var pc=priorityChange;
			if(pc===undefined){
				pc=true;
			}
			var _dat = this._containsFld(pfx);
			if(_dat!=null){
				var wd=dijit.byId(_dat._cmpId);
				var lval=wd.get(_dat._cmpProp);
				wd.set(_dat._cmpProp,value,priorityChange);
				if(_dat._cmpChng&&lval!=value&&wd.onFChange){
					wd.onFChange();
				}
				return;
			}else{
				//pfx.push('_fv');
				_dat=this._containsVal(pfx);
				if(_dat==null){
					_dat=this._data;
					var _pfx = pfx || [];
					for (var i = 0; i < _pfx.length; i++) {
						if (!(_pfx[i] in _dat)) {
//							if( (i+1) == _pfx.length){
//							  _dat[_pfx[i]]=value;
//							}else{
							   _dat[_pfx[i]]={};
//							}
						}
						_dat=_dat[_pfx[i]];
					}
				}
				_dat['_fv']=value;
			}
		},
		
		
		//used mainly for multiregisters cause destroy the fld and updates thhe value.
		setValueDestroyFldData:function(pfx,value){
			var _dat = this._containsFld(pfx);
			if(_dat!=null){
				_dat = null;
				delete this._fldDta[pfx];
			}
			//pfx.push('_fv');
			_dat=this._containsVal(pfx);
			if(_dat==null){
				_dat=this._data;
				var _pfx = pfx || [];
				for (var i = 0; i < _pfx.length; i++) {
					if (!(_pfx[i] in _dat)) {
//						if( (i+1) == _pfx.length){
//						_dat[_pfx[i]]=value;
//						}else{
						_dat[_pfx[i]]={};
//						}
					}
					_dat=_dat[_pfx[i]];
				}
			}
			_dat['_fv']=value;
		},
		
		setMessage:function(pfx,msg,level){
			var _dat = this._containsFld(pfx);
			
			if(_dat == null){
				return false;
			}
			else
			  if(_dat!=null){
				  ec.fisa.format.utils.addToFieldError(_dat._cmpId,msg,level,this._tt);
				return true;
			}
		},
		
		clearAllMessages:function(){
			dojox.lang.functional.forIn(this._tt,function(ttWd,_cmpId){
				/*ttWd.destroy(false);*/
				ec.fisa.format.utils.removeFieldError(_cmpId);
			},this);
			this._tt={};
		},
		toPlainObject:function(){
			var _data=null;
			if (this._data != null || this._fldDta != null) {
				_data = {};
				if (this._data != null){
				dojox.lang.functional.forIn(this._data, function(val, idx) {
					if ('_fv' in val) {
						_data[idx] = val._fv;
					} else {
						_data[idx] = this.recurseByVal(val);
					}
				}, this);
				}
				if (this._fldDta != null){
				dojox.lang.functional.forIn(this._fldDta, function(val, idx) {
					if ('_cmpId' in val) {
						var cmp =dijit.byId(val['_cmpId']);
						_data[idx]=cmp.get(val['_cmpProp']);
						if(val['_cmpFrmt']!=null&&_data[idx]!=null&&_data[idx]!=""){
							_data[idx]=(val['_cmpFrmt'](_data[idx],{'format':cmp.fisaFormat,'formatPattern':cmp.fisaFormatPattern}));
						}
					} else {
						_data[idx] = this.recurseByFld(val,_data[idx]);
					}
				}, this);
				}
			}
			return _data;
		},
		recurseByVal:function(data){
			if(data!=null){
				var _data={};
				dojox.lang.functional.forIn(data,function(val,idx){
					if('_fv' in val){
						_data[idx]=val._fv;
					} else {
						_data[idx] = this.recurseByVal(val);
					}
				},this);
				return _data;
			}
			return null;
		},
		recurseByFld:function(data, preVal){
			if(data!=null){
				var _data=null;
				if(preVal==null){
					_data={};
				}else{
					_data=preVal;
				}
				dojox.lang.functional.forIn(data,function(val,idx){
					if ('_cmpId' in val){
						var cmp =dijit.byId(val['_cmpId']);
						_data[idx]=cmp.get(val['_cmpProp']);
						if(val['_cmpFrmt']!=null&&_data[idx]!=null&&_data[idx]!=""){
							_data[idx]=(val['_cmpFrmt'](_data[idx],{'format':cmp.fisaFormat,'formatPattern':cmp.fisaFormatPattern}));
						}
					} else {
						_data[idx]=this.recurseByFld(val,_data[idx]);
					}
				},this);
				return _data;
			}
			return null;
		},
		/**Obtain component ids.*/
		getComponentsId:function(){
			var _data={};
			dojox.lang.functional.forIn(this._fldDta, function(val, idx) {
				if ('_cmpId' in val) {
					_data[idx]=val['_cmpId'];
				
				} else {
					_data[idx] = this.recurseByFld(val);
				}
			}, this);
			return _data;
			
		},
		/**to get id recursevily*/
		recurseGetIdByFld:function(data){
			if(data!=null){
				var _data={};
				dojox.lang.functional.forIn(data,function(val,idx){
					if ('_cmpId' in val){
						_data[idx]=val['_cmpId'];
					} else {
						_data[idx]=this.recurseByFld(val);
					}
				},this);
				return _data;
			}
			return null;
		}
		
     });
	return StatefulModel;
});

define(["dojo/_base/declare","dojox/mobile/RoundRectDataList","dojo/_base/array"],function(declare,RoundRectDataList,array){
	return declare("ec.fisa.mobile.widget.RoundRectDataList",[RoundRectDataList],{
		generateList: function(/*Array*/items, /*Object*/dataObject){
			//override to send Index as parameter
			array.forEach(this.getChildren(), function(child){
				child.destroyRecursive();
			});
			if(this.createHeaderListItem){
				this.createHeaderListItem();
			}
			array.forEach(items, function(item, index){
				this.addChild(this.createListItem(item,index));
			}, this);
		},
		onError:function(errorData, /*Object*/request){
			console.log(errorData);
		}
	});
});
define([
    "dojo/_base/kernel",
	"dojo/_base/declare",
	"dojo/_base/lang"
], function(dojo,declare, lang){
var DWRCache = declare("ec.fisa.dwr.Cache", null, {
	contoller:null,
    method:null,
    tabId:null,
    gridStoreId:null,
    listener:null,
    additionalParams:null,
  constructor:function(/*string*/ contoller, /*string*/ method, /*string*/ tabId, /*string*/ gridStoreId,/* array of objects*/ additionalParams,/*object*/ listener) {
    this.contoller = contoller;
    this.method = method;
    this.tabId = tabId;
    this.gridStoreId = gridStoreId;
    this.listener = listener;
    this.additionalParams = additionalParams;
  },
  destroy:function(){
	delete this.contoller
	delete this.method
	delete this.tabId;
	delete this.gridStoreId;
	delete this.listener;
	delete this.additionalParams;
  },
  /**
   * Notes that there is a region of a page that wishes to subscribe to server
   * side data and registers a callback function to receive the data.
   * @param {Object} region filtering and sorting options. Includes:
   * - start: The beginning of the region of specific interest
   * - count: The number of items being viewed
   * - sort: The sort criteria
   * - query: The filter criteria
   * @param {function|object} callbackObj A standard DWR callback object
   * @return 
   */
  viewRegion : function(region, callbackObj) {
    if (!region) region = { };
    if (!region.start) region.start = 0;
    if (!region.count) region.count = -1;
    if (!region.sort) region.sort = [];
    else {
      for (var index = 0; index < region.sort.length; index++) {
        if (typeof region.sort[index].descending == "undefined") {
          region.sort[index].descending = false;
        }
      }
    }
    if (!region.query) region.query = {};

    return dwr.engine._execute(dwr.engine._pathToDwrServlet, this.contoller, this.method, [ this.tabId, this.gridStoreId, this.doGetAdditionalParameters(),region, this.listener, callbackObj ]);
  },

  /**
   * As dwr.data.Cache.viewRegion() except that we only want to see a single item.
   * @param {string} itemId ID of object within the given store
   * @param {function|object} callbackObj A standard DWR callback object
   */
  viewItem : function(itemId, callbackObj) {
    return dwr.engine._execute(dwr.engine._pathToDwrServlet, this.contoller, this.method, [ this.tabId, this.gridStoreId, this.doGetAdditionalParameters(), itemId,this.listener, callbackObj ]);
  },

  /**
   * Undo the action of dwr.data.view()
   * @param {function|object} callbackObj A standard DWR callback object
   */
  unsubscribe : function(callbackObj) {
    if (this.listener) {
      return dwr.engine._execute(dwr.engine._pathToDwrServlet, this.contoller, this.method, [ this.tabId, this.gridStoreId, this.doGetAdditionalParameters(),this.listener, callbackObj ]);
    }
  },

  /**
   * Request an update to server side data
   * @param {Object} items An array of update descriptions
   * @param {function|object} callbackObj A standard DWR callback object
   */
  update : function(items, callbackObj) {
    return dwr.engine._execute(dwr.engine._pathToDwrServlet, this.contoller, this.method, [ this.tabId, this.gridStoreId, this.doGetAdditionalParameters(), items,callbackObj ]);
  },
  doGetAdditionalParameters: function(){//Mantis 18517 JCVQ
	  if(lang.isFunction(this.additionalParams)){
		  return this.additionalParams();
	  }else{
		  return this.additionalParams;
	  }
  }
  
});
return DWRCache;
});
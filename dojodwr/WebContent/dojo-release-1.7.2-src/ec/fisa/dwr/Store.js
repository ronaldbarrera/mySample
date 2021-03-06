define([
        "dojo/_base/kernel",
        "dojo/_base/declare",
        "dojo/data/util/filter",
        "ec/fisa/dwr/proxy/Engine",
        "ec/fisa/dwr/Cache"
        ], function(dojo,declare){
	var DWRStore = declare("ec.fisa.dwr.Store", null, {
		// Summary: An implementation of all 4 DataStore APIs
		// TODO: Consider caching attributes for dojo.data.api.Read.getAttributes
		// Since we're generally going to be storing sets of homogeneous objects
		// we might pass an official attribute list across the wire and cache it
		// TODO: Something more formal about errors in _callback()?
		// TODO: I only discovered from reading the QueryReadStore that the param
		// passed into fetch() is a dojo.data.api.Request. I'm assuming that the same
		// is true for fetchItemByIdentity()
		// TODO: do we need to check that we don't have prototype pollution?
		// save() and (maybe) other functions do 'for(a in b) {...}' without checking
		// that b[a] isn't a function.
		// TODO: The logic for the call to onComplete in the callback in simpleFetch
		// is different to our implementation.I thought that I'd followed the spec.
		// Either I can't read, or the author of simpleFetch can't read, wibble.
		// NOTE: Cache implementation based on dojox.data.ClientFilter

		// When we need to generate a local $id from a call to newItem()
		autoIdPrefix:"",

		// Activate client cache (useful with subscribe)
		_clientCache: false,

		// Current filter that is being applied
		_currentQuery: null,

		// Save queries once executed
		_executedQueries:null,
		controller:null,
		method:null,
		tabId:null,
		gridStoreId:null,
		callbackScope:null,
		constructor: function(/*string*/ controller, /*string*/ method, /*string*/ tabId, /*string*/ gridStoreId,/* array of objects or function*/ additionalParams, /*object*/ params) {
			this._executedQueries=[];
			this.autoIdPrefix="_auto_" + Math.floor(Math.random()*100000) + "_";
			// Summary: Create a new data store
			// Description: ...
			// storeId: The id of StoreProvider as provided to DWR in
			//          org.directwebremoting.datasync.Directory.register(storeId, store);
			// params: An optional set of customizations to how the data
			//         is fetched from the store. The options are:
			//         - subscribe: The DwrStore implements dojo.data.api.Notification but will
			//         only send updates if subscribe=true. The updates will be sent in a
			//         timely manner if dwr.engine.setActiveReverseAjax=true.
			this.controller = controller||this.controller;
			this.method = method||this.method;
			this.tabId = tabId||this.tabId;
			this.gridStoreId = gridStoreId||this.gridStoreId;

			if (this.controller == null || typeof this.controller != "string") {
				throw new Error("contoller is null or not a string");
			}
			if (this.method == null || typeof this.method != "string") {
				throw new Error("method is null or not a string");
			}
			var listener = (params && params.subscribe) ? this : null;
			this._clientCache = params && (params.cache !== undefined) ? params.cache : false;
			this.dwrCache = new ec.fisa.dwr.Cache(this.controller, this.method, this.tabId, this.gridStoreId, additionalParams, listener);

			// Important: you'll need to know this to grok the rest of the file.
			// We store data in a set of entries. What we give to the outside as an
			// 'item' is actually just a string aka the id of each entry.
			// Each entry is:
			// { $id:.., $label:.., data:.., updates:.., isDeleted:.., isDirty:.. }
			// $id and $label have $ prefixes because they are partially exposed
			// - itemId: primary key derivative, set to what the server gives us.
			//   If this entry was loaded from the server then $id == itemId
			// - $id: key that is exposed to the client. different to itemId if this
			//   item came from newItem() when we didn't have time to ask for a new ID
			// - $label: is like java.lang.Object.toString. For more details see
			//   org.directwebremoting.io.Item and dojo.data.api.Read.getLabel
			// - data: is what you would expect DWR to return from Java-Land
			// - updates: data that has been altered locally, but not save()d yet
			// - isDeleted: Has this item been deleted?
			// - isDirty: Has this item been updated?
			// The first 3 are sent from the server, the second 3 are client side only

			// We store items against their itemIds in here. Currently the former is
			// going to grow and grow. When do we need to clear it out?
			this._entries = {};
			this._updated = {};

			// We need to generate unique local ids for newItem();
			this._nextLocalId = 0;

			// Should we check the server for fetchItemByIdentity? I think we don't need to.
			this.fastFetchItemByIdentity = true;

			// If we are doing subscription, we want to pass to the server this by reference not by value
			this.$dwrByRef = true;
		},

		getFeatures: function() {
			// Summary: See `dojo.data.api.Read.getFeatures`
			return {
				'dojo.data.api.Write': true,
				'dojo.data.api.Notification': true,
				'dojo.data.api.Identity': true,
				'dojo.data.api.Read': true
			};
		},

		_getAttributeValue: function(/*string*/ id, /*string*/ attribute, /*anything*/ defaultValue) {
			// Summary: Get the entry as indexed by the given id.
			// id: The id of the item (and hence it's data)
			// attribute: The attribute to look for in the data referenced by id
			// defaultValue: The value to return if the attribute could not be found
			var entry = this._entries[id];
			if (entry == null) {
				entry = this._updated[id];
				if (entry == null) {
					throw new Error("non item passed to _getAttributeValue() from [" + arguments.callee.caller + "]: " + id);
				}
			}
			if (attribute == "$id") return entry.$id;
			if (attribute == "$label") return entry.$label;
			var value = entry.updates[attribute];
			if (value === undefined) value = entry.data[attribute];
			if (value === undefined) value = defaultValue;
			return value;
		},

		getValue: function(/*item*/ id, /*string*/ attribute, /*anything*/ defaultValue) {
			// Summary: See `dojo.data.api.Read.getValue`
			var value = this._getAttributeValue(id, attribute, defaultValue);
			return (dojo.isArray(value)) ? null : value;
		},

		getValues: function(/*item*/ id, /*string*/ attribute) {
			// Summary: See `dojo.data.api.Read.getValues`
			var value = this._getAttributeValue(id, attribute, []);
			return (dojo.isArray(value)) ? value : [ value ];
		},

		getAttributes: function(/*item*/ id) {
			// Summary: See `dojo.data.api.Read.getAttributes`
			var entry = this._entries[id];
			if (entry == null) throw new Error("non item passed to getAttributes()");
			var attributes = [ '$id', '$label' ];
			for (var attributeName in entry.data) {
				if (typeof entry.data[attributeName] != "function") {
					attributes.push(attributeName);
				}
			}
			return attributes;
		},

		hasAttribute: function(/*item*/ id, /*string*/ attribute) {
			// Summary: See `dojo.data.api.Read.hasAttribute`
			var value = this._getAttributeValue(id, attribute, undefined);
			return value !== undefined;
		},

		containsValue: function(/*item*/ id, /*string*/ attribute, /*anything*/ value) {
			// Summary: See `dojo.data.api.Read.containsValue`
			var test = this._getAttributeValue(id, attribute, undefined);
			var result = false;
			dojo.forEach(test, function(entry) {
				if (entry == value) {
					result = true;
				}
			});
			return result;//test == value;
		},

		isItem: function(/*anything*/ something) {
			// Summary: See `dojo.data.api.Read.isItem`
			return dojo.isString(something) && this._entries[something] != null;
		},

		isItemLoaded: function(/*anything*/ something) {
			// Summary: See `dojo.data.api.Read.isItemLoaded`
			var entry = this._entries[something];
			return entry != null && entry.data != null;
		},

		loadItem: function(/*object*/ keywordArgs) {
			// Summary: See `dojo.data.api.Read.loadItem`
			// We're not doing lazy loading at this level.
			return true;
		},

		_complete: function(request, total, items) {
			var scope = request.scope || dojo.global;
			if (dojo.isFunction(request.onBegin)) {
				request.onBegin.call(scope, total, request);
			}

			if (dojo.isFunction(request.onItem)) {
				dojo.forEach(items, function(entry) {
					if (!request.aborted) {
						request.onItem.call(scope, entry.$id, request);
					}
				});
			}

			if (dojo.isFunction(request.onComplete) && !request.aborted) {
				if (dojo.isFunction(request.onItem)) {
					request.onComplete.call(scope, null, request);
				}
				else {
					var all = [];
					dojo.forEach(items, function(entry) {
						all.push(entry.$id);
					});
					request.onComplete.call(scope, all, request);
				}
			}
		},

		// Check cache and try a local fetch first
		fetch: function(/*object*/ request) {
			request.aborted = false;
			this._currentQuery = request.query;
			if (this._clientCache) {
				var results = this.getResults();
				var cached = this.isCached(request, results); 
				if (cached != null) {
					var total = cached.found === undefined ? cached._totalMatchedItems : cached.found;
					var results = this.clientSideFetch(request, results);
					this._complete(request, total, this.clientSidePaging(request, results));
					return request;
				}
			}
			return this._fetch(request);
		},

		isCached: function(request, baseResults) {
			if (request.start === undefined) request.start = 0;
			if (request.count === undefined) request.count = 1;
			for (var i = 0; i < this._executedQueries.length; i++) {
				var cachedRequest = this._executedQueries[i];
				var clientQuery = this.querySuperSet(cachedRequest, request);
				if (clientQuery !== false) {
					var found = this.clientSideFetch({start:0, count:Infinity, query:request.query, queryOptions:request.queryOptions}, baseResults).length;
					if (request.start + request.count <= found) {
						delete cachedRequest.found;
						return cachedRequest;
					} else {
						var foundParent = this.clientSideFetch({start:0, count:Infinity, query:cachedRequest.query, queryOptions:cachedRequest.queryOptions}, baseResults).length;
						if (cachedRequest._totalMatchedItems <= foundParent) {
							cachedRequest.found = found; 
							return cachedRequest;
						}
					}
				}
			}
			return null;
		},

		containedInterval: function(init, end, start, finish) {
			if (init > start) return false;
			if (end != Number.POSITIVE_INFINITY) {
				if (end < finish) {
					return false;
				}
			}
			return true;
		},

		querySuperSet: function(argsSuper, argsSub){
			if (argsSuper.query == argsSub.query) {
				return {};
			}

			if (!(argsSub.query instanceof Object && (!argsSuper.query || typeof argsSuper.query == 'object'))) {
				return false;
			}

			var clientQuery = dojo.mixin({}, argsSub.query);
			for (var i in argsSuper.query) {
				if (clientQuery[i] == argsSuper.query[i]) {
					delete clientQuery[i];
				} else if(!(typeof argsSuper.query[i] == 'string' && dojo.data.util.filter.patternToRegExp(argsSuper.query[i]).test(clientQuery[i]))){  
					return false;
				}
			}
			return clientQuery;
		},

		getResults: function() {
			var data = [];
			for (var index in this._entries) {
				data.push(this._entries[index]);
			}
			return data;
		},

		clientSideFetch: function(/*Object*/ request,/*Array*/ baseResults) {
			var results;
			if (request.query) {
				// filter by the query
				results = [];
				for (var i = 0; i < baseResults.length; i++){
					var value = baseResults[i];
					if (value && this.matchesQuery(value, request)) {
						results.push(baseResults[i]);
					}
				}
			} else {
				results = baseResults;
			}
			return results;
		},

		matchesQuery: function(item, request){
			var ignoreCase = false;
			if (request.queryOptions && request.queryOptions.ignoreCase) ignoreCase = request.queryOptions.ignoreCase;
			for(var i in request.query) {
				// if anything doesn't match, than this should be in the query
				var match = request.query[i];
				var value = this.getValue(item.$id, i);
				var test = (typeof match == 'string') && ((match.match(/[\*\.]/) != null) || ignoreCase);
				test = test
				? !dojo.data.util.filter.patternToRegExp(match, ignoreCase).test(value)
						: value != match;
				if (test) {
					return false;
				}
			}
			return true;
		},

		clientSidePaging: function(/*Object*/ request,/*Array*/ baseResults){
			var start = request.start || 0;
			var finalResults = (start || request.count) ? baseResults.slice(start,start + (request.count || baseResults.length)) : baseResults;
			return finalResults; 
		},

		// Fetch items by querying the server
		_fetch: function(/*object*/ request) {
			// Summary: See `dojo.data.api.Read.fetch`
			request = request || {};
			var store = this;

			var qOptions = request.queryOptions ? request.queryOptions : {deep: false, ignoreCase: false};

			if (typeof qOptions.deep == "undefined") {
				qOptions.deep = false;
			}

			if (typeof qOptions.ignoreCase == "undefined") {
				qOptions.ignoreCase = false;
			}

			var region = {
					count: Number.POSITIVE_INFINITY == request.count ? -1 : request.count,
							start: Number.POSITIVE_INFINITY == request.start ? 0 : request.start,
									query: request.query,
									sort: request.sort,
									queryOptions:qOptions
			};
			//this callbackobt has the scope of qtcontroller in case of the fisaqtgrid;
			var callbackObj = {
					callback: function(matchedItems) {
						var originalAbort = request.abort;
						request.abort = function() {
							request.aborted = true;
							if (dojo.isFunction(originalAbort)) {
								originalAbort.call(request);
							}
						};

						store._executedQueries.push(request);
						if(matchedItems==null){
							request._totalMatchedItems =0;
							store._complete(request,request._totalMatchedItems,[]);
						} else {
							dojo.forEach(matchedItems.items.viewedMatches, store._importItem, store);
							request._totalMatchedItems = matchedItems.items.totalMatchCount;
							if(this.updateMsgsPanel){
								this.updateMsgsPanel(matchedItems.msgs);
							}
							//in case totalMatchCount is zero means no report button.
							if(this.reportWdgtId != null){
								var reportWdgt = dijit.byId(this.reportWdgtId);
								if(reportWdgt != null){
									reportWdgt.disableBtns(matchedItems.items.totalMatchCount);
								}
							}


							store._complete(request, matchedItems.items.totalMatchCount, matchedItems.items.viewedMatches);
							/*Correccion TestOne 27 JCVQ 06/05/2013*/
							if(store.callbackScope && store.callbackScope.qtGridId){
								var qtGrid = dijit.byId(store.callbackScope.qtGridId);
								if(qtGrid && dojo.isFunction(qtGrid.correctWidth)){
									qtGrid.correctWidth();
								}
							}
						}

					},

					errorHandler: function(msg, ex) {
						if(dwr.engine._postHook){
							dwr.engine._postHook();
						}
						if (dojo.isFunction(request.onError)) {
							request.onError(ex,request);
						}
					},
					callbackScope:this.callbackScope
			};

			this.dwrCache.viewRegion(region, callbackObj);

			return request;
		},

		close: function(/*dojo.data.api.Request*/ request) {
			// Summary: See `dojo.data.api.Read.close`
			this._entries = {};
			this._updated = {};
			this.dwrCache.unsubscribe({
				exceptionHandler:function(msg, ex) {
					console.error(ex);
				}
			});
		},

		getLabel: function(/*item*/ id) {
			// Summary: See `dojo.data.api.Read.getLabel`
			// org.directwebremoting.io.Item exposes Object#toString as a label on
			// our items if the data implements ExposeToStringToTheOutside.
			try {
				return this._getAttributeValue(id, "$label");
			} catch (err) {
				return "Item was deleted";
			}
		},

		getLabelAttributes: function(/*item*/ id) {
			// Summary: See `dojo.data.api.Read.getLabelAttributes`
			if (!this.isItem(id)) throw new Error("non item passed to getLabelAttributes()");
			return [ "$label" ];
		},

		getIdentity: function(/*item*/ id) {
			// Summary: See `dojo.data.api.Identity.getIdentity`
			// We could just return id, however we should be checking validity, which this does
			try {
				return this._getAttributeValue(id, "$id");
			} catch (error) {
				return null;
			}
		},

		getIdentityAttributes: function(/*item*/ id) {
			// Summary: See `dojo.data.api.Identity.getIdentityAttributes`
			if (!this.isItem(id)) throw new Error("non item passed to getIdentityAttributes()");
			return [ "$id" ];
		},

		fetchItemByIdentity: function(/*object*/ request) {
			// Summary: See `dojo.data.api.Identity.fetchItemByIdentity`
			var scope = request.scope || dojo.global;
			var itemId = request.identity.toString();
			var store = this;

			if (this.fastFetchItemByIdentity) {
				if (dojo.isFunction(request.onItem)) {
					request.onItem.call(scope, itemId);
				}
			}
			else {
				this.dwrCache.viewItem(itemId, {
					callback: function(entry) {
						entry.updates = {};
						entry.isDeleted = false;
						entry.isDirty = false;
						entry.$id = entry.itemId;
						store._entries[entry.$id] = entry;
						delete store._updated[entry.$id];
						if (dojo.isFunction(request.onItem)) {
							request.onItem.call(scope, entry.$id);
						}
					},
					exceptionHandler: function(msg, ex) {
						if (dojo.isFunction(request.onError)) {
							request.onError.call(scope, ex);
						}
					}
				});
			}

			return request;
		},

		_importItem: function(/*item*/ item) {
			// Summary: Utility to take an item as passed by DWR and place it as an
			// entry into the local cache
			item.updates = {};
			item.isDeleted = false;
			item.isDirty = false;
			item.$id = item.itemId;
			item.$label = item.label;
			this._entries[item.$id] = item;
			delete this._updated[item.$id];
		},

		itemRemoved: function(/*StoreProvider*/ source, /*string*/ itemId) {
			// Summary: See `ec.fisa.dwr.StoreChangeListener.itemRemoved`
			var label = this.getLabel(itemId);
			delete this._entries[itemId];
			delete this._updated[itemId];
			if (dojo.isFunction(this.onDelete)) {
				if (console && console.log) console.log("Firing onDelete(", itemId, ",", label, ")");
				this.onDelete(itemId);
			}
		},

		itemAdded: function(/*StoreProvider*/ source, /*Item*/ item) {
			// Summary: See `ec.fisa.dwr.StoreChangeListener.itemAdded`
			if (this._entries[item.itemId] === undefined) {
				this._importItem(item);
				var valid = this.clientSideFetch({start:0, count:Infinity, query:this._currentQuery, queryOptions:{ignoreCase:true}}, [this._entries[item.$id]]).length == 1;
				if (dojo.isFunction(this.onNew) && valid) {
					if (console && console.log) console.log("Firing onNew(", item.itemId, ", null)");
					this.onNew(item.itemId, null);
				}
			}
		},

		itemChanged: function(/*StoreProvider*/ source, /*Item*/ item, /*string[]*/ changedAttributes) {
			// Summary: See `ec.fisa.dwr.StoreChangeListener.itemChanged`
			if (this._updated[item.itemId]) {
				if (console && console.log) console.log("Warning server changes to " + item.itemId + " override local changes");
			}
			this._importItem(item);
			var store = this;
			if (dojo.isFunction(this.onSet)) {
				dojo.forEach(changedAttributes, function(attribute) {
					var oldValue = store._getAttributeValue(item.itemId, attribute);
					if (console && console.log) console.log("Firing onSet(", item.itemId, attribute, oldValue, item.data[attribute], ")");
					store.onSet(item.itemId, attribute, oldValue, item.data[attribute]);
				});
			}
		},

		onSet: function(/*item*/ item, /*string*/ attribute, /*object|array*/ oldValue, /*object|array*/ newValue) {
			// Summary: See `dojo.data.api.Notification.onSet`
			if (console && console.log) console.log("Original onSet function called");
		},

		onNew: function(/*item*/ newItem, /*object?*/ parentInfo) {
			// Summary: See `dojo.data.api.Notification.onNew`
			if (console && console.log) console.log("The store has been notified of an item [" + newItem + "] creation. Are you interested?");
		},

		onDelete:function(/*item*/ deletedItem) {
			// Summary: See `dojo.data.api.Notification.onDelete`
			if (console && console.log) console.log("Original onDelete function called");
		},

		newItem: function(/*object?*/ data, /*object?*/ parentInfo) {
			// Summary: See `dojo.data.api.Write.newItem`
			var entry = {
					itemId: -1,
					//AVI: $id: ec.fisa.dwr.Store.prototype.autoIdPrefix + this._nextLocalId++,
					$id: this.autoIdPrefix + this._nextLocalId++,
					data: data,
					$label: "",
					isDeleted: false,
					isDirty: true,
					updates: data
			};
			this._entries[entry.$id] = entry;
			this._updated[entry.$id] = entry;

			if (dojo.isFunction(this.onNew)) {
				this.onNew(entry.$id, null);
			}

			return entry.$id;
		},

		deleteItem: function(/*item*/ item) {
			// Summary: See `dojo.data.api.Write.onDelete`
			var entry = this._entries[item];
			if (entry == null) throw new Error("non item passed to deleteItem(): " + item);
			delete this._entries[entry.$id];
			entry.isDeleted = true;
			this._updated[entry.$id] = entry;

			if (dojo.isFunction(this.onDelete)) {
				this.onDelete(entry.$id);
			}
		},

		setValue: function(/*item*/ item, /*string*/ attribute, /*anything*/ value) {
			// Summary: See `dojo.data.api.Write.setValue`
			if (value === undefined) throw new Error("value is undefined");
			if (!attribute) throw new Error("attribute is undefined");
			var entry = this._entries[item];
			if (entry == null) throw new Error("non item passed to setValue()");

			entry.updates[attribute] = value;
			entry.data[attribute] = value;
			entry.isDirty = true;
			this._updated[entry.$id] = entry;

			if (dojo.isFunction(this.onSet)) {
				this.onSet(entry.$id, attribute, entry.data[attribute], value);
			}
		},

		setValues: function(/*item*/ item, /*string*/ attribute, /*array*/ values) {
			// Summary: See `dojo.data.api.Write.setValues`
			if (!dojo.isArray(values)) throw new Error("value is not an array");
			if (!attribute) throw new Error("attribute is undefined");
			var entry = this._entries[item];
			if (entry == null) throw new Error("non item passed to setValues()");

			entry.updates[attribute] = values;
			entry.data[attribute] = values;
			entry.isDirty = true;
			this._updated[entry.$id] = entry;

			if (dojo.isFunction(this.onSet)) {
				this.onSet(entry.$id, attribute, entry.data[attribute], values);
			}
		},

		unsetAttribute: function(/*item*/ item, /*string*/ attribute) {
			// Summary: See `dojo.data.api.Write.unsetAttribute`
			if (!attribute) throw new Error("attribute is undefined");
			var entry = this._entries[item];
			if (entry == null) throw new Error("non item passed to unsetAttribute()");

			entry.updates[attribute] = null;
			entry.isDirty = true;
			this._updated[entry.$id] = entry;

			if (dojo.isFunction(this.onSet)) {
				this.onSet(entry.$id, attribute, entry.data[attribute], null);
			}
		},

		save: function(/*object*/ keywordArgs) {
			// Summary: See `dojo.data.api.Write.save`
			var entriesToSend = [];
			var sentEntries = this._updated;
			this._updated = {};
			for (var itemId in sentEntries) {
				var entry = sentEntries[itemId];
				if (entry.isDeleted) {
					entriesToSend.push({
						itemId:itemId,
						attribute:"$delete",
						newValue:null
					});
				} else {
					for (var attribute in entry.updates) {
						entriesToSend.push({
							itemId:itemId,
							attribute:attribute,
							newValue:entry.updates[attribute]
						});
					}
				}
			}
			if (entriesToSend.length > 0) {
				this.dwrCache.update(entriesToSend, {
					callback: function() {
						sentEntries = null;
						if (keywordArgs.onComplete) keywordArgs.onComplete();
					}, exceptionHandler: function(msg, ex) {
						this._updated = dojo.mixin(this._updated, sentEntries); 
						if (keywordArgs.onError) keywordArgs.onError(ex);
					}, scope: keywordArgs.scope
				});
			} else {
				if (console && console.log) console.log("No updates to process");
			}
		},

		getEntryById: function(/*String*/ id) {
			/*Obtiene un entry a partir del id
			 * id: id del entry a ser obtenido. */
			var entry = this._entries[id];
			if (entry == null) {
				entry = this._updated[id];
				if (entry == null) {
					throw new Error("doesn't exist item with id: " + id);
				}
			}

			return entry;
		},

		revert: function() {
			// Summary: See `dojo.data.api.Write.revert`
			for (var id in this._entries) {
				var entry = this._entries[id];
				entry.isDeleted = false;
				entry.isDirty = false;
				entry.updates = {};
			}
			this._updated = {};
			return true;
		},

		isDirty: function(/*item?*/ item) {
			// Summary: See `dojo.data.api.Write.isDirty`
			var entry = this._entries[item];
			if (entry == null) throw new Error("non item passed to isDirty()");
			return entry.isDirty;
		},

		clearCache: function() {
			this._executedQueries = [];
		},
		destroy:function(){
			var dwrCache = this.dwrCache;
			delete this.dwrCache;
			dwrCache.destroy();
			delete this.callbackScope;
			delete this._executedQueries;
			delete this._entries;
			delete this._currentQuery;
			delete this._clientCache;
		},
		setCallbackScope:function(callbackScope){
			var callback = callbackScope || {};
			this.callbackScope = callback;
		},
		getAdditionalParams:function(){
			return this.dwrCache.doGetAdditionalParameters();//Mantis 18517 JCVQ
		},
		setAdditionalParams:function(additionalParams){
			this.dwrCache.additionalParams=additionalParams;
		}
	});
	return DWRStore;
});

//vim:ts=4:noet:tw=0:

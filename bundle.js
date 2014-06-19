(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//
// btClass
// No dependancies to function as needed in Node or browser.
//

/**
 * btClass
 * Extensible base class with type tracking.
 * Each inheritor can be extended via their `extend` method.
 */
var btClass = function(props,type) {
	for (var p in props) this[p] = props[p];
	if (this.types===undefined) this.types = [];
	if (type!==undefined) {
		if (type instanceof Array) this.types = type;
		else this.types.push(type);
	}
};
//
// static methods...
//
/**
 * Extend a class prototype and optionally add new methods.
 * @param extending Object, object to copy prototype from.
 * @param inheriting Object, object to copy prototype to.
 * @param methods Array, list of methods to be added to inheriting prototype.
 */
btClass.extend = function(extending, inheriting, methods) {
	var proto = function(){};
	proto.prototype = extending.prototype;
	inheriting.prototype = new proto();
	inheriting.prototype.constructor = inheriting; // point to correct constructor.
	if (methods) for (var m in methods) inheriting.prototype[m] = methods[m];
};
/**
 * Confirms passed arguments are functions.
 */
btClass.isFn = function() {
	var verdict = true;
	for (var a=0; verdict && (a < arguments.length); a++) {
		var v = arguments[a];
		verdict = verdict && (v instanceof Function);
	}
	return verdict;
};
/**
 * Confirms passed arguments are objects.
 */
btClass.isObj = function() {
	var verdict = true;
	for (var a=0; verdict && (a < arguments.length); a++) {
		var v = arguments[a];
		verdict = verdict && (v instanceof Object);
	}
	return verdict;
};
/**
 * Confirms passed arguments are array objects.
 */
btClass.isArray = function() {
	var verdict = true;
	for (var a=0; verdict && (a < arguments.length); a++) {
		var v = arguments[a];
		verdict = verdict && (v instanceof Array);
	}
	return verdict;
};
/**
 * Confirms passed arguments contain numbers.
 */
btClass.isNumber = function() {
	var verdict = true;
	for (var a=0; verdict && (a < arguments.length); a++) {
		var v = arguments[a];
		verdict = verdict && !isNaN(parseFloat(v)) && isFinite(v);
	}
	return verdict
};
/** 
 * Clone passed object, array or primitive.
 */
btClass.clone = function(v) {
	if (btClass.isArray(v)) {
		//return v.slice(); // can't do this, because it might copy refs.
		var clone = [];
		for (var p=0; p < v.length; p++) clone[p] = btClass.clone(v[p]);
		return clone;
	} else
	if (btClass.isObj(v)) {
		var clone = {};
		for (var p in v) clone[p] = btClass.clone(v[p]);
		return clone;
	} else
	if (typeof(v)=='string') {
		return v+'';
	} else
	if (typeof(v)=='number') {
		return v+0;
	}
	return v;
};



// Export as Node module
/*if (module!==undefined && module.exports!==undefined)*/ module.exports = btClass;
},{}],2:[function(require,module,exports){
//
// btDelta
// Requires: btClass
//
/*if (require!==undefined)*/ require('./btClass.js');

//
// btDelta
// Delta object compression, with forwards-only, or reversible formats.
// requires: btClass
//
var btDelta = function(props, types) {
	if (!types) types = []; types.push('btDelta');
	btDelta._super.call(this,props,types);
	this.INSERT = 'i'; // insertion indicator
	this.UPDATE = 'u'; // update indicator
	this.DELETE = 'd'; // delete indicator
	this.CHANGE_KEY = 'ch'; // name of change hierarchy property
};
btDelta._super = btClass;
btClass.extend(btDelta._super, btDelta, {
	// add btClass static method refs to this prototype for quick access
	isFn : btClass.isFn,
	isObj : btClass.isObj,
	isArray : btClass.isArray,
	isNumber : btClass.isNumber,
	clone : btClass.clone,
	/**
	 * Gets node at path in parent object.
	 * @param path Array|String, path of node to find in parent (string must start with '/').
	 * @param parent Object, parent object to find node of.
	 * @returns mixed, node found at path.
	 */
	getNodeAtPath : function(path, parent) {
		if (typeof(path)==='string') path = path.substr(1).split('/');
		var node = parent;
		if (btClass.isArray(path) && path.length) {
			for (var p=0; p < path.length; p++) {
				var prop = path[p];
				node = node[prop];
			}
		}
		return node;
	}
});

//
// btDelta.delta1d
// Forwards-only delta format
//
btDelta['delta1d'] = function(props, types) {
	if (!types) types = []; types.push('delta1d');
	btDelta.delta1d._super.call(this,props,types);
	this.REMOVE_KEY = 'rm'; // name of removal hierarchy property
};
btDelta.delta1d._super = btDelta;
btClass.extend(btDelta.delta1d._super, btDelta.delta1d, {
	/**
	 * Adds new delta changes to old delta.
	 */
	mergeChanges : function(newChange, oldDelta, path) {
		if (this.verbose > 1) console.log(
			"btDelta.delta1d.mergeChanges(",
				"newChange:",btClass.clone(newChange),
				"oldDelta:",btClass.clone(oldDelta),
				"path:",path,
			")"
		);
		if (!path) path = [];
		var newChLoc = newChange,
			oldChLoc = oldDelta;
		if (oldDelta[this.CHANGE_KEY]!==undefined)
		if (oldDelta[this.REMOVE_KEY]!==undefined) {
			oldChLoc = oldDelta[this.CHANGE_KEY];
		}
		if (this.verbose > 2) console.log(
			"btDelta.delta1d.mergeChanges |",
			"newChLoc:",btClass.clone(newChLoc),
			"oldChLoc:",btClass.clone(oldChLoc),
			"path:",path
		);
		for (var key in newChLoc) {
			var thisPath = btClass.clone(path),
				thisNewChLoc = newChLoc[key];
			thisPath.push(key);
			if (this.verbose > 2) console.log(
				"btDelta.delta1d.mergeChanges ||",
				"thisNewChLoc:",btClass.clone(thisNewChLoc),
				"path:",thisPath
			);
			if (this.isObj(thisNewChLoc)) {
				// create new branch if missing from oldDelta
				if (oldChLoc[key]===undefined) {
					oldChLoc[key] = {};
					if (this.verbose > 3) console.log(
						"btDelta.delta1d.mergeChanges |||",
						"creating missing branch at path",thisPath,
						"oldChLoc:",btClass.clone(oldChLoc)
					);
				}
				var thisOldChLoc = oldChLoc[key];
				if (this.verbose > 3) console.log(
					"btDelta.delta1d.mergeChanges ||",
					"drilling into branch.",
					"newChLoc:",btClass.clone(newChLoc),
					"thisOldChLoc:",btClass.clone(thisOldChLoc),
					"path:",thisPath
				);
				// drill into branch.
				this.mergeChanges(thisNewChLoc,thisOldChLoc,thisPath);
			} else {
				if (this.verbose > 3) console.log(
					"btDelta.delta1d.mergeChanges ||",
					"applying changes to old delta.",
					"newChLoc:",btClass.clone(thisNewChLoc),
					"oldChLoc:",btClass.clone(oldChLoc),
					"path:",thisPath
				);
				// apply change to oldDelta.
				oldChLoc[key] = thisNewChLoc;
			}
		}
	},
	/**
	 * Adds new delta removes to old delta.
	 */
	mergeRemoves : function(newRemove, oldDelta, path) {
		if (this.verbose > 1) console.log(
			"btDelta.delta1d.mergeRemoves(",
				"newRemove:",newRemove,
				"oldDelta:",oldDelta,
				"path:",path,
			")"
		);
		if (!path) path = [];
		var newRmLoc = newRemove,
			oldRmLoc = oldDelta;
		if (oldDelta[this.CHANGE_KEY]!==undefined)
		if (oldDelta[this.REMOVE_KEY]!==undefined) {
			oldRmLoc = oldDelta[this.REMOVE_KEY];
		}
		for (var key in newRmLoc) {
			var thisPath = btClass.clone(path),
				thisNewRmLoc = newRmLoc[key];
			thisPath.push(key);
			if (this.isObj(thisNewRmLoc)) {
				// create new branch if missing from oldDelta
				if (oldRmLoc[key]===undefined) {
					oldRmLoc[key] = {};
				}
				var thisOldRmLoc = oldRmLoc[key];
				// drill into branch.
				this.mergeRemoves(thisNewRmLoc,thisOldRmLoc,thisPath);
			} else {
				// apply remove to oldDelta.
				oldRmLoc[key] = thisNewRmLoc;
			}
		}
	},
	/**
	 * Creates a blank delta object.
	 */
	newDelta : function() {
		var d = {};
		d[this.CHANGE_KEY] = {}; // change hierarchy.
		d[this.REMOVE_KEY] = {}; // remove hierarchy.
		return d;
	},
	//
	// # Manually specify delta changes...
	//
	/**
	 * Apply change to an object and record it in a delta simultaneously.
	 * Can produce more efficient results for expensive-to-detect changes, like simply
	 * removing an index from the middle or beginning of an array.
	 * 
	 * The change descriptor should adhere to the following format...
	 *	{
	 *		'p':'/path/in/obj/hierarchy',	// path of node
	 *		'c':'I',						// type of change
	 *		'v':'whatever' (if applicable)	// node value
	 *	}
	 * 
	 * @param change Object, change descriptor object.
	 * @param obj Object, object to apply described change to.
	 * @param delta Object, (optional) delta to register change description with.
	 * @returns Object, updated/new delta object.
	 */
	changeObjAndDelta : function(change, obj, delta) {
		if (this.verbose > 1) console.log(
			"btDelta.delta1d.changeObjAndDelta(",
				"change:",change,
				"obj:",obj,
				"delta:",delta,
			")"
		);
		// Start new delta for this specific change.
		// (otherwise we will repeat any previously established changes at path)
		var thisDelta = this.newDelta();
		//
		// Process change descriptor.
		//
		var path = change.p,
			newValue = change.v,
			change = change.c;
		if (typeof(path)==='string') path = path.substr(1).split('/');
		
		// Nothing to do if path not specified or empty.
		if (path===undefined || !this.isArray(path) || !path.length) {
			throw new Error(
				"btDelta.delta1d.changeObjAndDelta ERROR: "+
				"No valid property path specified."
			);
			return false;
		}
		
		//
		// Navigate to specified path in object and delta.
		// Create any missing locations in delta along the way.
		// Stop at parent of change location.
		//
		var objLoc = obj,
			changeLoc = thisDelta[this.CHANGE_KEY]; // start from root of change hierarchy.
			removeLoc = thisDelta[this.REMOVE_KEY]; // start from root of remove hierarchy.
		for (var p=0; p < path.length-1; p++) {
			var prop = path[p];
			objLoc = objLoc[prop];
			if (change===this.DELETE) {
				if (removeLoc[prop]===undefined) removeLoc[prop] = {};
				removeLoc = removeLoc[prop];
			} else {
				if (changeLoc[prop]===undefined) changeLoc[prop] = {};
				changeLoc = changeLoc[prop];
			}
		}
		var lastProp = path[p];
		if (this.verbose > 2) console.log(
			"btDelta.delta1d.changeObjAndDelta |",
			"change/remove structure created",
			"thisDelta["+this.REMOVE_KEY+"]:",btClass.clone(thisDelta[this.REMOVE_KEY]),
			"thisDelta["+this.CHANGE_KEY+"]:",btClass.clone(thisDelta[this.CHANGE_KEY]),
			"lastProp:",lastProp
		);
		
		//
		// Add change to delta change or remove hierarchy.
		// Apply change to object.
		//
		if (change===this.DELETE) {
			removeLoc[lastProp] = 0;
			objLoc = this.applyRemove(removeLoc,objLoc);
		} else {
			changeLoc[lastProp] = newValue;
			objLoc = this.applyChange(changeLoc,objLoc);
		}
		
		if (this.verbose > 2) console.log(
			"btDelta.delta1d.changeObjAndDelta |",
			"applied delta to object",
			"removeLoc:",removeLoc,
			"changeLoc:",changeLoc
		);
		
		// If no delta passed, thisDelta is our new delta.
		// Otherwise merge new delta into old.
		if (!delta) delta = thisDelta;
		else {
			if (change===this.DELETE) this.mergeRemoves(thisDelta[this.REMOVE_KEY],delta);
			else this.mergeChanges(thisDelta[this.CHANGE_KEY],delta);
			/*if (Object.getOwnPropertyNames(changeLoc).length) this.mergeChanges(changeLoc,delta);
			if (Object.getOwnPropertyNames(removeLoc).length) this.mergeRemoves(removeLoc,delta);*/
		}
		
		return delta;
	},
	//
	// ## Shortcut methods...
	//
	/**
	 * doUpdateItem
	 * Updates value of item at location in model and describes change in delta.
	 * @param newValue Mixed, new value to assign item.
	 * @param itemAt Number|String, index/key of item to update.
	 * @param inParentPath String|Array, path in model to parent of item to update.
	 * @param obj Object, object to apply change to.
	 * @param delta Object, (optional) delta to record change to.
	 * @returns Object, updated/new delta object.
	 */
	'doUpdateItem' : function(newValue, itemAt, inParentPath, obj, delta) {
		if (this.verbose) console.log(
			"btDelta.delta1d.doDeleteItem(",
				"newValue:",newValue,
				"itemAt:",itemAt,
				"inParentPath:",inParentPath,
				"obj:",obj,
				"delta:",delta,
			")"
		);
		//
		// Describe update request.
		//
		if (typeof(inParentPath)==='string') inParentPath = inParentPath.substr(1).split('/');
		var updateItemPath = this.clone(inParentPath);
		updateItemPath.push(itemAt);
		var change = { 'c':this.UPDATE, 'p':updateItemPath, 'v':newValue };
		return this.changeObjAndDelta(change, obj, delta);
	},
	/**
	 * doInsertItem
	 * Insert value at location in model and describes change in delta.
	 * @param value Mixed, value of inserted item.
	 * @param insertAt Number|String, index/key to insert item.
	 * @param inParentPath String|Array, path in model to parent to add item to.
	 * @param obj Object, object to apply change to.
	 * @param delta Object, (optional) delta to record change to.
	 * @returns Object, updated/new delta object.
	 */
	'doInsertItem' : function(value, insertAt, inParentPath, obj, delta) {
		if (this.verbose) console.log(
			"btDelta.delta1d.doDeleteItem(",
				"value:",value,
				"insertAt:",insertAt,
				"inParentPath:",inParentPath,
				"obj:",obj,
				"delta:",delta,
			")"
		);
		//
		// Describe insert request.
		//
		if (typeof(inParentPath)==='string') inParentPath = inParentPath.substr(1).split('/');
		var insertItemPath = this.clone(inParentPath);
		insertItemPath.push(insertAt);
		var change = { 'c':this.INSERT, 'p':insertItemPath, 'v':value };
		return this.changeObjAndDelta(change, obj, delta);
	},
	/**
	 * doDeleteItem
	 * Removes item at location in model and describes change efficiently in delta.
	 * @param deleteFrom Number|String, index/key of item to delete.
	 * @param inParentPath String|Array, path in model to parent of item to delete.
	 * @param obj Object, object to apply change to.
	 * @param delta Object, (optional) delta to record change to.
	 * @returns Object, updated/new delta object.
	 */
	'doDeleteItem' : function(deleteFrom, inParentPath, obj, delta) {
		if (this.verbose) console.log(
			"btDelta.delta1d.doDeleteItem(",
				"deleteFrom:",deleteFrom,
				"inParentPath:",inParentPath,
				"obj:",obj,
				"delta:",delta,
			")"
		);
		//
		// Describe deletion request.
		//
		if (typeof(inParentPath)==='string') inParentPath = inParentPath.substr(1).split('/');
		var deleteItemPath = this.clone(inParentPath);
		if (this.verbose > 1) console.log(
			"btDelta.delta1d.doDeleteItem |",
			"inParentPath:",btClass.clone(inParentPath),
			"deleteItemPath:",btClass.clone(deleteItemPath)
		);
		deleteItemPath.push(deleteFrom);
		var change = { 'c':this.DELETE, 'p':deleteItemPath };
		return this.changeObjAndDelta(change, obj, delta);
	},
	/**
	 * doMoveItem
	 * Move item at location in model and describe the change efficiently in delta.
	 * @param moveFrom String|Number, index/key of item to move.
	 * @param moveTo String|Number, index/key to move to.
	 * @param inParentPath String|Array, path of parent array property in model.
	 * @param obj Object, object to apply change to.
	 * @param delta Object, (optional) delta to record change to.
	 * @returns Object, updated/new delta object.
	 */
	'doMoveItem' : function(moveFrom, moveTo, inParentPath, obj, delta) {
		if (this.verbose) console.log(
			"btDelta.delta1d.doMoveItem(",
				"moveFrom:",moveFrom,
				"moveTo:",moveTo,
				"inParentPath:",inParentPath,
				"obj:",obj,
				"delta:",delta,
			")"
		);
		//
		// Result of move is most efficiently described as two updates.
		// Each item will be stored in the delta cache, to avoid repetition of
		// redundant old and new states.
		//
		if (!delta) delta = this.newDelta();
		if (typeof(inParentPath)==='string') inParentPath = inParentPath.substr(1).split('/');
		var parentNode = this.getNodeAtPath(inParentPath, obj),
			moveFromPath = this.clone(inParentPath),
			moveToPath = this.clone(inParentPath);
		moveFromPath.push(moveFrom);
		moveToPath.push(moveTo);
		var moveFromItem = this.getNodeAtPath(moveFromPath,obj),
			moveToItem = this.getNodeAtPath(moveToPath,obj),
			changes = [
				{ 'c':this.UPDATE, 'p':moveFromPath, 'v':moveToItem },
				{ 'c':this.UPDATE, 'p':moveToPath, 'v':moveFromItem }
			];
		this._rootDelta = delta; // must register our delta as root for cache lookups.
		for (var c=0; c < changes.length; c++) {
			delta = this.changeObjAndDelta(changes[c], obj, delta);
		}
		return delta;
	},
	//
	// Delta-find logic...
	//
	/**
	 * Public comparison function to pass objects to.
	 */
	'compare' : function(oldObj, newObj) {
		var delta = this.compareObjs(oldObj, newObj),
			output = {};
		output[this.CHANGE_KEY] = delta[0];
		output[this.REMOVE_KEY] = delta[1];
		return output;
	},
	/**
	 * Returns delta object for the passed old and new objects.
	 */
	compareObjs : function(oldObj, newObj) {
		if (this.verbose > 1) console.log(
			"btDelta.delta1d.compareObjs(",
				"oldObj:",btClass.clone(oldObj),
				"newObj:",btClass.clone(newObj),
			")"
		);
		var theseChanges = {},
			theseDeletes = {};
		// loop through old object to find changes and deletions.
		if (oldObj!==undefined)
		for (var oldK in oldObj) {
			var oldV = oldObj[oldK],
				newV = newObj[oldK];
			// objects are considered branches, to be traversed for changes/deletions.
			// ignore values that are functions.
			if (!this.isFn(oldV) && !this.isFn(newV))
			if (this.isObj(oldV) && this.isObj(newV)) {
				if (this.verbose > 2) console.log(
					"btDelta.delta1d.compareObjs | drilling into retained branch."
				);
				// drill into retained branch.
				var branchDelta = this.compareObjs(oldV,newV),
					hasChanges = Object.getOwnPropertyNames(branchDelta[0]).length,
					hasDeletes = Object.getOwnPropertyNames(branchDelta[1]).length;
				if (hasChanges) theseChanges[oldK] = branchDelta[0];
				if (hasDeletes) theseDeletes[oldK] = branchDelta[1];
			} else if (this.isObj(oldV) && newV!==undefined) {
				if (this.verbose > 2) console.log(
					"btDelta.delta1d.compareObjs | removing old branch."
				);
				// old branch removed
				theseDeletes[oldK] = 0;
			} else if (oldV!==undefined && this.isObj(newV)) {
				if (this.verbose > 2) console.log(
					"btDelta.delta1d.compareObjs | adding new branch."
				);
				// new branch added
				theseChanges[oldK] = newV;
			} else {
				// compare values
				var diff = this.compareVals(oldV,newV);
				if (this.verbose > 2) console.log(
					"btDelta.delta1d.compareObjs | comparing values:",diff
				);
				// if invalid or unchanged, do not add to either result.
				if (diff) {
					// difference detected.
					if (diff===this.DELETE) {
						if (this.verbose > 3) console.log(
							"btDelta.delta1d.compareObjs || deleting value."
						);
						theseDeletes[oldK] = 0;
					} else {
						if (this.verbose > 3) console.log(
							"btDelta.delta1d.compareObjs || applying new/changed value."
						);
						theseChanges[oldK] = newV;
					}
				} else {
					// remove unchanged value from changes.
					if (theseChanges[oldK]!==undefined) {
						if (this.verbose > 3) console.log(
							"btDelta.delta1d.compareObjs || removing value."
						);
						delete theseChanges[oldK];
					} else {
						if (this.verbose > 3) console.log(
							"btDelta.delta1d.compareObjs || ignoring value."
						);
					}
				}
			}
		}
		// loop through new model to find additions.
		for (var newK in newObj)
		if (!oldObj || oldObj[newK]===undefined) {
			var newV = newObj[newK];
			if (!this.isFn(newV))
			if (this.isObj(newV)) {
				if (this.verbose > 2) console.log(
					"btDelta.delta1d.compareObjs | drilling into new branch."
				);
				// drill into new branch.
				var branchDelta = this.compareObjs(null,newV);
				theseChanges[newK] = branchDelta[0];
			} else {
				if (this.verbose > 2) console.log(
					"btDelta.delta1d.compareObjs | adding new value."
				);
				// define new value in changes.
				theseChanges[newK] = newV;
			}
		}
		if (this.verbose > 1) console.log(
			"btDelta.delta1d.compareObjs |",
			"changes:",theseChanges,
			"deletes:",theseDeletes
		);
		return [theseChanges,theseDeletes];
	},
	/**
	 * Return diff description for the passed values.
	 * @param oldVal mixed
	 * @param newVal mixed
	 * @returns change-type | false, false if no change or either value is invalid.
	 */
	compareVals : function(oldVal, newVal) {
		// if values match no change was made.
		if (oldVal==newVal) return false;
		// determine type of change.
		if (this.isFn(oldVal) || this.isFn(newVal)) return false;
		if (newVal!==undefined && oldVal===undefined) return this.UPDATE;
		if (newVal===undefined && oldVal!==undefined) return this.DELETE;
		return this.UPDATE;
	},
	//
	// Delta-apply logic...
	//
	/**
	 * Apply delta to obj.
	 * @param delta Object, changes to apply.
	 * @param obj Object, subject to apply changes to.
	 */
	'applyDeltaToObj' : function(delta, obj) {
		if (this.verbose) console.log(
			"btDelta.delta1d.applyDeltaToObj(",
				"delta:",btClass.clone(delta),
				"obj:",btClass.clone(obj),
			")"
		);
		var result = btClass.clone(obj);
		if (delta[this.REMOVE_KEY]!==undefined) result = this.applyRemove(delta[this.REMOVE_KEY],result);
		if (delta[this.CHANGE_KEY]!==undefined) result = this.applyChange(delta[this.CHANGE_KEY],result);
		return result;
	},
	applyChange : function(delta, obj) {
		for (var k in delta) {
			if (this.isObj(delta[k])) {
				// traverse branch
				if (obj[k]===undefined) obj[k] = {};
				obj[k] = this.applyChange(delta[k],obj[k]);
			} else {
				// apply change
				obj[k] = delta[k];
			}
		}
		return obj;
	},
	applyRemove : function(delta, obj) {
		for (var k in delta) {
			if (this.isObj(delta[k])) {
				// traverse branch
				obj[k] = this.applyRemove(delta[k],obj[k]);
			} else
			if (delta[k]==0) {
				if (this.isArray(obj)) {
					// remove item from array.
					obj.splice(k,1);
				} else {
					// remove item from object.
					delete obj[k];
				}
			}
		}
		return obj;
	}
});

//
// btDelta.delta2d 
// Reversible delta format
// Features re-used object cache for increased efficiency.
//
btDelta['delta2d'] = function(props, types) {
	if (!types) types = []; types.push('delta2d');
	btDelta.delta2d._super.call(this,props,types);
	this.DELTA_KEY = 'd'; // delta-indicator key
	this.DELTA_VAL = '$'; // delta-indicator value
	this.CACHE_KEY = 'ca'; // name of cache store property.
	this.CACHE_PRE = '$d'; // cache key prefix.
};
btDelta.delta2d._super = btDelta;
btClass.extend(btDelta.delta2d._super, btDelta.delta2d, {
	/**
	 * Confirms that the passed arguments are delta cache keys.
	 */
	isCacheKey : function() {
		var verdict = true;
		for (var a=0; verdict && (a < arguments.length); a++) {
			var v = arguments[a];
			verdict = verdict && (typeof(v)==='string') && (v.substr(0,2)==this.CACHE_PRE);
		}
		return verdict;
	},
	/**
	 * Confirms that passed arguments are change-leaf objects.
	 */
	isChangeLeaf : function(val) {
		var verdict = true;
		for (var a=0; verdict && (a < arguments.length); a++) {
			var v = arguments[a];
			verdict = verdict &&
				((v[this.DELTA_KEY]!==undefined) && (v[this.DELTA_KEY]===this.DELTA_VAL)) && // contains delta indicator?
				((v.v!==undefined) || (v.o!==undefined)) && // contains old or new value?
				(v.c!==undefined); // contains change type?
		}
		return verdict;
	},
	/**
	 * Adds new delta changes to old delta.
	 */
	mergeDeltas : function(newDelta, oldDelta, path) {
		if (this.verbose > 1) console.log(
			"btDelta.delta2d.mergeDeltas(",
				"newDelta:",newDelta,
				"oldDelta:",oldDelta,
				"path:",path,
			")"
		);
		if (!path) path = [];
		var newLoc = newDelta,
			oldLoc = oldDelta;
		if (newDelta[this.CHANGE_KEY]!==undefined) {
			newLoc = newDelta[this.CHANGE_KEY];
			oldLoc = oldDelta[this.CHANGE_KEY];
		}
		for (var key in newDelta) {
			path.push(key);
			newLoc = newDelta[key];
			if (this.isChangeLeaf(newLoc)) {
				// apply change-leaf to oldDelta.
				oldLoc[key] = newLoc;
			} else
			if (this.isObj(newLoc)) {
				// create new branch if missing from oldDelta
				if (oldDelta[key]===undefined) {
					oldDelta[key] = {};
				}
				oldLoc = oldDelta[key];
				// drill into branch.
				this.mergeDeltas(newLoc,oldLoc,path);
			}
		}
	},
	/**
	 * Creates a blank delta object.
	 */
	newDelta : function() {
		var d = {};
		d[this.CHANGE_KEY] = {}; // change hierarchy.
		return d;
	},
	//
	// ## Cached objects
	// Reduces inefficiency of swapping objects.
	//
	/**
	 * Add item to the passed delta's object cache.
	 * Returns new delta-cache-id.
	 */
	addToCache : function(cacheMe, delta) {
		if (!delta) delta = this.newDelta();
		if (delta[this.CACHE_KEY]===undefined) delta[this.CACHE_KEY] = [];
		delta[this.CACHE_KEY].push(cacheMe);
		return this.CACHE_PRE+delta[this.CACHE_KEY].length;
	},
	/**
	 * Returns requested item from delta cache.
	 */
	getFromCache : function(key, delta) {
		if (!delta && this._rootDelta) delta = this._rootDelta;
		if (delta && delta[this.CACHE_KEY]) {
			key = key.replace(this.CACHE_PRE,'')-1;
			return delta[this.CACHE_KEY][key];
		}
	},
	//
	// # Manually specify delta changes...
	//
	/**
	 * Apply change to an object and record it in a delta simultaneously.
	 * Can produce more efficient results for expensive-to-detect changes, like simply
	 * removing an index from the middle or beginning of an array.
	 * 
	 * The change descriptor should adhere to the following format...
	 *	{
	 *		'p':'/path/in/obj/hierarchy',	// path of node
	 *		'c':'I',						// type of change
	 *		'v':'whatever' (if applicable)	// node value
	 *	}
	 * 
	 * @param change Object, change descriptor object.
	 * @param obj Object, object to apply described change to.
	 * @param delta Object, (optional) delta to register change description with.
	 * @returns Object, updated/new delta object.
	 */
	changeObjAndDelta : function(change, obj, delta) {
		if (this.verbose > 1) console.log(
			"btDelta.delta2d.changeObjAndDelta(",
				"change:",change,
				"obj:",obj,
				"delta:",delta,
			")"
		);
		// Start new delta for this specific change.
		// (otherwise we will repeat any previously established changes at path)
		var thisDelta = this.newDelta();
		//
		// Process change descriptor.
		//
		var path = change.p,
			newValue = change.v,
			oldValue = change.o,
			change = change.c;
		if (typeof(path)==='string') path = path.substr(1).split('/');
		
		// Nothing to do if path not specified or empty.
		if (path===undefined || !this.isArray(path) || !path.length) {
			throw new Error(
				"btDelta.delta2d.changeObjAndDelta ERROR: "+
				"No valid property path specified."
			);
			return false;
		}
		
		//
		// Navigate to specified path in object and delta.
		// Create any missing locations in delta along the way.
		// Stop at parent of change location.
		//
		var objLoc = obj,
			deltaLoc = thisDelta[this.CHANGE_KEY]; // start from root of change hierarchy.
		for (var p=0; p < path.length-1; p++) {
			var prop = path[p];
			objLoc = objLoc[prop];
			if (deltaLoc[prop]===undefined) deltaLoc[prop] = {};
			deltaLoc = deltaLoc[prop];
		}
		var lastProp = path[p];
		
		//
		// Create change-leaf object to add to delta.
		//
		var changeLeaf = { 'c':change };
		changeLeaf[this.DELTA_KEY] = this.DELTA_VAL;
		if (change==this.DELETE) {
			// delete needs to record removed value.
			changeLeaf['v'] = oldValue || objLoc[lastProp];
		} else
		if (change==this.INSERT) {
			// insert needs only record new value.
			changeLeaf['v'] = newValue;
		} else {
			// update must record both new and old values.
			changeLeaf['o'] = oldValue || objLoc[lastProp];
			changeLeaf['v'] = newValue;
		}
		deltaLoc[lastProp] = changeLeaf;
		if (this.verbose > 2) console.log(
			"btDelta.delta2d.changeObjAndDelta |",
			"produced changeLeaf:",changeLeaf
		);
		
		//
		// Apply delta to object.
		//
		objLoc = this.applyDelta(deltaLoc, objLoc); // the delta passed here can be weird?
		
		// If no delta passed, thisDelta is our new delta.
		// Otherwise merge new delta into old.
		if (!delta) delta = thisDelta;
		else this.mergeDeltas(thisDelta,delta);
		
		return delta;
	},
	//
	// ## Shortcut methods...
	//
	/**
	 * doUpdateItem
	 * Updates value of item at location in model and describes change in delta.
	 * @param newValue Mixed, new value to assign item.
	 * @param itemAt Number|String, index/key of item to update.
	 * @param inParentPath String|Array, path in model to parent of item to update.
	 * @param obj Object, object to apply change to.
	 * @param delta Object, (optional) delta to record change to.
	 * @returns Object, updated/new delta object.
	 */
	'doUpdateItem' : function(newValue, itemAt, inParentPath, obj, delta) {
		if (this.verbose) console.log(
			"btDelta.delta2d.doDeleteItem(",
				"newValue:",newValue,
				"itemAt:",itemAt,
				"inParentPath:",inParentPath,
				"obj:",obj,
				"delta:",delta,
			")"
		);
		//
		// Describe update request.
		//
		if (typeof(inParentPath)==='string') inParentPath = inParentPath.substr(1).split('/');
		var updateItemPath = this.clone(inParentPath);
		updateItemPath.push(itemAt);
		var change = { 'c':this.UPDATE, 'p':updateItemPath, 'v':newValue };
		return this.changeObjAndDelta(change, obj, delta);
	},
	/**
	 * doInsertItem
	 * Insert value at location in model and describes change in delta.
	 * @param value Mixed, value of inserted item.
	 * @param insertAt Number|String, index/key to insert item.
	 * @param inParentPath String|Array, path in model to parent to add item to.
	 * @param obj Object, object to apply change to.
	 * @param delta Object, (optional) delta to record change to.
	 * @returns Object, updated/new delta object.
	 */
	'doInsertItem' : function(value, insertAt, inParentPath, obj, delta) {
		if (this.verbose) console.log(
			"btDelta.delta2d.doDeleteItem(",
				"value:",value,
				"insertAt:",insertAt,
				"inParentPath:",inParentPath,
				"obj:",obj,
				"delta:",delta,
			")"
		);
		//
		// Describe insert request.
		//
		if (typeof(inParentPath)==='string') inParentPath = inParentPath.substr(1).split('/');
		var insertItemPath = this.clone(inParentPath);
		insertItemPath.push(insertAt);
		var change = { 'c':this.INSERT, 'p':insertItemPath, 'v':value };
		return this.changeObjAndDelta(change, obj, delta);
	},
	/**
	 * doDeleteItem
	 * Removes item at location in model and describes change efficiently in delta.
	 * @param deleteFrom Number|String, index/key of item to delete.
	 * @param inParentPath String|Array, path in model to parent of item to delete.
	 * @param obj Object, object to apply change to.
	 * @param delta Object, (optional) delta to record change to.
	 * @returns Object, updated/new delta object.
	 */
	'doDeleteItem' : function(deleteFrom, inParentPath, obj, delta) {
		if (this.verbose) console.log(
			"btDelta.delta2d.doDeleteItem(",
				"deleteFrom:",deleteFrom,
				"inParentPath:",inParentPath,
				"obj:",obj,
				"delta:",delta,
			")"
		);
		//
		// Describe deletion request.
		//
		if (typeof(inParentPath)==='string') inParentPath = inParentPath.substr(1).split('/');
		var deleteItemPath = this.clone(inParentPath);
		if (this.verbose > 1) console.log(
			"btDelta.delta2d.doDeleteItem |",
			"inParentPath:",btClass.clone(inParentPath),
			"deleteItemPath:",btClass.clone(deleteItemPath)
		);
		deleteItemPath.push(deleteFrom);
		var change = { 'c':this.DELETE, 'p':deleteItemPath };
		return this.changeObjAndDelta(change, obj, delta);
	},
	/**
	 * doMoveItem
	 * Move item at location in model and describe the change efficiently in delta.
	 * @param moveFrom String|Number, index/key of item to move.
	 * @param moveTo String|Number, index/key to move to.
	 * @param inParentPath String|Array, path of parent array property in model.
	 * @param obj Object, object to apply change to.
	 * @param delta Object, (optional) delta to record change to.
	 * @returns Object, updated/new delta object.
	 */
	'doMoveItem' : function(moveFrom, moveTo, inParentPath, obj, delta) {
		if (this.verbose) console.log(
			"btDelta.delta2d.doMoveItem(",
				"moveFrom:",moveFrom,
				"moveTo:",moveTo,
				"inParentPath:",inParentPath,
				"obj:",obj,
				"delta:",delta,
			")"
		);
		//
		// Result of move is most efficiently described as two updates.
		// Each item will be stored in the delta cache, to avoid repetition of
		// redundant old and new states.
		//
		if (!delta) delta = this.newDelta();
		if (typeof(inParentPath)==='string') inParentPath = inParentPath.substr(1).split('/');
		var parentNode = this.getNodeAtPath(inParentPath, obj),
			moveFromPath = this.clone(inParentPath),
			moveToPath = this.clone(inParentPath);
		moveFromPath.push(moveFrom);
		moveToPath.push(moveTo);
		var moveFromItem = this.addToCache(this.getNodeAtPath(moveFromPath,obj),delta),
			moveToItem = this.addToCache(this.getNodeAtPath(moveToPath,obj),delta),
			changes = [
				{ 'c':this.UPDATE, 'p':moveFromPath, 'v':moveToItem, 'o':moveFromItem },
				{ 'c':this.UPDATE, 'p':moveToPath, 'v':moveFromItem, 'o':moveToItem }
			];
		this._rootDelta = delta; // must register our delta as root for cache lookups.
		for (var c=0; c < changes.length; c++) {
			delta = this.changeObjAndDelta(changes[c], obj, delta);
		}
		return delta;
	},
	//
	// # Delta-apply logic...
	//
	/**
	 * Apply delta to obj.
	 * Can apply changes in reverse; interpreting inserts as deletes and vice-versa.
	 * @param delta Object, changes to apply.
	 * @param obj Object, subject to apply changes to.
	 * @param reverse Boolean, (optional) apply changes in reverse.
	 */
	applyDeltaToObj : function(delta, obj, reverse) {
		if (this.verbose) console.log(
			"btDelta.delta2d.applyDeltaToObj(",
				"delta:",delta,
				"obj:",obj,
				"reverse:",reverse,
			")"
		);
		var result = this.clone(obj);
		this._rootDelta = delta;
		result = this.applyDelta(delta[this.CHANGE_KEY], result, reverse);
		return result;
	},
	/**
	 * Checks if old and new values are cache-keys requiring retrieval.
	 */
	applyDelta : function(delta, obj, reverse) {
		if (this.verbose > 1) console.log(
			"btDelta.delta2d.applyDelta(",
				"delta:",delta,
				"obj:",obj,
				"reverse:",reverse,
			")"
		);
		var processKey = function(k) {
			var dV = delta[k];
			if (this.isObj(dV)) {
				// Check if this is a branch or change descriptor.
				var isBranch = !this.isChangeLeaf(dV);
				if (isBranch) {
					// Traverse branch
					obj[k] = this.applyDelta(dV,obj[k],reverse);
				} else {
					// Apply change described.
					var changeType = dV.c,
						newValue = dV.v,
						oldValue = (dV.o!==undefined) ? dV.o : null;
					// check if values point to items in cache.
					if (newValue && this.isCacheKey(newValue)) newValue = this.getFromCache(newValue);
					if (oldValue && this.isCacheKey(oldValue)) oldValue = this.getFromCache(oldValue);
					// check if we need to reverse operations.
					if (reverse) {
						if (changeType==this.INSERT) changeType = this.DELETE;
						else if (changeType==this.DELETE) changeType = this.INSERT;
						else if (changeType==this.UPDATE) {
							var temp = newValue;
							newValue = oldValue;
							oldValue = temp;
						}
					}
					if (changeType==this.DELETE) {
						// Remove specified node from tree.
						if (this.isArray(obj)) {
							// Remove index from array.
							obj.splice(k,1);
						} else {
							// Remove index from object.
							delete obj[k];
						}
					} else
					if ((changeType==this.INSERT) && this.isArray(obj)) {
						// Insert value into array.
						obj.splice(k,0,newValue);
					} else {
						// Apply new value to node.
						obj[k] = newValue;
					}
				}
			}
		};
		
		if (reverse) {
			// iterate through keys in reverse order.
			var keys = [];
			for (var k in delta) keys.push(k);
			for (var i = keys.length-1; i >= 0; i--) {
				var k = keys[i];
				processKey.call(this,k);
			}
		} else {
			// iterate through keys normally.
			for (var k in delta) processKey.call(this,k);
		}
		
		return obj;
	},
	//
	// # Delta-find logic...
	//
	/**
	 * Public comparison function to pass objects to.
	 */
	'compare' : function(oldObj, newObj) {
		var delta = this.newDelta();
		delta[this.CHANGE_KEY] = this.compareObjs(oldObj, newObj);
		return delta;
	},
	/**
	 * Returns delta object for the passed old and new objects.
	 */
	compareObjs : function(oldObj, newObj) {
		var theseChanges = {};
		// Loop through old object to find changes and deletions.
		if (oldObj)
		for (var oldK in oldObj) {
			var oldV = oldObj[oldK],
				newV = newObj[oldK];
			// Objects are considered branches, to be traversed for changes.
			// Ignore values that are functions.
			if (!this.isFn(oldV) && !this.isFn(newV))
			if (this.isObj(oldV) && this.isObj(newV)) {
				// Drill into retained branch.
				var branchDelta = this.compareObjs(oldV,newV),
					hasChanges = Object.getOwnPropertyNames(branchDelta).length;
				if (hasChanges) theseChanges[oldK] = branchDelta;
			}
			else
			{
				// Determine type of change...
				if (this.isObj(oldV) && newV===undefined) {
					// Old branch removed
					theseChanges[oldK] = { 'c':this.DELETE, 'v':oldV };
				} else if (oldV===undefined && this.isObj(newV)) {
					// New branch added
					theseChanges[oldK] = { 'c':this.INSERT, 'v':newV };
				} else {
					// compare values
					var diff = this.compareVals(oldV,newV);
					// If invalid or unchanged, do not add to either result.
					if (diff) {
						// Difference detected...
						// Deletes need to record the value deleted.
						// Updates need to record new and old values.
						// Inserts need only record new value.
						if (diff===this.DELETE) theseChanges[oldK] = { 'c':diff, 'v':oldV };
						else if (diff===this.UPDATE) theseChanges[oldK] = { 'c':diff, 'v':newV, 'o':oldV };
						else theseChanges[oldK] = { 'c':diff, 'v':newV };
					} else {
						// remove unchanged value from changes.
						if (theseChanges[oldK]!==undefined) delete theseChanges[oldK];
					}
				}
				// Apply delta indicator property and value to change-leaf.
				if (theseChanges[oldK]!==undefined) theseChanges[oldK][this.DELTA_KEY] = this.DELTA_VAL;
			}
		}
		// loop through new model to find additions.
		for (var newK in newObj)
		if (!oldObj || oldObj[newK]===undefined) {
			var newV = newObj[newK];
			if (!this.isFn(newV)) {
				theseChanges[newK] = { 'c':this.INSERT, 'v':newV };
				theseChanges[newK][this.DELTA_KEY] = this.DELTA_VAL;
			}
		}
		return theseChanges;
	},
	/**
	 * Return diff description for the passed values.
	 * @param oldVal mixed
	 * @param newVal mixed
	 * @returns change-type | false, false if no change or either value is invalid.
	 */
	compareVals : function(oldVal, newVal) {
		// if values match no change was made.
		if (oldVal===newVal) return false;
		// determine type of change.
		if (this.isFn(oldVal) || this.isFn(newVal)) return false;
		if (oldVal===undefined && newVal!==undefined) return this.UPDATE;
		if (oldVal!==undefined && newVal===undefined) return this.DELETE;
		return this.UPDATE;
	}
});



// Export as Node module
/*if (module!==undefined && module.exports!==undefined)*/ module.exports = btDelta;
},{"./btClass.js":1}],3:[function(require,module,exports){
//
// Requires: btDelta, btClass
//
/*if (require!==undefined)*/ require('./btDelta.js');

//
// # Tests...
//
var delta1d = new btDelta.delta1d({verbose:0}),
	delta2d = new btDelta.delta2d({verbose:0});

//
// Test set 1
// Pre-defined before and after states with simple objects.
// Deletion of item from array.
//
var test1a = {
		'id':'test1', 'attributes':['test','model'], 'children':[
			'placeholder', 'placeholder', {
				'id':'section1', 'attributes':['test','section'], 'children':[
					{'id':'child1', 'name':'child one', 'attributes':['test','item']},
					{'id':'child2', 'name':'child two', 'attributes':['test','item']},
					{'id':'child3', 'name':'child three', 'attributes':['test','item']},
					{'id':'child4', 'name':'child four', 'attributes':['test','item']},
					{'id':'child5', 'name':'child five', 'attributes':['test','item']},
				]
			}
		]
	},
	test1b = {
		'id':'test1', 'attributes':['test','model'], 'children':[
			'placeholder', 'placeholder', {
				'id':'section1', 'attributes':['test','section'], 'children':[
					{'id':'child1', 'name':'child one', 'attributes':['test','item']},
					/* CHANGE: deleting child2...
					{'id':'child2', 'name':'child two', 'attributes':['test','item']},*/
					{'id':'child3', 'name':'child three', 'attributes':['test','item']},
					{'id':'child4', 'name':'child four', 'attributes':['test','item']},
					{'id':'child5', 'name':'child five', 'attributes':['test','item']},
				]
			}
		]
	},
	test1delta1 = delta1d.compare(test1a,test1b), // generate 1d delta for objects
	test1delta2 = delta2d.compare(test1a,test1b), // generate 2d delta for objects
	result1 = delta1d.applyDeltaToObj(test1delta1,test1a), // should match test1b
	result1f = delta2d.applyDeltaToObj(test1delta2,test1a), // should match test1b
	result1r = delta2d.applyDeltaToObj(test1delta2,test1b,true); // should match test1a
console.log(
	"\nTest set 1 (delete item - auto)..."+
	"\n test1delta1.length:"+JSON.stringify(test1delta1).length, "content:",test1delta1,
	"\n test1delta2.length:"+JSON.stringify(test1delta2).length, "content:",test1delta2,
	"\n result1  (1d)     successful? "+(JSON.stringify(result1)==JSON.stringify(test1b)),
	"\n result1f (2d-fwd) successful? "+(JSON.stringify(result1f)==JSON.stringify(test1b)),
	"\n result1r (2d-rev) successful? "+(JSON.stringify(result1r)==JSON.stringify(test1a)),
	"\n"
);

//
// Test set 2
// Pre-defined before and after states with simple objects.
// Moving of item in array.
//
var test2a = {
		'id':'test2', 'attributes':['test','model'], 'children':[
			'placeholder', 'placeholder', {
				'id':'section1', 'attributes':['test','section'], 'children':[
					{'id':'child1', 'name':'child one', 'attributes':['test','item']},
					{'id':'child2', 'name':'child two', 'attributes':['test','item']},
					{'id':'child3', 'name':'child three', 'attributes':['test','item']},
					{'id':'child4', 'name':'child four', 'attributes':['test','item']},
					{'id':'child5', 'name':'child five', 'attributes':['test','item']},
				]
			}
		]
	},
	test2b = {
		'id':'test2', 'attributes':['test','model'], 'children':[
			'placeholder', 'placeholder', {
				'id':'section1', 'attributes':['test','section'], 'children':[
					{'id':'child1', 'name':'child one', 'attributes':['test','item']},
					/* CHANGE: swapping child2 and child3... */
					{'id':'child3', 'name':'child three', 'attributes':['test','item']},
					{'id':'child2', 'name':'child two', 'attributes':['test','item']},
					{'id':'child4', 'name':'child four', 'attributes':['test','item']},
					{'id':'child5', 'name':'child five', 'attributes':['test','item']},
				]
			}
		]
	},
	test2delta1 = delta1d.compare(test2a,test2b), // generate 1d delta for objects
	test2delta2 = delta2d.compare(test2a,test2b), // generate 2d delta for objects
	result2 = delta1d.applyDeltaToObj(test2delta1,test2a), // should match test2b
	result2f = delta2d.applyDeltaToObj(test2delta2,test2a), // should match test2b
	result2r = delta2d.applyDeltaToObj(test2delta2,test2b,true); // should match test2a
console.log(
	"\nTest set 2 (move item - auto)..."+
	"\n test2delta1.length:"+JSON.stringify(test2delta1).length, "content:",test2delta1,
	"\n test2delta2.length:"+JSON.stringify(test2delta2).length, "content:",test2delta2,
	"\n result2  (1d)     successful? "+(JSON.stringify(result2)==JSON.stringify(test2b)),
	"\n result2f (2d-fwd) successful? "+(JSON.stringify(result2f)==JSON.stringify(test2b)),
	"\n result2r (2d-rev) successful? "+(JSON.stringify(result2r)==JSON.stringify(test2a)),
	"\n"
);

//
// Test set 3
// Simultaneous delta & model update.
// Delete item from array (manual).
//
//delta2d.verbose = 3; // increase verbose level for problematic test.
var test3a = {
		'id':'test3', 'attributes':['test','model'], 'children':[
			'placeholder', 'placeholder', {
				'id':'section1', 'attributes':['test','section'], 'children':[
					{'id':'child1', 'name':'child one', 'attributes':['test','item']},
					{'id':'child2', 'name':'child two', 'attributes':['test','item']},
					{'id':'child3', 'name':'child three', 'attributes':['test','item']},
					{'id':'child4', 'name':'child four', 'attributes':['test','item']},
					{'id':'child5', 'name':'child five', 'attributes':['test','item']},
				]
			}
		]
	},
	test3b1 = btClass.clone(test3a), // duplicate of original to make 1d changes to
	test3b2 = btClass.clone(test3a), // duplicate of original to make 2d changes to
	test3delta1 = delta1d.doDeleteItem(1,"/children/2/children",test3b1), // create 1d delta from manual change
	test3delta2 = delta2d.doDeleteItem(1,"/children/2/children",test3b2), // create 2d delta from manual change
	result3 = delta1d.applyDeltaToObj(test3delta1,test3a), // should match test3b1
	result3f = delta2d.applyDeltaToObj(test3delta2,test3a), // should match test3b2
	result3r = delta2d.applyDeltaToObj(test3delta2,test3b2,true); // should match test3a
console.log(
	"\nTest set 3 (delete item - manual)..."+
	"\n test3delta1.length:"+JSON.stringify(test3delta1).length, "content:",test3delta1,
	"\n test3delta2.length:"+JSON.stringify(test3delta2).length, "content:",test3delta2,
	"\n result3  (1d)     successful? "+(JSON.stringify(result3)==JSON.stringify(test3b1)),
	"\n result3f (2d-fwd) successful? "+(JSON.stringify(result3f)==JSON.stringify(test3b2)),
	"\n result3r (2d-rev) successful? "+(JSON.stringify(result3r)==JSON.stringify(test3a)),
	"\n"
);
//delta2d.verbose = 1; // reset verbose level after problematic test.

//
// Test set 4
// Simultaneous delta & model update.
// Moving of item in array (manual).
//
var test4a = {
		'id':'test4', 'attributes':['test','model'], 'children':[
			'placeholder', 'placeholder', {
				'id':'section1', 'attributes':['test','section'], 'children':[
					{'id':'child1', 'name':'child one', 'attributes':['test','item']},
					{'id':'child2', 'name':'child two', 'attributes':['test','item']},
					{'id':'child3', 'name':'child three', 'attributes':['test','item']},
					{'id':'child4', 'name':'child four', 'attributes':['test','item']},
					{'id':'child5', 'name':'child five', 'attributes':['test','item']},
				]
			}
		]
	},
	test4b1 = btClass.clone(test4a), // duplicate of original to make 1d changes to
	test4b2 = btClass.clone(test4a), // duplicate of original to make 2d changes to
	//n = delta1d.verbose = 4,
	test4delta1 = delta1d.doMoveItem(2,1,"/children/2/children",test4b1), // create 1d delta from manual change
	//n = delta1d.verbose = delta2d.verbose = 1,
	test4delta2 = delta2d.doMoveItem(2,1,"/children/2/children",test4b2), // create 2d delta from manual change
	result4 = delta1d.applyDeltaToObj(test4delta1,test4a), // should match test4b1
	result4f = delta2d.applyDeltaToObj(test4delta2,test4a), // should match test4b2
	result4r = delta2d.applyDeltaToObj(test4delta2,test4b2,true); // should match test4a
console.log(
	"\nTest set 4 (move item - manual)..."+
	"\n test4delta1.length:"+JSON.stringify(test4delta1).length, "content:",test4delta1,
	"\n test4delta2.length:"+JSON.stringify(test4delta2).length, "content:",test4delta2,
	"\n result4  (1d)     successful? "+(JSON.stringify(result4)==JSON.stringify(test4b1)),
	"\n result4f (2d-fwd) successful? "+(JSON.stringify(result4f)==JSON.stringify(test4b2)),
	"\n result4r (2d-rev) successful? "+(JSON.stringify(result4r)==JSON.stringify(test4a)),
	"\n"
);

//
// Test set 5
// Simultaneous delta & model update.
// Multiple changes (manual).
//
var test5a = {
		'id':'test5', 'attributes':['test','model'], 'children':[
			'placeholder', 'placeholder', {
				'id':'section1', 'attributes':['test','section'], 'children':[
					{'id':'child1', 'name':'child one', 'attributes':['test','item']},
					{'id':'child2', 'name':'child two', 'attributes':['test','item']},
					{'id':'child3', 'name':'child three', 'attributes':['test','item']},
					{'id':'child4', 'name':'child four', 'attributes':['test','item']},
					{'id':'child5', 'name':'child five', 'attributes':['test','item']},
				]
			}
		]
	},
	test5b1 = btClass.clone(test5a), // duplicate of original to make 1d changes to
	test5b2 = btClass.clone(test5a), // duplicate of original to make 2d changes to
	test5delta1 = delta1d.doDeleteItem(1,"/children/2/children",test5b1), // create 1d delta from manual change
	test5delta1 = delta1d.doMoveItem(3,2,"/children/2/children",test5b1,test5delta1),
	test5delta2 = delta2d.doDeleteItem(1,"/children/2/children",test5b2), // create 2d delta from manual change
	test5delta2 = delta2d.doMoveItem(3,2,"/children/2/children",test5b2,test5delta2),
	result5 = delta1d.applyDeltaToObj(test5delta1,test5a), // should match test5b1
	result5f = delta2d.applyDeltaToObj(test5delta2,test5a), // should match test5b2
	result5r = delta2d.applyDeltaToObj(test5delta2,test5b2,true); // should match test5a
console.log(
	"\nTest set 5 (multiple changes - manual)..."+
	"\n test5delta1.length:"+JSON.stringify(test5delta1).length, "content:",test5delta1,
	"\n test5delta2.length:"+JSON.stringify(test5delta2).length, "content:",test5delta2,
	"\n result5  (1d)     successful? "+(JSON.stringify(result5)==JSON.stringify(test5b1)),
	"\n result5f (2d-fwd) successful? "+(JSON.stringify(result5f)==JSON.stringify(test5b2)),
	"\n result5r (2d-rev) successful? "+(JSON.stringify(result5r)==JSON.stringify(test5a)),
	"\n"
);



},{"./btDelta.js":2}]},{},[3])
//
// btClass
// Can be run in Node or in browser.
// No dependancies.
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
if (typeof(module)!=='undefined') module.exports = btClass;
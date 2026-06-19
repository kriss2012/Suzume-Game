/* --------------------
 * is-it-type module
 * Entry point
 * ------------------*/

// Modules
import getGlobalThis from 'globalthis';

// Exports

/*
 * Replication of core-util-is methods.
 * https://www.npmjs.com/package/core-util-is
 * NB `isBuffer()` is omitted and `isObject()` is different from `core-util-is`'s implementation
 */

export const {isArray} = Array;

export function isBoolean(arg) {
	return isType('boolean', arg);
}

export function isNull(arg) {
	return arg === null;
}

export function isUndefined(arg) {
	return arg === void 0; // eslint-disable-line no-void
}

export function isNullOrUndefined(arg) {
	return arg == null;
}

export function isNumber(arg) {
	return isType('number', arg);
}

export function isString(arg) {
	return isType('string', arg);
}

export function isSymbol(arg) {
	return isType('symbol', arg);
}

export function isRegExp(arg) {
	return arg instanceof RegExp;
}

export function isDate(arg) {
	return arg instanceof Date;
}

export function isError(arg) {
	return arg instanceof Error;
}

export function isFunction(arg) {
	return isType('function', arg);
}

export function isPrimitive(arg) {
	const type = getType(arg);
	return arg == null
		|| type === 'boolean'
		|| type === 'number'
		|| type === 'string'
		|| type === 'symbol';
}

/*
 * Additional methods
 */

// Strings

export function isEmptyString(arg) {
	return arg === '';
}

export function isFullString(arg) {
	return isString(arg) && !isEmptyString(arg);
}

// Objects

const {getPrototypeOf} = Object,
	ObjectPrototype = Object.prototype,
	globalThis = getGlobalThis();

export function isObject(arg) {
	if (!isType('object', arg) || isNull(arg)) return false;

	let proto = getPrototypeOf(arg);
	if (proto === null || proto === ObjectPrototype) return true;

	while (true) { // eslint-disable-line no-constant-condition
		const nextProto = getPrototypeOf(proto);
		if (nextProto === null) return true;
		if (nextProto === ObjectPrototype) break;
		proto = nextProto;
	}

	return isNotNativeProto(proto);
}

function isNotNativeProto(proto) {
	let nativeProtos = [];
	for (const ctorName of [
		'Function', 'Array', 'Number', 'Boolean', 'String', 'Symbol', 'Date', 'Promise', 'RegExp', 'Error',
		'ArrayBuffer', 'DataView', 'Map', 'BigInt', 'Set', 'WeakMap', 'WeakSet', 'SharedArrayBuffer',
		'FinalizationRegistry', 'WeakRef', 'URL', 'URLSearchParams', 'TextEncoder', 'TextDecoder'
	]) {
		const ctor = globalThis[ctorName];
		if (ctor) nativeProtos.push(ctor.prototype);
	}

	if (typeof Uint8Array === 'function') nativeProtos.push(getPrototypeOf(Uint8Array.prototype));

	if (typeof Set === 'function') {
		nativeProtos = new Set(nativeProtos);
		isNotNativeProto = p => !nativeProtos.has(p); // eslint-disable-line no-func-assign
	} else {
		isNotNativeProto = p => !nativeProtos.includes(p); // eslint-disable-line no-func-assign
	}

	return isNotNativeProto(proto);
}

export function isEmptyObject(arg) {
	return isObject(arg) && Object.keys(arg).length === 0;
}

// Numbers

export function isInteger(arg) {
	return Number.isInteger(arg);
}

export function isPositiveInteger(arg) {
	return isInteger(arg) && arg > 0;
}

export function isPositiveIntegerOrZero(arg) {
	return isInteger(arg) && arg >= 0;
}

export function isNegativeInteger(arg) {
	return isInteger(arg) && arg < 0;
}

export function isNegativeIntegerOrZero(arg) {
	return isInteger(arg) && arg <= 0;
}

// Other

export function isType(type, arg) {
	return getType(arg) === type;
}

/*
 * Helpers
 */

function getType(arg) {
	return typeof arg;
}

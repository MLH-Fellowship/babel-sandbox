"use strict";

exports.__esModule = true;
exports.InstanceProperties = exports.StaticProperties = exports.Globals = void 0;

var _core = require("@babel/core");

const expr = _core.template.expression.ast; // $FlowIgnore

const has = Function.call.bind(Object.hasOwnProperty);
const Globals = {};
exports.Globals = Globals;
const StaticProperties = {};
exports.StaticProperties = StaticProperties;
const InstanceProperties = {};
exports.InstanceProperties = InstanceProperties;
defineGlobal("globalThis", "1.0.0");
defineGlobal("AggregateError", "1.0.2", "es-aggregate-error");

const arrayCheck = thisObj => expr`Array.isArray(${thisObj})`;

const typeofCheck = type => thisObj => expr`typeof ${thisObj} === "${type}"`;

const instanceofCheck = Class => thisObj => expr`${thisObj} instanceof ${_core.types.identifier(Class)}`;

const stringCheck = typeofCheck("string");
const getter = {
  getter: true
};
const excludeObject = {
  exclude: meta => meta.kind === "property" && meta.placement === "static" && meta.object === "Object"
};
defineStatic("Array", "from", "1.1.0");
defineStatic("Array", "of", "1.0.0");
defineInstance("Array", "entries", "1.0.0", arrayCheck, excludeObject);
defineInstance("Array", "every", "1.1.0", arrayCheck);
defineInstance("Array", "find", "2.1.1", arrayCheck);
defineInstance("Array", "findIndex", "2.1.0", arrayCheck);
defineInstance("Array", "flat", "1.2.3", arrayCheck);
defineInstance("Array", "flatMap", "1.2.3", arrayCheck);
defineInstance("Array", "includes", "3.1.1", arrayCheck, {
  pkg: "array-includes"
});
defineInstance("Array", "indexOf", "1.0.0", arrayCheck);
defineInstance("Array", "keys", "1.0.0", arrayCheck, excludeObject);
defineInstance("Array", "lastIndexOf", "1.0.0", arrayCheck);
defineInstance("Array", "map", "1.0.2", arrayCheck);
defineInstance("Array", "reduce", "1.0.1", arrayCheck);
defineInstance("Array", "reduceRight", "1.0.1", arrayCheck);
defineInstance("Array", "some", "1.1.1", arrayCheck);
defineInstance("Array", "values", "1.0.0", arrayCheck, excludeObject);
defineInstance("Function", "name", "1.1.2", typeofCheck("function"), getter);
defineStatic("Number", "isNaN", "1.2.1", "is-nan");
defineStatic("Object", "assign", "4.1.0");
defineStatic("Object", "entries", "1.1.1");
defineStatic("Object", "fromEntries", "2.0.2");
defineStatic("Object", "is", "1.1.2", "object-is");
defineStatic("Object", "getOwnPropertyDescriptors", "2.1.0");
defineStatic("Object", "values", "1.1.1");
defineStatic("Promise", "allSettled", "1.0.2");
defineStatic("Promise", "any", "2.0.1");
defineStatic("Promise", "try", "1.0.0");
defineInstance("Promise", "finally", "1.2.1", instanceofCheck("Promise"));
defineStatic("Reflect", "ownKeys", "1.0.1");
defineInstance("RegExp", "flags", "1.3.0", instanceofCheck("RegExp"), getter);
defineStatic("String", "fromCodePoint", "1.0.0");
defineInstance("String", "codePoitAt", "1.0.0", stringCheck);
defineInstance("String", "endsWith", "1.0.0", stringCheck);
defineInstance("String", "includes", "2.0.0", stringCheck);
defineInstance("String", "matchAll", "4.0.2", stringCheck);
defineInstance("String", "padEnd", "1.1.1", stringCheck);
defineInstance("String", "padStart", "3.1.0", stringCheck);
defineInstance("String", "repeat", "1.0.0", stringCheck);
defineInstance("String", "replaceAll", "1.0.3", stringCheck);
defineInstance("String", "startsWith", "1.0.0", stringCheck);
defineInstance("String", "trim", "1.2.1", stringCheck);
defineInstance("String", "trimEnd", "1.0.0", stringCheck);
defineInstance("String", "trimLeft", "2.1.1", stringCheck);
defineInstance("String", "trimRight", "2.1.1", stringCheck);
defineInstance("String", "trimStart", "1.0.0", stringCheck);
defineInstance("Symbol", "description", "1.0.2", instanceofCheck("Symbol"), getter);

function createDescriptor(name, version, pkg = name.toLowerCase()) {
  return {
    name,
    version,
    package: pkg
  };
}

function defineGlobal(name, version, pkg) {
  Globals[name] = [createDescriptor(name, version, pkg)];
}

function defineStatic(object, property, version, pkg) {
  if (!has(StaticProperties, object)) StaticProperties[object] = {};
  StaticProperties[object][property] = [createDescriptor(`${object}.${property}`, version, pkg)];
}

function defineInstance(object, property, version, thisCheck, {
  getter = false,
  exclude,
  pkg
} = {}) {
  if (!has(InstanceProperties, property)) InstanceProperties[property] = [];
  InstanceProperties[property].push({ ...createDescriptor(`${object}.prototype.${property}`, version, pkg),
    thisCheck,
    exclude,
    getter
  });
}
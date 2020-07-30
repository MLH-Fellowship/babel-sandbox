"use strict";

exports.__esModule = true;
exports.default = void 0;

var _data = _interopRequireDefault(require("core-js-compat/data"));

var _shippedProposals = _interopRequireDefault(require("./shipped-proposals"));

var _getModulesListForTargetVersion = _interopRequireDefault(require("core-js-compat/get-modules-list-for-target-version"));

var _builtInDefinitions = require("./built-in-definitions");

var _core = require("@babel/core");

var _utils = require("./utils");

var _helperDefinePolyfillProvider = _interopRequireDefault(require("@babel/helper-define-polyfill-provider"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _helperDefinePolyfillProvider.default)(function ({
  getUtils,
  method,
  shouldInjectPolyfill,
  createMetaResolver,
  debug,
  babel
}, {
  version = 3,
  proposals,
  shippedProposals
}) {
  const isWebpack = babel.caller(caller => (caller == null ? void 0 : caller.name) === "babel-loader");
  const resolve = createMetaResolver({
    global: _builtInDefinitions.BuiltIns,
    static: _builtInDefinitions.StaticProperties,
    instance: _builtInDefinitions.InstanceProperties
  });
  const available = new Set((0, _getModulesListForTargetVersion.default)(version));
  const coreJSBase = method === "usage-pure" ? proposals ? "core-js-pure/features" : "core-js-pure/stable" : "core-js";

  function maybeInjectGlobal(names, utils) {
    for (const name of names) {
      if (shouldInjectPolyfill(name)) {
        debug(name);
        utils.injectGlobalImport((0, _utils.coreJSModule)(name));
      }
    }
  }

  function maybeInjectPure(desc, hint, utils, object) {
    if (desc.pure && !(object && desc.exclude && desc.exclude.includes(object)) && shouldInjectPolyfill(desc.name)) {
      return utils.injectDefaultImport(`${coreJSBase}/${desc.pure}.js`, hint);
    }
  }

  return {
    name: "corejs3",
    polyfills: _data.default,

    filterPolyfills(name) {
      if (!available.has(name)) return false;
      if (proposals || method === "entry-global") return true;

      if (shippedProposals && _shippedProposals.default.has(name)) {
        return true;
      }

      return !name.startsWith("esnext.");
    },

    entryGlobal(meta, utils, path) {
      if (meta.kind !== "import") return;
      const modules = (0, _utils.isCoreJSSource)(meta.source);
      if (!modules) return;

      if (modules.length === 1 && meta.source === (0, _utils.coreJSModule)(modules[0]) && shouldInjectPolyfill(modules[0])) {
        // Avoid infinite loop: do not replace imports with a new copy of
        // themselves.
        debug(null);
        return;
      }

      maybeInjectGlobal(modules, utils);
      path.remove();
    },

    usageGlobal(meta, utils) {
      const resolved = resolve(meta);
      if (!resolved) return;
      let deps = resolved.desc.global;

      if (resolved.kind !== "global" && meta.object && meta.placement === "prototype") {
        const low = meta.object.toLowerCase();
        deps = deps.filter(m => m.includes(low) || _builtInDefinitions.CommonInstanceDependencies.has(m));
      }

      maybeInjectGlobal(deps, utils);
    },

    usagePure(meta, utils, path) {
      if (meta.kind === "in") {
        if (meta.key === "Symbol.iterator") {
          path.replaceWith(_core.types.callExpression(utils.injectDefaultImport(`${coreJSBase}/is-iterable.js`, "isIterable"), [path.node.right]));
        }

        return;
      }

      let isCall;

      if (meta.kind === "property") {
        // We can't compile destructuring.
        if (!path.isMemberExpression()) return;
        if (!path.isReferenced()) return;
        isCall = path.parentPath.isCallExpression({
          callee: path.node
        });

        if (meta.key === "Symbol.iterator") {
          if (!shouldInjectPolyfill("es.symbol.iterator")) return;

          if (isCall) {
            if (path.parent.arguments.length === 0) {
              path.parentPath.replaceWith(_core.types.callExpression(utils.injectDefaultImport(`${coreJSBase}/get-iterator.js`, "getIterator"), [path.node.object]));
              path.skip();
            } else {
              (0, _utils.callMethod)(path, utils.injectDefaultImport(`${coreJSBase}/get-iterator-method.js`, "getIteratorMethod"));
            }
          } else {
            path.replaceWith(_core.types.callExpression(utils.injectDefaultImport(`${coreJSBase}/get-iterator-method.js`, "getIteratorMethod"), [path.node.object]));
          }

          return;
        }
      }

      const resolved = resolve(meta);
      if (!resolved) return;

      if (resolved.kind === "global") {
        const id = maybeInjectPure(resolved.desc, resolved.name, utils);
        if (id) path.replaceWith(id);
      } else if (resolved.kind === "static") {
        const id = maybeInjectPure(resolved.desc, resolved.name, utils, // $FlowIgnore
        meta.object);
        if (id) path.replaceWith(id);
      } else if (resolved.kind === "instance") {
        const id = maybeInjectPure(resolved.desc, `${resolved.name}InstanceProperty`, utils, // $FlowIgnore
        meta.object);
        if (!id) return;

        if (isCall) {
          (0, _utils.callMethod)(path, id);
        } else {
          path.replaceWith(_core.types.callExpression(id, [path.node.object]));
        }
      }
    },

    visitor: method === "usage-global" && {
      // import("foo")
      CallExpression(path) {
        if (path.get("callee").isImport()) {
          const utils = getUtils(path);

          if (isWebpack) {
            // Webpack uses Promise.all to handle dynamic import.
            maybeInjectGlobal(_builtInDefinitions.PromiseDependenciesWithIterators, utils);
          } else {
            maybeInjectGlobal(_builtInDefinitions.PromiseDependencies, utils);
          }
        }
      },

      // (async function () { }).finally(...)
      Function(path) {
        if (path.node.async) {
          maybeInjectGlobal(_builtInDefinitions.PromiseDependencies, getUtils(path));
        }
      },

      // for-of, [a, b] = c
      "ForOfStatement|ArrayPattern"(path) {
        maybeInjectGlobal(_builtInDefinitions.CommonIterators, getUtils(path));
      },

      // [...spread]
      SpreadElement(path) {
        if (!path.parentPath.isObjectExpression()) {
          maybeInjectGlobal(_builtInDefinitions.CommonIterators, getUtils(path));
        }
      },

      // yield*
      YieldExpression(path) {
        if (path.node.delegate) {
          maybeInjectGlobal(_builtInDefinitions.CommonIterators, getUtils(path));
        }
      }

    }
  };
});

exports.default = _default;
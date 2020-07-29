// If you want to add custom plugins or presets, you can register them
// at plugins-list.js in dependencies

// Default list of plugins, for internal use only
export const plugins = [
  {
    name: "@babel/plugin-external-helpers",
    description: "does this",
    fileLocation: "../plugins/babel-plugin-polyfill-regenerator.js",
    defaultConfig: {
      module: "bluebird",
      method: "coroutine",
    },
  },
  {
    name: "babel-plugin-polyfill-corejs2",
    description: "does this",
    fileLocation: "../plugins/babel-plugin-polyfill-regenerator.js",
    defaultConfig: {
      module: "bluebird",
      method: "coroutine",
    },
  },
  {
    name: "babel-plugin-polyfill-corejs3",
    description: "does this",
    fileLocation: "../plugins/babel-plugin-polyfill-regenerator.js",
    defaultConfig: {
      module: "bluebird",
      method: "coroutine",
    },
  },
  {
    name: "babel-plugin-polyfill-es-shims",
    description: "does this",
    fileLocation: "../plugins/babel-plugin-polyfill-regenerator.js",
    defaultConfig: {
      module: "bluebird",
      method: "coroutine",
    },
  },
  {
    name: "babel-plugin-polyfill-regenerator",
    description: "does this",
    fileLocation: "../plugins/babel-plugin-polyfill-regenerator.js",
    defaultConfig: {
      module: "bluebird",
      method: "coroutine",
    },
  },
];

// Default list of presets, internal use only
export const presets = [
  {
    name: "@babel/preset-env",
    description: "does that",
    fileLocation: "../presets",
    defaultConfig: {}
  },
  {
    name: "@babel/preset-react",
    description: "does that",
    fileLocation: "../presets",
    defaultConfig: {}
  }
];
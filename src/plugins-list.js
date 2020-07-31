// If you want to add custom plugins or presets, you can register them
// at plugins-list.js in dependencies

// Default list of plugins, for internal use only
export const plugins = {
  "@babel/plugin-external-helpers": {
    name: "@babel/plugin-external-helpers",
    ref: require("@babel/plugin-external-helpers"),
    description: "does this",
    fileLocation: "../static/plugins/@babel/plugin-external-helpers",
    defaultConfig: {
      module: "bluebird",
      method: "coroutine",
    },
  },
  "babel-plugin-polyfill-corejs2": {
    name: "babel-plugin-polyfill-corejs2",
    ref: require("babel-plugin-polyfill-corejs2"),
    description: "does this",
    fileLocation: "../static/plugins/babel-plugin-polyfill-corejs2",
    defaultConfig: {
      module: "bluebird",
      method: "coroutine",
    },
  },
  "babel-plugin-polyfill-corejs3": {
    name: "babel-plugin-polyfill-corejs3",
    ref: require("babel-plugin-polyfill-corejs3"),
    description: "does this",
    fileLocation: "babel-plugin-polyfill-corejs3",
    defaultConfig: {
      module: "bluebird",
      method: "coroutine",
    },
  },
  "babel-plugin-polyfill-es-shims": {
    name: "babel-plugin-polyfill-es-shims",
    ref: require("babel-plugin-polyfill-es-shims"),
    description: "does this",
    fileLocation: "../static/plugins/babel-plugin-polyfill-es-shims",
    defaultConfig: {
      module: "bluebird",
      method: "coroutine",
    },
  },
  "babel-plugin-polyfill-regenerator": {
    name: "babel-plugin-polyfill-regenerator",
    ref: require("babel-plugin-polyfill-regenerator"),
    description: "does this",
    fileLocation: "../plugins/babel-plugin-polyfill-regenerator",
    defaultConfig: {
      module: "bluebird",
      method: "coroutine",
    },
  },
};

// Default list of presets, internal use only
export const presets = {
  "@babel/preset-env": {
    name: "@babel/preset-env",
    ref: require("@babel/preset-env"),
    description: "does that",
    fileLocation: "../static/presets/@babel/preset-env",
    defaultConfig: {}
  },
  "@babel/preset-react": {
    name: "@babel/preset-react",
    ref: require("@babel/preset-react"),
    description: "does that",
    fileLocation: "../static/presets/@babel/preset-react",
    defaultConfig: {}
  }
};

export const availablePlugins = {};
export const availablePresets = {};

Object.keys(plugins).forEach((pluginName) => {
  const plugin = plugins[pluginName];
  availablePlugins[pluginName] = plugin.ref;
});

Object.keys(presets).forEach((presetName) => {
  const preset = presets[presetName];
  availablePresets[presetName] = preset.ref;
});

console.log(availablePlugins);
console.log(availablePresets);




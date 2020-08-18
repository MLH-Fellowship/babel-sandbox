import React from "react";
import { render } from "react-dom";
import { App } from "./components/App";
import { extractID, isShareLink, REPLState } from "./state";

import * as Babel from "@babel/standalone";
import { addDefaultPlugins, loadPlugin, loadPreset } from "./plugins";
import { DEFAULT_SOURCE, DEFAULT_PLUGIN, DEFAULT_CONFIG } from "./defaults";

// css
import "semantic-ui-less/semantic.less";

window.babel = Babel;

// If we want to be able to easily replace a codesandbox template via Define API later...
// const BABEL_CONFIG = require("!raw-loader!../config.json");
// const BABEL_CONFIG2 = require("!raw-loader!../config2.json");
// const SOURCE = require("!raw-loader!../source.js");
// const PLUGIN = require("!raw-loader!../plugin.js");

const defaultState = new REPLState(
  DEFAULT_SOURCE,
  DEFAULT_PLUGIN,
  DEFAULT_CONFIG.map(conf => JSON.stringify(conf))
);

/**
 * @returns {Promise<REPLState>}
 */
async function getState() {
  if (!isShareLink()) {
    return defaultState;
  }
  const id = extractID();
  const state = await REPLState.FromID(id);
  return state === null ? defaultState : state;
}

(async () => {
  addDefaultPlugins();
  const state = await getState();
  state.PluginList().forEach(plugin => loadPlugin(plugin));
  state.PresetList().forEach(preset => loadPreset(preset));
  render(
    <App
      defaultConfig={state.configs.map(conf => JSON.parse(conf))}
      defaultSource={state.jsSource}
      defCustomPlugin={state.pluginSource}
      defaultId={state.id}
      defaultForks={state.forks}
    />,
    document.getElementById("root")
  );
})();

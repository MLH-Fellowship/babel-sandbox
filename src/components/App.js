import React, { useState, useCallback, useEffect } from "react";
import * as Babel from "@babel/standalone";
import { processOptions } from "../standalone";
// import * as Babel from "@babel/core";
import styled, { css } from "styled-components";

import { Editor } from "./Editor";
import { CustomPlugin } from "./CustomPlugin";
import { MainMenu } from "./MainMenu";
import { Input } from "./Input";
import { Output } from "./Output";
import { gzipSize } from "../gzip";
import { Root } from "./styles";
import { useDebounce } from "../utils/useDebounce";
import REPLState from "../state/REPLState.js";

import { Grid } from "semantic-ui-react";
import {plugins} from "../plugins-list";

window.babel = Babel;

/**
 * Converts internal json plugin/preset config to babel form
 * @param {Object} jsonConfig 
 */
function convertToBabelConfig(jsonConfig) {
  let result = {plugins: [], presets: []};
  result.plugins = jsonConfig.plugins?.map(plugin => [plugin.name, plugin.defaultConfig]);
  result.presets = jsonConfig.presets?.map(preset => [preset.name, preset.defaultConfig]);
  return result;
}

function convertToJsonConfig(babelConfig) {
  let result = {plugins: [], presets: []}
  result.plugins = babelConfig.plugins?.map((plugin) => {
    return {
      name: plugin[0],
      description: plugins[plugin[0]].description,
      fileLocation: plugins[plugin[0]].fileLocation,
      defaultConfig: plugin[1],
    };
  });
}

function importDefaultPlugins() {
  Object.keys(plugins).forEach((pluginName) => {
    const script = document.createElement("script");
    script.src = plugins[pluginName].fileLocation;
    script.async = false;
    document.head.appendChild(script);
  });
  console.log(window);
}

function registerDefaultPlugins() {
  Babel.registerPlugin(
    "babel-plugin-polyfill-corejs3",
    window.babelPluginPolyfillCorejs3
  );
  Babel.registerPlugin(
    "babel-plugin-polyfill-corejs2",
    window.babelPluginPolyfillCorejs2
  );
  Babel.registerPlugin(
    "@babel/plugin-external-helpers",
    window._babel_pluginExternalHelpers
  );
  Babel.registerPlugin(
    "babel-plugin-polyfill-es-shims",
    window.babelPluginPolyfillEsShims
  );
  Babel.registerPlugin(
    "babel-plugin-polyfill-regenerator",
    window.babelPluginPolyfillRegenerator
  );
}


export const App = ({ defaultSource, defaultConfig, defCustomPlugin }) => {
  const [source, setSource] = React.useState(defaultSource);
  const [enableCustomPlugin, toggleCustomPlugin] = React.useState(true);
  const [customPlugin, setCustomPlugin] = React.useState(defCustomPlugin);
  const [jsonConfig, setJsonConfig] = useState(
    Array.isArray(defaultConfig)
      ? defaultConfig
      : [defaultConfig]
  );
  const [size, setSize] = useState(null);
  const [gzip, setGzip] = useState(null);
  const debouncedSource = useDebounce(source, 125);
  const [shareLink, setShareLink] = React.useState("");
  const [showShareLink, setShowShareLink] = React.useState(false);

  const updateBabelConfig = useCallback((config, index) => {
    setJsonConfig((configs) => {
      const newConfigs = [...configs];
      newConfigs[index] = config;

      return newConfigs;
    });
  }, []);

  // Babel.registerPreset('@babel/preset-env', window.babel)
  // console.log(window);

  const removeBabelConfig = useCallback((index) => {
    setJsonConfig((configs) => configs.filter((c, i) => index !== i));
  }, []);

  let results = jsonConfig.map((configJson, index) => {
    // const config = convertToBabelConfig(configJson);
    return (
      <CompiledOutput
        source={debouncedSource}
        customPlugin={enableCustomPlugin ? customPlugin : undefined}
        config={configJson}
        key={index}
        onConfigChange={(config) => updateBabelConfig(config, index)}
        setConfig={setJsonConfig}
        removeConfig={() => removeBabelConfig(index)}
      />
    );
  });

  useEffect(() => {
    let size = new Blob([debouncedSource], { type: "text/plain" }).size;
    setSize(size);
    gzipSize(debouncedSource).then(s => setGzip(s));
  }, [debouncedSource]);

  //Register default plugins
  // useEffect(() => {
  //   Babel.registerPlugin(
  //     "babel-plugin-polyfill-corejs3",
  //     window.babelPluginPolyfillCorejs3
  //   );
  // });

  return (
    <Root>
      <MainMenu
        setSource={setSource}
        setBabelConfig={setBabelConfig}
        toggleCustomPlugin={toggleCustomPlugin}
        enableCustomPlugin={enableCustomPlugin}
      />

      <button
        onClick={async () => {
          const state = new REPLState(
            source,
            enableCustomPlugin ? customPlugin : "",
            babelConfig.map((config) => JSON.stringify(config))
          );
          const link = await state.Link();
          setShareLink(link);
          setShowShareLink(true);
        }}
      >
        Share
    </button>
      {showShareLink && (
        <input type="text" value={shareLink} readOnly></input>
      )}
      <Grid celled="internally">
        <Input size={size} gzip={gzip} source={source} setSource={setSource} />
        {enableCustomPlugin && (
          <CustomPlugin
            toggleCustomPlugin={toggleCustomPlugin}
            customPlugin={customPlugin}
            setCustomPlugin={setCustomPlugin}
          />
        )}
        <Output
          babelConfig={babelConfig}
          debouncedSource={debouncedSource}
          enableCustomPlugin={enableCustomPlugin}
          customPlugin={customPlugin}
          updateBabelConfig={updateBabelConfig}
          removeBabelConfig={removeBabelConfig}
        />
      </Grid>
    </Root>
  );
};

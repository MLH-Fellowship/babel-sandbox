import React, { useState, useCallback, useEffect } from "react";
import * as Babel from "@babel/standalone";

import { CustomPlugin } from "./CustomPlugin";
import { MainMenu } from "./MainMenu";
import { Forks } from "./Forks";
import { Input } from "./Input";
import { Output } from "./Output";
import { gzipSize } from "../gzip";
import { Root } from "./styles";
import { useDebounce } from "../utils/useDebounce";

import { Grid } from "semantic-ui-react";
import { plugins } from "../plugins-list";

window.babel = Babel;

/**
 * Converts internal json plugin/preset config to babel form
 * @param {Object} jsonConfig
 */
export function convertToBabelConfig(jsonConfig) {
  let result = { plugins: [], presets: [] };
  result.plugins = jsonConfig.plugins?.map(plugin => [
    plugin.name,
    plugin.defaultConfig,
  ]);
  result.presets = jsonConfig.presets?.map(preset => [
    preset.name,
    preset.defaultConfig,
  ]);
  return result;
}

export function convertToJsonConfig(babelConfig) {
  let result = { plugins: [], presets: [] };
  result.plugins = babelConfig.plugins?.map(plugin => {
    return {
      name: plugin[0],
      description: plugins[plugin[0]].description,
      fileLocation: plugins[plugin[0]].fileLocation,
      defaultConfig: plugin[1],
    };
  });
}

function importDefaultPlugins() {
  Object.keys(plugins).forEach(pluginName => {
    const script = document.createElement("script");
    script.src = plugins[pluginName].fileLocation;
    script.async = false;
    document.head.appendChild(script);
  });
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

export const App = ({ defaultSource, defaultConfig, defCustomPlugin, defaultId }) => {
  const [source, setSource] = React.useState(defaultSource);
  const [enableCustomPlugin, toggleCustomPlugin] = React.useState(false);
  const [customPlugin, setCustomPlugin] = React.useState(defCustomPlugin);
  const [id, setId] = useState(defaultId);
  const [jsonConfig, setJsonConfig] = useState(
    Array.isArray(defaultConfig) ? defaultConfig : [defaultConfig]
  );
  const [size, setSize] = useState(null);
  const [gzip, setGzip] = useState(null);
  const debouncedSource = useDebounce(source, 125);

  const [forksVisible, setForksVisible] = useState(false);
  const [forks, setForks] = useState([]);

  // (async () => {
  //   const blob = await REPLState.GetBlob(id) ?? null;
  //   setBlob(blob);
  // })();

  const updateBabelConfig = useCallback((config, index) => {
    setJsonConfig(configs => {
      const newConfigs = [...configs];
      newConfigs[index] = config;

      return newConfigs;
    });
  }, []);

  const removeBabelConfig = useCallback(index => {
    setJsonConfig(configs => configs.filter((c, i) => index !== i));
  }, []);

  useEffect(() => {
    let size = new Blob([debouncedSource], { type: "text/plain" }).size;
    setSize(size);
    gzipSize(debouncedSource).then(s => setGzip(s));
  }, [debouncedSource]);

  importDefaultPlugins();
  registerDefaultPlugins();

  return (
    <Root>
      <MainMenu
        source={source}
        setSource={setSource}
        jsonConfig={jsonConfig}
        setBabelConfig={setJsonConfig}
        customPlugin={customPlugin}
        toggleCustomPlugin={toggleCustomPlugin}
        enableCustomPlugin={enableCustomPlugin}
        id={id}
        setId={setId}
        setForksVisible={setForksVisible}
        forks={forks}
        setForks={setForks}
      />

      <Grid celled="internally">
        {forksVisible && <Forks forks={forks} />}
        <Input size={size} gzip={gzip} source={source} setSource={setSource} />
        {enableCustomPlugin && (
          <CustomPlugin
            toggleCustomPlugin={toggleCustomPlugin}
            customPlugin={customPlugin}
            setCustomPlugin={setCustomPlugin}
          />
        )}
        <Output
          babelConfig={jsonConfig}
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

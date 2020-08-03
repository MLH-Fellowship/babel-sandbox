import React, { useEffect, useState } from "react";
import * as Babel from "@babel/core";
import { processOptions } from "../standalone";
import { gzipSize } from "../gzip";
import { Wrapper, Code, Config } from "./styles";
import { useDebounce } from "../utils/useDebounce";

import { Grid, Icon, Menu, Segment, Divider } from "semantic-ui-react";

export function CompiledOutput({
  source,
  customPlugin,
  config,
  onConfigChange,
  removeConfig,
}) {
  const [compiled, setCompiled] = useState(null);
  const [gzip, setGzip] = useState(null);
  const debouncedPlugin = useDebounce(customPlugin, 125);

  useEffect(() => {
    try {
      const { code } = Babel.transform(
        source,
        processOptions(config, debouncedPlugin)
      );
      gzipSize(code).then(s => setGzip(s));
      setCompiled({
        code,
        size: new Blob([code], { type: "text/plain" }).size,
      });
    } catch (e) {
      setCompiled({
        code: e.message,
        error: true,
      });
    }
  }, [source, config, debouncedPlugin]);

  return (
    <Grid.Row>
      <Grid.Column width={16}>
        <Menu attached="top" tabular inverted>
          <Menu.Item>plugin.js</Menu.Item>
          <Menu.Menu position="right">
            <Menu.Item>
              {compiled?.size}b, {gzip}b
            </Menu.Item>
            <Menu.Item onClick={removeConfig}>
              <Icon name="close" size="" />
            </Menu.Item>
          </Menu.Menu>
        </Menu>
        <Segment inverted attached="bottom">
          <Grid columns={2} relaxed="very">
            <Grid.Column>
              <Wrapper>
                <Config
                  value={
                    config === Object(config)
                      ? JSON.stringify(config, null, "\t")
                      : config
                  }
                  onChange={onConfigChange}
                  docName="config.json"
                  config={{ mode: "application/json" }}
                />
              </Wrapper>
            </Grid.Column>
            <Grid.Column>
              <Code
                value={compiled?.code ?? ""}
                docName="result.js"
                config={{ readOnly: true, lineWrapping: true }}
                isError={compiled?.error ?? false}
              />
            </Grid.Column>
          </Grid>
          <Divider vertical>
            <Icon name="arrow right" />
          </Divider>
        </Segment>
      </Grid.Column>
    </Grid.Row>
  );
}

function CompiledOutput({
  source,
  customPlugin,
  config, //JSON config
  onConfigChange,
  setConfig,
  removeConfig,
}) {
  const [compiled, setCompiled] = useState(null);
  const [gzip, setGzip] = useState(null);
  const debouncedPlugin = useDebounce(customPlugin, 125);

  // const configBabel = convertToBabelConfig(config);

  const [configVisible, setConfigVisible] = useState(false);
  const [babelConfig, setBabelConfig] = useState(convertToBabelConfig(config));

  useEffect(() => {
    try {
      const { code } = Babel.transform(
        source,
        processOptions(babelConfig, debouncedPlugin)
        // config
      );
      gzipSize(code).then((s) => setGzip(s));
      setCompiled({
        code,
        size: new Blob([code], { type: "text/plain" }).size,
      });
    } catch (e) {
      console.log(e.message);
      setCompiled({
        code: e.message,
        error: true,
      });
    }
  }, [source, babelConfig, debouncedPlugin]);

  useEffect(() => {
    importDefaultPlugins();
    registerDefaultPlugins();
  })

  function toggleConfigVisible() {
    setConfigVisible(!configVisible);
  }

  function handlePluginChange(event) {
    const checkbox = event.target;
    if (checkbox.checked) {
      config.plugins.push(plugins[checkbox.name]);
      onConfigChange(config);
      setBabelConfig(convertToBabelConfig(config));
    } else {
      config.plugins = config.plugins.filter((plugin) => {
        return plugin.name !== checkbox.name;
      });
      onConfigChange(config);
      setBabelConfig(convertToBabelConfig(config));
    }
    console.log(config);
    console.log(babelConfig);
  }

  function displayAvailablePlugins() {
    return Object.keys(plugins).map((pluginName) => {
      const plugin = plugins[pluginName];
      return (
        <div>
          <label>
            <input name={pluginName} type="checkbox" onChange={handlePluginChange}/>
            {plugin.name}
          </label>
        </div>
      );
    })
  }

  return (
    <Wrapper>
      <Section>
        {displayAvailablePlugins()}
        <button onClick={toggleConfigVisible}>View/Hide config</button>
        { configVisible && (<Config
          value={
            babelConfig === Object(babelConfig)
              ? JSON.stringify(babelConfig, null, "\t")
              : babelConfig
          }
          onChange={(value) => onConfigChange(convertToJsonConfig(value))}
          docName="config.json"
          config={{ mode: "application/json" }}
        />)}
        <Config
          value={
            config === Object(config)
              ? JSON.stringify(config, null, "\t")
              : config
          }
          onChange={(value) => {return 0}}
          docName="config.json"
          config={{ mode: "application/json" }}
        />
      </Section>
      <Section>
        <Code
          value={compiled?.code ?? ""}
          docName="result.js"
          config={{ readOnly: true, lineWrapping: true }}
          isError={compiled?.error ?? false}
        />
      </Section>
      <FileSize>
        {compiled?.size}b, {gzip}b
      </FileSize>
      <Toggle onClick={removeConfig} />
    </Wrapper>
  );
}

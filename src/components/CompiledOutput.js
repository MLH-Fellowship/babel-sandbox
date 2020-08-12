import React, { useEffect, useState, Fragment } from "react";
import * as Babel from "@babel/standalone";
import { processOptions } from "../standalone";
import { gzipSize } from "../gzip";
import { Wrapper, Code, Config } from "./styles";
import { useDebounce } from "../utils/useDebounce";
import Transition from "./Transitions";
import { TimeTravel } from "./TimeTravel";

import { plugins, presets } from "../plugins-list";

import {
  Grid,
  Icon,
  Menu,
  Segment,
  Divider,
  Checkbox,
} from "semantic-ui-react";
import { check, string } from "yargs";

export function CompiledOutput({
  source,
  customPlugin,
  config,
  onConfigChange,
  removeConfig,
}) {
  const [compiled, setCompiled] = useState(null);
  const [stringConfig, setStringConfig] = useState(JSON.stringify(config, null, '\t'));
  const [gzip, setGzip] = useState(null);
  const debouncedPlugin = useDebounce(customPlugin, 125);

  const [timeTravel, setTimeTravel] = useState(null);

  const [timeTravelCode, setTimeTravelCode] = useState();

  let saveConfig = () => {

    let options = processOptions(config, debouncedPlugin);

    const transitions = new Transition();
    options.wrapPluginVisitorMethod = transitions.wrapPluginVisitorMethod;
    setTimeTravel(transitions.getValue());

    const { code } = Babel.transform(source, options);

    gzipSize(code).then(s => setGzip(s));

    setCompiled({
      code,
      size: new Blob([code], { type: "text/plain" }).size,
    });

  }

  useEffect(saveConfig, [source, config, debouncedPlugin]);

  useEffect(() => {
    setStringConfig(JSON.stringify(config, null, '\t'));
  }, [config])

  useEffect(() => {

    console.log('stringConfig changed')

    try {
      let sconfig = JSON.parse(stringConfig);
      saveConfig(sconfig);
    } catch (e) {
      setCompiled({
        code: e.message,
        error: true,
      });
    }

  }, [stringConfig])

  function displayAvailablePlugins() {
    return Object.keys(plugins).map(pluginName => {
      return (
        <Segment
          key={pluginName}>
          <Checkbox
            toggle
            name={pluginName}
            type="checkbox"
            onChange={handlePluginChange}
            label={pluginName}
          />
        </Segment>
      );
    });
  }

  function displayAvailablePresets() {
    return Object.keys(presets).map(presetName => {
      return (
        <Segment
          key={presetName}>
          <Checkbox
            toggle
            name={presetName}
            type="checkbox"
            onChange={handlePresetChange}
            label={presetName}
          />
        </Segment>
      );
    });
  }

  function handlePluginChange(reactEvent, checkbox) {

    console.log('plugin change', stringConfig)

    config.plugins = config.plugins || [];
    if (checkbox.checked) {
      config.plugins.push([plugins[checkbox.name].name, plugins[checkbox.name].defaultConfig]);
      onConfigChange(config);
      setStringConfig(JSON.stringify(config, null, '\t'));
    } else {
      config.plugins = config.plugins.filter(plugin => {
        return plugin[0] !== checkbox.name;
      });
      setStringConfig(JSON.stringify(config, null, '\t'));
      onConfigChange(config);
    }
    console.log('handlepluginchnage reuslt', config);
  }

  function handlePresetChange(reactEvent, checkbox) {
    if (checkbox.checked) {
      config.presets.push([presets[checkbox.name].name, presets[checkbox.name].defaultConfig]);
      setStringConfig(JSON.stringify(config, null, '\t'));
      onConfigChange(config);
    } else {
      config.presets = config.presets.filter(preset => {
        return preset[0] !== checkbox.name;
      });
      setStringConfig(JSON.stringify(config, null, '\t'));
      onConfigChange(config);
    }
  }

  function handleStringConfigChange(configText) {

    console.log('changed')

    try {


      let sConfig = JSON.parse(configText)
      onConfigChange(sConfig);

    } catch (e) {
      console.log('invalid config')
    }
    setStringConfig(configText)
  }


  return (
    <Fragment>
      <Grid.Row>
        <Grid.Column width={16}>
          <Menu attached="top" tabular inverted>
            <Menu.Item>input.json</Menu.Item>
            <Menu.Menu position="right">
              <Menu.Item>
                {compiled?.size}b, {gzip}b
              </Menu.Item>
              <Menu.Item onClick={removeConfig}>
                <Icon name="close" />
              </Menu.Item>
            </Menu.Menu>
          </Menu>
          <Segment inverted attached="bottom">
            <Grid columns={2} relaxed="very">
              <Grid.Column>
                <Segment.Group piled>{displayAvailablePlugins()}</Segment.Group>
                <Segment.Group piled>{displayAvailablePresets()}</Segment.Group>
                <Wrapper>
                  <Config
                    value={stringConfig}
                    onChange={handleStringConfigChange}
                    docName="config.json"
                    config={{ mode: "application/json" }}
                  />
                </Wrapper>
              </Grid.Column>
              <Grid.Column>
                <Code
                  value={
                    timeTravelCode !== undefined
                      ? timeTravelCode
                      : compiled?.code
                  }
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
      <TimeTravel
        timeTravel={timeTravel}
        setTimeTravel={setTimeTravel}
        removeConfig={removeConfig}
        source={compiled?.code ?? ""}
        setTimeTravelCode={setTimeTravelCode}
      />
    </Fragment>
  );
}

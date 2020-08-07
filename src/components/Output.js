import React from "react";
import { CompiledOutput } from "./CompiledOutput";


let panes = [];
const TabExampleBasic = () => <Tab panes={panes} />

console.log(configs)

panes = configs.map((config) => {
  return { menuItem: 'Tab 1', render: () => <Tab.Pane>Tab 1 Content</Tab.Pane> }
})

export function Output({
  babelConfig,
  debouncedSource,
  enableCustomPlugin,
  customPlugin,
  updateBabelConfig,
  removeBabelConfig,
}) {
  return babelConfig.map((config, index) => {
    return (
      <CompiledOutput
        source={debouncedSource}
        customPlugin={enableCustomPlugin ? customPlugin : undefined}
        config={config}
        key={index}
        onConfigChange={config => updateBabelConfig(config, index)}
        removeConfig={() => removeBabelConfig(index)}
      />
    );
  });
}

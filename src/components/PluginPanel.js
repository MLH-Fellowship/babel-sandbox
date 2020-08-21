import React from "react";
import { Checkbox, Segment } from "semantic-ui-react";
import {PluginToggle} from "./PluginToggle";

export function PluginPanel({
  pluginList,
  onChange,
  stringConfig,
}) {
  return (
    <>
      {Object.keys(pluginList).map(pluginName => {
        return (
          <PluginToggle
            pluginName={pluginName}
            onChange={onChange}
            stringConfig={stringConfig}
          />
        );
      })}

    </>
  )
}
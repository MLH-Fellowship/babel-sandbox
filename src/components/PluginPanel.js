import React from 'react';
import { Checkbox, Segment } from "semantic-ui-react";

export function PluginPanel({
  pluginList,
  onChange
}) {
  return (
    <>
      {Object.keys(pluginList).map(pluginName => {
        return (
          <Segment key={pluginName}>
            <Checkbox
              toggle
              name={pluginName}
              type="checkbox"
              onChange={onChange}
              label={pluginName}
            />
          </Segment>
        );
      })}

    </>
  )
}
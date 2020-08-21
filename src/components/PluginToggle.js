import React, {useState, useEffect} from "react";
import {Segment, Checkbox} from "semantic-ui-react";

export function PluginToggle({
  pluginName,
  onChange,
  stringConfig,
}) {
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    // Crude implementation
    setChecked(stringConfig.includes(pluginName));
  }, [stringConfig]);
  return (
    <Segment key={pluginName}>
      <Checkbox
        toggle
        name={pluginName}
        type="checkbox"
        onChange={onChange}
        label={pluginName}
        checked={checked}
      />
    </Segment>
  );
}
import React, { Fragment, useState } from "react";
import { CompiledOutput } from "./CompiledOutput";

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

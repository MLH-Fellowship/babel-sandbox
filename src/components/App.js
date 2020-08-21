import React, { useCallback, useEffect, useRef, useState } from "react";
import * as Babel from "@babel/standalone";

import { CustomPlugin } from "./CustomPlugin";
import { MainMenu } from "./MainMenu";
import { Forks } from "./Forks";
import { Input } from "./Input";
import { CompiledOutput } from "./CompiledOutput"
import { gzipSize } from "../gzip";
import { Root } from "./styles";
import { useDebounce } from "../utils/useDebounce";
import SplitPane from 'react-split-pane';

import { Tab } from "semantic-ui-react";

window.babel = Babel;

export const App = ({
  defaultSource,
  defaultConfig,
  defCustomPlugin,
  defaultId,
  defaultForks,
}) => {
  const [source, setSource] = React.useState(defaultSource);
  const [enableCustomPlugin, toggleCustomPlugin] = React.useState(true);
  const [customPlugin, setCustomPlugin] = React.useState(defCustomPlugin);
  const [id, setId] = useState(defaultId);
  const [jsonConfig, setJsonConfig] = useState(
    Array.isArray(defaultConfig) ? defaultConfig : [defaultConfig]
  );
  const [size, setSize] = useState(null);
  const [gzip, setGzip] = useState(null);
  const debouncedSource = useDebounce(source, 125);

  const [panes, setPanes] = useState([]);

  const [forksVisible, setForksVisible] = useState(false);
  const [forks, setForks] = useState(defaultForks);

  function toggleForksVisible() {
    setForksVisible(!forksVisible);
  }
  const [cursor, setCursor] = useState({ line: 0, ch: 0 });
  const [cursorAST, setCursorAST] = useState({
    anchor: { line: 0, ch: 0 },
    head: { line: 0, ch: 0 },
  });
  const debouncedCursor = useDebounce(cursor, 125);
  const editorRef = useRef(null);

  const updateBabelConfig = useCallback(
    (config, index) => {
      jsonConfig[index] = config;
      setJsonConfig(jsonConfig);
    },
    [jsonConfig]
  );

  const removeBabelConfig = useCallback(index => {
    setJsonConfig(configs => configs.filter((c, i) => index !== i));
  }, []);

  useEffect(() => {
    let size = new Blob([debouncedSource], { type: "text/plain" }).size;
    setSize(size);
    gzipSize(debouncedSource).then(s => setGzip(s));
  }, [debouncedSource]);

  useEffect(() => {
    if (editorRef && editorRef.current && cursorAST.anchor && cursorAST.head) {
      editorRef.current.editor.setSelection(cursorAST.anchor, cursorAST.head, {
        scroll: false,
      });
    }
  }, [editorRef, cursorAST]);

  useEffect(() => {
    setPanes(
      jsonConfig.map((config, index) => {
        let name;
        if (!index) {
          name = "Config.json";
        } else {
          name = `Config${index + 1}.json`;
        }

        return {
          menuItem: name,
          render: () => (
            <CompiledOutput
              source={debouncedSource}
              customPlugin={enableCustomPlugin ? customPlugin : undefined}
              config={config}
              cloneConfig={() => {
                setJsonConfig(configs => [
                  ...configs,
                  // Deep copy of config
                  JSON.parse(JSON.stringify(config)),
                ])
              }}
              onConfigChange={config => updateBabelConfig(config, index)}
              removeConfig={() => removeBabelConfig(index)}
              cursor={debouncedCursor}
              setCursorAST={setCursorAST}
            />
          ),
        };
      })
    );
  }, [
      jsonConfig,
      enableCustomPlugin,
      customPlugin,
      updateBabelConfig,
      removeBabelConfig,
      debouncedSource,
      debouncedCursor,
      setCursorAST,
    ]);

  return (
    <Root>
      <SplitPane split="vertical" minSize={50} defaultSize={400}>
        <SplitPane split="horizontal" minSize={40} defaultSize={500}>
          <div style={{ width: '100%', height: '100%' }}>
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
              toggleForksVisible={toggleForksVisible}
              forks={forks}
              setForks={setForks}
              configsCount={jsonConfig.length}
              style={{ zIndex: 100 }}
            />
            <Input
              size={size}
              gzip={gzip}
              source={source}
              ref={editorRef}
              setSource={setSource}
              setCursor={setCursor}
            />
          </div>
          <>
            {forksVisible && <Forks forks={forks} />}
            {enableCustomPlugin && (
              <CustomPlugin
                toggleCustomPlugin={toggleCustomPlugin}
                customPlugin={customPlugin}
                setCustomPlugin={setCustomPlugin}
              />
            )}
          </>
        </SplitPane>
        <Tab
          panes={panes}
          menu={{
            color: "black",
            inverted: true,
            tabular: false,
            attached: true,
          }}
        />
      </SplitPane>

    </Root>
  );
};

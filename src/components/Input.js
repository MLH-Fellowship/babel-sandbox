import React from "react";
import { Grid, Menu, Segment } from "semantic-ui-react";
import { Code } from "./styles";

export function Input({ size, gzip, source, setSource, setCursor }) {
  return (
    <Grid.Row>
      <Grid.Column width={16}>
        <Menu attached="top" tabular inverted>
          <Menu.Item>input.js</Menu.Item>
          <Menu.Menu position="right">
            <Menu.Item>
              {size}b, {gzip}b
            </Menu.Item>
          </Menu.Menu>
        </Menu>
        <Segment inverted attached="bottom">
          <Code
            value={source}
            onChange={val => setSource(val)}
            onCursor={cursor => setCursor(cursor)}
            docName="source.js"
          />
        </Segment>
      </Grid.Column>
    </Grid.Row>
  );
}

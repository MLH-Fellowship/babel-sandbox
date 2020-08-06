import React from "react";
import { Dropdown, Icon, Menu, Button, Label } from "semantic-ui-react";
import REPLState from "../state/REPLState.js";
import {extractID} from "../state/index";
import { ShareModal } from "./ShareModal";

// POST request to fork current
async function fork(ID) {
  const url = `/api/v1/blobs/fork/${ID}`;
  try {
    const resp = await fetch(url, {
      method: 'post',
      body: JSON.stringify({
        forkedFrom: ID, //???
        forks: [],
      }),
    });
    return resp.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

// GET request to get number of forks
async function numberOfForks(ID) {
  const url = `/api/v1/blobs/get-blob/${ID}`;
  try {
    const resp = await fetch(url);
    return resp.json()["forks"].length();
  } catch (err) {
    console.error(err);
    return null;
  }
}

// GET requrest to list all forks
async function getForks(ID) {
  const url = `/api/v1/blobs/get-blob/${ID}`;
  try {
    const resp = await fetch(url);
    return resp.json()["forks"];
  } catch (err) {
    console.error(err);
    return null;
  }
}

export function MainMenu({
  source,
  setSource,
  jsonConfig,
  setBabelConfig,
  customPlugin,
  toggleCustomPlugin,
  enableCustomPlugin,
}) {
  const [shareLink, setShareLink] = React.useState("");
  const [showShareLink, setShowShareLink] = React.useState(false);
  return (
    <Menu attached="top" inverted>
      <Menu.Item>
        <img
          src="https://d33wubrfki0l68.cloudfront.net/7a197cfe44548cc1a3f581152af70a3051e11671/78df8/img/babel.svg"
          alt="Babel Logo"
        />
      </Menu.Item>
      <Dropdown item icon="wrench" simple>
        <Dropdown.Menu>
          <Dropdown.Item
            onClick={() => {
              setSource("const hello = 'world';");
            }}
          >
            Load Example
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() =>
              setBabelConfig(configs => [
                ...configs,
                configs[configs.length - 1],
              ])
            }
          >
            Add Config
          </Dropdown.Item>
          <Dropdown.Item>
            <Icon name="dropdown" />
            <span className="text">Add Plugin</span>

            <Dropdown.Menu>
              <Dropdown.Item
                onClick={() => toggleCustomPlugin(!enableCustomPlugin)}
              >
                Custom
              </Dropdown.Item>
              <Dropdown.Item>Import</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item>Save...</Dropdown.Item>
          <ShareModal
            shareLink={shareLink}
            trigger={
              <Dropdown.Item
                onClick={async () => {
                  const state = new REPLState(
                    source,
                    enableCustomPlugin ? customPlugin : "",
                    jsonConfig.map(config => JSON.stringify(config))
                  );
                  const link = await state.Link();
                  setShareLink(link);
                  setShowShareLink(true);
                }}
              >
                Share
              </Dropdown.Item>
            }
          />
        </Dropdown.Menu>
      </Dropdown>
      <Menu.Item>
        <Button as="div" labelPosition="right">
          <Button
            icon
            onClick={async () => {
              const state = new REPLState(
                source,
                enableCustomPlugin ? customPlugin : "",
                jsonConfig.map(config => JSON.stringify(config))
              );
              const fork = await state.Fork(extractID());
            }}
          >
            <Icon name="fork" />
          </Button>
          <Label
            as="a"
            basic
            onClick={() => {
              // REPLState.FromID(extractID()).
            }}
          >
            {REPLState.GetBlob(extractID())["forks"].length()}
          </Label>
        </Button>
      </Menu.Item>
    </Menu>
  );
}

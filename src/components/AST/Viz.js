import React, {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { parse } from "@babel/parser";
import JSONPretty from "react-json-pretty";
import { Accordion, Grid, Popup, Segment, Checkbox } from "semantic-ui-react";
import UglyPopup, { lookUpNodeType } from "../Popup";
import {
  StyledAccordion,
  StyledAccordionTitle,
  HighlightedSubAccordion,
} from "../styles";
import { isBound, fixLoc, sortByCompositeness } from "./utils";

// DFS through AST generated by Babel parser

const SettingsContext = createContext();

// This is the component for a sub-tree of an object in the AST.
function CompositeObj({ k, obj, cursor, setPos }) {
  const { hideEmpty, hideTypes, hideLocation, sortTree } = useContext(
    SettingsContext
  );
  // setPos is memoized so dependency is just to placate warnings.
  const content = useMemo(() => {
    // Memoization should be helpful when parts of the tree are the same.
    let subTree = Object.entries(obj).map(([i, v], index) => {
      // i, v are key and value.
      if ((hideTypes && i === "type") || (hideLocation && i === "loc")) {
        return [v, null];
      }
      return [
        v,
        <Fragment key={index}>
          {typeof v === "object" && v !== null ? (
            <Composite k={i} ast={v} cursor={cursor} setPos={setPos} />
          ) : (
            <Primitive k={i} val={v} />
          )}
        </Fragment>,
      ];
    });
    subTree = sortTree
      ? subTree.sort((former, latter) => {
          return sortByCompositeness(former[0], latter[0]);
        })
      : subTree;
    return subTree.map(v => v[1]);
  }, [obj, cursor, setPos, hideTypes, hideLocation, sortTree]);

  const { type, loc, value, name } = obj;
  const label = type ? type : k;
  const keys = Object.keys(obj);
  const [active, setActive] = useState(false);
  const highlight = useMemo(() => {
    return (
      (value !== undefined || name !== undefined || !active) &&
      isBound(cursor, loc)
    );
  }, [active, cursor, loc, value, name]);

  const popup = lookUpNodeType(type);
  const title = `${label} : ${active ? "" : `{ ${keys.join(", ")} }`}`;
  const panels = [
    {
      key: 0,
      title: (
        <StyledAccordionTitle
          content={
            popup.length ? (
              <Popup
                content={<UglyPopup def={popup} />}
                on="hover"
                trigger={<span>{title}</span>}
              />
            ) : (
              title
            )
          }
        />
      ),
      content,
    },
  ];

  const props = {
    highlight: highlight ? 1 : 0,
    onTitleClick: () => {
      loc && setPos(fixLoc(loc));
      setActive(active => !active);
    },
    panels,
  };

  return keys.length ? (
    <HighlightedSubAccordion {...props} />
  ) : hideEmpty ? null : (
    <Primitive k={label} val="{ }" />
  );
}

// This is the component for the sub-tree of an array.
function CompositeArr({ k, arr, cursor, setPos }) {
  const { hideEmpty } = useContext(SettingsContext);
  // setPos is memoized so dependency is just to placate warnings.
  const components = useMemo(() => {
    // Memoization should be helpful when parts of the tree are the same.
    return arr.map((value, index) => {
      return (
        <Fragment key={index}>
          {typeof value === "object" && value !== null ? (
            <Composite k={k} ast={value} cursor={cursor} setPos={setPos} />
          ) : (
            <Primitive k={k} ast={value} />
          )}
        </Fragment>
      );
    });
  }, [k, arr, cursor, setPos]);

  const [active, setActive] = useState(false);
  const highlight = useMemo(() => {
    return !active && arr.some(x => x && isBound(cursor, x.loc));
  }, [active, arr, cursor]);
  const panels = [
    {
      key: 0,
      title: (
        <StyledAccordionTitle
          content={`${k} : ${active ? "" : `[ ${arr.length} element ]`}`}
        />
      ),
      content: components,
    },
  ];

  const props = {
    highlight: highlight ? 1 : 0,
    onTitleClick: () => {
      setActive(active => !active);
    },
    panels,
  };

  return arr.length ? (
    <HighlightedSubAccordion {...props} />
  ) : hideEmpty ? null : (
    <Primitive k={k} val="[ ]" />
  );
}

// This is the overhead component for objects and arrays in the AST object.
function Composite({ k, ast, cursor, setPos }) {
  return !Array.isArray(ast) ? (
    <CompositeObj k={k} obj={ast} cursor={cursor} setPos={setPos} />
  ) : (
    <CompositeArr k={k} arr={ast} cursor={cursor} setPos={setPos} />
  );
}

// This is the base case for the recursion when the AST is just a leaf node.
function Primitive({ k, val }) {
  const { hideEmpty, hideLocation } = useContext(SettingsContext);
  // Hide all falsy values except zero
  if (hideEmpty && !val && val !== 0) return null;
  if (hideLocation && (k === "start" || k === "end")) return null;
  return (
    <Accordion.Content>
      {k && k + " : "}
      {String(val)}
    </Accordion.Content>
  );
}

function Viz({ code, cursor, setCursorAST, plugins }) {
  const setPos = useCallback(setCursorAST);
  try {
    const ast = useMemo(() => parse(code, { startLine: 0, plugins }), [
      code,
      plugins,
    ]);
    const panels = [
      {
        key: 0,
        content: <Composite k="" ast={ast} cursor={cursor} setPos={setPos} />,
      },
    ];
    return <StyledAccordion panels={panels} fluid styled />;
  } catch (err) {
    return (
      <StyledAccordionTitle
        icon={"x"}
        content={<Primitive k="" val={err.message} />}
      />
    );
  }
}

function VizWrapper(props) {
  const { code, cursor, setCursorAST, plugins } = props;
  const { setHideEmpty, setHideTypes, setHideLocation, setSortTree } = props;
  const { hideEmpty, hideTypes, hideLocation, sortTree } = useContext(
    SettingsContext
  );

  return (
    <Fragment>
      <Grid>
        <Grid.Column floated="left">
          <Checkbox
            toggle
            defaultChecked={hideEmpty}
            type="checkbox"
            name="Hide Empty"
            label="Hide Empty"
            onClick={() => setHideEmpty(hideEmpty => !hideEmpty)}
          />
        </Grid.Column>
        <Grid.Column floated="left">
          <Checkbox
            toggle
            defaultChecked={hideTypes}
            type="checkbox"
            name="Hide Types"
            label="Hide Types"
            onClick={() => setHideTypes(hideTypes => !hideTypes)}
          />
        </Grid.Column>
        <Grid.Column floated="left">
          <Checkbox
            toggle
            defaultChecked={hideLocation}
            type="checkbox"
            name="Hide Location"
            label="Hide Location"
            onClick={() => setHideLocation(hideLocation => !hideLocation)}
          />
        </Grid.Column>
        <Grid.Column floated="left">
          <Checkbox
            toggle
            defaultChecked={sortTree}
            type="checkbox"
            name="Sort AST"
            label="Sort AST"
            onClick={() => setSortTree(sortTree => !sortTree)}
          />
        </Grid.Column>
      </Grid>
      <Viz
        code={code}
        cursor={cursor}
        setCursorAST={setCursorAST}
        plugins={plugins}
      />
    </Fragment>
  );
}

function JSONViewer({ code, plugins }) {
  try {
    const ast = useMemo(() => parse(code, { startLine: 0, plugins }), [
      code,
      plugins,
    ]);

    return <JSONPretty data={ast} />;
  } catch (err) {
    return <JSONPretty data={err.message} />;
  }
}

export default function VizOutput(props) {
  const { code, plugins, showJSON } = props;
  const [hideEmpty, setHideEmpty] = useState(true);
  const [hideTypes, setHideTypes] = useState(true);
  const [hideLocation, setHideLocation] = useState(true);
  const [sortTree, setSortTree] = useState(false);
  const vizProps = { setHideEmpty, setHideTypes, setHideLocation, setSortTree };
  const settings = { hideEmpty, hideTypes, hideLocation, sortTree };
  const jsonStyles = {
    overflow: "auto",
    maxHeight: 800,
    display: showJSON ? "block" : "none",
  };
  const asteStyles = {
    display: showJSON ? "none" : "block",
  };

  return (
    <Grid.Row>
      <Grid.Column>
        <Segment style={jsonStyles}>
          <JSONViewer code={code} plugins={plugins} />
        </Segment>
        <SettingsContext.Provider value={settings}>
          <Segment style={asteStyles}>
            <VizWrapper {...props} {...vizProps} />
          </Segment>
        </SettingsContext.Provider>
      </Grid.Column>
    </Grid.Row>
  );
}

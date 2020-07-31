import PropTypes from 'prop-types';
import React, { createElement, useEffect, useState } from 'react';
import visualizations from './visualization';

import cx from '../../ASTExplorer/utils/classnames.js';
import { parserMiddleware } from '../../ASTExplorer/parsers/parser.js'
import { getParserByID } from '../../ASTExplorer/parsers/index.js'

async function buildParseResult(realParser, code, setter) {
  setter(await parserMiddleware(realParser, code));
}

export function ASTOutput({code, position}) {
  const [parseResult, setParseResult] = useState({})
  const [selectedOutput, setSelectedOutput] = useState(0);

  useEffect(() => {
    buildParseResult(getParserByID("babylon7"), code, setParseResult)
  }, [code])

  const {ast=null} = parseResult;
  let output;

  if (parseResult.error) {
    output =
      <div style={{padding: 20}}>
        {parseResult.error.message}
      </div>;
  } else if (ast) {
    output = (
      <ErrorBoundary>
        {
          createElement(
            visualizations[selectedOutput],
            {parseResult, position},
          )
        }
      </ErrorBoundary>
    )
  }

  let buttons = visualizations.map(
    (cls, index) =>
      <button
        key={index}
        value={index}
        onClick={event => setSelectedOutput(event.target.value)}
        className={cx({
          active: selectedOutput == index,
        })}>
        {cls.name}
      </button>,
  );

  return (
    <div className="output highlight">
      <div className="toolbar">
        {buttons}
      </div>
    {output}
    </div>
  );
}

ASTOutput.propTypes = {
  parseResult: PropTypes.object,
  position: PropTypes.number,
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{padding: 20}}>
					An error was caught while rendering the AST. This usually is an issue with
          astexplorer itself. Have a look at the console for more information.
				</div>
			);
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
};

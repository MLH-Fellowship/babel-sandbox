import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import cx from '../../ASTExplorer/utils/classnames.js';
import visualizations from './visualization';
import parser from '../../ASTExplorer/parsers/parser.js'
import { getParserByID } from '../../ASTExplorer/parsers/index.js'

const {useState} = React;

function formatTime(time) {
  if (!time) {
    return null;
  }
  if (time < 1000) {
    return `${time}ms`;
  }
  return `${(time / 1000).toFixed(2)}s`;
}

async function getParseResult(realParser, code, setter) {
  setter(await parser(realParser, code));
}

export default function ASTOutput({code={}, position=null}) {
  const [parseResult, setParseResult] = useState({})
  const [selectedOutput, setSelectedOutput] = useState(0);

  useEffect(() => {
    getParseResult(getParserByID("babylon7"), code, setParseResult)
  }, [parseResult])

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
          React.createElement(
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
          Consider <a href="https://github.com/fkling/astexplorer/issues/new?template=bug_report.md">filing a bug report</a>, but <a href="https://github.com/fkling/astexplorer/issues/">check first</a> if one doesn&quot;t already exist. Thank you!
				</div>
			);
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
};


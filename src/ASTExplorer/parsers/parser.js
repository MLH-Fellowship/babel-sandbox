import {ignoreKeysFilter, locationInformationFilter, functionFilter, emptyKeysFilter, typeKeysFilter} from '../core/TreeAdapter.js';

function parse(parser, code) {
  if (!parser._promise) {
    parser._promise = new Promise(parser.loadParser);
  }
  return parser._promise.then(
    realParser => parser.parse(
      realParser,
      code,
      parser.getDefaultOptions(),
    ),
  );
}

export function parserMiddleware(parser, code) {
  const start = Date.now();
  return parse(parser, code).then(
    ast => {
      const treeAdapter = {
        type: 'default',
        options: {
          openByDefault: (parser.opensByDefault || (() => false)).bind(parser),
          nodeToRange: parser.nodeToRange.bind(parser),
          nodeToName: parser.getNodeName.bind(parser),
          walkNode: parser.forEachProperty.bind(parser),
          filters: [
            ignoreKeysFilter(parser._ignoredProperties),
            functionFilter(),
            emptyKeysFilter(),
            locationInformationFilter(parser.locationProps),
            typeKeysFilter(parser.typeProps),
          ],
        },
      };
      return {
        time: Date.now() - start,
        ast: ast,
        error: null,
        treeAdapter,
      }
    },
    error => {
      console.error(error); // eslint-disable-line no-console
      return {
        time: null,
        ast: null,
        treeAdapter: null,
        error,
      }
    },
  );
};

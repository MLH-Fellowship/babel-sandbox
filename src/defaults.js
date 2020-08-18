export const DEFAULT_SOURCE = `Promise.allSettled([p1, p2]).finally(() => {
  console.log("Done!");
});
`;
export const DEFAULT_CONFIG = [
  {
    plugins: [
      // [
      //   "babel-plugin-polyfill-corejs3",
      //   {
      //     method: "usage-global",
      //     targets: {
      //       edge: 16,
      //     },
      //   },
      // ],
      // {
      //   name: "babel-plugin-polyfill-corejs3",
      //   description: "does this",
      //   fileLocation: "babel-plugin-polyfill-corejs3",
      //   defaultConfig: {
      //     method: "usage-global",
      //     targets: {
      //       edge: 16,
      //     }
      //   },
      // },
    ],
    presets: [
      // {
      //   name: "env",
      //   description: "does this",
      //   defaultConfig: {},
      // }
    ],
  },
  // {},
];

export const DEFAULT_PLUGIN = `export default function customPlugin(babel) {
  return {
    visitor: {
      Identifier(path) {
        // Replace with your own code!😊
        // console.log(path.node.name);
      }
    }
  };
}
`;

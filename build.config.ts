import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    "src/index",
    "src/handlers",
    "src/test-utils"
  ],
  declaration: true,
  rollup: {
    emitCJS: true
  },
  failOnWarn: false
});

import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'], // main entrypoint
  format: ['esm'],         // ESM is required for tree-shaking
  dts: true,               // generate types
  splitting: true,         // allows splitting the code
  treeshake: true,         // removes unused code (if you dont use defineOption() for example, it will be removed from final bundle)
  clean: true,
  minify: 'terser',
  terserOptions: { // configure terser to only remove comments
    compress: false, // don't simplify code logic
    mangle: false,   // don't rename variables
    format: {
      comments: false, // remove all comments
      beautify: true,  
    },
  },
});

// this extracts all CSS imported in src/index.ts into a single dist/index.css there is no need to use --inject-style
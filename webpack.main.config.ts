import type { Configuration } from 'webpack';
import path from 'path'

import { rules } from './webpack.rules';

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/index.ts',
  // Put your normal webpack config below here
  module: {
    rules,
  },
  resolve: {
    alias: {
      "assets": path.resolve(__dirname, "./src/assets"),
      "components": path.resolve(__dirname, "./src/components"),
      "pages": path.resolve(__dirname, "./src/pages"),
      "routes": path.resolve(__dirname, "./src/routes"),
      "store": path.resolve(__dirname, "./src/store"),
      "scss": path.resolve(__dirname, "./src/scss"),    
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json', '.scss'],
  },
};

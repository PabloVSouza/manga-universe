import type { Configuration } from 'webpack';
import path from 'path'

import { rules } from './webpack.rules';

export const mainConfig: Configuration = {
  entry: './src/index.ts',
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

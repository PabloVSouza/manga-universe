import type { Configuration } from 'webpack';
import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';
import path from 'path'


rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

rules.push({
  test: /\.s[ac]ss$/i,
    use: [
      // Creates `style` nodes from JS strings
      "style-loader",
      // Translates CSS into CommonJS
      "css-loader",
      // Compiles Sass to CSS
      "sass-loader",
    ],
})

export const rendererConfig: Configuration = {
  devtool: "source-map",

  module: {
    rules,
  },
  plugins,
  resolve: {
    alias: {
      "assets": path.resolve(__dirname, "./src/assets"),
      "components": path.resolve(__dirname, "./src/components"),
      "pages": path.resolve(__dirname, "./src/pages"),
      "routes": path.resolve(__dirname, "./src/routes"),
      "store": path.resolve(__dirname, "./src/store"),
      "scss": path.resolve(__dirname, "./src/scss"),    
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.scss'],
  },
};

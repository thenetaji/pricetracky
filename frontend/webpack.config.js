import path from "path";
import { fileURLToPath } from "url";

//webpack plugins
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import TerserWebpackPlugin from "terser-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pages = [
  { template: "contact.html", filename: "contact" },
  { template: "privacy.html", filename: "privacy" },
  { template: "disclaimer.html", filename: "disclaimer" },
];

export default {
  mode: "development",
  entry: {
    index: path.resolve(__dirname, "src", "js", "index.js"),
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "js/index-[contenthash].js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "index.html"),
      filename: "index-[contenthash].html",
      title: "Site Title",
    }),
    ...pages.map(
      (page) =>
        new HtmlWebpackPlugin({
          template: path.resolve(__dirname, "src", "html", page.template),
          filename: `html/${page.filename}-[contenthash].html`,
        }),
    ),
    new MiniCssExtractPlugin({
      filename: "css/[name]-[contenthash].css",
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "public"),
          to: path.resolve(__dirname, "dist"),
        },
      ],
    }),
  ],
  /**optimization: {
    minimize: true,
    minimizer: [new TerserWebpackPlugin()],
  },**/
  devServer: {
    static: {
      directory: path.resolve(__dirname, "dist"),
    },
    hot: true,
    port: 5173,
  },
};

/**
 * Webpack config used to build the UI used by the Electron renderer
 * process (the react frontend).
 */
const path = require("path")
const webpack = require("webpack")
const webpackMergeConfigs = require("webpack-merge")
const HtmlWebpackPlugin = require("html-webpack-plugin")

const port = process.env.PORT || 3000
const forProduction = process.env.NODE_ENV === "production"

const paths = require("./paths")

const bundleFilename = "bundle.js"
const styleFilename = "style.css"

const distDir = path.resolve(__dirname, "../dist")

const typeScriptLoader = {
  loader: "ts-loader",
  options: {
    configFile: path.resolve(__dirname, process.env.TSCONFIG || "tsconfig.json"),
    transpileOnly: true,
    experimentalWatchApi: true,
  },
}

const uiComponentLoader = {
  loader: "ui-component-loader",
  options: {
    lib: "antd",
    libDir: "es",
    camel2: "-",
    style: "style/index.css",
  },
}

const baseConfig = {
  // https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
  target: "electron-renderer",

  resolve: {
    extensions: [".js", ".ts", ".tsx"],
    alias: {
      app: path.resolve(__dirname, "../app")
    },
    modules: [
      path.resolve(__dirname, "../node_modules"),
      path.resolve(__dirname, "../resources")
    ]
  },

  output: {
    path: distDir,
    filename: bundleFilename,
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: "commonjs2"
  },

  module: {
    rules: [
      // SASS stylesheets
      {
        test: /\.global\.(scss|sass)$/,
        use: [
          "style-loader",
          "css-loader?&sourceMap&importLoaders&localIdentName=[name]__[local]___[hash:base64:5]",
          "sass-loader",
        ],
      },
      {
        test: /^((?!\.global).)*\.(scss|sass)$/,
        use: [
          "style-loader",
          "css-loader?modules&sourceMap&importLoaders&localIdentName=[name]__[local]___[hash:base64:5]",
          "sass-loader"
        ]
      },
      // CSS stylesheets
      {
        test: /^(?!antd).*\.css$/,
        exclude: /node_modules/,
        loaders: [
          "style-loader",
          "css-loader?modules&sourceMap&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]"
        ]
      },
      {
        test: /node_modules.*\.css$/,
        loaders: [
          "style-loader",
          "css-loader?sourceMap&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]"
        ]
      },
      // WOFF Font
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10000,
            mimetype: "application/font-woff",
          }
        },
      },
      // WOFF2 Font
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10000,
            mimetype: "application/font-woff",
          }
        }
      },
      // TTF Font
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10000,
            mimetype: "application/octet-stream"
          }
        }
      },
      // EOT Font
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: "file-loader",
      },
      // SVG Font
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10000,
            mimetype: "image/svg+xml",
          }
        }
      },
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: "url-loader",
      },
      // TypeScript React modules
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [typeScriptLoader, uiComponentLoader]
      },
    ]
  },

  plugins: [
    // https://webpack.github.io/docs/list-of-plugins.html#occurrenceorderplugin
    // https://github.com/webpack/webpack/issues/864
    new webpack.optimize.OccurrenceOrderPlugin(),

    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(forProduction ? "production" : "development")
    }),

    new HtmlWebpackPlugin({
      filename: paths.filenameAppHtml,
      template: paths.templateAppHtml,
      inject: false,
      bundleFilename,
      styleFilename,
    }),
  ]
}

const productionConfig = {
  mode: "production",
  devtool: "cheap-module-source-map",
  entry: path.resolve(__dirname, "../app/renderer/index.tsx"),
  output: {
    publicPath: `${distDir}/`
  },
}

const developmentConfig = {
  mode: "development",
  devtool: "inline-source-map",
  entry: [
    "react-hot-loader/patch",
    `webpack-hot-middleware/client?path=http://localhost:${port}/__webpack_hmr&reload=true`,
    path.resolve(__dirname, "../app/renderer/index.tsx")
  ],
  output: {
    publicPath: `http://localhost:${port}/dist/`
  },
  plugins: [
    // https://webpack.github.io/docs/hot-module-replacement-with-webpack.html
    new webpack.HotModuleReplacementPlugin(),

    new webpack.NoEmitOnErrorsPlugin(),

    new webpack.LoaderOptionsPlugin({
      debug: true
    })
  ]
}

if (forProduction) {
  console.log("Building \x1b[34mElectron RENDERER\x1b[0m in \x1b[36mPRODUCTION\x1b[0m mode...")
  module.exports = webpackMergeConfigs(baseConfig, productionConfig)
} else {
  console.log("Building \x1b[34mElectron RENDERER\x1b[0m in \x1b[36mDEVELOPMENT\x1b[0m mode...")
  module.exports = webpackMergeConfigs(baseConfig, developmentConfig)
}

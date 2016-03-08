var path = require("path");
var webpack = require("webpack");
module.exports = {
    entry : {edit : "./WebContent/js/src/edit.js",
              teacher : "./WebContent/teacher/js/src/index.js",
              analyze : "./WebContent/teacher/js/src/analyze/index.js",
              student : "./WebContent/js/src/student.js",
              pad : "./WebContent/js/src/pad.js"
            },
		module: {
      		loaders: [
        		{ test: /\.css$/, loader: 'style-loader!css-loader!autoprefixer-loader!' },
        		{ test: /\.s[a,c]ss$/, loaders: ['style','css?module','sass',"autoprefixer"]},
        		{
              test: /\.jsx?$/,
              exclude: /(node_modules|bower_components)/,
              loader: 'babel', // 'babel-loader' is also a legal name to reference
              query: {
                presets: ['react', 'es2015']
              }
            }
      		],    		
    },
    output: {
      path: path.join(__dirname, "WebContent/js/dist"),
      publicPath: "js/dist/",
      filename: "[name].js",
      chunkFilename: "[chunkhash].js"
    },
    watch : false,
    plugins : [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.NoErrorsPlugin(),
    ]
};
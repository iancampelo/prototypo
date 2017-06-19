var path = require('path');
var webpack = require('webpack');
var fs = require('fs');
var merge = require('webpack-merge');

var base = require('./base.config');

module.exports = merge(base, {
	cache: true,
	devtool: 'source-map',
	entry: {
		bundle: [
			'whatwg-fetch',
		],
		'web-import': [
			'whatwg-fetch',
		],
	},
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				loaders: ['transform/cacheable?envify', 'babel-loader?cacheDirectory', 'if-loader'],
				include: [
					path.join(__dirname, 'app'),
				],
			},
		],
	},
	externals: [{
		'prototypo.js': 'prototypo',
	}],
	plugins: [
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.DedupePlugin(),
	],
	resolve: {
		fallback: path.join(__dirname, 'node_modules'),
	},
});

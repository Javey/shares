module.exports = {
    entry: './src/app.js',
    output: {
        path: './build'
    },
    module: {
        loaders: [
			{
                test: /\.js$/,
                loader: 'babel-loader?cacheDirectory=.cache&presets[]=react'
            }
        ]
    }
};

module.exports = {
    entry: {
        hello: './src/hello.js',
        todolist:'./src/todolist.js'
    },
    output: {
        path: './build',
		filename: '[name].js'
    },
    module: {
        loaders: [
			{
                test: /\.js$/,
                loader: 'babel-loader?cacheDirectory=.cache&presets[]=react&presets[]=es2015'
            }
        ]
    },
    watch: true
};

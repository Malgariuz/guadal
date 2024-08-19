const path = require('path');

module.exports = {
  entry: './index.js', // Ruta al archivo de entrada
  output: {
    filename: 'bundle.js', // Nombre del archivo de salida
    path: path.resolve(__dirname, 'map'), // Carpeta de salida
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    alias: {
      'mapbox-gl': path.resolve(__dirname, 'node_modules/mapbox-gl')
    }
  },
  mode: 'development'
};


import { CracoConfig } from '@craco/craco';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';



export default {
  plugins: [
    {
      plugin: {
        overrideWebpackConfig: ({ webpackConfig }) => {
          webpackConfig.resolve!.plugins!.push(new TsconfigPathsPlugin({}));
          return webpackConfig;
        }
      },
    }
  ],
} as CracoConfig;
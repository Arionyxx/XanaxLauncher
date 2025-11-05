const path = require('path')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

module.exports = {
  packagerConfig: {
    name: 'Media Manager',
    executableName: 'media-manager',
    icon: path.join(__dirname, 'packages/main/build/icon'),
    asar: true,
    appBundleId: 'com.xanaxlauncher.app',
    appCopyright: 'Copyright © 2024 Media Manager',
    win32metadata: {
      CompanyName: 'Media Manager',
      ProductName: 'Media Manager',
      FileDescription: 'Media Manager',
      OriginalFilename: 'media-manager.exe',
    },
    extraResource: [],
    ignore: [
      /^\/packages\/renderer/,
      /^\/e2e/,
      /^\/\.git/,
      /^\/\.github/,
      /^\/node_modules\/.cache/,
      /\.md$/,
      /\.test\.(ts|tsx|js|jsx)$/,
      /\.spec\.(ts|tsx|js|jsx)$/,
      /tsconfig\.json$/,
      /\.eslintrc/,
      /\.prettierrc/,
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'media-manager',
        authors: 'Media Manager',
        description: 'Media Manager Application',
        exe: 'media-manager.exe',
        setupIcon: path.join(__dirname, 'packages/main/build/icon.ico'),
        noMsi: true,
        setupExe: 'Media-Manager-Setup-${version}.exe',
        setupMsi: 'Media-Manager-Setup-${version}.msi',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux', 'win32'],
    },
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: process.env.GITHUB_REPOSITORY_OWNER || '',
          name: process.env.GITHUB_REPOSITORY_NAME || '',
        },
        prerelease: false,
        draft: true,
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: {
          entry: {
            index: path.join(__dirname, 'packages/main/src/index.ts'),
          },
          module: {
            rules: [
              {
                test: /\.tsx?$/,
                exclude: /(node_modules|\.webpack)/,
                use: {
                  loader: 'ts-loader',
                  options: {
                    configFile: path.join(__dirname, 'packages/main/tsconfig.json'),
                    transpileOnly: true,
                  },
                },
              },
            ],
          },
          resolve: {
            extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
          },
          plugins: [
            new ForkTsCheckerWebpackPlugin({
              typescript: {
                configFile: path.join(__dirname, 'packages/main/tsconfig.json'),
              },
            }),
          ],
        },
        renderer: {
          config: {
            module: {
              rules: [
                {
                  test: /\.tsx?$/,
                  exclude: /(node_modules|\.webpack)/,
                  use: {
                    loader: 'ts-loader',
                    options: {
                      configFile: path.join(__dirname, 'packages/main/tsconfig.json'),
                      transpileOnly: true,
                    },
                  },
                },
              ],
            },
            resolve: {
              extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
            },
          },
          entryPoints: [
            {
              name: 'main_window',
              preload: {
                js: path.join(__dirname, 'packages/main/src/preload.ts'),
              },
            },
          ],
        },
        devContentSecurityPolicy: "default-src 'self' 'unsafe-inline' data: http://localhost:3000 ws://localhost:3000; script-src 'self' 'unsafe-eval' 'unsafe-inline' data: http://localhost:3000",
      },
    },
  ],
}

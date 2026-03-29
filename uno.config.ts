import { defineConfig, presetIcons, presetWind3, transformerDirectives, transformerVariantGroup } from 'unocss'
import { presetEdgeChatWebUI } from '@sa/uno-preset'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import { themeVars } from './src/theme/vars'

// console.log('theme', {
//   ...themeVars,
//   fontSize: {
//     'icon-xs': '0.875rem',
//     'icon-small': '1rem',
//     'icon': '1.125rem',
//     'icon-large': '1.5rem',
//     'icon-xl': '2rem',
//   },
// })

const svgStartRegex = /^<svg\s/

export default defineConfig({
  content: {
    pipeline: {
      exclude: ['node_modules', 'dist'],
    },
  },
  theme: {
    ...themeVars,
    fontSize: {
      'icon-xs': '0.875rem',
      'icon-small': '1rem',
      'icon': '1.125rem',
      'icon-large': '1.5rem',
      'icon-xl': '2rem',
    },
  },
  shortcuts: {
    'card-wrapper': 'rd-8px shadow-sm',
  },
  transformers: [transformerDirectives(), transformerVariantGroup()],
  presets: [
    presetWind3({ dark: 'class' }),
    presetEdgeChatWebUI(),
    presetIcons({
      collections: {
        'i-local': FileSystemIconLoader('src/assets/svg-icon', svg =>
          svg.replace(svgStartRegex, '<svg width="1em" height="1em" ')),
      },
      warn: true,
    }),
  ],
})

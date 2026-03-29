import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import type { PluginOption } from 'vite'

const svgStartRegex = /^<svg\s/

export function setupUnplugin() {
  const plugins: PluginOption[] = [
    Icons({
      compiler: 'vue3',
      customCollections: {
        'i-local': FileSystemIconLoader('src/assets/svg-icon', svg =>
          svg.replace(svgStartRegex, '<svg width="1em" height="1em" ')),
      },
      scale: 1,
      defaultClass: 'inline-block',
    }),
    Components({
      dts: 'src/types/components.d.ts',
      types: [{ from: 'vue-router', names: ['RouterLink', 'RouterView'] }],
      resolvers: [
        NaiveUiResolver(),
        IconsResolver(),
      ],
    }),
  ]

  return plugins
}

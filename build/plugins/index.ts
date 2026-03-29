import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueRootValidator from 'vite-plugin-vue-transition-root-validator'
import unocss from 'unocss/vite'
import { setupElegantRouter } from './router'
import { setupUnplugin } from './unplugin'
import { setupHtmlPlugin } from './html'
import { setupDevtoolsPlugin } from './devtools'
import type { PluginOption } from 'vite'

export function setupVitePlugins(viteEnv: Env.ImportMeta, buildTime: string) {
  const plugins: PluginOption = [
    vue(),
    vueJsx(),
    setupDevtoolsPlugin(viteEnv),
    setupElegantRouter(),
    unocss(),
    ...setupUnplugin(viteEnv),
    setupHtmlPlugin(buildTime),
    vueRootValidator(),
  ]

  return plugins
}

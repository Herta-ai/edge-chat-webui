import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueRootValidator from 'vite-plugin-vue-transition-root-validator'
import { setupElegantRouter } from './router'
import { setupUnocss } from './unocss'
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
    setupUnocss(viteEnv),
    ...setupUnplugin(viteEnv),
    setupHtmlPlugin(buildTime),
    vueRootValidator(),
  ]

  return plugins
}

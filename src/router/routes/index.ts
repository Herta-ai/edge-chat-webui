import { generatedRoutes } from '../elegant/routes'
import { layouts, views } from '../elegant/imports'
import { transformElegantRoutesToVueRoutes } from '../elegant/transform'
import type { CustomRoute, ElegantConstRoute, ElegantRoute } from '@elegant-router/types'

/**
 * custom routes
 *
 * @link https://github.com/soybeanjs/elegant-router?tab=readme-ov-file#custom-route
 */
const customRoutes: CustomRoute[] = []

/** create routes when the auth route mode is static */
export function createStaticRoutes() {
  return {
    constantRoutes: [...customRoutes, ...generatedRoutes] as ElegantRoute[],
  }
}

/**
 * Get auth vue routes
 *
 * @param routes Elegant routes
 */
export function getAuthVueRoutes(routes: ElegantConstRoute[]) {
  return transformElegantRoutesToVueRoutes(routes, layouts, views)
}

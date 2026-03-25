declare namespace Route {
  interface RouteMap {
    'root': '/'
    'not-found': '/:pathMatch(.*)*'
    'init': '/init'
    'setting': '/setting'
    'home': '/home'
  }

  type RouteKey = keyof RouteMap

  type RoutePath = RouteMap[RouteKey]
}

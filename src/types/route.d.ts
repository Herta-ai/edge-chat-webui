declare namespace Route {
  interface RouteMap {
    'root': '/'
    'not-found': '/:pathMatch(.*)*'
    'login': '/login'
    'home': '/home'
  }

  type RouteKey = keyof RouteMap

  type RoutePath = RouteMap[RouteKey]
}

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'mi-lista', component: () => import('@/pages/MiListaPage.vue') },
      {
        path: 'productos',
        name: 'productos',
        component: () => import('@/pages/ProductosPage.vue'),
      },
      {
        path: 'categorias',
        name: 'categorias',
        component: () => import('@/pages/CategoriesPage.vue'),
      },
      {
        path: 'historial',
        name: 'historial',
        component: () => import('@/pages/HistorialPage.vue'),
      },
    ],
  },

  {
    path: '/login',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [{ path: '', name: 'login', component: () => import('@/pages/Auth/LoginPage.vue') }],
  },

  {
    path: '/register',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      { path: '', name: 'register', component: () => import('@/pages/Auth/RegisterPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
]

export default routes

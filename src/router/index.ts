// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'HelloWorld',
    component:  () => import('@/components/HelloWorld/index.vue')
  },
  // 添加更多路由...
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
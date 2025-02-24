import { createRouter, createWebHistory } from "vue-router";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import ProdutosView from "@/views/ProdutosView.vue";
import PedidoView from "@/views/PedidoView.vue";

const routes = [
  { path: "/", redirect: "/produtos", meta: { title: "Produtos" } },
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { title: "Login" },
  },
  {
    path: "/register",
    name: "register",
    component: RegisterView,
    meta: { title: "Cadastro" },
  },
  {
    path: "/produtos",
    name: "Produtos",
    component: ProdutosView,
    meta: { requiresAuth: true, title: "Produtos" },
  },
  {
    path: "/pedido",
    name: "Pedido",
    component: PedidoView,
    meta: { requiresAuth: false, title: "Pedido" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    const token = localStorage.getItem("token");
    if (!token) {
      next("/login");
    } else {
      next();
    }
  } else {
    next();
  }
});

router.afterEach((to) => {
  document.title = to.meta.title || "Avaliação Chico Rei";
});

export default router;

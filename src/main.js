import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import axios from "./plugins/axios";
import VueTheMask from "vue-the-mask";

const app = createApp(App);
app.config.globalProperties.$axios = axios;
app.use(router);
app.use(VueTheMask);
app.mount("#app");

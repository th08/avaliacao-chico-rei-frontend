<template>
  <div
    class="container d-flex flex-column justify-content-center align-items-center vh-100"
  >
    <div class="card p-4" style="max-width: 400px; width: 100%">
      <h3 class="mb-3 text-center">Gerenciador de Produtos</h3>
      <div class="mb-3">
        <label class="form-label">E-mail</label>
        <input
          v-model="email"
          type="text"
          class="form-control"
          placeholder="Digite seu E-mail"
        />
        <div v-if="errors.email" class="text-danger mt-1">
          {{ errors.email[0] }}
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label">Senha</label>
        <input
          v-model="password"
          type="password"
          class="form-control"
          placeholder="Digite sua senha"
        />
        <div v-if="errors.password" class="text-danger mt-1">
          {{ errors.password[0] }}
        </div>
      </div>
      <button @click="login" class="btn btn-primary w-100">Entrar</button>
      <hr />
      <p class="text-center">Não tem conta?</p>
      <router-link to="/register" class="text-center">Cadastre-se</router-link>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "LoginView",
  data() {
    return {
      email: "",
      password: "",
      errors: {},
      apiUrl: process.env.VUE_APP_API_URL || "http://localhost:8000/api",
    };
  },
  methods: {
    async login() {
      this.errors = {};
      try {
        const response = await axios.post(`${this.apiUrl}/login`, {
          email: this.email,
          password: this.password,
        });

        if (response.data && response.data.token) {
          localStorage.setItem("token", response.data.token);
          this.$router.push("/produtos");
        } else {
          alert("Erro no login: Token não encontrado.");
        }
      } catch (error) {
        if (error.response && error.response.status === 419) {
          alert("Erro de sessão expirada. Tente recarregar a página.");
        } else if (
          error.response &&
          error.response.data &&
          error.response.data.errors
        ) {
          this.errors = error.response.data.errors;
        } else {
          alert("Erro no login. Verifique os dados e tente novamente.");
        }
        console.error("Erro no login:", error);
      }
    },
  },
};
</script>

<style scoped></style>

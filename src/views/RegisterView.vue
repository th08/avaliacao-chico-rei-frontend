<template>
  <div
    class="container d-flex flex-column justify-content-center align-items-center vh-100"
  >
    <div class="card p-4" style="max-width: 400px; width: 100%">
      <h3 class="mb-3 text-center">Cadastre-se</h3>

      <div class="mb-3">
        <label class="form-label">Nome</label>
        <input
          v-model="name"
          type="text"
          class="form-control"
          placeholder="Digite seu nome"
        />
        <div v-if="errors.name" class="text-danger mt-1">
          {{ errors.name[0] }}
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">Email</label>
        <input
          v-model="email"
          type="email"
          class="form-control"
          placeholder="Digite seu email"
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

      <div class="mb-3">
        <label class="form-label">Confirmar Senha</label>
        <input
          v-model="password_confirmation"
          type="password"
          class="form-control"
          placeholder="Confirme sua senha"
        />
        <div v-if="errors.password_confirmation" class="text-danger mt-1">
          {{ errors.password_confirmation[0] }}
        </div>
      </div>

      <button @click="register" class="btn btn-primary w-100">Cadastrar</button>
      <hr />
      <p class="text-center">
        Já tem conta? <router-link to="/login">Entrar</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "RegisterView",
  data() {
    return {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      errors: {},
      apiUrl: process.env.VUE_APP_API_URL || "http://localhost:8000/api",
    };
  },
  methods: {
    async register() {
      this.errors = {};
      try {
        
        await axios.get(
          `${this.apiUrl.replace("/api", "")}/sanctum/csrf-cookie`
        );

        const response = await axios.post(
          `${this.apiUrl}/register`,
          {
            name: this.name,
            email: this.email,
            password: this.password,
            password_confirmation: this.password_confirmation,
          }
        );

        localStorage.setItem("token", response.data.token);
        this.$router.push("/produtos");
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
          alert("Erro no cadastro. Verifique os dados e tente novamente.");
        }
        console.error("Erro no cadastro:", error);
      }
    },
  },
};
</script>

<style scoped></style>

<template>
  <div class="p-4">
    <div class="mb-3">
      <label class="form-label">Nome</label>
      <input type="text" class="form-control" v-model="form.nome" />
      <div v-if="errors.nome" class="text-danger mt-1">
        {{ errors.nome[0] }}
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label">Descrição</label>
      <textarea class="form-control" v-model="form.descricao"></textarea>
      <div v-if="errors.descricao" class="text-danger mt-1">
        {{ errors.descricao[0] }}
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label">Preço</label>
      <input
        type="text"
        class="form-control"
        v-model="form.preco"
        @input="formatPrice"
      />
      <div v-if="errors.preco" class="text-danger mt-1">
        {{ errors.preco[0] }}
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label">Imagem</label>
      <input type="file" class="form-control" @change="handleFile" />
      <div v-if="errors.imagem" class="text-danger mt-1">
        {{ errors.imagem[0] }}
      </div>
    </div>

    <div v-if="previewImage" class="mb-3 text-center">
      <img
        :src="previewImage"
        alt="Imagem do produto"
        class="img-thumbnail"
        style="max-width: 200px; height: auto"
      />
      <p v-if="imagemNome" class="mt-2 text-muted">{{ imagemNome }}</p>
    </div>

    <div class="d-flex justify-content-between">
      <button class="btn btn-danger" @click="closeForm">Cancelar</button>
      <button
        class="btn btn-success me-2"
        @click="saveProduto"
        :disabled="loading"
      >
        <span v-if="loading" class="spinner-border spinner-border-sm"></span>
        Salvar
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";

export default {
  name: "ProdutoForm",
  props: {
    produtoData: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      form: {
        id: null,
        nome: "",
        descricao: "",
        preco: "",
        imagem: null,
      },
      previewImage: null,
      imagemNome: null,
      errors: {},
      loading: false,
      apiUrl: process.env.VUE_APP_API_URL || "http://localhost:8000/api",
    };
  },
  watch: {
    produtoData: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          // Carrega os dados do produto para edição, mas mantém o campo de imagem como null para evitar sobrescrever a imagem selecionada
          this.form = { ...newVal, imagem: null };

          if (newVal.imagemUrl) {
            this.previewImage = newVal.imagemUrl;
          } else if (newVal.imagem) {
            const basePublicUrl =
              process.env.VUE_APP_PUBLIC_URL || "http://localhost:8000/";
            this.previewImage = `${basePublicUrl}imagens/${newVal.imagem}`;
          } else {
            this.previewImage = null;
          }

          this.imagemNome = newVal.imagem
            ? newVal.imagem.split("/").pop()
            : null;
        } else {
          this.form = {
            id: null,
            nome: "",
            descricao: "",
            preco: "",
            imagem: null,
          };
          this.previewImage = null;
          this.imagemNome = null;
          this.errors = {};
        }
      },
    },
  },

  methods: {
    formatPrice() {
      let numeric = String(this.form.preco).replace(/\D/g, "");
      if (numeric === "" || isNaN(Number(numeric))) {
        this.form.preco = "";
        return;
      }

      let formatted = (parseFloat(numeric) / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
      this.form.preco = formatted;
    },
    handleFile(event) {
      const file = event.target.files[0];
      if (file) {
        this.form.imagem = file;
        this.imagemNome = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewImage = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    closeForm() {
      this.errors = {};
      this.$emit("close");
    },
    async saveProduto() {
      this.loading = true;
      const token = localStorage.getItem("token");
      const data = new FormData();

      data.append("nome", this.form.nome);
      data.append("descricao", this.form.descricao);

      const priceStr = String(this.form.preco).replace("R$", "").trim();
      if (priceStr === "") {
        data.append("preco", "");
      } else {
        let precoNumerico = parseFloat(
          priceStr.replace(".", "").replace(",", ".")
        );
        data.append("preco", precoNumerico);
      }

      if (this.form.imagem) {
        data.append("imagem", this.form.imagem);
      }

      this.errors = {};

      try {
        if (this.form.id) {
          await axios.post(
            `${this.apiUrl}/produtos/${this.form.id}?_method=PUT`,
            data,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
        } else {
          await axios.post(`${this.apiUrl}/produtos`, data, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          });
        }
        const Toast = Swal.mixin({
          toast: true,
          position: "top-right",
          showConfirmButton: false,
          timer: 5000,
          background: "#87bc78",
          color: "#fff",
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", () => {
              toast.classList.add("pointer");
              Swal.stopTimer();
            });
            toast.addEventListener("mouseleave", Swal.resumeTimer);
            toast.addEventListener("click", () => {
              Swal.close();
            });
          },
          customClass: {
            popup: "toast-custom-position",
          },
        });
        Toast.fire({
          icon: "success",
          title: "Dados salvos com sucesso.",
        });
        this.$emit("saved");
        this.$emit("close");
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
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.img-thumbnail {
  border: 1px solid #ddd;
  padding: 5px;
  border-radius: 5px;
  background-color: #f8f9fa;
}
</style>

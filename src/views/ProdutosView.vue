<template>
  <div class="container py-4">
    <div class="d-flex justify-content-end">
      <button
        class="btn btn-danger position-fixed top-5"
        @click="confirmLogout"
      >
        Sair
      </button>
    </div>

    <h2 class="mb-5">Lista de Produtos</h2>

    <div v-if="loading" class="d-flex justify-content-center mb-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
    </div>

    <table
      class="table table-bordered table-hover table-striped p-5 text-center"
      v-if="!loading"
    >
      <thead class="table-light">
        <tr>
          <th>Nome</th>
          <th>Descrição</th>
          <th>Preço</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="produto in produtos" :key="produto.id">
          <td>{{ produto.nome }}</td>
          <td>{{ produto.descricao }}</td>
          <td>{{ formataMoeda(produto.preco) }}</td>
          <td>
            <button
              class="btn btn-sm btn-primary me-2"
              @click="openForm(produto)"
            >
              Editar
            </button>
            <button
              class="btn btn-sm btn-danger"
              @click="confirmDelete(produto.id)"
            >
              Remover
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <button class="btn btn-success float-end" @click="openForm(null)">
      Cadastrar Produto
    </button>

    <!-- Modal Bootstrap -->
    <div
      class="modal modal-lg fade"
      id="produtoModal"
      tabindex="-1"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{
                selectedProduto && selectedProduto.id
                  ? "Editar Produto"
                  : "Novo Produto"
              }}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              @click="closeModal"
            ></button>
          </div>
          <div class="modal-body">
            <ProdutoForm
              :produtoData="selectedProduto"
              @saved="fetchProdutos"
              @close="closeModal"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import ProdutoForm from "@/components/ProdutoForm.vue";
import { Modal } from "bootstrap";
import Swal from "sweetalert2";

export default {
  name: "ProdutosView",
  components: { ProdutoForm },
  data() {
    return {
      produtos: [],
      selectedProduto: null,
      loading: false,
      apiUrl: process.env.VUE_APP_API_URL || "http://localhost:8000/api",
      modalInstance: null,
    };
  },
  mounted() {
    this.fetchProdutos();
    this.modalInstance = new Modal(document.getElementById("produtoModal"));
  },
  methods: {
    async fetchProdutos() {
      this.loading = true;
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${this.apiUrl}/produtos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.produtos = response.data;
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        this.loading = false;
      }
    },
    async openForm(produto) {
      if (produto) {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `${this.apiUrl}/produtos/${produto.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          this.selectedProduto = response.data; // Agora inclui a imagemUrl
        } catch (error) {
          console.error("Erro ao buscar detalhes do produto:", error);
          Swal.fire({
            icon: "error",
            title: "Erro",
            text: "Não foi possível carregar os detalhes do produto.",
          });
          return;
        }
      } else {
        this.selectedProduto = null;
      }

      this.modalInstance.show();
    },

    closeModal() {
      this.modalInstance.hide();
      this.selectedProduto = null;
      this.$nextTick(() => {
        const fileInput = document.querySelector(
          '#produtoModal input[type="file"]'
        );
        if (fileInput) {
          fileInput.value = "";
        }
      });
    },
    confirmDelete(id) {
      Swal.fire({
        icon: "warning",
        iconColor: "#3085d6",
        title: "Atenção",
        text: "Deseja realmente excluir esse registro?",
        showCancelButton: true,
        cancelButtonColor: "#d33",
        cancelButtonText: "Cancelar",
        confirmButtonText: "Confirmar",
        confirmButtonColor: "#198754",
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteProduto(id);
        }
      });
    },
    async deleteProduto(id) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${this.apiUrl}/produtos/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
          title: "Registro removido com sucesso.",
        });
        this.fetchProdutos();
      } catch (error) {
        console.error("Erro ao deletar produto:", error);
      }
    },
    formataMoeda(value) {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    },

    confirmLogout() {
      Swal.fire({
        icon: "warning",
        iconColor: "#3085d6",
        title: "Atenção",
        text: "Deseja realmente sair do sistema?",
        showCancelButton: true,
        cancelButtonColor: "#d33",
        cancelButtonText: "Cancelar",
        confirmButtonText: "Confirmar",
        confirmButtonColor: "#198754",
      }).then((result) => {
        if (result.isConfirmed) {
          this.logout();
        }
      });
    },

    async logout() {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `${this.apiUrl}/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        localStorage.removeItem("token");
        this.$router.push({ name: "login" });
      } catch (error) {
        console.error("Erro ao realizar logout:", error);
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: "Ocorreu um erro ao tentar sair.",
        });
      }
    },
  },
};
</script>

<style scoped></style>

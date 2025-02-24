<template>
  <div class="pedido-container container">
    <h2 class="mt-4 mb-4">Finalização do pedido</h2>
    <div class="row">
      <div class="col-md-8">
        <h5>Informações de contato</h5>
        <div class="mb-3">
          <label class="form-label">E-mail</label>
          <input
            type="email"
            class="form-control"
            v-model="email"
            :class="{ 'is-invalid': errors.email }"
            placeholder="Digite seu e-mail"
          />
          <div v-if="errors.email" class="invalid-feedback">
            {{ errors.email }}
          </div>
        </div>
        <div class="mb-4">
          <label class="form-label">Telefone</label>
          <input
            type="tel"
            class="form-control"
            v-model="telefone"
            v-mask="'(##) #####-####'"
            :class="{ 'is-invalid': errors.telefone }"
            placeholder="(XX) XXXXX-XXXX"
          />
          <div v-if="errors.telefone" class="invalid-feedback">
            {{ errors.telefone }}
          </div>
        </div>

        <h5>Informações de entrega</h5>
        <div class="mb-3 row">
          <div class="col-8">
            <label class="form-label">CEP</label>
            <input
              type="text"
              class="form-control"
              v-model="cep"
              v-mask="'#####-###'"
              :class="{ 'is-invalid': errors.cep }"
              placeholder="Digite seu CEP"
            />
            <div v-if="errors.cep" class="invalid-feedback">
              {{ errors.cep }}
            </div>
          </div>
          <div class="col-4 d-flex align-items-end">
            <button
              class="btn btn-primary w-100"
              @click="buscarCep"
              :disabled="isLoadingCep"
              style="margin-top: 2rem"
            >
              <span v-if="!isLoadingCep">Buscar</span>
              <span v-else>Carregando...</span>
            </button>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Rua</label>
          <input
            type="text"
            class="form-control"
            v-model="rua"
            :class="{ 'is-invalid': errors.rua }"
            placeholder="Nome da Rua"
          />
          <div v-if="errors.rua" class="invalid-feedback">{{ errors.rua }}</div>
        </div>
        <div class="mb-3">
          <label class="form-label">Bairro</label>
          <input
            type="text"
            class="form-control"
            v-model="bairro"
            :class="{ 'is-invalid': errors.bairro }"
            placeholder="Nome do Bairro"
          />
          <div v-if="errors.bairro" class="invalid-feedback">
            {{ errors.bairro }}
          </div>
        </div>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Cidade</label>
            <input
              type="text"
              class="form-control"
              v-model="cidade"
              :class="{ 'is-invalid': errors.cidade }"
              placeholder="Cidade"
            />
            <div v-if="errors.cidade" class="invalid-feedback">
              {{ errors.cidade }}
            </div>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Estado</label>
            <input
              type="text"
              class="form-control"
              v-model="estado"
              :class="{ 'is-invalid': errors.estado }"
              placeholder="UF"
            />
            <div v-if="errors.estado" class="invalid-feedback">
              {{ errors.estado }}
            </div>
          </div>
        </div>

        <h5>Informações de pagamento</h5>
        <div class="mb-3">
          <label class="form-label">Nome no cartão</label>
          <input
            type="text"
            class="form-control"
            v-model="nomeCartao"
            :class="{ 'is-invalid': errors.nomeCartao }"
            placeholder="Ex: JOÃO SILVA"
          />
          <div v-if="errors.nomeCartao" class="invalid-feedback">
            {{ errors.nomeCartao }}
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Número do cartão</label>
          <input
            type="text"
            class="form-control"
            v-model="numeroCartao"
            v-mask="'#### #### #### ####'"
            :class="{ 'is-invalid': errors.numeroCartao }"
            placeholder="XXXX XXXX XXXX XXXX"
          />
          <div v-if="errors.numeroCartao" class="invalid-feedback">
            {{ errors.numeroCartao }}
          </div>
        </div>
        <div class="mb-4">
          <label class="form-label">Data de vencimento (MM/AA)</label>
          <input
            type="text"
            class="form-control"
            v-model="dataVencimento"
            v-mask="'##/##'"
            :class="{ 'is-invalid': errors.dataVencimento }"
            placeholder="MM/AA"
          />
          <div v-if="errors.dataVencimento" class="invalid-feedback">
            {{ errors.dataVencimento }}
          </div>
        </div>

        <button class="btn btn-success w-100" @click="submitOrder">
          Fechar pedido
        </button>

        <div v-if="showSuccess" class="alert alert-success mt-3">
          Pedido finalizado com sucesso!
        </div>
      </div>

      <div class="col-md-4">
        <h5 class="mb-3">Sua sacola</h5>
        <div class="card mb-3 p-3">
          <div class="d-flex align-items-center">
            <div class="img-container me-3">
              <img
                src="https://imgcentauro-a.akamaihd.net/480x480/99357902A2.jpg"
                alt="Produto"
              />
            </div>
            <div>
              <strong>{{ product.nome }}</strong><br />
              R$ {{ formatCurrency(product.preco) }}
            </div>
          </div>
          <div class="d-flex align-items-center mt-3">
            <button class="btn btn-outline-secondary me-2" @click="decrementQty">
              -
            </button>
            <span>{{ product.quantidade }}</span>
            <button class="btn btn-outline-secondary ms-2" @click="incrementQty">
              +
            </button>
          </div>
        </div>
        <div class="border p-3 text-end">
          <strong>Total: </strong>
          R$ {{ formatCurrency(product.preco * product.quantidade) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import cep from "cep-promise";

export default {
  name: "PedidoView",
  data() {
    return {
      email: "",
      telefone: "",
      cep: "",
      rua: "",
      bairro: "",
      cidade: "",
      estado: "",
      nomeCartao: "",
      numeroCartao: "",
      dataVencimento: "",
      product: {
        nome: "Camisa do Flamengo 2025 I",
        preco: 349.99,
        quantidade: 1,
      },
      isLoadingCep: false,
      showSuccess: false,
      errors: {},
    };
  },
  methods: {
    unmask(value) {
      return value.replace(/\D/g, "");
    },
    async buscarCep() {
      if (!this.cep) {
        alert("Informe o CEP.");
        return;
      }
      const cepUnmasked = this.unmask(this.cep);
      if (cepUnmasked.length !== 8) {
        alert("CEP inválido. Deve conter 8 dígitos.");
        return;
      }
      this.isLoadingCep = true;
      try {
        const result = await cep(cepUnmasked);
        this.rua = result.street;
        this.bairro = result.neighborhood;
        this.cidade = result.city;
        this.estado = result.state;
      } catch (error) {
        alert("CEP não encontrado.");
        console.error(error);
      } finally {
        this.isLoadingCep = false;
      }
    },
    incrementQty() {
      this.product.quantidade++;
    },
    decrementQty() {
      if (this.product.quantidade > 1) {
        this.product.quantidade--;
      }
    },
    submitOrder() {
      this.errors = {};

      const telefoneUnmasked = this.unmask(this.telefone);
      const cepUnmasked = this.unmask(this.cep);
      const numeroCartaoUnmasked = this.unmask(this.numeroCartao);
      const dataVencimentoValida = this.dataVencimento;

      if (!this.email || !this.validateEmail(this.email)) {
        this.errors.email = "E-mail inválido ou não preenchido.";
      }
      if (!telefoneUnmasked || telefoneUnmasked.length < 10) {
        this.errors.telefone = "Telefone inválido ou não preenchido.";
      }
      if (!cepUnmasked || cepUnmasked.length !== 8) {
        this.errors.cep = "CEP inválido ou não preenchido.";
      }
      if (!this.rua) {
        this.errors.rua = "Rua não preenchida.";
      }
      if (!this.bairro) {
        this.errors.bairro = "Bairro não preenchido.";
      }
      if (!this.cidade) {
        this.errors.cidade = "Cidade não preenchida.";
      }
      if (!this.estado) {
        this.errors.estado = "Estado não preenchido.";
      }
      if (!this.nomeCartao) {
        this.errors.nomeCartao = "Nome no cartão não preenchido.";
      }
      if (!numeroCartaoUnmasked || numeroCartaoUnmasked.length !== 16) {
        this.errors.numeroCartao = "Número do cartão inválido (16 dígitos).";
      }
      if (
        !dataVencimentoValida ||
        !/^\d{2}\/\d{2}$/.test(dataVencimentoValida)
      ) {
        this.errors.dataVencimento =
          "Data de vencimento inválida (use MM/AA).";
      }

      if (Object.keys(this.errors).length > 0) {
        return;
      }

      this.showSuccess = true;

      const pedidoFinal = {
        contato: {
          email: this.email,
          telefone: telefoneUnmasked,
        },
        entrega: {
          cep: cepUnmasked,
          rua: this.rua,
          bairro: this.bairro,
          cidade: this.cidade,
          estado: this.estado,
        },
        pagamento: {
          nomeCartao: this.nomeCartao,
          numeroCartao: numeroCartaoUnmasked,
          dataVencimento: dataVencimentoValida,
        },
        sacola: {
          nomeProduto: this.product.nome,
          preco: this.product.preco,
          quantidade: this.product.quantidade,
          total: this.product.preco * this.product.quantidade,
        },
      };

      console.log("Pedido finalizado:", pedidoFinal);
    },

    validateEmail(email) {
      const regex = /^[\w.-]+@([\w.-]+\.)+[\w.-]{2,4}$/;
      return regex.test(email);
    },

    formatCurrency(value) {
      return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    },
  },
};
</script>

<style scoped>
.pedido-container {
  margin-top: 20px;
  margin-bottom: 50px;
}

.img-container {
  width: 80px;
  height: 80px;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.img-container img {
  width: auto;
  height: 100%;
}
</style>

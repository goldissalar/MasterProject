<template>
  <v-alert v-if="success && showAlert" type="success">Speichern erfolgreich!</v-alert>
  <v-alert v-if="failed && showAlert" type="error">Speichern fehlgeschlagen!</v-alert>
  <v-alert v-if="deleteSuccess && showAlert" type="success">Löschen erfolgreich!</v-alert>
  <v-alert v-if="deleteFailed && showAlert" type="error">Löschen fehlgeschlagen!</v-alert>
  <v-container v-if="!selectedTodo">
    <v-data-table
        :items="todos"
        :headers="headers"
        :items-per-page="itemsPerPage"
        :server-items-length="totalTodos"
        item-key="title"
        :loading="loading"
        @update:page="onPageChange"
    >
      <template v-slot:item="{ item }">
        <tr>
          <td>{{ item.title }}</td>
          <td>{{ item.description }}</td>
          <td>
            <v-icon
                size="small"
                class="me-2"
                @click="editTodo(item)"
                color="#2196F3"
            >
              mdi-pencil
            </v-icon>
            <v-icon
                size="small"
                @click="deleteItem(item)"
                color="rgb(200, 35, 51)"
            >
              mdi-delete
            </v-icon>
          </td>
        </tr>
      </template>
    </v-data-table>
    <v-btn class="text-none mb-4 create-btn" color="#2196F3" @click="createTodo()">Erstellen</v-btn>
  </v-container>
  <v-container v-if="!!selectedTodo">
    <v-form ref="form" @submit.prevent="submitForm">
      <v-text-field type="text" id="title" v-model="formData.title" :rules="[v => !!v || 'Bitte Titel eingeben']" required label="Titel"></v-text-field>
      <v-text-field type="text" id="description" v-model="formData.description" :rules="[v => !!v || 'Bitte Beschreibung eingeben']" required label="Beschreibung"></v-text-field>
      <div style="clear: both"></div>
      <div>
        <v-btn type="submit" class="text-none mb-4 right-btn" color="#2196F3">Speichern</v-btn>
        <v-btn class="text-none mb-4 left-btn" color="#757575" @click="cancelForm()">Abbrechen</v-btn>
      </div>
    </v-form>
  </v-container>
</template>
<script>
import store from '../auth/store';
const BASE_URL= 'https://65c7a2b5e7c384aada6ec54f.mockapi.io/todos';

export default {
  data() {
    return {
      todos: [],
      headers: [
        { title: 'Titel', value: 'title' },
        { title: 'Beschreibung', value: 'description' },
        { title: 'Aktionen', key: 'actions' },
      ],
      itemsPerPage: 5,
      totalTodos: 0,
      loading: false,
      selectedTodo: false,
      formData: {
        title: '',
        description: ''
      },
      success: false,
      failed: false,
      deleteSuccess: false,
      deleteFailed: false,
      showAlert: false,
      myId: null,
      assignedUserIds: []
    }
  },
  name: 'TodoPage',
  components: {
  },
  methods: {
    fetchData() {
      this.loading = true;
      this.$axios.get(BASE_URL, {
        params: {
          sortBy: 'title',
          order: 'asc'
        }
      }).then(response => {
          this.todos = response.data.filter(o => o.userId == this.myId);
          console.log(this.todos);
          this.totalTodos = Number(response.headers['x-total-count']);
          this.todos.actions = '';
          this.loading = false;
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          this.loading = false;
        });
    },
    onPageChange(page) {
      this.$router.push({ query: { page } });
      this.fetchData();
    },
    createTodo() {
      this.selectedTodo = true;
    },
    editTodo(item) {
      this.selectedTodo = true;
      let todo = this.todos.find(o => o.id === item.id);
      this.formData = {...todo};
      this.createdByMyUser = todo.userId === this.myId;
    },
    async deleteItem(item) {
      const userConfirmed = window.confirm("Sind Sie sicher, dass Sie dieses Event löschen möchten?");
      if (!userConfirmed) {
        return;
      }
      this.resetAlert();
      try {
        let response = await this.$axios.delete(BASE_URL + '/' + item.id, {
          params: {}
        });
        if (response) {
          this.deleteSuccess = true;
          this.showAlert = true;
          setTimeout(() => {
            this.showAlert = false;
          },2000);
          this.fetchData();
        }
      } catch (error) {
        this.deleteFailed = true;
        this.showAlert = true;
        setTimeout(() => {
          this.showAlert = false;
        },2000);
      }
    },
    cancelForm() {
      this.selectedTodo = false;
      this.formData = {
        title: '',
        description: ''
      };
      this.fetchData();
    },
    async submitForm() {
      this.resetAlert();
      const isFormValid = await this.$refs.form.validate();
      if (isFormValid.valid) {
      try {
        let response;
        if (this.formData.id) {
          response = await this.$axios.put(BASE_URL + '/' + this.formData.id, this.formData, {
            params: {}
          });
        } else {
          response = await this.$axios.post(BASE_URL, this.formData, {
            params: {}
          });
        }
        if (response) {
          this.success = true;
          this.showAlert = true;
          setTimeout(() => {
            this.showAlert = false;
          },2000);
          this.cancelForm();
          this.fetchData();
        }
      } catch (error) {
        this.failed = true;
        this.showAlert = true;
        setTimeout(() => {
          this.showAlert = false;
        },2000);
      }
      }
    },
    resetAlert() {
      this.success = false;
      this.failed = false;
      this.deleteSuccess = false;
      this.deleteFailed = false;
    }
  },
  watch: {
    '$route.query.page'() {
      this.fetchData();
    },
  },
  created() {
    console.log("TodoPage");
    this.myId = store.state.auth.id;
    this.fetchData();
  },
}
</script>

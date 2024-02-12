<template>
  <v-alert v-if="success && showAlert" type="success">Speichern erfolgreich!</v-alert>
  <v-alert v-if="failed && showAlert" type="error">Speichern fehlgeschlagen!</v-alert>
  <v-alert v-if="deleteSuccess && showAlert" type="success">Löschen erfolgreich!</v-alert>
  <v-alert v-if="deleteFailed && showAlert" type="error">Löschen fehlgeschlagen!</v-alert>
  <v-container v-if="!selectedTodo">
    <h1 style="padding-bottom: 20px">Meine Todos</h1>
    <v-text-field
        v-model="searchTerm"
        label="Suche"
        @input="searchTodos"
    ></v-text-field>
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
        <tr :class="{ 'green-row': item.checked }">
          <td>{{ item.title }}</td>
          <td>{{ item.description }}</td>
          <td>{{ item.dueDateDisplay }}</td>
          <td>
            <v-icon
                size="small"
                class="me-2"
                @click="editPriority(item)"
                :color="item.priority == 1 ? '#dc3545' : '#ffc107'"
            >
              {{ item.priority == 1 ? 'mdi-chevron-double-up' : 'mdi-chevron-up'}}
            </v-icon>
          </td>
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
                class="me-2"
                @click="deleteItem(item)"
                color="rgb(200, 35, 51)"
            >
              mdi-delete
            </v-icon>
            <v-icon
                size="small"
                @click="toggleCheck(item)"
                color="rgb(40,167,69)"
            >
              {{item.checked ? 'mdi-checkbox-marked' : 'mdi-crop-square'}}
            </v-icon>
          </td>
        </tr>
      </template>
    </v-data-table>
    <v-btn class="text-none mb-4 create-btn" color="#2196F3" @click="createTodo()" style="margin-top: 10px">Erstellen</v-btn>
  </v-container>
  <v-container v-if="!!selectedTodo">
    <h1 style="padding-bottom: 20px">{{ formData.id ? 'Todo bearbeiten' : 'Todo erstellen'}}</h1>
    <v-form ref="form" @submit.prevent="submitForm">
      <v-text-field type="text" id="title" v-model="formData.title" :rules="[v => !!v || 'Bitte Titel eingeben']" required label="Titel"></v-text-field>
      <v-text-field type="text" id="description" v-model="formData.description" :rules="[v => !!v || 'Bitte Beschreibung eingeben']" required label="Beschreibung"></v-text-field>
      <v-text-field type="datetime-local" id="dueDate" v-model="formData.dueDate" :rules="[v => !!v || 'Bitte Fälligkeitsdatum eingeben', v => validateDueDate(v) || 'Das Datum darf nicht vor dem aktuellen Datum liegen']" required label="Fälligkeitsdatum"></v-text-field>
      <v-select
          v-model="formData.priority"
          label="Priorität"
          :items="priorityOptions"
          item-title="label"
          item-value="value"
      ></v-select>
      <v-chip
          v-for="(tag, index) in tagsDisplay"
          :key="index"
          closable
          @click:close="removeTag(index)"
          class="tag-chip"
      >
        {{ tag }}
      </v-chip>
      <div style="display: flex;">
        <v-text-field
            v-model="newTag"
            label="Neuer Tag"
        ></v-text-field>
        <v-col cols="auto">
          <v-btn density="compact" icon="mdi-plus" color="rgb(40,167,69)" @click="addNewTag()"></v-btn>
        </v-col>
      </div>
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
        { title: 'Titel', value: 'title', sortable: true },
        { title: 'Beschreibung', value: 'description', sortable: true },
        { title: 'Fälligkeitsdatum', value: 'dueDate', sortable: true },
        { title: 'Priorität', value: 'priority', sortable: true },
        { title: 'Aktionen', key: 'actions' },
      ],
      itemsPerPage: 5,
      totalTodos: 0,
      loading: false,
      selectedTodo: false,
      formData: {
        title: '',
        description: '',
        userId: 0,
        checked: false,
        priority: 1,
        tags: []
      },
      tagsDisplay: [],
      success: false,
      failed: false,
      deleteSuccess: false,
      deleteFailed: false,
      showAlert: false,
      myId: null,
      priorityOptions: [],
      newTag: '',
      searchTerm: ''
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
          this.totalTodos = Number(response.headers['x-total-count']);
          this.todos.forEach(o => {
            o.dueDateDisplay = this.formatDate(o.dueDate);
            const dateTime = new Date(o.dueDate);
            const localTime = new Date(dateTime.getTime() - dateTime.getTimezoneOffset() * 60000);
            o.dueDate = localTime.toISOString().slice(0, 16);
          });
          this.todos.actions = '';
          this.loading = false;
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          this.loading = false;
        });
    },
    formatDate(dateString) {
      if (!dateString) {
        return '';
      }
      const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
      let formattedDate = new Date(dateString).toLocaleDateString('de-DE', options);
      formattedDate = formattedDate.replace(/[,]/g, ' ');
      return formattedDate;
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
      for (let i = 0; i < this.formData.tags.length; i++) {
        this.tagsDisplay.push(this.formData.tags[i]);
      }
    },
    toggleCheck(item) {
      let todo = this.todos.find(o => o.id === item.id);
      this.formData = {...todo};
      this.formData.checked = !item.checked;
      this.updateTodo();
    },
    editPriority(item) {
      let todo = this.todos.find(o => o.id === item.id);
      this.formData = {...todo};
      this.formData.priority = item.priority === 1 ? 2 : 1;
      this.updateTodo();
    },
    validateDueDate(date) {
      const selectedDate = new Date(date);
      const currentDate = new Date();
      return selectedDate >= currentDate;
    },
    addTag(tag) {
      this.tagsDisplay.push(tag);
      this.formData.tags.push(tag);
    },
    removeTag(index) {
      this.formData.tags.splice(index, 1);
    },
    addNewTag() {
      if (this.newTag.trim() !== '') {
        this.addTag(this.newTag.trim());
        this.newTag = '';
      }
    },
    searchTodos() {
      if (this.searchTerm.trim() === '') {
        this.fetchData();
      } else {
        this.todos = this.todos.filter(todo =>
            todo.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            todo.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            todo.tags.some(tag => tag.toLowerCase().includes(this.searchTerm.toLowerCase()))
        );
      }
    },
    async deleteItem(item) {
      const userConfirmed = window.confirm("Sind Sie sicher, dass Sie dieses Todo löschen möchten?");
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
        description: '',
        checked: false,
        priority: 1,
        tags: []
      };
      this.tagsDisplay = [];
      this.fetchData();
    },
    async submitForm() {
      this.resetAlert();
      const isFormValid = await this.$refs.form.validate();
      if (isFormValid.valid) {
      try {
        let response;
        this.formData.userId = this.myId;
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
    async updateTodo() {
      this.resetAlert();
      try {
        let response;
        this.formData.userId = this.myId;
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
    this.myId = store.state.auth.id;
    this.priorityOptions = [
      { value: 1, label: 'Hoch' },
      { value: 2, label: 'Niedrig' }
    ];
    this.fetchData();
  },
}
</script>

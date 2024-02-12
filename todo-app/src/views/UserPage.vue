<template>
  <v-alert v-if="success && showAlert" type="success">Speichern erfolgreich!</v-alert>
  <v-alert v-if="failed && showAlert" type="error">Speichern fehlgeschlagen!</v-alert>
  <v-alert v-if="deleteSuccess && showAlert" type="success">Löschen erfolgreich!</v-alert>
  <v-alert v-if="deleteFailed && showAlert" type="error">Löschen fehlgeschlagen!</v-alert>
  <v-container v-if="!selectedUser">
    <v-data-table
        :items="users"
        :headers="headers"
        :items-per-page="itemsPerPage"
        :server-items-length="totalEvents"
        item-key="username"
        :loading="loading"
        @update:page="onPageChange"
    >
      <template v-slot:item="{ item }">
        <tr>
          <td>{{ item.username }}</td>
          <td>{{ getRoleDisplayText(item.role) }}</td>
          <td>
            <v-icon
                size="small"
                class="me-2"
                @click="editUser(item)"
                color="#2196F3"
            >
              mdi-pencil
            </v-icon>
            <v-icon
                size="small"
                @click="deleteUser(item)"
                color="rgb(200, 35, 51)"
            >
              mdi-delete
            </v-icon>
          </td>
        </tr>
      </template>
    </v-data-table>
    <v-btn class="text-none mb-4 create-btn" color="#2196F3" @click="createUser()">Erstellen</v-btn>
  </v-container>
  <v-container v-if="!!selectedUser">
    <v-form ref="form" @submit.prevent="submitForm">
      <v-text-field
          type="text"
          id="username"
          v-model="formData.username"
          :rules="[v => !!v || 'Benutzername ist erforderlich']"
      required
      label="Benutzername" >
      </v-text-field>
      <v-text-field
          v-if="!formData.id"
          type="password"
          id="password"
          v-model="formData.password"
          :rules="[v => !!v || 'Passwort ist erforderlich']"
      required
      label="Passwort"
      ></v-text-field>
      <v-select
          v-model="formData.role"
          label="Rolle"
          :items="roleOptions"
          item-title="label"
          item-value="value"
      ></v-select>
      <div>
        <v-btn type="submit" class="text-none mb-4 right-btn" color="#2196F3">Speichern</v-btn>
        <v-btn class="text-none mb-4 left-btn" color="#757575" @click="cancelForm()">Abbrechen</v-btn>
      </div>
    </v-form>
  </v-container>
</template>
<script>
import authHeader from '../auth/auth-header';
const BASE_URL= process.env.NODE_ENV === 'production' ? 'https://guesto.azurewebsites.net/user' : 'http://localhost:8080/user';

export default {
  data() {
    return {
      users: [],
      headers: [
        { title: 'Benutzername', value: 'username' },
        { title: 'Rolle', value: 'role' },
        { title: 'Aktionen', key: 'actions' },
      ],
      itemsPerPage: 5,
      totalEvents: 0,
      loading: false,
      selectedUser: false,
      formData: {
        username: '',
        password: '',
        role: 'ADMIN' // Default-Rolle
      },
      roleOptions: [],
      success: false,
      failed: false,
      deleteSuccess: false,
      deleteFailed: false,
      showAlert: false,
    }
  },
  name: 'UserPage',
  components: {
  },
  methods: {
    fetchData() {
      this.loading = true;
      this.$axios.get(BASE_URL + '/list', {
        params: {
          _page: this.$route.query.page || 1,
          _limit: this.itemsPerPage,
        },
        headers: authHeader()
      }).then(response => {
        this.users = response.data;
        this.totalEvents = Number(response.headers['x-total-count']);
        this.users.actions = '';
        this.loading = false;
      }).catch(error => {
          console.error('Error fetching data:', error);
          this.loading = false;
        });
    },
    onPageChange(page) {
      this.$router.push({ query: { page } });
      this.fetchData();
    },
    createUser() {
      this.selectedUser = true;
    },
    editUser(item) {
      this.selectedUser = true;
      this.formData = {...this.users.find(o => o.id === item.id)};
    },
    getRoleDisplayText(text) {
      return this.roleOptions.find( o => o.value === text).label;
    },
    async deleteUser(item) {
      const userConfirmed = window.confirm("Sind Sie sicher, dass Sie diesen User löschen möchten?");

      if (!userConfirmed) {
        return;
      }
      this.deleteSuccess = false;
      this.deleteFailed = false;
      try {
        let response = await this.$axios.delete(BASE_URL + '/' + item.id, {
          params: {},
          headers: authHeader()
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
      this.selectedUser = false;
      this.formData = {
        username: '',
        password: '',
        role: 'ADMIN' // Default-Rolle
      };
    },
    async submitForm() {
      this.success = false;
      this.failed = false;

      const isFormValid = await this.$refs.form.validate(); // Hier wird die Validierung durchgeführt
      if (isFormValid.valid) {
        try {
          let response;
          if (this.formData.id) {
            response = await this.$axios.put(BASE_URL + '/' + this.formData.id, this.formData, {
              params: {},
              headers: authHeader()
            });
          } else {
            response = await this.$axios.post(BASE_URL + '/register', this.formData, {
              params: {},
              headers: authHeader()
            });
          }
          if (response) {
            this.success = true;
            this.showAlert = true;
            setTimeout(() => {
              this.showAlert = false;
            }, 2000);
            this.cancelForm();
            this.fetchData();
          }
        } catch (error) {
          this.failed = true;
          this.showAlert = true;
          setTimeout(() => {
            this.showAlert = false;
          }, 2000);
        }
      }
    },
  },
  watch: {
    '$route.query.page'() {
      this.fetchData();
    },
  },
  created() {
    this.roleOptions = [
      { value: 'ADMIN', label: 'Admin' },
      { value: 'STAFF', label: 'Mitarbeiter' },
      { value: 'CONTROLLER', label: 'Kontrolleur' }
    ];
    this.fetchData();
  },
}
</script>

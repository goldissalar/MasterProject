<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="elevation-12 pa-8">
          <v-alert v-if="loginSuccess" type="success" icon="mdi-check-circle-outline" class="mb-4">Login erfolgreich!</v-alert>
          <v-alert v-if="loginFailed" type="error" icon="mdi-alert-circle-outline" class="mb-4">Login fehlgeschlagen!</v-alert>

          <h2 class="text-h2 mb-4">Login</h2>

          <v-form ref="form">
            <v-text-field type="text" id="username" v-model="formData.username" :rules="[rules.required]" label="Benutzername"></v-text-field>
            <v-text-field type="password" id="password" v-model="formData.password" :rules="[rules.required]" label="Passwort"></v-text-field>

            <v-btn color="#008000" dark block @click="validateAndSubmitForm">Anmelden</v-btn>

            <v-alert v-if="validationError" type="error" class="mt-4">{{ validationError }}</v-alert>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import store from '../auth/store';

export default {
  data() {
    return {
      formData: {
        username: '',
        password: ''
      },
      loginSuccess: false,
      loginFailed: false,
      validationError: '',
      rules: {
        required: value => !!value || 'Dieses Feld ist erforderlich',
      },
    };
  },
  methods: {
    async validateAndSubmitForm() {
      this.loginSuccess = false;
      this.loginFailed = false;
      this.validationError = '';

      if (this.$refs.form.validate()) {
        this.submitForm();
      } else {
        this.validationError = 'Bitte füllen Sie alle erforderlichen Felder aus.';
      }
    },
    async submitForm() {
      this.loginSuccess = false;
      this.loginFailed = false;
      this.validationError = '';

      if (!this.formData.username || !this.formData.password) {
        this.validationError = 'Bitte füllen Sie alle erforderlichen Felder aus.';
        return;
      }
      fetch(`https://65c7a2b5e7c384aada6ec54f.mockapi.io/users?username=${this.formData.username}&password=${this.formData.password}`)
          .then(response => response.json())
          .then(users => {
            if (users.length > 0) {
              const loggedInUser = users[0];
              this.loginSuccess = true;
              store.state.auth.loggedIn = true;
              store.state.auth.username = loggedInUser.username;
              store.state.auth.id = loggedInUser.id;
              store.commit('auth/setJWT');
              setTimeout(() => {
                this.$router.push('/todos');
              }, 500);
            } else {
              console.log('Ungültige Anmeldeinformationen');
              this.loginFailed = true;
            }
          })
          .catch(error => console.error('Error:', error));
    }
  },
  created() {
  },
  name: 'LoginForm'
}
</script>



<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="elevation-12 pa-8">
          <v-alert v-if="registrationSuccess" type="success" icon="mdi-check-circle-outline" class="mb-4">Registrierung erfolgreich!</v-alert>
          <v-alert v-if="registrationFailed" type="error" icon="mdi-alert-circle-outline" class="mb-4">Registrierung fehlgeschlagen!</v-alert>

          <h2 class="text-h2 mb-4">Registrieren</h2>

          <v-form ref="form">
            <v-text-field type="text" id="username" v-model="formData.username" :rules="[rules.required]" label="Benutzername"></v-text-field>
            <v-text-field type="password" id="password" v-model="formData.password" :rules="[rules.required]" label="Passwort"></v-text-field>
            <v-btn color="#2196F3" dark block @click="submitForm">Registrieren</v-btn>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
const BASE_URL='https://65c7a2b5e7c384aada6ec54f.mockapi.io/users';

export default {
  data() {
    return {
      formData: {
        username: '',
        password: '',
        createdAt: new Date,
      },
      rules: {
        required: value => !!value || 'Dieses Feld ist erforderlich',
      },
      registrationSuccess: false,
      registrationFailed: false
    };
  },
  methods: {
    async submitForm() {
      this.registrationSuccess = false;
      this.registrationFailed = false;
      try {
        const response = await this.$axios.post(BASE_URL, this.formData);
        if (response) {
          this.registrationSuccess = true;
          setTimeout(() => {
            this.$router.push('/login');
          }, 500);
        }
      } catch (error) {
        this.registrationFailed = true;
      }
    }
  },
  created() {
  },
  name: 'RegistrationForm'
}
</script>

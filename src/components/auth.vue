<script setup>
import { ref } from 'vue'


const isAdmin = ref(true) // true for admin, false for employee
const isCreateAccount = ref(false) // true for create account, false for sign in

// Form data
const signInForm = ref({
  email: '',
  password: ''
})

const adminCreateForm = ref({
  email: '',
  password: '',
  confirmPassword: '',
  companyCode: ''
})

const employeeCreateForm = ref({
  name: '',
  companyLogo: null,
  email: '',
  password: '',
  confirmPassword: ''
})

const handleRoleToggle = (adminRole) => {
  isAdmin.value = adminRole
  isCreateAccount.value = false // Reset to sign in when switching roles
}

const toggleCreateAccount = () => {
  isCreateAccount.value = !isCreateAccount.value
}

const handleFileUpload = (event) => {
  employeeCreateForm.value.companyLogo = event.target.files[0]
}

const handleSignIn = () => {
  console.log('Sign in attempt:', {
    role: isAdmin.value ? 'admin' : 'employee',
    form: signInForm.value
  })
  // Add your sign-in logic here
}

const handleSignUp = () => {
  const formData = isAdmin.value ? adminCreateForm.value : employeeCreateForm.value
  console.log('Sign up attempt:', {
    role: isAdmin.value ? 'admin' : 'employee',
    form: formData
  })
  // Add your sign-up logic here
}
</script>

<template>
  
  <div class="container">
    <div class="form-card">
      <!-- Header with Slack/Threads branding -->
      

      <!-- Role Toggle Buttons -->
      <div class="role-toggle">
        <button
          @click="handleRoleToggle(true)"
          :class="isAdmin ? 'role-button active' : 'role-button inactive'"
        >
          ADMIN
        </button>
        <button
          @click="handleRoleToggle(false)"
          :class="!isAdmin ? 'role-button active' : 'role-button inactive'"
        >
          EMPLOYEE
        </button>
      </div>

      <!-- Form Title -->
      <h2 class="form-title">
        {{ isCreateAccount ? 'Create Account' : 'Sign In' }}
      </h2>

      <!-- Sign In Form (Same for both Admin and Employee) -->
      <div v-if="!isCreateAccount">
        <p class="form-subtitle">
          Please enter your details
        </p>
        
        <div class="form-section">
          <div class="form-group">
            <label class="form-label">
              Email
            </label>
            <input
              type="email"
              v-model="signInForm.email"
              class="form-input"
              placeholder="Enter your email"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">
              Password
            </label>
            <input
              type="password"
              v-model="signInForm.password"
              class="form-input"
              placeholder="Enter your password"
            />
          </div>
        </div>

        <div class="forgot-password">
          <button type="button">
            Forgot your password?
          </button>
        </div>

        <button class="submit-button" @click="handleSignIn">
          SIGN IN
        </button>

        <div class="toggle-form">
          <span>Don't have an account? </span>
          <button
            @click="toggleCreateAccount"
            type="button"
          >
            Create account
          </button>
        </div>
      </div>

      <!-- Create Account Forms (Different for Admin and Employee) -->
      <div v-else>
        <p class="form-subtitle">
          Please enter your details
        </p>
        
        <!-- Admin Create Account Form -->
        <div v-if="!isAdmin" class="form-section">
          <div class="form-group">
            <label class="form-label">
              Email
            </label>
            <input
              type="email"
              v-model="adminCreateForm.email"
              class="form-input"
              placeholder="Enter your email"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">
              Set password
            </label>
            <input
              type="password"
              v-model="adminCreateForm.password"
              class="form-input"
              placeholder="Create a password"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">
              Confirm password
            </label>
            <input
              type="password"
              v-model="adminCreateForm.confirmPassword"
              class="form-input"
              placeholder="Confirm your password"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">
              Company code
            </label>
            <input
              type="text"
              v-model="adminCreateForm.companyCode"
              class="form-input"
              placeholder="Enter company code"
            />
          </div>
        </div>

        <!-- Employee Create Account Form -->
        <div v-else class="form-section">
          <div class="form-group">
            <label class="form-label">
              Name
            </label>
            <input
              type="text"
              v-model="employeeCreateForm.name"
              class="form-input"
              placeholder="Enter your name"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">
              Company Logo
            </label>
            <input
              type="file"
              @change="handleFileUpload"
              class="file-input"
              accept="image/*"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">
              Email
            </label>
            <input
              type="email"
              v-model="employeeCreateForm.email"
              class="form-input"
              placeholder="Enter your email"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">
              Set password
            </label>
            <input
              type="password"
              v-model="employeeCreateForm.password"
              class="form-input"
              placeholder="Create a password"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">
              Confirm password
            </label>
            <input
              type="password"
              v-model="employeeCreateForm.confirmPassword"
              class="form-input"
              placeholder="Confirm your password"
            />
          </div>
        </div>

        <button class="submit-button" @click="handleSignUp">
          SIGN UP
        </button>

        <div class="toggle-form">
          <span>Already have an account? </span>
          <button
            @click="toggleCreateAccount"
            type="button"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>


.container {
  min-height: 100vh;
  background-color: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.form-card {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 28rem;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  color: #d1d5db;
  font-size: 0.875rem;
  font-weight: normal;
  letter-spacing: 0.05em;
}

.role-toggle {
  display: flex;
  margin-bottom: 2rem;
  gap: 0.5rem;
}

.role-button {
  flex: 1;
  padding: 0.5rem 1.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: bold;
  letter-spacing: 0.05em;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
}

.role-button:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.role-button.active {
  background-color: #ef4444;
  color: white;
}

.role-button.inactive {
  background-color: white;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.form-title {
  font-size: 1.875rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 0.5rem;
  color: #111827;
}

.form-subtitle {
  color: #9ca3af;
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: 2rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  background-color: #f3f4f6;
  transition: all 0.2s;
  color: #374151;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px #3b82f6;
  background-color: white;
}

.form-input::placeholder {
  color: #9ca3af;
}

.file-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  background-color: #f3f4f6;
  transition: all 0.2s;
  color: #374151;
  cursor: pointer;
}

.file-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px #3b82f6;
  background-color: white;
}

.file-input::-webkit-file-upload-button {
  margin-right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  background-color: #eff6ff;
  color: #1d4ed8;
  cursor: pointer;
}

.file-input::-webkit-file-upload-button:hover {
  background-color: #dbeafe;
}

.forgot-password {
  margin-top: 1rem;
  text-align: left;
}

.forgot-password button {
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: none;
}

.forgot-password button:hover {
  text-decoration: underline;
}

.submit-button {
  width: 100%;
  background-color: #2563eb;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-top: 2rem;
  border: none;
  font-weight: bold;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover {
  background-color: #1d4ed8;
}

.toggle-form {
  margin-top: 2rem;
  text-align: center;
}

.toggle-form span {
  color: #6b7280;
  font-size: 0.875rem;
}

.toggle-form button {
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: none;
}

.toggle-form button:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .form-card {
    padding: 1.5rem;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
}
</style>
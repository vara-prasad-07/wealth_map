<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router';
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

const router = useRouter()
const isAdmin = ref(true) // true for admin, false for employee
const isCreateAccount = ref(false) // true for create account, false for sign in
const admincreateemail=ref('')
const admincreatepass=ref('')
const companyName=ref('')
const loginemail=ref('')
const loginpass=ref('')
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

const handleSignIn = async () => {
  console.log('Sign in attempt:', {
    role: isAdmin.value ? 'admin' : 'employee',
    form: signInForm.value
  })
  if (isAdmin){
    try{
      const signincred=await signInWithEmailAndPassword(auth, loginemail.value, loginpass.value);
      router.push('\map')
      console.log("login success")
    }
    catch(error){
      console.log(error)
    }
  }
  
}
const registerAdmin = async () => {
  try {
  const cred = await createUserWithEmailAndPassword(auth, admincreateemail.value, admincreatepass.value);
  router.push('/map')
  const companyRef = await addDoc(collection(db, 'companies'), {
    name: companyName.value,
    createdBy: cred.user.uid,
    visibility: 'private',
    createdAt: serverTimestamp()
  });

  await setDoc(doc(db, 'users', cred.user.uid), {
    uid: cred.user.uid,
    email: admincreateemail.value,
    role: 'admin',
    companyId: companyRef.id,
    joinedAt: serverTimestamp()
  });

  console.log("Company and user created:", companyRef.id);
} catch (err) {
  console.error("Firestore Error:", err.message);
}
}
const handleSignUp = () => {
  const formData = isAdmin.value ? adminCreateForm.value : employeeCreateForm.value
  if(formData){
    registerAdmin()
  }
  
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
              v-model="loginemail"
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
              v-model="loginpass"
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
              v-model="companyName"
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
              v-model="admincreateemail"
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
              v-model="admincreatepass"
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
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow:hidden;
}

.form-card {
  background-color: white;
  border-radius: 1rem;
  
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
/* Mobile First Responsive Design */

/* Extra Small devices (phones, 576px and down) */
@media (max-width: 575px) {
  .container {
    padding: 0.5rem;
    min-height: 100vh;
    align-items: flex-start;
    padding-top: 2rem;
     overflow-y:hidden;
  }

  .form-card {
    padding: 1.25rem;
    border-radius: 0.75rem;
  
    max-width: 100%;
  }

  .header h1 {
    font-size: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .role-toggle {
    margin-bottom: 1.5rem;
    gap: 0.25rem;
  }

  .role-button {
    padding: 0.625rem 1rem;
    font-size: 0.6875rem;
    border-radius: 1.5rem;
  }

  .form-title {
    font-size: 1.375rem;
    margin-bottom: 0.75rem;
  }

  .form-subtitle {
    font-size: 0.8125rem;
    margin-bottom: 1.5rem;
  }

  .form-section {
    margin-bottom: 1.5rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-label {
    font-size: 0.8125rem;
    margin-bottom: 0.375rem;
  }

  .form-input,
  .file-input {
    padding: 0.625rem 0.875rem;
    font-size: 0.9375rem;
    border-radius: 0.375rem;
  }

  .file-input::-webkit-file-upload-button {
    margin-right: 0.75rem;
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
  }

  .submit-button {
    padding: 0.875rem 1rem;
    font-size: 0.8125rem;
    margin-top: 1.5rem;
  }

  .toggle-form {
    margin-top: 1.5rem;
  }

  .toggle-form span,
  .toggle-form button {
    font-size: 0.8125rem;
  }

  .forgot-password button {
    font-size: 0.8125rem;
  }
}

/* Small devices (landscape phones, 576px and up) */
@media (min-width: 576px) and (max-width: 767px) {
  .container {
    padding: 1rem;
     overflow:hidden;
  }

  .form-card {
    padding: 1.5rem;
    max-width: 26rem;
  }

  .form-title {
    font-size: 1.5rem;
  }

  .role-button {
    padding: 0.5rem 1.25rem;
    font-size: 0.71875rem;
  }

  .form-input,
  .file-input {
    padding: 0.6875rem 0.9375rem;
  }
}

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) and (max-width: 991px) {
  .container {
    padding: 1.5rem;
     overflow:hidden;
  }

  .form-card {
    padding: 2.25rem;
    max-width: 30rem;
  }

  .form-title {
    font-size: 2rem;
  }

  .header h1 {
    font-size: 0.9375rem;
  }

  .role-button {
    padding: 0.625rem 1.75rem;
    font-size: 0.8125rem;
  }

  .form-input,
  .file-input {
    padding: 0.8125rem 1.125rem;
    font-size: 1.0625rem;
  }

  .submit-button {
    padding: 0.875rem 1.25rem;
    font-size: 0.9375rem;
  }
}

/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) and (max-width: 1199px) {
  .container {
    padding: 2rem;
     overflow:hidden;
  }

  .form-card {
    padding: 2.5rem;
    max-width: 32rem;
  }

  .form-title {
    font-size: 2.125rem;
  }

  .header h1 {
    font-size: 1rem;
  }

  .role-button {
    padding: 0.75rem 2rem;
    font-size: 0.875rem;
  }

  .form-input,
  .file-input {
    padding: 0.875rem 1.25rem;
    font-size: 1.125rem;
  }

  .submit-button {
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }
}

/* Extra large devices (large desktops, 1200px and up) */
@media (min-width: 1200px) {
  .container {
    padding: 2.5rem;
     overflow:hidden;
  }

  .form-card {
    padding: 3rem;
    max-width: 36rem;
   
  }

  .header {
    margin-bottom: 2.5rem;
  }

  .header h1 {
    font-size: 1.125rem;
    letter-spacing: 0.075em;
  }

  .role-toggle {
    margin-bottom: 2.5rem;
    gap: 0.75rem;
  }

  .role-button {
    padding: 0.875rem 2.25rem;
    font-size: 0.9375rem;
    letter-spacing: 0.075em;
  }

  .form-title {
    font-size: 2.25rem;
    margin-bottom: 1rem;
  }

  .form-subtitle {
    font-size: 1rem;
    margin-bottom: 2.5rem;
  }

  .form-section {
    margin-bottom: 2.5rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-label {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }

  .form-input,
  .file-input {
    padding: 1rem 1.5rem;
    font-size: 1.1875rem;
    border-radius: 0.625rem;
  }

  .file-input::-webkit-file-upload-button {
    margin-right: 1.25rem;
    padding: 0.625rem 1.25rem;
    font-size: 1rem;
  }

  .forgot-password {
    margin-top: 1.25rem;
  }

  .forgot-password button {
    font-size: 1rem;
  }

  .submit-button {
    padding: 1.125rem 1.75rem;
    font-size: 1.0625rem;
    margin-top: 2.5rem;
    border-radius: 0.625rem;
    letter-spacing: 0.075em;
  }

  .toggle-form {
    margin-top: 2.5rem;
  }

  .toggle-form span,
  .toggle-form button {
    font-size: 1rem;
  }
}

/* Landscape orientation adjustments for mobile */
@media (max-height: 600px) and (orientation: landscape) {
  .container {
    align-items: flex-start;
    padding-top: 1rem;
    padding-bottom: 1rem;
     overflow:hidden;
  }

  .form-card {
    margin: 0 auto;
  }

  .header {
    margin-bottom: 1rem;
  }

  .role-toggle {
    margin-bottom: 1rem;
  }

  .form-title {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .form-subtitle {
    margin-bottom: 1rem;
  }

  .form-section {
    margin-bottom: 1rem;
  }

  .form-group {
    margin-bottom: 0.75rem;
  }

  .submit-button {
    margin-top: 1rem;
  }

  .toggle-form {
    margin-top: 1rem;
  }
}
</style>
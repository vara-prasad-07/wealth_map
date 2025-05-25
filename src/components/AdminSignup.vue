<script setup>
import { ref } from 'vue'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const companyName = ref('')
const router = useRouter()

const registerAdmin = async () => {
  const cred = await createUserWithEmailAndPassword(auth, email.value, password.value)

  // Create company
  const companyRef = await addDoc(collection(db, 'companies'), {
    name: companyName.value,
    createdBy: cred.user.uid,
    visibility: 'private',
    createdAt: serverTimestamp()
  })

  // Create user
  await setDoc(doc(db, 'users', cred.user.uid), {
    uid: cred.user.uid,
    email: email.value,
    role: 'admin',
    companyId: companyRef.id,
    joinedAt: serverTimestamp()
  })

  router.push('/')
}
</script>

<template>
  <div>
    <h2>Admin Signup</h2>
    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <input v-model="companyName" placeholder="Company Name" />
    <button @click="registerAdmin">Signup</button>
  </div>
</template>

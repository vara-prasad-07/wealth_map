<script setup>
import { ref } from 'vue'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'

const inviteLink = ref('')
let companyId = ''

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    companyId = userDoc.data().companyId
  }
})

const generateInvite = async () => {
  const inviteDoc = await addDoc(collection(db, 'invites'), {
    companyId,
    createdBy: auth.currentUser.uid,
    used: false,
    createdAt: serverTimestamp()
  })

  inviteLink.value = `${window.location.origin}/employeesignup?invite=${inviteDoc.id}`
}
</script>

<template>
  <div>
    <button @click="generateInvite" class="action-button">Generate Invite</button>
    <p v-if="inviteLink">Share this: {{ inviteLink }}</p>
  </div>
</template>
<style scoped>
.action-button {
  background-color: #e0e0e0;
  color: #000;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: bold;
  margin: 10px 0;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}
.action-button:hover {
  background-color: #d6d6d6;
  transform: scale(1.05);
}

.action-button:active {
  background-color: #c0c0c0;
  transform: scale(0.95);
}
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
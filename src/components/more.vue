<script setup>
import { ref, onMounted } from 'vue'
import sidebar from '../layout/sidebar.vue'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase' // Make sure this path matches your firebase config file location

const userDetails = ref({
  name: '',
  email: '',
  role: '',
  companyId: ''
})
const companDetails=ref({
  name:''
})
const fetchUserDetails = async () => {
  try {
    // Get UID from localStorage
    const basicUser = localStorage.getItem('basicUser')
    if (!basicUser) {
      console.error('No user data found in localStorage')
      return
    }

    const userData = JSON.parse(basicUser)
    const uid = userData.uid

    // Fetch user details from Firestore
    const userDoc = doc(db, 'users', uid)
    
    const response = await getDoc(userDoc)

    if (response.exists()) {
      const data = response.data()
      userDetails.value = {
        ...data,
        role: data.role || 'Not specified',
        companyId: data.companyId || 'Not specified'
      }
      const companydetails=doc('db','companies',data.companyId)
      let companydetailsresponse=await getDoc(companydetails)
      if(companydetailsresponse.exists()){
        const companydata=companydetailsresponse.data()
        console.log(companydata)
      }
    } else {
      console.error('No user document found in Firestore')
    }
  } catch (error) {
    console.error('Error fetching user details:', error)
  }
}

onMounted(() => {
  fetchUserDetails()
})
</script>

<template>
  <div class="container">
    <sidebar/>
    <div class="mobile-header">
      <h2>Account Details</h2>
      <button class="invite-button">Invite Employees +</button>
    </div>
    
    <div class="user-details">
      <div class="detail-item">
        <label>Name:</label>
        <span >{{ userDetails.name }}</span>
      </div>
      <div class="detail-item">
        <label>Email:</label>
        <span >{{ userDetails.email }}</span>
      </div>
      <div class="detail-item">
        <label>Role:</label>
        <span >{{ userDetails.role }}</span>
      </div>
      <div class="detail-item">
        <label>Company ID:</label>
        <span >{{ userDetails.companyId }}</span>
      </div>
    </div>

    <div class="action-buttons">
      <button class="action-button">Invite Employees +</button>
      <button class="action-button">Know More</button>
    </div>
  </div>
</template>

<style scoped>
.container {
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 200px;
  margin: auto;
  position: absolute;
  z-index: 2000;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

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
  width: 100%;
}

.action-button:hover {
  background-color: #d6d6d6;
  transform: scale(1.05);
}

.action-button:active {
  background-color: #c0c0c0;
  transform: scale(0.95);
}

.mobile-header {
  display: none;
}
span{
  color:black;
  margin-left:10px;
  font-size:16px;
  font-weight:bold;
  font-style:italic;
}

.user-details {
  display: none;
}

@media screen and (max-width: 768px) {
  .container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    border-radius: 0;
    overflow-y: auto;
    padding: 0;
  }

  .mobile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #ffffff;
    border-bottom: 1px solid #e0e0e0;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .mobile-header h2 {
    margin: 0;
    font-size: 1.25rem;
  }

  .invite-button {
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
  }

  .user-details {
    display: block;
    padding: 1.5rem;
  }

  .detail-item {
    margin-bottom: 1.5rem;
  }

  .detail-item label {
    display: block;
    font-weight: bold;
    color: #666;
    margin-bottom: 0.5rem;
  }

  .detail-item span {
    font-size: 1.1rem;
  }

  .action-buttons {
    padding: 1rem;
    display:none;
  }

  .action-button {
    margin: 0.5rem 0;
  }
}
</style>
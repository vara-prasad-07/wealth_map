<script setup>
import { ref,onMounted } from 'vue'
import sidebar from '../layout/sidebar.vue'
import { db } from '../firebase'
import { doc, getDoc } from "firebase/firestore"

const companyId = "9mtW21795c48r09s6nN9"; // Use your actual company id
const bookmarks = ref([])

const activeTab = ref('properties')

const properties = [
  { id: 1, name: 'Sunset Villa', location: 'California', price: '$1,200,000' },
  { id: 2, name: 'Ocean Breeze', location: 'Florida', price: '$950,000' },
  { id: 3, name: 'Mountain Retreat', location: 'Colorado', price: '$800,000' }
  ,
  { id: 3, name: 'Mountain Retreat', location: 'Colorado', price: '$800,000' }
  ,
  { id: 3, name: 'Mountain Retreat', location: 'Colorado', price: '$800,000' }
  ,
  { id: 3, name: 'Mountain Retreat', location: 'Colorado', price: '$800,000' },
  
]

const owners = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '555-1234' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '555-5678' },
  
]
onMounted(async () => {
  const companyRef = doc(db, "companies", companyId)
  const snap = await getDoc(companyRef)
  if (snap.exists() && snap.data().bookmarks) {
    bookmarks.value = snap.data().bookmarks
  }
})
</script>

<template>
    <sidebar/>
  <div class="bookmark-container">
     <div class="tab-header">
    <button :class="['tab-btn', { active: activeTab === 'properties' }]" @click="activeTab = 'properties'">Properties</button>
    <button :class="['tab-btn', { active: activeTab === 'owners' }]" @click="activeTab = 'owners'">Owners</button>
  </div>
  <div class="tab-content">
    <div v-if="activeTab === 'properties'" class="card-list">
      <div v-for="item in bookmarks.filter(b => b.type === 'property')" :key="item.timestamp" class="card">
        <h3>{{ item.address }}</h3>
        <p><strong>Value:</strong> {{ item.value }}</p>
        <p><strong>Lat/Lng:</strong> {{ item.lat }}, {{ item.lng }}</p>
        <button class="view-btn">View Details</button>
      </div>
    </div>
    <div v-else class="card-list">
      <div v-for="item in bookmarks.filter(b => b.type === 'owner')" :key="item.timestamp" class="card">
        <h3>{{ item.name }}</h3>
        <p><strong>Net Worth:</strong> {{ item.netWorth }}</p>
        <p><strong>Properties:</strong> {{ item.propertiesCount }}</p>
        <button class="view-btn">View Details</button>
      </div>
    </div>
  </div>
  </div>
</template>

<style scoped>

.bookmark-container {
  max-width: 600px;
  
  height:100vh;
  border-radius: 12px;
  
  margin-top:1rem;

}

.tab-header {
  display: flex;
  justify-content: space-evenly;
  margin-bottom: 2rem;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem 0;
  background: #e0e0e0;
  border: none;
  border-radius: 8px 8px 0 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  margin-right: 8px;
}

.tab-btn:last-child {
  margin-right: 0;
}

.tab-btn.active {
  background: #3f0e40;
  color: #fff;
}

.tab-content {
  min-height: 200px;
  margin-left: 9rem;
  max-height: 95vh;
  overflow-y: auto;
  /* Hide scrollbar for Chrome, Safari and Opera */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
}
.tab-content::-webkit-scrollbar {
  display: none;
}

.card-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.08);
  padding: 1.2rem 1rem;
  width: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.15rem;
  color: #3f0e40;
}

.card p {
  margin: 0.2rem 0;
  color: #444;
  font-size: 0.97rem;
}

.view-btn {
  margin-top: 1rem;
  background: #3f0e40;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.1rem;
  font-size: 0.97rem;
  cursor: pointer;
  transition: background 0.2s;
}
.export-btn{
margin-top: 1rem;
  background: mediumblue;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.1rem;
  font-size: 0.97rem;
  cursor: pointer;
  transition: background 0.2s;
  margin-left:5px;
}

.view-btn:hover {
  background: #5a2060;
}
.export-btn:hover{
    background:blue;
}
@media (max-width: 768px) {
    .tab-content {
  min-height: 200px;
  margin:0;
  

}
}
</style>
<script setup>
import { ref } from 'vue'
import sidebar from '../layout/sidebar.vue'
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
  { id: 3, name: 'Mountain Retreat', location: 'Colorado', price: '$800,000' }
]

const owners = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '555-1234' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '555-5678' }
]
</script>

<template>
    <sidebar/>
  <div class="bookmark-container">
    <div class="tab-header">
      <button
        :class="['tab-btn', { active: activeTab === 'properties' }]"
        @click="activeTab = 'properties'"
      >
        Properties
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'owners' }]"
        @click="activeTab = 'owners'"
      >
        Owners
      </button>
    </div>
    <div class="tab-content">
      <div v-if="activeTab === 'properties'" class="card-list">
        <div v-for="property in properties" :key="property.id" class="card">
          <h3>{{ property.name }}</h3>
          <p><strong>Location:</strong> {{ property.location }}</p>
          <p><strong>Price:</strong> {{ property.price }}</p>
          <div>
          <button class="view-btn">View Details</button>
          <button class="export-btn" >Export Details</button>
          </div>
        </div>
      </div>
      <div v-else class="card-list">
        <div v-for="owner in owners" :key="owner.id" class="card">
          <h3>{{ owner.name }}</h3>
          <p><strong>Email:</strong> {{ owner.email }}</p>
          <p><strong>Phone:</strong> {{ owner.phone }}</p>
          <div>
          <button class="view-btn">View Details</button>
          <button class="export-btn">Export Details</button>
          </div>
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
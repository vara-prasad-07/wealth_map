<script setup>
import sidebar from '../layout/sidebar.vue'
import { ref, onMounted, computed } from 'vue'

const searchTerm = ref('')

const owners = ref([
  {
    id: 1,
    rank: 1,
    name: 'Elon Musk',
    netWorth: '406.9B',
    age: 53,
    country: 'United States',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: 2,
    rank: 2,
    name: 'Jeff Bezos',
    netWorth: '195.4B',
    age: 60,
    country: 'United States',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: 3,
    rank: 3,
    name: 'Bernard Arnault',
    netWorth: '192.8B',
    age: 75,
    country: 'France',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: 4,
    rank: 4,
    name: 'Bill Gates',
    netWorth: '134.2B',
    age: 69,
    country: 'United States',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: 5,
    rank: 5,
    name: 'Warren Buffett',
    netWorth: '133.1B',
    age: 94,
    country: 'United States',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: 6,
    rank: 6,
    name: 'Larry Page',
    netWorth: '129.5B',
    age: 51,
    country: 'United States',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: 7,
    rank: 7,
    name: 'Sergey Brin',
    netWorth: '124.3B',
    age: 51,
    country: 'United States',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: 8,
    rank: 8,
    name: 'Larry Ellison',
    netWorth: '122.7B',
    age: 80,
    country: 'United States',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: 9,
    rank: 9,
    name: 'Steve Ballmer',
    netWorth: '117.8B',
    age: 68,
    country: 'United States',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: 10,
    rank: 10,
    name: 'Mukesh Ambani',
    netWorth: '102.6B',
    age: 67,
    country: 'India',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: 11,
    rank: 11,
    name: 'Jensen Huang',
    netWorth: '98.4B',
    age: 61,
    country: 'Taiwan',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: 12,
    rank: 12,
    name: 'Gautam Adani',
    netWorth: '96.2B',
    age: 62,
    country: 'India',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: 13,
    rank: 13,
    name: 'Francoise Bettencourt',
    netWorth: '94.8B',
    age: 71,
    country: 'France',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c5ab?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: 14,
    rank: 14,
    name: 'Michael Dell',
    netWorth: '89.1B',
    age: 59,
    country: 'United States',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: 15,
    rank: 15,
    name: 'Carlos Slim',
    netWorth: '87.6B',
    age: 84,
    country: 'Mexico',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: 16,
    rank: 16,
    name: 'Mark Zuckerberg',
    netWorth: '86.3B',
    age: 40,
    country: 'United States',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: 17,
    rank: 17,
    name: 'Amancio Ortega',
    netWorth: '84.7B',
    age: 88,
    country: 'Spain',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: 18,
    rank: 18,
    name: 'Rob Walton',
    netWorth: '82.9B',
    age: 80,
    country: 'United States',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: 19,
    rank: 19,
    name: 'Jim Walton',
    netWorth: '81.4B',
    age: 76,
    country: 'United States',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: 20,
    rank: 20,
    name: 'Alice Walton',
    netWorth: '80.2B',
    age: 75,
    country: 'United States',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c5ab?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: 21,
    rank: 21,
    name: 'Zhong Shanshan',
    netWorth: '78.9B',
    age: 70,
    country: 'China',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: 22,
    rank: 22,
    name: 'Giovanni Ferrero',
    netWorth: '77.3B',
    age: 59,
    country: 'Italy',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: 23,
    rank: 23,
    name: 'Julia Koch',
    netWorth: '75.8B',
    age: 62,
    country: 'United States',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c5ab?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: 24,
    rank: 24,
    name: 'Charles Koch',
    netWorth: '74.2B',
    age: 89,
    country: 'United States',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: 25,
    rank: 25,
    name: 'Ma Huateng',
    netWorth: '72.6B',
    age: 53,
    country: 'China',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face'
  }
])

const filteredOwners = computed(() => {
  if (!searchTerm.value.trim()) {
    return owners.value
  }
  
  const term = searchTerm.value.toLowerCase()
  return owners.value.filter(owner => 
    owner.name.toLowerCase().includes(term) ||
    owner.country.toLowerCase().includes(term)
  )
})

const clearSearch = () => {
  searchTerm.value = ''
}
</script>
<template>
    <sidebar />
     <div class="owners-container">
    <div class="search-section">
      <div class="search-wrapper">
        <input 
          type="text" 
          placeholder="Search Owners" 
          v-model="searchTerm"
          @input="filterOwners"
          class="search-input"
        />
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <button v-if="searchTerm" @click="clearSearch" class="clear-btn">×</button>
      </div>
    </div>

    <div class="title-section">
      <h1 class="main-title">REAL TIME RICHEST OWNERS LIST</h1>
    </div>

    <div class="table-container">
      <div class="table-header">
        <div class="header-cell rank-col">Rank</div>
        <div class="header-cell name-col">Name</div>
        <div class="header-cell networth-col">Net Worth</div>
        <div class="header-cell age-col">Age</div>
        <div class="header-cell country-col">Country</div>
        <div class="header-cell actions-col"></div>
      </div>

      <div class="owners-list">
        <div 
          v-for="owner in filteredOwners" 
          :key="owner.id"
          class="owner-row"
        >
          <div class="owner-content">
            <div class="rank-cell">{{ owner.rank }}</div>
            
            <div class="profile-cell">
              <img 
                :src="owner.avatar" 
                :alt="owner.name"
                class="avatar"
              />
              <span class="name">{{ owner.name }}</span>
            </div>
            
            <div class="networth-cell">${{ owner.netWorth }}</div>
            <div class="age-cell">{{ owner.age }}</div>
            <div class="country-cell">{{ owner.country }}</div>
            
            <div class="actions-cell">
              <button class="action-btn primary">Know More</button>
              <button class="action-btn secondary">Compare With</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.owners-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.search-section {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

.search-wrapper {
  position: relative;
  width: 400px;
}

.search-input {
  width: 100%;
  padding: 12px 45px 12px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 25px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  border-color: #3b82f6;
}

.search-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.clear-btn {
  position: absolute;
  right: 45px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-section {
  text-align: center;
  margin-bottom: 40px;
}

.main-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: 1px;
  margin: 0;
}

.table-container {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width:1350px;
  flex:wrap;
}

.table-header {
  display: grid;
  grid-template-columns: 80px 200px 120px 80px 150px 1fr;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 20px;
  font-weight: 600;
  color: #6b7280;
  font-size: 14px;
}

.header-cell {
  display: flex;
  align-items: center;
}

.owners-list {
  max-height: 600px;
  overflow-y: auto;

}
.owners-list::-webkit-scrollbar {
  display: none;
}

.owner-row {
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
}

.owner-row:hover {
  background-color: #f9fafb;
}

.owner-content {
  display: grid;
  grid-template-columns: 80px 200px 120px 80px 150px 1fr;
  padding: 16px 20px;
  align-items: center;
}

.rank-cell {
  font-weight: 600;
  color: #1f2937;
  font-size: 16px;
}

.profile-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.name {
  font-weight: 500;
  color: #1f2937;
  font-size: 15px;
}

.networth-cell {
  font-weight: 600;
  color: #1f2937;
  font-size: 15px;
}

.age-cell,
.country-cell {
  color: #6b7280;
  font-size: 14px;
}

.actions-cell {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.action-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.action-btn.primary {
  background: #1f2937;
  color: white;
  border-color: #1f2937;
}

.action-btn.primary:hover {
  background: #374151;
  border-color: #374151;
}

.action-btn.secondary {
  background: white;
  color: #6b7280;
  border-color: #d1d5db;
}

.action-btn.secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

/* Responsive Design */
@media (max-width: 768px) {
  .search-wrapper {
    width: 70%;
    
    right:20%;
  }

  .search-input {
  
  
  min-width: 120px;
    
}
  
  .table-header,
  .owner-content {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .table-header {
    display: none;
  }
  .table-container{
    max-width:400px;
  }
  .rank-cell {
  font-weight: 600;
  color: #1f2937;
  font-size: 16px;
  text-align:left;
}
  .owner-content {
    display: block;
    padding: 20px;
  }
  .main-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: 1px;
  margin: 0;
  text-align:left;
}
  .profile-cell {
    margin-bottom: 10px;
  }
  
  .actions-cell {
    justify-content: flex-start;
    margin-top: 15px;
  }
  .owners-list {
  max-height: 600px;
  overflow-y: auto;
  max-width:600px;

}
}
</style>
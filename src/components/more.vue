<script setup>
import { ref } from 'vue'
</script>

<template>
  <div class="container">
    <button class="action-button">Invite Employees +</button>
    <button class="action-button">Refer Friend +</button>
    <button class="action-button">Know More</button>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 200px;
  margin: auto;
  position:absolute;
  z-index:2000;
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
}

.action-button:hover {
  background-color: #d6d6d6;
  transform: scale(1.05);
}

.action-button:active {
  background-color: #c0c0c0;
  transform: scale(0.95);
}
</style>
<script setup>
   import { useRouter } from 'vue-router';
   import more from '../components/more.vue'
   
   import { ref } from 'vue';
   const router=useRouter()
   const showMoreOptions = ref(false); // State to toggle the visibility of the pop-up container

const toggleMoreOptions = () => {
  showMoreOptions.value = !showMoreOptions.value; // Toggle the visibility
};
   
</script>

<template>
  
 <div class="sidebar">
    <div class="sidebar_part_1">
    <div href="http://localhost:5173/">
   <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTILstzE4n4jxRaa2LcTb5Uf_JKLVtXIZjL3w&s" alt="logo" class="logo" style=" margin-bottom: 2rem;" />
    </div>
      
  <a @click="router.push('/map')">
   <i class="pi pi-globe" style="font-size: 1.5rem"></i>
   Map
</a>
    <a @click="router.push('/owners')">
    <i class="pi pi-user" style="font-size: 1.5rem"></i>
        Owner</a>
        <a  @click="router.push('/bookmarks')">
    <i class="pi pi-bookmark" style="font-size: 1.5rem"></i>
        Files</a>
    <a  @click="toggleMoreOptions">
    <i class="pi pi-ellipsis-v" style="font-size: 1.5rem"></i>
        More</a>
    
</div>
 
 <div class="logo-container">
    <img src="https://openclipart.org/image/2000px/247319" alt="logo" class="logo" />
   </div>
 </div>
 
<div v-if="showMoreOptions" class="more-options">
      <button class="action-button">Invite Employees +</button>
      <button class="action-button">Refer Friend +</button>
      <button class="action-button">Know More</button>
    </div>
 <div class="bottom">
    <div @click="router.push('/map')">
         <i class="pi pi-globe" style="font-size: 1.2rem"></i>
          <a>Map</a>
    </div>
     <div @click="router.push('/owners')">
          <i class="pi pi-user" style="font-size: 1.2rem"></i>
        <a>Owner</a>
    </div>
     <div @click="router.push('/bookmarks')">
         <i class="pi pi-bookmark" style="font-size: 1.2rem"></i>
         <a>Files</a>
    </div>
     <div >
        <i class="pi pi-ellipsis-h" style="font-size: 1.2rem"></i>
         <a>More</a>
    </div>
    
    
 </div>
  
</template>

<style>
.top{
    width: 100%;
    height: 44px;
    background-color: #3f0e40;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;
    display: grid;
    grid-template-columns: 2fr 100px;
    align-items: center;
    padding-bottom:10px ;
}

.sidebar{
    width: 72px;
    height: 100vh;
    background-color:#3f0e40;
    padding: 20px;
    box-shadow: 2px 0 5px rgba(0,0,0,0.1);
    position: fixed;
    z-index: 1;
    top: 0;
    left: 0;
    overflow: hidden;
    
    
}
.bottom{
    position: absolute;
    z-index: 999;
}
.bottom div{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 1rem;
}
.search{
    width: 714px;
    height: 30px;
    border-radius: 5px;
    border: none;
   
    
    background-color: #fff;
    opacity: 0.2;
    
    
}
.search[placeholder="Search"]{
    color:white;
}
.sidebar a{
    display: block;
    color: white;
    padding: 10px 15px;
    text-decoration: none;
    margin-bottom: 1.6rem;
    border-radius: 5px;
    transition: background-color 0.3s ease;
    cursor: pointer;
    padding:12px 12px 12px 12px;
}
.sidebar a:hover{
    background-color: #333;
    color: white;
}
.sidebar div{
    margin-top: 5rem;
}
.logo{
    width: 38px;
    height: 38px;
    padding:6px 12px 6px 12px;
    border-radius: 12px;
   
}
.logo-container{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    
   
}

.bottom{
    display: none;
}
@media screen and (max-width: 768px) {
   
.bottom{
width: 100%;
height: 68px;
position:fixed;
bottom: 0;
left: 0;
background-color: #3f0e40;
right: 0;
display: flex;
flex-direction: row;
justify-content: space-evenly;
padding-top: 0.9rem;
}
.bottom div a{
display: block;
color: white;
padding: 10px 15px;
text-decoration: none;
margin-bottom: 10px;
border-radius: 5px;

cursor: pointer;
font-size:12px;
}
.bottom div :hover {
   background-color: #333;
   color: white;
}

.sidebar{
    display: none;
}
.top{
    display: none;
}
.more-options{
    display:none;
}
}
.more-options {
  position: absolute;
  top: 50%;
  left: 80px; /* Adjust to position beside the "More" icon */
  transform: translateY(-50%);
  background-color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 1rem;
  z-index: 9999; /* Set a high z-index to ensure visibility */
  animation: slide-in 0.3s ease-out;
  display:flex;
  flex-direction:column;
  align-items:center;
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
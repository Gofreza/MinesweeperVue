<script setup lang="ts">
    import { useGlobalStore } from "../stores/global"
    import { ref, onMounted } from 'vue';

    const store = useGlobalStore()

    const isActive = ref(false);

    onMounted(() => {
        isActive.value = true; // Affiche le modal automatiquement au montage
    });
</script>
<template>
    <div :class="['modal-window', { active: isActive }]">
        <div class="modal-content">
            <div v-if="store.isWin">
                <h1>Partie gagné !</h1>
            </div>
            <div v-else>
                <h1>Partie perdu...</h1>
            </div>
            
            <a href="#" class="modal-close" @click="isActive = false">Fermer</a>
            <a href="/solo" class="modal-close" @click="isActive = false">Rejouer</a>
        </div>
    </div>
</template>
<style scoped>
.modal-window {
position: fixed;
top: 0;
left: 0;
right: 0;
bottom: 0;
background-color: rgba(0, 0, 0, 0.7);
display: flex;
align-items: center;
justify-content: center;
z-index: 999;
opacity: 0;
transition: opacity 0.3s ease;
visibility: hidden;
}

.modal-window.active {
    opacity: 1;
    visibility: visible;
}

.modal-content {
    background: white;
    padding: 2em;
    border-radius: 8px;
    text-align: center;
}

.modal-close {
  color: #aaa;
  line-height: 50px;
  font-size: 80%;
  /* position: absolute; */
  right: 0;
  text-align: center;
  top: 0;
  width: 70px;
  text-decoration: none;
  &:hover {
    color: black;
    }
}
h1 {
    font-size: 1.5rem;
    margin: 0;
}
a {
    padding: 10px;
}

</style>
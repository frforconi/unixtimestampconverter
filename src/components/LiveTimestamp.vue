<template>
  <div class="island-card">
    <h2>Unix Time (Seconds)</h2>
    <div class="time-display">{{ isMounted ? seconds : '---' }}</div>
    <div class="label">Seconds since epoch</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const seconds = ref(0);
const isMounted = ref(false);
let intervalId;
let timeoutId;

const updateTime = () => {
  seconds.value = Math.floor(Date.now() / 1000);
};

onMounted(() => {
  isMounted.value = true;
  updateTime();
  // Update every second is enough for seconds resolution
  // Start Loop synchronized with the next full second
    const msToNextSecond = 1000 - (Date.now() % 1000);
    timeoutId = setTimeout(() => {
      updateTime();
      intervalId = setInterval(updateTime, 1000);
    }, msToNextSecond);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
  if (timeoutId) clearTimeout(timeoutId);
});
</script>

<style scoped>
.island-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.island-card:hover {
  transform: translateY(-5px);
}

h2 {
  font-size: 1.2rem;
  color: #a0a0a0;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.time-display {
  font-family: 'Courier New', Courier, monospace;
  font-size: 3rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  margin: 1rem 0;
}

.label {
  font-size: 0.9rem;
  color: #888;
}
</style>

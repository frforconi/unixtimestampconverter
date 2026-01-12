<template>
  <div class="island-card">
    <h2>Unix Time (ms)</h2>
    <div class="time-display">{{ milliseconds }}</div>
    <div class="label">Milliseconds since epoch</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const milliseconds = ref(Date.now());
let intervalId;

const updateTime = () => {
  milliseconds.value = Date.now();
};

onMounted(() => {
  // Update every frame for smooth visuals, or at least every millisecond ideally (limited by JS loop)
  // requestAnimationFrame is better for visuals, but setInterval is okay for simple updates
  // Let's use requestAnimationFrame for "real-time" feel
  const loop = () => {
    updateTime();
    intervalId = requestAnimationFrame(loop);
  };
  loop();
});

onUnmounted(() => {
  if (intervalId) cancelAnimationFrame(intervalId);
});
</script>

<style scoped>
.island-card {
  background: rgba(255, 255, 255, 0.1);
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

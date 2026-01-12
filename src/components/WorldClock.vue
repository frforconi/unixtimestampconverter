<template>
  <div class="island-card">
    <h2>World Clock</h2>
    <div class="zones-grid">
      <div v-for="zone in zones" :key="zone.name" class="zone-item">
        <div class="zone-name">{{ zone.label }}</div>
        <div class="zone-time">{{ zone.time }}</div>
        <div class="zone-day">{{ zone.day }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const zones = ref([
  { name: 'UTC', label: 'UTC', time: '', day: '' },
  { name: 'America/New_York', label: 'New York', time: '', day: '' },
  { name: 'Europe/London', label: 'London', time: '', day: '' },
  { name: 'Europe/Rome', label: 'Rome', time: '', day: '' },
  { name: 'Asia/Tokyo', label: 'Tokyo', time: '', day: '' },
  { name: 'Australia/Sydney', label: 'Sydney', time: '', day: '' },
]);

let intervalId;

const updateClocks = () => {
  const now = new Date();
  
  zones.value = zones.value.map(z => {
    // Format options for time
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: z.name,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    // Format options for day/date
    const dayFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: z.name,
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    return {
      ...z,
      time: timeFormatter.format(now),
      day: dayFormatter.format(now)
    };
  });
};

onMounted(() => {
  updateClocks();
  intervalId = setInterval(updateClocks, 1000);
});

onUnmounted(() => {
  clearInterval(intervalId);
});
</script>

<style scoped>
.island-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

h2 {
  font-size: 1.1rem;
  color: #c0c0c0;
  margin-top: 0;
  margin-bottom: 1rem;
}

.zones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.zone-item {
  background: rgba(0,0,0,0.2);
  padding: 0.8rem;
  border-radius: 8px;
  text-align: center;
}

.zone-name {
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 0.3rem;
}

.zone-time {
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
}

.zone-day {
  font-size: 0.75rem;
  color: #666;
}
</style>

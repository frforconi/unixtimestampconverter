<template>
  <div class="island-card">
    <h2>Date <-> Seconds</h2>
    
    <div class="input-group">
      <label>Date Selection</label>
      <input 
        type="datetime-local" 
        v-model="selectedDate" 
        @input="onDateChange"
        class="date-input"
      />
    </div>

    <div class="arrow">⇅</div>

    <div class="input-group">
      <label>Seconds</label>
      <input 
        type="number" 
        v-model="timestamp"
        @input="onTimestampChange"
        class="ms-input"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const selectedDate = ref('');
const timestamp = ref(0);

// Helper to format Date object to input type="datetime-local" value (YYYY-MM-DDTHH:mm)
// Note: datetime-local works in local time.
const toDatetimeLocal = (date) => {
  const d = new Date(date);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const onDateChange = () => {
  if (selectedDate.value) {
    timestamp.value = Math.floor(new Date(selectedDate.value).getTime() / 1000);
  } else {
    timestamp.value = 0;
  }
};

const onTimestampChange = () => {
  const ts = Number(timestamp.value);
  if (!isNaN(ts)) {
    selectedDate.value = toDatetimeLocal(new Date(ts * 1000));
  }
};

onMounted(() => {
  const now = new Date();
  timestamp.value = Math.floor(now.getTime() / 1000);
  selectedDate.value = toDatetimeLocal(now);
});
</script>

<style scoped>
.island-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

h2 {
  font-size: 1.1rem;
  color: #c0c0c0;
  margin: 0;
  text-align: center;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.8rem;
  color: #888;
  margin-left: 0.2rem;
}

.date-input,
.ms-input {
  width: 100%;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
  color: white;
  font-family: 'Courier New', Courier, monospace;
  font-size: 1rem;
  outline: none;
  box-sizing: border-box; /* Ensure padding doesn't overflow width */
}

.date-input:focus,
.ms-input:focus {
  border-color: #7c4dff;
}

.arrow {
  text-align: center;
  color: #666;
  font-size: 1.2rem;
  margin: -0.5rem 0;
}
</style>

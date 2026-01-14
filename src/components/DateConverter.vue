<template>
  <div class="island-card">
    <div class="header-row">
      <h2>DateConverter</h2>
      <!-- <p class="info-text">Date <-> Seconds</p> -->
      <div class="toggle-group">
        <button 
          :class="{ active: !isUtc }" 
          @click="setMode(false)"
          class="toggle-btn"
        >Local</button>
        <button 
          :class="{ active: isUtc }" 
          @click="setMode(true)"
          class="toggle-btn"
        >UTC</button>
      </div>
    </div>
    
    <div class="input-group">
      <label for="ts-input">Seconds</label>
      <input 
        type="number" 
        v-model="timestamp"
        @input="updateInputs"
        id="ts-input"
        class="ms-input"
      />
    </div>

    <div class="arrow">⇅</div>

    <div class="input-group">
      <label>Date Selection <span class="format-hint">YYYY-MM-DD HH:mm:ss</span></label>
      <div class="date-inputs">
        <input type="number" v-model="year" @input="updateTimestamp" placeholder="YYYY" class="date-part year" />
        <span class="sep">-</span>
        <input type="number" v-model="month" @input="updateTimestamp" placeholder="MM" class="date-part" min="1" max="12" />
        <span class="sep">-</span>
        <input type="number" v-model="day" @input="updateTimestamp" placeholder="DD" class="date-part" min="1" max="31" />
        <span class="sep spacer"></span>
        <input type="number" v-model="hour" @input="updateTimestamp" placeholder="HH" class="date-part" min="0" max="23" />
        <span class="sep">:</span>
        <input type="number" v-model="minute" @input="updateTimestamp" placeholder="mm" class="date-part" min="0" max="59" />
        <span class="sep">:</span>
        <input type="number" v-model="second" @input="updateTimestamp" placeholder="ss" class="date-part" min="0" max="59" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';

// -- State --
const isUtc = ref(false);
const selectedTimezone = ref('UTC');
const STORAGE_KEY_UTC = 'unix-converter:date-converter-utc';

const year = ref(1970);
const month = ref(1);
const day = ref(1);
const hour = ref(0);
const minute = ref(0);
const second = ref(0);

const timestamp = ref(0);
const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
  // Load saved mode
  const savedUtc = localStorage.getItem(STORAGE_KEY_UTC);
  if (savedUtc !== null) {
    isUtc.value = JSON.parse(savedUtc);
  }

  try {
    // Default to system timezone
    selectedTimezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    selectedTimezone.value = 'UTC';
  }

  const now = new Date();
  timestamp.value = Math.floor(now.getTime() / 1000);
  updateInputs();
  
  // Dispatch initial
  window.dispatchEvent(new CustomEvent('unix-converter:timestamp-update', { 
    detail: { timestamp: timestamp.value } 
  }));
});

const setMode = (utc) => {
  isUtc.value = utc;
  localStorage.setItem(STORAGE_KEY_UTC, JSON.stringify(utc));
  updateInputs(); 
};

// --- Conversion Helpers ---

// Get date parts from a timestamp in a specific timezone
const getPartsFromTimestampInZone = (ts, zone) => {
  const date = new Date(ts * 1000);
  
  // Use Intl to format to parts
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  });
  
  const parts = formatter.formatToParts(date);
  const partMap = {};
  parts.forEach(p => partMap[p.type] = p.value);
  
  return {
    year: parseInt(partMap.year),
    month: parseInt(partMap.month),
    day: parseInt(partMap.day),
    hour: parseInt(partMap.hour) % 24, // sometimes 24 is returned for midnight?
    minute: parseInt(partMap.minute),
    second: parseInt(partMap.second)
  };
};

// Get timestamp from parts in a specific timezone (Iterative approach)
const getTimestampFromPartsInZone = (y, m, d, h, min, s, zone) => {
  // 1. Initial guess: Treat as UTC to get a base timestamp
  let guessDate = new Date(Date.UTC(y, m - 1, d, h, min, s));
  let guessTs = guessDate.getTime();

  // 2. Iteratively refine
  // We want: Format(guessTs, zone) == TargetParts
  // We check the offset difference and adjust
  
  for (let i = 0; i < 3; i++) {
    const parts = getPartsFromTimestampInZone(guessTs / 1000, zone);
    
    // Construct a date object from the "Actual" parts interpreted as UTC
    // This allows us to compare apples to apples (time value wise) with the Target interpreted as UTC
    const actualAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    const targetAsUtc = Date.UTC(y, m - 1, d, h, min, s);
    
    const diff = targetAsUtc - actualAsUtc;
    
    if (Math.abs(diff) < 1000) {
      break; // Converged
    }
    
    guessTs += diff;
  }
  
  return guessTs;
};

const updateTimestamp = () => {
  let ts;
  if (isUtc.value) {
    const date = new Date(Date.UTC(
      year.value,
      month.value - 1,
      day.value,
      hour.value,
      minute.value,
      second.value
    ));
    ts = date.getTime();
  } else {
    // Custom timezone logic
    ts = getTimestampFromPartsInZone(
      year.value,
      month.value,
      day.value,
      hour.value,
      minute.value,
      second.value,
      selectedTimezone.value
    );
  }
  
  timestamp.value = Math.floor(ts / 1000);
  window.dispatchEvent(new CustomEvent('unix-converter:timestamp-update', { 
    detail: { timestamp: timestamp.value } 
  }));
};

const updateInputs = () => {
  const ts = Number(timestamp.value);
  if (!isNaN(ts)) {
    if (isUtc.value) {
      const date = new Date(ts * 1000);
      year.value = date.getUTCFullYear();
      month.value = date.getUTCMonth() + 1;
      day.value = date.getUTCDate();
      hour.value = date.getUTCHours();
      minute.value = date.getUTCMinutes();
      second.value = date.getUTCSeconds();
    } else {
      // Use helper for custom timezone
      const parts = getPartsFromTimestampInZone(ts, selectedTimezone.value);
      year.value = parts.year;
      month.value = parts.month;
      day.value = parts.day;
      hour.value = parts.hour;
      minute.value = parts.minute;
      second.value = parts.second;
    }

    // Also dispatch event when updated via inputs
    window.dispatchEvent(new CustomEvent('unix-converter:timestamp-update', { 
      detail: { timestamp: timestamp.value } 
    }));
  }
};
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

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h2 {
  font-size: 1.1rem;
  color: #c0c0c0;
  margin: 0;
}

.toggle-group {
  display: flex;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  padding: 2px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.toggle-btn {
  background: transparent;
  border: none;
  color: #888;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-weight: 500;
}

.toggle-btn:hover:not(.active) {
  color: #ccc;
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

.format-hint {
  font-size: 0.7em;
  opacity: 0.7;
  margin-left: 4px;
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.date-part {
  background: transparent;
  border: none;
  color: white;
  font-family: 'Courier New', Courier, monospace;
  font-size: 1rem;
  text-align: center;
  width: 2.5em; /* Fits 2 digits comfortably */
  padding: 0;
  outline: none;
  -moz-appearance: textfield;
  appearance: textfield;
}

.date-part::-webkit-outer-spin-button,
.date-part::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.date-part:focus {
  border-bottom: 2px solid #7c4dff;
}

.date-part.year {
  width: 3.5em; /* Fits 4 digits */
}

.sep {
  color: #888;
  font-weight: bold;
}

.sep.spacer {
  width: 10px;
}

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
  box-sizing: border-box;
}

.ms-input:focus {
  border-color: #7c4dff;
}

.arrow {
  text-align: center;
  color: #666;
  font-size: 1.2rem;
  margin: -0.5rem 0;
}

.info-text {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.75rem;
  color: #666;
  font-style: italic;
}
</style>

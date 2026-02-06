<template>
  <div class="island-card">
    <div class="header-row">
      <div class="title-with-badge">
        <h2>Date Converter</h2>
        <span class="timezone-badge">{{ isUtc ? 'UTC' : selectedTimezone }}</span>
      </div>
      <div class="toggle-group">
        <button 
          :class="{ active: !isUtc }" 
          @click="setMode(false)"
          class="toggle-btn"
          :disabled="disabled"
        >Local</button>
        <button 
          :class="{ active: isUtc }" 
          @click="setMode(true)"
          class="toggle-btn"
          :disabled="disabled"
        >UTC</button>
      </div>
    </div>
    
    <div class="input-section">
      <div class="input-group">
        <div class="label-row">
          <label for="ts-input">Unix Timestamp ({{ isMs ? 'Milliseconds' : 'Seconds' }})</label>
          <div class="action-buttons">
            <button @click="copyToClipboard(timestamp)" class="mini-copy-btn" :disabled="disabled">Copy</button>
            <button @click="shareLink" class="mini-copy-btn share-btn" :disabled="disabled">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              Share Link
            </button>
          </div>
        </div>
        <div class="input-wrapper">
          <input 
            type="number" 
            v-model="timestamp"
            @input="updateInputs"
            id="ts-input"
            class="main-input mono"
            :disabled="disabled"
          />
        </div>
      </div>

      <div class="arrow-divider">
        <div class="line"></div>
        <div class="icon">⇅</div>
        <div class="line"></div>
      </div>

      <div class="input-group">
        <div class="label-row">
          <label>Human Readable Date</label>
          <button @click="copyToClipboard(dateString)" class="mini-copy-btn" :disabled="disabled">Copy Date</button>
        </div>
        <div class="date-preview mono" v-if="isMounted">
          {{ dateString }} {{ isUtc ? 'UTC' : '' }}
        </div>
        <div class="date-inputs-container">
          <div class="date-row">
            <div class="date-field">
              <input type="number" v-model="year" @input="updateTimestamp" placeholder="YYYY" class="date-part year mono" :disabled="disabled" />
              <span class="field-label">Year</span>
            </div>
            <span class="sep">-</span>
            <div class="date-field">
              <input type="number" v-model="month" @input="updateTimestamp" placeholder="MM" class="date-part mono" min="1" max="12" :disabled="disabled" />
              <span class="field-label">Month</span>
            </div>
            <span class="sep">-</span>
            <div class="date-field">
              <input type="number" v-model="day" @input="updateTimestamp" placeholder="DD" class="date-part mono" min="1" max="31" :disabled="disabled" />
              <span class="field-label">Day</span>
            </div>
          </div>
          
          <div class="date-row time-row">
            <div class="date-field">
              <input type="number" v-model="hour" @input="updateTimestamp" placeholder="HH" class="date-part mono" min="0" max="23" :disabled="disabled" />
              <span class="field-label">Hour</span>
            </div>
            <span class="sep">:</span>
            <div class="date-field">
              <input type="number" v-model="minute" @input="updateTimestamp" placeholder="mm" class="date-part mono" min="0" max="59" :disabled="disabled" />
              <span class="field-label">Min</span>
            </div>
            <span class="sep">:</span>
            <div class="date-field">
              <input type="number" v-model="second" @input="updateTimestamp" placeholder="ss" class="date-part mono" min="0" max="59" :disabled="disabled" />
              <span class="field-label">Sec</span>
            </div>
            <span class="sep" v-if="isMs">.</span>
            <div class="date-field" v-if="isMs">
              <input type="number" v-model="millisecond" @input="updateTimestamp" placeholder="ms" class="date-part mono" min="0" max="999" :disabled="disabled" />
              <span class="field-label">MSec</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useStore } from '@nanostores/vue';
import { referenceTimestamp, referenceMs, isMs as isMsStore } from '../stores/timeStore';

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
});

// -- State --
const $referenceTimestamp = useStore(referenceTimestamp);
const isUtc = ref(false);
const selectedTimezone = ref('UTC');
const STORAGE_KEY_UTC = 'unix-converter:date-converter-utc';

const year = ref(1970);
const month = ref(1);
const day = ref(1);
const hour = ref(0);
const minute = ref(0);
const second = ref(0);
const millisecond = ref(0);

const timestamp = ref(0);
const timestampMs = ref(0); // Underlying high-precision value
const isMs = useStore(isMsStore);
const isMounted = ref(false);

const dateString = computed(() => {
  const pad = (n, l = 2) => n.toString().padStart(l, '0');
  const base = `${year.value}-${pad(month.value)}-${pad(day.value)} ${pad(hour.value)}:${pad(minute.value)}:${pad(second.value)}`;
  return isMs.value ? `${base}.${pad(millisecond.value, 3)}` : base;
});

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text.toString());
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
};

const shareLink = async () => {
  const url = new URL(window.location.href);
  url.searchParams.set('t', timestamp.value);
  try {
    await navigator.clipboard.writeText(url.toString());
    alert('Link with timestamp copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy link: ', err);
  }
};

onMounted(() => {
  isMounted.value = true;
  const savedUtc = localStorage.getItem(STORAGE_KEY_UTC);
  if (savedUtc !== null && !props.disabled) {
    isUtc.value = JSON.parse(savedUtc);
  }

  try {
    selectedTimezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    selectedTimezone.value = 'UTC';
  }

  // Check for 't' query parameter
  const params = new URLSearchParams(window.location.search);
  const tParam = params.get('t');
  
  if (tParam && !isNaN(Number(tParam))) {
    const rawVal = Number(tParam);
    if (rawVal > 100000000000) { // Likely milliseconds
      isMsStore.set(true);
      timestamp.value = rawVal;
      timestampMs.value = rawVal;
    } else {
      isMsStore.set(false);
      timestamp.value = rawVal;
      timestampMs.value = rawVal * 1000;
    }
  } else {
    const now = new Date();
    timestampMs.value = now.getTime();
    timestamp.value = isMs.value ? now.getTime() : Math.floor(now.getTime() / 1000);
  }
  
  updateInputs();
  referenceTimestamp.set(Math.floor(timestampMs.value / 1000));
  referenceMs.set(timestampMs.value);
});

// Watch for external store changes
watch(() => $referenceTimestamp.value, (newVal) => {
  const currentTsSecs = Math.floor(timestampMs.value / 1000);
  if (newVal !== currentTsSecs) {
    timestampMs.value = newVal * 1000;
    timestamp.value = isMs.value ? timestampMs.value : newVal;
    updateInputs();
  }
});

// Watch for milliseconds specifically if we need finer sync
const $referenceMs = useStore(referenceMs);
watch(() => $referenceMs.value, (newVal) => {
  if (newVal !== timestampMs.value) {
    timestampMs.value = newVal;
    timestamp.value = isMs.value ? timestampMs.value : Math.floor(newVal / 1000);
    updateInputs();
  }
});

// Watch for isMs changes to update the input field value
watch(() => isMs.value, (newVal) => {
  timestamp.value = newVal ? timestampMs.value : Math.floor(timestampMs.value / 1000);
});

const setMode = (utc) => {
  isUtc.value = utc;
  localStorage.setItem(STORAGE_KEY_UTC, JSON.stringify(utc));
  updateInputs(); 
};

const getPartsFromTimestampInZone = (ts, zone) => {
  const date = new Date(ts * 1000);
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
    hour: parseInt(partMap.hour) % 24,
    minute: parseInt(partMap.minute),
    second: parseInt(partMap.second)
  };
};

const getTimestampFromPartsInZone = (y, m, d, h, min, s, zone) => {
  let guessDate = new Date(Date.UTC(y, m - 1, d, h, min, s));
  let guessTs = guessDate.getTime();

  for (let i = 0; i < 3; i++) {
    const parts = getPartsFromTimestampInZone(guessTs / 1000, zone);
    const actualAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    const targetAsUtc = Date.UTC(y, m - 1, d, h, min, s);
    const diff = targetAsUtc - actualAsUtc;
    if (Math.abs(diff) < 1000) break;
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
      second.value,
      millisecond.value
    ));
    ts = date.getTime();
  } else {
    ts = getTimestampFromPartsInZone(
      year.value,
      month.value,
      day.value,
      hour.value,
      minute.value,
      second.value,
      selectedTimezone.value
    );
    ts += millisecond.value;
  }
  timestampMs.value = ts;
  timestamp.value = isMs.value ? ts : Math.floor(ts / 1000);
  referenceTimestamp.set(Math.floor(ts / 1000));
  referenceMs.set(ts);
};

const updateInputs = () => {
  // If update comes from timestamp input
  const rawTs = Number(timestamp.value);
  if (!isNaN(rawTs)) {
    if (isMs.value) {
      timestampMs.value = rawTs;
    } else {
      timestampMs.value = rawTs * 1000;
    }
    
    const ts = Math.floor(timestampMs.value / 1000);
    const date = new Date(timestampMs.value);
    
    if (isUtc.value) {
      year.value = date.getUTCFullYear();
      month.value = date.getUTCMonth() + 1;
      day.value = date.getUTCDate();
      hour.value = date.getUTCHours();
      minute.value = date.getUTCMinutes();
      second.value = date.getUTCSeconds();
      millisecond.value = date.getUTCMilliseconds();
    } else {
      const parts = getPartsFromTimestampInZone(ts, selectedTimezone.value);
      year.value = parts.year;
      month.value = parts.month;
      day.value = parts.day;
      hour.value = parts.hour;
      minute.value = parts.minute;
      second.value = parts.second;
      millisecond.value = date.getMilliseconds();
    }
    referenceTimestamp.set(ts);
    referenceMs.set(timestampMs.value);
  }
};
</script>

<style scoped>
.island-card {
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid var(--card-border);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.title-with-badge {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

h2 {
  font-size: 1.1rem;
  color: #fff;
  margin: 0;
  font-weight: 600;
}

.timezone-badge {
  font-size: 0.7rem;
  color: #8b949e;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
  width: fit-content;
}

.toggle-group {
  display: flex;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 3px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.toggle-btn {
  background: transparent;
  border: none;
  color: #8b949e;
  padding: 6px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: rgba(var(--accent), 0.2);
  color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label-row label {
  font-size: 0.85rem;
  color: #8b949e;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.mini-copy-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #8b949e;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.mini-copy-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.2);
}

.share-btn {
  color: rgb(var(--accent-light));
  border-color: rgba(var(--accent), 0.3);
}

.share-btn:hover {
  background: rgba(var(--accent), 0.1);
  border-color: rgba(var(--accent), 0.5);
}

.main-input {
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  color: white;
  font-size: 1.25rem;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.main-input:focus {
  border-color: rgba(var(--accent), 0.5);
}

.date-preview {
  background: rgba(var(--accent), 0.05);
  border: 1px solid rgba(var(--accent), 0.1);
  border-radius: 8px;
  padding: 0.75rem;
  color: rgb(var(--accent-light));
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  text-align: center;
}

.arrow-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #444;
}

.arrow-divider .line {
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
}

.arrow-divider .icon {
  font-size: 1.2rem;
}

.date-inputs-container {
  background: rgba(0, 0, 0, 0.2);
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.date-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.date-field {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.date-part {
  background: transparent;
  border: none;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1.1rem;
  text-align: center;
  width: 100%;
  padding: 4px 0;
  outline: none;
}

.date-part:focus {
  border-bottom-color: rgba(var(--accent), 0.5);
}

.field-label {
  font-size: 0.65rem;
  color: #555;
  text-transform: uppercase;
}

.sep {
  color: #444;
  margin-bottom: 1.2rem;
}

.mono {
  font-family: 'JetBrains Mono', monospace;
}
</style>
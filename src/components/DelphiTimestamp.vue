<template>
  <div class="island-card">
    <div class="header-row">
      <div class="title-with-badge">
        <h2>Delphi TDateTime</h2>
        <span class="timezone-badge">Borland / Delphi / C++ Builder</span>
      </div>
      <div class="action-buttons">
        <button @click="copyToClipboard(inputValue)" class="mini-copy-btn" :disabled="disabled">Copy</button>
      </div>
    </div>
    
    <div class="display-section">
      <div class="value-wrapper">
        <input 
          v-model="inputValue" 
          @input="handleInput"
          class="main-value mono input-field"
          type="number"
          step="0.0000000001"
          :disabled="disabled"
        />
        <div class="label">Days since {{ baseDate.replace('T', ' ') }}</div>
      </div>
    </div>

    <div class="config-section">
      <div class="label-row">
        <label>Base Date (Epoch UTC)</label>
      </div>
      <div class="base-date-wrapper">
        <input 
          v-model="baseDate" 
          @change="handleBaseDateChange"
          type="datetime-local"
          step="1"
          class="base-date-input mono"
          :disabled="disabled"
        />
      </div>
    </div>
    
    <div class="info-footer">
      <p>In Delphi, <code>TDateTime</code> is a <code>Double</code>. The integral part is the number of days since the base date. The fractional part is the time of day.</p>
      <br>
      <p>Default Delphi TDateTime is 1899-12-30T12:00:00.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useStore } from '@nanostores/vue';
import { referenceTimestamp } from '../stores/timeStore';

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
});

const $referenceTimestamp = useStore(referenceTimestamp);
const inputValue = ref(0);
const baseDate = ref("1899-12-30T12:00:00");
const STORAGE_KEY = 'delphi_base_date';

const baseDateOffset = computed(() => {
  // Days between Unix Epoch (1970-01-01) and Selected Base Date
  const unixEpoch = new Date(Date.UTC(1970, 0, 1));
  // Append Z to treat the input as UTC, consistent with previous logic
  const selectedBase = new Date(baseDate.value + "Z");
  if (isNaN(selectedBase.getTime())) return 25569.0;
  
  const diffMs = unixEpoch.getTime() - selectedBase.getTime();
  return diffMs / (1000 * 60 * 60 * 24);
});

const updateFromStore = (unixTs) => {
  const daysSinceEpoch = unixTs / 86400.0;
  const delphiDate = daysSinceEpoch + baseDateOffset.value;
  inputValue.value = parseFloat(delphiDate.toFixed(10));
};

onMounted(() => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && !props.disabled) {
    baseDate.value = stored;
  }
  updateFromStore($referenceTimestamp.value);
});

watch(() => $referenceTimestamp.value, (newVal) => {
  const currentInputUnix = Math.round((inputValue.value - baseDateOffset.value) * 86400.0);
  if (newVal !== currentInputUnix) {
    updateFromStore(newVal);
  }
});

const handleInput = () => {
  const delphiDate = parseFloat(inputValue.value);
  if (!isNaN(delphiDate)) {
    const unixTs = Math.round((delphiDate - baseDateOffset.value) * 86400.0);
    referenceTimestamp.set(unixTs);
  }
};

const handleBaseDateChange = () => {
  localStorage.setItem(STORAGE_KEY, baseDate.value);
  updateFromStore($referenceTimestamp.value);
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text.toString());
  } catch (err) {
    console.error('Failed to copy: ', err);
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
  gap: 1.25rem;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.config-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.label-row label {
  font-size: 0.75rem;
  color: #8b949e;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.base-date-wrapper {
  width: 100%;
}

.base-date-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  padding: 0.5rem;
  outline: none;
  font-size: 0.9rem;
  color-scheme: dark;
}

.base-date-input:focus {
  border-color: rgba(var(--accent), 0.5);
}

.display-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.value-wrapper {
  background: rgba(0, 0, 0, 0.2);
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.main-value {
  color: #fff;
  font-size: 1.5rem;
  font-weight: 600;
  word-break: break-all;
  text-align: center;
  width: 100%;
}

.input-field {
  background: transparent;
  border: none;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  outline: none;
  transition: border-bottom-color 0.2s;
}

.input-field:focus {
  border-bottom-color: rgba(var(--accent), 0.5);
}

/* Hide spin buttons */
.input-field::-webkit-outer-spin-button,
.input-field::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-field[type=number] {
  -moz-appearance: textfield;
}

.label {
  font-size: 0.75rem;
  color: #555;
  text-transform: uppercase;
}

.info-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 1rem;
}

.info-footer p {
  font-size: 0.8rem;
  color: #8b949e;
  margin: 0;
  line-height: 1.4;
}

code {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 4px;
  border-radius: 4px;
  color: rgb(var(--accent-light));
}

.mono {
  font-family: 'JetBrains Mono', monospace;
}
</style>

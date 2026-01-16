<template>
  <div class="island-card">
    <div class="header-row">
      <div class="title-group">
        <h2>World Clock <span v-if="editing" class="edit-badge">EDITING</span></h2>
        <!-- <span v-if="!isRealtime" class="info-text-inline">Fixed to DateConverter</span> -->
      </div>
      <div class="controls-group">
        <div class="toggle-group">
          <button 
            :class="{ active: isRealtime }" 
            @click="setMode(true)"
            class="toggle-btn"
          >Realtime</button>
          <button 
            :class="{ active: !isRealtime }" 
            @click="setMode(false)"
            class="toggle-btn"
          >Date Converter</button>
        </div>
        <button 
          class="icon-btn" 
          :class="{ 'done-btn': editing }"
          @click="toggleEdit" 
          title="Edit Zones"
        >
          {{ editing ? 'Done' : '⚙️' }}
        </button>
      </div>
    </div>
    
    <div class="zones-grid">
      <template v-if="isMounted">
        <!-- Pinned Local Zone -->
        <div class="zone-item local-zone">
          <div class="zone-header">
              <div class="zone-name">{{ localZone.label }} (Local)</div>
          </div>
          <div class="zone-time">{{ localZone.time }}</div>
          <div class="zone-day">{{ localZone.day }}</div>
        </div>

        <!-- Configurable Zones -->
        <div v-for="(zone, index) in displayZonesComputed" :key="zone.id" class="zone-item" :class="{ 'editing': editing }">
          <div class="zone-header">
              <div class="zone-name">{{ zone.label }}</div>
              <div v-if="editing" class="zone-actions">
                  <button @click="moveZone(index, -1)" :disabled="index === 0">←</button>
                  <button @click="removeZone(index)" class="delete-btn">×</button>
                  <button @click="moveZone(index, 1)" :disabled="index === displayZones.length - 1">→</button>
              </div>
          </div>
          <div class="zone-time">{{ zone.time }}</div>
          <div class="zone-day">{{ zone.day }}</div>
        </div>
        
        <!-- Add Zone Card (only in edit mode) -->
        <div v-if="editing" class="zone-item add-zone">
          <select v-model="newZoneName" class="zone-select">
              <option value="" disabled selected>Select Timezone</option>
              <option v-for="tz in availableTimezones" :key="tz" :value="tz">{{ tz }}</option>
          </select>
          <button @click="addZone" :disabled="!newZoneName" class="add-btn">Add Clock</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

// -- State --
const isRealtime = ref(true);
const referenceTimestamp = ref(0);
const editing = ref(false);
const newZoneName = ref('');
const rawZones = ref([]); // Stores { id, name, label }
const isMounted = ref(false);

// -- Constants --
const STORAGE_KEY = 'unix-converter:world-clock-zones';
const MODE_STORAGE_KEY = 'unix-converter:world-clock-realtime';

// -- Helpers --
const getLocalTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    return 'UTC';
  }
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const availableTimezones = ref([]);

// -- Formatting Helper --
const formatZone = (zoneName, now) => {
    const formatterOpts = {
        timeZone: zoneName,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
  
    const dayOpts = {
        timeZone: zoneName,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short'
    };

    try {
        const timeFormatter = new Intl.DateTimeFormat('en-US', formatterOpts);
        const dayFormatter = new Intl.DateTimeFormat('en-US', dayOpts);
        return {
            time: timeFormatter.format(now),
            day: dayFormatter.format(now)
        };
    } catch (e) {
        return { time: 'Invalid', day: 'Timezone' };
    }
};

// -- Local Zone Logic --
const localZone = computed(() => {
    // depend on trigger
    const _ = trigger.value;
    const now = isRealtime.value 
        ? new Date() 
        : new Date(referenceTimestamp.value * 1000);
    
    const zoneName = getLocalTimezone();
    const label = zoneName.includes('/') ? zoneName.split('/')[1].replace(/_/g, ' ') : zoneName;
    const formatted = formatZone(zoneName, now);
    
    return {
        name: zoneName,
        label: label,
        ...formatted
    };
});


// -- Core Logic --
const displayZones = () => rawZones.value.map(z => {
  const now = isRealtime.value 
    ? new Date() 
    : new Date(referenceTimestamp.value * 1000);

  const formatted = formatZone(z.name, now);
  return {
    ...z,
    ...formatted
  };
});

// -- Actions --
const setMode = (realtime) => {
  isRealtime.value = realtime;
  localStorage.setItem(MODE_STORAGE_KEY, JSON.stringify(realtime));
};

const toggleEdit = () => {
    editing.value = !editing.value;
};

const addZone = () => {
    if (!newZoneName.value) return;
    const parts = newZoneName.value.split('/');
    const label = parts[parts.length - 1].replace(/_/g, ' ');
    
    rawZones.value.push({
        id: generateId(),
        name: newZoneName.value,
        label: label
    });
    newZoneName.value = '';
    saveZones();
};

const removeZone = (index) => {
    rawZones.value.splice(index, 1);
    saveZones();
};

const moveZone = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < rawZones.value.length) {
        const item = rawZones.value.splice(index, 1)[0];
        rawZones.value.splice(newIndex, 0, item);
        saveZones();
    }
};

const saveZones = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rawZones.value));
};

const loadZones = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const localTz = getLocalTimezone();
    
    if (stored) {
        try {
            let parsed = JSON.parse(stored);
            // Cleanup: remove any legacy "Local" entries to avoid duplication with the new pinned card
            // We identify legacy local entries by their name matching the local timezone OR explicitly labeled "Local"
            // Actually, best to just filter out if ID matches or label matches what we generated before. 
            // Simple heuristic: If it has "Local" in the label, filter it out for this migration
            rawZones.value = parsed.filter(z => !z.label.includes('Local'));
        } catch (e) {
            console.error('Failed to parse stored zones', e);
        }
    } else {
        // Defaults - No Local here, as it's pinned now
        rawZones.value = [
            { id: 'default-utc', name: 'UTC', label: 'UTC' },
            { id: 'default-ny', name: 'America/New_York', label: 'New York' },
            { id: 'default-tokyo', name: 'Asia/Tokyo', label: 'Tokyo' },
        ];
    }
};

// -- Lifecycles --
let intervalId;

// Optimized update using raf or interval
const tick = () => {
    if (isRealtime.value) {
        trigger.value++;
    }
};
const trigger = ref(0); // Tick signal

// Override displayZones to depend on trigger
const displayZonesComputed = computed(() => {
    // depend on trigger
    const _ = trigger.value; 
    return displayZones();
});

const onTimestampUpdate = (event) => {
  referenceTimestamp.value = event.detail.timestamp;
  if (!isRealtime.value) {
    trigger.value++;
  }
};

onMounted(() => {
    isMounted.value = true;
    
    // Load saved mode
    const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
    if (savedMode !== null) {
        isRealtime.value = JSON.parse(savedMode);
    }

    // Load Timezones list
    if (Intl && Intl.supportedValuesOf) {
        availableTimezones.value = Intl.supportedValuesOf('timeZone');
    } else {
        availableTimezones.value = ['UTC', 'Europe/London', 'Europe/Paris', 'America/New_York', 'Asia/Tokyo', 'Australia/Sydney'];
    }

    loadZones();
    
    // Sync reference
    referenceTimestamp.value = Math.floor(Date.now() / 1000);
    
    // Start Loop
    intervalId = setInterval(tick, 1000);
    
    window.addEventListener('unix-converter:timestamp-update', onTimestampUpdate);
});

onUnmounted(() => {
    clearInterval(intervalId);
    window.removeEventListener('unix-converter:timestamp-update', onTimestampUpdate);
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

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.title-group {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    min-width: 0;
}

.info-text-inline {
    font-size: 0.7rem;
    color: #7c4dff;
    background: rgba(124, 77, 255, 0.1);
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid rgba(124, 77, 255, 0.2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.controls-group {
    display: flex;
    gap: 1rem;
    align-items: center;
}

h2 {
  font-size: 1.1rem;
  color: #c0c0c0;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-badge {
    background: #FF9800;
    color: black;
    font-size: 0.6rem;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: bold;
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
  font-size: 0.75rem;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-weight: 500;
}

.icon-btn {
    background: transparent;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;
}
.icon-btn:hover {
    opacity: 1;
}

.done-btn {
    background: #3d7d1f !important;
    color: #000 !important;
    font-size: 0.8rem !important;
    font-weight: bold;
    padding: 4px 12px !important;
    border-radius: 6px !important;
    opacity: 1 !important;
    border: 1px solid rgba(0,0,0,0.2) !important;
    text-transform: uppercase;
    transition: all 0.2s ease;
}

.done-btn:hover {
    background: #61c930 !important;
    transform: scale(1.05);
}

.zones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
}

.zone-item {
  background: rgba(0,0,0,0.2);
  padding: 0.8rem;
  border-radius: 8px;
  text-align: center;
  position: relative;
  border: 1px solid transparent;
}

.zone-item.local-zone {
  background: rgba(124, 77, 255, 0.15); /* Slightly highlighted */
  border: 1px solid rgba(124, 77, 255, 0.3);
}

.zone-item.editing {
    border-color: rgba(255, 152, 0, 0.5);
    background: rgba(0,0,0,0.4);
}

.zone-header {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin-bottom: 0.3rem;
}

.zone-actions {
    display: flex;
    gap: 4px;
    margin-top: 4px;
}

.zone-actions button {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #ccc;
    cursor: pointer;
    border-radius: 4px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
}

.zone-actions button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
}

.delete-btn {
    color: #ff6b6b !important;
}

.zone-name {
  font-size: 0.85rem;
  color: #888;
}

.local-zone .zone-name {
  color: #ccc;
  font-weight: 500;
}

.zone-time {
  font-size: 1.1rem;
  font-weight: bold;
  color: #fff;
  margin: 0.2rem 0;
}

.zone-day {
  font-size: 0.75rem;
  color: #aaa;
}

.add-zone {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
}

.zone-select {
    width: 100%;
    background: #222;
    color: #fff;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 4px;
}

.add-btn {
    background: #4caf50;
    color: white;
    border: none;
    padding: 6px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
}

.add-btn:disabled {
    background: #333;
    color: #666;
    cursor: not-allowed;
}
</style>

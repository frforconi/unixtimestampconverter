<template>
  <div class="island-card" :class="{ 'editing-mode': editing }">
    <div class="header-row">
      <div class="title-with-badge">
        <h2>World Clock</h2>
        <span v-if="isRealtime" class="mode-badge">Live</span>
        <span v-if="!isRealtime" class="mode-badge">
          <!-- <span>{{ `Ref: ${referenceStore}.`}}</span><br> -->
          <span>{{ `To change edit World Clock Section` }}</span>
        </span>
      </div>
      <div class="controls-group">
        <div class="toggle-group">
          <button 
            :class="{ active: isRealtime }" 
            @click="setMode(true)"
            class="toggle-btn"
            :disabled="disabled"
          >Live</button>
          <button 
            :class="{ active: !isRealtime }" 
            @click="setMode(false)"
            class="toggle-btn"
            :disabled="disabled"
          >Static</button>
        </div>
        <button 
          class="icon-btn edit-toggle" 
          @click="toggleEdit" 
          :class="{ active: editing }"
          :title="editing ? 'Save Changes' : 'Edit Clocks'"
          :disabled="disabled"
        >
          <svg v-if="!editing" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
        </button>
      </div>
    </div>
    
    <div class="zones-grid">
      <template v-if="isMounted">
        <!-- Pinned Local Zone -->
        <div class="zone-card local">
          <div class="zone-label">
            <span class="city">{{ localZone.label }}</span>
            <span class="tag">Local</span>
          </div>
          <div class="zone-time mono">{{ localZone.time }}</div>
          <div class="zone-date">{{ localZone.day }}</div>
        </div>

        <!-- Configurable Zones -->
        <div v-for="(zone, index) in displayZonesComputed" :key="zone.id" class="zone-card" :class="{ 'editing': editing }">
          <div class="zone-label">
            <span class="city">{{ zone.label }}</span>
            <div v-if="editing" class="zone-actions">
              <button @click="moveZone(index, -1)" :disabled="index === 0 || disabled" class="action-btn" title="Move Up">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button @click="removeZone(index)" class="action-btn delete" title="Remove Clock" :disabled="disabled">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              <button @click="moveZone(index, 1)" :disabled="index === rawZones.length - 1 || disabled" class="action-btn" title="Move Down">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>
          <div class="zone-time mono">{{ zone.time }}</div>
          <div class="zone-date">{{ zone.day }}</div>
        </div>
        
        <!-- Add Zone Card -->
        <div v-if="editing" class="zone-card add-new">
          <div class="add-form">
            <select v-model="newZoneName" class="zone-select mono" :disabled="disabled">
              <option value="" disabled selected>Add Timezone...</option>
              <option v-for="tz in availableTimezones" :key="tz" :value="tz">{{ tz }}</option>
            </select>
            <button @click="addZone" :disabled="!newZoneName || disabled" class="add-btn">
              Add
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useStore } from '@nanostores/vue';
import { realtimeTimestamp, referenceTimestamp } from '../stores/timeStore';

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
});

// -- State --
const isRealtime = ref(false);
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
    const now = isRealtime.value 
        ? new Date(realtimeStore.value * 1000) 
        : new Date(referenceStore.value * 1000);
    
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
const getDisplayZones = () => rawZones.value.map(z => {
  const now = isRealtime.value 
    ? new Date(realtimeStore.value * 1000) 
    : new Date(referenceStore.value * 1000);

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
    if (stored && !props.disabled) {
        try {
            let parsed = JSON.parse(stored);
            rawZones.value = parsed.filter(z => !z.label.includes('Local'));
        } catch (e) {
            console.error('Failed to parse stored zones', e);
        }
    } else {
        rawZones.value = [
            { id: 'default-utc', name: 'UTC', label: 'UTC' },
            { id: 'default-ny', name: 'America/New_York', label: 'New York' },
            { id: 'default-tokyo', name: 'Asia/Tokyo', label: 'Tokyo' },
        ];
    }
};

// -- Lifecycles --
const realtimeStore = useStore(realtimeTimestamp);
const referenceStore = useStore(referenceTimestamp);

const displayZonesComputed = computed(() => {
    // Reactive dependencies
    const _rt = realtimeStore.value;
    const _ref = referenceStore.value;
    const _mode = isRealtime.value;
    
    return getDisplayZones();
});

onMounted(() => {
    isMounted.value = true;
    
    const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
    if (savedMode !== null && !props.disabled) {
        isRealtime.value = JSON.parse(savedMode);
    }

    if (Intl && Intl.supportedValuesOf) {
        availableTimezones.value = Intl.supportedValuesOf('timeZone');
    } else {
        availableTimezones.value = ['UTC', 'Europe/London', 'Europe/Paris', 'America/New_York', 'Asia/Tokyo', 'Australia/Sydney'];
    }

    loadZones();
});
</script>

<style scoped>
.island-card {
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid var(--card-border);
  transition: all 0.3s ease;
}

.island-card.editing-mode {
  border-color: rgba(var(--accent), 0.3);
  box-shadow: 0 0 20px rgba(var(--accent), 0.1);
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
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

.mode-badge {
  font-size: 0.7rem;
  color: #8b949e;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
  width: fit-content;
}

.controls-group {
    display: flex;
    gap: 0.75rem;
    align-items: center;
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
  padding: 4px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.icon-btn {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #8b949e;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
}

.icon-btn:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
}

.icon-btn.active {
    background: rgba(var(--accent), 0.2);
    border-color: rgba(var(--accent), 0.5);
    color: #fff;
}

.zones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.zone-card {
  background: rgba(0,0,0,0.2);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s;
}

.zone-card.local {
  background: rgba(var(--accent), 0.05);
  border-color: rgba(var(--accent), 0.2);
}

.zone-card.editing {
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(0,0,0,0.4);
}

.zone-label {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
}

.city {
    font-size: 0.8rem;
    color: #8b949e;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.tag {
    font-size: 0.6rem;
    background: rgba(var(--accent), 0.2);
    color: rgb(var(--accent-light));
    padding: 1px 4px;
    border-radius: 3px;
    text-transform: uppercase;
}

.zone-time {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  margin: 0.25rem 0;
}

.zone-date {
  font-size: 0.7rem;
  color: #555;
}

.zone-actions {
    display: flex;
    gap: 2px;
}

.action-btn {
    background: rgba(255, 255, 255, 0.05);
    border: none;
    color: #555;
    cursor: pointer;
    border-radius: 4px;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
}

.action-btn.delete:hover {
    color: #ff6b6b;
}

.add-new {
    border: 1px dashed rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
}

.add-form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
}

.zone-select {
    width: 100%;
    background: rgba(0, 0, 0, 0.3);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 4px;
    font-size: 0.75rem;
    outline: none;
}

.add-btn {
    background: rgba(var(--accent), 0.5);
    color: white;
    border: none;
    padding: 4px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.75rem;
}

.add-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.mono {
  font-family: 'JetBrains Mono', monospace;
}
</style>

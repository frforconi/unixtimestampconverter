<template>
  <div class="island-card hero-card">
    <div class="card-header">
      <div class="title-with-toggle">
        <h2>Current Unix Timestamp</h2>
        <div class="format-toggle">
          <button @click="toggleMs(false)" :class="{ active: !isMs }">s</button>
          <button @click="toggleMs(true)" :class="{ active: isMs }">ms</button>
        </div>
      </div>
      <button @click="copyTimestamp" class="copy-btn" :class="{ copied }">
        <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>
    <div class="time-display mono">{{ isMounted ? (isMs ? ms : seconds) : '----------' }}</div>
    <div v-if="isMounted" class="readable-date mono">
      {{ formattedDate }}
    </div>
    <div class="footer-info">
      <span class="pulse-icon"></span>
      <span class="label">{{ isMs ? 'Milliseconds' : 'Seconds' }} since Jan 1, 1970 (UTC)</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useStore } from '@nanostores/vue';
import { realtimeTimestamp, realtimeMs, isMs as isMsStore } from '../stores/timeStore';

const seconds = ref(0);
const ms = ref(0);
const isMs = useStore(isMsStore);
const isMounted = ref(false);
const copied = ref(false);
const STORAGE_KEY_MS = 'unix-converter:is-ms';
let intervalId;
let timeoutId;

const toggleMs = (val) => {
  isMsStore.set(val);
  localStorage.setItem(STORAGE_KEY_MS, JSON.stringify(val));
};

const updateTime = () => {
  const now = Date.now();
  ms.value = now;
  seconds.value = Math.floor(now / 1000);
  realtimeTimestamp.set(seconds.value);
  realtimeMs.set(ms.value);
};

const formattedDate = computed(() => {
  const d = new Date(ms.value);
  const pad = (n, l = 2) => n.toString().padStart(l, '0');
  
  const y = d.getUTCFullYear();
  const m = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const h = pad(d.getUTCHours());
  const min = pad(d.getUTCMinutes());
  const s = pad(d.getUTCSeconds());
  const msec = pad(d.getUTCMilliseconds(), 3);

  let base = `${y}-${m}-${day} ${h}:${min}:${s}`;
  return isMs.value ? `${base}.${msec} UTC` : `${base} UTC`;
});

const copyTimestamp = async () => {
  try {
    const val = isMs.value ? ms.value : seconds.value;
    await navigator.clipboard.writeText(val.toString());
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
};

onMounted(() => {
  isMounted.value = true;
  const savedMs = localStorage.getItem(STORAGE_KEY_MS);
  if (savedMs !== null) {
    isMsStore.set(JSON.parse(savedMs));
  }
  updateTime();
  intervalId = setInterval(updateTime, 50); // Faster update for milliseconds
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
  if (timeoutId) clearTimeout(timeoutId);
});
</script>

<style scoped>
.hero-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2.5rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.hero-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(var(--accent), 0.5), transparent);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.title-with-toggle {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.format-toggle {
  display: flex;
  background: rgba(0, 0, 0, 0.2);
  padding: 2px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.format-toggle button {
  background: transparent;
  border: none;
  color: #8b949e;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
}

.format-toggle button.active {
  background: rgba(var(--accent), 0.3);
  color: #fff;
}

h2 {
  font-size: 0.9rem;
  color: #8b949e;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.1rem;
  font-weight: 600;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(var(--accent), 0.5);
}

.copy-btn.copied {
  background: rgba(76, 175, 80, 0.15);
  border-color: #4caf50;
  color: #4caf50;
}

.time-display {
  font-size: clamp(3rem, 10vw, 5rem);
  font-weight: 700;
  color: #fff;
  margin: 1.5rem 0;
  letter-spacing: -0.1rem;
  background: linear-gradient(to bottom, #fff, #a0a0a0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.readable-date {
  font-size: 1.1rem;
  color: #8b949e;
  margin-bottom: 2rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  display: inline-block;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1rem;
}

.pulse-icon {
  width: 8px;
  height: 8px;
  background-color: #4caf50;
  border-radius: 50%;
  box-shadow: 0 0 0 rgba(76, 175, 80, 0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

.label {
  font-size: 0.9rem;
  color: #8b949e;
}

.mono {
  font-family: 'JetBrains Mono', monospace;
}
</style>

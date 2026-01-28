<template>
  <div class="island-card hero-card">
    <div class="card-header">
      <h2>Current Unix Timestamp</h2>
      <button @click="copyTimestamp" class="copy-btn" :class="{ copied }">
        <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>
    <div class="time-display mono">{{ isMounted ? seconds : '----------' }}</div>
    <div class="footer-info">
      <span class="pulse-icon"></span>
      <span class="label">Seconds since Jan 1, 1970 (UTC)</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { realtimeTimestamp } from '../stores/timeStore';

const seconds = ref(0);
const isMounted = ref(false);
const copied = ref(false);
let intervalId;
let timeoutId;

const updateTime = () => {
  const now = Math.floor(Date.now() / 1000);
  seconds.value = now;
  realtimeTimestamp.set(now);
};

const copyTimestamp = async () => {
  try {
    await navigator.clipboard.writeText(seconds.value.toString());
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
  updateTime();
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
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 1rem;
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

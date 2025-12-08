/**
 * useCountdown Hook
 * Real-time countdown timer for task deadlines
 * Uses useSyncExternalStore pattern for proper React 18+ compatibility
 */
import { useSyncExternalStore, useCallback, useMemo } from 'react';

// Create a timer store for countdown updates
const createTimerStore = () => {
  let listeners = [];
  
  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  };
  
  const notify = () => {
    listeners.forEach(listener => listener());
  };
  
  return { subscribe, notify };
};

const timerStore = createTimerStore();

// Start a global timer that notifies every second
let globalTimerStarted = false;
const startGlobalTimer = () => {
  if (globalTimerStarted) return;
  globalTimerStarted = true;
  
  setInterval(() => {
    timerStore.notify();
  }, 1000);
};

const useCountdown = (deadline) => {
  // Ensure global timer is running
  useMemo(() => {
    startGlobalTimer();
  }, []);

  const getSnapshot = useCallback(() => {
    if (!deadline) {
      return JSON.stringify({
        timeRemaining: null,
        isOverdue: false,
        urgencyLevel: 'normal'
      });
    }

    const now = Date.now();
    const deadlineTime = new Date(deadline).getTime();
    const diff = deadlineTime - now;

    if (diff <= 0) {
      const overdueDiff = Math.abs(diff);
      const days = Math.floor(overdueDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((overdueDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      const text = days > 0 
        ? `Просрочено на ${days}д ${hours}ч`
        : `Просрочено на ${hours}ч`;
      
      return JSON.stringify({
        timeRemaining: { text, isOverdue: true, isUrgent: false },
        isOverdue: true,
        urgencyLevel: 'overdue'
      });
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let urgencyLevel = 'normal';
    if (days === 0 && hours < 1) {
      urgencyLevel = 'critical';
    } else if (days === 0 && hours < 6) {
      urgencyLevel = 'warning';
    } else if (days < 1) {
      urgencyLevel = 'soon';
    }

    let text;
    let isUrgent = false;
    
    if (days > 7) {
      const weeks = Math.floor(days / 7);
      text = `${weeks}нед ${days % 7}д`;
    } else if (days > 0) {
      text = `${days}д ${hours}ч`;
    } else if (hours > 0) {
      text = `${hours}ч ${minutes}мин`;
    } else if (minutes > 0) {
      text = `${minutes}мин ${seconds}сек`;
      isUrgent = true;
    } else {
      text = `${seconds}сек`;
      isUrgent = true;
    }

    return JSON.stringify({
      timeRemaining: { text, isOverdue: false, isUrgent },
      isOverdue: false,
      urgencyLevel
    });
  }, [deadline]);

  const snapshot = useSyncExternalStore(
    timerStore.subscribe,
    getSnapshot,
    getSnapshot
  );

  return useMemo(() => JSON.parse(snapshot), [snapshot]);
};

export default useCountdown;

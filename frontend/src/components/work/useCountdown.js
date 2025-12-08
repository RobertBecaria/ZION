/**
 * useCountdown Hook
 * Real-time countdown timer for task deadlines
 */
import { useState, useEffect, useRef, useCallback } from 'react';

const useCountdown = (deadline) => {
  const [, forceUpdate] = useState(0);
  const stateRef = useRef({
    timeRemaining: null,
    isOverdue: false,
    urgencyLevel: 'normal'
  });

  const calculateTimeRemaining = useCallback(() => {
    if (!deadline) {
      return {
        timeRemaining: null,
        isOverdue: false,
        urgencyLevel: 'normal'
      };
    }

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;

    if (diff <= 0) {
      // Calculate how long overdue
      const overdueDiff = Math.abs(diff);
      const days = Math.floor(overdueDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((overdueDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      const text = days > 0 
        ? `Просрочено на ${days}д ${hours}ч`
        : `Просрочено на ${hours}ч`;
      
      return {
        timeRemaining: { text, isOverdue: true, isUrgent: false },
        isOverdue: true,
        urgencyLevel: 'overdue'
      };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // Determine urgency level
    let urgencyLevel = 'normal';
    if (days === 0 && hours < 1) {
      urgencyLevel = 'critical';
    } else if (days === 0 && hours < 6) {
      urgencyLevel = 'warning';
    } else if (days < 1) {
      urgencyLevel = 'soon';
    }

    // Format output
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

    return {
      timeRemaining: { text, isOverdue: false, isUrgent },
      isOverdue: false,
      urgencyLevel
    };
  }, [deadline]);

  useEffect(() => {
    // Update ref immediately
    stateRef.current = calculateTimeRemaining();

    if (!deadline) return;

    // Determine update interval based on urgency
    const interval = stateRef.current.timeRemaining?.isUrgent ? 1000 : 60000;

    const timer = setInterval(() => {
      stateRef.current = calculateTimeRemaining();
      forceUpdate(n => n + 1);
    }, interval);

    return () => clearInterval(timer);
  }, [deadline, calculateTimeRemaining]);

  // Return computed values from ref
  return stateRef.current;
};

export default useCountdown;

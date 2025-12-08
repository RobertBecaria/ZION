/**
 * useCountdown Hook
 * Real-time countdown timer for task deadlines
 */
import { useState, useEffect, useCallback } from 'react';

const useCountdown = (deadline) => {
  const [countdownState, setCountdownState] = useState({
    timeRemaining: null,
    isOverdue: false,
    urgencyLevel: 'normal'
  });

  const calculateTimeRemaining = useCallback(() => {
    if (!deadline) return null;

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;

    if (diff <= 0) {
      // Calculate how long overdue
      const overdueDiff = Math.abs(diff);
      const days = Math.floor(overdueDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((overdueDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) {
        return { 
          text: `Просрочено на ${days}д ${hours}ч`, 
          isOverdue: true,
          urgencyLevel: 'overdue',
          isUrgent: false
        };
      }
      return { 
        text: `Просрочено на ${hours}ч`, 
        isOverdue: true,
        urgencyLevel: 'overdue',
        isUrgent: false
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

    return { text, isOverdue: false, isUrgent, urgencyLevel };
  }, [deadline]);

  useEffect(() => {
    if (!deadline) {
      setCountdownState({
        timeRemaining: null,
        isOverdue: false,
        urgencyLevel: 'normal'
      });
      return;
    }

    // Initial calculation
    const initialResult = calculateTimeRemaining();
    if (initialResult) {
      setCountdownState({
        timeRemaining: initialResult,
        isOverdue: initialResult.isOverdue,
        urgencyLevel: initialResult.urgencyLevel
      });
    }

    // Determine update interval based on urgency
    const interval = initialResult?.isUrgent ? 1000 : 60000;

    const timer = setInterval(() => {
      const result = calculateTimeRemaining();
      if (result) {
        setCountdownState({
          timeRemaining: result,
          isOverdue: result.isOverdue,
          urgencyLevel: result.urgencyLevel
        });
      }
    }, interval);

    return () => clearInterval(timer);
  }, [deadline, calculateTimeRemaining]);

  return countdownState;
};

export default useCountdown;

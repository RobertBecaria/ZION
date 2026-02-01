/**
 * Framer Motion Animation Configuration
 * 2025 Design Trends: Micro-interactions, smooth transitions, glassmorphism
 */

// Easing curves for smooth animations
export const easings = {
  easeOut: [0.16, 1, 0.3, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  spring: { type: "spring", stiffness: 300, damping: 30 },
  softSpring: { type: "spring", stiffness: 200, damping: 25 },
  bounce: { type: "spring", stiffness: 400, damping: 10 },
};

// Page transition variants
export const pageTransitions = {
  // Fade and slide from right
  slideRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3, ease: easings.easeOut },
  },
  
  // Fade and scale up
  scaleUp: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 },
    transition: { duration: 0.25, ease: easings.easeOut },
  },
  
  // Fade only (accessible/reduced motion)
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  
  // Slide up with fade
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3, ease: easings.easeOut },
  },
};

// Content stagger variants for lists/grids
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 15 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: easings.easeOut }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.2 }
  },
};

// Card hover animations
export const cardHover = {
  rest: { 
    scale: 1,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  hover: { 
    scale: 1.02,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: { duration: 0.2, ease: easings.easeOut }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  },
};

// Button micro-interactions
export const buttonVariants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { duration: 0.2, ease: easings.easeOut }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  },
};

// Sidebar/menu animations
export const sidebarVariants = {
  collapsed: { 
    width: 0, 
    opacity: 0,
    transition: { duration: 0.3, ease: easings.easeInOut }
  },
  expanded: { 
    width: "auto", 
    opacity: 1,
    transition: { duration: 0.3, ease: easings.easeInOut }
  },
};

// Modal/dialog animations
export const modalVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.9,
    y: 20
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { 
      duration: 0.25, 
      ease: easings.easeOut 
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 }
  },
};

// Backdrop animation
export const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// Navigation item animations
export const navItemVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.2 }
  },
  exit: { opacity: 0, x: 10 },
  hover: {
    x: 4,
    transition: { duration: 0.15 }
  },
};

// Notification/toast animations
export const notificationVariants = {
  initial: { 
    opacity: 0, 
    y: -50, 
    scale: 0.9 
  },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    scale: 0.9,
    transition: { duration: 0.2 }
  },
};

// Floating action button
export const fabVariants = {
  rest: { 
    scale: 1,
    rotate: 0,
  },
  hover: { 
    scale: 1.1,
    rotate: 90,
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.9 },
};

// Shimmer/skeleton loading animation
export const shimmerVariants = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// Pulse animation for active states
export const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Module switch animation (for color transitions)
export const moduleTransition = {
  initial: { opacity: 0.8 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.5, ease: easings.easeOut }
  },
};

// Reduced motion check utility
export const shouldReduceMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Get appropriate animation based on motion preference
export const getMotionProps = (fullMotion, reducedMotion = pageTransitions.fade) => {
  return shouldReduceMotion() ? reducedMotion : fullMotion;
};

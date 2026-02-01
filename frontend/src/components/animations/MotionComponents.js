/**
 * Motion Components - Reusable animated components
 * 2025 Design Trends: Micro-interactions, glassmorphism, smooth transitions
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  cardHover, 
  buttonVariants, 
  staggerContainer, 
  staggerItem,
  navItemVariants,
  modalVariants,
  backdropVariants,
  shouldReduceMotion
} from '../../config/animations';

// Animated Card with hover effects
export const MotionCard = ({ 
  children, 
  className = '', 
  style = {},
  onClick,
  disabled = false,
  glassEffect = false
}) => {
  const reduceMotion = shouldReduceMotion();
  
  return (
    <motion.div
      className={`${className} ${glassEffect ? 'backdrop-blur-md bg-white/70' : ''}`}
      style={style}
      variants={reduceMotion ? {} : cardHover}
      initial="rest"
      whileHover={disabled ? undefined : "hover"}
      whileTap={disabled ? undefined : "tap"}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

// Animated Button with micro-interactions
export const MotionButton = ({ 
  children, 
  className = '', 
  style = {},
  onClick,
  disabled = false,
  type = 'button',
  whileHover,
  whileTap,
  ...props
}) => {
  const reduceMotion = shouldReduceMotion();
  
  return (
    <motion.button
      type={type}
      className={className}
      style={style}
      variants={reduceMotion ? {} : buttonVariants}
      initial="rest"
      whileHover={disabled ? undefined : (whileHover || "hover")}
      whileTap={disabled ? undefined : (whileTap || "tap")}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Staggered List Container
export const StaggerList = ({ 
  children, 
  className = '',
  style = {}
}) => {
  const reduceMotion = shouldReduceMotion();
  
  return (
    <motion.div
      className={className}
      style={style}
      variants={reduceMotion ? {} : staggerContainer}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
};

// Staggered List Item
export const StaggerItem = ({ 
  children, 
  className = '',
  style = {},
  custom
}) => {
  const reduceMotion = shouldReduceMotion();
  
  return (
    <motion.div
      className={className}
      style={style}
      variants={reduceMotion ? {} : staggerItem}
      custom={custom}
    >
      {children}
    </motion.div>
  );
};

// Animated Navigation Item
export const MotionNavItem = ({ 
  children, 
  className = '',
  style = {},
  isActive = false,
  onClick
}) => {
  const reduceMotion = shouldReduceMotion();
  
  return (
    <motion.div
      className={className}
      style={style}
      variants={reduceMotion ? {} : navItemVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

// Modal/Dialog with animations
export const MotionModal = ({ 
  children, 
  isOpen,
  onClose,
  className = '',
  overlayClassName = ''
}) => {
  const reduceMotion = shouldReduceMotion();
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <motion.div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 ${overlayClassName}`}
        variants={reduceMotion ? {} : backdropVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <motion.div
        className={`fixed inset-0 flex items-center justify-center z-50 pointer-events-none ${className}`}
        variants={reduceMotion ? {} : modalVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </motion.div>
    </>
  );
};

// Fade In on scroll/view
export const FadeInView = ({ 
  children, 
  className = '',
  delay = 0,
  duration = 0.5,
  y = 20
}) => {
  const reduceMotion = shouldReduceMotion();
  
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

// Animated icon with rotation on hover
export const MotionIcon = ({ 
  children,
  className = '',
  hoverRotate = 10,
  hoverScale = 1.1
}) => {
  const reduceMotion = shouldReduceMotion();
  
  return (
    <motion.span
      className={className}
      whileHover={reduceMotion ? {} : { 
        rotate: hoverRotate, 
        scale: hoverScale,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.9 }}
    >
      {children}
    </motion.span>
  );
};

// Pulse animation for notifications/badges
export const PulseBadge = ({ 
  children,
  className = '',
  color = '#ef4444'
}) => {
  return (
    <motion.span
      className={className}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [1, 0.8, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{ backgroundColor: color }}
    >
      {children}
    </motion.span>
  );
};

// Shimmer loading skeleton
export const ShimmerSkeleton = ({ 
  className = '',
  width = '100%',
  height = '20px',
  borderRadius = '4px'
}) => {
  return (
    <motion.div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
      }}
      animate={{
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
};

// Animated counter/number
export const AnimatedCounter = ({ 
  value,
  className = '',
  duration = 0.5
}) => {
  return (
    <motion.span
      className={className}
      key={value}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration }}
    >
      {value}
    </motion.span>
  );
};

export default {
  MotionCard,
  MotionButton,
  StaggerList,
  StaggerItem,
  MotionNavItem,
  MotionModal,
  FadeInView,
  MotionIcon,
  PulseBadge,
  ShimmerSkeleton,
  AnimatedCounter
};

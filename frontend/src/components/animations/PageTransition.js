/**
 * PageTransition Component
 * Wraps content with Framer Motion animations for smooth page/view transitions
 * 2025 Design: Micro-interactions and smooth navigation
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransitions, shouldReduceMotion } from '../../config/animations';

const PageTransition = ({ 
  children, 
  transitionKey, 
  variant = 'slideUp',
  className = '',
  style = {}
}) => {
  const reduceMotion = shouldReduceMotion();
  const selectedVariant = reduceMotion ? pageTransitions.fade : pageTransitions[variant];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={transitionKey}
        initial={selectedVariant.initial}
        animate={selectedVariant.animate}
        exit={selectedVariant.exit}
        transition={selectedVariant.transition}
        className={className}
        style={style}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;

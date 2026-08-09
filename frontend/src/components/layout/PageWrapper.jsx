import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } }
};

export const PageWrapper = ({ children, className = '' }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`min-h-screen flex flex-col flex-1 ${className}`}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 bg-black text-white px-4 py-2 rounded-md font-mono text-xs"
      >
        Skip to main content
      </a>
      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-10 pb-24 md:pb-10">
        {children}
      </main>
    </motion.div>
  );
};

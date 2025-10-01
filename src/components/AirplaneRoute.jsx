import React from 'react';
import { motion } from 'framer-motion';

const AirplaneRoute = ({ size = 120 }) => {
  return (
    <div 
      className="relative flex items-center justify-center"
      style={{ 
        width: size, 
        height: size,
        background: 'transparent'
      }}
    >
      {/* Circular path */}
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="absolute"
      >
        <motion.circle
          cx={size/2}
          cy={size/2}
          r={size/3}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeDasharray="4 4"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -50 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </svg>
      
      {/* Animated airplane */}
      <motion.div
        className="absolute"
        style={{
          width: size/4,
          height: size/4,
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear"
        }}
        transformOrigin={`${size/2}px ${size/2}px`}
      >
        <motion.div
          className="w-full h-full flex items-center justify-center text-blue-400"
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AirplaneRoute;

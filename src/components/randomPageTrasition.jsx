import React, { Children, useMemo } from "react";
import { motion } from "framer-motion";

// Utility function to generate a random off-screen offset.
function getRandomOffset() {
  const randomAngle = Math.random() * 2 * Math.PI; // Random angle in radians
  const randomDistance = Math.random() * 500 + 500; // Distance between 500 and 1000 pixels
  return {
    x: Math.cos(randomAngle) * randomDistance,
    y: Math.sin(randomAngle) * randomDistance,
  };
}

export default function RandomPageTransition({ children }) {
  // Generate random offsets for each child element
  const childOffsets = useMemo(
    () => Children.toArray(children).map(() => getRandomOffset()),
    [children]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 1 } }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      style={{ overflow: "hidden" }} // Ensures off-screen elements don't create scrollbars
    >
      {Children.toArray(children).map((child, index) => (
        <motion.div
          key={index}
          initial={{
            opacity: 0,
            x: childOffsets[index].x,
            y: childOffsets[index].y,
          }}
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
            transition: { duration: 1, ease: "easeOut" },
          }}
          exit={{
            opacity: 0,
            x: childOffsets[index].x,
            y: childOffsets[index].y,
            transition: { duration: 0.8, ease: "easeIn" },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

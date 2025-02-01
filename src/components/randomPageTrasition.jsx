import React from "react";
import { motion } from "framer-motion";

// Utility function to generate a random off-screen offset.
function getRandomOffset() {
  const randomAngle = Math.random() * 2 * Math.PI; // Random angle in radians
  const randomDistance = Math.random() * 500 + 500; // Distance between 500 and 3000 pixels
  return {
    x: Math.cos(randomAngle) * randomDistance,
    y: Math.sin(randomAngle) * randomDistance,
  };
}

// Define which tags should get the animation.
const targetTags = ["h1","h2", "input", "button", "div"];

/**
 * Recursively converts a target React element into its motion version.
 *
 * @param {React.ReactNode} element The element to process.
 * @returns {React.ReactNode} The (possibly animated) element.
 */
function animateElement(element) {
  // For non-elements (e.g. strings) just return as is.
  if (!React.isValidElement(element)) {
    return element;
  }

  // Recursively process children.
  const { children } = element.props;
  const animatedChildren = children
    ? React.Children.map(children, (child) => animateElement(child))
    : children;

  // Check if the element's type is a string and matches one of our target tags.
  if (typeof element.type === "string" && targetTags.includes(element.type)) {
    // Generate a random offset for this element.
    const offset = getRandomOffset();

    // Get the corresponding motion component if available.
    // For example, for a "h3", use motion.h3; fallback to motion.div if needed.
    const MotionComponent = motion[element.type] || motion.div;

    return (
      <MotionComponent
        // Start off-screen with zero opacity.
        initial={{ opacity: 0, x: offset.x, y: offset.y }}
        // Animate into place.
        animate={{
          opacity: 3,
          x: 0,
          y: 0,
          transition: { duration: 3, ease: "easeOut" },
        }}
        // Animate exit using the same random offset.
        exit={{
          opacity: 0,
          x: offset.x,
          y: offset.y,
          transition: { duration: 0.8, ease: "easeIn" },
        }}
        // Pass along all other props.
        {...element.props}
      >
        {animatedChildren}
      </MotionComponent>
    );
  }

  // For non-target elements, just clone and include the animated children.
  return React.cloneElement(element, { children: animatedChildren });
}

export default function RandomPageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 3, transition: { duration: 3 } }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      style={{ overflow: "hidden" }} // Prevent off-screen elements from creating scrollbars.
    >
      {React.Children.map(children, (child) => animateElement(child))}
    </motion.div>
  );
}

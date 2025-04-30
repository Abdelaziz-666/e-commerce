import React from 'react'
import { motion } from 'framer-motion';
const NewCollection = () => {
    const itemVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
      };
    return (
        <motion.div
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="NewCollectioncontainer mt-3">
            <div className="NewCollectiontext">
                <span>New Collection </span>
            </div>
        </div>
    </motion.div>
    )
}

export default NewCollection

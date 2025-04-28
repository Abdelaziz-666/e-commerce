import React from 'react'
import { motion } from 'framer-motion';
const AllCollectionsText = () => {
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
        <div className="AllCollectioncontainer my-3">
            <div className="AllCollectiontext">
                <span>ALL COLLECTIONS </span>
            </div>
        </div>
    </motion.div>
    )
}

export default AllCollectionsText

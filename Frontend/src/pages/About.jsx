import React from 'react';
import { motion } from 'framer-motion';
import { FaHandHoldingHeart, FaUsers, FaHandshake, FaChartLine } from 'react-icons/fa';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1>About The Good Deed Hub</h1>
            <p className="mission-statement">
              Empowering communities through meaningful connections and transparent charitable giving.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            <motion.div
              className="value-card"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <FaHandHoldingHeart className="value-icon" />
              <h3>Compassion</h3>
              <p>We believe in the power of empathy and kindness to create positive change in our communities.</p>
            </motion.div>

            <motion.div
              className="value-card"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <FaUsers className="value-icon" />
              <h3>Community</h3>
              <p>Building strong connections between donors and fundraisers to create lasting impact.</p>
            </motion.div>

            <motion.div
              className="value-card"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <FaHandshake className="value-icon" />
              <h3>Trust</h3>
              <p>Maintaining transparency and accountability in every transaction and interaction.</p>
            </motion.div>

            <motion.div
              className="value-card"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <FaChartLine className="value-icon" />
              <h3>Impact</h3>
              <p>Focusing on measurable outcomes and sustainable positive change in our communities.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="impact-section">
        <div className="container">
          <h2>Our Impact</h2>
          <div className="stats-grid">
            <motion.div
              className="stat-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3>1000+</h3>
              <p>Successful Fundraisers</p>
            </motion.div>

            <motion.div
              className="stat-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3>$500K+</h3>
              <p>Funds Raised</p>
            </motion.div>

            <motion.div
              className="stat-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3>5000+</h3>
              <p>Active Donors</p>
            </motion.div>

            <motion.div
              className="stat-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3>50+</h3>
              <p>Communities Served</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2>Our Story</h2>
            <p>
              The Good Deed Hub was founded with a simple yet powerful vision: to create a platform where compassion meets action. 
              We recognized the need for a transparent, efficient, and user-friendly platform that could connect those in need with 
              those who want to help.
            </p>
            <p>
              Today, we continue to grow and evolve, driven by our commitment to fostering positive change and building stronger 
              communities. Every donation, every fundraiser, and every connection made on our platform contributes to our shared 
              mission of making the world a better place, one good deed at a time.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;

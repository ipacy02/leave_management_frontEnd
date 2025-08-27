import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Calendar, Clock, CheckCircle, Users, Settings, ChevronRight, Bell, ArrowRight, MailOpen, Phone, MapPin } from 'lucide-react';
import whitecollarimage from "../assets/worker.svg";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    },
    hover: {
      y: -8,
      boxShadow: "0px 10px 25px rgba(79, 70, 229, 0.15)",
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  };

  const features = [
    {
      title: "Employee Dashboard",
      description: "View leave balances, apply for time off, and check application status all in one place.",
      icon: <Clock className="h-12 w-12 text-indigo-600" />
    },
    {
      title: "Approval Workflow",
      description: "Streamlined process for managers to review and approve leave requests with notifications.",
      icon: <CheckCircle className="h-12 w-12 text-indigo-600" />
    },
    {
      title: "Team Calendar",
      description: "See team availability at a glance and plan around upcoming leaves and holidays.",
      icon: <Calendar className="h-12 w-12 text-indigo-600" />
    },
    {
      title: "Multiple Leave Types",
      description: "Support for PTO, sick leave, maternity leave, and more as per Rwandan Labor Law.",
      icon: <Users className="h-12 w-12 text-indigo-600" />
    }
  ];

  const benefits = [
    {
      title: "Automated Notifications",
      description: "Keep everyone informed with email and push notifications for leave applications and approvals.",
      icon: <Bell className="h-6 w-6 text-indigo-600" />
    },
    {
      title: "Flexible Configuration",
      description: "Customize leave types, accrual rates, and carry-forward policies to match your organization's needs.",
      icon: <Settings className="h-6 w-6 text-indigo-600" />
    },
    {
      title: "Microsoft Integration",
      description: "Seamless authentication with Microsoft and integration with Outlook calendar.",
      icon: <Users className="h-6 w-6 text-indigo-600" />
    }
  ];

  return (
    <div className="bg-white">
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="bg-white sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/90"
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">AfriHR</span>
          </motion.div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {['Features', 'Benefits', 'Contact'].map((item, index) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 * (index + 1) }}
                whileHover={{ y: -2, color: "#4f46e5" }}
                className="text-gray-700 hover:text-indigo-600 font-medium transition duration-200"
              >
                {item}
              </motion.a>
            ))}
          </nav>
          
          {/* Login Button */}
          <motion.div 
            className="hidden md:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2 px-6 rounded-lg font-medium transition duration-300 shadow-md hover:shadow-lg"
            >
            <a href="/login">  Login  </a>
            </motion.button>
          </motion.div>
          
          {/* Mobile menu button */}
          <motion.div 
            className="md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.9 }}
              className="text-gray-500 hover:text-indigo-600 focus:outline-none transition duration-200"
            >
              {mobileMenuOpen ? 
                <X className="h-6 w-6" /> : 
                <Menu className="h-6 w-6" />
              }
            </motion.button>
          </motion.div>
        </div>
        
        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white py-4 px-6 shadow-lg rounded-b-lg overflow-hidden"
            >
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col space-y-4"
              >
                {['Features', 'Benefits', 'Contact'].map((item) => (
                  <motion.a
                    key={item}
                    variants={itemVariants}
                    href={`#${item.toLowerCase()}`}
                    className="text-gray-700 hover:text-indigo-600 font-medium"
                  >
                    {item}
                  </motion.a>
                ))}
                <motion.button 
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-6 rounded-lg font-medium shadow-md"
                >
                  Login with Microsoft
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center">
            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", duration: 1 }}
              className="md:w-1/2 mb-12 md:mb-0"
            >
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight"
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  Simplified Leave Management
                </span> 
                <br />for Your Team
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-xl text-gray-600 mb-8 leading-relaxed"
              >
                Streamline how your staff apply for and manage their leave with our comprehensive system designed specifically for workplaces.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
              >
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-8 rounded-lg font-medium flex items-center justify-center shadow-md hover:shadow-lg transition duration-300"
                >
                  Get Started
                  <motion.span
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                  >
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </motion.span>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-50 py-3 px-8 rounded-lg font-medium shadow-sm hover:shadow transition duration-300"
                >
                  Book a Demo
                </motion.button>
              </motion.div>
            </motion.div>
            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", duration: 1, delay: 0.3 }}
              className="md:w-1/2"
            >
              <motion.div 
                whileHover={{ rotate: 0, scale: 1.02 }}
                initial={{ rotate: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="bg-white p-4 rounded-2xl shadow-xl transition-transform duration-300"
              >
                <img 
                  src={whitecollarimage} 
                  alt="Professional team using HR software" 
                  className="rounded-xl w-full object-cover h-1/2"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Leave Management Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our system is designed to handle all aspects of leave management, saving time and reducing administrative overhead.
            </p>
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                whileHover="hover"
                className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-indigo-200 transition duration-300"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 * index }}
                  className="mb-6 bg-indigo-50 p-3 inline-block rounded-2xl"
                >
                  {React.cloneElement(feature.icon, { className: "h-12 w-12 text-indigo-600" })}
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section id="benefits" className="py-24 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our System</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for workplaces, compliant with Rwandan Labor Law (2023).
            </p>
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-8"
          >
            {benefits.map((benefit, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                whileHover="hover"
                className="bg-white p-8 rounded-2xl shadow-lg transition duration-300"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 * index }}
                  className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full w-16 h-16 flex items-center justify-center mb-6"
                >
                  {React.cloneElement(benefit.icon, { className: "h-8 w-8 text-indigo-600" })}
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Testimonial Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 shadow-xl"
          >
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-8">What Our Clients Say</h2>
              
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8"
              >
                <motion.p 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-xl text-white mb-6 italic"
                >
                  "AfriHR's leave management system has transformed how we handle time off requests. The team calendar feature has been especially valuable for planning our projects and ensuring adequate coverage."
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="flex items-center justify-center"
                >
                  <div>
                    <p className="font-bold text-white">Sarah Mutoni</p>
                    <p className="text-indigo-100">HR Director, Kigali Tech</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-24">
        <div className="container mx-auto px-6 text-center">
          <motion.h2 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-white mb-6"
          >
            Ready to Transform Your Leave Management?
          </motion.h2>
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl text-indigo-100 mb-10 max-w-3xl mx-auto"
          >
            Join organizations across Africa that are already benefiting from our streamlined leave management system.
          </motion.p>
          <motion.button 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.4, duration: 0.6 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-indigo-600 hover:text-indigo-700 hover:bg-gray-50 py-4 px-10 rounded-lg font-bold shadow-lg transition duration-300"
          >
            Request Access
          </motion.button>
        </div>
      </section>
      
      {/* Contact Section */}
      <section id="contact" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions about how AfriHR can work for your organization? Contact our team.
            </p>
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8"
          >
            {[
              { icon: <MailOpen className="h-6 w-6 text-indigo-600" />, title: "Email Us", info: "info@afrihr.com" },
              { icon: <Phone className="h-6 w-6 text-indigo-600" />, title: "Call Us", info: "+250 788 123 456" },
              { icon: <MapPin className="h-6 w-6 text-indigo-600" />, title: "Visit Us", info: "Kigali, Rwanda" }
            ].map((item, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5, boxShadow: "0px 10px 25px rgba(79, 70, 229, 0.1)" }}
                className="bg-white p-6 rounded-xl shadow-md transition duration-300 text-center"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 * index }}
                  className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4"
                >
                  {item.icon}
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-indigo-600">{item.info}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-4 gap-12"
          >
            <motion.div variants={itemVariants}>
              <h3 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">AfriHR</h3>
              <p className="text-gray-300">
                Streamlined leave management designed for workplaces.
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-6 text-white">Features</h3>
              <ul className="space-y-3">
                {["Employee Dashboard", "Leave Application", "Approval Workflow", "Team Calendar"].map((item, i) => (
                  <motion.li
                    key={i}
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <a href="#" className="text-gray-300 hover:text-indigo-300 transition duration-200">{item}</a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-6 text-white">Company</h3>
              <ul className="space-y-3">
                {["About Us", "Careers", "Contact", "Blog"].map((item, i) => (
                  <motion.li
                    key={i}
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <a href="#" className="text-gray-300 hover:text-indigo-300 transition duration-200">{item}</a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-6 text-white">Contact</h3>
              <ul className="space-y-3">
                <li className="text-gray-300 flex items-center"><MapPin className="h-4 w-4 mr-2 text-indigo-400" /> Kigali, Rwanda</li>
                <li className="text-gray-300 flex items-center"><MailOpen className="h-4 w-4 mr-2 text-indigo-400" /> info@afrihr.com</li>
                <li className="text-gray-300 flex items-center"><Phone className="h-4 w-4 mr-2 text-indigo-400" /> +250 788 123 456</li>
              </ul>
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
          >
            <p className="text-gray-400">© 2025 AfriHR. All rights reserved.</p>
            <div className="flex space-x-6 mt-6 md:mt-0">
              <motion.a
                whileHover={{ y: -2, color: "#818cf8" }}
                href="#" 
                className="text-gray-400 hover:text-indigo-300 transition duration-200"
              >
                Privacy Policy
              </motion.a>
              <motion.a
                whileHover={{ y: -2, color: "#818cf8" }}
                href="#" 
                className="text-gray-400 hover:text-indigo-300 transition duration-200"
              >
                Terms of Service
              </motion.a>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
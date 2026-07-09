"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";
import { Mail, Phone, MapPin, Clock, Send, Map } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "wedding",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", phone: "", eventType: "wedding", message: "" });
    }, 3000);
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section id="contact" className="py-24 bg-[#090909] relative overflow-hidden select-none">
      {/* Background ambient elements */}
      <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-purple-900/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            whileInView={{ opacity: 0.6, letterSpacing: "0.25em" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.25em]"
          >
            Get In Touch
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="text-3xl sm:text-5xl font-light font-heading text-white mt-3"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Connect With Our Team
          </motion.h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
        >
          {/* Contact Details & Map Placeholder (5 columns) */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div variants={itemVariants} className="space-y-6">
              <h3 className="text-2xl font-light font-heading text-white" style={{ fontFamily: "Playfair Display, serif" }}>
                Contact Information
              </h3>
              
              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[#D4AF37]">
                    <Mail className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 uppercase tracking-wider block font-light">Email Us</span>
                    <a href={`mailto:${LANDING_PAGE_CONFIG.contact.email}`} className="text-sm text-[#F7F3EC] hover:text-[#D4AF37] transition-colors duration-300">
                      {LANDING_PAGE_CONFIG.contact.email}
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[#D4AF37]">
                    <Phone className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 uppercase tracking-wider block font-light">Call Us</span>
                    <a href={`tel:${LANDING_PAGE_CONFIG.contact.phone}`} className="text-sm text-[#F7F3EC] hover:text-[#D4AF37] transition-colors duration-300">
                      {LANDING_PAGE_CONFIG.contact.phone}
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[#D4AF37]">
                    <MapPin className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 uppercase tracking-wider block font-light">Visit Us</span>
                    <span className="text-sm text-[#F7F3EC] leading-snug block">
                      {LANDING_PAGE_CONFIG.contact.address}
                    </span>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[#D4AF37]">
                    <Clock className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 uppercase tracking-wider block font-light">Office Hours</span>
                    <span className="text-sm text-[#F7F3EC] leading-snug block">
                      {LANDING_PAGE_CONFIG.contact.workingHours}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Embedded Dark Theme Google Maps Placeholder */}
            <motion.div variants={itemVariants} className="relative h-[220px] rounded-2xl overflow-hidden border border-white/5 shadow-lg bg-[#0F172A]/40 flex flex-col items-center justify-center p-6 text-center select-none group">
              <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=500&q=80')" }} />
              <div className="relative z-10 flex flex-col items-center gap-3">
                {/* Glowing Location Marker */}
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] relative">
                  <MapPin className="w-6 h-6 animate-bounce" />
                  <div className="absolute inset-0 rounded-full border border-[#D4AF37] animate-ping opacity-25" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-wide uppercase">Jubilee Hills Office</h4>
                  <p className="text-[11px] text-[#F7F3EC]/70 mt-1 max-w-[220px] mx-auto leading-relaxed">
                    Sai Events Tower, Hyderabad, Telangana, India
                  </p>
                </div>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-[10px] uppercase font-bold tracking-wider text-[#D4AF37] hover:text-white flex items-center gap-1.5 transition-colors duration-300"
                >
                  <Map className="w-3.5 h-3.5" />
                  Open in Maps
                </a>
              </div>
            </motion.div>
          </div>

          {/* Contact Form (7 columns) */}
          <motion.div variants={itemVariants} className="lg:col-span-7 p-8 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md shadow-2xl relative">
            <h3 className="text-2xl font-light font-heading text-white mb-6" style={{ fontFamily: "Playfair Display, serif" }}>
              Send A Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name (Floating Label) */}
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder=" "
                  className="peer w-full bg-white/5 border border-white/5 focus:border-[#D4AF37] rounded-xl px-4 pt-6 pb-2 text-sm text-white placeholder-transparent focus:outline-none transition-colors duration-300"
                />
                <label className="absolute left-4 top-4 text-sm font-light text-white/50 pointer-events-none transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-[#D4AF37] uppercase tracking-wider font-sans">
                  Your Name
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Email (Floating Label) */}
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder=" "
                    className="peer w-full bg-white/5 border border-white/5 focus:border-[#D4AF37] rounded-xl px-4 pt-6 pb-2 text-sm text-white placeholder-transparent focus:outline-none transition-colors duration-300"
                  />
                  <label className="absolute left-4 top-4 text-sm font-light text-white/50 pointer-events-none transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-[#D4AF37] uppercase tracking-wider font-sans">
                    Email Address
                  </label>
                </div>

                {/* Phone (Floating Label) */}
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    placeholder=" "
                    className="peer w-full bg-white/5 border border-white/5 focus:border-[#D4AF37] rounded-xl px-4 pt-6 pb-2 text-sm text-white placeholder-transparent focus:outline-none transition-colors duration-300"
                  />
                  <label className="absolute left-4 top-4 text-sm font-light text-white/50 pointer-events-none transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-[#D4AF37] uppercase tracking-wider font-sans">
                    Phone Number
                  </label>
                </div>
              </div>

              {/* Event Type Select */}
              <div className="relative">
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full bg-white/5 border border-white/5 focus:border-[#D4AF37] rounded-xl px-4 py-4 text-sm text-white focus:outline-none transition-colors duration-300 uppercase tracking-wider font-light"
                >
                  <option value="wedding" className="bg-[#090909] text-white">Weddings</option>
                  <option value="engagement" className="bg-[#090909] text-white">Engagements</option>
                  <option value="birthday" className="bg-[#090909] text-white">Birthdays</option>
                  <option value="corporate" className="bg-[#090909] text-white">Corporate Events</option>
                  <option value="baby-shower" className="bg-[#090909] text-white">Baby Showers</option>
                  <option value="decoration" className="bg-[#090909] text-white">Decorations & Design</option>
                </select>
              </div>

              {/* Message (Floating Label) */}
              <div className="relative">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={4}
                  placeholder=" "
                  className="peer w-full bg-white/5 border border-white/5 focus:border-[#D4AF37] rounded-xl px-4 pt-6 pb-2 text-sm text-white placeholder-transparent focus:outline-none transition-colors duration-300 resize-none"
                />
                <label className="absolute left-4 top-4 text-sm font-light text-white/50 pointer-events-none transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-[#D4AF37] uppercase tracking-wider font-sans">
                  Tell Us About Your Event
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitted}
                className="w-full px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#e4bf47] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.35)] flex items-center justify-center gap-2 group cursor-pointer"
              >
                {submitted ? (
                  <>
                    Sent Successfully
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-300" />
                    Send Inquiry
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

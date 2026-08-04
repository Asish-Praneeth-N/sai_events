"use client";

import React, { useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";
import { Mail, Phone, MapPin, Clock, Send, Map } from "lucide-react";
import ScrollHeading from "@/components/Common/ScrollHeading";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "Wedding",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/guest-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit enquiry.");
      }

      setSuccessMessage(data.message || "Thank you for reaching out. Our team has received your enquiry and will get in touch with you soon.");
      setFormData({ name: "", email: "", phone: "", eventType: "Wedding", message: "" });
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while sending your enquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  const contactInfoItems = [
    { Icon: Mail, label: "Email Us", value: LANDING_PAGE_CONFIG.contact.email, href: `mailto:${LANDING_PAGE_CONFIG.contact.email}`, isLink: true },
    { Icon: Phone, label: "Call Us", value: LANDING_PAGE_CONFIG.contact.phone, href: `tel:${LANDING_PAGE_CONFIG.contact.phone}`, isLink: true },
    { Icon: MapPin, label: "Visit Us", value: LANDING_PAGE_CONFIG.contact.address, isLink: false },
    { Icon: Clock, label: "Office Hours", value: LANDING_PAGE_CONFIG.contact.workingHours, isLink: false },
  ];

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const entryVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section className="w-full bg-transparent py-24 sm:py-32 relative overflow-hidden select-none border-t border-border">
      {/* Light-mode: warm neutrals. Dark-mode: cinematic depth */}
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-foreground/[0.015] dark:bg-[#287878]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-accent-gold/3 dark:bg-[#D4AF37]/3 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[150px] bg-accent-gold/2 dark:bg-[#D4AF37]/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.28em] block mb-3 opacity-75">
            Get In Touch
          </span>
          <ScrollHeading
            title="Connect With Our Team"
            className="text-3xl sm:text-5xl font-light text-foreground tracking-tight"
          />
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mx-auto mt-4" />
        </div>

        {/* Content Layout */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start w-full"
        >
          {/* Left Column: Contact details (5 cols) */}
          <motion.div
            variants={entryVariants}
            className="lg:col-span-5 space-y-8"
          >
            <div className="space-y-6">
              <h3
                className="text-2xl font-light text-foreground tracking-wide"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                Contact Information
              </h3>

              <div className="space-y-5">
                {contactInfoItems.map(({ Icon, label, value, href, isLink }, i) => (
                  <div key={label} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-card-bg border border-card-border flex items-center justify-center text-[#D4AF37] shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-foreground/45 uppercase tracking-widest block font-bold mb-0.5">
                        {label}
                      </span>
                      {isLink && href ? (
                        <a
                          href={href}
                          className="text-sm text-foreground hover:text-[#D4AF37] transition-colors duration-300 font-light"
                        >
                          {value}
                        </a>
                      ) : (
                        <span className="text-sm text-foreground leading-snug block font-light">{value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Office map preview box */}
            <div className="relative h-[200px] rounded-2xl overflow-hidden border border-border shadow-xl bg-surface-raised flex flex-col items-center justify-center p-6 text-center">
              <div
                className="absolute inset-0 z-0 opacity-15 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=500&q=80')" }}
              />
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/45 flex items-center justify-center text-[#D4AF37] relative">
                  <MapPin className="w-5 h-5 animate-bounce" />
                  <div className="absolute inset-0 rounded-full border border-[#D4AF37] animate-ping opacity-10" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground tracking-widest uppercase">
                    Jubilee Hills Office
                  </h4>
                  <p className="text-[10px] text-foreground/60 mt-1 max-w-[220px] mx-auto leading-relaxed">
                    Sai Events Tower, Hyderabad, Telangana, India
                  </p>
                </div>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-[9px] uppercase font-bold tracking-widest text-[#D4AF37] hover:text-foreground flex items-center gap-1.5 transition-colors duration-300 cursor-pointer"
                >
                  <Map className="w-3.5 h-3.5" />
                  Open in Maps
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Contact form (7 cols) */}
          <motion.div
            variants={entryVariants}
            className="lg:col-span-7"
          >
            <div className="p-8 rounded-3xl bg-card-bg border border-card-border shadow-2xl space-y-6">
              <h3
                className="text-2xl font-light text-foreground tracking-wide"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                Send An Enquiry
              </h3>

              {successMessage && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-2xl leading-relaxed">
                  ✓ {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold rounded-2xl">
                  ⚠️ {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder=" "
                    className="peer w-full bg-input-bg border border-card-border focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl px-4 pt-6 pb-2 text-sm text-foreground placeholder-transparent focus:outline-none transition-colors duration-300"
                  />
                  <label className="absolute left-4 top-4 text-xs font-light text-foreground/45 pointer-events-none transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-[#D4AF37] peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-[#D4AF37] uppercase tracking-wider font-sans">
                    Full Name *
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Email */}
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder=" "
                      className="peer w-full bg-input-bg border border-card-border focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl px-4 pt-6 pb-2 text-sm text-foreground placeholder-transparent focus:outline-none transition-colors duration-300"
                    />
                    <label className="absolute left-4 top-4 text-xs font-light text-foreground/45 pointer-events-none transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-[#D4AF37] peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-[#D4AF37] uppercase tracking-wider font-sans">
                      Email Address *
                    </label>
                  </div>

                  {/* Phone */}
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      placeholder=" "
                      className="peer w-full bg-input-bg border border-card-border focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl px-4 pt-6 pb-2 text-sm text-foreground placeholder-transparent focus:outline-none transition-colors duration-300"
                    />
                    <label className="absolute left-4 top-4 text-xs font-light text-foreground/45 pointer-events-none transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-[#D4AF37] peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-[#D4AF37] uppercase tracking-wider font-sans">
                      Phone Number *
                    </label>
                  </div>
                </div>

                {/* Event Type selection */}
                <div className="space-y-1">
                  <label className="text-[10px] text-foreground/45 uppercase tracking-widest font-bold block px-1">
                    Event Being Planned / Event Type *
                  </label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full bg-input-bg border border-card-border focus:border-[#D4AF37] rounded-xl px-4 py-4 text-xs text-foreground focus:outline-none transition-colors duration-300 uppercase tracking-widest font-bold"
                  >
                    <option value="Wedding" className="bg-surface text-foreground">Wedding</option>
                    <option value="Corporate Event" className="bg-surface text-foreground">Corporate Event</option>
                    <option value="Birthday" className="bg-surface text-foreground">Birthday</option>
                    <option value="Engagement" className="bg-surface text-foreground">Engagement</option>
                    <option value="Reception" className="bg-surface text-foreground">Reception</option>
                    <option value="Private Event" className="bg-surface text-foreground">Private Event</option>
                    <option value="Other" className="bg-surface text-foreground">Other</option>
                  </select>
                </div>

                {/* Message */}
                <div className="relative">
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={4}
                    placeholder=" "
                    className="peer w-full bg-input-bg border border-card-border focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl px-4 pt-6 pb-2 text-sm text-foreground placeholder-transparent focus:outline-none transition-colors duration-300 resize-none"
                  />
                  <label className="absolute left-4 top-4 text-xs font-light text-foreground/45 pointer-events-none transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-[#D4AF37] peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-[#D4AF37] uppercase tracking-wider font-sans">
                    Tell Us About the Event *
                  </label>
                </div>

                {/* Submit button */}
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={submitting ? {} : { scale: 1.02, boxShadow: "0 0 24px rgba(212,175,55,0.35)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#e4bf47] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    "Sending Enquiry..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                      Send Enquiry
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

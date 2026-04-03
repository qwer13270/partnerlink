'use client'

import { useState } from 'react'
import { MessageCircle, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { interpolate } from '@/lib/strings'
import strings from '@/lib/strings'
import type { Property } from '@/lib/types'

interface BookTourCTAProps {
  property: Property
  referrer?: string | null
}

export default function BookTourCTA({ property, referrer }: BookTourCTAProps) {
  const t = strings.property.bookTour
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    preferredDate: '',
    message: '',
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        property_slug: property.slug,
        name:          formData.name,
        phone:         formData.phone,
        email:         formData.email,
        message:       [formData.preferredDate && `偏好日期：${formData.preferredDate}`, formData.message]
          .filter(Boolean).join('\n') || null,
      }),
    }).catch(() => null) // best-effort — UX always succeeds

    toast.success(t.thankYou, { duration: 5000 })

    setFormData({ name: '', phone: '', email: '', preferredDate: '', message: '' })
    setIsSubmitting(false)
  }

  // Format referrer name for display
  const referrerDisplay = referrer
    ? referrer.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : null

  return (
    <section className="bg-foreground text-background">
      <div className="editorial-container py-24 md:py-32 lg:py-40">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-24"
        >
          <p className="text-xs uppercase tracking-widest text-background/60 mb-4">
            預約參觀
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">
            {t.title}
          </h2>
          {referrerDisplay && (
            <p className="text-background/70">
              {interpolate(t.referredBy, { name: referrerDisplay })}
            </p>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 max-w-5xl mx-auto">
          {/* LINE Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <div className="mb-8">
              <span className="text-xs uppercase tracking-widest text-background/60">
                01
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-serif mb-6">
              透過 LINE 預約
            </h3>
            <p className="text-background/70 mb-8 leading-relaxed">
              加入官方 LINE 帳號，專人為您服務。即時回覆您的問題，安排最適合的參觀時間。
            </p>
            <button
              onClick={() => toast.info('即將開放 LINE 預約功能')}
              className="group inline-flex items-center gap-4 text-lg font-medium hover:gap-6 transition-all duration-300"
            >
              <span className="flex items-center justify-center h-14 w-14 rounded-full bg-[#06C755]">
                <MessageCircle className="h-6 w-6 text-white" />
              </span>
              <span>{t.lineButton}</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" strokeWidth={1.5} />
            </button>
          </motion.div>

          {/* Contact Form Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="mb-8">
              <span className="text-xs uppercase tracking-widest text-background/60">
                02
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-serif mb-8">
              {t.orFillForm}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-background/60 mb-3">
                  {t.name}
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-background/30 pb-3 text-background placeholder:text-background/40 focus:border-background focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-background/60 mb-3">
                  {t.phone}
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-background/30 pb-3 text-background placeholder:text-background/40 focus:border-background focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-background/60 mb-3">
                  {t.email}
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-background/30 pb-3 text-background placeholder:text-background/40 focus:border-background focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Preferred Date */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-background/60 mb-3">
                  {t.preferredDate}
                </label>
                <input
                  name="preferredDate"
                  type="date"
                  value={formData.preferredDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-transparent border-b border-background/30 pb-3 text-background focus:border-background focus:outline-none transition-colors [color-scheme:dark]"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-background/60 mb-3">
                  {t.message}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-transparent border-b border-background/30 pb-3 text-background placeholder:text-background/40 focus:border-background focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Hidden referrer field */}
              {referrer && (
                <input type="hidden" name="referrer" value={referrer} />
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group inline-flex items-center gap-4 bg-background text-foreground px-8 py-4 text-sm uppercase tracking-widest hover:gap-6 transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                      <span>送出中</span>
                    </>
                  ) : (
                    <>
                      <span>{t.submit}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" strokeWidth={1.5} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

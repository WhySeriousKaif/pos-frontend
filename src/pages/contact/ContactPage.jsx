import React, { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { Mail, User, Building2, MessageSquare, Send } from 'lucide-react'
import { testimonials } from '@/data/testimonials'

const SLIDE_GRADIENTS = [
  'from-blue-600 via-indigo-600 to-blue-800',
  'from-sky-500 via-blue-600 to-indigo-700',
  'from-indigo-600 via-blue-700 to-slate-900',
  'from-cyan-500 via-blue-600 to-blue-800',
  'from-blue-700 via-violet-600 to-indigo-800',
  'from-blue-500 via-sky-600 to-indigo-700',
]

const SLIDE_DURATION = 2500

const TestimonialPanel = () => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length)
    }, SLIDE_DURATION)
    return () => clearInterval(timer)
  }, [])

  const testimonial = testimonials[index]
  const gradient = SLIDE_GRADIENTS[index % SLIDE_GRADIENTS.length]
  const initial = testimonial.name.charAt(0)

  return (
    <div
      className={`relative hidden lg:flex flex-col justify-between h-[640px] w-full max-w-md rounded-[2rem] overflow-hidden bg-gradient-to-br ${gradient} p-10 shadow-2xl transition-all duration-1000`}
    >
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10">
        <span className="text-6xl font-black text-white/40 leading-none select-none">"</span>
      </div>

      <div className="relative z-10 space-y-8">
        <p className="text-2xl md:text-[26px] font-semibold text-white leading-snug">
          {testimonial.content}
        </p>

        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {initial}
          </div>
          <div>
            <p className="font-bold text-white">{testimonial.name}</p>
            <p className="text-sm text-white/75">
              {testimonial.role}, {testimonial.company}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-2 pt-6">
        {testimonials.map((t, i) => (
          <button
            key={t.name}
            onClick={() => setIndex(i)}
            aria-label={`Show testimonial from ${t.name}`}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              i === index ? 'w-8 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

const ContactPage = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', company: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="relative min-h-screen bg-[#F8FAFE] dark:bg-[#0F1729] text-slate-900 dark:text-slate-100 transition-colors overflow-hidden">
      {/* Soft glow accents behind the navbar so its transparency/blur is visible, like over the homepage's hero video */}
      <div className="absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-blue-500/25 blur-3xl pointer-events-none" />
      <div className="absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

      <Navbar />

      <main className="relative pt-32 md:pt-40 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl grid lg:grid-cols-2 gap-10 items-center">
          <TestimonialPanel />

          <div className="relative rounded-[2rem] border border-black/10 dark:border-white/10 p-2">
            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
            <div className="relative rounded-[1.75rem] bg-white dark:bg-slate-900 p-8 md:p-10">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3">
                Contact Us
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                Please reach out to us and we'll get back to you as soon as we can.
              </p>

              {submitted ? (
                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6 text-blue-700 dark:text-blue-300 font-medium">
                  Thanks for reaching out! Our team will get back to you shortly.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="Manu Arora"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="hello@yourstore.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="company"
                        name="company"
                        placeholder="Your store or business name"
                        value={formData.company}
                        onChange={handleChange}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us what you need help with"
                        value={formData.message}
                        onChange={handleChange}
                        className="pl-10 min-h-[120px]"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full bg-blue-800 hover:bg-blue-700 gap-2">
                    Submit
                    <Send className="size-4" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ContactPage

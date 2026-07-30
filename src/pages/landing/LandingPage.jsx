import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/layout/Navbar'
import { Carousel, Card as AppleCard } from '@/components/ui/apple-cards-carousel'
import { CometCard } from '@/components/ui/comet-card'
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import {
  ShoppingCart,
  BarChart3,
  Lock,
  CheckCircle2,
  Store,
  Users,
  TrendingUp,
  Shield,
  Zap,
  FileText,
  ArrowRight,
  Play,
  Star,
  Sparkles,
  Plus,
} from 'lucide-react'
import logoP from '@/assets/logo_p_transparent.png'
import { testimonials } from '@/data/testimonials'
import { subscriptionPlanAPI } from '@/services/api'

const LandingPage = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(-1)
  const [pricingPlans, setPricingPlans] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    subscriptionPlanAPI.getAll()
      .then((plans) => {
        const active = (plans || []).filter((p) => p.active).sort((a, b) => a.price - b.price)
        setPricingPlans(
          active.map((plan, index) => ({
            name: plan.name,
            price: `$${plan.price.toLocaleString()}`,
            period: '/month',
            popular: index === 1 || (active.length === 1 && index === 0),
            features: (plan.features || '').split(',').map((f) => f.trim()).filter(Boolean),
          }))
        )
      })
      .catch((error) => console.error('Error fetching pricing plans:', error))
  }, [])

  const features = [
    {
      icon: ShoppingCart,
      title: 'Fast Checkout',
      description: 'Streamlined checkout process for faster transactions',
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Get instant insights into your business performance',
    },
    {
      icon: Lock,
      title: 'Secure Access',
      description: 'Enterprise-grade security for your data',
    },
    {
      icon: CheckCircle2,
      title: 'GST Ready',
      description: 'Compliant with tax regulations and reporting',
    },
  ]

  const faqs = [
    {
      category: 'HOW IT WORKS',
      question: 'Okay, how does Bilix actually work?',
      answer: "Install Bilix on your billing counter, add your products once, and you're scanning and charging customers within the hour. Inventory, receipts, and reports update in real time across every connected device.",
    },
    {
      category: 'SPEED',
      question: 'How fast is checkout, really?',
      answer: 'Barcode scans register in under a second and payments settle instantly over UPI, card, or cash. Most stores cut their average checkout time by more than half in the first week.',
    },
    {
      category: 'SCALE',
      question: 'Can it handle more than one store?',
      answer: 'Yes — Bilix is built for chains. Manage pricing, stock transfers, and staff across every branch from one dashboard, whether you run 2 stores or 200.',
    },
    {
      category: 'OFFLINE',
      question: 'What happens if the internet drops?',
      answer: 'Nothing stops. Bilix keeps billing locally on the terminal and automatically syncs every transaction to the cloud the moment connection is restored — no lost sales, no manual reconciliation.',
    },
    {
      category: 'ONBOARDING',
      question: 'What if my team has never used a POS before?',
      answer: "The interface is built to be learned in minutes, not days, and every plan includes onboarding support. Most cashiers are comfortable running the counter solo on day one.",
    },
  ]

  // Public video files loop including 21117-315137086_large.mp4
  const videos = ['/zs-supermarket-bg.mp4', '/videoKaif.mp4', '/21117-315137086_large.mp4']
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

  const handleVideoEnded = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFE] dark:bg-[#0F1729] text-slate-900 dark:text-slate-100 selection:bg-blue-800 selection:text-white transition-colors">
      <Navbar />

      {/* Hero Section with Full-Screen Video Background - Fill Entire Window (100vh) */}
      <section className="relative h-screen w-full flex flex-col justify-center overflow-hidden bg-[#F8FAFE] dark:bg-black text-slate-900 dark:text-white transition-colors">
        {/* Background Video Layer - 100% Untouched Original Video Colors */}
        <div className="absolute inset-0 z-0">
          <video
            key={currentVideoIndex}
            src={videos[currentVideoIndex]}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnded}
            className="w-full h-full object-cover"
          />
          {/* Text Readability Shadow - just a light tint in light mode (video stays visible), dark scrim in dark mode */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-white/10 to-transparent dark:from-black/75 dark:via-black/25 dark:to-transparent pointer-events-none"></div>
        </div>

        {/* Hero Content - Left Aligned */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 w-full text-left space-y-6 pt-16">
          {/* Main Headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.05] max-w-3xl drop-shadow-lg">
            Retail & Supermarket <br className="hidden sm:block" />
            billing software
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-900 dark:text-slate-100 max-w-xl leading-relaxed font-medium [text-shadow:0_1px_16px_rgb(255_255_255_/_85%),0_1px_4px_rgb(255_255_255_/_90%)] dark:[text-shadow:0_1px_12px_rgb(0_0_0_/_70%)]">
            Run your retail store, supermarket, or mall effortlessly by streamlining every aspect of your business — from instant checkouts to multi-store inventory.
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Button
              onClick={() => navigate('/auth/register')}
              className="bg-blue-800 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase px-8 py-4 rounded-full shadow-2xl shadow-blue-800/40 hover:scale-105 transition-all"
            >
              GETTING STARTED
            </Button>
            <Button
              onClick={() => navigate('/auth/login')}
              className="bg-white/70 hover:bg-white text-slate-900 border border-black/10 dark:bg-black/70 dark:hover:bg-black dark:text-white dark:border-white/30 font-extrabold text-xs sm:text-sm tracking-wider uppercase px-8 py-4 rounded-full backdrop-blur-md hover:scale-105 transition-all"
            >
              REQUEST A DEMO
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section — Pure Light Off-White Theme Carousel (#FAFAFD) */}
      <section id="features" className="py-24 bg-[#FAFAFD] dark:bg-slate-900 text-slate-900 dark:text-white relative overflow-hidden transition-colors border-t border-slate-200/60">
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.08]"
          style={{ backgroundImage: "url('/bilix_b_logo.webp')", backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="max-w-4xl mx-auto px-4 text-center mb-6 relative z-10">
          <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-blue-800 bg-blue-100/90 border border-blue-200 px-4 py-1.5 rounded-full mb-4 shadow-sm">
            EXPLORE POS BENEFITS
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.2] mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Benefits of Bilix as your
            <br /><em>supermarket billing POS</em>
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Everything you need to streamline checkouts, eliminate queues, and manage your supermarket or retail stores efficiently.
          </p>
        </div>

        <Carousel
          items={[
            {
              category: "SMART INVENTORY",
              title: "Never run out. Stock alerts fire before shelves go empty.",
              src: "/zs-supermarket-benefits-image-2-2x.webp",
              content: (
                <div className="space-y-4">
                  <p className="text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed">
                    Bilix POS continuously monitors inventory across all product categories in real time. Receive automated reorder notifications before high-demand items run out, track expiry dates for fresh produce, and run instant barcode stock audits.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <h5 className="font-bold text-slate-900 dark:text-white text-base mb-1">Automated Reorder Triggers</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Set min/max threshold triggers to automatically generate purchase orders for suppliers.</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <h5 className="font-bold text-slate-900 dark:text-white text-base mb-1">Batch & Expiry Management</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Track batch numbers and shelf life to eliminate food & product wastage.</p>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              category: "FULL PLATFORM VIEW",
              title: "One dashboard. Every sale, every product, every insight.",
              src: "/hero_new.png",
              content: (
                <div className="space-y-4">
                  <p className="text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed">
                    The Bilix command center gives you a live view of your entire retail operation — from the POS terminal screen to your inventory levels, sales graphs, and connected payment terminals. Everything in one place.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/40 shadow-sm">
                      <h5 className="font-bold text-blue-900 dark:text-blue-200 text-base mb-1">Unified POS Dashboard</h5>
                      <p className="text-xs text-blue-700 dark:text-blue-300">Monitor live sales, receipts, and inventory from a single Bilix dashboard screen.</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/40 shadow-sm">
                      <h5 className="font-bold text-blue-900 dark:text-blue-200 text-base mb-1">Connected Payment Terminal</h5>
                      <p className="text-xs text-blue-700 dark:text-blue-300">NFC, UPI, card, and cash all flow into one receipt — no manual reconciliation needed.</p>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              category: "SPEED AT CHECKOUT",
              title: "Scan, pay, done — queues vanish in seconds.",
              src: "/zs-supermarket-benefits-image-3-2x.webp",
              content: (
                <div className="space-y-4">
                  <p className="text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed">
                    Process billing transactions in sub-second speed with high-volume barcode scanning and multi-mode payment collection. Seamlessly accept UPI, Razorpay QR codes, Credit/Debit cards, and Cash.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <h5 className="font-bold text-slate-900 dark:text-white text-base mb-1">Dynamic UPI & QR Codes</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Generates instant payment QR code right on cashier screen for zero-friction payment.</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <h5 className="font-bold text-slate-900 dark:text-white text-base mb-1">Thermal & WhatsApp Receipts</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Print instant thermal receipts or send digital paperless receipts via SMS/WhatsApp.</p>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              category: "CHAIN MANAGEMENT",
              title: "Run ten stores from one screen. Centrally. Cleanly.",
              src: "/zs-supermarket-benefits-image-4-2x.webp",
              content: (
                <div className="space-y-4">
                  <p className="text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed">
                    Managing 2 or 50 branches? Bilix gives super admins centralized control over multi-store product catalogs, pricing rules, tax settings, and stock transfers from a single unified cloud portal.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <h5 className="font-bold text-slate-900 dark:text-white text-base mb-1">Inter-Store Stock Transfers</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Move excess inventory between branches seamlessly with real-time transfer tracking.</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <h5 className="font-bold text-slate-900 dark:text-white text-base mb-1">Centralized Price Updates</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Update item prices or launch discounts across all stores in one single click.</p>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              category: "CASH ACCOUNTABILITY",
              title: "Every rupee tracked. Every shift closed without a gap.",
              src: "/zs-supermarket-benefits-image-5-2x.webp",
              content: (
                <div className="space-y-4">
                  <p className="text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed">
                    Ensure 100% cashier accountability with shift-based register drawer reconciliation. Track opening cash, cash drops, card totals, and manager approvals for voids and refunds.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <h5 className="font-bold text-slate-900 dark:text-white text-base mb-1">Shift Closing Reconciliation</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Automated end-of-day till reports comparing physical cash count with register ledger.</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <h5 className="font-bold text-slate-900 dark:text-white text-base mb-1">Role-Based Cashier Security</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Restrict price overrides, discounts, and register opening to authorized managers.</p>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              category: "HARDWARE SYNC",
              title: "Weigh it. Scan it. Bill it — in one fluid motion.",
              src: "/pos_weighing_scale.png",
              content: (
                <div className="space-y-4">
                  <p className="text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed">
                    Instantly weigh fresh fruits, vegetables, and bulk grains at the billing counter with direct weighing scale integration into Bilix POS, automatically calculating exact weights and prices.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <h5 className="font-bold text-slate-900 dark:text-white text-base mb-1">Auto Weight Fetching</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Eliminates manual weight entry errors with sub-gram scale hardware integration.</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <h5 className="font-bold text-slate-900 dark:text-white text-base mb-1">Embedded Barcode Printing</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Print price-embedded barcodes for pre-packed items at your weighing stations.</p>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              category: "ALWAYS ONLINE",
              title: "No internet? No problem. Billing never stops.",
              src: "/pos_offline_sync.png",
              content: (
                <div className="space-y-4">
                  <p className="text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed">
                    Never lose a sale due to poor internet connection. Bilix POS stores all local billing transactions securely on the terminal and auto-synchronizes with the cloud as soon as connection is restored.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <h5 className="font-bold text-slate-900 dark:text-white text-base mb-1">100% Offline Billing</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Keep registers running and bills printing even without Wi-Fi connection.</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <h5 className="font-bold text-slate-900 dark:text-white text-base mb-1">Background Cloud Sync</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Automatic background sync resolves duplicate invoices and updates stock levels globally.</p>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              category: "LIVE ANALYTICS",
              title: "See profit margins move — in real time, on any device.",
              src: "/pos_analytics_card.png",
              content: (
                <div className="space-y-4">
                  <p className="text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed">
                    Make data-backed decisions with Bilix live analytics. Monitor peak hour store traffic, top grossing categories, gross profit margins, and sales rep performance right from your mobile device.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <h5 className="font-bold text-slate-900 dark:text-white text-base mb-1">Live Executive Dashboard</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Real-time revenue stream tracking with visual charts updated every minute.</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <h5 className="font-bold text-slate-900 dark:text-white text-base mb-1">Automated GST & P&L Reports</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Receive automated daily P&L and GST tax summaries delivered directly to your inbox.</p>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              category: "LOYALTY & CRM",
              title: "Customers come back. Because Bilix remembers them.",
              src: "/customer_loyalty_card.png",
              content: (
                <div className="space-y-4">
                  <p className="text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed">
                    Turn one-time shoppers into lifelong loyal customers. Bilix automatically tracks purchase history by customer phone number, awards loyalty points, and enables instant point redemption at billing.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <h5 className="font-bold text-slate-900 dark:text-white text-base mb-1">Instant Reward Redemption</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Shoppers redeem saved reward points as instant cash discounts at checkout.</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <h5 className="font-bold text-slate-900 dark:text-white text-base mb-1">Personalized SMS Offers</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Send custom discount vouchers to inactive customers to drive repeat store footfall.</p>
                    </div>
                  </div>
                </div>
              ),
            },
          ].map((card, idx) => (
            <AppleCard key={card.title} card={card} index={idx} />
          ))}
        />
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F0F4FB] dark:bg-[#0C1424] transition-colors">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span
              className="inline-block text-xs font-extrabold uppercase tracking-widest text-blue-700 dark:text-blue-300 bg-blue-500/10 border border-blue-500/30 px-4 py-1.5 rounded-full mb-4"
              style={{ fontFamily: "'JetBrains Mono', 'Monaco', monospace" }}
            >
              PRICING
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Choose the plan that best fits your business needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <CometCard key={plan.name}>
                <div className="relative h-full rounded-2xl border border-black/10 dark:border-white/10 p-2">
                  <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={2}
                  />
                  <div
                    className={`relative flex h-full flex-col rounded-xl p-8 ${plan.popular ? 'bg-white dark:bg-slate-900' : 'bg-white/70 dark:bg-slate-900/70'
                      }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-600/30">
                        Most Popular
                      </span>
                    )}
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <div className="mb-6">
                      <span className="text-4xl font-black text-slate-900 dark:text-white">
                        {plan.price}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">{plan.period}</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                          <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full ${plan.popular
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white'
                        }`}
                      onClick={() => navigate('/auth/register')}
                    >
                      Get Started
                    </Button>
                  </div>
                </div>
              </CometCard>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why-us" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#E9EFFA] dark:bg-[#0A101E] transition-colors">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span
              className="inline-block text-xs font-extrabold uppercase tracking-widest text-blue-700 dark:text-blue-300 bg-blue-500/10 border border-blue-500/30 px-4 py-1.5 rounded-full mb-4"
              style={{ fontFamily: "'JetBrains Mono', 'Monaco', monospace" }}
            >
              WHY BILIX
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
              Why teams switch to Bilix
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              No pricing tricks, no fine print — just the things most other POS platforms make you live without.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: 'No Setup Fees',
                description: 'Start billing today. No onboarding cost, no hidden charges to get going.',
              },
              {
                icon: Shield,
                title: 'Works Without Internet',
                description: "Most platforms stop cold on a dropped connection. Bilix keeps billing and syncs later.",
              },
              {
                icon: Store,
                title: 'Built for Chains from Day One',
                description: 'Run 2 branches or 200 from one dashboard — no extra charge per location.',
              },
              {
                icon: Users,
                title: 'Real Human Support',
                description: "Talk to a person, not a ticket queue, whenever something breaks.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] p-6"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                  <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#E2E9F7] dark:bg-[#080D19] overflow-hidden transition-colors">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Trusted by businesses worldwide
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <InfiniteMovingCards
            items={testimonials.map((t) => ({
              quote: t.content,
              name: t.name,
              title: `${t.role}, ${t.company}`,
            }))}
            direction="right"
            speed="slow"
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#DCE4F5] dark:bg-[#060A14] transition-colors">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <span
              className="inline-block text-xs font-extrabold uppercase tracking-widest text-blue-700 dark:text-blue-300 bg-blue-500/10 border border-blue-500/30 px-4 py-1.5 rounded-full mb-4"
              style={{ fontFamily: "'JetBrains Mono', 'Monaco', monospace" }}
            >
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3">
              Questions, answered.
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Everything you need to know before you switch to Bilix.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index
              return (
                <div
                  key={faq.question}
                  className={`rounded-2xl border transition-colors ${isOpen ? 'border-blue-600/50 bg-white dark:bg-slate-900' : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50'
                    }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 p-6 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="text-sm font-bold text-blue-600 dark:text-blue-400"
                        style={{ fontFamily: "'JetBrains Mono', 'Monaco', monospace" }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">{faq.question}</span>
                    </div>
                    <Plus
                      className={`h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''
                        }`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                      }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-6 pl-[3.25rem] text-slate-600 dark:text-slate-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-slate-950 overflow-hidden">
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Ready to Transform Your Business?
          </h2>
          <p className="text-lg text-blue-100 mb-10 max-w-xl mx-auto">
            Join thousands of retail stores and supermarkets using Bilix to streamline operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-lg px-8 py-6 rounded-full shadow-xl hover:scale-105 transition-all"
              asChild
            >
              <Link to="/auth/register">
                Start Free Trial
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-blue-700 font-extrabold text-lg px-8 py-6 rounded-full"
              asChild
            >
              <a href="#contact">
                Contact Sales
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="relative overflow-hidden pt-20 pb-4 px-4 sm:px-6 lg:px-8 bg-[#D6E0F3] dark:bg-[#04070F] border-t border-slate-200 dark:border-white/10 transition-colors"
      >
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="border-t border-slate-200 dark:border-white/10 pt-10" />
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-12 pb-24">
            {/* Logo + Copyright */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/bilix_logo.png" alt="Bilix" className="h-9 w-9 object-contain rounded-lg bg-black p-0.5 border border-black/10 dark:border-white/10" />
                <span className="text-xl font-black text-slate-900 dark:text-white">Bilix</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                © 2026 Bilix POS System. All rights reserved.
              </p>
            </div>

            {/* Link Columns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Pages</h4>
                <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
                  <li><a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a></li>
                  <li><a href="#pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pricing</a></li>
                  <li><a href="#testimonials" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Testimonials</a></li>
                  <li><a href="#faq" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">FAQ</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Company</h4>
                <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
                  <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</a></li>
                  <li><a href="#contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Legal</h4>
                <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
                  <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Cookie Policy</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Account</h4>
                <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
                  <li>
                    <button onClick={() => navigate('/auth/register')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                      Sign Up
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/auth/login')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                      Login
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Giant bleeding wordmark accent */}
        <div aria-hidden="true" className="w-full overflow-hidden pointer-events-none select-none">
          <span className="block pl-4 sm:pl-8 font-black text-[22vw] sm:text-[16vw] leading-[0.75] tracking-tight text-slate-900/[0.04] dark:text-white/[0.05] whitespace-nowrap">
            Bilix
          </span>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

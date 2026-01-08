import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  Menu,
  X,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [featuresOpen, setFeaturesOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const navigate = useNavigate()
  const { darkMode, toggleTheme } = useTheme()

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

  const pricingPlans = [
    {
      name: 'Basic Plan',
      price: '$1,299',
      period: '/month',
      features: [
        'Up to 10 branches',
        'Up to 50 users',
        'Up to 1,000 products',
        'API integrations',
        'Advanced reporting',
        'Email support',
      ],
      popular: false,
    },
    {
      name: 'Pro Plan',
      price: '$2,999',
      period: '/month',
      features: [
        'Up to 100 branches',
        'Up to 500 users',
        'Up to 9,000 products',
        'Shift management',
        'Priority support',
        'All Basic features',
      ],
      popular: true,
    },
    {
      name: 'Advance Plan',
      price: '$4,999',
      period: '/month',
      features: [
        'Up to 400 branches',
        'Up to 5,000 users',
        'Up to 50,000 products',
        'Custom integrations',
        'Dedicated support',
        'All Pro features',
      ],
      popular: false,
    },
  ]

  const testimonials = [
    {
      name: 'John Smith',
      role: 'Store Manager',
      company: 'Retail Chain Inc.',
      content: 'This POS system has transformed our operations. The real-time analytics help us make better decisions.',
      rating: 5,
    },
    {
      name: 'Sarah Johnson',
      role: 'Operations Director',
      company: 'Supermarket Group',
      content: 'The multi-store management feature is a game-changer. We can now manage all our locations from one dashboard.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'CEO',
      company: 'Mall Corporation',
      content: 'Best investment we made. The system pays for itself with the efficiency gains.',
      rating: 5,
    },
  ]

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white dark:bg-gray-900 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">POS Pro</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <div className="relative group">
                <button className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                  Features
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-2">
                    <a href="#features" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                      All Features
                    </a>
                    <a href="#pricing" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                      Pricing
                    </a>
                  </div>
                </div>
              </div>
              <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                Pricing
              </a>
              <a href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                Testimonials
              </a>
              <div className="relative group">
                <button className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                  Resources
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-2">
                    <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                      Documentation
                    </a>
                    <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                      API Reference
                    </a>
                  </div>
                </div>
              </div>
              <a href="#contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                Contact
              </a>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <Button
                variant="ghost"
                onClick={() => navigate('/auth/login')}
                className="hidden sm:flex"
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate('/auth/register')}
                className="bg-blue-600 hover:bg-blue-700 text-white hidden sm:flex"
              >
                Request Demo
              </Button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4 py-4 space-y-2">
              <a href="#features" className="block py-2">Features</a>
              <a href="#pricing" className="block py-2">Pricing</a>
              <a href="#testimonials" className="block py-2">Testimonials</a>
              <a href="#contact" className="block py-2">Contact</a>
              <Button
                variant="ghost"
                onClick={() => navigate('/auth/login')}
                className="w-full"
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate('/auth/register')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Request Demo
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* New Feature Banner */}
      <div className="bg-gray-100 dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              🎉 New Feature: Multi-store Management Now Available
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Powerful POS System For{' '}
            <span className="text-blue-600 dark:text-blue-400">
              Malls, Supermarkets & Retail Chains
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Manage billing, inventory, staff, and reports—all in one system. Streamline your
            operations and boost your business growth.
          </p>

          {/* Feature Highlights */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {feature.title}
                  </span>
                </div>
              )
            })}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/auth/register')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-2"
            >
              Watch Demo Video <Play className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Run Your Business
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comprehensive features designed to streamline your operations and drive growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Store,
                title: 'Multi-Store Management',
                description: 'Manage unlimited stores and branches from a single dashboard',
              },
              {
                icon: Users,
                title: 'Employee Management',
                description: 'Track staff, assign roles, and manage permissions easily',
              },
              {
                icon: BarChart3,
                title: 'Real-time Analytics',
                description: 'Get instant insights with comprehensive reports and dashboards',
              },
              {
                icon: ShoppingCart,
                title: 'Fast Checkout',
                description: 'Streamlined POS interface for quick and efficient transactions',
              },
              {
                icon: TrendingUp,
                title: 'Sales Tracking',
                description: 'Monitor sales trends, top products, and revenue analytics',
              },
              {
                icon: Shield,
                title: 'Secure & Compliant',
                description: 'Enterprise-grade security with GST and tax compliance built-in',
              },
              {
                icon: Zap,
                title: 'Inventory Management',
                description: 'Track stock levels, set alerts, and manage product catalogs',
              },
              {
                icon: FileText,
                title: 'Reports & Exports',
                description: 'Generate detailed reports and export data in multiple formats',
              },
              {
                icon: CheckCircle2,
                title: '24/7 Support',
                description: 'Round-the-clock customer support to help you succeed',
              },
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Flexible pricing plans to suit businesses of all sizes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative border-2 ${
                  plan.popular
                    ? 'border-blue-600 dark:border-blue-400 shadow-xl scale-105'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-700 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => navigate('/auth/register')}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Trusted by businesses worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600 dark:bg-blue-700">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Join thousands of businesses using POS Pro to streamline their operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/auth/register')}
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6"
            >
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-300">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">POS Pro</span>
              </div>
              <p className="text-sm">
                Powerful POS system for modern retail businesses
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-blue-400">Features</a></li>
                <li><a href="#pricing" className="hover:text-blue-400">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-400">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400">About</a></li>
                <li><a href="#" className="hover:text-blue-400">Blog</a></li>
                <li><a href="#contact" className="hover:text-blue-400">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-400">API Docs</a></li>
                <li><a href="#" className="hover:text-blue-400">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2024 POS Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage


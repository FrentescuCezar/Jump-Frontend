"use client"

import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Bot,
  FileText,
  Share2,
  Video,
  Sparkles,
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "motion/react"
import CalendarSyncAnimation from "./CalendarSyncAnimation"
import { useLocale } from "next-intl"

export default function HomePage() {
  const locale = useLocale()
  const signupHref = `/${locale}/signup`
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { scrollYProgress } = useScroll()

  // Transform values for parallax scroll effects
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -300])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150])
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 200])
  const scale1 = useTransform(scrollYProgress, [0, 0.5], [1, 1.5])
  const opacity1 = useTransform(scrollYProgress, [0, 0.3, 0.6], [1, 0.8, 0])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#1a0a2e] to-[#0f0520] text-white relative"
      style={{ zoom: 0.88 }}
    >
      {/* Animated background with parallax orbs and floating calendars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-10 bg-gradient-to-r from-purple-500 to-blue-500 -top-40 -left-20"
          animate={{
            x: mousePosition.x / 30,
            y: mousePosition.y / 30,
          }}
          transition={{
            x: { type: "spring", stiffness: 50, damping: 30 },
            y: { type: "spring", stiffness: 50, damping: 30 },
          }}
        />

        <motion.div
          style={{ y: y2 }}
          className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-15 bg-gradient-to-r from-cyan-500 to-teal-500 right-0 top-1/4"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          style={{ y: y3 }}
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-10 bg-gradient-to-r from-pink-500 to-purple-500 left-1/3 top-2/3"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <FloatingMonthCalendar delay={0} xOffset={10} yOffset={5} />
        <FloatingWeekCalendar delay={2} xOffset={75} yOffset={8} />
      </div>

      {/* Hero Section with immersive content */}
      <section className="relative z-10 container mx-auto px-6 lg:px-12 py-20 lg:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h1
            className="text-6xl lg:text-8xl font-bold mb-8 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              Your Calendars.
            </span>
            <br />
            <TypewriterMeetingPlatform />
            <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              .
            </span>
            <br />
            <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              Infinite Insights.
            </span>
          </motion.h1>

          <motion.p
            className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            Aggregate multiple Google Calendars. Deploy AI bots to your
            meetings. Get instant transcripts, emails, and social content, all
            automatically.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <Link href={signupHref}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-purple-500/50 group"
                >
                  View Calendars
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>
            <Link href={signupHref}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-transparent text-white hover:bg-white/10 backdrop-blur-xl"
                >
                  Watch Demo
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Calendar Sync Animation - main visual centerpiece */}
          <CalendarSyncAnimation />
        </div>
      </section>

      {/* Interactive scroll-based feature showcase */}
      <section className="relative z-10 min-h-screen flex items-center justify-center py-32">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  One Platform.
                  <br />
                  Every Calendar.
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed mb-8">
                  Stop switching between tabs. Connect all your Google Calendars
                  and see everything in one beautiful dashboard. Color-coded,
                  organized, and always in sync.
                </p>
                <Link href={signupHref}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-purple-500/50 bg-transparent text-white hover:bg-purple-500/10"
                  >
                    Explore Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 0.8 }}
                className="relative h-[400px]"
              >
                {/* Floating stacked calendar cards */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute w-full glass-card border border-white/20 backdrop-blur-xl bg-white/5 rounded-2xl p-6"
                    style={{
                      top: `${i * 40}px`,
                      left: `${i * 20}px`,
                      zIndex: 3 - i,
                    }}
                    initial={{ opacity: 0, y: 50, rotate: i * 5 }}
                    whileInView={{ opacity: 1 - i * 0.2, y: 0, rotate: i * 3 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.6, delay: i * 0.2 }}
                    whileHover={{ y: -10, rotate: 0, opacity: 1, zIndex: 10 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-3 h-3 rounded-full ${["bg-purple-500", "bg-cyan-500", "bg-pink-500"][i]}`}
                      />
                      <span className="text-sm font-semibold">
                        {["Work Calendar", "Personal", "Family"][i]}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {[...Array(3)].map((_, j) => (
                        <div
                          key={j}
                          className="h-2 bg-white/10 rounded"
                          style={{ width: `${70 - j * 15}%` }}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Bot feature with visual demonstration */}
      <section className="relative z-10 min-h-screen flex items-center justify-center py-32">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 0.8 }}
                className="order-2 lg:order-1 relative h-[400px]"
              >
                {/* Animated bot joining meeting visualization */}
                <motion.div
                  className="glass-card border border-cyan-500/30 backdrop-blur-xl bg-cyan-500/5 rounded-3xl p-8 relative overflow-hidden"
                  whileInView={{ boxShadow: "0 0 60px rgba(6, 182, 212, 0.3)" }}
                  viewport={{ once: false }}
                >
                  <motion.div
                    className="absolute top-4 right-4"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </motion.div>

                  <div className="text-sm font-semibold mb-6 text-cyan-300">
                    Meeting in Progress
                  </div>

                  <div className="space-y-4">
                    {["Recording...", "Transcribing...", "Analyzing..."].map(
                      (text, i) => (
                        <motion.div
                          key={i}
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: false }}
                          transition={{ duration: 0.5, delay: i * 0.3 }}
                        >
                          <motion.div
                            className="w-2 h-2 rounded-full bg-cyan-400"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.3,
                            }}
                          />
                          <span className="text-gray-300">{text}</span>
                        </motion.div>
                      ),
                    )}
                  </div>

                  <motion.div
                    className="mt-8 h-24 bg-white/5 rounded-xl p-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  >
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="h-1.5 bg-white/20 rounded"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${90 - i * 20}%` }}
                          viewport={{ once: false }}
                          transition={{ duration: 1, delay: 1 + i * 0.2 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 0.8 }}
                className="order-1 lg:order-2"
              >
                <h2 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  AI That
                  <br />
                  Never Misses
                  <br />A Beat.
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed mb-8">
                  Your AI bot automatically joins every meeting on Zoom, Teams,
                  or Google Meet. It records, transcribes, and generates
                  actionable insights—all while you focus on the conversation.
                </p>
                <Link href={signupHref}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-cyan-500/50 bg-transparent text-white hover:bg-cyan-500/10"
                  >
                    See How It Works
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content generation showcase */}
      <section className="relative z-10 min-h-screen flex items-center justify-center py-32">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            className="max-w-5xl mx-auto text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              From Meeting
              <br />
              To Marketing
              <br />
              In Seconds.
            </h2>
            <p className="text-2xl text-gray-300 mb-16 max-w-3xl mx-auto leading-relaxed">
              Turn your meetings into polished content. Generate transcripts,
              draft follow-up emails, and create social posts for LinkedIn and
              Facebook,automatically.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Transcript",
                  color: "from-purple-500 to-purple-600",
                  delay: 0,
                  placeholder: [
                    "Sarah: Let's review the Q1 timeline...",
                    "Mike: We're on track for delivery...",
                    "Sarah: What about the API integration?",
                    "Mike: Should be ready by next week.",
                  ],
                },
                {
                  title: "Email Draft",
                  color: "from-cyan-500 to-cyan-600",
                  delay: 0.2,
                  placeholder: [
                    "Hi team,",
                    "Following up on today's meeting...",
                    "Key points discussed:",
                    "Looking forward to...",
                  ],
                },
                {
                  title: "Social Post",
                  color: "from-pink-500 to-pink-600",
                  delay: 0.4,
                  placeholder: [
                    "Excited to share insights from...",
                    "Key takeaways:",
                    "Grateful for the collaboration...",
                    "#TeamWork #Innovation",
                  ],
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="glass-card p-6 rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5"
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: item.delay }}
                  whileHover={{ y: -10, scale: 1.05 }}
                >
                  <div className="h-40 rounded-xl bg-gradient-to-br from-gray-800/30 to-gray-900/30 mb-4 p-4 overflow-hidden relative">
                    <div className="space-y-2 h-full flex flex-col justify-center">
                      {item.placeholder.map((line, lineIdx) => (
                        <motion.div
                          key={lineIdx}
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: false }}
                          transition={{
                            duration: 0.5,
                            delay: item.delay + lineIdx * 0.3,
                          }}
                        >
                          <motion.div
                            className="w-1.5 h-1.5 rounded-full bg-purple-400"
                            animate={{
                              opacity: [0.3, 1, 0.3],
                              scale: [1, 1.2, 1],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: item.delay + lineIdx * 0.3,
                            }}
                          />
                          <span className="text-xs text-gray-400 font-mono">
                            {line}
                            {lineIdx === item.placeholder.length - 1 && (
                              <motion.span
                                animate={{ opacity: [1, 0, 1] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                                className="ml-1"
                              >
                                |
                              </motion.span>
                            )}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-10 pointer-events-none`}
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-green-400"
                      animate={{
                        opacity: [0.5, 1, 0.5],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <p className="text-sm text-gray-400">Generating...</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-6 lg:px-12 py-32">
        <motion.div
          className="glass-card p-12 lg:p-16 rounded-3xl border border-white/10 backdrop-blur-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.02 }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Transform Your Meetings?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join thousands of teams already using Jump to save time and boost
            productivity.
          </p>
          <Link href={signupHref}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-purple-500/50"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </section>

      <footer className="relative z-10 border-t border-white/10 mt-20 py-8">
        <div className="container mx-auto px-6 lg:px-12 text-center text-gray-400 text-sm">
          © 2025 Jump. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

function FloatingMonthCalendar({
  delay,
  xOffset,
  yOffset,
}: {
  delay: number
  xOffset: number
  yOffset: number
}) {
  return (
    <motion.div
      className="absolute w-56 h-64 glass-card border border-white/20 backdrop-blur-xl bg-white/5 rounded-2xl p-4 shadow-2xl"
      style={{
        left: `${xOffset}%`,
        top: `${yOffset}%`,
      }}
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{
        opacity: 1,
        y: [0, -20, 0],
        scale: 1,
        rotateZ: [-2, 2, -2],
      }}
      transition={{
        opacity: { duration: 1, delay },
        scale: { duration: 1, delay },
        y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay },
        rotateZ: { duration: 8, repeat: Infinity, ease: "easeInOut", delay },
      }}
      whileHover={{ scale: 1.1, rotateZ: 0 }}
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
        <div className="text-xs font-semibold text-purple-300">
          November 2025
        </div>
        <Sparkles className="w-4 h-4 text-cyan-400" />
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-[8px] mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
          <div key={i} className="text-gray-400 font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
        {Array.from({ length: 30 }, (_, i) => (
          <motion.div
            key={i}
            className={`aspect-square flex items-center justify-center rounded ${
              i === 14 || i === 21
                ? "bg-gradient-to-br from-purple-500/30 to-cyan-500/30 text-white font-semibold"
                : "text-gray-400"
            }`}
            whileHover={{
              scale: 1.3,
              backgroundColor: "rgba(168, 85, 247, 0.2)",
            }}
          >
            {i + 1}
          </motion.div>
        ))}
      </div>

      {/* Event indicators */}
      <div className="mt-3 space-y-1.5">
        <motion.div
          className="h-1.5 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full opacity-60"
          initial={{ width: 0 }}
          animate={{ width: "75%" }}
          transition={{ duration: 1, delay: delay + 0.5 }}
        />
        <motion.div
          className="h-1.5 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full opacity-60"
          initial={{ width: 0 }}
          animate={{ width: "50%" }}
          transition={{ duration: 1, delay: delay + 0.7 }}
        />
        <motion.div
          className="h-1.5 bg-gradient-to-r from-pink-500 to-pink-400 rounded-full opacity-60"
          initial={{ width: 0 }}
          animate={{ width: "66%" }}
          transition={{ duration: 1, delay: delay + 0.9 }}
        />
      </div>
    </motion.div>
  )
}

function FloatingWeekCalendar({
  delay,
  xOffset,
  yOffset,
}: {
  delay: number
  xOffset: number
  yOffset: number
}) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"]
  return (
    <motion.div
      className="absolute w-64 h-48 glass-card border border-white/20 backdrop-blur-xl bg-white/5 rounded-2xl p-3 shadow-2xl"
      style={{
        left: `${xOffset}%`,
        top: `${yOffset}%`,
      }}
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{
        opacity: 1,
        x: [0, 15, 0],
        scale: 1,
        rotateY: [-5, 5, -5],
      }}
      transition={{
        opacity: { duration: 1, delay },
        scale: { duration: 1, delay },
        x: { duration: 7, repeat: Infinity, ease: "easeInOut", delay },
        rotateY: { duration: 10, repeat: Infinity, ease: "easeInOut", delay },
      }}
      whileHover={{ scale: 1.1, rotateY: 0 }}
    >
      {/* Week Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
        <div className="text-xs font-semibold text-purple-300">Week View</div>
        <Sparkles className="w-3 h-3 text-cyan-400" />
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-5 gap-1.5">
        {days.map((day, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="text-[8px] text-gray-400 font-medium text-center">
              {day}
            </div>
            <div className="text-[10px] text-center text-gray-300 font-semibold mb-1">
              {18 + i}
            </div>
            <div className="space-y-1">
              <motion.div
                className="h-4 bg-gradient-to-r from-purple-500/40 to-purple-400/40 rounded text-[6px] flex items-center justify-center text-white/80"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.5, delay: delay + i * 0.1 }}
                whileHover={{
                  scaleY: 1.2,
                  backgroundColor: "rgba(168, 85, 212, 0.6)",
                }}
              >
                9AM
              </motion.div>
              {i % 2 === 0 && (
                <motion.div
                  className="h-4 bg-gradient-to-r from-cyan-500/40 to-cyan-400/40 rounded text-[6px] flex items-center justify-center text-white/80"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.5, delay: delay + i * 0.1 + 0.2 }}
                  whileHover={{
                    scaleY: 1.2,
                    backgroundColor: "rgba(6, 182, 212, 0.6)",
                  }}
                >
                  2PM
                </motion.div>
              )}
              {i === 2 && (
                <motion.div
                  className="h-4 bg-gradient-to-r from-pink-500/40 to-pink-400/40 rounded text-[6px] flex items-center justify-center text-white/80"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.5, delay: delay + i * 0.1 + 0.4 }}
                  whileHover={{
                    scaleY: 1.2,
                    backgroundColor: "rgba(236, 72, 153, 0.6)",
                  }}
                >
                  4PM
                </motion.div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function TypewriterMeetingPlatform() {
  const platforms = [
    { name: "Zoom", color: "text-[#2D8CFF]" },
    { name: "Google Meet", color: "text-[#00C853]" },
    { name: "Teams", color: "text-[#6264A7]" },
  ]

  const [platformIndex, setPlatformIndex] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentPlatform = platforms[platformIndex].name
    const typingSpeed = isDeleting ? 50 : 100
    const pauseTime = 2000

    const timeout = setTimeout(() => {
      if (!isDeleting && displayText === currentPlatform) {
        setTimeout(() => setIsDeleting(true), pauseTime)
      } else if (isDeleting && displayText === "") {
        setIsDeleting(false)
        setPlatformIndex((prev) => (prev + 1) % platforms.length)
      } else {
        setDisplayText(
          isDeleting
            ? currentPlatform.substring(0, displayText.length - 1)
            : currentPlatform.substring(0, displayText.length + 1),
        )
      }
    }, typingSpeed)

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, platformIndex])

  return (
    <span className={platforms[platformIndex].color}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      >
        |
      </motion.span>
    </span>
  )
}

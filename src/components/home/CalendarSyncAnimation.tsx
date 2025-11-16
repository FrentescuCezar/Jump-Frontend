"use client"

import { motion } from "motion/react"
import { RefreshCw } from "lucide-react"
import Image from "next/image"

export default function CalendarSyncAnimation() {
  const apps = [
    {
      name: "Google Meet",
      icon: "/icons/Meet.svg",
      position: { x: -250, y: -150 },
    },
    {
      name: "Zoom",
      icon: "/icons/Zoom.svg",
      position: { x: 250, y: -150 },
    },
    {
      name: "Microsoft Teams",
      icon: "/icons/Teams.svg",
      position: { x: -250, y: 150 },
    },
    {
      name: "Recall",
      icon: "/icons/Recall.svg",
      position: { x: 260, y: 150 },
    },
  ]

  return (
    <div className="relative w-full h-[500px] my-32 flex items-center justify-center">
      {/* Center Calendar */}
      <motion.div
        className="absolute z-20 w-32 h-32 flex items-center justify-center select-none"
        initial={{ scale: 0, rotate: -180 }}
        animate={{
          scale: 1,
          rotate: 0,
        }}
        transition={{
          duration: 1,
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        <Image
          src="/icons/Calendar.svg"
          alt="Calendar"
          width={128}
          height={128}
          className="w-full h-full object-contain select-none"
          draggable={false}
          style={
            {
              userSelect: "none",
              pointerEvents: "none",
              WebkitUserDrag: "none",
            } as React.CSSProperties
          }
          unoptimized
        />
      </motion.div>

      {/* Rotating Sync Icon */}
      <motion.div
        className="absolute z-30 w-8 h-8 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center"
        style={{
          left: "50%",
          top: "50%",
          x: "-50%",
          y: "60%",
          marginTop: "-80px",
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <RefreshCw className="w-6 h-6 text-purple-400" />
      </motion.div>

      {/* Connected Apps */}
      {apps.map((app, index) => {
        let size = 64 // Default size for Meet and Teams
        let className = "w-16 h-16"

        if (app.name === "Zoom") {
          size = 72
          className = "w-[72px] h-[72px]"
        } else if (app.name === "Recall") {
          size = 112
          className = "w-28 h-28"
        }

        const halfSize = size / 2

        return (
          <div key={index}>
            {/* App Icon */}
            <motion.div
              className={`absolute ${className} flex items-center justify-center select-none`}
              style={{
                left: "50%",
                top: "50%",
                x: app.position.x - halfSize,
                y: app.position.y - halfSize,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: [
                  app.position.y - halfSize,
                  app.position.y - halfSize - 4,
                  app.position.y - halfSize,
                ],
              }}
              transition={{
                scale: { duration: 0.5, delay: index * 0.2 },
                opacity: { duration: 0.5, delay: index * 0.2 },
                y: {
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.3,
                },
              }}
              whileHover={{ scale: 1.15, rotate: 5 }}
            >
              <Image
                src={app.icon}
                alt={app.name}
                width={size}
                height={size}
                className="w-full h-full object-contain select-none"
                draggable={false}
                style={
                  {
                    userSelect: "none",
                    pointerEvents: "none",
                    WebkitUserDrag: "none",
                  } as React.CSSProperties
                }
                unoptimized
              />
            </motion.div>

            {/* Animated Sync Particles */}
            <motion.div
              className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400"
              style={{
                left: "50%",
                top: "50%",
              }}
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 0,
              }}
              animate={{
                x: [0, app.position.x * 0.5, app.position.x],
                y: [0, app.position.y * 0.5, app.position.y],
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: index * 0.5,
                ease: "easeInOut",
              }}
            />
          </div>
        )
      })}

      {/* Title */}
      <motion.div
        className="absolute -bottom-20 left-1/2 -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          One Dashboard, All Your Calendars
        </h3>
        <p className="text-gray-400 mt-2">Seamlessly syncing in real-time</p>
      </motion.div>
    </div>
  )
}

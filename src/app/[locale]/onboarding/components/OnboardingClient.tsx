"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Calendar,
  Check,
  Facebook,
  Linkedin,
  RefreshCw,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { onboardingSteps } from "@/features/onboarding/constants/stepConfig"
import { automationTemplateConfig } from "@/features/onboarding/constants/automationTemplates"
import { getGoogleAccountColor } from "@/features/onboarding/constants/googleAccountColors"
import { useOnboardingState } from "@/features/onboarding/hooks/useOnboardingState"
import type { IntegrationProvider } from "@/features/onboarding/types"
import {
  disconnectConnectedAccountAction,
  getIntegrationOAuthUrlAction,
  updateOnboardingPreferencesAction,
} from "../actions"

type OnboardingClientProps = {
  locale: string
}

type AutomationState = {
  autoJoinMeetings: boolean
  generateTranscripts: boolean
  createEmailDrafts: boolean
  generateSocialPosts: boolean
}

const defaultAutomationState: AutomationState = {
  autoJoinMeetings: true,
  generateTranscripts: true,
  createEmailDrafts: true,
  generateSocialPosts: false,
}

export default function OnboardingClient({ locale }: OnboardingClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data, isLoading, refetch, isFetching } = useOnboardingState({
    locale,
  })
  const [step, setStep] = useState(1)
  const [automationState, setAutomationState] = useState(defaultAutomationState)
  const [leadMinutes, setLeadMinutes] = useState<[number]>([5])
  const [isSaving, setIsSaving] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [connectingProvider, setConnectingProvider] =
    useState<IntegrationProvider | null>(null)
  const [removingAccountId, setRemovingAccountId] = useState<string | null>(
    null,
  )
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoCompleteHandledRef = useRef(false)
  const status = searchParams.get("status")

  const startCompletionFlow = useCallback(() => {
    setIsCompleting(true)
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current)
    }
    redirectTimeoutRef.current = setTimeout(() => {
      router.push(`/${locale}/meetings`)
    }, 2200)
  }, [locale, router])

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!data) {
      return
    }
    setLeadMinutes([data.meetingPreference.leadMinutes])
    setAutomationState({
      autoJoinMeetings: data.meetingPreference.defaultNotetaker,
      generateTranscripts: data.automationPreferences.generateTranscripts,
      createEmailDrafts: data.automationPreferences.createEmailDrafts,
      generateSocialPosts: data.automationPreferences.generateSocialPosts,
    })
  }, [data])

  const googleAccounts = useMemo(() => {
    if (!data) return []
    return data.googleAccounts.map((account, index) => ({
      ...account,
      color: getGoogleAccountColor(index),
    }))
  }, [data])

  const canContinue =
    step === 1 ? googleAccounts.length > 0 : step === 3 ? true : true

  const handlePrev = () => {
    setStep((prev) => Math.max(1, prev - 1))
  }

  const handleNext = () => {
    if (step === onboardingSteps.length) {
      void completeOnboarding()
      return
    }
    if (step === 1 && !canContinue) {
      return
    }
    setStep((prev) => Math.min(onboardingSteps.length, prev + 1))
  }

  const handleSkip = () => {
    if (step === 1) return
    if (step === onboardingSteps.length) {
      void completeOnboarding()
    } else {
      setStep((prev) => Math.min(onboardingSteps.length, prev + 1))
    }
  }

  const completeOnboarding = useCallback(async () => {
    if (!data) return false
    setIsSaving(true)
    try {
      await updateOnboardingPreferencesAction({
        locale,
        leadMinutes: leadMinutes[0] ?? data.meetingPreference.leadMinutes,
        autoJoinMeetings: automationState.autoJoinMeetings,
        generateTranscripts: automationState.generateTranscripts,
        createEmailDrafts: automationState.createEmailDrafts,
        generateSocialPosts: automationState.generateSocialPosts,
        completeOnboarding: true,
      })
      await refetch()
      startCompletionFlow()
      return true
    } catch (error) {
      console.error("Failed to complete onboarding", error)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [
    automationState.autoJoinMeetings,
    automationState.createEmailDrafts,
    automationState.generateSocialPosts,
    automationState.generateTranscripts,
    data,
    leadMinutes,
    locale,
    refetch,
    startCompletionFlow,
  ])

  useEffect(() => {
    if (status !== "success") {
      return
    }
    if (!data || !data.hasGoogleCalendar) {
      return
    }
    if (autoCompleteHandledRef.current || isSaving || isCompleting) {
      return
    }
    autoCompleteHandledRef.current = true

    if (data.isComplete) {
      startCompletionFlow()
      return
    }

    void (async () => {
      const success = await completeOnboarding()
      if (!success) {
        autoCompleteHandledRef.current = false
      }
    })()
  }, [
    completeOnboarding,
    data,
    isCompleting,
    isSaving,
    startCompletionFlow,
    status,
  ])

  const handleConnect = async (provider: IntegrationProvider) => {
    setConnectingProvider(provider)
    try {
      const { url } = await getIntegrationOAuthUrlAction({
        provider,
        redirectPath: `/${locale}/onboarding`,
        locale,
      })
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error(`Failed to start ${provider} OAuth`, error)
    } finally {
      setConnectingProvider(null)
    }
  }

  const handleDisconnect = async (accountId: string) => {
    setRemovingAccountId(accountId)
    try {
      await disconnectConnectedAccountAction({ accountId, locale })
      await refetch()
    } catch (error) {
      console.error("Failed to disconnect account", error)
    } finally {
      setRemovingAccountId(null)
    }
  }

  const isConnectDisabled = (provider: IntegrationProvider) =>
    connectingProvider === provider || isFetching

  const isLinkedinConnected = data?.socialConnections.linkedin ?? false
  const isFacebookConnected = data?.socialConnections.facebook ?? false

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#1a0a2e] to-[#0f0520] text-white overflow-hidden relative flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-10 bg-gradient-to-r from-purple-500 to-blue-500"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "10%", left: "10%" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-15 bg-gradient-to-r from-cyan-500 to-teal-500"
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ bottom: "20%", right: "10%" }}
        />
      </div>

      <AnimatePresence>
        {isCompleting && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Check className="w-16 h-16 text-white" />
              </motion.div>
              <motion.h2
                className="text-4xl font-bold mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                All Set! 🎉
              </motion.h2>
              <motion.p
                className="text-xl text-gray-300"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Taking you to your calendar...
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-4xl">
        <motion.div
          className="flex justify-between mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {onboardingSteps.map((s, idx) => (
            <div key={s.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 ${
                    step >= s.number
                      ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                      : "bg-white/10 text-gray-400"
                  }`}
                  animate={{
                    scale: step === s.number ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: step === s.number ? Infinity : 0,
                  }}
                >
                  {step > s.number ? <Check className="w-6 h-6" /> : s.number}
                </motion.div>
                <div className="text-sm text-center">
                  <div
                    className={
                      step >= s.number ? "text-white" : "text-gray-400"
                    }
                  >
                    {s.title}
                  </div>
                  {s.required && (
                    <div className="text-xs text-purple-400">Required</div>
                  )}
                </div>
              </div>
              {idx < onboardingSteps.length - 1 && (
                <motion.div
                  className="h-1 flex-1 mx-2 rounded-full bg-white/10 overflow-hidden"
                  style={{ marginTop: "-40px" }}
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                    initial={{ width: 0 }}
                    animate={{ width: step > s.number ? "100%" : "0%" }}
                    transition={{ duration: 0.5 }}
                  />
                </motion.div>
              )}
            </div>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="glass-card border border-white/20 backdrop-blur-xl bg-white/5 rounded-3xl p-8 lg:p-12 shadow-2xl"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-20 text-gray-300 gap-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
                Loading onboarding data…
              </div>
            ) : (
              <>
                {step === 1 && (
                  <div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        Connect Your Google Calendars
                      </h2>
                      <p className="text-gray-300 mb-8">
                        Add as many Google Calendar accounts as you need. We'll
                        sync them all in one beautiful dashboard.
                      </p>
                    </motion.div>

                    <div className="space-y-4 mb-8">
                      {googleAccounts.map((account, idx) => (
                        <motion.div
                          key={account.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: idx * 0.1 }}
                          className="glass-card p-4 rounded-xl border border-white/10 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: account.color }}
                            />
                            <div>
                              <div className="font-semibold">
                                {account.label ?? account.email ?? "Google"}
                              </div>
                              <div className="text-sm text-gray-400">
                                Last synced:{" "}
                                {account.lastSyncedAt
                                  ? new Date(
                                      account.lastSyncedAt,
                                    ).toLocaleTimeString()
                                  : "Just now"}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDisconnect(account.id)}
                            disabled={removingAccountId === account.id}
                            className="hover:bg-red-500/20"
                          >
                            {removingAccountId === account.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </Button>
                        </motion.div>
                      ))}
                    </div>

                    <Button
                      onClick={() => handleConnect("google")}
                      disabled={isConnectDisabled("google")}
                      className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
                    >
                      {isConnectDisabled("google") ? (
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <Calendar className="w-5 h-5 mr-2" />
                      )}
                      {googleAccounts.length
                        ? "Add another calendar"
                        : "Connect Google Calendar"}
                    </Button>
                    {!canContinue && (
                      <p className="text-sm text-red-400 mt-3">
                        Connect at least one Google Calendar to continue.
                      </p>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        Connect Social Accounts
                      </h2>
                      <p className="text-gray-300 mb-8">
                        Connect LinkedIn and Facebook to automatically post
                        AI-generated content from your meetings.
                      </p>
                    </motion.div>

                    <div className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        className="glass-card p-6 rounded-xl border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#0A66C2] flex items-center justify-center">
                              <Linkedin className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-lg">
                                LinkedIn
                              </div>
                              <div className="text-sm text-gray-400">
                                {isLinkedinConnected
                                  ? "Connected"
                                  : "Not connected"}
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleConnect("linkedin")}
                            disabled={
                              isLinkedinConnected ||
                              isConnectDisabled("linkedin")
                            }
                            className={
                              isLinkedinConnected
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-gradient-to-r from-purple-500 to-cyan-500"
                            }
                          >
                            {isLinkedinConnected
                              ? "Connected"
                              : connectingProvider === "linkedin"
                                ? "Connecting..."
                                : "Connect"}
                          </Button>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="glass-card p-6 rounded-xl border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#1877F2] flex items-center justify-center">
                              <Facebook className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-lg">
                                Facebook
                              </div>
                              <div className="text-sm text-gray-400">
                                {isFacebookConnected
                                  ? "Connected"
                                  : "Not connected"}
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleConnect("facebook")}
                            disabled={
                              isFacebookConnected ||
                              isConnectDisabled("facebook")
                            }
                            className={
                              isFacebookConnected
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-gradient-to-r from-purple-500 to-cyan-500"
                            }
                          >
                            {isFacebookConnected
                              ? "Connected"
                              : connectingProvider === "facebook"
                                ? "Connecting..."
                                : "Connect"}
                          </Button>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        Configure Bot Settings
                      </h2>
                      <p className="text-gray-300 mb-8">
                        Set how early the Recall.ai bot should join your
                        meetings before they start.
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="glass-card p-8 rounded-xl border border-cyan-500/30 bg-cyan-500/5"
                    >
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                          <Bot className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">
                            {leadMinutes[0]} minutes
                          </div>
                          <div className="text-sm text-gray-400">
                            Bot joins before meeting
                          </div>
                        </div>
                      </div>

                      <Slider
                        value={leadMinutes}
                        onValueChange={(value) =>
                          setLeadMinutes([value[0] ?? leadMinutes[0]])
                        }
                        min={1}
                        max={15}
                        step={1}
                        className="mb-4"
                      />

                      <div className="flex justify-between text-sm text-gray-400">
                        <span>1 min</span>
                        <span>15 min</span>
                      </div>
                    </motion.div>
                  </div>
                )}

                {step === 4 && (
                  <div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        Set Up Automations
                      </h2>
                      <p className="text-gray-300 mb-8">
                        Choose which AI features to enable by default for your
                        meetings.
                      </p>
                    </motion.div>

                    <div className="space-y-4">
                      {automationTemplateConfig.map((automation, idx) => (
                        <motion.div
                          key={automation.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: idx * 0.1 }}
                          className="glass-card p-6 rounded-xl border border-white/10 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                              <automation.icon className="w-5 h-5 text-purple-400" />
                            </div>
                            <Label
                              htmlFor={automation.key}
                              className="text-lg cursor-pointer"
                            >
                              {automation.label}
                            </Label>
                          </div>
                          <Switch
                            id={automation.key}
                            checked={automationState[automation.key]}
                            onCheckedChange={(checked) =>
                              setAutomationState((prev) => ({
                                ...prev,
                                [automation.key]: checked,
                              }))
                            }
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <motion.div
              className="flex items-center justify-between mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={step === 1 || isSaving}
                className="border-white/20"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>

              <div className="flex gap-3">
                {step !== 1 && (
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    disabled={isSaving}
                    className="border-white/20"
                  >
                    Skip
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={
                    !data ||
                    isSaving ||
                    (step === 1 && !canContinue) ||
                    isCompleting
                  }
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 disabled:opacity-70"
                >
                  {step === onboardingSteps.length
                    ? isSaving
                      ? "Completing..."
                      : "Complete"
                    : "Continue"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

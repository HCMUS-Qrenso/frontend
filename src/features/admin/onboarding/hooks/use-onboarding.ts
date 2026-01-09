'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useOnboardingQuery, useSaveOnboardingDraft, useCompleteOnboarding } from '../queries'
import { OnboardingDraft, DEFAULT_ONBOARDING_DRAFT, ONBOARDING_STEPS } from '../types'

interface UseOnboardingReturn {
  // Data
  draft: OnboardingDraft
  currentStep: number
  completedSteps: number[]
  steps: typeof ONBOARDING_STEPS
  
  // Loading states
  isLoading: boolean
  isSaving: boolean
  isCompleting: boolean
  
  // Actions
  updateDraft: <K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  skipStep: () => void
  saveDraft: () => Promise<void>
  complete: () => Promise<void>
  finishLater: () => void
  
  // Helpers
  canGoNext: boolean
  canGoPrev: boolean
  canSkip: boolean
  isStepComplete: (step: number) => boolean
  getStepStatus: (step: number) => 'complete' | 'current' | 'upcoming'
}

export function useOnboarding(): UseOnboardingReturn {
  const router = useRouter()
  const { data, isLoading } = useOnboardingQuery()
  const saveMutation = useSaveOnboardingDraft()
  const completeMutation = useCompleteOnboarding()
  
  // Local state
  const [draft, setDraft] = useState<OnboardingDraft>(DEFAULT_ONBOARDING_DRAFT)
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  
  // Sync with server data
  useEffect(() => {
    if (data?.data) {
      const serverDraft = data.data.draft || data.data.current_settings
      if (serverDraft) {
        setDraft(prev => ({ ...prev, ...serverDraft }))
        setCurrentStep(serverDraft.current_step || 1)
        setCompletedSteps(serverDraft.completed_steps || [])
      }
    }
  }, [data])
  
  // Update draft field
  const updateDraft = useCallback(<K extends keyof OnboardingDraft>(
    key: K, 
    value: OnboardingDraft[K]
  ) => {
    setDraft(prev => ({ ...prev, [key]: value }))
  }, [])
  
  // Validation for each step
  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 1: // Restaurant
        return !!draft.restaurant.name && !!draft.restaurant.address
      case 2: // Locale
        return !!draft.locale.currency && !!draft.locale.language
      case 3: // Tax - optional, always valid
      case 4: // Hours - optional, always valid
      case 5: // Order Rules - optional, always valid
      case 6: // Payment - optional, always valid
        return true
      case 7: // Review
        return validateStep(1) && validateStep(2)
      default:
        return false
    }
  }, [draft])
  
  // Save current progress
  const saveDraft = useCallback(async () => {
    const draftToSave = {
      ...draft,
      current_step: currentStep,
      completed_steps: completedSteps,
    }
    await saveMutation.mutateAsync(draftToSave)
  }, [draft, currentStep, completedSteps, saveMutation])
  
  // Go to next step (local only - no API call)
  const nextStep = useCallback(() => {
    if (!validateStep(currentStep)) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }
    
    // Mark current step as complete
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep])
    }
    
    if (currentStep < 7) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, completedSteps, validateStep])
  
  // Go to previous step
  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])
  
  // Go to specific step
  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 7) {
      // Can only go to completed steps or current step + 1
      if (step <= currentStep || completedSteps.includes(step - 1)) {
        setCurrentStep(step)
      }
    }
  }, [currentStep, completedSteps])
  
  // Skip current step (local only - no API call)
  const skipStep = useCallback(() => {
    const step = ONBOARDING_STEPS[currentStep - 1]
    if (step?.canSkip) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep])
      }
      if (currentStep < 7) {
        setCurrentStep(prev => prev + 1)
      }
    }
  }, [currentStep, completedSteps])
  
  // Complete onboarding
  const complete = useCallback(async () => {
    if (!validateStep(1) || !validateStep(2)) {
      toast.error('Vui lòng hoàn thành các bước bắt buộc')
      return
    }
    
    try {
      // Save final draft first
      await saveDraft()
      // Then complete
      await completeMutation.mutateAsync()
      toast.success('Thiết lập hoàn tất! Chào mừng đến với Qrenso')
      router.push('/admin/dashboard')
    } catch {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.')
    }
  }, [validateStep, saveDraft, completeMutation, router])
  
  // Finish later - save and exit
  const finishLater = useCallback(async () => {
    try {
      await saveDraft()
      toast.success('Đã lưu tiến độ. Bạn có thể tiếp tục sau.')
      router.push('/admin/dashboard')
    } catch {
      toast.error('Không thể lưu. Vui lòng thử lại.')
    }
  }, [saveDraft, router])
  
  // Derived state
  const canGoNext = useMemo(() => currentStep < 7, [currentStep])
  const canGoPrev = useMemo(() => currentStep > 1, [currentStep])
  const canSkip = useMemo(() => {
    const step = ONBOARDING_STEPS[currentStep - 1]
    return step?.canSkip || false
  }, [currentStep])
  
  const isStepComplete = useCallback((step: number) => {
    return completedSteps.includes(step)
  }, [completedSteps])
  
  const getStepStatus = useCallback((step: number): 'complete' | 'current' | 'upcoming' => {
    if (completedSteps.includes(step)) return 'complete'
    if (step === currentStep) return 'current'
    return 'upcoming'
  }, [currentStep, completedSteps])
  
  return {
    draft,
    currentStep,
    completedSteps,
    steps: ONBOARDING_STEPS,
    isLoading,
    isSaving: saveMutation.isPending,
    isCompleting: completeMutation.isPending,
    updateDraft,
    nextStep,
    prevStep,
    goToStep,
    skipStep,
    saveDraft,
    complete,
    finishLater,
    canGoNext,
    canGoPrev,
    canSkip,
    isStepComplete,
    getStepStatus,
  }
}

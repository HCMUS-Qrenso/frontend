'use client'

import { cn } from '@/src/lib/utils'
import {
  Check,
  Store,
  Globe,
  Receipt,
  Clock,
  ClipboardList,
  QrCode,
  CheckCircle,
} from 'lucide-react'
import { ONBOARDING_STEPS } from '../types'

interface OnboardingStepperProps {
  currentStep: number
  completedSteps: number[]
  onStepClick?: (step: number) => void
}

const STEP_ICONS = {
  Store,
  Globe,
  Receipt,
  Clock,
  ClipboardList,
  QrCode,
  CheckCircle,
}

export function OnboardingStepper({
  currentStep,
  completedSteps,
  onStepClick,
}: OnboardingStepperProps) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center justify-between">
        {ONBOARDING_STEPS.map((step, index) => {
          const isComplete = completedSteps.includes(step.id)
          const isCurrent = currentStep === step.id
          const Icon = STEP_ICONS[step.icon as keyof typeof STEP_ICONS]

          return (
            <li key={step.id} className="relative flex-1">
              {/* Connector line */}
              {index < ONBOARDING_STEPS.length - 1 && (
                <div
                  className={cn(
                    'absolute top-5 right-[calc(-50%+20px)] left-[calc(50%+20px)] h-0.5',
                    isComplete ? 'bg-primary' : 'bg-muted',
                  )}
                />
              )}

              {/* Step button */}
              <button
                type="button"
                onClick={() => onStepClick?.(step.id)}
                disabled={!isComplete && step.id > currentStep}
                className={cn(
                  'group relative flex flex-col items-center',
                  'focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                  !isComplete && step.id > currentStep && 'cursor-not-allowed',
                )}
              >
                {/* Icon circle */}
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                    isComplete && 'border-primary bg-primary text-primary-foreground',
                    isCurrent && !isComplete && 'border-primary bg-background text-primary',
                    !isComplete && !isCurrent && 'border-muted bg-muted text-muted-foreground',
                  )}
                >
                  {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>

                {/* Label */}
                <div className="mt-2 flex flex-col items-center">
                  <span
                    className={cn(
                      'text-xs font-medium',
                      isComplete || isCurrent ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {step.title}
                  </span>
                  {!step.required && (
                    <span className="text-muted-foreground text-[10px]">(Tùy chọn)</span>
                  )}
                </div>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

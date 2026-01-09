'use client'

import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { ArrowLeft, ArrowRight, SkipForward, Loader2, LogOut } from 'lucide-react'
import { useOnboarding } from '../hooks'
import { OnboardingStepper } from './onboarding-stepper'
import { StepRestaurant } from './step-restaurant'
import { StepLocale } from './step-locale'
import { StepTaxCharge } from './step-tax-charge'
import { StepHours } from './step-hours'
import { StepOrderRules } from './step-order-rules'
import { StepPayment } from './step-payment'
import { StepReview } from './step-review'

export function OnboardingWizard() {
  const {
    draft,
    currentStep,
    completedSteps,
    steps,
    isLoading,
    isSaving,
    isCompleting,
    updateDraft,
    nextStep,
    prevStep,
    goToStep,
    skipStep,
    complete,
    finishLater,
    canGoNext,
    canGoPrev,
    canSkip,
  } = useOnboarding()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepRestaurant
            data={draft.restaurant}
            onChange={(data) => updateDraft('restaurant', data)}
          />
        )
      case 2:
        return <StepLocale data={draft.locale} onChange={(data) => updateDraft('locale', data)} />
      case 3:
        return (
          <StepTaxCharge
            data={draft.tax_charge}
            onChange={(data) => updateDraft('tax_charge', data)}
            currencySymbol={draft.locale.currency_symbol}
          />
        )
      case 4:
        return <StepHours data={draft.hours} onChange={(data) => updateDraft('hours', data)} />
      case 5:
        return (
          <StepOrderRules
            data={draft.order_rules}
            onChange={(data) => updateDraft('order_rules', data)}
            currencySymbol={draft.locale.currency_symbol}
          />
        )
      case 6:
        return (
          <StepPayment data={draft.payment} onChange={(data) => updateDraft('payment', data)} />
        )
      case 7:
        return (
          <StepReview
            draft={draft}
            onEdit={goToStep}
            onComplete={complete}
            isCompleting={isCompleting}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="from-background to-muted/30 flex min-h-screen items-center justify-center bg-gradient-to-br">
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Chào mừng đến với Qrenso 🎉</h1>
          <p className="text-muted-foreground mt-2">
            Hãy thiết lập một số thông tin cơ bản để bắt đầu
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <OnboardingStepper
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={goToStep}
          />
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardContent className="p-6">{renderStep()}</CardContent>
        </Card>

        {/* Navigation (hidden on review step) */}
        {currentStep < 7 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={prevStep} disabled={!canGoPrev}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>

              <Button variant="ghost" onClick={finishLater} disabled={isSaving}>
                <LogOut className="mr-2 h-4 w-4" />
                Hoàn thành sau
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {canSkip && (
                <Button variant="outline" onClick={skipStep} disabled={isSaving}>
                  <SkipForward className="mr-2 h-4 w-4" />
                  Bỏ qua
                </Button>
              )}

              <Button onClick={nextStep} disabled={!canGoNext || isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    Tiếp tục
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Progress indicator */}
        <div className="text-muted-foreground mt-6 text-center text-sm">Bước {currentStep} / 7</div>
      </div>
    </div>
  )
}

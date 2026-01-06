'use client'

import { Shield, AlertTriangle, CheckCircle2, Eye } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/src/components/ui/dialog'
import { useTranslations } from 'next-intl'

interface QRSecurityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QRSecurityModal({ open, onOpenChange }: QRSecurityModalProps) {
  const t = useTranslations('tables')

  const bestPractices = [
    {
      icon: CheckCircle2,
      text: t('qrBestPractice1'),
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: Eye,
      text: t('qrBestPractice2'),
      color: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      icon: CheckCircle2,
      text: t('qrBestPractice3'),
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: Shield,
      text: t('qrBestPractice4'),
      color: 'text-emerald-600 dark:text-emerald-400',
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2.5 dark:bg-emerald-500/10">
              <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <DialogTitle>{t('qrSecurityTitle')}</DialogTitle>
              <DialogDescription>{t('qrSecurityDesc')}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Best practices section */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            {t('qrBestPractices')}
          </h4>
          <div className="space-y-2.5">
            {bestPractices.map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50"
              >
                <div className={`mt-0.5 shrink-0 ${tip.color}`}>
                  <tip.icon className="h-4 w-4" />
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {tip.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quishing warning section */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            {t('quishingWarning')}
          </h4>
          <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-500/20 dark:bg-amber-500/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" />
              <div className="space-y-2">
                <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-300">
                  {t('quishingDesc')}
                </p>
                <ul className="space-y-1.5 pl-1 text-sm text-amber-800 dark:text-amber-400">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-600 dark:bg-amber-500" />
                    <span>{t('quishingTip1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-600 dark:bg-amber-500" />
                    <span>{t('quishingTip2')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="rounded-full bg-emerald-500 hover:bg-emerald-600"
          >
            {t('understood')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

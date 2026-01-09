'use client'

import { HelpCircle } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'
import { Button } from '@/src/components/ui/button'

interface FieldHelpProps {
  title: string
  description: string
  whereShown?: string[]
  tip?: string
  canSkip: boolean
  example?: string
}

export function FieldHelp({
  title,
  description,
  whereShown,
  tip,
  canSkip,
  example,
}: FieldHelpProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground h-5 w-5 p-0"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Thông tin</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <h4 className="font-medium">{title}</h4>

          <p className="text-muted-foreground text-sm">{description}</p>

          {whereShown && whereShown.length > 0 && (
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium">Hiển thị ở:</p>
              <ul className="text-muted-foreground space-y-0.5 text-xs">
                {whereShown.map((place, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <span className="bg-primary h-1 w-1 rounded-full" />
                    {place}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tip && (
            <div className="bg-muted rounded-md p-2">
              <p className="text-xs">
                <span className="font-medium">💡 Gợi ý:</span> {tip}
              </p>
            </div>
          )}

          {example && (
            <div className="rounded-md border p-2">
              <p className="text-muted-foreground text-xs">Ví dụ:</p>
              <p className="text-sm font-medium">{example}</p>
            </div>
          )}

          <div className="flex items-center gap-1 text-xs">
            {canSkip ? (
              <span className="text-green-600">✓ Có thể bỏ qua</span>
            ) : (
              <span className="text-orange-600">✗ Bắt buộc</span>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

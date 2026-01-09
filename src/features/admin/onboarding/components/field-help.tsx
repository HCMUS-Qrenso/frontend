'use client'

import { HelpCircle } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/src/components/ui/popover'
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
  example 
}: FieldHelpProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Thông tin</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <h4 className="font-medium">{title}</h4>
          
          <p className="text-sm text-muted-foreground">{description}</p>
          
          {whereShown && whereShown.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Hiển thị ở:
              </p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {whereShown.map((place, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-primary" />
                    {place}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {tip && (
            <div className="rounded-md bg-muted p-2">
              <p className="text-xs">
                <span className="font-medium">💡 Gợi ý:</span> {tip}
              </p>
            </div>
          )}
          
          {example && (
            <div className="rounded-md border p-2">
              <p className="text-xs text-muted-foreground">Ví dụ:</p>
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

import * as RadixSelect from '@radix-ui/react-select'
import { LuChevronDown, LuCheck } from 'react-icons/lu'

export function Select({
  value,
  onValueChange,
  placeholder = 'Seleccionar...',
  disabled,
  children,
  className,
}: {
  value: string
  onValueChange: (v: string) => void
  placeholder?: string
  disabled?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <RadixSelect.Trigger
        className={`flex items-center justify-between w-full h-10 px-3 py-2 text-[13.5px] font-medium text-slate-800 bg-white border border-slate-200 rounded-xl shadow-sm outline-none transition-colors
          hover:border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
          data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed
          data-[placeholder]:text-slate-400 ${className ?? ''}`}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <LuChevronDown size={15} className="text-slate-400 flex-shrink-0" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          className="z-9999 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in-0 zoom-in-95"
        >
          <RadixSelect.Viewport className="p-1">
            {children}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}

export function SelectItem({
  value,
  children,
}: {
  value: string
  children: React.ReactNode
}) {
  return (
    <RadixSelect.Item
      value={value}
      className="relative flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-slate-700 rounded-lg cursor-pointer outline-none select-none
        data-[highlighted]:bg-brand-50 data-[highlighted]:text-brand-700
        data-[state=checked]:text-brand-700 data-[state=checked]:font-semibold"
    >
      <RadixSelect.ItemIndicator className="absolute left-2">
        <LuCheck size={12} />
      </RadixSelect.ItemIndicator>
      <span className="pl-4">
        <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      </span>
    </RadixSelect.Item>
  )
}

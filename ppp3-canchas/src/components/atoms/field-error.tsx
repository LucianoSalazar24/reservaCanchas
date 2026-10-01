export function FieldError({ msg }: { msg: string }) {
  if (!msg) return null
  return (
    <span className="text-red-600 text-[12px] mt-1 block font-medium flex items-center gap-1">⚠ {msg}</span>
  )
}

export function inputCls(err: string) {
  return `form-input${err ? ' border-red-400' : ''}`
}

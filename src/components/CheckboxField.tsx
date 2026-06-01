interface CheckboxFieldProps {
  label: string
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}

export function CheckboxField({ label, id, checked, onChange, className = '' }: CheckboxFieldProps) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-2 cursor-pointer group ${className}`}
    >
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center ${
            checked
              ? 'bg-primary border-primary'
              : 'bg-background border-input group-hover:border-primary/60'
          }`}
        >
          {checked && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground"/>
            </svg>
          )}
        </div>
      </div>
      <span className="text-sm text-foreground select-none">{label}</span>
    </label>
  )
}

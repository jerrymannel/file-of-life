interface FormSectionProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function FormSection({ title, children, className = '' }: FormSectionProps) {
  return (
    <section className={`bg-card border border-border rounded-lg shadow-sm ${className}`}>
      <div className="px-6 py-4 border-b border-border bg-muted/30 rounded-t-lg">
        <h2 className="font-serif text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-6">
        {children}
      </div>
    </section>
  )
}

import * as React from "react"
import { cn } from "@/lib/utils"

type RadioGroupContextValue = {
  value: string
  onValueChange: (value: string) => void
  name: string
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null)

function useRadioGroup() {
  const context = React.useContext(RadioGroupContext)
  if (!context) {
    throw new Error("RadioGroupItem must be used within RadioGroup")
  }
  return context
}

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { defaultValue?: string; value?: string; onValueChange?: (value: string) => void; name?: string }
>(({ defaultValue, value: controlledValue, onValueChange, name = "radio-group", children, ...props }, ref) => {
  const [value, setValue] = React.useState(defaultValue || "")
  const currentValue = controlledValue !== undefined ? controlledValue : value
  
  return (
    <RadioGroupContext.Provider value={{ value: currentValue, onValueChange: (v) => { setValue(v); onValueChange?.(v) }, name }}>
      <div ref={ref} role="radiogroup" {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { value: string }
>(({ className, value, id, ...props }, ref) => {
  const { value: selectedValue, onValueChange, name } = useRadioGroup()
  const isChecked = selectedValue === value
  const itemId = id || `${name}-${value}`

  return (
    <input
      ref={ref}
      type="radio"
      id={itemId}
      name={name}
      value={value}
      checked={isChecked}
      onChange={() => onValueChange(value)}
      className={cn(
        "h-4 w-4 border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }

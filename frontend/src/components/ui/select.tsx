import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  options?: SelectOption[]
  placeholder?: string
  className?: string
  children?: React.ReactNode
}

const SelectContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
} | null>(null)

const useSelect = () => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("useSelect must be used within Select")
  return context
}

const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  options,
  placeholder = "Välj...",
  className,
  children,
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div ref={ref} className={cn("relative", className)}>
        {children || (
          <>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </>
        )}
      </div>
    </SelectContext.Provider>
  )
}

interface SelectTriggerProps {
  children?: React.ReactNode
  className?: string
}

const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className }) => {
  const { isOpen, setIsOpen } = useSelect()
  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
        className
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
}

interface SelectValueProps {
  placeholder?: string
}

const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  const { value } = useSelect()
  return <span className={cn(!value && "text-gray-400")}>{value || placeholder}</span>
}

interface SelectContentProps {
  children?: React.ReactNode
  className?: string
}

const SelectContent: React.FC<SelectContentProps> = ({ children, className }) => {
  const { isOpen } = useSelect()
  if (!isOpen) return null
  return (
    <div
      className={cn(
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white p-1 shadow-md",
        className
      )}
    >
      {children}
    </div>
  )
}

interface SelectItemProps {
  value: string
  children?: React.ReactNode
  className?: string
  disabled?: boolean
}

const SelectItem: React.FC<SelectItemProps> = ({ value, children, className, disabled }) => {
  const { value: selectedValue, onValueChange, setIsOpen } = useSelect()
  const isSelected = selectedValue === value

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          onValueChange(value)
          setIsOpen(false)
        }
      }}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm hover:bg-gray-100",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      {children}
    </button>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }

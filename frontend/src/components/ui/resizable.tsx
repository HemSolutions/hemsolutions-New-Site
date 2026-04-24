import * as React from "react"
import { GripVertical } from "lucide-react"

// Stub implementation - resizable panels not currently used
// This prevents build errors while maintaining the export interface

function ResizablePanelGroup({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={className}
      {...props}
    >
      {children}
    </div>
  )
}

function ResizablePanel({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props}>{children}</div>
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { withHandle?: boolean }) {
  return (
    <div className={className} {...props}>
      {withHandle && (
        <div className="flex h-4 w-3 items-center justify-center rounded border">
          <GripVertical className="w-2.5 h-2.5" />
        </div>
      )}
    </div>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }

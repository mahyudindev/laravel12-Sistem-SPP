import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      style={
        {
          "--normal-bg": "#1A1A1A",
          "--normal-text": "#FFFFFF",
          "--normal-border": "#333333",
          "--success-bg": "#1c2b23",
          "--success-text": "#6ce99c",
          "--success-border": "#2b513a",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

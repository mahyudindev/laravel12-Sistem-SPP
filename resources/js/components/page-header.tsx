import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PageHeaderProps {
  className?: string;
  children: ReactNode;
}

export function PageHeader({ className, children, ...props }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col space-y-2", className)} {...props}>
      {children}
    </div>
  );
}

interface PageHeaderHeadingProps {
  className?: string;
  children: ReactNode;
}

export function PageHeaderHeading({ className, children, ...props }: PageHeaderHeadingProps) {
  return (
    <h1
      className={cn(
        "text-2xl font-bold tracking-tight text-gray-100 sm:text-3xl",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

interface PageHeaderDescriptionProps {
  className?: string;
  children: ReactNode;
}

export function PageHeaderDescription({
  className,
  children,
  ...props
}: PageHeaderDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-gray-400 sm:text-base", className)}
      {...props}
    >
      {children}
    </p>
  );
}

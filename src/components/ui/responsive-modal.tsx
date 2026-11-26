"use client";

import * as React from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";

const ResponsiveModalContext = React.createContext<{ isDesktop: boolean }>({
  isDesktop: false,
});

function useResponsiveModalContext() {
  return React.useContext(ResponsiveModalContext);
}

interface ResponsiveModalProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  modal?: boolean;
}

function ResponsiveModal({ children, ...props }: ResponsiveModalProps) {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY, false);

  return (
    <ResponsiveModalContext.Provider value={{ isDesktop }}>
      {isDesktop ? <Dialog {...props}>{children}</Dialog> : <Drawer {...props}>{children}</Drawer>}
    </ResponsiveModalContext.Provider>
  );
}

function ResponsiveModalTrigger({
  className,
  children,
  asChild,
  ...props
}: React.ComponentProps<typeof DialogTrigger>) {
  const { isDesktop } = useResponsiveModalContext();

  if (isDesktop) {
    return (
      <DialogTrigger className={className} asChild={asChild} {...props}>
        {children}
      </DialogTrigger>
    );
  }

  return (
    <DrawerTrigger className={className} asChild={asChild} {...props}>
      {children}
    </DrawerTrigger>
  );
}

function ResponsiveModalClose({
  className,
  children,
  asChild,
  ...props
}: React.ComponentProps<typeof DialogClose>) {
  const { isDesktop } = useResponsiveModalContext();

  if (isDesktop) {
    return (
      <DialogClose className={className} asChild={asChild} {...props}>
        {children}
      </DialogClose>
    );
  }

  return (
    <DrawerClose className={className} asChild={asChild} {...props}>
      {children}
    </DrawerClose>
  );
}

function ResponsiveModalContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  const { isDesktop } = useResponsiveModalContext();

  if (isDesktop) {
    return (
      <DialogContent
        data-responsive-mode="dialog"
        showCloseButton={showCloseButton}
        className={cn(className)}
        {...props}
      >
        {children}
      </DialogContent>
    );
  }

  return (
    <DrawerContent data-responsive-mode="drawer" className={cn(className)}>
      {children}
    </DrawerContent>
  );
}

function ResponsiveModalHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { isDesktop } = useResponsiveModalContext();

  if (isDesktop) {
    return <DialogHeader className={className} {...props} />;
  }

  return <DrawerHeader className={className} {...props} />;
}

function ResponsiveModalTitle({ className, ...props }: React.ComponentProps<typeof DialogTitle>) {
  const { isDesktop } = useResponsiveModalContext();

  if (isDesktop) {
    return <DialogTitle className={className} {...props} />;
  }

  return <DrawerTitle className={className} {...props} />;
}

function ResponsiveModalDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogDescription>) {
  const { isDesktop } = useResponsiveModalContext();

  if (isDesktop) {
    return <DialogDescription className={className} {...props} />;
  }

  return <DrawerDescription className={className} {...props} />;
}

function ResponsiveModalFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { isDesktop } = useResponsiveModalContext();

  if (isDesktop) {
    return <DialogFooter className={className} {...props} />;
  }

  return <DrawerFooter className={className} {...props} />;
}

export {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalClose,
};

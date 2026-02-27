import React, { createContext, useContext, useState, useCallback } from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface AlertContextType {
  showAlert: (message: string, title?: string) => Promise<void>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("알림");
  const [message, setMessage] = useState("");
  const [resolveRef, setResolveRef] = useState<((value: void) => void) | null>(null);

  const showAlert = useCallback((msg: string, ttl: string = "알림") => {
    return new Promise<void>((resolve) => {
      setMessage(msg);
      setTitle(ttl);
      setOpen(true);
      setResolveRef(() => resolve);
    });
  }, []);

  const handleClose = () => {
    setOpen(false);
    if (resolveRef) {
      resolveRef();
      setResolveRef(null);
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <AlertDialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <AlertDialogPrimitive.Portal>
          {/* 오버레이: 투명하게 설정하여 배경이 그대로 보이도록 함 (알림 스타일) */}
          <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-transparent" />
          
          <AlertDialogPrimitive.Content
            className={cn(
              "fixed z-50 grid w-full max-w-[320px] gap-3 border bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.15)] duration-200",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:slide-out-to-bottom-1/2 data-[state=open]:slide-in-from-bottom-10",
              "left-[50%] bottom-8 translate-x-[-50%] rounded-[24px]"
            )}
          >
            <AlertDialogPrimitive.Title className="hidden">{title}</AlertDialogPrimitive.Title>
            <AlertDialogPrimitive.Description className="text-gray-900 font-bold text-center text-sm whitespace-pre-wrap leading-relaxed">
              {message}
            </AlertDialogPrimitive.Description>
            
            <div className="flex justify-center pt-1">
              <AlertDialogPrimitive.Action
                onClick={handleClose}
                className={cn(
                  buttonVariants(),
                  "bg-gray-900 hover:bg-gray-800 text-white rounded-full h-8 px-8 text-xs font-bold w-auto" 
                )}
              >
                확인
              </AlertDialogPrimitive.Action>
            </div>
          </AlertDialogPrimitive.Content>
        </AlertDialogPrimitive.Portal>
      </AlertDialogPrimitive.Root>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}

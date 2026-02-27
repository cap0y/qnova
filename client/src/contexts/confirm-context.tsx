import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(
    null
  );

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    setOptions(options);
    setOpen(true);
    return new Promise((resolve) => {
      setResolveRef(() => resolve);
    });
  };

  const handleConfirm = () => {
    if (resolveRef) resolveRef(true);
    setOpen(false);
  };

  const handleCancel = () => {
    if (resolveRef) resolveRef(false);
    setOpen(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-sm rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-center">
              {options.title || "확인"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-600">
              {options.description || "정말 진행하시겠습니까?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center sm:justify-center gap-2">
            <AlertDialogCancel onClick={handleCancel} className="mt-0 w-full">
              {options.cancelText || "취소"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={`w-full ${
                options.variant === "destructive"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {options.confirmText || "확인"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
};


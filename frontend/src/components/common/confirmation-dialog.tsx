"use client";

import React, { ReactNode, useState } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface ConfirmationDialogProps {
  title: string;
  description?: string;
  actionText: string;
  onConfirm: () => Promise<void> | void;
  children: ReactNode; // trigger, e.g. a button
}

export default function ConfirmationDialog({
  title,
  description,
  actionText,
  onConfirm,
  children,
}: ConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAction}
            disabled={isLoading}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isLoading ? "Processing…" : actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

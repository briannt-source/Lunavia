"use client";
import { toast } from 'react-hot-toast';

export function notifySuccess(message: string) {
  toast.success(message, { position: 'top-center' });
}

export function notifyError(message: string) {
  toast.error(message, { position: 'top-center' });
}

export function notifyInfo(message: string) {
  toast(message, { position: 'top-center' });
}

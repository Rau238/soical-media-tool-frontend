import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToasterService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 3000) {
    const toast: Toast = { message, type, duration };
    this.toastsSubject.next([...this.toastsSubject.value, toast]);
  }

  remove(index: number) {
    const toasts = this.toastsSubject.value;
    this.toastsSubject.next(toasts.filter((_, i) => i !== index));
  }
}
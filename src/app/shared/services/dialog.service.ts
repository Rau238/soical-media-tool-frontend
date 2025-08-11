import { Injectable, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface DialogConfig {
  title: string;
  content: string;
  confirmText?: string;
  cancelText?: string;
  showClose?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

@Injectable({ providedIn: 'root' })
export class DialogService {
   isOpen = signal(false);
   config = signal<DialogConfig | null>(null);
   resultSubject = new Subject<boolean>();


  open(config: DialogConfig): Observable<boolean> {
    this.config.set({
      showClose: true,
      size: 'md',
      ...config
    });
    this.isOpen.set(true);
    return this.resultSubject.asObservable();
  }

  confirm() {
    this.resultSubject.next(true);
    this.close();
  }

  cancel() {
    this.resultSubject.next(false);
    this.close();
  }

  private close() {
    this.isOpen.set(false);
    this.config.set(null);
  }
}

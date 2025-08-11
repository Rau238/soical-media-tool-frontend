import { trigger, transition, style, animate } from '@angular/animations';
import { Component, inject, computed } from '@angular/core';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-dialog',
  standalone: true,
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(4px) scale(0.95)' }),
        animate('150ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('100ms ease-in', style({ opacity: 0, transform: 'translateY(4px) scale(0.95)' }))
      ])
    ])
  ]
})
export class DialogComponent {
  readonly dialogService = inject(DialogService);

  // Computed property using signals
  readonly sizeClass = computed(() => {
    const size = this.dialogService.config()?.size || 'md';
    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg'
    };
    return sizeClasses[size];
  });

  // Method for template (keeping for compatibility)
  getSizeClass(): string {
    return this.sizeClass();
  }
}

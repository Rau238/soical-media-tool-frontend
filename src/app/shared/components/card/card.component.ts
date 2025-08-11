import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  // Visual depth
  @Input() elevation: 'none' | 'sm' | 'md' | 'lg' = 'md';
  // Rounded corners
  @Input() rounded: 'none' | 'sm' | 'md' | 'lg' | 'xl' = 'xl';
  // Show subtle hover effect
  @Input() hover: boolean = false;
  // Content padding inside body
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  // Overflow strategy
  @Input() overflowHidden: boolean = true;

  get containerClass(): string {
    const elevationClass = this.elevation === 'none'
      ? 'shadow-none'
      : this.elevation === 'sm'
        ? 'shadow'
        : this.elevation === 'md'
          ? 'shadow-[0_10px_30px_rgba(2,6,23,0.08)]'
          : 'shadow-2xl';

    const roundedClass = this.rounded === 'none'
      ? 'rounded-none'
      : this.rounded === 'sm'
        ? 'rounded'
        : this.rounded === 'md'
          ? 'rounded-lg'
          : this.rounded === 'lg'
            ? 'rounded-xl'
            : 'rounded-2xl';

    const hoverClass = this.hover ? 'transition-shadow hover:shadow-xl' : '';
    const overflowClass = this.overflowHidden ? 'overflow-hidden' : '';

    return `flex flex-col bg-white ${elevationClass} ${roundedClass} ${hoverClass} ${overflowClass}`.trim();
  }

  get bodyPaddingClass(): string {
    switch (this.padding) {
      case 'none': return '';
      case 'sm': return 'p-3';
      case 'lg': return 'p-6';
      default: return 'p-4';
    }
  }
}

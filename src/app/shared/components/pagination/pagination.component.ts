import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent {
  // Whether there is a previous page available
  @Input() hasPrev: boolean = false;
  // Whether there is a next page available
  @Input() hasNext: boolean = false;
  // Whether a page fetch is in progress (disables buttons and shows loader text)
  @Input() loading: boolean = false;
  // Visual alignment of the control bar
  @Input() align: 'start' | 'center' | 'end' = 'center';

  // Emitted when user clicks Prev
  @Output() prev = new EventEmitter<void>();
  // Emitted when user clicks Next
  @Output() next = new EventEmitter<void>();

  get alignmentClass(): string {
    switch (this.align) {
      case 'start':
        return 'justify-start';
      case 'end':
        return 'justify-end';
      default:
        return 'justify-center';
    }
  }

  onPrevClick() {
    if (!this.loading && this.hasPrev) this.prev.emit();
  }

  onNextClick() {
    if (!this.loading && this.hasNext) this.next.emit();
  }
}

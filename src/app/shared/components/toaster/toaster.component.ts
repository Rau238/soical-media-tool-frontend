import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import {  NgIf, NgSwitch, NgSwitchCase } from '@angular/common';

@Component({
  selector: 'app-toaster',
  templateUrl: './toaster.component.html',
  standalone: true,
  imports: [NgIf, NgSwitch, NgSwitchCase,],
  animations: [
    trigger('toastAnimation', [
      state('void', style({
        transform: 'translateX(100%)',
        opacity: 0
      })),
      state('show', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      transition('void => show', animate('300ms ease-in')),
      transition('show => void', animate('300ms ease-out'))
    ])
  ]
})
export class ToasterComponent implements OnInit {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() duration: number = 3000;
  @Output() closed = new EventEmitter<void>();

  isVisible: boolean = true;

  ngOnInit() {
    if (this.duration > 0) {
      setTimeout(() => {
        this.close();
      }, this.duration);
    }
  }

  close() {
    this.isVisible = false;
    setTimeout(() => {
      this.closed.emit();
    }, 300);
  }


}
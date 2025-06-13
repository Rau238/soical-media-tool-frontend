import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast, ToasterService } from './shared/services/toaster.service';
import { NgFor } from '@angular/common';
import { ToasterComponent } from './shared/components/toaster/toaster.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,NgFor,ToasterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  toasts: Toast[] = [];

  constructor(private toasterService: ToasterService) {
    this.toasterService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  showToast(type: 'success' | 'error' | 'warning' | 'info') {
    this.toasterService.show(`This is a ${type} message!`, type);
  }

  removeToast(index: number) {
    this.toasterService.remove(index);
  }
}

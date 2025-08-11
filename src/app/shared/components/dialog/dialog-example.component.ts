import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogComponent } from './dialog.component';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-dialog-example',
  standalone: true,
  imports: [CommonModule, DialogComponent],
  template: `
    <div class="max-w-4xl mx-auto p-8 space-y-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Modern Dialog Examples
      </h1>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          (click)="showConfirmDialog()"
          class="p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg">
          Confirm Dialog
        </button>

        <button
          (click)="showDeleteDialog()"
          class="p-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg">
          Delete Dialog
        </button>

        <button
          (click)="showInfoDialog()"
          class="p-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg">
          Info Dialog
        </button>

        <button
          (click)="showCustomDialog()"
          class="p-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg">
          Custom Content
        </button>

        <button
          (click)="showSmallDialog()"
          class="p-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg">
          Small Dialog
        </button>

        <button
          (click)="showLargeDialog()"
          class="p-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg">
          Large Dialog
        </button>
      </div>

      <!-- Dialog results -->
      @if (lastResult !== null) {
        <div class="mt-6 p-4 rounded-lg"
             [class]="lastResult ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
          <p class="font-medium">
            Last dialog result: {{ lastResult ? 'Confirmed' : 'Cancelled' }}
          </p>
        </div>
      }
    </div>

    <!-- Dialog Component -->
    <app-dialog>
      @if (showCustomContent) {
        <div class="space-y-4">
          <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 class="font-medium text-blue-900 dark:text-blue-200 mb-2">Custom Content</h4>
            <p class="text-blue-800 dark:text-blue-300 text-sm">
              This is custom content projected into the dialog. You can add any HTML content here.
            </p>
          </div>

          <div class="space-y-3">
            <input
              type="text"
              placeholder="Enter your name"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white">

            <textarea
              placeholder="Enter your message"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none">
            </textarea>
          </div>
        </div>
      }
    </app-dialog>
  `
})
export class DialogExampleComponent {
  private readonly dialogService = inject(DialogService);

  lastResult: boolean | null = null;
  showCustomContent = false;

  showConfirmDialog() {
    this.dialogService.open({
      title: 'Confirm Action',
      content: 'Are you sure you want to proceed with this action?',
      confirmText: 'Yes, Proceed',
      cancelText: 'Cancel',
      size: 'md'
    }).subscribe(result => {
      this.lastResult = result;
      console.log('Confirm dialog result:', result);
    });
  }

  showDeleteDialog() {
    this.dialogService.open({
      title: 'Delete Item',
      content: 'This action cannot be undone. Are you sure you want to delete this item?',
      confirmText: 'Delete',
      cancelText: 'Keep',
      size: 'md'
    }).subscribe(result => {
      this.lastResult = result;
      console.log('Delete dialog result:', result);
    });
  }

  showInfoDialog() {
    this.dialogService.open({
      title: 'Information',
      content: 'This is an informational dialog. It contains important information that you should read.',
      confirmText: 'Got it',
      cancelText: 'Close',
      size: 'md'
    }).subscribe(result => {
      this.lastResult = result;
      console.log('Info dialog result:', result);
    });
  }

  showCustomDialog() {
    this.showCustomContent = true;
    this.dialogService.open({
      title: 'Custom Dialog',
      content: 'This dialog contains custom content below:',
      confirmText: 'Save',
      cancelText: 'Cancel',
      size: 'md'
    }).subscribe(result => {
      this.lastResult = result;
      this.showCustomContent = false;
      console.log('Custom dialog result:', result);
    });
  }

  showSmallDialog() {
    this.dialogService.open({
      title: 'Small Dialog',
      content: 'This is a small dialog with minimal content.',
      confirmText: 'OK',
      cancelText: 'Cancel',
      size: 'sm'
    }).subscribe(result => {
      this.lastResult = result;
      console.log('Small dialog result:', result);
    });
  }

  showLargeDialog() {
    this.dialogService.open({
      title: 'Large Dialog',
      content: 'This is a large dialog with more space for content. It can accommodate longer text and more complex layouts. The dialog will automatically adjust its size based on the content and the specified size parameter.',
      confirmText: 'Continue',
      cancelText: 'Go Back',
      size: 'lg'
    }).subscribe(result => {
      this.lastResult = result;
      console.log('Large dialog result:', result);
    });
  }
}

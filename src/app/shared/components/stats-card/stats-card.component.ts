import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatCard {
  label: string;
  value: number;
  icon: string;
  color: 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'indigo';
}

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white shadow-sm p-4 border rounded-xl">
      <div class="flex items-center">
        <div [class]="iconContainerClass">
          <div [innerHTML]="icon" [class]="iconClass"></div>
        </div>
        <div class="ml-4">
          <p class="font-medium text-gray-900 text-sm">{{ label }}</p>
          <p [class]="valueClass">{{ value }}</p>
        </div>
      </div>
    </div>
  `
})
export class StatsCardComponent {
  @Input() label!: string;
  @Input() value!: number;
  @Input() icon!: string;
  @Input() color: StatCard['color'] = 'blue';

  get iconContainerClass(): string {
    const baseClass = 'p-3 rounded-lg';
    const colorMap = {
      blue: 'bg-blue-100',
      green: 'bg-green-100',
      red: 'bg-red-100',
      purple: 'bg-purple-100',
      yellow: 'bg-yellow-100',
      indigo: 'bg-indigo-100'
    };
    return `${baseClass} ${colorMap[this.color]}`;
  }

  get iconClass(): string {
    const baseClass = 'w-6 h-6';
    const colorMap = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      red: 'text-red-600',
      purple: 'text-purple-600',
      yellow: 'text-yellow-600',
      indigo: 'text-indigo-600'
    };
    return `${baseClass} ${colorMap[this.color]}`;
  }

  get valueClass(): string {
    const baseClass = 'font-bold text-2xl';
    const colorMap = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      red: 'text-red-600',
      purple: 'text-purple-600',
      yellow: 'text-yellow-600',
      indigo: 'text-indigo-600'
    };
    return `${baseClass} ${colorMap[this.color]}`;
  }
}

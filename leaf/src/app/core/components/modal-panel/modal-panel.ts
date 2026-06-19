import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

export type ModalAccent = 'blue' | 'green' | 'orange' | 'indigo';

const ACCENT_CLASSES: Record<ModalAccent, string> = {
  blue: 'from-blue-600 to-indigo-700',
  green: 'from-green-600 to-emerald-700',
  orange: 'from-orange-600 to-red-600',
  indigo: 'from-indigo-600 to-purple-700',
};

@Component({
  selector: 'app-modal-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-panel.html',
  styleUrls: ['./modal-panel.scss'],
})
export class ModalPanelComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() accent: ModalAccent = 'blue';
  @Input() panelClass = '';
  @Input() maxWidthClass = 'max-w-lg';

  @Output() closeModal = new EventEmitter<void>();

  @ViewChild('panel') panelRef?: ElementRef<HTMLElement>;

  dragX = 0;
  dragY = 0;
  private dragging = false;
  private startPointerX = 0;
  private startPointerY = 0;
  private startDragX = 0;
  private startDragY = 0;

  get headerClass(): string {
    return `bg-gradient-to-r ${ACCENT_CLASSES[this.accent]}`;
  }

  get transformStyle(): string {
    if (this.dragX === 0 && this.dragY === 0) {
      return '';
    }
    return `translate(${this.dragX}px, ${this.dragY}px)`;
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onHeaderPointerDown(event: PointerEvent): void {
    if ((event.target as HTMLElement).closest('[data-modal-close]')) {
      return;
    }

    this.dragging = true;
    this.startPointerX = event.clientX;
    this.startPointerY = event.clientY;
    this.startDragX = this.dragX;
    this.startDragY = this.dragY;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  onHeaderPointerMove(event: PointerEvent): void {
    if (!this.dragging) {
      return;
    }

    this.dragX = this.startDragX + (event.clientX - this.startPointerX);
    this.dragY = this.startDragY + (event.clientY - this.startPointerY);
  }

  onHeaderPointerUp(event: PointerEvent): void {
    if (!this.dragging) {
      return;
    }

    this.dragging = false;
    (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.onClose();
  }
}

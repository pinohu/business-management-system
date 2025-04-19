import { describe, it, expect } from 'vitest';
import {
  generateAriaLabel,
  generateId,
  isKeyboardNavigation,
  trapFocus,
  announceToScreenReader,
  getFocusableElements,
} from '../accessibility';

describe('Accessibility Utils', () => {
  describe('generateAriaLabel', () => {
    it('generates descriptive aria label', () => {
      const label = generateAriaLabel('Submit', 'form');
      expect(label).toBe('Submit form button');
    });

    it('handles custom descriptions', () => {
      const label = generateAriaLabel('Close', 'dialog', 'Press Escape to close');
      expect(label).toBe('Close dialog button. Press Escape to close');
    });

    it('handles empty descriptions', () => {
      const label = generateAriaLabel('Save', 'document', '');
      expect(label).toBe('Save document button');
    });
  });

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId('input');
      const id2 = generateId('input');
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^input-\d+$/);
      expect(id2).toMatch(/^input-\d+$/);
    });

    it('handles custom prefixes', () => {
      const id = generateId('custom');
      expect(id).toMatch(/^custom-\d+$/);
    });
  });

  describe('isKeyboardNavigation', () => {
    it('detects keyboard navigation', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
      });
      expect(isKeyboardNavigation(event)).toBe(true);
    });

    it('detects mouse navigation', () => {
      const event = new MouseEvent('mousedown', {
        bubbles: true,
      });
      expect(isKeyboardNavigation(event)).toBe(false);
    });

    it('detects touch navigation', () => {
      const event = new TouchEvent('touchstart', {
        bubbles: true,
      });
      expect(isKeyboardNavigation(event)).toBe(false);
    });
  });

  describe('trapFocus', () => {
    it('traps focus within element', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button>First</button>
        <button>Second</button>
        <button>Third</button>
      `;
      document.body.appendChild(container);

      const trap = trapFocus(container);
      const firstButton = container.querySelector('button');
      const lastButton = container.querySelector('button:last-child');

      // Simulate Tab key from first element
      const tabForward = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: false,
        bubbles: true,
      });
      firstButton?.dispatchEvent(tabForward);

      // Simulate Shift+Tab from last element
      const tabBackward = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
      });
      lastButton?.dispatchEvent(tabBackward);

      trap.dispose();
      document.body.removeChild(container);
    });

    it('handles focusable elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button>Button</button>
        <div tabindex="0">Focusable div</div>
        <a href="#">Link</a>
      `;
      document.body.appendChild(container);

      const trap = trapFocus(container);
      const focusableElements = getFocusableElements(container);
      expect(focusableElements.length).toBe(3);

      trap.dispose();
      document.body.removeChild(container);
    });
  });

  describe('announceToScreenReader', () => {
    it('creates and announces message', () => {
      const message = 'Test announcement';
      announceToScreenReader(message);

      const liveRegion = document.getElementById('screen-reader-announcement');
      expect(liveRegion).toBeDefined();
      expect(liveRegion?.textContent).toBe(message);
      expect(liveRegion?.getAttribute('aria-live')).toBe('polite');
    });

    it('handles different announcement types', () => {
      const message = 'Important announcement';
      announceToScreenReader(message, 'assertive');

      const liveRegion = document.getElementById('screen-reader-announcement');
      expect(liveRegion?.getAttribute('aria-live')).toBe('assertive');
    });

    it('cleans up after announcement', async () => {
      const message = 'Test announcement';
      announceToScreenReader(message);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const liveRegion = document.getElementById('screen-reader-announcement');
      expect(liveRegion?.textContent).toBe('');
    });
  });

  describe('getFocusableElements', () => {
    it('finds all focusable elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button>Button</button>
        <input type="text">
        <select>
          <option>Option 1</option>
        </select>
        <textarea></textarea>
        <a href="#">Link</a>
        <div tabindex="0">Focusable div</div>
        <div tabindex="-1">Not focusable</div>
        <div>Not focusable</div>
      `;
      document.body.appendChild(container);

      const focusableElements = getFocusableElements(container);
      expect(focusableElements.length).toBe(7);

      document.body.removeChild(container);
    });

    it('handles disabled elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button disabled>Disabled button</button>
        <input type="text" disabled>
        <a href="#" aria-disabled="true">Disabled link</a>
      `;
      document.body.appendChild(container);

      const focusableElements = getFocusableElements(container);
      expect(focusableElements.length).toBe(0);

      document.body.removeChild(container);
    });

    it('handles hidden elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button style="display: none">Hidden button</button>
        <input type="text" style="visibility: hidden">
        <a href="#" style="opacity: 0">Hidden link</a>
      `;
      document.body.appendChild(container);

      const focusableElements = getFocusableElements(container);
      expect(focusableElements.length).toBe(0);

      document.body.removeChild(container);
    });
  });
});

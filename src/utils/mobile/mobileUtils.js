/**
 * Mobile Utilities for Playwright
 * 
 * Provides utilities for mobile testing with Playwright
 */
const config = require('../../config');

/**
 * Mobile Utilities class
 */
class MobileUtils {
  /**
   * Constructor
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {Object} options - Options
   */
  constructor(page, options = {}) {
    this.page = page;
    this.options = {
      viewport: options.viewport || config.mobile?.viewport || { width: 375, height: 667 },
      userAgent: options.userAgent || config.mobile?.userAgent,
      ...options
    };
  }
  
  /**
   * Set mobile viewport and user agent
   * @param {Object} options - Options
   * @returns {Promise<void>}
   */
  async setMobileEmulation(options = {}) {
    const viewport = options.viewport || this.options.viewport;
    const userAgent = options.userAgent || this.options.userAgent;
    
    // Set viewport
    await this.page.setViewportSize(viewport);
    
    // Set user agent if provided
    if (userAgent) {
      await this.page.setExtraHTTPHeaders({
        'User-Agent': userAgent
      });
    }
  }
  
  /**
   * Emulate specific device
   * @param {string} deviceName - Device name (e.g., 'iPhone 12')
   * @returns {Promise<void>}
   */
  async emulateDevice(deviceName) {
    // Get device descriptor
    const devices = {
      'iPhone 12': {
        viewport: { width: 390, height: 844 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true
      },
      'iPhone SE': {
        viewport: { width: 375, height: 667 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true
      },
      'Pixel 5': {
        viewport: { width: 393, height: 851 },
        userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36',
        deviceScaleFactor: 2.75,
        isMobile: true,
        hasTouch: true
      },
      'iPad Pro': {
        viewport: { width: 1024, height: 1366 },
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true
      },
      'Galaxy S20': {
        viewport: { width: 360, height: 800 },
        userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G980F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36',
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true
      }
    };
    
    const device = devices[deviceName];
    if (!device) {
      throw new Error(`Unknown device: ${deviceName}`);
    }
    
    // Set viewport
    await this.page.setViewportSize(device.viewport);
    
    // Set user agent
    await this.page.setExtraHTTPHeaders({
      'User-Agent': device.userAgent
    });
    
    // Set device scale factor and touch
    const context = this.page.context();
    await context.addInitScript(function(device) {
      window.devicePixelRatio = device.deviceScaleFactor;
      if (device.isMobile) {
        Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 5 });
      }
    }, device);
  }
  
  /**
   * Simulate device orientation
   * @param {Object} options - Orientation options
   * @param {number} options.alpha - Alpha value (0-360)
   * @param {number} options.beta - Beta value (0-180)
   * @param {number} options.gamma - Gamma value (-90-90)
   * @returns {Promise<void>}
   */
  async setDeviceOrientation(options = {}) {
    const alpha = options.alpha !== undefined ? options.alpha : 0;
    const beta = options.beta !== undefined ? options.beta : 0;
    const gamma = options.gamma !== undefined ? options.gamma : 0;
    
    await this.page.evaluate(({ alpha, beta, gamma }) => {
      if (window.DeviceOrientationEvent) {
        // Create and dispatch a device orientation event
        const event = new DeviceOrientationEvent('deviceorientation', {
          alpha,
          beta,
          gamma,
          absolute: true
        });
        window.dispatchEvent(event);
      }
    }, { alpha, beta, gamma });
  }
  
  /**
   * Simulate device motion
   * @param {Object} options - Motion options
   * @returns {Promise<void>}
   */
  async setDeviceMotion(options = {}) {
    const acceleration = options.acceleration || { x: 0, y: 0, z: 0 };
    const accelerationIncludingGravity = options.accelerationIncludingGravity || { x: 0, y: 0, z: 9.8 };
    const rotationRate = options.rotationRate || { alpha: 0, beta: 0, gamma: 0 };
    const interval = options.interval || 16;
    
    await this.page.evaluate(({ acceleration, accelerationIncludingGravity, rotationRate, interval }) => {
      if (window.DeviceMotionEvent) {
        // Create and dispatch a device motion event
        const event = new DeviceMotionEvent('devicemotion', {
          acceleration,
          accelerationIncludingGravity,
          rotationRate,
          interval
        });
        window.dispatchEvent(event);
      }
    }, { acceleration, accelerationIncludingGravity, rotationRate, interval });
  }
  
  /**
   * Simulate touch gesture
   * @param {string} gesture - Gesture type ('tap', 'swipe', 'pinch', 'rotate')
   * @param {Object} options - Gesture options
   * @returns {Promise<void>}
   */
  async performTouchGesture(gesture, options = {}) {
    switch (gesture) {
      case 'tap':
        await this._performTap(options);
        break;
      case 'swipe':
        await this._performSwipe(options);
        break;
      case 'pinch':
        await this._performPinch(options);
        break;
      case 'rotate':
        await this._performRotate(options);
        break;
      default:
        throw new Error(`Unknown gesture: ${gesture}`);
    }
  }
  
  /**
   * Perform tap gesture
   * @param {Object} options - Tap options
   * @private
   */
  async _performTap(options = {}) {
    const selector = options.selector;
    const position = options.position || { x: 0, y: 0 };
    const count = options.count || 1;
    
    if (selector) {
      // Tap on element
      const element = await this.page.$(selector);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }
      
      for (let i = 0; i < count; i++) {
        await element.tap();
        if (i < count - 1) {
          await this.page.waitForTimeout(100);
        }
      }
    } else {
      // Tap at position
      for (let i = 0; i < count; i++) {
        await this.page.touchscreen.tap(position.x, position.y);
        if (i < count - 1) {
          await this.page.waitForTimeout(100);
        }
      }
    }
  }
  
  /**
   * Perform swipe gesture
   * @param {Object} options - Swipe options
   * @private
   */
  async _performSwipe(options = {}) {
    const selector = options.selector;
    const direction = options.direction || 'up';
    const speed = options.speed || 'normal';
    
    // Calculate speed in milliseconds
    const duration = speed === 'slow' ? 600 : speed === 'normal' ? 300 : 100;
    
    if (selector) {
      // Swipe on element
      const element = await this.page.$(selector);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }
      
      const box = await element.boundingBox();
      if (!box) {
        throw new Error(`Element has no bounding box: ${selector}`);
      }
      
      // Calculate start and end positions based on direction
      let startX, startY, endX, endY;
      
      switch (direction) {
        case 'up':
          startX = box.x + box.width / 2;
          startY = box.y + box.height * 0.8;
          endX = startX;
          endY = box.y + box.height * 0.2;
          break;
        case 'down':
          startX = box.x + box.width / 2;
          startY = box.y + box.height * 0.2;
          endX = startX;
          endY = box.y + box.height * 0.8;
          break;
        case 'left':
          startX = box.x + box.width * 0.8;
          startY = box.y + box.height / 2;
          endX = box.x + box.width * 0.2;
          endY = startY;
          break;
        case 'right':
          startX = box.x + box.width * 0.2;
          startY = box.y + box.height / 2;
          endX = box.x + box.width * 0.8;
          endY = startY;
          break;
        default:
          throw new Error(`Unknown direction: ${direction}`);
      }
      
      // Perform swipe
      await this._performSwipeGesture(startX, startY, endX, endY, duration);
    } else {
      // Swipe on viewport
      const viewport = this.page.viewportSize();
      
      // Calculate start and end positions based on direction
      let startX, startY, endX, endY;
      
      switch (direction) {
        case 'up':
          startX = viewport.width / 2;
          startY = viewport.height * 0.8;
          endX = startX;
          endY = viewport.height * 0.2;
          break;
        case 'down':
          startX = viewport.width / 2;
          startY = viewport.height * 0.2;
          endX = startX;
          endY = viewport.height * 0.8;
          break;
        case 'left':
          startX = viewport.width * 0.8;
          startY = viewport.height / 2;
          endX = viewport.width * 0.2;
          endY = startY;
          break;
        case 'right':
          startX = viewport.width * 0.2;
          startY = viewport.height / 2;
          endX = viewport.width * 0.8;
          endY = startY;
          break;
        default:
          throw new Error(`Unknown direction: ${direction}`);
      }
      
      // Perform swipe
      await this._performSwipeGesture(startX, startY, endX, endY, duration);
    }
  }
  
  /**
   * Perform swipe gesture from start to end coordinates
   * @param {number} startX - Start X coordinate
   * @param {number} startY - Start Y coordinate
   * @param {number} endX - End X coordinate
   * @param {number} endY - End Y coordinate
   * @param {number} duration - Duration in milliseconds
   * @private
   */
  async _performSwipeGesture(startX, startY, endX, endY, duration) {
    // Use touchscreen API
    await this.page.touchscreen.tap(startX, startY);
    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    
    // Calculate steps based on duration
    const steps = Math.max(1, Math.floor(duration / 20));
    const deltaX = (endX - startX) / steps;
    const deltaY = (endY - startY) / steps;
    
    // Perform move in steps
    for (let i = 1; i <= steps; i++) {
      await this.page.mouse.move(
        startX + deltaX * i,
        startY + deltaY * i,
        { steps: 1 }
      );
      await this.page.waitForTimeout(20);
    }
    
    await this.page.mouse.up();
  }
  
  /**
   * Perform pinch gesture
   * @param {Object} options - Pinch options
   * @private
   */
  async _performPinch(options = {}) {
    const selector = options.selector;
    const scale = options.scale || 0.5; // < 1 pinch in, > 1 pinch out
    
    if (selector) {
      // Pinch on element
      const element = await this.page.$(selector);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }
      
      const box = await element.boundingBox();
      if (!box) {
        throw new Error(`Element has no bounding box: ${selector}`);
      }
      
      // Calculate center point
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      
      // Perform pinch using evaluate
      await this.page.evaluate(({ centerX, centerY, scale }) => {
        // Create touch points
        const touchDistance = 100;
        const touch1 = new Touch({
          identifier: 1,
          target: document.elementFromPoint(centerX, centerY),
          clientX: centerX - touchDistance,
          clientY: centerY,
          radiusX: 2.5,
          radiusY: 2.5,
          rotationAngle: 10,
          force: 0.5
        });
        
        const touch2 = new Touch({
          identifier: 2,
          target: document.elementFromPoint(centerX, centerY),
          clientX: centerX + touchDistance,
          clientY: centerY,
          radiusX: 2.5,
          radiusY: 2.5,
          rotationAngle: 10,
          force: 0.5
        });
        
        // Start gesture
        const touchStartEvent = new TouchEvent('touchstart', {
          touches: [touch1, touch2],
          targetTouches: [touch1, touch2],
          changedTouches: [touch1, touch2],
          bubbles: true
        });
        
        document.elementFromPoint(centerX, centerY).dispatchEvent(touchStartEvent);
        
        // Move touches for pinch
        const newDistance = touchDistance * scale;
        const touch1Move = new Touch({
          identifier: 1,
          target: document.elementFromPoint(centerX, centerY),
          clientX: centerX - newDistance,
          clientY: centerY,
          radiusX: 2.5,
          radiusY: 2.5,
          rotationAngle: 10,
          force: 0.5
        });
        
        const touch2Move = new Touch({
          identifier: 2,
          target: document.elementFromPoint(centerX, centerY),
          clientX: centerX + newDistance,
          clientY: centerY,
          radiusX: 2.5,
          radiusY: 2.5,
          rotationAngle: 10,
          force: 0.5
        });
        
        const touchMoveEvent = new TouchEvent('touchmove', {
          touches: [touch1Move, touch2Move],
          targetTouches: [touch1Move, touch2Move],
          changedTouches: [touch1Move, touch2Move],
          bubbles: true
        });
        
        document.elementFromPoint(centerX, centerY).dispatchEvent(touchMoveEvent);
        
        // End gesture
        const touchEndEvent = new TouchEvent('touchend', {
          touches: [],
          targetTouches: [],
          changedTouches: [touch1Move, touch2Move],
          bubbles: true
        });
        
        document.elementFromPoint(centerX, centerY).dispatchEvent(touchEndEvent);
      }, { centerX, centerY, scale });
    } else {
      // Pinch on viewport center
      const viewport = this.page.viewportSize();
      const centerX = viewport.width / 2;
      const centerY = viewport.height / 2;
      
      // Perform pinch using evaluate
      await this.page.evaluate(({ centerX, centerY, scale }) => {
        // Create touch points
        const touchDistance = 100;
        const touch1 = new Touch({
          identifier: 1,
          target: document.elementFromPoint(centerX, centerY),
          clientX: centerX - touchDistance,
          clientY: centerY,
          radiusX: 2.5,
          radiusY: 2.5,
          rotationAngle: 10,
          force: 0.5
        });
        
        const touch2 = new Touch({
          identifier: 2,
          target: document.elementFromPoint(centerX, centerY),
          clientX: centerX + touchDistance,
          clientY: centerY,
          radiusX: 2.5,
          radiusY: 2.5,
          rotationAngle: 10,
          force: 0.5
        });
        
        // Start gesture
        const touchStartEvent = new TouchEvent('touchstart', {
          touches: [touch1, touch2],
          targetTouches: [touch1, touch2],
          changedTouches: [touch1, touch2],
          bubbles: true
        });
        
        document.elementFromPoint(centerX, centerY).dispatchEvent(touchStartEvent);
        
        // Move touches for pinch
        const newDistance = touchDistance * scale;
        const touch1Move = new Touch({
          identifier: 1,
          target: document.elementFromPoint(centerX, centerY),
          clientX: centerX - newDistance,
          clientY: centerY,
          radiusX: 2.5,
          radiusY: 2.5,
          rotationAngle: 10,
          force: 0.5
        });
        
        const touch2Move = new Touch({
          identifier: 2,
          target: document.elementFromPoint(centerX, centerY),
          clientX: centerX + newDistance,
          clientY: centerY,
          radiusX: 2.5,
          radiusY: 2.5,
          rotationAngle: 10,
          force: 0.5
        });
        
        const touchMoveEvent = new TouchEvent('touchmove', {
          touches: [touch1Move, touch2Move],
          targetTouches: [touch1Move, touch2Move],
          changedTouches: [touch1Move, touch2Move],
          bubbles: true
        });
        
        document.elementFromPoint(centerX, centerY).dispatchEvent(touchMoveEvent);
        
        // End gesture
        const touchEndEvent = new TouchEvent('touchend', {
          touches: [],
          targetTouches: [],
          changedTouches: [touch1Move, touch2Move],
          bubbles: true
        });
        
        document.elementFromPoint(centerX, centerY).dispatchEvent(touchEndEvent);
      }, { centerX, centerY, scale });
    }
  }
  
  /**
   * Perform rotate gesture
   * @param {Object} options - Rotate options
   * @private
   */
  async _performRotate(options = {}) {
    const selector = options.selector;
    const angle = options.angle || 90; // Degrees
    
    if (selector) {
      // Rotate on element
      const element = await this.page.$(selector);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }
      
      const box = await element.boundingBox();
      if (!box) {
        throw new Error(`Element has no bounding box: ${selector}`);
      }
      
      // Calculate center point
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      
      // Perform rotate using evaluate
      await this.page.evaluate(({ centerX, centerY, angle }) => {
        // Create touch points
        const radius = 100;
        const startAngle = 0;
        const endAngle = startAngle + (angle * Math.PI / 180);
        
        const touch1StartX = centerX + radius * Math.cos(startAngle);
        const touch1StartY = centerY + radius * Math.sin(startAngle);
        const touch2StartX = centerX + radius * Math.cos(startAngle + Math.PI);
        const touch2StartY = centerY + radius * Math.sin(startAngle + Math.PI);
        
        const touch1EndX = centerX + radius * Math.cos(endAngle);
        const touch1EndY = centerY + radius * Math.sin(endAngle);
        const touch2EndX = centerX + radius * Math.cos(endAngle + Math.PI);
        const touch2EndY = centerY + radius * Math.sin(endAngle + Math.PI);
        
        // Start touches
        const touch1Start = new Touch({
          identifier: 1,
          target: document.elementFromPoint(centerX, centerY),
          clientX: touch1StartX,
          clientY: touch1StartY,
          radiusX: 2.5,
          radiusY: 2.5,
          rotationAngle: 10,
          force: 0.5
        });
        
        const touch2Start = new Touch({
          identifier: 2,
          target: document.elementFromPoint(centerX, centerY),
          clientX: touch2StartX,
          clientY: touch2StartY,
          radiusX: 2.5,
          radiusY: 2.5,
          rotationAngle: 10,
          force: 0.5
        });
        
        // Start gesture
        const touchStartEvent = new TouchEvent('touchstart', {
          touches: [touch1Start, touch2Start],
          targetTouches: [touch1Start, touch2Start],
          changedTouches: [touch1Start, touch2Start],
          bubbles: true
        });
        
        document.elementFromPoint(centerX, centerY).dispatchEvent(touchStartEvent);
        
        // Move touches for rotation
        const touch1End = new Touch({
          identifier: 1,
          target: document.elementFromPoint(centerX, centerY),
          clientX: touch1EndX,
          clientY: touch1EndY,
          radiusX: 2.5,
          radiusY: 2.5,
          rotationAngle: 10,
          force: 0.5
        });
        
        const touch2End = new Touch({
          identifier: 2,
          target: document.elementFromPoint(centerX, centerY),
          clientX: touch2EndX,
          clientY: touch2EndY,
          radiusX: 2.5,
          radiusY: 2.5,
          rotationAngle: 10,
          force: 0.5
        });
        
        const touchMoveEvent = new TouchEvent('touchmove', {
          touches: [touch1End, touch2End],
          targetTouches: [touch1End, touch2End],
          changedTouches: [touch1End, touch2End],
          bubbles: true
        });
        
        document.elementFromPoint(centerX, centerY).dispatchEvent(touchMoveEvent);
        
        // End gesture
        const touchEndEvent = new TouchEvent('touchend', {
          touches: [],
          targetTouches: [],
          changedTouches: [touch1End, touch2End],
          bubbles: true
        });
        
        document.elementFromPoint(centerX, centerY).dispatchEvent(touchEndEvent);
      }, { centerX, centerY, angle });
    } else {
      // Rotate on viewport center
      const viewport = this.page.viewportSize();
      const centerX = viewport.width / 2;
      const centerY = viewport.height / 2;
      
      // Perform rotate using evaluate
      await this.page.evaluate(({ centerX, centerY, angle }) => {
        // Create touch points
        const radius = 100;
        const startAngle = 0;
        const endAngle = startAngle + (angle * Math.PI / 180);
        
        const touch1StartX = centerX + radius * Math.cos(startAngle);
        const touch1StartY = centerY + radius * Math.sin(startAngle);
        const touch2StartX = centerX + radius * Math.cos(startAngle + Math.PI);
        const touch2StartY = centerY + radius * Math.sin(startAngle + Math.PI);
        
        const touch1EndX = centerX + radius * Math.cos(endAngle);
        const touch1EndY = centerY + radius * Math.sin(endAngle);
        const touch2EndX = centerX + radius * Math.cos(endAngle + Math.PI);
        const touch2EndY = centerY + radius * Math.sin(endAngle + Math.PI);
        
        // Start touches
        const touch1Start = new Touch({
          identifier: 1,
          target: document.elementFromPoint(centerX, centerY),
          clientX: touch1StartX,
          clientY: touch1StartY,
          radiusX: 2.5,
          radiusY: 2.5,
          rotationAngle: 10,
          force: 0.5
        });
        
        const touch2Start = new Touch({
          identifier: 2,
          target: document.elementFromPoint(centerX, centerY),
          clientX: touch2StartX,
          clientY: touch2StartY,
          radiusX: 2.5,
          radiusY: 2.5,
          rotationAngle: 10,
          force: 0.5
        });
        
        // Start gesture
        const touchStartEvent = new TouchEvent('touchstart', {
          touches: [touch1Start, touch2Start],
          targetTouches: [touch1Start, touch2Start],
          changedTouches: [touch1Start, touch2Start],
          bubbles: true
        });
        
        document.elementFromPoint(centerX, centerY).dispatchEvent(touchStartEvent);
        
        // Move touches for rotation
        const touch1End = new Touch({
          identifier: 1,
          target: document.elementFromPoint(centerX, centerY),
          clientX: touch1EndX,
          clientY: touch1EndY,
          radiusX: 2.5,
          radiusY: 2.5,
          rotationAngle: 10,
          force: 0.5
        });
        
        const touch2End = new Touch({
          identifier: 2,
          target: document.elementFromPoint(centerX, centerY),
          clientX: touch2EndX,
          clientY: touch2EndY,
          radiusX: 2.5,
          radiusY: 2.5,
          rotationAngle: 10,
          force: 0.5
        });
        
        const touchMoveEvent = new TouchEvent('touchmove', {
          touches: [touch1End, touch2End],
          targetTouches: [touch1End, touch2End],
          changedTouches: [touch1End, touch2End],
          bubbles: true
        });
        
        document.elementFromPoint(centerX, centerY).dispatchEvent(touchMoveEvent);
        
        // End gesture
        const touchEndEvent = new TouchEvent('touchend', {
          touches: [],
          targetTouches: [],
          changedTouches: [touch1End, touch2End],
          bubbles: true
        });
        
        document.elementFromPoint(centerX, centerY).dispatchEvent(touchEndEvent);
      }, { centerX, centerY, angle });
    }
  }
}

module.exports = MobileUtils;
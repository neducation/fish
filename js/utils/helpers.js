// Helper utilities and common functions

class NotificationManager {
  constructor() {
    this.notificationQueue = [];
    this.currentNotification = null;
    this.isShowing = false;
  }

  show(message, type = "info", duration = 3000) {
    const notification = {
      message,
      type,
      duration,
      id: Date.now() + Math.random(),
    };

    this.notificationQueue.push(notification);
    this.processQueue();
  }

  processQueue() {
    if (this.isShowing || this.notificationQueue.length === 0) return;

    this.isShowing = true;
    const notification = this.notificationQueue.shift();
    this.displayNotification(notification);
  }

  displayNotification(notification) {
    const notificationEl = document.getElementById("notification");
    const textEl = document.getElementById("notificationText");

    // Set content and type
    textEl.textContent = notification.message;
    notificationEl.className = `notification ${notification.type}`;

    // Show notification
    notificationEl.classList.add("show");
    this.currentNotification = notification;

    // Auto-hide after duration
    setTimeout(() => {
      this.hide();
    }, notification.duration);
  }

  hide() {
    const notificationEl = document.getElementById("notification");
    notificationEl.classList.remove("show");

    setTimeout(() => {
      this.isShowing = false;
      this.currentNotification = null;
      this.processQueue(); // Show next notification if any
    }, 300); // Wait for animation
  }

  clear() {
    this.notificationQueue = [];
    this.hide();
  }
}

// Utility functions
class GameUtils {
  static formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  }

  static formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  static randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  static randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  static randomInt(min, max) {
    return Math.floor(this.randomRange(min, max + 1));
  }

  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  static lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  static distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static generateId(prefix = "id") {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  static capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static getRandomColor() {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
    ];
    return this.randomChoice(colors);
  }

  static createElementFromHTML(htmlString) {
    const div = document.createElement("div");
    div.innerHTML = htmlString.trim();
    return div.firstChild;
  }

  static isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  static calculatePercentage(value, total) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  static shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  static weightedRandom(weights) {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return i;
      }
    }

    return weights.length - 1;
  }

  static interpolateColor(color1, color2, factor) {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);

    const r = Math.round(this.lerp(c1.r, c2.r, factor));
    const g = Math.round(this.lerp(c1.g, c2.g, factor));
    const b = Math.round(this.lerp(c1.b, c2.b, factor));

    return this.rgbToHex(r, g, b);
  }

  static hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  static rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  static getContrastColor(hexColor) {
    const rgb = this.hexToRgb(hexColor);
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? "#000000" : "#FFFFFF";
  }
}

// Animation utilities
class AnimationUtils {
  static fadeIn(element, duration = 300) {
    element.style.opacity = "0";
    element.style.display = "block";

    const start = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);

      element.style.opacity = progress.toString();

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  static fadeOut(element, duration = 300) {
    const start = performance.now();
    const startOpacity = parseFloat(element.style.opacity) || 1;

    const animate = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);

      element.style.opacity = (startOpacity * (1 - progress)).toString();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = "none";
      }
    };

    requestAnimationFrame(animate);
  }

  static slideIn(element, direction = "left", duration = 300) {
    const transforms = {
      left: "translateX(-100%)",
      right: "translateX(100%)",
      up: "translateY(-100%)",
      down: "translateY(100%)",
    };

    element.style.transform = transforms[direction];
    element.style.display = "block";

    const start = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);

      const easeProgress = this.easeOutCubic(progress);
      element.style.transform = `${transforms[direction].replace(
        "100%",
        `${100 * (1 - easeProgress)}%`
      )}`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.transform = "";
      }
    };

    requestAnimationFrame(animate);
  }

  static bounce(element, scale = 1.1, duration = 200) {
    const start = performance.now();
    const originalTransform = element.style.transform;

    const animate = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);

      let scaleValue;
      if (progress < 0.5) {
        scaleValue = 1 + (scale - 1) * (progress * 2);
      } else {
        scaleValue = scale - (scale - 1) * ((progress - 0.5) * 2);
      }

      element.style.transform = `${originalTransform} scale(${scaleValue})`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.transform = originalTransform;
      }
    };

    requestAnimationFrame(animate);
  }

  static easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  static easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}

// Performance monitoring
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: 0,
      frameTime: 0,
      memory: 0,
      updateTime: 0,
    };

    this.frameCount = 0;
    this.lastTime = performance.now();
    this.updateInterval = 1000; // Update every second
  }

  update() {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    this.frameCount++;

    if (deltaTime >= this.updateInterval) {
      this.metrics.fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.metrics.frameTime = Math.round(deltaTime / this.frameCount);

      // Memory usage (if available)
      if (performance.memory) {
        this.metrics.memory = Math.round(
          performance.memory.usedJSHeapSize / 1024 / 1024
        );
      }

      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }

  displayMetrics() {
    if (!this.displayElement) {
      this.createDisplayElement();
    }

    this.displayElement.textContent = `FPS: ${this.metrics.fps} | Frame: ${this.metrics.frameTime}ms | Memory: ${this.metrics.memory}MB`;
  }

  createDisplayElement() {
    this.displayElement = document.createElement("div");
    this.displayElement.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            pointer-events: none;
        `;
    document.body.appendChild(this.displayElement);
  }

  enable() {
    this.enabled = true;
    this.monitor();
  }

  disable() {
    this.enabled = false;
    if (this.displayElement) {
      this.displayElement.remove();
      this.displayElement = null;
    }
  }

  monitor() {
    if (!this.enabled) return;

    this.update();
    this.displayMetrics();

    requestAnimationFrame(() => this.monitor());
  }
}

// Initialize utilities
if (typeof window !== "undefined") {
  window.notificationManager = new NotificationManager();
  window.GameUtils = GameUtils;
  window.AnimationUtils = AnimationUtils;
  window.performanceMonitor = new PerformanceMonitor();

  // Enable performance monitoring in development
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    // window.performanceMonitor.enable(); // Uncomment to enable FPS display
  }
}

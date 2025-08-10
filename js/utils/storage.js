// Storage utilities for game state management

class StorageManager {
  constructor() {
    this.storageKey = "virtualAquariumGame";
    this.backupKey = "virtualAquariumBackup";
    this.maxBackups = 5;
  }

  save(gameState) {
    try {
      // Create backup before saving
      this.createBackup();

      // Prepare data for storage
      const saveData = {
        version: "1.0",
        timestamp: Date.now(),
        gameState: {
          ...gameState,
          collection: Array.from(gameState.collection), // Convert Set to Array
        },
      };

      // Save to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(saveData));

      return true;
    } catch (error) {
      console.error("Failed to save game:", error);
      return false;
    }
  }

  load() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) return null;

      const saveData = JSON.parse(saved);

      // Validate save data
      if (!this.validateSaveData(saveData)) {
        console.warn("Invalid save data detected");
        return null;
      }

      // Convert Array back to Set
      if (saveData.gameState.collection) {
        saveData.gameState.collection = new Set(saveData.gameState.collection);
      }

      return saveData.gameState;
    } catch (error) {
      console.error("Failed to load game:", error);
      return null;
    }
  }

  validateSaveData(saveData) {
    // Basic validation
    if (!saveData || !saveData.gameState) return false;
    if (!saveData.version || !saveData.timestamp) return false;

    const state = saveData.gameState;

    // Check required properties
    if (typeof state.coins !== "number") return false;
    if (!Array.isArray(state.fishInTank)) return false;
    if (typeof state.reputation !== "number") return false;

    return true;
  }

  createBackup() {
    try {
      const current = localStorage.getItem(this.storageKey);
      if (!current) return;

      // Get existing backups
      const backups = this.getBackups();

      // Add current save as backup
      const backup = {
        timestamp: Date.now(),
        data: current,
      };

      backups.push(backup);

      // Keep only recent backups
      if (backups.length > this.maxBackups) {
        backups.shift(); // Remove oldest
      }

      // Save backups
      localStorage.setItem(this.backupKey, JSON.stringify(backups));
    } catch (error) {
      console.error("Failed to create backup:", error);
    }
  }

  getBackups() {
    try {
      const saved = localStorage.getItem(this.backupKey);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to get backups:", error);
      return [];
    }
  }

  restoreBackup(backupIndex) {
    try {
      const backups = this.getBackups();
      if (backupIndex < 0 || backupIndex >= backups.length) {
        return false;
      }

      const backup = backups[backupIndex];
      localStorage.setItem(this.storageKey, backup.data);

      return true;
    } catch (error) {
      console.error("Failed to restore backup:", error);
      return false;
    }
  }

  export() {
    try {
      const gameData = localStorage.getItem(this.storageKey);
      if (!gameData) return null;

      const exportData = {
        game: "Virtual Aquarium",
        exportDate: new Date().toISOString(),
        data: JSON.parse(gameData),
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error("Failed to export data:", error);
      return null;
    }
  }

  import(importData) {
    try {
      const data = JSON.parse(importData);

      // Validate import data
      if (data.game !== "Virtual Aquarium") {
        throw new Error("Invalid game data");
      }

      if (!data.data || !this.validateSaveData(data.data)) {
        throw new Error("Invalid save data in import");
      }

      // Create backup before importing
      this.createBackup();

      // Import the data
      localStorage.setItem(this.storageKey, JSON.stringify(data.data));

      return true;
    } catch (error) {
      console.error("Failed to import data:", error);
      return false;
    }
  }

  clear() {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.backupKey);
      return true;
    } catch (error) {
      console.error("Failed to clear storage:", error);
      return false;
    }
  }

  getStorageInfo() {
    try {
      const gameData = localStorage.getItem(this.storageKey);
      const backupData = localStorage.getItem(this.backupKey);

      const info = {
        hasGameData: !!gameData,
        gameDataSize: gameData ? gameData.length : 0,
        backupCount: 0,
        backupSize: 0,
        lastSaved: null,
      };

      if (gameData) {
        const parsed = JSON.parse(gameData);
        info.lastSaved = new Date(parsed.timestamp);
      }

      if (backupData) {
        const backups = JSON.parse(backupData);
        info.backupCount = backups.length;
        info.backupSize = backupData.length;
      }

      return info;
    } catch (error) {
      console.error("Failed to get storage info:", error);
      return null;
    }
  }
}

// Auto-save functionality
class AutoSaveManager {
  constructor(storageManager, gameInstance) {
    this.storage = storageManager;
    this.game = gameInstance;
    this.autoSaveInterval = 30000; // 30 seconds
    this.lastSaveTime = 0;
    this.saveQueue = [];
    this.isProcessing = false;

    this.startAutoSave();
  }

  startAutoSave() {
    setInterval(() => {
      this.processSaveQueue();
    }, this.autoSaveInterval);

    // Save on page unload
    window.addEventListener("beforeunload", () => {
      this.forceSave();
    });

    // Save on visibility change (tab switching)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.queueSave();
      }
    });
  }

  queueSave() {
    const now = Date.now();
    this.saveQueue.push(now);

    // Remove old save requests
    this.saveQueue = this.saveQueue.filter(
      (time) => now - time < this.autoSaveInterval
    );
  }

  processSaveQueue() {
    if (this.isProcessing || this.saveQueue.length === 0) return;

    const now = Date.now();
    if (now - this.lastSaveTime < 10000) return; // Don't save more than once per 10 seconds

    this.isProcessing = true;

    try {
      const success = this.storage.save(this.game.gameState);
      if (success) {
        this.lastSaveTime = now;
        this.saveQueue = [];
        console.log("Auto-save completed");
      }
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  forceSave() {
    try {
      return this.storage.save(this.game.gameState);
    } catch (error) {
      console.error("Force save failed:", error);
      return false;
    }
  }
}

// Cloud save functionality (placeholder for future implementation)
class CloudSaveManager {
  constructor() {
    this.apiEndpoint = null; // Would be set to actual cloud service
    this.isEnabled = false;
  }

  async uploadSave(gameData) {
    if (!this.isEnabled) return false;

    try {
      // Placeholder for cloud upload
      console.log("Cloud save would upload here");
      return true;
    } catch (error) {
      console.error("Cloud save failed:", error);
      return false;
    }
  }

  async downloadSave() {
    if (!this.isEnabled) return null;

    try {
      // Placeholder for cloud download
      console.log("Cloud save would download here");
      return null;
    } catch (error) {
      console.error("Cloud load failed:", error);
      return null;
    }
  }

  async syncSave(localData) {
    if (!this.isEnabled) return localData;

    try {
      // Compare local and cloud saves, return most recent
      const cloudData = await this.downloadSave();

      if (!cloudData) return localData;
      if (!localData) return cloudData;

      // Compare timestamps
      const localTime = localData.timestamp || 0;
      const cloudTime = cloudData.timestamp || 0;

      return cloudTime > localTime ? cloudData : localData;
    } catch (error) {
      console.error("Cloud sync failed:", error);
      return localData;
    }
  }
}

// Initialize storage managers
if (typeof window !== "undefined") {
  window.storageManager = new StorageManager();
  window.cloudSaveManager = new CloudSaveManager();

  // Auto-save will be initialized when game starts
  window.initializeAutoSave = (gameInstance) => {
    window.autoSaveManager = new AutoSaveManager(
      window.storageManager,
      gameInstance
    );
  };
}

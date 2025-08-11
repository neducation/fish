// Main game controller
class VirtualAquariumGame {
  constructor() {
    // Set global game reference immediately so managers can access it
    window.game = this;

    this.gameState = {
      coins: 1000,
      fishInTank: [],
      collection: new Set(),
      reputation: 0,
      tankCleanliness: 100,
      fishHappiness: 100,
      decorations: [],
      selectedFish: [],
      breedingQueue: [],
      achievements: [],
      lastSave: Date.now(),
    };

    this.gameRunning = false;
    this.bubbleInterval = null;
    this.fishMovementInterval = null;
    this.tankDegradationInterval = null;
    this.currentTab = "tank"; // Track current tab

    this.init();
  }

  init() {
    const isNewGame = !this.loadGame();
    this.initializeUI();
    this.initializeMobileUI(); // Initialize mobile UI features

    // Add starter fish for new players
    if (isNewGame) {
      this.addStarterFish();
    }

    this.startGameLoop();
    this.startBubbles();
    this.startFishMovement();
    this.startTankDegradation();

    console.log("🐠 Virtual Aquarium Game initialized!");
  }

  // Initialize mobile UI features
  initializeMobileUI() {
    // Tab switching
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tabName = button.dataset.tab;
        this.switchTab(tabName, button, tabButtons, tabContents);
      });
    });

    // Floating Action Button
    const fab = document.querySelector(".fab");
    const quickMenu = document.querySelector(".quick-menu");

    if (fab && quickMenu) {
      fab.addEventListener("click", () => {
        quickMenu.classList.toggle("hidden");
      });

      // Close menu when clicking outside
      document.addEventListener("click", (e) => {
        if (!fab.contains(e.target) && !quickMenu.contains(e.target)) {
          quickMenu.classList.add("hidden");
        }
      });
    }

    // Quick action buttons
    this.initializeQuickActions();
  }

  // Switch between tabs
  switchTab(tabName, activeButton, allButtons, allContents) {
    // Update buttons
    allButtons.forEach((btn) => btn.classList.remove("active"));
    activeButton.classList.add("active");

    // Update content
    allContents.forEach((content) => content.classList.remove("active"));
    const targetContent = document.getElementById(`${tabName}-tab`);
    if (targetContent) {
      targetContent.classList.add("active");
    }

    this.currentTab = tabName;

    // Trigger tab-specific updates
    this.onTabSwitch(tabName);
  }

  // Handle tab switch events
  onTabSwitch(tabName) {
    switch (tabName) {
      case "tank":
        this.updateAquariumDisplay();
        break;
      case "shop":
        if (window.shopManager) {
          window.shopManager.refreshShop();
        }
        break;
      case "breed":
        // Update breeding interface
        break;
      case "book":
        if (window.pokedexManager) {
          window.pokedexManager.updatePokedex();
        }
        break;
      case "fish":
        // Update inventory
        break;
    }
  }

  // Initialize quick action buttons
  initializeQuickActions() {
    // Add event listeners for all action buttons
    const actionButtons = document.querySelectorAll("[data-action]");
    actionButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.action;
        this.handleQuickAction(action);
      });
    });
  }

  // Handle quick action events
  handleQuickAction(action) {
    switch (action) {
      case "feed":
        this.feedFish();
        break;
      case "clean":
        this.cleanTank();
        break;
      case "decorate":
        this.addDecoration();
        break;
      case "collector":
        this.attractCollector();
        break;
      default:
        console.log("Unknown action:", action);
    }
  }

  startGameLoop() {
    this.gameRunning = true;
    this.updateDisplay();

    // Update game every second
    setInterval(() => {
      if (this.gameRunning) {
        this.updateBreedingProgress();
        this.updateDisplay();
      }
    }, 1000);

    // Auto-save every 30 seconds
    setInterval(() => {
      this.autoSave();
    }, 30000);
  }

  initializeUI() {
    // Initialize managers
    window.shopManager = new ShopManager();
    window.collectionManager = new CollectionManager();
    window.inventoryManager = new InventoryManager();
    window.breedingManager = new BreedingManager();
    window.aquariumManager = new AquariumManager();

    // Initialize collector feature managers
    window.pokedexManager = new PokedexManager();
    window.spinWheelManager = new SpinWheelManager();

    // Initialize monetization managers if available
    if (typeof PurchaseManager !== "undefined") {
      window.purchaseManager = new PurchaseManager();
    }
    if (typeof AdManager !== "undefined") {
      window.adManager = new AdManager();
    }
    if (typeof MonetizationUI !== "undefined") {
      window.monetizationUI = new MonetizationUI();
    }

    // Initialize shop
    window.shopManager.initializeShop();

    // Initialize collection
    window.collectionManager.updateCollection();

    // Initialize collector features
    if (window.pokedexManager) {
      window.pokedexManager.addPokedexButton();
    }

    if (window.spinWheelManager) {
      window.spinWheelManager.updateDailySpinButton();
    }

    // Update all displays
    this.updateDisplay();
  }

  updateDisplay() {
    // Update stats
    document.getElementById("coins").textContent = this.gameState.coins;
    document.getElementById("fishCount").textContent =
      this.gameState.fishInTank.length;
    document.getElementById("reputation").textContent =
      this.gameState.reputation;
    document.getElementById("collectionProgress").textContent = `${
      this.gameState.collection.size
    }/${Object.keys(fishSpecies).length}`;

    // Update aquarium (only if manager is initialized)
    if (window.aquariumManager) {
      window.aquariumManager.updateAquarium();
    }

    // Update inventory (only if manager is initialized)
    if (window.inventoryManager) {
      window.inventoryManager.updateInventory();
    }
  }

  startBubbles() {
    this.bubbleInterval = setInterval(() => {
      this.createBubble();
    }, 800);
  }

  createBubble() {
    const container = document.getElementById("bubblesContainer");
    const bubble = document.createElement("div");
    bubble.className = "bubble";

    // Random size and position
    const size = Math.random() * 15 + 5;
    bubble.style.width = size + "px";
    bubble.style.height = size + "px";
    bubble.style.left = Math.random() * 90 + "%";
    bubble.style.animationDuration = Math.random() * 2 + 3 + "s";

    container.appendChild(bubble);

    // Remove bubble after animation
    setTimeout(() => {
      if (bubble.parentNode) {
        bubble.parentNode.removeChild(bubble);
      }
    }, 5000);
  }

  startFishMovement() {
    this.fishMovementInterval = setInterval(() => {
      this.gameState.fishInTank.forEach((fish) => {
        // Random movement
        fish.x += (Math.random() - 0.5) * 50;
        fish.y += (Math.random() - 0.5) * 30;

        // Keep fish in bounds
        fish.x = Math.max(20, Math.min(450, fish.x));
        fish.y = Math.max(20, Math.min(350, fish.y));
      });

      window.aquariumManager.updateAquarium();
    }, 3000);
  }

  startTankDegradation() {
    this.tankDegradationInterval = setInterval(() => {
      // Gradually decrease tank stats
      this.gameState.tankCleanliness = Math.max(
        0,
        this.gameState.tankCleanliness - 1
      );
      this.gameState.fishHappiness = Math.max(
        0,
        this.gameState.fishHappiness - 0.5
      );

      // Show warnings
      if (this.gameState.tankCleanliness < 30) {
        window.notificationManager.show("Tank is getting dirty! 🧽", "warning");
      }

      if (this.gameState.fishHappiness < 30) {
        window.notificationManager.show(
          "Fish are getting hungry! 🍎",
          "warning"
        );
      }
    }, 60000); // Every minute
  }

  updateBreedingProgress() {
    this.gameState.breedingQueue.forEach((breeding, index) => {
      breeding.timeLeft -= 1000;

      if (breeding.timeLeft <= 0) {
        // Breeding complete
        const newFish = window.breedingManager.completeBreed(breeding);
        this.addFishToTank(newFish);
        this.gameState.breedingQueue.splice(index, 1);

        window.notificationManager.show(
          `🐣 New ${fishSpecies[newFish.species].name} born!`,
          "success"
        );
      } else {
        // Update progress display
        const progress =
          ((breeding.totalTime - breeding.timeLeft) / breeding.totalTime) * 100;
        document.getElementById("progressFill").style.width = progress + "%";
        document.getElementById("breedingTimer").textContent = `${Math.ceil(
          breeding.timeLeft / 1000
        )}s remaining`;
      }
    });
  }

  addFishToTank(fishData) {
    const fish = {
      ...fishData,
      id: "fish_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
      x: Math.random() * 400 + 50,
      y: Math.random() * 300 + 50,
      age: 0,
      happiness: 100,
      traits: fishData.traits || [],
    };

    this.gameState.fishInTank.push(fish);
    this.gameState.collection.add(fish.species);

    // Add to reputation based on rarity
    const rarity = fishSpecies[fish.species].rarity;
    const reputationGain = rarityValues[rarity] || 1;
    this.gameState.reputation += reputationGain;

    this.updateDisplay();
    return fish;
  }

  removeFishFromTank(fishId) {
    this.gameState.fishInTank = this.gameState.fishInTank.filter(
      (fish) => fish.id !== fishId
    );
    this.updateDisplay();
  }

  addCoins(amount) {
    this.gameState.coins += amount;
    this.updateDisplay();
  }

  spendCoins(amount) {
    if (this.gameState.coins >= amount) {
      this.gameState.coins -= amount;
      this.updateDisplay();
      return true;
    }
    return false;
  }

  showNotification(message, type = "info") {
    if (window.notificationManager) {
      window.notificationManager.show(message, type);
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }

  autoSave() {
    this.saveGame();
    console.log("Game auto-saved");
  }

  saveGame() {
    try {
      const saveData = {
        ...this.gameState,
        collection: Array.from(this.gameState.collection),
        saveTime: Date.now(),
      };

      localStorage.setItem("virtualAquariumSave", JSON.stringify(saveData));
      window.notificationManager.show("Game saved! 💾", "success");
    } catch (error) {
      console.error("Failed to save game:", error);
      window.notificationManager.show("Failed to save game!", "error");
    }
  }

  loadGame() {
    try {
      const saveData = localStorage.getItem("virtualAquariumSave");
      if (saveData) {
        const data = JSON.parse(saveData);
        this.gameState = {
          ...this.gameState,
          ...data,
          collection: new Set(data.collection || []),
        };

        console.log("Game loaded successfully");
        return true;
      }
    } catch (error) {
      console.error("Failed to load game:", error);
    }
    return false;
  }

  addStarterFish() {
    // Add 2 starter goldfish for new players
    const starterFish1 = {
      id: "starter1",
      species: "goldfish",
      name: "Goldie",
      traits: ["orange", "friendly", "hardy"],
      age: 0,
      happiness: 100,
      health: 100,
      x: Math.random() * 300 + 50,
      y: Math.random() * 200 + 100,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
    };

    const starterFish2 = {
      id: "starter2",
      species: "goldfish",
      name: "Sunny",
      traits: ["orange", "friendly", "hardy"],
      age: 0,
      happiness: 100,
      health: 100,
      x: Math.random() * 300 + 50,
      y: Math.random() * 200 + 100,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
    };

    this.gameState.fishInTank.push(starterFish1, starterFish2);
    this.gameState.collection.add("goldfish");
    console.log("Added starter fish!");
  }

  resetGame() {
    if (
      confirm(
        "Are you sure you want to start a new game? This will delete your current progress."
      )
    ) {
      localStorage.removeItem("virtualAquariumSave");
      location.reload();
    }
  }
}

// Game action functions (called from HTML)
function feedFish() {
  if (window.game.spendCoins(10)) {
    window.game.gameState.fishHappiness = Math.min(
      100,
      window.game.gameState.fishHappiness + 30
    );

    // Visual effects
    if (window.aquariumManager) {
      window.aquariumManager.feedFish();
    }

    window.notificationManager.show(
      "Fish are happy and well-fed! 🐟",
      "success"
    );
  } else {
    window.notificationManager.show("Not enough coins!", "error");
  }
}

function cleanTank() {
  if (window.game.spendCoins(15)) {
    window.game.gameState.tankCleanliness = 100;

    // Visual effects
    if (window.aquariumManager) {
      window.aquariumManager.cleanTank();
    }

    window.notificationManager.show("Tank is sparkling clean! ✨", "success");
  } else {
    window.notificationManager.show("Not enough coins!", "error");
  }
}

function addDecoration() {
  if (window.game.spendCoins(25)) {
    const decorations = ["🌱", "🪨", "🐚", "⭐", "🏛️"];
    const decoration =
      decorations[Math.floor(Math.random() * decorations.length)];

    window.game.gameState.decorations.push({
      type: decoration,
      x: Math.random() * 400 + 50,
      y: Math.random() * 100 + 350,
    });

    window.aquariumManager.updateDecorations();
    window.notificationManager.show(
      "Beautiful decoration added! 🌟",
      "success"
    );
  } else {
    window.notificationManager.show("Not enough coins!", "error");
  }
}

function attractCollector() {
  if (window.game.spendCoins(50)) {
    const collectorMessages = [
      "Collector is impressed by your rare fish!",
      "Your aquarium attracts a marine biologist!",
      "Fish photographer wants to feature your tank!",
      "Aquarium magazine requests an interview!",
    ];

    const bonus = Math.floor(Math.random() * 100) + 100;
    window.game.addCoins(bonus);

    const message =
      collectorMessages[Math.floor(Math.random() * collectorMessages.length)];
    window.notificationManager.show(
      `${message} +${bonus} coins! 🏆`,
      "success"
    );

    window.game.gameState.reputation += 10;
  } else {
    window.notificationManager.show("Not enough coins!", "error");
  }
}

function saveGame() {
  window.game.saveGame();
}

function loadGame() {
  if (window.game.loadGame()) {
    window.game.updateDisplay();
    window.notificationManager.show("Game loaded! 📁", "success");
  } else {
    window.notificationManager.show("No saved game found!", "info");
  }
}

function resetGame() {
  window.game.resetGame();
}

function showHelp() {
  const helpText = `
🐠 Virtual Aquarium Game Help 🐠

🏪 Shop: Buy fish with coins
🧬 Breeding: Select 2 fish to create new species
🍎 Feed: Keep fish happy (10 coins)
🧽 Clean: Maintain tank cleanliness (15 coins)
🌱 Decorate: Add beautiful decorations (25 coins)
👤 Collector: Attract visitors for bonus coins (50 coins)
🎰 Daily Spin: Free daily rewards!
� Encyclopedia: Track your collection progress

�💡 Tips:
- Rare fish give more reputation
- Happy fish breed better
- Clean tanks attract collectors
- Use the daily spin wheel for free rewards
- Complete the encyclopedia for achievements
- Save regularly!
    `;

  alert(helpText);
}

// New collector functions
function openPokedex() {
  if (window.pokedexManager) {
    window.pokedexManager.open();
  }
}

function openDailyWheel() {
  if (window.spinWheelManager) {
    window.spinWheelManager.open("daily");
  }
}

function openPremiumWheel() {
  if (window.spinWheelManager) {
    window.spinWheelManager.open("premium");
  }
}

function selectBreedingSlot(slotNumber) {
  window.breedingManager.selectSlot(slotNumber);
}

function breedFish() {
  window.breedingManager.startBreeding();
}

function closeFishModal() {
  document.getElementById("fishModal").style.display = "none";
}

function closeNotification() {
  window.notificationManager.hide();
}

// Initialize game when page loads
document.addEventListener("DOMContentLoaded", () => {
  new VirtualAquariumGame();
});

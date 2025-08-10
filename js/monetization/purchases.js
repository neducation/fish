// In-App Purchase Manager for Virtual Aquarium
class PurchaseManager {
  constructor() {
    this.isStoreReady = false;
    this.products = [];

    // Define your in-app products
    this.productIds = [
      "com.virtualaquarium.coins_small", // 500 coins - $0.99
      "com.virtualaquarium.coins_medium", // 1500 coins - $2.99
      "com.virtualaquarium.coins_large", // 5000 coins - $9.99
      "com.virtualaquarium.premium_fish", // Premium fish pack - $4.99
      "com.virtualaquarium.remove_ads", // Remove ads permanently - $2.99
      "com.virtualaquarium.vip_membership", // VIP monthly subscription - $4.99/month
      "com.virtualaquarium.breeding_boost", // Faster breeding - $1.99
      "com.virtualaquarium.tank_expansion", // Extra tank slots - $3.99
    ];

    this.init();
  }

  init() {
    document.addEventListener("deviceready", () => {
      if (window.store) {
        this.setupStore();
      }
    });
  }

  setupStore() {
    // Register products
    this.productIds.forEach((productId) => {
      const productType = productId.includes("membership")
        ? window.store.PAID_SUBSCRIPTION
        : window.store.CONSUMABLE;

      window.store.register({
        id: productId,
        type: productType,
      });
    });

    // Setup event handlers
    window.store.when("product").updated(this.onProductUpdate.bind(this));
    window.store.when("product").approved(this.onPurchaseApproved.bind(this));
    window.store.when("product").verified(this.onPurchaseVerified.bind(this));
    window.store.when("product").cancelled(this.onPurchaseCancelled.bind(this));
    window.store.when("product").error(this.onPurchaseError.bind(this));

    // Initialize store
    window.store.refresh();
    this.isStoreReady = true;
    console.log("In-App Purchase store initialized");
  }

  onProductUpdate(product) {
    console.log("Product updated:", product);
    this.products.push(product);
  }

  onPurchaseApproved(product) {
    console.log("Purchase approved:", product.id);
    // Verify the purchase on your server here
    product.verify();
  }

  onPurchaseVerified(product) {
    console.log("Purchase verified:", product.id);
    this.deliverProduct(product);
    product.finish();
  }

  onPurchaseCancelled(product) {
    console.log("Purchase cancelled:", product.id);
    this.showNotification("Purchase cancelled", "error");
  }

  onPurchaseError(error) {
    console.error("Purchase error:", error);
    this.showNotification("Purchase failed. Please try again.", "error");
  }

  // Deliver purchased products to the user
  deliverProduct(product) {
    const gameState = window.game.gameState;

    switch (product.id) {
      case "com.virtualaquarium.coins_small":
        this.addCoins(500);
        this.showNotification("500 coins added to your account!", "success");
        break;

      case "com.virtualaquarium.coins_medium":
        this.addCoins(1500);
        this.showNotification("1500 coins added to your account!", "success");
        break;

      case "com.virtualaquarium.coins_large":
        this.addCoins(5000);
        this.showNotification("5000 coins added to your account!", "success");
        break;

      case "com.virtualaquarium.premium_fish":
        this.unlockPremiumFish();
        this.showNotification("Premium fish pack unlocked!", "success");
        break;

      case "com.virtualaquarium.remove_ads":
        gameState.adsRemoved = true;
        window.adManager.hideBannerAd();
        this.showNotification("Ads removed permanently!", "success");
        break;

      case "com.virtualaquarium.vip_membership":
        gameState.vipMembership = true;
        gameState.vipExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
        this.showNotification("VIP membership activated!", "success");
        break;

      case "com.virtualaquarium.breeding_boost":
        gameState.breedingBoost = true;
        this.showNotification("Breeding speed boost activated!", "success");
        break;

      case "com.virtualaquarium.tank_expansion":
        gameState.maxFishSlots = (gameState.maxFishSlots || 20) + 10;
        this.showNotification("Tank expanded! +10 fish slots", "success");
        break;
    }

    window.game.saveGame();
    window.game.updateDisplay();
  }

  // Helper methods
  addCoins(amount) {
    window.game.gameState.coins += amount;
    this.trackPurchase("coins", amount);
  }

  unlockPremiumFish() {
    const premiumSpecies = [
      "dragonfish",
      "lionfish",
      "moorish_idol",
      "royal_gramma",
    ];
    premiumSpecies.forEach((species) => {
      window.game.gameState.unlockedSpecies =
        window.game.gameState.unlockedSpecies || [];
      if (!window.game.gameState.unlockedSpecies.includes(species)) {
        window.game.gameState.unlockedSpecies.push(species);
      }
    });
    window.shopManager.populateShop();
  }

  showNotification(message, type) {
    if (window.game && window.game.showNotification) {
      window.game.showNotification(message, type);
    }
  }

  trackPurchase(type, amount) {
    // Track purchases for analytics/ad frequency
    window.game.gameState.totalPurchases =
      (window.game.gameState.totalPurchases || 0) + 1;
    window.game.gameState.totalSpent =
      (window.game.gameState.totalSpent || 0) + amount;
  }

  // Public methods to initiate purchases
  buyCoinsPack(packSize) {
    const productId = `com.virtualaquarium.coins_${packSize}`;
    if (this.isStoreReady && window.store.get(productId)) {
      window.store.order(productId);
    } else {
      this.showNotification("Store not ready. Please try again.", "error");
    }
  }

  buyPremiumFish() {
    this.purchase("com.virtualaquarium.premium_fish");
  }

  removeAds() {
    this.purchase("com.virtualaquarium.remove_ads");
  }

  buyVipMembership() {
    this.purchase("com.virtualaquarium.vip_membership");
  }

  buyBreedingBoost() {
    this.purchase("com.virtualaquarium.breeding_boost");
  }

  expandTank() {
    this.purchase("com.virtualaquarium.tank_expansion");
  }

  purchase(productId) {
    if (this.isStoreReady && window.store.get(productId)) {
      window.store.order(productId);
    } else {
      this.showNotification("Store not ready. Please try again.", "error");
    }
  }

  // Check if user has specific purchases
  hasRemoveAds() {
    return window.game?.gameState?.adsRemoved || false;
  }

  hasVipMembership() {
    if (!window.game?.gameState) return false;
    const gameState = window.game.gameState;
    return gameState.vipMembership && gameState.vipExpiry > Date.now();
  }

  hasBreedingBoost() {
    return window.game?.gameState?.breedingBoost || false;
  }
}

// Purchase Manager will be initialized by main.js

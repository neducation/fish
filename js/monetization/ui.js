// Monetization UI Components for Virtual Aquarium
class MonetizationUI {
  constructor() {
    this.init();
  }

  init() {
    this.createShopButton();
    this.createRewardedAdButtons();
    this.injectPremiumFeatures();
  }

  // Add shop button to main UI
  createShopButton() {
    const header = document.querySelector(".stats-bar");
    const shopBtn = document.createElement("button");
    shopBtn.className = "shop-btn premium-btn";
    shopBtn.innerHTML = "💎 SHOP";
    shopBtn.onclick = () => this.showPremiumShop();
    header.appendChild(shopBtn);
  }

  // Add rewarded ad buttons throughout the game
  createRewardedAdButtons() {
    // Add "Watch Ad for Coins" button
    const aquariumControls = document.querySelector(".aquarium-controls");
    const adBtn = document.createElement("button");
    adBtn.className = "control-btn ad-reward-btn";
    adBtn.innerHTML = "<span>📺</span> Watch Ad (+100 coins)";
    adBtn.onclick = () => this.watchAdForCoins();
    aquariumControls.appendChild(adBtn);

    // Add "Watch Ad for Free Fish" button to shop
    const shopPanel = document.querySelector(".shop-panel");
    const freeBtn = document.createElement("button");
    freeBtn.className = "free-fish-btn";
    freeBtn.innerHTML = "📺 Watch Ad for Free Fish!";
    freeBtn.onclick = () => this.watchAdForFish();
    shopPanel.insertBefore(freeBtn, shopPanel.firstChild.nextSibling);
  }

  // Show premium shop modal
  showPremiumShop() {
    const modal = document.createElement("div");
    modal.className = "modal premium-shop-modal";
    modal.innerHTML = `
      <div class="modal-content premium-shop-content">
        <span class="modal-close" onclick="this.parentElement.parentElement.remove()">&times;</span>
        <h2>💎 Premium Shop</h2>
        
        <!-- Coin Packs -->
        <div class="shop-category">
          <h3>💰 Coin Packs</h3>
          <div class="product-grid">
            <div class="product-item" onclick="window.purchaseManager.buyCoinsPack('small')">
              <div class="product-icon">💰</div>
              <div class="product-name">Small Coin Pack</div>
              <div class="product-desc">500 coins</div>
              <div class="product-price">$0.99</div>
            </div>
            <div class="product-item" onclick="window.purchaseManager.buyCoinsPack('medium')">
              <div class="product-icon">💰💰</div>
              <div class="product-name">Medium Coin Pack</div>
              <div class="product-desc">1,500 coins</div>
              <div class="product-price">$2.99</div>
            </div>
            <div class="product-item" onclick="window.purchaseManager.buyCoinsPack('large')">
              <div class="product-icon">💰💰💰</div>
              <div class="product-name">Large Coin Pack</div>
              <div class="product-desc">5,000 coins</div>
              <div class="product-price">$9.99</div>
            </div>
          </div>
        </div>

        <!-- Premium Features -->
        <div class="shop-category">
          <h3>✨ Premium Features</h3>
          <div class="product-grid">
            <div class="product-item" onclick="window.purchaseManager.removeAds()">
              <div class="product-icon">🚫📺</div>
              <div class="product-name">Remove Ads</div>
              <div class="product-desc">No more ads forever!</div>
              <div class="product-price">$2.99</div>
            </div>
            <div class="product-item" onclick="window.purchaseManager.buyVipMembership()">
              <div class="product-icon">👑</div>
              <div class="product-name">VIP Membership</div>
              <div class="product-desc">Double coins, exclusive fish</div>
              <div class="product-price">$4.99/month</div>
            </div>
            <div class="product-item" onclick="window.purchaseManager.buyBreedingBoost()">
              <div class="product-icon">⚡</div>
              <div class="product-name">Breeding Boost</div>
              <div class="product-desc">50% faster breeding</div>
              <div class="product-price">$1.99</div>
            </div>
          </div>
        </div>

        <!-- Fish Packs -->
        <div class="shop-category">
          <h3>🐠 Fish Packs</h3>
          <div class="product-grid">
            <div class="product-item" onclick="window.purchaseManager.buyPremiumFish()">
              <div class="product-icon">🐲</div>
              <div class="product-name">Premium Fish Pack</div>
              <div class="product-desc">4 exclusive rare species</div>
              <div class="product-price">$4.99</div>
            </div>
            <div class="product-item" onclick="window.purchaseManager.expandTank()">
              <div class="product-icon">🏠</div>
              <div class="product-name">Tank Expansion</div>
              <div class="product-desc">+10 fish slots</div>
              <div class="product-price">$3.99</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  // Rewarded ad for coins
  watchAdForCoins() {
    if (window.purchaseManager.hasRemoveAds()) {
      // VIP users get coins without ads
      this.giveCoinsReward(200);
      return;
    }

    window.adManager.showRewardedAd((success, reward) => {
      if (success) {
        this.giveCoinsReward(reward || 100);
      } else {
        window.game.showNotification("Ad not available right now", "error");
      }
    });
  }

  // Rewarded ad for free fish
  watchAdForFish() {
    if (window.purchaseManager.hasRemoveAds()) {
      // VIP users get fish without ads
      this.giveFishReward();
      return;
    }

    window.adManager.showRewardedAd((success) => {
      if (success) {
        this.giveFishReward();
      } else {
        window.game.showNotification("Ad not available right now", "error");
      }
    });
  }

  giveCoinsReward(amount) {
    window.game.gameState.coins += amount;
    window.game.updateDisplay();
    window.game.showNotification(`+${amount} coins from ad reward!`, "success");
    window.game.saveGame();
  }

  giveFishReward() {
    const randomSpecies = window.adManager.getRandomFishReward();
    const newFish = window.shopManager.generateFish(randomSpecies);

    window.game.gameState.fishInTank.push(newFish);
    window.game.gameState.collection.add(randomSpecies);
    window.game.updateDisplay();
    window.game.showNotification(
      `Free ${newFish.species} from ad reward!`,
      "success"
    );
    window.game.saveGame();
  }

  // Inject premium features throughout the game
  injectPremiumFeatures() {
    // Add VIP indicator
    this.addVipIndicator();

    // Modify breeding time for premium users
    this.modifyBreedingForPremium();

    // Add coin multiplier for VIP
    this.addVipCoinMultiplier();
  }

  addVipIndicator() {
    if (window.purchaseManager.hasVipMembership()) {
      const header = document.querySelector(".game-header h1");
      header.innerHTML = "👑 " + header.innerHTML + " 👑";
      header.style.color = "#ffd700";
    }
  }

  modifyBreedingForPremium() {
    if (window.purchaseManager.hasBreedingBoost()) {
      // This will be used in breeding.js to reduce breeding time by 50%
      window.game.gameState.breedingSpeedMultiplier = 0.5;
    }
  }

  addVipCoinMultiplier() {
    if (window.purchaseManager.hasVipMembership()) {
      // Double coin rewards for VIP members
      window.game.gameState.coinMultiplier = 2;
    }
  }

  // Show ads at strategic moments
  showInterstitialAd() {
    if (window.purchaseManager.hasRemoveAds()) {
      return; // No ads for premium users
    }

    if (window.adManager.shouldShowInterstitial()) {
      window.adManager.showInterstitialAd();
    }
  }

  // Show banner ads
  showBannerAds() {
    if (!window.purchaseManager.hasRemoveAds()) {
      window.adManager.showBannerAd();
    }
  }
}

// Monetization UI will be initialized by main.js

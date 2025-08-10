// Shop management system

class ShopManager {
  constructor() {
    this.shopItems = [];
    this.refreshInterval = 300000; // 5 minutes
    this.lastRefresh = 0;

    this.initializeShop();
  }

  initializeShop() {
    this.generateShopItems();
    this.populateShop();

    // Auto-refresh shop
    setInterval(() => {
      this.refreshShop();
    }, this.refreshInterval);
  }

  generateShopItems() {
    this.shopItems = [];

    // Always include some common fish
    const commonFish = ["goldfish", "clownfish", "betta"];
    commonFish.forEach((species) => {
      this.shopItems.push(this.createShopItem(species));
    });

    // Add random selection of other fish
    const availableFish = Object.keys(window.fishSpecies || {}).filter(
      (species) => !commonFish.includes(species)
    );

    // Weighted selection based on rarity
    for (let i = 0; i < 4; i++) {
      const selectedSpecies = this.selectRandomSpeciesByWeight(availableFish);
      if (selectedSpecies) {
        this.shopItems.push(this.createShopItem(selectedSpecies));
      }
    }

    // Chance for special items
    if (Math.random() < 0.3) {
      this.shopItems.push(this.createSpecialItem());
    }
  }

  selectRandomSpeciesByWeight(availableSpecies) {
    const weightedList = [];

    availableSpecies.forEach((species) => {
      const rarity = window.fishSpecies[species].rarity;
      const weight = this.getRarityWeight(rarity);

      for (let i = 0; i < weight; i++) {
        weightedList.push(species);
      }
    });

    if (weightedList.length === 0) return null;
    return weightedList[Math.floor(Math.random() * weightedList.length)];
  }

  getRarityWeight(rarity) {
    const weights = {
      common: 50,
      uncommon: 25,
      rare: 10,
      epic: 4,
      legendary: 1,
      mythical: 0.5,
    };
    return weights[rarity] || 1;
  }

  createShopItem(species) {
    const fishData = window.fishSpecies[species];
    const basePrice = fishData.basePrice;

    // Add price variation (±20%)
    const priceVariation = 0.8 + Math.random() * 0.4;
    const price = Math.floor(basePrice * priceVariation);

    // Chance for special traits
    const traits = [];
    if (Math.random() < 0.2) {
      const specialTrait = window.geneticsSystem.generateRandomTrait(
        fishData.rarity
      );
      if (specialTrait) {
        traits.push(specialTrait);
      }
    }

    return {
      id: "shop_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
      species: species,
      price: price,
      traits: traits,
      stock: Math.floor(Math.random() * 3) + 1, // 1-3 stock
      special: traits.length > 0,
    };
  }

  createSpecialItem() {
    const specialItems = [
      {
        type: "breeding_enhancer",
        name: "Love Potion",
        emoji: "💕",
        price: 100,
        description: "Increases breeding success by 25% for next breeding",
        effect: "breeding_bonus",
      },
      {
        type: "trait_mutator",
        name: "Mutation Serum",
        emoji: "🧪",
        price: 150,
        description: "Guarantees a new trait on next fish born",
        effect: "force_mutation",
      },
      {
        type: "happiness_booster",
        name: "Super Fish Food",
        emoji: "🍎",
        price: 75,
        description: "Instantly maximizes all fish happiness",
        effect: "max_happiness",
      },
      {
        type: "tank_cleaner",
        name: "Auto-Cleaner Bot",
        emoji: "🤖",
        price: 200,
        description: "Automatically keeps tank clean for 24 hours",
        effect: "auto_clean",
      },
    ];

    const item = specialItems[Math.floor(Math.random() * specialItems.length)];
    return {
      ...item,
      id:
        "special_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
      stock: 1,
    };
  }

  populateShop() {
    const shopGrid = document.getElementById("shopGrid");
    shopGrid.innerHTML = "";

    this.shopItems.forEach((item) => {
      const shopElement = this.createShopElement(item);
      shopGrid.appendChild(shopElement);
    });
  }

  createShopElement(item) {
    const element = document.createElement("div");
    element.className = "shop-item";
    element.onclick = () => this.buyItem(item);

    if (item.species) {
      // Fish item
      const fishData = window.fishSpecies[item.species];
      const traitsText =
        item.traits.length > 0 ? ` (${item.traits.join(", ")})` : "";

      element.innerHTML = `
                <div class="shop-item-header">
                    <span class="fish-preview">${fishData.emoji}</span>
                    <span class="fish-name">${fishData.name}${traitsText}</span>
                    <span class="fish-price">${item.price}💰</span>
                </div>
                <span class="fish-rarity rarity-${fishData.rarity}">${
        fishData.rarity
      }</span>
                <div class="stock-info">Stock: ${item.stock}</div>
                ${
                  item.special
                    ? '<div class="special-badge">✨ Special</div>'
                    : ""
                }
            `;

      element.classList.add(`rarity-${fishData.rarity}`);
    } else {
      // Special item
      element.innerHTML = `
                <div class="shop-item-header">
                    <span class="fish-preview">${item.emoji}</span>
                    <span class="fish-name">${item.name}</span>
                    <span class="fish-price">${item.price}💰</span>
                </div>
                <div class="item-description">${item.description}</div>
                <div class="stock-info">Stock: ${item.stock}</div>
                <div class="special-badge">🌟 Special Item</div>
            `;

      element.classList.add("special-item");
    }

    // Disable if can't afford or out of stock
    if (window.game.gameState.coins < item.price || item.stock <= 0) {
      element.classList.add("disabled");
      element.onclick = null;
    }

    return element;
  }

  buyItem(item) {
    if (window.game.gameState.coins < item.price) {
      window.notificationManager.show("Not enough coins!", "error");
      return;
    }

    if (item.stock <= 0) {
      window.notificationManager.show("Item out of stock!", "warning");
      return;
    }

    // Spend coins
    window.game.spendCoins(item.price);

    // Reduce stock
    item.stock--;

    if (item.species) {
      // Add fish to tank
      const fish = window.game.addFishToTank({
        species: item.species,
        traits: item.traits,
      });

      const fishData = window.fishSpecies[item.species];
      window.notificationManager.show(
        `Bought ${fishData.name}! Welcome to your aquarium! 🐠`,
        "success"
      );
    } else {
      // Special item effect
      this.applySpecialItemEffect(item);
      window.notificationManager.show(
        `Bought ${item.name}! ${item.description}`,
        "success"
      );
    }

    // Update display
    this.populateShop();
    window.game.updateDisplay();
  }

  applySpecialItemEffect(item) {
    switch (item.effect) {
      case "breeding_bonus":
        // Apply temporary breeding bonus
        window.game.gameState.breedingBonus = {
          type: "success_rate",
          value: 0.25,
          expires: Date.now() + 3600000, // 1 hour
        };
        break;

      case "force_mutation":
        // Next fish born will have guaranteed mutation
        window.game.gameState.forceMutation = true;
        break;

      case "max_happiness":
        // Max out all fish happiness
        window.game.gameState.fishInTank.forEach((fish) => {
          fish.happiness = 100;
        });
        window.game.gameState.fishHappiness = 100;
        break;

      case "auto_clean":
        // Auto-clean for 24 hours
        window.game.gameState.autoClean = {
          active: true,
          expires: Date.now() + 86400000, // 24 hours
        };
        window.game.gameState.tankCleanliness = 100;
        break;
    }
  }

  refreshShop() {
    const timeSinceLastRefresh = Date.now() - this.lastRefresh;

    if (timeSinceLastRefresh >= this.refreshInterval) {
      this.generateShopItems();
      this.populateShop();
      this.lastRefresh = Date.now();

      window.notificationManager.show("🏪 Shop inventory refreshed!", "info");
    }
  }

  addSpecialOffer(species, discount = 0.5) {
    const fishData = fishSpecies[species];
    const discountedPrice = Math.floor(fishData.basePrice * discount);

    const specialOffer = {
      id: "offer_" + Date.now(),
      species: species,
      price: discountedPrice,
      originalPrice: fishData.basePrice,
      traits: [],
      stock: 1,
      special: true,
      offer: true,
    };

    this.shopItems.unshift(specialOffer); // Add to beginning
    this.populateShop();

    window.notificationManager.show(
      `🔥 Special Offer! ${fishData.name} for ${discountedPrice} coins!`,
      "success"
    );
  }

  getShopValue() {
    return this.shopItems.reduce((total, item) => {
      return total + item.price * item.stock;
    }, 0);
  }

  hasSpecialItems() {
    return this.shopItems.some((item) => item.special || !item.species);
  }
}

// Shop manager will be initialized by main.js

// Collection and achievements system

class CollectionManager {
  constructor() {
    this.achievements = {
      // Collection achievements
      first_fish: {
        name: "First Fish",
        description: "Buy your first fish",
        reward: 50,
        unlocked: false,
      },
      species_collector_5: {
        name: "Collector I",
        description: "Collect 5 different species",
        reward: 100,
        unlocked: false,
      },
      species_collector_10: {
        name: "Collector II",
        description: "Collect 10 different species",
        reward: 200,
        unlocked: false,
      },
      species_collector_20: {
        name: "Master Collector",
        description: "Collect 20 different species",
        reward: 500,
        unlocked: false,
      },

      // Breeding achievements
      first_breed: {
        name: "Love is in the Air",
        description: "Successfully breed your first fish",
        reward: 75,
        unlocked: false,
      },
      breed_master: {
        name: "Breeding Master",
        description: "Successfully breed 10 fish",
        reward: 300,
        unlocked: false,
      },
      rare_breeder: {
        name: "Rare Breeder",
        description: "Breed a rare or higher fish",
        reward: 200,
        unlocked: false,
      },
      legendary_breeder: {
        name: "Legendary Breeder",
        description: "Breed a legendary fish",
        reward: 1000,
        unlocked: false,
      },

      // Trait achievements
      shiny_collector: {
        name: "Shiny Hunter",
        description: "Collect a shiny fish",
        reward: 150,
        unlocked: false,
      },
      trait_master: {
        name: "Trait Master",
        description: "Have fish with 5+ different traits",
        reward: 250,
        unlocked: false,
      },
      mutation_master: {
        name: "Mutation Master",
        description: "Create 5 fish with mutations",
        reward: 400,
        unlocked: false,
      },

      // Economic achievements
      wealthy: {
        name: "Wealthy Aquarist",
        description: "Accumulate 1000 coins",
        reward: 100,
        unlocked: false,
      },
      millionaire: {
        name: "Aquarium Millionaire",
        description: "Accumulate 10000 coins",
        reward: 1000,
        unlocked: false,
      },
      big_spender: {
        name: "Big Spender",
        description: "Spend 5000 coins total",
        reward: 300,
        unlocked: false,
      },

      // Care achievements
      caretaker: {
        name: "Good Caretaker",
        description: "Keep fish happy for 24 hours",
        reward: 150,
        unlocked: false,
      },
      clean_freak: {
        name: "Clean Freak",
        description: "Clean tank 50 times",
        reward: 200,
        unlocked: false,
      },
      fish_whisperer: {
        name: "Fish Whisperer",
        description: "Have 20 fish in tank at once",
        reward: 300,
        unlocked: false,
      },

      // Special achievements
      collector_magnet: {
        name: "Collector Magnet",
        description: "Attract 10 collectors",
        reward: 500,
        unlocked: false,
      },
      aquarium_artist: {
        name: "Aquarium Artist",
        description: "Add 20 decorations",
        reward: 250,
        unlocked: false,
      },
      time_keeper: {
        name: "Dedicated Keeper",
        description: "Play for 7 days total",
        reward: 1000,
        unlocked: false,
      },
    };

    this.collectionStats = {
      totalSpeciesCollected: 0,
      totalFishBred: 0,
      totalCoinsSpent: 0,
      totalCleaning: 0,
      totalCollectors: 0,
      totalDecorations: 0,
      playTime: 0,
      mutationsCreated: 0,
    };

    this.initializeCollection();
  }

  initializeCollection() {
    this.loadAchievements();
    this.updateCollection();

    // Check achievements periodically
    setInterval(() => {
      this.checkAchievements();
    }, 5000);
  }

  updateCollection() {
    const collectionGrid = document.getElementById("collectionGrid");
    if (!collectionGrid) return;

    collectionGrid.innerHTML = "";

    // Group by rarity
    const speciesByRarity = {};
    Object.keys(fishSpecies).forEach((species) => {
      const rarity = fishSpecies[species].rarity;
      if (!speciesByRarity[rarity]) {
        speciesByRarity[rarity] = [];
      }
      speciesByRarity[rarity].push(species);
    });

    // Display in rarity order
    const rarityOrder = [
      "common",
      "uncommon",
      "rare",
      "epic",
      "legendary",
      "mythical",
    ];

    rarityOrder.forEach((rarity) => {
      if (speciesByRarity[rarity]) {
        const raritySection = document.createElement("div");
        raritySection.className = "collection-rarity-section";
        raritySection.innerHTML = `<h4 class="rarity-${rarity}">${rarity.toUpperCase()}</h4>`;

        const rarityGrid = document.createElement("div");
        rarityGrid.className = "collection-rarity-grid";

        speciesByRarity[rarity].forEach((species) => {
          const item = this.createCollectionItem(species);
          rarityGrid.appendChild(item);
        });

        raritySection.appendChild(rarityGrid);
        collectionGrid.appendChild(raritySection);
      }
    });

    // Update collection progress
    this.updateCollectionProgress();
  }

  createCollectionItem(species) {
    const fishData = fishSpecies[species];
    const isCollected = window.game.gameState.collection.has(species);
    const fishInTank = window.game.gameState.fishInTank.filter(
      (f) => f.species === species
    );

    const element = document.createElement("div");
    element.className = `collection-item ${
      isCollected ? "collected" : "locked"
    }`;
    element.onclick = () => this.showSpeciesInfo(species, isCollected);

    if (isCollected) {
      const bestTraits = this.getBestTraitsForSpecies(species);
      const count = fishInTank.length;

      element.innerHTML = `
                <span class="collection-fish">${fishData.emoji}</span>
                <span class="collection-name">${fishData.name}</span>
                ${
                  count > 0
                    ? `<span class="collection-count">${count}</span>`
                    : ""
                }
                ${
                  bestTraits.length > 0
                    ? `<div class="best-traits">${bestTraits.join("⭐")}</div>`
                    : ""
                }
            `;

      element.title = `${fishData.name} - ${fishData.rarity} - Collected: ${count}`;
    } else {
      element.innerHTML = `
                <span class="collection-fish">❓</span>
                <span class="collection-name">???</span>
            `;
      element.title = "Not yet discovered";
    }

    return element;
  }

  getBestTraitsForSpecies(species) {
    const fishOfSpecies = window.game.gameState.fishInTank.filter(
      (f) => f.species === species
    );
    const allTraits = new Set();

    fishOfSpecies.forEach((fish) => {
      if (fish.traits) {
        fish.traits.forEach((trait) => allTraits.add(trait));
      }
    });

    // Return rare traits only
    return Array.from(allTraits).filter((trait) => {
      const rarity = window.geneticsSystem.getTraitRarity(trait);
      return rarity <= 0.1; // Only show rare traits
    });
  }

  showSpeciesInfo(species, isCollected) {
    const modal = document.getElementById("fishModal");
    const details = document.getElementById("fishDetails");

    const fishData = fishSpecies[species];

    let infoHTML = `<h2>${fishData.emoji} ${fishData.name}</h2>`;

    if (isCollected) {
      const fishInTank = window.game.gameState.fishInTank.filter(
        (f) => f.species === species
      );
      const firstDiscovered = this.getFirstDiscoveryDate(species);

      infoHTML += `
                <p><strong>Rarity:</strong> <span class="rarity-${
                  fishData.rarity
                }">${fishData.rarity}</span></p>
                <p><strong>Description:</strong> ${fishData.description}</p>
                <p><strong>Owned:</strong> ${fishInTank.length}</p>
                <p><strong>Base Price:</strong> ${fishData.basePrice} coins</p>
                <p><strong>Breeding Time:</strong> ${
                  fishData.breedingTime / 1000
                }s</p>
                ${
                  firstDiscovered
                    ? `<p><strong>First Discovered:</strong> ${firstDiscovered}</p>`
                    : ""
                }
                
                <h3>Collection Stats:</h3>
                <ul>
                    <li>Total bred: ${this.getBreedingCount(species)}</li>
                    <li>Highest generation: ${this.getHighestGeneration(
                      species
                    )}</li>
                    <li>Unique traits seen: ${this.getUniqueTraitCount(
                      species
                    )}</li>
                    <li>Total value: ${this.getTotalSpeciesValue(
                      species
                    )} coins</li>
                </ul>
            `;
    } else {
      infoHTML += `
                <p><strong>Status:</strong> Not yet discovered</p>
                <p><em>Discover this fish by breeding, buying from shop, or special events!</em></p>
                
                <h3>Hints:</h3>
                <ul>
                    <li>Rarity: ${fishData.rarity}</li>
                    <li>Try different breeding combinations</li>
                    <li>Check the shop regularly</li>
                    ${this.getDiscoveryHint(species)}
                </ul>
            `;
    }

    details.innerHTML = infoHTML;
    modal.style.display = "block";
  }

  getDiscoveryHint(species) {
    // Provide hints based on breeding combinations
    const hints = [];

    // Check if this species is a result of any breeding combination
    Object.entries(window.FishGenetics.getBreedingCombination).forEach(
      ([combination, result]) => {
        if (result === species) {
          const [parent1, parent2] = combination.split("+");
          if (fishSpecies[parent1] && fishSpecies[parent2]) {
            hints.push(
              `<li>Try breeding ${fishSpecies[parent1].name} + ${fishSpecies[parent2].name}</li>`
            );
          }
        }
      }
    );

    return hints.join("");
  }

  updateCollectionProgress() {
    const totalSpecies = Object.keys(fishSpecies).length;
    const collectedSpecies = window.game.gameState.collection.size;
    const percentage = Math.floor((collectedSpecies / totalSpecies) * 100);

    // Update progress display if it exists
    const progressElement = document.getElementById("collectionProgress");
    if (progressElement) {
      progressElement.textContent = `${collectedSpecies}/${totalSpecies}`;
    }

    // Update collection stats
    this.collectionStats.totalSpeciesCollected = collectedSpecies;
  }

  checkAchievements() {
    let newAchievements = [];

    // Collection achievements
    if (
      window.game.gameState.collection.size >= 1 &&
      !this.achievements.first_fish.unlocked
    ) {
      newAchievements.push(this.unlockAchievement("first_fish"));
    }

    if (
      window.game.gameState.collection.size >= 5 &&
      !this.achievements.species_collector_5.unlocked
    ) {
      newAchievements.push(this.unlockAchievement("species_collector_5"));
    }

    if (
      window.game.gameState.collection.size >= 10 &&
      !this.achievements.species_collector_10.unlocked
    ) {
      newAchievements.push(this.unlockAchievement("species_collector_10"));
    }

    if (
      window.game.gameState.collection.size >= 20 &&
      !this.achievements.species_collector_20.unlocked
    ) {
      newAchievements.push(this.unlockAchievement("species_collector_20"));
    }

    // Economic achievements
    if (
      window.game.gameState.coins >= 1000 &&
      !this.achievements.wealthy.unlocked
    ) {
      newAchievements.push(this.unlockAchievement("wealthy"));
    }

    if (
      window.game.gameState.coins >= 10000 &&
      !this.achievements.millionaire.unlocked
    ) {
      newAchievements.push(this.unlockAchievement("millionaire"));
    }

    // Tank achievements
    if (
      window.game.gameState.fishInTank.length >= 20 &&
      !this.achievements.fish_whisperer.unlocked
    ) {
      newAchievements.push(this.unlockAchievement("fish_whisperer"));
    }

    // Trait achievements
    const hasShinyFish = window.game.gameState.fishInTank.some(
      (fish) => fish.traits && fish.traits.includes("shiny")
    );
    if (hasShinyFish && !this.achievements.shiny_collector.unlocked) {
      newAchievements.push(this.unlockAchievement("shiny_collector"));
    }

    // Check for rare breeding
    const hasRareBred = window.game.gameState.fishInTank.some((fish) => {
      const rarity = fishSpecies[fish.species].rarity;
      const rarityValue = rarityValues[rarity];
      return rarityValue >= 8 && fish.generation > 1; // Rare or higher, and bred
    });
    if (hasRareBred && !this.achievements.rare_breeder.unlocked) {
      newAchievements.push(this.unlockAchievement("rare_breeder"));
    }

    // Show notifications for new achievements
    newAchievements.forEach((achievement) => {
      this.showAchievementNotification(achievement);
    });
  }

  unlockAchievement(achievementId) {
    const achievement = this.achievements[achievementId];
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      achievement.unlockedDate = new Date().toISOString();

      // Award coins
      window.game.addCoins(achievement.reward);

      this.saveAchievements();
      return achievement;
    }
    return null;
  }

  showAchievementNotification(achievement) {
    if (!achievement) return;

    // Create special achievement notification
    const notification = document.createElement("div");
    notification.className = "achievement-notification";
    notification.innerHTML = `
            <div class="achievement-header">
                <span class="achievement-icon">🏆</span>
                <span class="achievement-title">Achievement Unlocked!</span>
            </div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-description">${achievement.description}</div>
            <div class="achievement-reward">+${achievement.reward} coins</div>
        `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.add("show");
    }, 100);

    // Remove after delay
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 500);
    }, 5000);
  }

  getAchievementProgress() {
    const total = Object.keys(this.achievements).length;
    const unlocked = Object.values(this.achievements).filter(
      (a) => a.unlocked
    ).length;
    return {
      unlocked,
      total,
      percentage: Math.floor((unlocked / total) * 100),
    };
  }

  showAchievementsList() {
    const modal = document.getElementById("fishModal");
    const details = document.getElementById("fishDetails");

    let achievementsHTML = "<h2>🏆 Achievements</h2>";

    const progress = this.getAchievementProgress();
    achievementsHTML += `<p>Progress: ${progress.unlocked}/${progress.total} (${progress.percentage}%)</p><hr>`;

    Object.entries(this.achievements).forEach(([id, achievement]) => {
      const status = achievement.unlocked ? "✅" : "⏳";
      const date = achievement.unlockedDate
        ? `<br><small>Unlocked: ${new Date(
            achievement.unlockedDate
          ).toLocaleDateString()}</small>`
        : "";

      achievementsHTML += `
                <div class="achievement-item ${
                  achievement.unlocked ? "unlocked" : "locked"
                }">
                    <span class="achievement-status">${status}</span>
                    <div class="achievement-details">
                        <strong>${achievement.name}</strong>
                        <p>${achievement.description}</p>
                        <p>Reward: ${achievement.reward} coins</p>
                        ${date}
                    </div>
                </div>
                <br>
            `;
    });

    details.innerHTML = achievementsHTML;
    modal.style.display = "block";
  }

  saveAchievements() {
    try {
      const achievementData = {
        achievements: this.achievements,
        stats: this.collectionStats,
      };
      localStorage.setItem(
        "aquariumAchievements",
        JSON.stringify(achievementData)
      );
    } catch (error) {
      console.error("Failed to save achievements:", error);
    }
  }

  loadAchievements() {
    try {
      const saved = localStorage.getItem("aquariumAchievements");
      if (saved) {
        const data = JSON.parse(saved);
        if (data.achievements) {
          // Merge with current achievements (in case new ones were added)
          Object.keys(data.achievements).forEach((id) => {
            if (this.achievements[id]) {
              this.achievements[id] = {
                ...this.achievements[id],
                ...data.achievements[id],
              };
            }
          });
        }
        if (data.stats) {
          this.collectionStats = { ...this.collectionStats, ...data.stats };
        }
      }
    } catch (error) {
      console.error("Failed to load achievements:", error);
    }
  }

  // Helper methods for achievement checking
  getBreedingCount(species) {
    return window.game.gameState.fishInTank.filter(
      (fish) => fish.species === species && fish.generation > 1
    ).length;
  }

  getHighestGeneration(species) {
    const fishOfSpecies = window.game.gameState.fishInTank.filter(
      (f) => f.species === species
    );
    return fishOfSpecies.reduce(
      (max, fish) => Math.max(max, fish.generation || 1),
      0
    );
  }

  getUniqueTraitCount(species) {
    const fishOfSpecies = window.game.gameState.fishInTank.filter(
      (f) => f.species === species
    );
    const allTraits = new Set();

    fishOfSpecies.forEach((fish) => {
      if (fish.traits) {
        fish.traits.forEach((trait) => allTraits.add(trait));
      }
    });

    return allTraits.size;
  }

  getTotalSpeciesValue(species) {
    const fishOfSpecies = window.game.gameState.fishInTank.filter(
      (f) => f.species === species
    );
    return fishOfSpecies.reduce((total, fish) => {
      return total + window.geneticsSystem.calculateGeneticValue(fish);
    }, 0);
  }

  getFirstDiscoveryDate(species) {
    // This would need to be tracked when fish are first acquired
    // For now, just return a placeholder
    return "Unknown";
  }
}

// Collection manager will be initialized by main.js

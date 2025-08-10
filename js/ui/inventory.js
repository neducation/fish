// Inventory management system

class InventoryManager {
  constructor() {
    this.selectedFish = [];
  }

  updateInventory() {
    // Group fish by species
    const fishCounts = {};
    const fishExamples = {};

    window.game.gameState.fishInTank.forEach((fish) => {
      const key = fish.species;

      if (!fishCounts[key]) {
        fishCounts[key] = 0;
        fishExamples[key] = fish;
      }
      fishCounts[key]++;
    });

    // Update inventory display
    const inventoryElement =
      document.getElementById("inventory") || this.createInventoryElement();
    inventoryElement.innerHTML = "";

    // Sort by rarity and then by name
    const sortedSpecies = Object.keys(fishCounts).sort((a, b) => {
      const rarityA = rarityValues[fishSpecies[a].rarity];
      const rarityB = rarityValues[fishSpecies[b].rarity];

      if (rarityA !== rarityB) {
        return rarityB - rarityA; // Higher rarity first
      }

      return fishSpecies[a].name.localeCompare(fishSpecies[b].name);
    });

    sortedSpecies.forEach((species) => {
      const count = fishCounts[species];
      const exampleFish = fishExamples[species];
      const inventoryItem = this.createInventoryItem(
        species,
        count,
        exampleFish
      );
      inventoryElement.appendChild(inventoryItem);
    });

    // Show empty message if no fish
    if (sortedSpecies.length === 0) {
      inventoryElement.innerHTML = `
                <div class="empty-inventory">
                    <p>🐠 Your aquarium is empty!</p>
                    <p>Visit the shop to buy your first fish.</p>
                </div>
            `;
    }
  }

  createInventoryElement() {
    const inventoryPanel = document.querySelector(".collection-panel");
    if (inventoryPanel) {
      inventoryPanel.innerHTML = `
                <h3>🗂️ Your Fish Collection</h3>
                <div class="inventory-grid" id="inventory"></div>
            `;
      return document.getElementById("inventory");
    }
    return null;
  }

  createInventoryItem(species, count, exampleFish) {
    const fishData = fishSpecies[species];
    const element = document.createElement("div");
    element.className = "inventory-item";
    element.onclick = () => this.selectSpecies(species);

    // Calculate average traits for this species
    const allFishOfSpecies = window.game.gameState.fishInTank.filter(
      (f) => f.species === species
    );
    const commonTraits = this.getCommonTraits(allFishOfSpecies);
    const averageHappiness = this.getAverageHappiness(allFishOfSpecies);
    const totalValue = this.getTotalValue(allFishOfSpecies);

    element.innerHTML = `
            <span class="inventory-fish">${fishData.emoji}</span>
            <div class="inventory-details">
                <div class="inventory-name">${fishData.name}</div>
                <div class="inventory-stats">
                    <span class="rarity-${fishData.rarity}">${
      fishData.rarity
    }</span>
                    ${
                      commonTraits.length > 0
                        ? `• ${commonTraits.join(", ")}`
                        : ""
                    }
                </div>
                <div class="inventory-stats">
                    ❤️ ${averageHappiness}% • 💰 ${totalValue}
                </div>
            </div>
            <span class="inventory-count">${count}</span>
        `;

    // Add selection state
    if (this.selectedFish.includes(species)) {
      element.classList.add("selected");
    }

    return element;
  }

  selectSpecies(species) {
    // Toggle selection
    const index = this.selectedFish.indexOf(species);
    if (index > -1) {
      this.selectedFish.splice(index, 1);
    } else {
      this.selectedFish.push(species);
    }

    this.updateInventory();
    this.showSpeciesDetails(species);
  }

  showSpeciesDetails(species) {
    const modal = document.getElementById("fishModal");
    const details = document.getElementById("fishDetails");

    const fishData = fishSpecies[species];
    const fishOfSpecies = window.game.gameState.fishInTank.filter(
      (f) => f.species === species
    );

    if (fishOfSpecies.length === 0) return;

    let detailsHTML = `
            <h2>${fishData.emoji} ${fishData.name}</h2>
            <p><strong>Rarity:</strong> <span class="rarity-${fishData.rarity}">${fishData.rarity}</span></p>
            <p><strong>Description:</strong> ${fishData.description}</p>
            <p><strong>Count:</strong> ${fishOfSpecies.length}</p>
            <hr>
            <h3>Individual Fish:</h3>
        `;

    fishOfSpecies.forEach((fish, index) => {
      const traits = fish.traits ? fish.traits.join(", ") : "None";
      const happiness = Math.floor(fish.happiness || 100);
      const generation = fish.generation || 1;
      const value = window.geneticsSystem.calculateGeneticValue(fish);

      detailsHTML += `
                <div class="fish-individual">
                    <strong>Fish #${index + 1}</strong>
                    <p>Generation: ${generation} | Happiness: ${happiness}% | Value: ${value}💰</p>
                    <p>Traits: ${traits}</p>
                    <button onclick="inventoryManager.sellFish('${
                      fish.id
                    }')" class="sell-btn">
                        Sell for ${Math.floor(value * 0.7)}💰
                    </button>
                </div>
                <br>
            `;
    });

    // Add breeding recommendations
    detailsHTML += "<hr><h3>🧬 Breeding Recommendations:</h3>";
    const recommendations = this.getBreedingRecommendations(species);

    if (recommendations.length > 0) {
      recommendations.forEach((rec) => {
        detailsHTML += `
                    <p>• ${fishSpecies[rec.partner].name} 
                    (${rec.success}% success${
          rec.special ? `, creates ${rec.special}` : ""
        })</p>
                `;
      });
    } else {
      detailsHTML +=
        "<p>No good breeding partners found in your collection.</p>";
    }

    details.innerHTML = detailsHTML;
    modal.style.display = "block";
  }

  getCommonTraits(fishList) {
    const traitCounts = {};
    const totalFish = fishList.length;

    fishList.forEach((fish) => {
      if (fish.traits) {
        fish.traits.forEach((trait) => {
          traitCounts[trait] = (traitCounts[trait] || 0) + 1;
        });
      }
    });

    // Return traits that appear in at least 50% of fish
    return Object.entries(traitCounts)
      .filter(([trait, count]) => count >= Math.ceil(totalFish * 0.5))
      .map(([trait, count]) => trait);
  }

  getAverageHappiness(fishList) {
    if (fishList.length === 0) return 0;

    const totalHappiness = fishList.reduce((sum, fish) => {
      return sum + (fish.happiness || 100);
    }, 0);

    return Math.floor(totalHappiness / fishList.length);
  }

  getTotalValue(fishList) {
    return fishList.reduce((total, fish) => {
      return total + window.geneticsSystem.calculateGeneticValue(fish);
    }, 0);
  }

  getBreedingRecommendations(species) {
    const recommendations = [];
    const fishCounts = {};

    // Count all species in tank
    window.game.gameState.fishInTank.forEach((fish) => {
      fishCounts[fish.species] = (fishCounts[fish.species] || 0) + 1;
    });

    // Check breeding combinations
    Object.keys(fishCounts).forEach((otherSpecies) => {
      if (otherSpecies !== species && fishCounts[otherSpecies] > 0) {
        const combination = window.FishGenetics.getBreedingCombination(
          species,
          otherSpecies
        );
        const success = window.FishGenetics.calculateBreedingSuccess(
          { species: species },
          { species: otherSpecies }
        );

        recommendations.push({
          partner: otherSpecies,
          success: Math.floor(success * 100),
          special: combination ? fishSpecies[combination].name : null,
        });
      }
    });

    // Sort by success rate
    recommendations.sort((a, b) => b.success - a.success);

    return recommendations.slice(0, 3); // Top 3 recommendations
  }

  sellFish(fishId) {
    const fish = window.game.gameState.fishInTank.find((f) => f.id === fishId);
    if (!fish) return;

    const value = window.geneticsSystem.calculateGeneticValue(fish);
    const sellPrice = Math.floor(value * 0.7); // 70% of genetic value

    if (
      confirm(`Sell ${fishSpecies[fish.species].name} for ${sellPrice} coins?`)
    ) {
      // Remove fish from tank
      window.game.removeFishFromTank(fishId);

      // Add coins
      window.game.addCoins(sellPrice);

      window.notificationManager.show(
        `Sold ${fishSpecies[fish.species].name} for ${sellPrice} coins!`,
        "success"
      );

      // Update displays
      this.updateInventory();
      window.aquariumManager.updateAquarium();

      // Close modal
      document.getElementById("fishModal").style.display = "none";
    }
  }

  getTotalInventoryValue() {
    return window.game.gameState.fishInTank.reduce((total, fish) => {
      return total + window.geneticsSystem.calculateGeneticValue(fish);
    }, 0);
  }

  getInventoryStats() {
    const stats = {
      totalFish: window.game.gameState.fishInTank.length,
      uniqueSpecies: new Set(
        window.game.gameState.fishInTank.map((f) => f.species)
      ).size,
      totalValue: this.getTotalInventoryValue(),
      averageGeneration: 0,
      rareTraitCount: 0,
    };

    if (stats.totalFish > 0) {
      // Calculate average generation
      const totalGenerations = window.game.gameState.fishInTank.reduce(
        (sum, fish) => {
          return sum + (fish.generation || 1);
        },
        0
      );
      stats.averageGeneration = Math.floor(totalGenerations / stats.totalFish);

      // Count rare traits
      window.game.gameState.fishInTank.forEach((fish) => {
        if (fish.traits) {
          fish.traits.forEach((trait) => {
            const rarity = window.geneticsSystem.getTraitRarity(trait);
            if (rarity <= 0.1) {
              stats.rareTraitCount++;
            }
          });
        }
      });
    }

    return stats;
  }

  exportInventory() {
    const inventoryData = {
      exportDate: new Date().toISOString(),
      totalFish: window.game.gameState.fishInTank.length,
      fish: window.game.gameState.fishInTank.map((fish) => ({
        species: fishSpecies[fish.species].name,
        rarity: fishSpecies[fish.species].rarity,
        traits: fish.traits || [],
        generation: fish.generation || 1,
        happiness: fish.happiness || 100,
        value: window.geneticsSystem.calculateGeneticValue(fish),
      })),
    };

    const dataStr = JSON.stringify(inventoryData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "aquarium_inventory.json";
    link.click();

    URL.revokeObjectURL(url);

    window.notificationManager.show("Inventory exported! 📊", "success");
  }
}

// Inventory manager will be initialized by main.js

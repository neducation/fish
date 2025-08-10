// Breeding system management

class BreedingManager {
  constructor() {
    this.selectedSlots = [null, null];
    this.breedingInProgress = false;
  }

  selectSlot(slotNumber) {
    const selectedFish = window.game.gameState.selectedFish;

    if (selectedFish.length === 0) {
      window.notificationManager.show(
        "Select a fish from the aquarium first!",
        "info"
      );
      return;
    }

    const fish = selectedFish[0];
    const slotIndex = slotNumber - 1;

    // Check if fish is already in a slot
    if (this.selectedSlots.includes(fish)) {
      window.notificationManager.show(
        "This fish is already selected for breeding!",
        "warning"
      );
      return;
    }

    // Add fish to slot
    this.selectedSlots[slotIndex] = fish;

    // Remove from selected fish
    window.game.gameState.selectedFish =
      window.game.gameState.selectedFish.filter((f) => f.id !== fish.id);

    // Update displays
    this.updateBreedingSlots();
    window.aquariumManager.updateAquarium();

    window.notificationManager.show(
      `${fishSpecies[fish.species].name} added to breeding slot ${slotNumber}!`,
      "success"
    );
  }

  updateBreedingSlots() {
    const slot1 = document.getElementById("parent1");
    const slot2 = document.getElementById("parent2");
    const breedBtn = document.getElementById("breedBtn");

    // Update slot 1
    if (this.selectedSlots[0]) {
      const fish = this.selectedSlots[0];
      slot1.innerHTML = `
                <div class="breeding-fish">${
                  fishSpecies[fish.species].emoji
                }</div>
                <div class="slot-label">${fishSpecies[fish.species].name}</div>
                <button onclick="breedingManager.removeFromSlot(1)" class="remove-btn">×</button>
            `;
      slot1.classList.add("filled");
    } else {
      slot1.innerHTML = '<span class="slot-label">Parent 1</span>';
      slot1.classList.remove("filled");
    }

    // Update slot 2
    if (this.selectedSlots[1]) {
      const fish = this.selectedSlots[1];
      slot2.innerHTML = `
                <div class="breeding-fish">${
                  fishSpecies[fish.species].emoji
                }</div>
                <div class="slot-label">${fishSpecies[fish.species].name}</div>
                <button onclick="breedingManager.removeFromSlot(2)" class="remove-btn">×</button>
            `;
      slot2.classList.add("filled");
    } else {
      slot2.innerHTML = '<span class="slot-label">Parent 2</span>';
      slot2.classList.remove("filled");
    }

    // Update breed button
    const canBreed =
      this.selectedSlots[0] &&
      this.selectedSlots[1] &&
      !this.breedingInProgress &&
      window.game.gameState.coins >= 30;
    breedBtn.disabled = !canBreed;

    if (this.selectedSlots[0] && this.selectedSlots[1]) {
      const compatibility = this.getBreedingCompatibility(
        this.selectedSlots[0],
        this.selectedSlots[1]
      );
      breedBtn.textContent = `Breed (${compatibility}% success) - 30 coins`;
    } else {
      breedBtn.textContent = "Start Breeding (30 coins)";
    }
  }

  removeFromSlot(slotNumber) {
    const slotIndex = slotNumber - 1;
    const fish = this.selectedSlots[slotIndex];

    if (fish) {
      this.selectedSlots[slotIndex] = null;
      this.updateBreedingSlots();
      window.notificationManager.show(
        `${fishSpecies[fish.species].name} removed from breeding!`,
        "info"
      );
    }
  }

  startBreeding() {
    if (!this.selectedSlots[0] || !this.selectedSlots[1]) {
      window.notificationManager.show(
        "Select two fish for breeding!",
        "warning"
      );
      return;
    }

    if (!window.game.spendCoins(30)) {
      window.notificationManager.show(
        "Not enough coins for breeding!",
        "error"
      );
      return;
    }

    if (this.breedingInProgress) {
      window.notificationManager.show(
        "Breeding already in progress!",
        "warning"
      );
      return;
    }

    const parent1 = this.selectedSlots[0];
    const parent2 = this.selectedSlots[1];

    // Check compatibility
    if (!this.canBreed(parent1, parent2)) {
      window.notificationManager.show(
        "These fish cannot breed together!",
        "error"
      );
      return;
    }

    // Start breeding process
    this.breedingInProgress = true;

    // Calculate breeding time
    const baseTime = 60000; // 1 minute base
    const rarity1 = fishSpecies[parent1.species].rarity;
    const rarity2 = fishSpecies[parent2.species].rarity;
    const timeMultiplier = (rarityValues[rarity1] + rarityValues[rarity2]) / 2;
    const breedingTime = baseTime * timeMultiplier;

    // Add to breeding queue
    const breedingProcess = {
      parent1: parent1,
      parent2: parent2,
      startTime: Date.now(),
      totalTime: breedingTime,
      timeLeft: breedingTime,
    };

    window.game.gameState.breedingQueue.push(breedingProcess);

    // Update UI
    this.showBreedingProgress();
    this.selectedSlots = [null, null];
    this.updateBreedingSlots();

    // Add special effect
    window.aquariumManager.addSpecialEffect("breeding-heart", {
      x: (parent1.x + parent2.x) / 2,
      y: (parent1.y + parent2.y) / 2,
    });

    window.notificationManager.show(
      `Breeding started! Estimated time: ${Math.ceil(breedingTime / 1000)}s`,
      "success"
    );
  }

  showBreedingProgress() {
    const progressDiv = document.getElementById("breedingProgress");
    progressDiv.style.display = "block";
  }

  hideBreedingProgress() {
    const progressDiv = document.getElementById("breedingProgress");
    progressDiv.style.display = "none";
    this.breedingInProgress = false;
  }

  completeBreed(breedingProcess) {
    const offspring = window.FishGenetics.generateOffspring(
      breedingProcess.parent1,
      breedingProcess.parent2
    );

    this.hideBreedingProgress();

    if (!offspring) {
      window.notificationManager.show(
        "Breeding failed! Try again with compatible fish.",
        "error"
      );
      return null;
    }

    // Calculate rarity upgrade chance
    const rarityUpgradeChance = this.calculateRarityUpgrade(
      breedingProcess.parent1,
      breedingProcess.parent2
    );
    if (Math.random() < rarityUpgradeChance) {
      offspring.species = this.upgradeRarity(offspring.species);
      window.notificationManager.show("🌟 Rare offspring produced!", "success");
    }

    return offspring;
  }

  canBreed(fish1, fish2) {
    if (!fish1 || !fish2) return false;
    if (fish1.id === fish2.id) return false;

    // Check if fish are the same species (higher success rate)
    if (fish1.species === fish2.species) return true;

    // Check for special breeding combinations
    const combination = window.FishGenetics.getBreedingCombination(
      fish1.species,
      fish2.species
    );
    if (combination) return true;

    // Check rarity compatibility (similar rarities can breed)
    const rarity1 = fishSpecies[fish1.species].rarity;
    const rarity2 = fishSpecies[fish2.species].rarity;
    const rarityDiff = Math.abs(rarityValues[rarity1] - rarityValues[rarity2]);

    return rarityDiff <= 10; // Allow breeding if rarity difference is small
  }

  getBreedingCompatibility(fish1, fish2) {
    if (!this.canBreed(fish1, fish2)) return 0;

    const success = window.FishGenetics.calculateBreedingSuccess(fish1, fish2);
    return Math.floor(success * 100);
  }

  calculateRarityUpgrade(parent1, parent2) {
    const rarity1 = fishSpecies[parent1.species].rarity;
    const rarity2 = fishSpecies[parent2.species].rarity;

    // Higher rarity parents = higher upgrade chance
    const baseUpgradeChance = 0.05;
    const rarityBonus = (rarityValues[rarity1] + rarityValues[rarity2]) * 0.002;

    // Special traits increase chance
    let traitBonus = 0;
    if (parent1.traits) {
      if (parent1.traits.includes("shiny")) traitBonus += 0.02;
      if (parent1.traits.includes("mystical")) traitBonus += 0.05;
    }
    if (parent2.traits) {
      if (parent2.traits.includes("shiny")) traitBonus += 0.02;
      if (parent2.traits.includes("mystical")) traitBonus += 0.05;
    }

    return Math.min(0.2, baseUpgradeChance + rarityBonus + traitBonus);
  }

  upgradeRarity(species) {
    const currentRarity = fishSpecies[species].rarity;
    const rarityOrder = [
      "common",
      "uncommon",
      "rare",
      "epic",
      "legendary",
      "mythical",
    ];
    const currentIndex = rarityOrder.indexOf(currentRarity);

    if (currentIndex < rarityOrder.length - 1) {
      const nextRarity = rarityOrder[currentIndex + 1];
      return window.FishGenetics.getRandomSpeciesByRarity(nextRarity);
    }

    return species; // Already highest rarity
  }

  getBreedingRecommendations(fish) {
    const recommendations = [];

    window.game.gameState.fishInTank.forEach((otherFish) => {
      if (otherFish.id !== fish.id && this.canBreed(fish, otherFish)) {
        const compatibility = this.getBreedingCompatibility(fish, otherFish);
        const combination = window.FishGenetics.getBreedingCombination(
          fish.species,
          otherFish.species
        );

        recommendations.push({
          fish: otherFish,
          compatibility: compatibility,
          specialResult: combination || null,
        });
      }
    });

    // Sort by compatibility
    recommendations.sort((a, b) => b.compatibility - a.compatibility);

    return recommendations;
  }

  showBreedingGuide() {
    const modal = document.getElementById("fishModal");
    const details = document.getElementById("fishDetails");

    let guideHTML = "<h3>🧬 Breeding Guide</h3>";
    guideHTML += "<h4>Special Combinations:</h4><ul>";

    const combinations = {
      "Goldfish + Clownfish": "Fancy Guppy",
      "Angelfish + Betta": "Discus Fish",
      "Neon Tetra + Guppy": "Mandarin Fish",
      "Discus + Mandarin": "Dragon Fish",
      "Seahorse + Angelfish": "Lionfish",
      "Dragon + Lionfish": "Koi Dragon",
      "Koi Dragon + Phoenix": "Baby Leviathan",
    };

    Object.entries(combinations).forEach(([combo, result]) => {
      guideHTML += `<li>${combo} = ${result}</li>`;
    });

    guideHTML += "</ul>";
    guideHTML += "<p><strong>Tips:</strong></p>";
    guideHTML += "<ul>";
    guideHTML += "<li>Same species have higher success rates</li>";
    guideHTML += "<li>Happy fish breed better</li>";
    guideHTML += "<li>Rare fish can produce rarity upgrades</li>";
    guideHTML += "<li>Special traits increase rare offspring chances</li>";
    guideHTML += "</ul>";

    details.innerHTML = guideHTML;
    modal.style.display = "block";
  }
}

// Breeding manager will be initialized by main.js

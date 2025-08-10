// Genetics and trait system

class GeneticsSystem {
  constructor() {
    this.traitDatabase = {
      // Physical traits
      size: {
        tiny: { effect: "Moves faster, needs less food", rarity: 0.1 },
        small: { effect: "Slightly faster movement", rarity: 0.3 },
        large: { effect: "Slower but more impressive", rarity: 0.2 },
        giant: { effect: "Very slow but highly valuable", rarity: 0.05 },
      },

      // Color traits
      color: {
        shiny: { effect: "Attracts collectors, +50% value", rarity: 0.05 },
        rainbow: { effect: "Multiple colors, +100% value", rarity: 0.02 },
        translucent: { effect: "Semi-transparent, unique look", rarity: 0.08 },
        glowing: { effect: "Bioluminescent, attracts mates", rarity: 0.03 },
      },

      // Behavioral traits
      behavior: {
        aggressive: { effect: "Territorial, breeds less often", rarity: 0.15 },
        peaceful: { effect: "Gets along with others", rarity: 0.4 },
        playful: { effect: "More active, attracts visitors", rarity: 0.25 },
        wise: { effect: "Lives longer, teaches others", rarity: 0.1 },
      },

      // Magical traits (rare)
      magical: {
        mystical: { effect: "Enhances breeding success", rarity: 0.01 },
        ancient: {
          effect: "Immune to disease, very long-lived",
          rarity: 0.005,
        },
        blessed: { effect: "Brings good luck to tank", rarity: 0.008 },
        cursed: {
          effect: "Brings challenges but rare offspring",
          rarity: 0.003,
        },
      },
    };

    this.mutationChance = 0.1;
    this.traitInheritanceChance = 0.7;
  }

  generateRandomTraits(species, parentTraits = []) {
    const traits = [];
    const speciesData = fishSpecies[species];

    // Inherit base traits from species
    if (speciesData.traits) {
      speciesData.traits.forEach((trait) => {
        if (Math.random() < 0.9) {
          // 90% chance to inherit species traits
          traits.push(trait);
        }
      });
    }

    // Inherit from parents
    parentTraits.forEach((trait) => {
      if (Math.random() < this.traitInheritanceChance) {
        traits.push(trait);
      }
    });

    // Chance for new random traits
    if (Math.random() < this.mutationChance) {
      const newTrait = this.generateRandomTrait(speciesData.rarity);
      if (newTrait) {
        traits.push(newTrait);
      }
    }

    // Remove duplicates
    return [...new Set(traits)];
  }

  generateRandomTrait(rarity) {
    // Higher rarity species have better chance for rare traits
    const rarityMultiplier = rarityValues[rarity] || 1;
    const enhancedChance = Math.min(1, this.mutationChance * rarityMultiplier);

    if (Math.random() > enhancedChance) return null;

    // Select trait category based on rarity
    let availableCategories = ["size", "color", "behavior"];

    if (rarityMultiplier >= 5) {
      availableCategories.push("magical");
    }

    const category =
      availableCategories[
        Math.floor(Math.random() * availableCategories.length)
      ];
    const traits = this.traitDatabase[category];

    // Weighted selection based on trait rarity
    const weightedTraits = [];
    Object.entries(traits).forEach(([traitName, traitData]) => {
      const weight = Math.floor((1 - traitData.rarity) * 100);
      for (let i = 0; i < weight; i++) {
        weightedTraits.push(traitName);
      }
    });

    return weightedTraits[Math.floor(Math.random() * weightedTraits.length)];
  }

  calculateTraitEffects(fish) {
    const effects = {
      valueMultiplier: 1,
      breedingSuccessBonus: 0,
      movementSpeed: 1,
      happiness: 0,
      specialEffects: [],
    };

    if (!fish.traits) return effects;

    fish.traits.forEach((trait) => {
      switch (trait) {
        case "shiny":
          effects.valueMultiplier *= 1.5;
          effects.specialEffects.push("attracts_collectors");
          break;
        case "rainbow":
          effects.valueMultiplier *= 2;
          effects.specialEffects.push("rainbow_effect");
          break;
        case "large":
          effects.valueMultiplier *= 1.3;
          effects.movementSpeed *= 0.8;
          break;
        case "small":
          effects.movementSpeed *= 1.2;
          effects.valueMultiplier *= 0.8;
          break;
        case "mystical":
          effects.breedingSuccessBonus += 0.2;
          effects.specialEffects.push("breeding_enhancement");
          break;
        case "peaceful":
          effects.happiness += 10;
          break;
        case "aggressive":
          effects.breedingSuccessBonus -= 0.1;
          effects.happiness -= 5;
          break;
        case "ancient":
          effects.valueMultiplier *= 3;
          effects.specialEffects.push("immunity");
          break;
        case "blessed":
          effects.specialEffects.push("luck_bonus");
          effects.happiness += 20;
          break;
      }
    });

    return effects;
  }

  crossBreedTraits(parent1Traits, parent2Traits) {
    const offspringTraits = [];
    const allTraits = [...parent1Traits, ...parent2Traits];

    // Each trait has inheritance chance
    allTraits.forEach((trait) => {
      if (Math.random() < this.traitInheritanceChance) {
        offspringTraits.push(trait);
      }
    });

    // Chance for trait combination creating new trait
    if (parent1Traits.includes("shiny") && parent2Traits.includes("large")) {
      if (Math.random() < 0.3) {
        offspringTraits.push("majestic");
      }
    }

    if (
      parent1Traits.includes("mystical") &&
      parent2Traits.includes("ancient")
    ) {
      if (Math.random() < 0.4) {
        offspringTraits.push("legendary_bloodline");
      }
    }

    // Mutation chance
    if (Math.random() < this.mutationChance * 2) {
      // Higher chance during breeding
      const newTrait = this.generateRandomTrait("rare");
      if (newTrait) {
        offspringTraits.push(newTrait);
      }
    }

    return [...new Set(offspringTraits)];
  }

  getTraitDescription(trait) {
    // Search through all categories for the trait
    for (const category of Object.values(this.traitDatabase)) {
      if (category[trait]) {
        return category[trait].effect;
      }
    }

    // Default descriptions for common traits
    const defaultDescriptions = {
      orange: "Bright orange coloration",
      striped: "Natural stripe patterns",
      friendly: "Gets along well with others",
      hardy: "Resistant to poor conditions",
      elegant: "Graceful swimming motion",
      playful: "Very active and energetic",
    };

    return defaultDescriptions[trait] || "Special trait";
  }

  getTraitRarity(trait) {
    for (const category of Object.values(this.traitDatabase)) {
      if (category[trait]) {
        return category[trait].rarity;
      }
    }
    return 0.5; // Default medium rarity
  }

  calculateGeneticValue(fish) {
    const baseValue = fishSpecies[fish.species].basePrice;
    const effects = this.calculateTraitEffects(fish);
    const generationBonus = 1 + (fish.generation || 1) * 0.1;

    return Math.floor(baseValue * effects.valueMultiplier * generationBonus);
  }

  predictOffspring(parent1, parent2) {
    const predictions = [];

    // Simulate multiple potential outcomes
    for (let i = 0; i < 5; i++) {
      const traits = this.crossBreedTraits(
        parent1.traits || [],
        parent2.traits || []
      );
      const species = this.predictSpecies(parent1.species, parent2.species);

      predictions.push({
        species: species,
        traits: traits,
        probability: this.calculateOutcomeProbability(
          parent1,
          parent2,
          species,
          traits
        ),
      });
    }

    // Sort by probability
    predictions.sort((a, b) => b.probability - a.probability);

    // Remove duplicates
    const uniquePredictions = [];
    const seen = new Set();

    predictions.forEach((prediction) => {
      const key = prediction.species + "|" + prediction.traits.join(",");
      if (!seen.has(key)) {
        seen.add(key);
        uniquePredictions.push(prediction);
      }
    });

    return uniquePredictions.slice(0, 3); // Top 3 predictions
  }

  predictSpecies(species1, species2) {
    // Check for special combinations first
    const combination = window.FishGenetics.getBreedingCombination(
      species1,
      species2
    );
    if (combination && Math.random() < 0.6) {
      return combination;
    }

    // Random parent species
    if (Math.random() < 0.5) {
      return species1;
    } else {
      return species2;
    }
  }

  calculateOutcomeProbability(
    parent1,
    parent2,
    predictedSpecies,
    predictedTraits
  ) {
    let probability = 0.5; // Base probability

    // Same species increases probability
    if (
      parent1.species === parent2.species &&
      predictedSpecies === parent1.species
    ) {
      probability += 0.3;
    }

    // Common traits are more likely
    const commonTraits = predictedTraits.filter(
      (trait) =>
        (parent1.traits && parent1.traits.includes(trait)) ||
        (parent2.traits && parent2.traits.includes(trait))
    );

    probability += commonTraits.length * 0.1;

    // Rare traits are less likely
    const rareTraits = predictedTraits.filter(
      (trait) => this.getTraitRarity(trait) < 0.1
    );
    probability -= rareTraits.length * 0.15;

    return Math.max(0.05, Math.min(0.95, probability));
  }
}

// Initialize genetics system
if (typeof window !== "undefined") {
  window.geneticsSystem = new GeneticsSystem();
}

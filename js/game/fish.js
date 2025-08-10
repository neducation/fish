// Fish species data and genetics system

const fishSpecies = {
  // Common Fish
  goldfish: {
    name: "Goldfish",
    emoji: "🐠",
    rarity: "common",
    basePrice: 20,
    breedingTime: 30000,
    traits: ["orange", "friendly", "hardy"],
    description: "A classic aquarium fish, perfect for beginners",
  },
  clownfish: {
    name: "Clownfish",
    emoji: "🐡",
    rarity: "common",
    basePrice: 25,
    breedingTime: 30000,
    traits: ["orange", "striped", "playful"],
    description: "Colorful and energetic, loves anemones",
  },
  betta: {
    name: "Betta Fish",
    emoji: "🐟",
    rarity: "common",
    basePrice: 30,
    breedingTime: 35000,
    traits: ["colorful", "aggressive", "beautiful"],
    description: "Beautiful flowing fins, needs space",
  },

  // Uncommon Fish
  angelfish: {
    name: "Angelfish",
    emoji: "🐠",
    rarity: "uncommon",
    basePrice: 50,
    breedingTime: 45000,
    traits: ["elegant", "silver", "graceful"],
    description: "Majestic and peaceful, swims gracefully",
  },
  neon_tetra: {
    name: "Neon Tetra",
    emoji: "🐟",
    rarity: "uncommon",
    basePrice: 40,
    breedingTime: 40000,
    traits: ["blue", "schooling", "small"],
    description: "Bright blue stripe, loves groups",
  },
  guppy: {
    name: "Fancy Guppy",
    emoji: "🐡",
    rarity: "uncommon",
    basePrice: 45,
    breedingTime: 25000,
    traits: ["colorful", "small", "prolific"],
    description: "Vibrant colors, breeds easily",
  },

  // Rare Fish
  discus: {
    name: "Discus Fish",
    emoji: "🐠",
    rarity: "rare",
    basePrice: 100,
    breedingTime: 60000,
    traits: ["round", "peaceful", "sensitive"],
    description: "King of the aquarium, needs pristine water",
  },
  mandarin: {
    name: "Mandarin Fish",
    emoji: "🐟",
    rarity: "rare",
    basePrice: 120,
    breedingTime: 65000,
    traits: ["psychedelic", "small", "shy"],
    description: "Stunning patterns, very delicate",
  },
  seahorse: {
    name: "Seahorse",
    emoji: "🐴",
    rarity: "rare",
    basePrice: 150,
    breedingTime: 70000,
    traits: ["unique", "gentle", "mystical"],
    description: "Magical creature of the sea",
  },

  // Epic Fish
  arowana: {
    name: "Dragon Fish",
    emoji: "🐉",
    rarity: "epic",
    basePrice: 300,
    breedingTime: 90000,
    traits: ["dragon", "large", "ancient"],
    description: "Ancient dragon spirit in fish form",
  },
  lionfish: {
    name: "Lionfish",
    emoji: "🦁",
    rarity: "epic",
    basePrice: 250,
    breedingTime: 85000,
    traits: ["spiky", "venomous", "majestic"],
    description: "Beautiful but dangerous predator",
  },

  // Legendary Fish
  koi_dragon: {
    name: "Koi Dragon",
    emoji: "🐲",
    rarity: "legendary",
    basePrice: 500,
    breedingTime: 120000,
    traits: ["legendary", "wise", "powerful"],
    description: "Legendary fish that brings fortune",
  },
  phoenix_fish: {
    name: "Phoenix Fish",
    emoji: "🔥",
    rarity: "legendary",
    basePrice: 600,
    breedingTime: 150000,
    traits: ["fire", "rebirth", "mystical"],
    description: "Rises from the ashes of the ocean",
  },

  // Mythical Fish
  leviathan: {
    name: "Baby Leviathan",
    emoji: "🐋",
    rarity: "mythical",
    basePrice: 1000,
    breedingTime: 200000,
    traits: ["colossal", "ancient", "oceanic"],
    description: "Infant form of the legendary sea monster",
  },
  unicorn_fish: {
    name: "Unicorn Fish",
    emoji: "🦄",
    rarity: "mythical",
    basePrice: 1200,
    breedingTime: 250000,
    traits: ["magical", "rainbow", "pure"],
    description: "Mythical fish of legend and dreams",
  },
};

const rarityValues = {
  common: 1,
  uncommon: 3,
  rare: 8,
  epic: 20,
  legendary: 50,
  mythical: 100,
};

const rarityChances = {
  common: 0.6,
  uncommon: 0.25,
  rare: 0.1,
  epic: 0.04,
  legendary: 0.008,
  mythical: 0.002,
};

class FishGenetics {
  static generateTraits(parent1, parent2) {
    const traits = new Set();

    // Inherit from parents
    if (parent1.traits) {
      parent1.traits.forEach((trait) => {
        if (Math.random() < 0.7) traits.add(trait);
      });
    }

    if (parent2.traits) {
      parent2.traits.forEach((trait) => {
        if (Math.random() < 0.7) traits.add(trait);
      });
    }

    // Possible new mutations
    const possibleTraits = [
      "shiny",
      "large",
      "small",
      "fast",
      "slow",
      "bright",
      "dark",
      "spotted",
      "striped",
      "glowing",
      "translucent",
    ];

    // 10% chance for mutation
    if (Math.random() < 0.1) {
      const newTrait =
        possibleTraits[Math.floor(Math.random() * possibleTraits.length)];
      traits.add(newTrait);
    }

    return Array.from(traits);
  }

  static calculateBreedingSuccess(parent1, parent2) {
    // Higher rarity parents = higher success rate
    const rarity1 = fishSpecies[parent1.species].rarity;
    const rarity2 = fishSpecies[parent2.species].rarity;

    const baseSuccess = 0.7;
    const rarityBonus = (rarityValues[rarity1] + rarityValues[rarity2]) * 0.01;

    return Math.min(0.95, baseSuccess + rarityBonus);
  }

  static generateOffspring(parent1, parent2) {
    const success = this.calculateBreedingSuccess(parent1, parent2);

    if (Math.random() > success) {
      return null; // Breeding failed
    }

    // Determine offspring species
    let offspringSpecies;

    // Check for special breeding combinations
    const combination = this.getBreedingCombination(
      parent1.species,
      parent2.species
    );
    if (combination) {
      offspringSpecies = combination;
    } else {
      // Random chance for rarity upgrade
      const rarityUpgrade = Math.random() < 0.15;
      if (rarityUpgrade) {
        offspringSpecies = this.getRandomSpeciesByRarity("uncommon");
      } else {
        // Choose random parent species
        offspringSpecies =
          Math.random() < 0.5 ? parent1.species : parent2.species;
      }
    }

    // Generate traits
    const traits = this.generateTraits(parent1, parent2);

    return {
      species: offspringSpecies,
      traits: traits,
      parents: [parent1.id, parent2.id],
      generation:
        Math.max(parent1.generation || 0, parent2.generation || 0) + 1,
    };
  }

  static getBreedingCombination(species1, species2) {
    const combinations = {
      "goldfish+clownfish": "guppy",
      "angelfish+betta": "discus",
      "neon_tetra+guppy": "mandarin",
      "discus+mandarin": "arowana",
      "seahorse+angelfish": "lionfish",
      "arowana+lionfish": "koi_dragon",
      "koi_dragon+phoenix_fish": "leviathan",
      "leviathan+unicorn_fish": this.generateMythicalHybrid(),
    };

    const key1 = `${species1}+${species2}`;
    const key2 = `${species2}+${species1}`;

    return combinations[key1] || combinations[key2];
  }

  static generateMythicalHybrid() {
    const mythicalHybrids = ["cosmic_fish", "time_fish", "dimension_fish"];
    return mythicalHybrids[Math.floor(Math.random() * mythicalHybrids.length)];
  }

  static getRandomSpeciesByRarity(targetRarity) {
    const speciesOfRarity = Object.keys(fishSpecies).filter(
      (species) => fishSpecies[species].rarity === targetRarity
    );

    if (speciesOfRarity.length === 0) return "goldfish";
    return speciesOfRarity[Math.floor(Math.random() * speciesOfRarity.length)];
  }

  static getRandomSpecies() {
    const roll = Math.random();
    let cumulativeChance = 0;

    for (const [rarity, chance] of Object.entries(rarityChances)) {
      cumulativeChance += chance;
      if (roll <= cumulativeChance) {
        return this.getRandomSpeciesByRarity(rarity);
      }
    }

    return "goldfish"; // Fallback
  }
}

// Fish behavior patterns
class FishBehavior {
  static getMovementPattern(fish) {
    const species = fishSpecies[fish.species];
    const traits = fish.traits || [];

    let pattern = {
      speed: 1,
      pattern: "random",
      socializing: false,
    };

    // Adjust based on traits
    if (traits.includes("fast")) pattern.speed *= 1.5;
    if (traits.includes("slow")) pattern.speed *= 0.7;
    if (traits.includes("schooling")) pattern.socializing = true;

    // Species-specific behaviors
    switch (species.rarity) {
      case "legendary":
      case "mythical":
        pattern.pattern = "majestic";
        pattern.speed *= 0.8;
        break;
      case "epic":
        pattern.pattern = "predatory";
        break;
      case "common":
        if (traits.includes("schooling")) {
          pattern.pattern = "schooling";
        }
        break;
    }

    return pattern;
  }

  static calculateHappiness(fish, tankConditions) {
    let happiness = fish.happiness || 100;

    // Tank conditions affect happiness
    happiness += (tankConditions.cleanliness - 50) * 0.1;
    happiness += (tankConditions.decoration - 0) * 0.2;

    // Social fish are happier with others
    const species = fishSpecies[fish.species];
    if (fish.traits && fish.traits.includes("schooling")) {
      const othersOfSameSpecies = tankConditions.fishCount[fish.species] || 0;
      if (othersOfSameSpecies > 1) {
        happiness += 10;
      }
    }

    return Math.max(0, Math.min(100, happiness));
  }
}

// Export for use in other modules
if (typeof window !== "undefined") {
  window.fishSpecies = fishSpecies;
  window.rarityValues = rarityValues;
  window.FishGenetics = FishGenetics;
  window.FishBehavior = FishBehavior;
}

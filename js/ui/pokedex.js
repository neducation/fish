// Pokédex-style Collection Manager
class PokedexManager {
  constructor() {
    this.isOpen = false;
    this.currentPage = 0;
    this.fishPerPage = 9;
    this.rarityFilters = [
      "all",
      "common",
      "uncommon",
      "rare",
      "legendary",
      "mythical",
    ];
    this.currentFilter = "all";
    this.pokedexElement = null;
    this.createPokedex();
  }

  createPokedex() {
    // Create Pokédex modal
    const pokedex = document.createElement("div");
    pokedex.id = "pokedex";
    pokedex.className = "pokedex-modal";
    pokedex.innerHTML = `
      <div class="pokedex-content">
        <div class="pokedex-header">
          <h2>🔬 Aquarium Encyclopedia</h2>
          <div class="pokedex-stats">
            <span id="discoveredCount">0</span>/<span id="totalCount">0</span> Discovered
            <div class="completion-bar">
              <div class="completion-fill" id="completionFill"></div>
            </div>
          </div>
          <button class="close-pokedex" onclick="window.pokedexManager.close()">&times;</button>
        </div>
        
        <div class="pokedex-filters">
          <button class="filter-btn active" data-filter="all">All</button>
          <button class="filter-btn" data-filter="common">Common</button>
          <button class="filter-btn" data-filter="uncommon">Uncommon</button>
          <button class="filter-btn" data-filter="rare">Rare</button>
          <button class="filter-btn" data-filter="legendary">Legendary</button>
          <button class="filter-btn" data-filter="mythical">Mythical</button>
        </div>
        
        <div class="pokedex-grid" id="pokedexGrid">
          <!-- Fish entries will be populated here -->
        </div>
        
        <div class="pokedex-pagination">
          <button id="prevPage" onclick="window.pokedexManager.previousPage()">◀ Previous</button>
          <span id="pageInfo">Page 1 of 1</span>
          <button id="nextPage" onclick="window.pokedexManager.nextPage()">Next ▶</button>
        </div>
        
        <div class="pokedex-achievements">
          <h3>🏆 Collection Achievements</h3>
          <div id="achievementsList"></div>
        </div>
      </div>
    `;

    document.body.appendChild(pokedex);
    this.pokedexElement = pokedex;
    this.setupFilters();

    // Only update if game is ready
    if (window.game && window.game.gameState) {
      this.updatePokedex();
    }
  }

  open() {
    this.isOpen = true;
    document.getElementById("pokedex").style.display = "flex";
    this.updatePokedex();
  }

  close() {
    this.isOpen = false;
    document.getElementById("pokedex").style.display = "none";
  }

  setupFilters() {
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.currentFilter = btn.dataset.filter;
        this.currentPage = 0;
        this.updatePokedex();
      });
    });
  }

  getFishRarity(species) {
    const rarityMap = {
      // Common fish (easy to get)
      goldfish: "common",
      tetra: "common",
      guppy: "common",
      betta: "common",

      // Uncommon fish (shop/breeding)
      clownfish: "uncommon",
      angelfish: "uncommon",
      neon_tetra: "uncommon",
      catfish: "uncommon",

      // Rare fish (special breeding/shop)
      seahorse: "rare",
      pufferfish: "rare",
      butterflyfish: "rare",
      royal_gramma: "rare",

      // Legendary fish (very hard to get)
      dragonfish: "legendary",
      phoenix_fish: "legendary",
      crystal_fish: "legendary",
      rainbow_fish: "legendary",

      // Mythical fish (nearly impossible)
      cosmic_fish: "mythical",
      time_fish: "mythical",
      void_fish: "mythical",
      god_fish: "mythical",
    };

    return rarityMap[species] || "common";
  }

  getFilteredFish() {
    // Handle both data structures: nested (from JSON) or flat (from fish.js)
    let allSpecies;
    if (fishSpecies.fish_species && fishSpecies.fish_species.common) {
      // Nested structure from JSON
      allSpecies = Object.keys(fishSpecies.fish_species.common);
    } else {
      // Flat structure from fish.js
      allSpecies = Object.keys(fishSpecies);
    }

    if (this.currentFilter === "all") {
      return allSpecies;
    }

    return allSpecies.filter(
      (species) => this.getFishRarity(species) === this.currentFilter
    );
  }

  updatePokedex() {
    // Check if game is ready
    if (!window.game || !window.game.gameState) {
      return;
    }

    const collection = window.game.gameState.collection;
    const filteredFish = this.getFilteredFish();
    const totalPages = Math.ceil(filteredFish.length / this.fishPerPage);
    const startIndex = this.currentPage * this.fishPerPage;
    const endIndex = startIndex + this.fishPerPage;
    const currentPageFish = filteredFish.slice(startIndex, endIndex);

    // Update stats
    const discoveredCount = filteredFish.filter((species) =>
      collection.has(species)
    ).length;
    document.getElementById("discoveredCount").textContent = discoveredCount;
    document.getElementById("totalCount").textContent = filteredFish.length;

    const completionPercent = (discoveredCount / filteredFish.length) * 100;
    document.getElementById("completionFill").style.width =
      completionPercent + "%";

    // Update grid
    const grid = document.getElementById("pokedexGrid");
    grid.innerHTML = "";

    currentPageFish.forEach((species, index) => {
      const discovered = collection.has(species);
      const fishData =
        fishSpecies[species] || fishSpecies.fish_species?.common?.[species];
      const rarity = this.getFishRarity(species);

      const entry = document.createElement("div");
      entry.className = `pokedex-entry ${
        discovered ? "discovered" : "undiscovered"
      } rarity-${rarity}`;

      if (discovered) {
        entry.innerHTML = `
          <div class="entry-number">#${String(startIndex + index + 1).padStart(
            3,
            "0"
          )}</div>
          <div class="entry-emoji">${fishData?.emoji || "🐠"}</div>
          <div class="entry-name">${fishData?.name || species}</div>
          <div class="entry-rarity">${rarity.toUpperCase()}</div>
          <div class="entry-description">${
            fishData?.description || "A mysterious fish species."
          }</div>
          <div class="entry-traits">
            <div class="trait-info">
              <span>Habitat:</span> ${fishData?.habitat || "Unknown"}
            </div>
            <div class="trait-info">
              <span>Size:</span> ${fishData?.size || "Unknown"}
            </div>
            <div class="trait-info">
              <span>Diet:</span> ${fishData?.diet || "Unknown"}
            </div>
          </div>
          <div class="entry-count">
            Owned: ${this.getOwnedCount(species)}
          </div>
        `;
      } else {
        entry.innerHTML = `
          <div class="entry-number">#${String(startIndex + index + 1).padStart(
            3,
            "0"
          )}</div>
          <div class="entry-emoji">❓</div>
          <div class="entry-name">???</div>
          <div class="entry-rarity">${rarity.toUpperCase()}</div>
          <div class="entry-description">An undiscovered species. Find it to learn more!</div>
          <div class="entry-hint">
            ${this.getDiscoveryHint(species, rarity)}
          </div>
        `;
      }

      grid.appendChild(entry);
    });

    // Update pagination
    document.getElementById("pageInfo").textContent = `Page ${
      this.currentPage + 1
    } of ${totalPages}`;
    document.getElementById("prevPage").disabled = this.currentPage === 0;
    document.getElementById("nextPage").disabled =
      this.currentPage === totalPages - 1;

    // Update achievements
    this.updateAchievements();
  }

  getOwnedCount(species) {
    return window.game.gameState.fishInTank.filter(
      (fish) => fish.species === species
    ).length;
  }

  getDiscoveryHint(species, rarity) {
    const hints = {
      common: "Available in the shop or through basic breeding",
      uncommon: "Try breeding different species together",
      rare: "Requires special breeding combinations or rare shop items",
      legendary: "Extremely rare breeding results or special events",
      mythical:
        "Unknown discovery method - perhaps a legendary breeding miracle?",
    };

    return `Hint: ${hints[rarity]}`;
  }

  nextPage() {
    const filteredFish = this.getFilteredFish();
    const totalPages = Math.ceil(filteredFish.length / this.fishPerPage);
    if (this.currentPage < totalPages - 1) {
      this.currentPage++;
      this.updatePokedex();
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updatePokedex();
    }
  }

  updateAchievements() {
    const collection = window.game.gameState.collection;
    const achievementsList = document.getElementById("achievementsList");

    const achievements = [
      {
        title: "First Discovery",
        description: "Discover your first fish species",
        condition: () => collection.size >= 1,
        reward: "🏆",
      },
      {
        title: "Collector",
        description: "Discover 10 different species",
        condition: () => collection.size >= 10,
        reward: "🏆",
      },
      {
        title: "Marine Biologist",
        description: "Discover 25 different species",
        condition: () => collection.size >= 25,
        reward: "🔬",
      },
      {
        title: "Species Master",
        description: "Discover all common fish",
        condition: () => {
          const commonFish = Object.keys(fishSpecies).filter(
            (s) => this.getFishRarity(s) === "common"
          );
          return commonFish.every((species) => collection.has(species));
        },
        reward: "👑",
      },
      {
        title: "Rare Collector",
        description: "Discover all rare fish",
        condition: () => {
          const rareFish = Object.keys(fishSpecies).filter(
            (s) => this.getFishRarity(s) === "rare"
          );
          return rareFish.every((species) => collection.has(species));
        },
        reward: "💎",
      },
      {
        title: "Legend Hunter",
        description: "Discover a legendary fish",
        condition: () => {
          const legendaryFish = Object.keys(fishSpecies).filter(
            (s) => this.getFishRarity(s) === "legendary"
          );
          return legendaryFish.some((species) => collection.has(species));
        },
        reward: "⚡",
      },
      {
        title: "Myth Seeker",
        description: "Discover a mythical fish",
        condition: () => {
          const mythicalFish = Object.keys(fishSpecies).filter(
            (s) => this.getFishRarity(s) === "mythical"
          );
          return mythicalFish.some((species) => collection.has(species));
        },
        reward: "🌟",
      },
      {
        title: "Completionist",
        description: "Discover ALL fish species (100%)",
        condition: () => collection.size >= Object.keys(fishSpecies).length,
        reward: "🏅",
      },
    ];

    achievementsList.innerHTML = "";
    achievements.forEach((achievement) => {
      const achieved = achievement.condition();
      const achievementDiv = document.createElement("div");
      achievementDiv.className = `achievement ${
        achieved ? "achieved" : "locked"
      }`;
      achievementDiv.innerHTML = `
        <span class="achievement-icon">${
          achieved ? achievement.reward : "🔒"
        }</span>
        <div class="achievement-info">
          <div class="achievement-title">${achievement.title}</div>
          <div class="achievement-desc">${achievement.description}</div>
        </div>
        <div class="achievement-status">${
          achieved ? "COMPLETED" : "LOCKED"
        }</div>
      `;
      achievementsList.appendChild(achievementDiv);
    });
  }

  // Add to main UI
  addPokedexButton() {
    const collectionPanel = document.querySelector(".collection-panel h3");
    if (collectionPanel) {
      const pokedexBtn = document.createElement("button");
      pokedexBtn.className = "pokedex-btn";
      pokedexBtn.innerHTML = "📖 Encyclopedia";
      pokedexBtn.onclick = () => this.open();
      collectionPanel.parentNode.insertBefore(
        pokedexBtn,
        collectionPanel.nextSibling
      );
    }
  }
}

// Pokédex manager will be initialized by main.js

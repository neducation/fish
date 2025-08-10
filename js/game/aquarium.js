// Aquarium management system

class AquariumManager {
  constructor() {
    this.aquariumElement = document.getElementById("aquarium");
    this.decorations = [];
    this.fishElements = new Map(); // Track fish elements for smooth animation
    this.animationFrameId = null;
    this.startSmoothMovement();
  }

  updateAquarium() {
    // Update fish positions smoothly without recreating elements
    window.game.gameState.fishInTank.forEach((fish) => {
      if (!this.fishElements.has(fish.id)) {
        this.addFishToDisplay(fish);
      } else {
        this.updateFishPosition(fish);
      }
    });

    // Remove fish that are no longer in tank
    const currentFishIds = new Set(window.game.gameState.fishInTank.map(f => f.id));
    for (const [fishId, element] of this.fishElements) {
      if (!currentFishIds.has(fishId)) {
        element.remove();
        this.fishElements.delete(fishId);
      }
    }

    // Update decorations
    this.updateDecorations();

    // Update tank status
    this.updateTankStatus();
  }

  startSmoothMovement() {
    const animate = () => {
      this.moveFishSmoothly();
      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  moveFishSmoothly() {
    window.game.gameState.fishInTank.forEach((fish) => {
      // Update fish logic position
      this.updateFishLogic(fish);
      
      // Update visual position smoothly
      const fishElement = this.fishElements.get(fish.id);
      if (fishElement) {
        fishElement.style.transform = `translate(${fish.x}px, ${fish.y}px) scale(${fish.scale || 1}) ${fish.vx < 0 ? 'scaleX(-1)' : ''}`;
      }
    });
  }

  updateFishLogic(fish) {
    const bounds = this.aquariumElement.getBoundingClientRect();
    const maxX = bounds.width - 40;
    const maxY = bounds.height - 60;

    // Smooth movement with physics
    fish.x += fish.vx;
    fish.y += fish.vy;

    // Bounce off walls with smooth turning
    if (fish.x <= 0 || fish.x >= maxX) {
      fish.vx *= -0.8;
      fish.x = Math.max(0, Math.min(maxX, fish.x));
    }
    if (fish.y <= 20 || fish.y >= maxY) {
      fish.vy *= -0.8;
      fish.y = Math.max(20, Math.min(maxY, fish.y));
    }

    // Add some randomness to movement
    if (Math.random() < 0.01) {
      fish.vx += (Math.random() - 0.5) * 0.5;
      fish.vy += (Math.random() - 0.5) * 0.5;
    }

    // Limit speed
    const maxSpeed = fish.traits?.includes('fast') ? 3 : 2;
    fish.vx = Math.max(-maxSpeed, Math.min(maxSpeed, fish.vx));
    fish.vy = Math.max(-maxSpeed, Math.min(maxSpeed, fish.vy));
  }

  addFishToDisplay(fish) {
    const fishElement = document.createElement("div");
    fishElement.className = "fish swimming";
    fishElement.id = `fish-${fish.id}`;
    fishElement.textContent = fishSpecies[fish.species].emoji;

    // Set initial position
    fishElement.style.position = "absolute";
    fishElement.style.left = "0px";
    fishElement.style.top = "0px";
    fishElement.style.transform = `translate(${fish.x}px, ${fish.y}px)`;
    fishElement.style.transition = "none";
    fishElement.style.fontSize = "24px";
    fishElement.style.cursor = "pointer";
    fishElement.style.zIndex = "10";

    // Add traits-based styling
    if (fish.traits) {
      if (fish.traits.includes("shiny")) {
        fishElement.style.filter = "brightness(1.3) drop-shadow(0 0 10px gold)";
        fishElement.classList.add("shiny");
      }
      if (fish.traits.includes("large")) {
        fish.scale = 1.3;
      }
      if (fish.traits.includes("small")) {
        fish.scale = 0.7;
      }
      if (fish.traits.includes("glowing")) {
        fishElement.style.filter = "drop-shadow(0 0 15px cyan)";
        fishElement.classList.add("glowing");
      }
      if (fish.traits.includes("rare")) {
        fishElement.classList.add("rare-fish");
      }
    }

    // Click handler
    fishElement.onclick = () => this.selectFish(fish);

    this.aquariumElement.appendChild(fishElement);
    this.fishElements.set(fish.id, fishElement);
  }

  updateFishPosition(fish) {
    // This method is called for existing fish to update their data without recreating the element
    const fishElement = this.fishElements.get(fish.id);
    if (fishElement) {
      // Update emoji if species changed (for breeding results)
      if (fishElement.textContent !== fishSpecies[fish.species].emoji) {
        fishElement.textContent = fishSpecies[fish.species].emoji;
      }
    }
  }

    // Add click handler
    fishElement.addEventListener("click", () => {
      this.selectFish(fish);
    });

    // Add hover tooltip
    fishElement.addEventListener("mouseenter", (e) => {
      this.showFishTooltip(e, fish);
    });

    fishElement.addEventListener("mouseleave", () => {
      this.hideFishTooltip();
    });

    this.aquariumElement.appendChild(fishElement);
  }

  selectFish(fish) {
    // Check if fish is already selected
    const isSelected = window.game.gameState.selectedFish.some(
      (f) => f.id === fish.id
    );

    if (isSelected) {
      // Deselect fish
      window.game.gameState.selectedFish =
        window.game.gameState.selectedFish.filter((f) => f.id !== fish.id);
      document.getElementById(`fish-${fish.id}`).classList.remove("selected");
    } else if (window.game.gameState.selectedFish.length < 2) {
      // Select fish
      window.game.gameState.selectedFish.push(fish);
      document.getElementById(`fish-${fish.id}`).classList.add("selected");
    } else {
      // Replace oldest selection
      const oldFish = window.game.gameState.selectedFish.shift();
      document
        .getElementById(`fish-${oldFish.id}`)
        .classList.remove("selected");

      window.game.gameState.selectedFish.push(fish);
      document.getElementById(`fish-${fish.id}`).classList.add("selected");
    }

    // Update breeding panel
    window.breedingManager.updateBreedingSlots();
  }

  showFishTooltip(event, fish) {
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip show";
    tooltip.id = "fish-tooltip";

    const species = fishSpecies[fish.species];
    const traits = fish.traits ? fish.traits.join(", ") : "None";
    const generation = fish.generation || 1;

    tooltip.innerHTML = `
            <strong>${species.name}</strong><br>
            <em>${species.rarity}</em><br>
            Generation: ${generation}<br>
            Traits: ${traits}<br>
            Happiness: ${Math.floor(fish.happiness || 100)}%
        `;

    tooltip.style.left = event.pageX + 10 + "px";
    tooltip.style.top = event.pageY + 10 + "px";

    document.body.appendChild(tooltip);
  }

  hideFishTooltip() {
    const tooltip = document.getElementById("fish-tooltip");
    if (tooltip) {
      tooltip.remove();
    }
  }

  updateDecorations() {
    // Clear existing decorations
    const existingDecorations =
      this.aquariumElement.querySelectorAll(".decoration");
    existingDecorations.forEach((decoration) => decoration.remove());

    // Add decorations
    window.game.gameState.decorations.forEach((decoration, index) => {
      const decorationElement = document.createElement("div");
      decorationElement.className = "decoration";
      decorationElement.textContent = decoration.type;
      decorationElement.style.left = decoration.x + "px";
      decorationElement.style.top = decoration.y + "px";

      // Add decoration-specific classes
      if (["🌱", "🌿", "🍃"].includes(decoration.type)) {
        decorationElement.classList.add("plant");
      } else if (["🪨", "⛰️"].includes(decoration.type)) {
        decorationElement.classList.add("rock");
      } else if (["🐚", "🪸", "🫧"].includes(decoration.type)) {
        decorationElement.classList.add("coral");
      }

      this.aquariumElement.appendChild(decorationElement);
    });
  }

  updateTankStatus() {
    // Create or update tank status display
    let statusDisplay = document.getElementById("tankStatus");
    if (!statusDisplay) {
      statusDisplay = document.createElement("div");
      statusDisplay.id = "tankStatus";
      statusDisplay.className = "tank-status";
      this.aquariumElement.appendChild(statusDisplay);
    }

    const cleanliness = window.game.gameState.tankCleanliness;
    const happiness = window.game.gameState.fishHappiness;

    statusDisplay.innerHTML = `
            <div class="tank-status-item">
                <span>🧽 Cleanliness</span>
                <div class="status-bar">
                    <div class="status-fill ${this.getStatusClass(
                      cleanliness
                    )}" 
                         style="width: ${cleanliness}%"></div>
                </div>
            </div>
            <div class="tank-status-item">
                <span>😊 Happiness</span>
                <div class="status-bar">
                    <div class="status-fill ${this.getStatusClass(happiness)}" 
                         style="width: ${happiness}%"></div>
                </div>
            </div>
        `;
  }

  getStatusClass(value) {
    if (value >= 70) return "high";
    if (value >= 40) return "medium";
    return "low";
  }

  animateFishMovement() {
    window.game.gameState.fishInTank.forEach((fish) => {
      const fishElement = document.getElementById(`fish-${fish.id}`);
      if (fishElement) {
        // Get movement pattern
        const behavior = window.FishBehavior.getMovementPattern(fish);

        // Apply movement
        fishElement.style.transition = "all 2s ease-in-out";
        fishElement.style.left = fish.x + "px";
        fishElement.style.top = fish.y + "px";

        // Apply behavior-specific animations
        if (behavior.pattern === "schooling") {
          fishElement.classList.add("schooling");
        } else if (behavior.pattern === "predatory") {
          fishElement.classList.add("predatory");
        } else if (behavior.pattern === "majestic") {
          fishElement.classList.add("majestic");
        }
      }
    });
  }

  addSpecialEffect(type, position) {
    const effect = document.createElement("div");
    effect.className = `special-effect ${type}`;
    effect.style.left = position.x + "px";
    effect.style.top = position.y + "px";

    switch (type) {
      case "breeding-heart":
        effect.textContent = "💕";
        effect.style.animation = "heart-float 2s ease-out forwards";
        break;
      case "feeding-bubbles":
        effect.textContent = "🫧";
        effect.style.animation = "bubble-pop 1s ease-out forwards";
        break;
      case "cleaning-sparkles":
        effect.textContent = "✨";
        effect.style.animation = "sparkle-fade 1.5s ease-out forwards";
        break;
    }

    this.aquariumElement.appendChild(effect);

    // Remove effect after animation
    setTimeout(() => {
      if (effect.parentNode) {
        effect.parentNode.removeChild(effect);
      }
    }, 2000);
  }

  getFishAtPosition(x, y) {
    return window.game.gameState.fishInTank.find((fish) => {
      const distance = Math.sqrt(
        Math.pow(fish.x - x, 2) + Math.pow(fish.y - y, 2)
      );
      return distance < 30; // 30px radius
    });
  }

  highlightCompatibleFish(selectedFish) {
    window.game.gameState.fishInTank.forEach((fish) => {
      const fishElement = document.getElementById(`fish-${fish.id}`);
      if (fishElement) {
        const canBreed = window.breedingManager.canBreed(selectedFish, fish);
        if (canBreed && fish.id !== selectedFish.id) {
          fishElement.classList.add("compatible");
        } else {
          fishElement.classList.remove("compatible");
        }
      }
    });
  }

  clearHighlights() {
    const fishElements = this.aquariumElement.querySelectorAll(".fish");
    fishElements.forEach((element) => {
      element.classList.remove("compatible", "selected");
    });
  }
}

// Aquarium manager will be initialized by main.js

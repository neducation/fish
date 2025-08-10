// Aquarium manager for visual and animation effects
class AquariumManager {
  constructor() {
    this.bubbles = [];
    this.fishElements = new Map();
    this.animationFrame = null;
    this.isAnimating = false;

    this.initializeAquarium();
  }

  updateDecorations() {
    // Update decorations display
    if (!window.game || !window.game.gameState) {
      return;
    }

    const decorations = window.game.gameState.decorations || [];
    // For now, just log decoration updates
    // Future: render decorations in aquarium
    console.log("Updating decorations:", decorations.length);
  }

  addSpecialEffect(effectType, options = {}) {
    // Add special visual effects to the aquarium
    const aquarium = document.getElementById("aquarium");
    if (!aquarium) return;

    const effect = document.createElement("div");
    effect.className = `special-effect ${effectType}`;
    effect.style.position = "absolute";
    effect.style.pointerEvents = "none";
    effect.style.zIndex = "10";

    // Position the effect
    const x = options.x || Math.random() * (aquarium.offsetWidth - 50);
    const y = options.y || Math.random() * (aquarium.offsetHeight - 50);
    effect.style.left = x + "px";
    effect.style.top = y + "px";

    // Set effect content based on type
    switch (effectType) {
      case "breeding-heart":
        effect.innerHTML = "💖";
        effect.style.fontSize = "24px";
        effect.style.animation = "float-up 2s ease-out forwards";
        break;
      case "feeding":
        effect.innerHTML = "🍽️";
        effect.style.fontSize = "20px";
        effect.style.animation = "fade-out 1s ease-out forwards";
        break;
      case "cleaning":
        effect.innerHTML = "✨";
        effect.style.fontSize = "18px";
        effect.style.animation = "sparkle 1.5s ease-out forwards";
        break;
      default:
        effect.innerHTML = "⭐";
        effect.style.fontSize = "16px";
        effect.style.animation = "fade-out 1s ease-out forwards";
    }

    aquarium.appendChild(effect);

    // Remove effect after animation
    setTimeout(() => {
      if (effect.parentNode) {
        effect.remove();
      }
    }, 2500);
  }

  initializeAquarium() {
    // Set up aquarium visual effects
    this.setupBubbleSystem();
    this.startAnimationLoop();
  }

  setupBubbleSystem() {
    // Create bubble container if it doesn't exist
    const aquarium = document.getElementById("aquarium");
    if (!document.getElementById("bubbles")) {
      const bubbleContainer = document.createElement("div");
      bubbleContainer.id = "bubbles";
      bubbleContainer.style.position = "absolute";
      bubbleContainer.style.top = "0";
      bubbleContainer.style.left = "0";
      bubbleContainer.style.width = "100%";
      bubbleContainer.style.height = "100%";
      bubbleContainer.style.pointerEvents = "none";
      bubbleContainer.style.zIndex = "1";
      aquarium.appendChild(bubbleContainer);
    }
  }

  startAnimationLoop() {
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.animate();
    }
  }

  stopAnimationLoop() {
    this.isAnimating = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  animate() {
    if (!this.isAnimating) return;

    // Update fish positions
    this.updateFishPositions();

    // Update bubbles
    this.updateBubbles();

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  updateFishPositions() {
    // Get current fish from game state
    if (!window.game || !window.game.gameState) return;

    const fishInTank = window.game.gameState.fishInTank;
    const aquarium = document.getElementById("aquarium");

    fishInTank.forEach((fish, index) => {
      let fishElement = this.fishElements.get(fish.id);

      if (!fishElement) {
        // Create new fish element
        fishElement = this.createFishElement(fish);
        aquarium.appendChild(fishElement);
        this.fishElements.set(fish.id, fishElement);
      }

      // Update fish position with smooth movement
      this.updateFishElement(fishElement, fish);
    });

    // Remove fish elements that are no longer in tank
    this.fishElements.forEach((element, fishId) => {
      const stillInTank = fishInTank.some((fish) => fish.id === fishId);
      if (!stillInTank) {
        element.remove();
        this.fishElements.delete(fishId);
      }
    });
  }

  createFishElement(fish) {
    const fishElement = document.createElement("div");
    fishElement.className = "fish-sprite";
    fishElement.style.position = "absolute";
    fishElement.style.width = "40px";
    fishElement.style.height = "30px";
    fishElement.style.fontSize = "24px";
    fishElement.style.transition = "all 2s ease-in-out";
    fishElement.style.zIndex = "2";
    fishElement.textContent = this.getFishEmoji(fish);

    // Initialize position
    fishElement.style.left = Math.random() * 300 + "px";
    fishElement.style.top = Math.random() * 200 + "px";

    return fishElement;
  }

  updateFishElement(element, fish) {
    // Smooth swimming animation
    const currentTime = Date.now();
    if (!element.lastMoveTime || currentTime - element.lastMoveTime > 3000) {
      const aquarium = document.getElementById("aquarium");
      const maxX = aquarium.offsetWidth - 40;
      const maxY = aquarium.offsetHeight - 30;

      const newX = Math.random() * maxX;
      const newY = Math.random() * maxY;

      element.style.left = newX + "px";
      element.style.top = newY + "px";
      element.lastMoveTime = currentTime;
    }
  }

  getFishEmoji(fish) {
    const fishEmojis = {
      goldfish: "🐠",
      angelfish: "🐟",
      clownfish: "🐡",
      beta: "🐠",
      guppy: "🐟",
      "neon-tetra": "🐠",
      molly: "🐟",
      swordtail: "🐠",
    };

    return fishEmojis[fish.species] || "🐠";
  }

  updateBubbles() {
    const bubbleContainer = document.getElementById("bubbles");
    if (!bubbleContainer) return;

    // Create new bubbles occasionally
    if (Math.random() < 0.03) {
      this.createBubble();
    }

    // Update existing bubbles
    this.bubbles.forEach((bubble, index) => {
      bubble.y -= bubble.speed;
      bubble.element.style.top = bubble.y + "px";

      // Remove bubbles that have reached the top
      if (bubble.y < -10) {
        bubble.element.remove();
        this.bubbles.splice(index, 1);
      }
    });
  }

  createBubble() {
    const bubbleContainer = document.getElementById("bubbles");
    const aquarium = document.getElementById("aquarium");

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.style.position = "absolute";
    bubble.style.width = Math.random() * 8 + 4 + "px";
    bubble.style.height = bubble.style.width;
    bubble.style.backgroundColor = "rgba(255, 255, 255, 0.6)";
    bubble.style.borderRadius = "50%";
    bubble.style.left = Math.random() * (aquarium.offsetWidth - 10) + "px";

    const bubbleData = {
      element: bubble,
      y: aquarium.offsetHeight,
      speed: Math.random() * 2 + 1,
    };

    bubble.style.top = bubbleData.y + "px";
    bubbleContainer.appendChild(bubble);
    this.bubbles.push(bubbleData);
  }

  addFish(fish) {
    // This will be handled by the animation loop
    // Fish will be automatically detected from game state
  }

  updateAquarium() {
    // Main update method called by the game
    if (!window.game || !window.game.gameState) {
      return;
    }

    // Update fish displays and positions
    this.updateFishPositions();

    // Update visual state based on game conditions
    this.updateAquariumVisuals();
  }

  updateAquariumVisuals() {
    const aquarium = document.getElementById("aquarium");
    if (!aquarium) return;

    const gameState = window.game.gameState;

    // Update aquarium appearance based on cleanliness
    if (gameState.tankCleanliness < 30) {
      aquarium.style.filter = "brightness(0.7) sepia(0.3)";
    } else if (gameState.tankCleanliness < 70) {
      aquarium.style.filter = "brightness(0.9)";
    } else {
      aquarium.style.filter = "brightness(1)";
    }

    // Update based on fish happiness
    if (gameState.fishHappiness < 30) {
      aquarium.style.borderColor = "#ff6b6b";
    } else if (gameState.fishHappiness < 70) {
      aquarium.style.borderColor = "#feca57";
    } else {
      aquarium.style.borderColor = "#48dbfb";
    }
  }

  removeFish(fishId) {
    const fishElement = this.fishElements.get(fishId);
    if (fishElement) {
      fishElement.remove();
      this.fishElements.delete(fishId);
    }
  }

  cleanTank() {
    // Visual effect for cleaning
    const aquarium = document.getElementById("aquarium");
    aquarium.style.filter = "brightness(1.2)";
    this.addSpecialEffect("cleaning");
    setTimeout(() => {
      aquarium.style.filter = "brightness(1)";
    }, 1000);
  }

  feedFish() {
    // Visual effect for feeding
    const fishElements = Array.from(this.fishElements.values());
    fishElements.forEach((element) => {
      element.style.transform = "scale(1.1)";
      setTimeout(() => {
        element.style.transform = "scale(1)";
      }, 500);
    });
    this.addSpecialEffect("feeding");
  }

  destroy() {
    this.stopAnimationLoop();
    this.fishElements.clear();
    this.bubbles = [];
  }
}

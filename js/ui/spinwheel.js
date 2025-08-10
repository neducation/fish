// Spin Wheel Manager - Daily Rewards and Premium Wheels
class SpinWheelManager {
  constructor() {
    this.wheels = {
      daily: {
        name: "Daily Fortune Wheel",
        cost: 0,
        cooldown: 24 * 60 * 60 * 1000, // 24 hours
        lastSpin: 0,
        rewards: [
          { type: "coins", amount: 50, weight: 30, display: "💰 50 Coins" },
          { type: "coins", amount: 100, weight: 25, display: "💰 100 Coins" },
          { type: "coins", amount: 200, weight: 15, display: "💰 200 Coins" },
          {
            type: "fish",
            species: "random_common",
            weight: 15,
            display: "🐠 Common Fish",
          },
          {
            type: "fish",
            species: "random_uncommon",
            weight: 10,
            display: "🐟 Uncommon Fish",
          },
          {
            type: "breeding_boost",
            duration: 3600000,
            weight: 3,
            display: "⚡ 1h Breeding Boost",
          },
          {
            type: "fish",
            species: "random_rare",
            weight: 1.5,
            display: "🌟 Rare Fish",
          },
          {
            type: "jackpot",
            amount: 1000,
            weight: 0.5,
            display: "🎰 JACKPOT! 1000 Coins",
          },
        ],
      },
      premium: {
        name: "Premium Treasure Wheel",
        cost: 100,
        cooldown: 0,
        lastSpin: 0,
        rewards: [
          { type: "coins", amount: 200, weight: 25, display: "💰 200 Coins" },
          { type: "coins", amount: 500, weight: 20, display: "💰 500 Coins" },
          {
            type: "fish",
            species: "random_uncommon",
            weight: 20,
            display: "🐟 Uncommon Fish",
          },
          {
            type: "fish",
            species: "random_rare",
            weight: 15,
            display: "🌟 Rare Fish",
          },
          {
            type: "breeding_boost",
            duration: 7200000,
            weight: 10,
            display: "⚡ 2h Breeding Boost",
          },
          {
            type: "tank_upgrade",
            upgrade: "decoration",
            weight: 5,
            display: "🌱 Premium Decoration",
          },
          {
            type: "fish",
            species: "random_legendary",
            weight: 3,
            display: "⭐ Legendary Fish",
          },
          {
            type: "mega_jackpot",
            amount: 2500,
            weight: 2,
            display: "💎 MEGA JACKPOT! 2500 Coins",
          },
        ],
      },
      legendary: {
        name: "Legendary Cosmic Wheel",
        cost: 500,
        cooldown: 0,
        lastSpin: 0,
        rewards: [
          { type: "coins", amount: 1000, weight: 30, display: "💰 1000 Coins" },
          {
            type: "fish",
            species: "random_rare",
            weight: 25,
            display: "🌟 Rare Fish",
          },
          {
            type: "fish",
            species: "random_legendary",
            weight: 20,
            display: "⭐ Legendary Fish",
          },
          {
            type: "breeding_boost",
            duration: 14400000,
            weight: 10,
            display: "⚡ 4h Breeding Boost",
          },
          {
            type: "tank_upgrade",
            upgrade: "capacity",
            weight: 8,
            display: "🏠 Tank Expansion",
          },
          {
            type: "fish",
            species: "random_mythical",
            weight: 5,
            display: "🌟 Mythical Fish",
          },
          {
            type: "cosmic_jackpot",
            amount: 10000,
            weight: 2,
            display: "🌌 COSMIC JACKPOT! 10k Coins",
          },
        ],
      },
    };

    this.createWheelModal();
    this.addWheelButtons();
  }

  createWheelModal() {
    const modal = document.createElement("div");
    modal.id = "spinWheelModal";
    modal.className = "wheel-modal";
    modal.innerHTML = `
      <div class="wheel-content">
        <div class="wheel-header">
          <h2 id="wheelTitle">🎰 Spin Wheel</h2>
          <button class="close-wheel" onclick="window.spinWheelManager.close()">&times;</button>
        </div>
        
        <div class="wheel-container">
          <canvas id="wheelCanvas" width="400" height="400"></canvas>
          <button id="spinButton" class="spin-button" onclick="window.spinWheelManager.spin()">
            SPIN!
          </button>
          <div class="wheel-pointer"></div>
        </div>
        
        <div class="wheel-info">
          <div id="wheelCost">Free Spin Available!</div>
          <div id="wheelCooldown"></div>
        </div>
        
        <div class="wheel-tabs">
          <button class="wheel-tab active" data-wheel="daily">Daily Free</button>
          <button class="wheel-tab" data-wheel="premium">Premium (100💰)</button>
          <button class="wheel-tab" data-wheel="legendary">Legendary (500💰)</button>
        </div>
        
        <div class="wheel-rewards-preview">
          <h3>Possible Rewards:</h3>
          <div id="rewardsList"></div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.setupWheelTabs();
    this.currentWheel = "daily";
    this.updateWheelDisplay();
  }

  addWheelButtons() {
    // Add daily spin button to main UI
    const gameControls = document.querySelector(".game-controls");
    const dailySpinBtn = document.createElement("button");
    dailySpinBtn.className = "control-btn daily-spin-btn";
    dailySpinBtn.innerHTML = "<span>🎰</span> Daily Spin";
    dailySpinBtn.onclick = () => this.open("daily");
    gameControls.insertBefore(dailySpinBtn, gameControls.firstChild);

    // Add premium wheel button to monetization area
    const aquariumControls = document.querySelector(".aquarium-controls");
    const premiumWheelBtn = document.createElement("button");
    premiumWheelBtn.className = "control-btn premium-wheel-btn";
    premiumWheelBtn.innerHTML = "<span>💎</span> Premium Wheel";
    premiumWheelBtn.onclick = () => this.open("premium");
    aquariumControls.appendChild(premiumWheelBtn);
  }

  setupWheelTabs() {
    const tabs = document.querySelectorAll(".wheel-tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        this.currentWheel = tab.dataset.wheel;
        this.updateWheelDisplay();
      });
    });
  }

  open(wheelType = "daily") {
    this.currentWheel = wheelType;
    document.getElementById("spinWheelModal").style.display = "flex";
    this.updateWheelDisplay();
    this.drawWheel();
  }

  close() {
    document.getElementById("spinWheelModal").style.display = "none";
  }

  updateWheelDisplay() {
    const wheel = this.wheels[this.currentWheel];
    const gameState = window.game.gameState;

    // Update title and info
    document.getElementById("wheelTitle").textContent = `🎰 ${wheel.name}`;

    // Check if wheel is available
    const canSpin = this.canSpin(this.currentWheel);
    const timeUntilNext = this.getTimeUntilNextSpin(this.currentWheel);

    // Update cost and availability
    const costElement = document.getElementById("wheelCost");
    const cooldownElement = document.getElementById("wheelCooldown");
    const spinButton = document.getElementById("spinButton");

    if (this.currentWheel === "daily") {
      if (canSpin) {
        costElement.textContent = "Free Daily Spin Available!";
        costElement.style.color = "#4caf50";
        spinButton.disabled = false;
        spinButton.textContent = "SPIN FREE!";
      } else {
        costElement.textContent = "Daily spin used";
        costElement.style.color = "#ff5722";
        cooldownElement.textContent = `Next free spin: ${timeUntilNext}`;
        spinButton.disabled = true;
        spinButton.textContent = "Come back tomorrow";
      }
    } else {
      const cost = wheel.cost;
      if (gameState.coins >= cost) {
        costElement.textContent = `Cost: ${cost} coins`;
        costElement.style.color = "#2196f3";
        spinButton.disabled = false;
        spinButton.textContent = `SPIN (${cost}💰)`;
      } else {
        costElement.textContent = `Need ${cost} coins (you have ${gameState.coins})`;
        costElement.style.color = "#ff5722";
        spinButton.disabled = true;
        spinButton.textContent = "Insufficient coins";
      }
    }

    // Update active tab
    document.querySelectorAll(".wheel-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.wheel === this.currentWheel);
    });

    // Update rewards list
    this.updateRewardsList();
  }

  updateRewardsList() {
    const wheel = this.wheels[this.currentWheel];
    const rewardsList = document.getElementById("rewardsList");

    rewardsList.innerHTML = "";
    wheel.rewards.forEach((reward) => {
      const rewardDiv = document.createElement("div");
      rewardDiv.className = "reward-item";
      rewardDiv.innerHTML = `
        <span class="reward-display">${reward.display}</span>
        <span class="reward-chance">${reward.weight}%</span>
      `;
      rewardsList.appendChild(rewardDiv);
    });
  }

  canSpin(wheelType) {
    const wheel = this.wheels[wheelType];
    const gameState = window.game.gameState;

    if (wheelType === "daily") {
      const lastSpin = gameState.lastDailySpin || 0;
      return Date.now() - lastSpin >= wheel.cooldown;
    } else {
      return gameState.coins >= wheel.cost;
    }
  }

  getTimeUntilNextSpin(wheelType) {
    if (wheelType !== "daily") return "";

    const gameState = window.game.gameState;
    const lastSpin = gameState.lastDailySpin || 0;
    const timeUntilNext = lastSpin + this.wheels.daily.cooldown - Date.now();

    if (timeUntilNext <= 0) return "Available now!";

    const hours = Math.floor(timeUntilNext / (1000 * 60 * 60));
    const minutes = Math.floor(
      (timeUntilNext % (1000 * 60 * 60)) / (1000 * 60)
    );

    return `${hours}h ${minutes}m`;
  }

  drawWheel() {
    const canvas = document.getElementById("wheelCanvas");
    const ctx = canvas.getContext("2d");
    const wheel = this.wheels[this.currentWheel];

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 180;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate angles for each reward
    const totalWeight = wheel.rewards.reduce(
      (sum, reward) => sum + reward.weight,
      0
    );
    let currentAngle = 0;

    wheel.rewards.forEach((reward, index) => {
      const sliceAngle = (reward.weight / totalWeight) * 2 * Math.PI;

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(
        centerX,
        centerY,
        radius,
        currentAngle,
        currentAngle + sliceAngle
      );
      ctx.closePath();

      // Color gradient based on rarity
      const colors = [
        "#ff6b6b",
        "#4ecdc4",
        "#45b7d1",
        "#96ceb4",
        "#feca57",
        "#ff9ff3",
        "#54a0ff",
        "#5f27cd",
      ];
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();

      // Draw border
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(currentAngle + sliceAngle / 2);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";

      const text = reward.display.split(" ").slice(-1)[0]; // Get last word
      ctx.fillText(text, radius * 0.7, 5);

      ctx.restore();

      currentAngle += sliceAngle;
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = "#2c3e50";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  spin() {
    if (!this.canSpin(this.currentWheel)) return;

    const wheel = this.wheels[this.currentWheel];
    const gameState = window.game.gameState;

    // Deduct cost
    if (this.currentWheel === "daily") {
      gameState.lastDailySpin = Date.now();
    } else {
      gameState.coins -= wheel.cost;
    }

    // Disable spin button
    const spinButton = document.getElementById("spinButton");
    spinButton.disabled = true;
    spinButton.textContent = "Spinning...";

    // Select random reward
    const reward = this.selectRandomReward(wheel.rewards);

    // Animate wheel spin
    this.animateWheelSpin(() => {
      this.giveReward(reward);
      this.updateWheelDisplay();
      window.game.updateDisplay();
      window.game.saveGame();
    });
  }

  selectRandomReward(rewards) {
    const totalWeight = rewards.reduce((sum, reward) => sum + reward.weight, 0);
    let random = Math.random() * totalWeight;

    for (const reward of rewards) {
      random -= reward.weight;
      if (random <= 0) {
        return reward;
      }
    }

    return rewards[0]; // Fallback
  }

  animateWheelSpin(callback) {
    const canvas = document.getElementById("wheelCanvas");
    let rotation = 0;
    const spins = 3 + Math.random() * 3; // 3-6 full rotations
    const totalRotation = spins * 360;
    const duration = 3000; // 3 seconds

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      rotation = eased * totalRotation;

      canvas.style.transform = `rotate(${rotation}deg)`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          canvas.style.transform = "rotate(0deg)";
          callback();
        }, 500);
      }
    };

    animate();
  }

  giveReward(reward) {
    const gameState = window.game.gameState;
    let message = "";

    switch (reward.type) {
      case "coins":
        gameState.coins += reward.amount;
        message = `You won ${reward.amount} coins! 💰`;
        break;

      case "fish":
        const species = this.getRandomSpeciesByRarity(reward.species);
        const newFish = window.shopManager.generateFish(species);
        gameState.fishInTank.push(newFish);
        gameState.collection.add(species);
        message = `You won a ${fishSpecies[species]?.name || species}! 🐠`;
        break;

      case "breeding_boost":
        gameState.breedingBoostEnd = Date.now() + reward.duration;
        const hours = Math.floor(reward.duration / 3600000);
        message = `Breeding speed boosted for ${hours} hour(s)! ⚡`;
        break;

      case "tank_upgrade":
        if (reward.upgrade === "decoration") {
          const decorations = ["🌱", "🪨", "⭐", "🌊", "🐚"];
          const decoration = {
            emoji: decorations[Math.floor(Math.random() * decorations.length)],
            x: Math.random() * 300,
            y: Math.random() * 200 + 100,
          };
          gameState.decorations.push(decoration);
          message = "You won a premium decoration! 🌱";
        } else if (reward.upgrade === "capacity") {
          gameState.maxFishSlots = (gameState.maxFishSlots || 20) + 5;
          message = "Tank capacity increased by 5! 🏠";
        }
        break;

      case "jackpot":
      case "mega_jackpot":
      case "cosmic_jackpot":
        gameState.coins += reward.amount;
        message = `🎰 JACKPOT! You won ${reward.amount} coins! 🎰`;
        break;
    }

    // Show reward notification
    window.game.showNotification(message, "success");

    // Track statistics
    gameState.totalSpins = (gameState.totalSpins || 0) + 1;
    gameState.totalWheelRewards =
      (gameState.totalWheelRewards || 0) + (reward.amount || 1);
  }

  getRandomSpeciesByRarity(rarityType) {
    const allSpecies = Object.keys(fishSpecies);
    let targetRarity;

    switch (rarityType) {
      case "random_common":
        targetRarity = "common";
        break;
      case "random_uncommon":
        targetRarity = "uncommon";
        break;
      case "random_rare":
        targetRarity = "rare";
        break;
      case "random_legendary":
        targetRarity = "legendary";
        break;
      case "random_mythical":
        targetRarity = "mythical";
        break;
      default:
        return allSpecies[Math.floor(Math.random() * allSpecies.length)];
    }

    const filteredSpecies = allSpecies.filter(
      (species) =>
        window.pokedexManager?.getFishRarity(species) === targetRarity
    );

    return filteredSpecies.length > 0
      ? filteredSpecies[Math.floor(Math.random() * filteredSpecies.length)]
      : allSpecies[Math.floor(Math.random() * allSpecies.length)];
  }

  updateDailySpinButton() {
    const dailyBtn = document.querySelector(".daily-spin-btn");
    if (dailyBtn) {
      const canSpin = this.canSpin("daily");
      dailyBtn.style.background = canSpin
        ? "linear-gradient(45deg, #4caf50, #81c784)"
        : "linear-gradient(45deg, #757575, #9e9e9e)";

      dailyBtn.innerHTML = canSpin
        ? "<span>🎰</span> Daily Spin (FREE!)"
        : "<span>🎰</span> Daily Spin (Used)";
    }
  }
}

// Spin Wheel manager will be initialized by main.js

// AdMob Integration for Virtual Aquarium
class AdManager {
  constructor() {
    this.isAdMobReady = false;
    this.rewardedAdReady = false;
    this.interstitialAdReady = false;
    this.bannerAdShowing = false;

    // AdMob IDs (replace with your actual IDs)
    this.adIds = {
      banner: "ca-app-pub-YOUR_PUBLISHER_ID/YOUR_BANNER_AD_UNIT_ID",
      interstitial: "ca-app-pub-YOUR_PUBLISHER_ID/YOUR_INTERSTITIAL_AD_UNIT_ID",
      rewarded: "ca-app-pub-YOUR_PUBLISHER_ID/YOUR_REWARDED_AD_UNIT_ID",
    };

    this.init();
  }

  init() {
    document.addEventListener("deviceready", () => {
      if (window.AdMob) {
        this.isAdMobReady = true;
        this.setupAds();
        console.log("AdMob initialized successfully");
      }
    });
  }

  setupAds() {
    // Configure AdMob
    window.AdMob.setOptions({
      publisherId: this.adIds.banner,
      interstitialAdId: this.adIds.interstitial,
      rewardVideoId: this.adIds.rewarded,
      isTesting: true, // Set to false for production
      autoShowBanner: false,
      autoShowInterstitial: false,
      autoShowRewarded: false,
    });

    // Prepare ads
    this.prepareBannerAd();
    this.prepareInterstitialAd();
    this.prepareRewardedAd();
  }

  // Banner Ads (shown at bottom of screen)
  prepareBannerAd() {
    if (!this.isAdMobReady) return;

    window.AdMob.createBannerView(
      {
        publisherId: this.adIds.banner,
        adSize: window.AdMob.AD_SIZE.SMART_BANNER,
        bannerAtTop: false,
      },
      () => {
        console.log("Banner ad prepared");
      }
    );
  }

  showBannerAd() {
    if (!this.isAdMobReady || this.bannerAdShowing) return;

    window.AdMob.showAd(true, () => {
      this.bannerAdShowing = true;
      console.log("Banner ad shown");
    });
  }

  hideBannerAd() {
    if (!this.isAdMobReady || !this.bannerAdShowing) return;

    window.AdMob.showAd(false, () => {
      this.bannerAdShowing = false;
      console.log("Banner ad hidden");
    });
  }

  // Interstitial Ads (full screen ads)
  prepareInterstitialAd() {
    if (!this.isAdMobReady) return;

    window.AdMob.prepareInterstitial(
      {
        adId: this.adIds.interstitial,
        autoShow: false,
      },
      () => {
        this.interstitialAdReady = true;
        console.log("Interstitial ad prepared");
      }
    );
  }

  showInterstitialAd(callback) {
    if (!this.isAdMobReady || !this.interstitialAdReady) {
      if (callback) callback(false);
      return;
    }

    window.AdMob.showInterstitial(() => {
      this.interstitialAdReady = false;
      this.prepareInterstitialAd(); // Prepare next ad
      if (callback) callback(true);
      console.log("Interstitial ad shown");
    });
  }

  // Rewarded Video Ads (users get rewards for watching)
  prepareRewardedAd() {
    if (!this.isAdMobReady) return;

    window.AdMob.prepareRewardVideoAd(
      {
        adId: this.adIds.rewarded,
        autoShow: false,
      },
      () => {
        this.rewardedAdReady = true;
        console.log("Rewarded ad prepared");
      }
    );
  }

  showRewardedAd(rewardCallback) {
    if (!this.isAdMobReady || !this.rewardedAdReady) {
      if (rewardCallback) rewardCallback(false, 0);
      return;
    }

    // Listen for reward events
    document.addEventListener("onRewardVideoAdCompleted", (event) => {
      const reward = event.reward || 100; // Default reward
      if (rewardCallback) rewardCallback(true, reward);
      this.rewardedAdReady = false;
      this.prepareRewardedAd(); // Prepare next ad
    });

    window.AdMob.showRewardVideoAd(() => {
      console.log("Rewarded ad shown");
    });
  }

  // Monetization helpers
  shouldShowInterstitial() {
    // Show interstitial every 5 fish purchases or 10 breeding attempts
    const purchases = window.game.gameState.totalPurchases || 0;
    const breedings = window.game.gameState.totalBreedings || 0;
    return (
      (purchases > 0 && purchases % 5 === 0) ||
      (breedings > 0 && breedings % 10 === 0)
    );
  }

  getCoinsReward() {
    return Math.floor(Math.random() * 100) + 50; // 50-150 coins
  }

  getRandomFishReward() {
    const rareSpecies = ["angelfish", "seahorse", "butterflyfish", "mandarin"];
    return rareSpecies[Math.floor(Math.random() * rareSpecies.length)];
  }
}

// Initialize Ad Manager
window.adManager = new AdManager();

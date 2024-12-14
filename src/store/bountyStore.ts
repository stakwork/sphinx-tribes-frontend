import { makeAutoObservable } from 'mobx';

interface FeaturedBounty {
  bountyId: string;
  url: string;
}

class BountyStore {
  featuredBounty: FeaturedBounty | null = null;

  constructor() {
    makeAutoObservable(this);
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('featuredBounty');
      if (saved) {
        this.featuredBounty = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('featuredBounty', JSON.stringify(this.featuredBounty));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  getBountyIdFromURL(url: string): string | null {
    const match = url.match(/\/bounty\/(\d+)$/);
    return match ? match[1] : null;
  }

  addFeaturedBounty(url: string): void {
    const bountyId = this.getBountyIdFromURL(url);
    if (bountyId) {
      this.featuredBounty = { bountyId, url };
      this.saveToStorage();
    }
  }

  removeFeaturedBounty(): void {
    this.featuredBounty = null;
    this.saveToStorage();
  }

  hasBounty(bountyId: string): boolean {
    return this.featuredBounty?.bountyId === bountyId;
  }

  getFeaturedBounty(): FeaturedBounty | null {
    return this.featuredBounty;
  }
}

export const bountyStore = new BountyStore();

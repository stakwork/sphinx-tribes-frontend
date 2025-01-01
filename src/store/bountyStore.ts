import { makeAutoObservable } from 'mobx';

/* eslint-disable @typescript-eslint/typedef */
interface FeaturedBounty {
  bountyId: string;
  url: string;
}
class BountyStore {
  featuredBounties: FeaturedBounty[] = [];

  constructor() {
    makeAutoObservable(this);
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('featuredBounties');
      if (saved) {
        this.featuredBounties = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('featuredBounties', JSON.stringify(this.featuredBounties));
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
    if (bountyId && !this.hasBounty(bountyId)) {
      this.featuredBounties.push({ bountyId, url });
      this.saveToStorage();
    }
  }

  removeFeaturedBounty(bountyId: string): void {
    this.featuredBounties = this.featuredBounties.filter((bounty) => bounty.bountyId !== bountyId);
    this.saveToStorage();
  }

  removeAllFeaturedBounties(): void {
    this.featuredBounties = [];
    this.saveToStorage();
  }

  hasBounty(bountyId: string): boolean {
    return this.featuredBounties.some((bounty) => bounty.bountyId === bountyId);
  }

  getFeaturedBounties(): FeaturedBounty[] {
    return this.featuredBounties;
  }
}

export const bountyStore = new BountyStore();

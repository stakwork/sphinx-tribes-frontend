import { makeAutoObservable } from 'mobx';

export interface FeaturedBounty {
  bountyId: string;
  url: string;
  addedAt: number;
  title?: string;
}

export class BountyStore {
  featuredBounties: FeaturedBounty[] = [];
  maxFeaturedBounties = 3;

  constructor() {
    makeAutoObservable(this);
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('featuredBounties');
      if (saved) {
        this.featuredBounties = JSON.parse(saved);
        return;
      }

      const oldSaved = localStorage.getItem('featuredBounty');
      if (oldSaved) {
        const oldBounty = JSON.parse(oldSaved);
        this.featuredBounties = [
          {
            ...oldBounty,
            addedAt: Date.now()
          }
        ];
        this.saveToStorage();
        localStorage.removeItem('featuredBounty');
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

  addFeaturedBounty(url: string, title?: string): void {
    const bountyId = this.getBountyIdFromURL(url);
    if (!bountyId || this.hasBounty(bountyId)) return;

    const newBounty: FeaturedBounty = {
      bountyId,
      url,
      title,
      addedAt: Date.now()
    };

    this.featuredBounties = [newBounty, ...this.featuredBounties].slice(
      0,
      this.maxFeaturedBounties
    );

    this.saveToStorage();
  }

  removeFeaturedBounty(bountyId: string): void {
    this.featuredBounties = this.featuredBounties.filter(
      (b: FeaturedBounty) => b.bountyId !== bountyId
    );
    this.saveToStorage();
  }

  hasBounty(bountyId: string): boolean {
    return this.featuredBounties.some((b: FeaturedBounty) => b.bountyId === bountyId);
  }

  getFeaturedBounties(): FeaturedBounty[] {
    return this.featuredBounties;
  }

  clearFeaturedBounties(): void {
    this.featuredBounties = [];
    this.saveToStorage();
  }
}

export const bountyStore = new BountyStore();

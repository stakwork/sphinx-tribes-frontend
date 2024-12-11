import { makeAutoObservable } from 'mobx';

interface FeaturedBounty {
  bountyId: string;
  sequence: number;
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

  addFeaturedBounty(bountyId: string): void {
    const nextSequence = this.featuredBounties.length + 1;
    const exists = this.featuredBounties.some((b: FeaturedBounty) => b.bountyId === bountyId);

    if (!exists) {
      this.featuredBounties.push({
        bountyId,
        sequence: nextSequence
      });
      this.saveToStorage();
    }
  }

  removeFeaturedBounty(bountyId: string): void {
    this.featuredBounties = this.featuredBounties.filter(
      (b: FeaturedBounty) => b.bountyId !== bountyId
    );
    this.featuredBounties.forEach((bounty: FeaturedBounty, index: number) => {
      bounty.sequence = index + 1;
    });
    this.saveToStorage();
  }

  getFeaturedBounties(): FeaturedBounty[] {
    return this.featuredBounties
      .slice()
      .sort((a: FeaturedBounty, b: FeaturedBounty) => a.sequence - b.sequence);
  }

  updateSequence(bountyId: string, newSequence: number): void {
    const bounty = this.featuredBounties.find((b: FeaturedBounty) => b.bountyId === bountyId);
    if (bounty) {
      bounty.sequence = newSequence;
      this.saveToStorage();
    }
  }

  hasBounty(bountyId: string): boolean {
    const exists = this.featuredBounties.some((b: FeaturedBounty) => b.bountyId === bountyId);
    return exists;
  }

  clearAllBounties(): void {
    this.featuredBounties = [];
    this.saveToStorage();
  }
}

export const bountyStore = new BountyStore();

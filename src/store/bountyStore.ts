import { makeAutoObservable } from 'mobx';
import { mainStore } from './main.ts';

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
    this.loadFeaturedBounties();
  }

  async loadFeaturedBounties() {
    try {
      this.featuredBounties = (await mainStore.fetchFeaturedBounties()) as FeaturedBounty[];

      return this.featuredBounties;
    } catch (error) {
      console.error('Error loading featured bounties:', error);
    }
  }

  getBountyIdFromURL(url: string): string | null {
    const match = url.match(/\/bounty\/(\d+)$/);
    return match ? match[1] : null;
  }

  async addFeaturedBounty(bounty: { bountyId: string; url: string; title?: string }) {
    try {
      await mainStore.addFeaturedBounty(bounty);
      await this.loadFeaturedBounties();

      return true;
    } catch (error) {
      console.error('Error adding featured bounty:', error);
      return false;
    }
  }

  async removeFeaturedBounty(bountyId: string) {
    try {
      await mainStore.deleteFeaturedBounty(bountyId);

      await this.loadFeaturedBounties();

      return true;
    } catch (error) {
      console.error('Error deleting featured bounty:', error);
      return false;
    }
  }

  hasBounty(bountyId: string): boolean {
    return this.featuredBounties.some((b: FeaturedBounty) => b.bountyId === bountyId);
  }

  getFeaturedBounties(): FeaturedBounty[] {
    return this.featuredBounties;
  }

  async clearFeaturedBounties() {
    try {
      for (const bounty of this.featuredBounties) {
        await this.removeFeaturedBounty(bounty.bountyId);
      }

      await this.loadFeaturedBounties();

      console.log('All featured bounties removed successfully.');
    } catch (error) {
      console.error('Error removing all featured bounties:', error);
    }
  }
}

export const bountyStore = new BountyStore();

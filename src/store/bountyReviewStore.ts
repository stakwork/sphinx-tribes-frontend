import { makeAutoObservable } from 'mobx';
import { ProofOfWork, BountyTiming } from './interface';

export class BountyReviewStore {
  proofs: Record<string, ProofOfWork[]> = {};
  timings: Record<string, BountyTiming> = {};
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setProofs(bountyId: string, proofs: ProofOfWork[]) {
    this.proofs[bountyId] = proofs;
  }

  setTiming(bountyId: string, timing: BountyTiming) {
    this.timings[bountyId] = timing;
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  setError(error: string | null) {
    this.error = error;
  }

  getProofs(bountyId: string): ProofOfWork[] {
    return this.proofs[bountyId] || [];
  }

  getTiming(bountyId: string): BountyTiming | undefined {
    return this.timings[bountyId];
  }
}

export const bountyReviewStore = new BountyReviewStore();

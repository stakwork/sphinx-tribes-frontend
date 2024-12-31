import { makeAutoObservable } from 'mobx';
import { TribesURL } from 'config';
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

  async getProofs(bountyId: string) {
    try {
      this.setLoading(true);
      const response = await fetch(`${TribesURL}/bounties/${bountyId}/proofs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load proofs: ${response.statusText}`);
      }

      const data = (await response.json()) as ProofOfWork[];
      this.setProofs(bountyId, data);
    } catch (error: any) {
      this.setError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  async submitProof(bountyId: string, description: string) {
    try {
      this.setLoading(true);

      // Submit proof
      let response = await fetch(`${TribesURL}/bounties/${bountyId}/proof`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description })
      });

      if (!response.ok) {
        throw new Error(`Failed to submit proof: ${response.statusText}`);
      }

      const proof = (await response.json()) as ProofOfWork;

      // Pause timer
      response = await fetch(`${TribesURL}/bounties/${bountyId}/timing/close`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to pause timer: ${response.statusText}`);
      }

      // Update local state
      const proofs = [...(this.proofs[bountyId] || []), proof];
      this.setProofs(bountyId, proofs);
    } catch (error: any) {
      this.setError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  async getTiming(bountyId: string) {
    try {
      this.setLoading(true);
      const response = await fetch(`${TribesURL}/bounties/${bountyId}/timing-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load timing stats: ${response.statusText}`);
      }

      const data = (await response.json()) as BountyTiming;
      this.setTiming(bountyId, data);
    } catch (error: any) {
      this.setError(error.message);
    } finally {
      this.setLoading(false);
    }
  }
}

export const bountyReviewStore = new BountyReviewStore();

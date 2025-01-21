import { makeAutoObservable } from 'mobx';
import { TribesURL } from 'config';
import { ProofOfWork, BountyTiming } from './interface';
import { uiStore } from './ui';

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
      if (!uiStore._meInfo) return null;
      const info = uiStore.meInfo;

      this.setLoading(true);
      const response = await fetch(`${TribesURL}/gobounties/${bountyId}/proofs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-jwt': info?.tribe_jwt || ''
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
      if (!uiStore._meInfo) return null;
      const info = uiStore.meInfo;
      this.setLoading(true);

      // Submit proof
      let response = await fetch(`${TribesURL}/gobounties/${bountyId}/proof`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-jwt': info?.tribe_jwt || ''
        },
        body: JSON.stringify({ description })
      });

      console.log(info?.tribe_jwt);

      if (!response.ok) {
        throw new Error(`Failed to submit proof: ${response.statusText}`);
      }

      const proof = (await response.json()) as ProofOfWork;

      // Pause timer
      response = await fetch(`${TribesURL}/gobounties/${bountyId}/timing/close`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-jwt': info?.tribe_jwt || ''
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
      if (!uiStore._meInfo) return null;
      const info = uiStore.meInfo;
      this.setLoading(true);
      const response = await fetch(`${TribesURL}/gobounties/${bountyId}/timing`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-jwt': info?.tribe_jwt || ''
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load timing stats: ${response.statusText}`);
      }

      const data = await response.json();
      this.setTiming(bountyId, data);
    } catch (error: any) {
      this.setError(error.message);
    } finally {
      this.setLoading(false);
    }
  }
}

export const bountyReviewStore = new BountyReviewStore();

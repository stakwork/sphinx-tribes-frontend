import { makeAutoObservable } from 'mobx';
import { TribesURL } from 'config';
import { ProofOfWork, BountyTiming, BountyReviewStatus } from './interface';
import { uiStore } from './ui';

export class BountyReviewStore {
  proofs: Record<string, ProofOfWork[]> = {};
  timings: Record<string, BountyTiming> = {};
  reviewLoading: Record<string, boolean> = {};
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

  removeTiming(bountyId: string) {
    delete this.timings[bountyId];
  }

  getTiming(bountyId: string) {
    return this.timings[bountyId];
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  setError(error: string | null) {
    this.error = error;
  }

  setReviewLoading(proofId: string, loading: boolean) {
    this.reviewLoading[proofId] = loading;
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
      const response = await fetch(`${TribesURL}/gobounties/${bountyId}/proof`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-jwt': info?.tribe_jwt || ''
        },
        body: JSON.stringify({ description })
      });

      if (!response.ok) {
        throw new Error(`Failed to submit proof: ${response.statusText}`);
      }

      const proof = (await response.json()) as ProofOfWork;

      const proofs = [...(this.proofs[bountyId] || []), proof];
      this.closeBountyTiming(bountyId);
      this.setProofs(bountyId, proofs);
    } catch (error: any) {
      this.setError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  async getBountyTiming(bountyId: string): Promise<BountyTiming | null> {
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

      const data: BountyTiming = await response.json();
      this.setTiming(bountyId, data);
      return data;
    } catch (error: any) {
      this.setError(error.message);
      return null;
    } finally {
      this.setLoading(false);
    }
  }

  async startBountyTiming(bountyId: string) {
    try {
      if (!uiStore._meInfo) return null;
      const info = uiStore.meInfo;
      this.setLoading(true);
      const response = await fetch(`${TribesURL}/gobounties/${bountyId}/timing/start`, {
        method: 'PUT',
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

  async closeBountyTiming(bountyId: string) {
    try {
      if (!uiStore._meInfo) return null;
      const info = uiStore.meInfo;
      this.setLoading(true);

      const response = await fetch(`${TribesURL}/gobounties/${bountyId}/timing/close`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-jwt': info?.tribe_jwt || ''
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load timing stats: ${response.statusText}`);
      }

      this.removeTiming(bountyId);
    } catch (error: any) {
      this.setError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  async deleteBountyTiming(bountyId: string) {
    try {
      if (!uiStore._meInfo) return null;
      const info = uiStore.meInfo;
      this.setLoading(true);
      const response = await fetch(`${TribesURL}/gobounties/${bountyId}/timing`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-jwt': info?.tribe_jwt || ''
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load timing stats: ${response.statusText}`);
      }

      this.removeTiming(bountyId);
    } catch (error: any) {
      this.setError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  async updateProofStatus(bountyId: string, proofId: string, status: BountyReviewStatus) {
    try {
      if (!uiStore._meInfo) return;
      const info = uiStore.meInfo;

      this.setReviewLoading(proofId, true);
      const response = await fetch(`${TribesURL}/gobounties/${bountyId}/proofs/${proofId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-jwt': info?.tribe_jwt || ''
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error(`Failed to update proof status: ${response.status} ${response.statusText}`);
      }

      await this.getProofs(bountyId);
    } catch (error: any) {
      throw new Error(`Failed to update proof status`);
    } finally {
      this.setReviewLoading(proofId, false);
    }
  }

  async deleteProof(bountyId: string, proofId: string) {
    try {
      if (!uiStore._meInfo) return;
      const info = uiStore.meInfo;

      this.setReviewLoading(proofId, true);
      const response = await fetch(`${TribesURL}/gobounties/${bountyId}/proofs/${proofId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-jwt': info?.tribe_jwt || ''
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to update proof status: ${response.status} ${response.statusText}`);
      }

      await this.getProofs(bountyId);
    } catch (error: any) {
      throw new Error(`Failed to update proof status`);
    } finally {
      this.setReviewLoading(proofId, false);
    }
  }
}

export const bountyReviewStore = new BountyReviewStore();

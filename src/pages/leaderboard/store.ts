/* eslint-disable prefer-destructuring */
import { orderBy } from 'lodash';
import memo from 'memo-decorator';
import { makeAutoObservable } from 'mobx';
import api from '../../api';
import { mainStore } from '../../store/main.ts';

export type LeaderItem = {
  owner_pubkey: string;
  total_bounties_completed: number;
  total_sats_earned: number;
};

export class LeaderboardStore {
  dailyBountiesCompleted: number = 0;
  dailySatsEarned: number = 0;
  isDailyLoading: boolean = false;
  errorDaily: any = null;
  private leaders: LeaderItem[] = [];

  public isLoading = false;
  public error: any;
  public total: LeaderItem | null = null;
  constructor() {
    makeAutoObservable(this);
  }

  @memo()
  async fetchLeaders() {
    this.isLoading = true;
    try {
      const resp = (await api.get('people/bounty/leaderboard')) as LeaderItem[];
      this.total = resp.reduce(
        (partialSum: LeaderItem, assigneeStats: LeaderItem) => {
          partialSum.total_bounties_completed += assigneeStats.total_bounties_completed;
          partialSum.total_sats_earned += assigneeStats.total_sats_earned;

          return partialSum;
        },
        { owner_pubkey: '', total_bounties_completed: 0, total_sats_earned: 0 }
      );
      this.leaders = resp;
    } catch (e) {
      this.error = e;
    } finally {
      this.isLoading = false;
    }
  }
  
  async fetchDailyBounty() {
    this.isDailyLoading = true;
    try {
      const resp = (await api.get('people/bounty/daily')) as { daily_bounties_completed: number, daily_sats_earned: number };
      this.dailyBountiesCompleted = resp.daily_bounties_completed;
      this.dailySatsEarned = resp.daily_sats_earned;
    } catch (e) {
      this.errorDaily = e;
    } finally {
      this.isDailyLoading = false;
    }
  }

  get sortedBySats() {
    return orderBy(this.leaders, 'total_sats_earned', 'desc');
  }

  get top3() {
    return this.sortedBySats.slice(0, 3);
  }
  get others() {
    return this.sortedBySats.slice(3);
  }

  get topEarners() {
    return this.sortedBySats;
  }
}

export const leaderboardStore = new LeaderboardStore();

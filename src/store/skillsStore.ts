import { makeAutoObservable } from 'mobx';
import { skillsService } from '../services/skillsService';
import { Skill, SkillInstall } from './interface';

export interface SkillsStore {
  skills: Map<string, Skill>;
  skillInstalls: Map<string, SkillInstall[]>;

  createSkill: (skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Skill | undefined>;
  getSkill: (id: string) => Skill | undefined;
  updateSkill: (id: string, skillUpdate: Partial<Skill>) => Promise<Skill | undefined>;
  deleteSkill: (id: string) => Promise<boolean>;

  createSkillInstall: (
    skillId: string,
    install: Omit<SkillInstall, 'id' | 'skillId' | 'createdAt' | 'updatedAt'>
  ) => Promise<SkillInstall | undefined>;
  getSkillInstalls: (skillId: string) => SkillInstall[] | undefined;
  getSkillInstall: (id: string) => Promise<SkillInstall | undefined>;
  updateSkillInstall: (
    id: string,
    installUpdate: Partial<SkillInstall>
  ) => Promise<SkillInstall | undefined>;
  deleteSkillInstall: (id: string) => Promise<boolean>;

  filterByLabel: (label: string) => Skill[];
  filterByOwner: (ownerPubkey: string) => Skill[];
  filterByKeyword: (keyword: string) => Skill[];
  getActiveSkills: () => Skill[];

  loadAllSkills: () => Promise<Skill[] | undefined>;
  loadSkillInstalls: (skillId: string) => Promise<SkillInstall[] | undefined>;
}

export class SkillsStoreImpl implements SkillsStore {
  skills: Map<string, Skill> = new Map();
  skillInstalls: Map<string, SkillInstall[]> = new Map();

  constructor() {
    makeAutoObservable(this);
  }

  async createSkill(
    skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Skill | undefined> {
    try {
      const newSkill = await skillsService.createSkill(skill);
      if (newSkill) {
        this.skills.set(newSkill.id, newSkill);
        return newSkill;
      }
      return undefined;
    } catch (error) {
      console.error('Error creating skill in store:', error);
      return undefined;
    }
  }

  getSkill(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  async updateSkill(id: string, skillUpdate: Partial<Skill>): Promise<Skill | undefined> {
    try {
      const updatedSkill = await skillsService.updateSkill(id, skillUpdate);
      if (updatedSkill) {
        this.skills.set(id, updatedSkill);
        return updatedSkill;
      }
      return undefined;
    } catch (error) {
      console.error(`Error updating skill with id ${id} in store:`, error);
      return undefined;
    }
  }

  async deleteSkill(id: string): Promise<boolean> {
    try {
      const success = await skillsService.deleteSkill(id);
      if (success) {
        this.skills.delete(id);
        this.skillInstalls.delete(id);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting skill with id ${id} in store:`, error);
      return false;
    }
  }

  async createSkillInstall(
    skillId: string,
    install: Omit<SkillInstall, 'id' | 'skillId' | 'createdAt' | 'updatedAt'>
  ): Promise<SkillInstall | undefined> {
    try {
      const newInstall = await skillsService.createSkillInstall(skillId, install);
      if (newInstall) {
        const currentInstalls = this.skillInstalls.get(skillId) || [];
        this.skillInstalls.set(skillId, [...currentInstalls, newInstall]);
        return newInstall;
      }
      return undefined;
    } catch (error) {
      console.error('Error creating skill installation in store:', error);
      return undefined;
    }
  }

  getSkillInstalls(skillId: string): SkillInstall[] | undefined {
    return this.skillInstalls.get(skillId);
  }

  async getSkillInstall(id: string): Promise<SkillInstall | undefined> {
    try {
      return await skillsService.getSkillInstallById(id);
    } catch (error) {
      console.error(`Error getting skill installation with id ${id}:`, error);
      return undefined;
    }
  }

  async updateSkillInstall(
    id: string,
    installUpdate: Partial<SkillInstall>
  ): Promise<SkillInstall | undefined> {
    try {
      const updatedInstall = await skillsService.updateSkillInstall(id, installUpdate);
      if (updatedInstall && updatedInstall.skillId) {
        const { skillId } = updatedInstall;
        const currentInstalls = this.skillInstalls.get(skillId) || [];
        const updatedInstalls = currentInstalls.map((install) =>
          install.id === id ? updatedInstall : install
        );
        this.skillInstalls.set(skillId, updatedInstalls);
        return updatedInstall;
      }
      return undefined;
    } catch (error) {
      console.error(`Error updating skill installation with id ${id} in store:`, error);
      return undefined;
    }
  }

  async deleteSkillInstall(id: string): Promise<boolean> {
    try {
      let skillId: string | undefined;
      let installToDelete: SkillInstall | undefined;

      for (const [sid, installs] of Array.from(this.skillInstalls.entries())) {
        const found = installs.find((install) => install.id === id);
        if (found) {
          skillId = sid;
          installToDelete = found;
          break;
        }
      }

      if (!skillId || !installToDelete) {
        const install = await this.getSkillInstall(id);
        if (install) {
          const { skillId: installSkillId } = install;
          skillId = installSkillId;
        } else {
          return false;
        }
      }

      const success = await skillsService.deleteSkillInstall(id);
      if (success && skillId) {
        const currentInstalls = this.skillInstalls.get(skillId) || [];
        const updatedInstalls = currentInstalls.filter((install) => install.id !== id);
        this.skillInstalls.set(skillId, updatedInstalls);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting skill installation with id ${id} in store:`, error);
      return false;
    }
  }

  filterByLabel(label: string): Skill[] {
    return Array.from(this.skills.values()).filter((skill) =>
      skill.labels.some((l) => l.toLowerCase().includes(label.toLowerCase()))
    );
  }

  filterByOwner(ownerPubkey: string): Skill[] {
    return Array.from(this.skills.values()).filter((skill) => skill.ownerPubkey === ownerPubkey);
  }

  filterByKeyword(keyword: string): Skill[] {
    const lowerKeyword = keyword.toLowerCase();
    return Array.from(this.skills.values()).filter(
      (skill) =>
        skill.name.toLowerCase().includes(lowerKeyword) ||
        skill.tagline.toLowerCase().includes(lowerKeyword) ||
        skill.description.toLowerCase().includes(lowerKeyword) ||
        skill.labels.some((label) => label.toLowerCase().includes(lowerKeyword))
    );
  }

  getActiveSkills(): Skill[] {
    return Array.from(this.skills.values()).filter((skill) => skill.status === 'Approved');
  }

  async loadAllSkills(): Promise<Skill[] | undefined> {
    try {
      const skills = await skillsService.getAllSkills();
      if (skills) {
        skills.forEach((skill) => {
          this.skills.set(skill.id, skill);
        });
        return skills;
      }
      return undefined;
    } catch (error) {
      console.error('Error loading all skills:', error);
      return undefined;
    }
  }

  async loadSkillInstalls(skillId: string): Promise<SkillInstall[] | undefined> {
    try {
      const installs = await skillsService.getSkillInstallsBySkillId(skillId);
      if (installs) {
        this.skillInstalls.set(skillId, installs);
        return installs;
      }
      return undefined;
    } catch (error) {
      console.error(`Error loading skill installations for skill id ${skillId}:`, error);
      return undefined;
    }
  }
}

export const skillsStore = new SkillsStoreImpl();

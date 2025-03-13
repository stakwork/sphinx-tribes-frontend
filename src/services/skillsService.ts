import { TribesURL } from '../config';
import { Skill, SkillInstall } from '../store/interface';
import { uiStore } from '../store/ui';

export class SkillsService {
  async createSkill(
    skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Skill | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;

      const response = await fetch(`${TribesURL}/skill`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-jwt': uiStore.meInfo.tribe_jwt,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(skill)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating skill:', error);
      return undefined;
    }
  }

  async getAllSkills(): Promise<Skill[] | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;

      const response = await fetch(`${TribesURL}/skill`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': uiStore.meInfo.tribe_jwt,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching skills:', error);
      return undefined;
    }
  }

  async getSkillById(id: string): Promise<Skill | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;

      const response = await fetch(`${TribesURL}/skill/${id}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': uiStore.meInfo.tribe_jwt,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error fetching skill with id ${id}:`, error);
      return undefined;
    }
  }

  async updateSkill(id: string, skillUpdate: Partial<Skill>): Promise<Skill | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;

      const response = await fetch(`${TribesURL}/skill/${id}`, {
        method: 'PUT',
        mode: 'cors',
        headers: {
          'x-jwt': uiStore.meInfo.tribe_jwt,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(skillUpdate)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error updating skill with id ${id}:`, error);
      return undefined;
    }
  }

  async deleteSkill(id: string): Promise<boolean> {
    try {
      if (!uiStore.meInfo) return false;

      const response = await fetch(`${TribesURL}/skill/${id}`, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
          'x-jwt': uiStore.meInfo.tribe_jwt,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error(`Error deleting skill with id ${id}:`, error);
      return false;
    }
  }

  async createSkillInstall(
    skillId: string,
    install: Omit<SkillInstall, 'id' | 'skillId' | 'createdAt' | 'updatedAt'>
  ): Promise<SkillInstall | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;

      const response = await fetch(`${TribesURL}/skill/install/${skillId}`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-jwt': uiStore.meInfo.tribe_jwt,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(install)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating skill installation:', error);
      return undefined;
    }
  }

  async getSkillInstallsBySkillId(skillId: string): Promise<SkillInstall[] | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;

      const response = await fetch(`${TribesURL}/skill/install/${skillId}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': uiStore.meInfo.tribe_jwt,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error fetching skill installations for skill id ${skillId}:`, error);
      return undefined;
    }
  }

  async getSkillInstallById(id: string): Promise<SkillInstall | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;

      const response = await fetch(`${TribesURL}/skill/install/detail/${id}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': uiStore.meInfo.tribe_jwt,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error fetching skill installation with id ${id}:`, error);
      return undefined;
    }
  }

  async updateSkillInstall(
    id: string,
    installUpdate: Partial<SkillInstall>
  ): Promise<SkillInstall | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;

      const response = await fetch(`${TribesURL}/skill/install/detail/${id}`, {
        method: 'PUT',
        mode: 'cors',
        headers: {
          'x-jwt': uiStore.meInfo.tribe_jwt,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(installUpdate)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error updating skill installation with id ${id}:`, error);
      return undefined;
    }
  }

  async deleteSkillInstall(id: string): Promise<boolean> {
    try {
      if (!uiStore.meInfo) return false;

      const response = await fetch(`${TribesURL}/skill/install/detail/${id}`, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
          'x-jwt': uiStore.meInfo.tribe_jwt,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error(`Error deleting skill installation with id ${id}:`, error);
      return false;
    }
  }
}

export const skillsService = new SkillsService();

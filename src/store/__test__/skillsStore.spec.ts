import { skillsStore } from '../skillsStore';
import { skillsService } from '../../services/skillsService';
import { Skill, SkillInstall } from '../interface';

jest.mock('../../services/skillsService', () => ({
  skillsService: {
    createSkill: jest.fn(),
    getAllSkills: jest.fn(),
    getSkillById: jest.fn(),
    updateSkill: jest.fn(),
    deleteSkill: jest.fn(),
    createSkillInstall: jest.fn(),
    getSkillInstallsBySkillId: jest.fn(),
    getSkillInstallById: jest.fn(),
    updateSkillInstall: jest.fn(),
    deleteSkillInstall: jest.fn()
  }
}));

describe('SkillsStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    skillsStore.skills.clear();
    skillsStore.skillInstalls.clear();
  });

  const mockSkill: Skill = {
    id: 'skill-123',
    name: 'Test Skill',
    tagline: 'A test skill',
    description: 'This is a test skill for unit testing',
    iconUrl: 'https://example.com/icon.png',
    ownerPubkey: 'owner123',
    chargeModel: 'Free',
    type: 'type',
    ownerAlias: 'owner123',
    labels: ['test', 'unit-testing'],
    status: 'Approved',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  };

  const mockSkillInstall: SkillInstall = {
    id: 'install-123',
    skillId: 'skill-123',
    client: 'Claude Desktop',
    installDescription: 'Test installation',
    installFile: 'test-file.json',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  };

  // SKILL CRUD OPERATIONS
  describe('Skill CRUD Operations', () => {
    describe('createSkill', () => {
      it('should create a skill and add it to the store', async () => {
        (skillsService.createSkill as jest.Mock).mockResolvedValueOnce(mockSkill);

        const newSkill = await skillsStore.createSkill({
          name: 'Test Skill',
          tagline: 'A test skill',
          description: 'This is a test skill for unit testing',
          iconUrl: 'https://example.com/icon.png',
          ownerPubkey: 'owner123',
          chargeModel: 'Free',
          type: 'type',
          ownerAlias: 'owner123',
          labels: ['test', 'unit-testing'],
          status: 'Approved'
        });

        expect(skillsService.createSkill).toHaveBeenCalled();
        expect(newSkill).toEqual(mockSkill);
        expect(skillsStore.skills.get('skill-123')).toEqual(mockSkill);
      });

      it('should handle service returning undefined', async () => {
        (skillsService.createSkill as jest.Mock).mockResolvedValueOnce(undefined);

        const result = await skillsStore.createSkill({
          name: 'Test Skill',
          tagline: 'A test skill',
          description: 'This is a test skill for unit testing',
          iconUrl: 'https://example.com/icon.png',
          ownerPubkey: 'owner123',
          chargeModel: 'Free',
          type: 'type',
          ownerAlias: 'owner123',
          labels: ['test', 'unit-testing'],
          status: 'Approved'
        });

        expect(result).toBeUndefined();
        expect(skillsStore.skills.size).toBe(0);
      });

      it('should handle errors and return undefined', async () => {
        (skillsService.createSkill as jest.Mock).mockRejectedValueOnce(new Error('API error'));

        const result = await skillsStore.createSkill({
          name: 'Test Skill',
          tagline: 'A test skill',
          description: 'This is a test skill for unit testing',
          iconUrl: 'https://example.com/icon.png',
          ownerPubkey: 'owner123',
          type: 'type',
          ownerAlias: 'owner123',
          chargeModel: 'Free',
          labels: ['test', 'unit-testing'],
          status: 'Approved'
        });

        expect(result).toBeUndefined();
        expect(skillsStore.skills.size).toBe(0);
      });
    });

    describe('getSkill', () => {
      it('should return a skill from the store', () => {
        skillsStore.skills.set('skill-123', mockSkill);

        const skill = skillsStore.getSkill('skill-123');

        expect(skill).toEqual(mockSkill);
      });

      it('should return undefined for non-existent skill', () => {
        const skill = skillsStore.getSkill('non-existent');

        expect(skill).toBeUndefined();
      });
    });

    describe('updateSkill', () => {
      it('should update a skill in the store', async () => {
        const updatedSkill = { ...mockSkill, name: 'Updated Skill Name' };
        (skillsService.updateSkill as jest.Mock).mockResolvedValueOnce(updatedSkill);
        skillsStore.skills.set('skill-123', mockSkill);

        const result = await skillsStore.updateSkill('skill-123', { name: 'Updated Skill Name' });

        expect(skillsService.updateSkill).toHaveBeenCalledWith('skill-123', {
          name: 'Updated Skill Name'
        });
        expect(result).toEqual(updatedSkill);
        expect(skillsStore.skills.get('skill-123')).toEqual(updatedSkill);
      });

      it('should handle service returning undefined', async () => {
        (skillsService.updateSkill as jest.Mock).mockResolvedValueOnce(undefined);
        skillsStore.skills.set('skill-123', mockSkill);

        const result = await skillsStore.updateSkill('skill-123', { name: 'Updated Skill Name' });

        expect(result).toBeUndefined();
        expect(skillsStore.skills.get('skill-123')).toEqual(mockSkill);
      });

      it('should handle errors and return undefined', async () => {
        (skillsService.updateSkill as jest.Mock).mockRejectedValueOnce(new Error('API error'));
        skillsStore.skills.set('skill-123', mockSkill);

        const result = await skillsStore.updateSkill('skill-123', { name: 'Updated Skill Name' });

        expect(result).toBeUndefined();
        expect(skillsStore.skills.get('skill-123')).toEqual(mockSkill);
      });
    });

    describe('deleteSkill', () => {
      it('should delete a skill from the store', async () => {
        (skillsService.deleteSkill as jest.Mock).mockResolvedValueOnce(true);
        skillsStore.skills.set('skill-123', mockSkill);
        skillsStore.skillInstalls.set('skill-123', [mockSkillInstall]);

        const result = await skillsStore.deleteSkill('skill-123');

        expect(skillsService.deleteSkill).toHaveBeenCalledWith('skill-123');
        expect(result).toBe(true);
        expect(skillsStore.skills.has('skill-123')).toBe(false);
        expect(skillsStore.skillInstalls.has('skill-123')).toBe(false);
      });

      it('should handle API failure and not delete from store', async () => {
        (skillsService.deleteSkill as jest.Mock).mockResolvedValueOnce(false);
        skillsStore.skills.set('skill-123', mockSkill);

        const result = await skillsStore.deleteSkill('skill-123');

        expect(result).toBe(false);
        expect(skillsStore.skills.has('skill-123')).toBe(true);
      });

      it('should handle errors and return false', async () => {
        (skillsService.deleteSkill as jest.Mock).mockRejectedValueOnce(new Error('API error'));
        skillsStore.skills.set('skill-123', mockSkill);

        const result = await skillsStore.deleteSkill('skill-123');

        expect(result).toBe(false);
        expect(skillsStore.skills.has('skill-123')).toBe(true);
      });
    });
  });

  // SKILL INSTALL CRUD OPERATIONS
  describe('SkillInstall CRUD Operations', () => {
    describe('createSkillInstall', () => {
      it('should create a skill installation and add it to the store', async () => {
        (skillsService.createSkillInstall as jest.Mock).mockResolvedValueOnce(mockSkillInstall);

        const newInstall = await skillsStore.createSkillInstall('skill-123', {
          client: 'Claude Desktop',
          installDescription: 'Test installation',
          installFile: 'test-file.json'
        });

        expect(skillsService.createSkillInstall).toHaveBeenCalled();
        expect(newInstall).toEqual(mockSkillInstall);
        expect(skillsStore.skillInstalls.get('skill-123')).toEqual([mockSkillInstall]);
      });

      it('should append to existing installations for a skill', async () => {
        const existingInstall = { ...mockSkillInstall, id: 'existing-install' };
        skillsStore.skillInstalls.set('skill-123', [existingInstall]);

        (skillsService.createSkillInstall as jest.Mock).mockResolvedValueOnce(mockSkillInstall);

        const newInstall = await skillsStore.createSkillInstall('skill-123', {
          client: 'Claude Desktop',
          installDescription: 'Test installation',
          installFile: 'test-file.json'
        });

        expect(newInstall).toEqual(mockSkillInstall);
        expect(skillsStore.skillInstalls.get('skill-123')).toEqual([
          existingInstall,
          mockSkillInstall
        ]);
      });

      it('should handle service returning undefined', async () => {
        (skillsService.createSkillInstall as jest.Mock).mockResolvedValueOnce(undefined);

        const result = await skillsStore.createSkillInstall('skill-123', {
          client: 'Claude Desktop',
          installDescription: 'Test installation',
          installFile: 'test-file.json'
        });

        expect(result).toBeUndefined();
        expect(skillsStore.skillInstalls.has('skill-123')).toBe(false);
      });

      it('should handle errors and return undefined', async () => {
        (skillsService.createSkillInstall as jest.Mock).mockRejectedValueOnce(
          new Error('API error')
        );

        const result = await skillsStore.createSkillInstall('skill-123', {
          client: 'Claude Desktop',
          installDescription: 'Test installation',
          installFile: 'test-file.json'
        });

        expect(result).toBeUndefined();
        expect(skillsStore.skillInstalls.has('skill-123')).toBe(false);
      });
    });

    describe('getSkillInstalls', () => {
      it('should return skill installations from the store', () => {
        skillsStore.skillInstalls.set('skill-123', [mockSkillInstall]);

        const installs = skillsStore.getSkillInstalls('skill-123');

        expect(installs).toEqual([mockSkillInstall]);
      });

      it('should return undefined for non-existent skill installations', () => {
        const installs = skillsStore.getSkillInstalls('non-existent');

        expect(installs).toBeUndefined();
      });
    });

    describe('getSkillInstall', () => {
      it('should fetch a skill installation by ID from the service', async () => {
        (skillsService.getSkillInstallById as jest.Mock).mockResolvedValueOnce(mockSkillInstall);

        const install = await skillsStore.getSkillInstall('install-123');

        expect(skillsService.getSkillInstallById).toHaveBeenCalledWith('install-123');
        expect(install).toEqual(mockSkillInstall);
      });

      it('should handle service returning undefined', async () => {
        (skillsService.getSkillInstallById as jest.Mock).mockResolvedValueOnce(undefined);

        const install = await skillsStore.getSkillInstall('install-123');

        expect(install).toBeUndefined();
      });

      it('should handle errors and return undefined', async () => {
        (skillsService.getSkillInstallById as jest.Mock).mockRejectedValueOnce(
          new Error('API error')
        );

        const install = await skillsStore.getSkillInstall('install-123');

        expect(install).toBeUndefined();
      });
    });

    describe('updateSkillInstall', () => {
      it('should update a skill installation in the store', async () => {
        const updatedInstall = { ...mockSkillInstall, installDescription: 'Updated description' };
        (skillsService.updateSkillInstall as jest.Mock).mockResolvedValueOnce(updatedInstall);
        skillsStore.skillInstalls.set('skill-123', [mockSkillInstall]);

        const result = await skillsStore.updateSkillInstall('install-123', {
          installDescription: 'Updated description'
        });

        expect(skillsService.updateSkillInstall).toHaveBeenCalledWith('install-123', {
          installDescription: 'Updated description'
        });
        expect(result).toEqual(updatedInstall);
        expect(skillsStore.skillInstalls.get('skill-123')).toEqual([updatedInstall]);
      });

      it('should handle multiple installations for the same skill', async () => {
        const otherInstall = { ...mockSkillInstall, id: 'other-install' };
        const updatedInstall = { ...mockSkillInstall, installDescription: 'Updated description' };

        skillsStore.skillInstalls.set('skill-123', [mockSkillInstall, otherInstall]);
        (skillsService.updateSkillInstall as jest.Mock).mockResolvedValueOnce(updatedInstall);

        await skillsStore.updateSkillInstall('install-123', {
          installDescription: 'Updated description'
        });

        expect(skillsStore.skillInstalls.get('skill-123')).toEqual([updatedInstall, otherInstall]);
      });

      it('should handle service returning undefined', async () => {
        (skillsService.updateSkillInstall as jest.Mock).mockResolvedValueOnce(undefined);
        skillsStore.skillInstalls.set('skill-123', [mockSkillInstall]);

        const result = await skillsStore.updateSkillInstall('install-123', {
          installDescription: 'Updated description'
        });

        expect(result).toBeUndefined();
        expect(skillsStore.skillInstalls.get('skill-123')).toEqual([mockSkillInstall]);
      });

      it('should handle service returning install without skillId', async () => {
        const updatedInstall = { ...mockSkillInstall, skillId: undefined };
        (skillsService.updateSkillInstall as jest.Mock).mockResolvedValueOnce(updatedInstall);
        skillsStore.skillInstalls.set('skill-123', [mockSkillInstall]);

        const result = await skillsStore.updateSkillInstall('install-123', {
          installDescription: 'Updated description'
        });

        expect(result).toBeUndefined();
        expect(skillsStore.skillInstalls.get('skill-123')).toEqual([mockSkillInstall]);
      });

      it('should handle errors and return undefined', async () => {
        (skillsService.updateSkillInstall as jest.Mock).mockRejectedValueOnce(
          new Error('API error')
        );
        skillsStore.skillInstalls.set('skill-123', [mockSkillInstall]);

        const result = await skillsStore.updateSkillInstall('install-123', {
          installDescription: 'Updated description'
        });

        expect(result).toBeUndefined();
        expect(skillsStore.skillInstalls.get('skill-123')).toEqual([mockSkillInstall]);
      });
    });

    describe('deleteSkillInstall', () => {
      it('should delete a skill installation from the store when skillId is known', async () => {
        (skillsService.deleteSkillInstall as jest.Mock).mockResolvedValueOnce(true);
        skillsStore.skillInstalls.set('skill-123', [
          mockSkillInstall,
          { ...mockSkillInstall, id: 'other-install' }
        ]);

        const result = await skillsStore.deleteSkillInstall('install-123');

        expect(skillsService.deleteSkillInstall).toHaveBeenCalledWith('install-123');
        expect(result).toBe(true);
        expect(skillsStore.skillInstalls.get('skill-123')).toEqual([
          { ...mockSkillInstall, id: 'other-install' }
        ]);
      });

      it('should fetch skill installation when not found in store', async () => {
        (skillsService.getSkillInstallById as jest.Mock).mockResolvedValueOnce(mockSkillInstall);
        (skillsService.deleteSkillInstall as jest.Mock).mockResolvedValueOnce(true);

        const result = await skillsStore.deleteSkillInstall('install-123');

        expect(skillsService.getSkillInstallById).toHaveBeenCalledWith('install-123');
        expect(skillsService.deleteSkillInstall).toHaveBeenCalledWith('install-123');
        expect(result).toBe(true);
      });

      it('should handle case when installation is not found in store or API', async () => {
        (skillsService.getSkillInstallById as jest.Mock).mockResolvedValueOnce(undefined);

        const result = await skillsStore.deleteSkillInstall('install-123');

        expect(result).toBe(false);
        expect(skillsService.deleteSkillInstall).not.toHaveBeenCalled();
      });

      it('should handle API failure and not delete from store', async () => {
        (skillsService.deleteSkillInstall as jest.Mock).mockResolvedValueOnce(false);
        skillsStore.skillInstalls.set('skill-123', [mockSkillInstall]);

        const result = await skillsStore.deleteSkillInstall('install-123');

        expect(result).toBe(false);
        expect(skillsStore.skillInstalls.get('skill-123')).toEqual([mockSkillInstall]);
      });

      it('should handle errors and return false', async () => {
        (skillsService.deleteSkillInstall as jest.Mock).mockRejectedValueOnce(
          new Error('API error')
        );
        skillsStore.skillInstalls.set('skill-123', [mockSkillInstall]);

        const result = await skillsStore.deleteSkillInstall('install-123');

        expect(result).toBe(false);
        expect(skillsStore.skillInstalls.get('skill-123')).toEqual([mockSkillInstall]);
      });
    });
  });

  // FILTERING FUNCTIONS
  describe('Filtering Functions', () => {
    describe('filterByLabel', () => {
      it('should filter skills by label', () => {
        skillsStore.skills.set('skill-1', {
          ...mockSkill,
          id: 'skill-1',
          labels: ['test', 'frontend']
        });
        skillsStore.skills.set('skill-2', { ...mockSkill, id: 'skill-2', labels: ['backend'] });
        skillsStore.skills.set('skill-3', {
          ...mockSkill,
          id: 'skill-3',
          labels: ['test', 'database']
        });

        const filteredSkills = skillsStore.filterByLabel('test');

        expect(filteredSkills).toHaveLength(2);
        expect(filteredSkills.map((s) => s.id).sort()).toEqual(['skill-1', 'skill-3']);
      });

      it('should handle case-insensitive filtering', () => {
        skillsStore.skills.set('skill-1', {
          ...mockSkill,
          id: 'skill-1',
          labels: ['Test', 'Frontend']
        });

        const filteredSkills = skillsStore.filterByLabel('test');

        expect(filteredSkills).toHaveLength(1);
        expect(filteredSkills[0].id).toBe('skill-1');
      });

      it('should handle partial matches', () => {
        skillsStore.skills.set('skill-1', {
          ...mockSkill,
          id: 'skill-1',
          labels: ['testing', 'frontend']
        });

        const filteredSkills = skillsStore.filterByLabel('test');

        expect(filteredSkills).toHaveLength(1);
        expect(filteredSkills[0].id).toBe('skill-1');
      });

      it('should return empty array when no matches found', () => {
        skillsStore.skills.set('skill-1', { ...mockSkill, id: 'skill-1', labels: ['frontend'] });

        const filteredSkills = skillsStore.filterByLabel('backend');

        expect(filteredSkills).toHaveLength(0);
      });

      it('should handle empty store', () => {
        const filteredSkills = skillsStore.filterByLabel('test');

        expect(filteredSkills).toHaveLength(0);
      });
    });

    describe('filterByOwner', () => {
      it('should filter skills by owner pubkey', () => {
        skillsStore.skills.set('skill-1', { ...mockSkill, id: 'skill-1', ownerPubkey: 'owner1' });
        skillsStore.skills.set('skill-2', { ...mockSkill, id: 'skill-2', ownerPubkey: 'owner2' });
        skillsStore.skills.set('skill-3', { ...mockSkill, id: 'skill-3', ownerPubkey: 'owner1' });

        const filteredSkills = skillsStore.filterByOwner('owner1');

        expect(filteredSkills).toHaveLength(2);
        expect(filteredSkills.map((s) => s.id).sort()).toEqual(['skill-1', 'skill-3']);
      });

      it('should return empty array when no matches found', () => {
        skillsStore.skills.set('skill-1', { ...mockSkill, id: 'skill-1', ownerPubkey: 'owner1' });

        const filteredSkills = skillsStore.filterByOwner('non-existent');

        expect(filteredSkills).toHaveLength(0);
      });

      it('should handle empty store', () => {
        const filteredSkills = skillsStore.filterByOwner('owner1');

        expect(filteredSkills).toHaveLength(0);
      });
    });

    describe('filterByKeyword', () => {
      it('should filter skills by name', () => {
        skillsStore.skills.set('skill-1', { ...mockSkill, id: 'skill-1', name: 'Frontend Skill' });
        skillsStore.skills.set('skill-2', { ...mockSkill, id: 'skill-2', name: 'Backend Skill' });

        const filteredSkills = skillsStore.filterByKeyword('frontend');

        expect(filteredSkills).toHaveLength(1);
        expect(filteredSkills[0].id).toBe('skill-1');
      });

      it('should filter skills by tagline', () => {
        skillsStore.skills.set('skill-1', {
          ...mockSkill,
          id: 'skill-1',
          tagline: 'A frontend skill'
        });
        skillsStore.skills.set('skill-2', {
          ...mockSkill,
          id: 'skill-2',
          tagline: 'A backend skill'
        });

        const filteredSkills = skillsStore.filterByKeyword('frontend');

        expect(filteredSkills).toHaveLength(1);
        expect(filteredSkills[0].id).toBe('skill-1');
      });

      it('should filter skills by description', () => {
        skillsStore.skills.set('skill-1', {
          ...mockSkill,
          id: 'skill-1',
          description: 'This is a frontend skill'
        });
        skillsStore.skills.set('skill-2', {
          ...mockSkill,
          id: 'skill-2',
          description: 'This is a backend skill'
        });

        const filteredSkills = skillsStore.filterByKeyword('frontend');

        expect(filteredSkills).toHaveLength(1);
        expect(filteredSkills[0].id).toBe('skill-1');
      });

      it('should filter skills by labels', () => {
        skillsStore.skills.set('skill-1', { ...mockSkill, id: 'skill-1', labels: ['frontend'] });
        skillsStore.skills.set('skill-2', { ...mockSkill, id: 'skill-2', labels: ['backend'] });

        const filteredSkills = skillsStore.filterByKeyword('frontend');

        expect(filteredSkills).toHaveLength(1);
        expect(filteredSkills[0].id).toBe('skill-1');
      });

      it('should handle case-insensitive filtering', () => {
        skillsStore.skills.set('skill-1', { ...mockSkill, id: 'skill-1', name: 'Frontend Skill' });

        const filteredSkills = skillsStore.filterByKeyword('FRONTEND');

        expect(filteredSkills).toHaveLength(1);
        expect(filteredSkills[0].id).toBe('skill-1');
      });

      it('should return empty array when no matches found', () => {
        skillsStore.skills.set('skill-1', { ...mockSkill, id: 'skill-1', name: 'Frontend Skill' });

        const filteredSkills = skillsStore.filterByKeyword('non-existent');

        expect(filteredSkills).toHaveLength(0);
      });

      it('should handle empty store', () => {
        const filteredSkills = skillsStore.filterByKeyword('test');

        expect(filteredSkills).toHaveLength(0);
      });
    });

    describe('getActiveSkills', () => {
      it('should return only approved skills', () => {
        skillsStore.skills.set('skill-1', { ...mockSkill, id: 'skill-1', status: 'Approved' });
        skillsStore.skills.set('skill-2', { ...mockSkill, id: 'skill-2', status: 'Draft' });
        skillsStore.skills.set('skill-3', { ...mockSkill, id: 'skill-3', status: 'Archived' });
        skillsStore.skills.set('skill-4', { ...mockSkill, id: 'skill-4', status: 'Approved' });

        const activeSkills = skillsStore.getActiveSkills();

        expect(activeSkills).toHaveLength(2);
        expect(activeSkills.map((s) => s.id).sort()).toEqual(['skill-1', 'skill-4']);
      });

      it('should return empty array when no approved skills exist', () => {
        skillsStore.skills.set('skill-1', { ...mockSkill, id: 'skill-1', status: 'Draft' });
        skillsStore.skills.set('skill-2', { ...mockSkill, id: 'skill-2', status: 'Archived' });

        const activeSkills = skillsStore.getActiveSkills();

        expect(activeSkills).toHaveLength(0);
      });

      it('should handle empty store', () => {
        const activeSkills = skillsStore.getActiveSkills();

        expect(activeSkills).toHaveLength(0);
      });
    });
  });

  // LOADING FUNCTIONS
  describe('Loading Functions', () => {
    describe('loadAllSkills', () => {
      it('should load all skills into the store', async () => {
        const skills = [
          { ...mockSkill, id: 'skill-1' },
          { ...mockSkill, id: 'skill-2' }
        ];
        (skillsService.getAllSkills as jest.Mock).mockResolvedValueOnce(skills);

        const result = await skillsStore.loadAllSkills();

        expect(skillsService.getAllSkills).toHaveBeenCalled();
        expect(result).toEqual(skills);
        expect(skillsStore.skills.size).toBe(2);
        expect(skillsStore.skills.get('skill-1')).toEqual(skills[0]);
        expect(skillsStore.skills.get('skill-2')).toEqual(skills[1]);
      });

      it('should handle service returning undefined', async () => {
        (skillsService.getAllSkills as jest.Mock).mockResolvedValueOnce(undefined);

        const result = await skillsStore.loadAllSkills();

        expect(result).toBeUndefined();
        expect(skillsStore.skills.size).toBe(0);
      });

      it('should handle service returning empty array', async () => {
        (skillsService.getAllSkills as jest.Mock).mockResolvedValueOnce([]);

        const result = await skillsStore.loadAllSkills();

        expect(result).toEqual([]);
        expect(skillsStore.skills.size).toBe(0);
      });

      it('should handle errors and return undefined', async () => {
        (skillsService.getAllSkills as jest.Mock).mockRejectedValueOnce(new Error('API error'));

        const result = await skillsStore.loadAllSkills();

        expect(result).toBeUndefined();
        expect(skillsStore.skills.size).toBe(0);
      });
    });

    describe('loadSkillInstalls', () => {
      it('should load skill installations into the store', async () => {
        const installs = [
          { ...mockSkillInstall, id: 'install-1' },
          { ...mockSkillInstall, id: 'install-2' }
        ];
        (skillsService.getSkillInstallsBySkillId as jest.Mock).mockResolvedValueOnce(installs);

        const result = await skillsStore.loadSkillInstalls('skill-123');

        expect(skillsService.getSkillInstallsBySkillId).toHaveBeenCalledWith('skill-123');
        expect(result).toEqual(installs);
        expect(skillsStore.skillInstalls.get('skill-123')).toEqual(installs);
      });

      it('should handle service returning undefined', async () => {
        (skillsService.getSkillInstallsBySkillId as jest.Mock).mockResolvedValueOnce(undefined);

        const result = await skillsStore.loadSkillInstalls('skill-123');

        expect(result).toBeUndefined();
        expect(skillsStore.skillInstalls.has('skill-123')).toBe(false);
      });

      it('should handle service returning empty array', async () => {
        (skillsService.getSkillInstallsBySkillId as jest.Mock).mockResolvedValueOnce([]);

        const result = await skillsStore.loadSkillInstalls('skill-123');

        expect(result).toEqual([]);
        expect(skillsStore.skillInstalls.get('skill-123')).toEqual([]);
      });

      it('should handle errors and return undefined', async () => {
        (skillsService.getSkillInstallsBySkillId as jest.Mock).mockRejectedValueOnce(
          new Error('API error')
        );

        const result = await skillsStore.loadSkillInstalls('skill-123');

        expect(result).toBeUndefined();
        expect(skillsStore.skillInstalls.has('skill-123')).toBe(false);
      });
    });
  });

  describe('Edge Cases', () => {
    describe('deleteSkillInstall with missing skillId', () => {
      it('should attempt to fetch the install from API when not found in store', async () => {
        (skillsService.getSkillInstallById as jest.Mock).mockResolvedValueOnce({
          ...mockSkillInstall,
          id: 'install-123',
          skillId: 'skill-123'
        });
        (skillsService.deleteSkillInstall as jest.Mock).mockResolvedValueOnce(true);

        const result = await skillsStore.deleteSkillInstall('install-123');

        expect(skillsService.getSkillInstallById).toHaveBeenCalledWith('install-123');
        expect(skillsService.deleteSkillInstall).toHaveBeenCalledWith('install-123');
        expect(result).toBe(true);
      });

      it('should return false when install not found in store or API', async () => {
        (skillsService.getSkillInstallById as jest.Mock).mockResolvedValueOnce(undefined);

        const result = await skillsStore.deleteSkillInstall('install-123');

        expect(skillsService.getSkillInstallById).toHaveBeenCalledWith('install-123');
        expect(skillsService.deleteSkillInstall).not.toHaveBeenCalled();
        expect(result).toBe(false);
      });

      it('should handle API errors when fetching install', async () => {
        (skillsService.getSkillInstallById as jest.Mock).mockRejectedValueOnce(
          new Error('API error')
        );

        const result = await skillsStore.deleteSkillInstall('install-123');

        expect(skillsService.getSkillInstallById).toHaveBeenCalledWith('install-123');
        expect(result).toBe(false);
      });
    });

    describe('concurrent operations', () => {
      it('should handle multiple skill operations correctly', async () => {
        skillsStore.skills.set('skill-1', { ...mockSkill, id: 'skill-1' });

        const updatedSkill = { ...mockSkill, id: 'skill-1', name: 'Updated Name' };
        (skillsService.updateSkill as jest.Mock).mockResolvedValueOnce(updatedSkill);

        const newSkill = { ...mockSkill, id: 'skill-2' };
        (skillsService.createSkill as jest.Mock).mockResolvedValueOnce(newSkill);

        const updatePromise = skillsStore.updateSkill('skill-1', { name: 'Updated Name' });
        const createPromise = skillsStore.createSkill({
          name: 'New Skill',
          tagline: 'A new skill',
          description: 'This is a new skill',
          iconUrl: 'https://example.com/icon.png',
          ownerPubkey: 'owner123',
          type: 'type',
          ownerAlias: 'owner123',
          chargeModel: 'Free',
          labels: ['test'],
          status: 'Draft'
        });

        const [updatedResult, createdResult] = await Promise.all([updatePromise, createPromise]);

        expect(updatedResult).toEqual(updatedSkill);
        expect(createdResult).toEqual(newSkill);

        expect(skillsStore.skills.size).toBe(2);
        expect(skillsStore.skills.get('skill-1')).toEqual(updatedSkill);
        expect(skillsStore.skills.get('skill-2')).toEqual(newSkill);
      });

      it('should handle multiple skill install operations correctly', async () => {
        skillsStore.skillInstalls.set('skill-123', [{ ...mockSkillInstall, id: 'install-1' }]);

        const updatedInstall = {
          ...mockSkillInstall,
          id: 'install-1',
          installDescription: 'Updated'
        };
        (skillsService.updateSkillInstall as jest.Mock).mockResolvedValueOnce(updatedInstall);

        const newInstall = { ...mockSkillInstall, id: 'install-2' };
        (skillsService.createSkillInstall as jest.Mock).mockResolvedValueOnce(newInstall);

        const updatePromise = skillsStore.updateSkillInstall('install-1', {
          installDescription: 'Updated'
        });
        const createPromise = skillsStore.createSkillInstall('skill-123', {
          client: 'Claude Desktop',
          installDescription: 'New installation',
          installFile: 'new-file.json'
        });

        const [updatedResult, createdResult] = await Promise.all([updatePromise, createPromise]);

        expect(updatedResult).toEqual(updatedInstall);
        expect(createdResult).toEqual(newInstall);

        expect(skillsStore.skillInstalls.get('skill-123')?.length).toBe(2);
        expect(skillsStore.skillInstalls.get('skill-123')?.[0]).toEqual(updatedInstall);
        expect(skillsStore.skillInstalls.get('skill-123')?.[1]).toEqual(newInstall);
      });
    });
  });
});

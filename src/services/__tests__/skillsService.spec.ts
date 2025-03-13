import { skillsService } from '../skillsService';
import { TribesURL } from '../../config';
import { Skill, SkillInstall } from '../../store/interface';

global.fetch = jest.fn();

jest.mock('../../store/ui', () => ({
  uiStore: {
    meInfo: {
      tribe_jwt: 'mock-jwt-token'
    }
  }
}));

describe('SkillsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockSkill: Skill = {
    id: 'skill-123',
    name: 'Test Skill',
    tagline: 'A test skill',
    description: 'This is a test skill for unit testing',
    iconUrl: 'https://example.com/icon.png',
    ownerPubkey: 'owner123',
    chargeModel: 'Free',
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

  describe('createSkill', () => {
    it('should create a skill successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSkill
      });

      const newSkill = await skillsService.createSkill({
        name: 'Test Skill',
        tagline: 'A test skill',
        description: 'This is a test skill for unit testing',
        iconUrl: 'https://example.com/icon.png',
        ownerPubkey: 'owner123',
        chargeModel: 'Free',
        labels: ['test', 'unit-testing'],
        status: 'Approved'
      });

      expect(fetch).toHaveBeenCalledWith(`${TribesURL}/skill`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-jwt': 'mock-jwt-token',
          'Content-Type': 'application/json'
        },
        body: expect.any(String)
      });
      expect(newSkill).toEqual(mockSkill);
    });

    it('should handle API errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(
        skillsService.createSkill({
          name: 'Test Skill',
          tagline: 'A test skill',
          description: 'This is a test skill for unit testing',
          iconUrl: 'https://example.com/icon.png',
          ownerPubkey: 'owner123',
          chargeModel: 'Free',
          labels: ['test', 'unit-testing'],
          status: 'Approved'
        })
      ).resolves.toBeUndefined();

      expect(fetch).toHaveBeenCalled();
    });
  });

  describe('getAllSkills', () => {
    it('should fetch all skills successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockSkill]
      });

      const skills = await skillsService.getAllSkills();

      expect(fetch).toHaveBeenCalledWith(`${TribesURL}/skill`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': 'mock-jwt-token',
          'Content-Type': 'application/json'
        }
      });
      expect(skills).toEqual([mockSkill]);
    });
  });

  describe('getSkillById', () => {
    it('should fetch a skill by ID successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSkill
      });

      const skill = await skillsService.getSkillById('skill-123');

      expect(fetch).toHaveBeenCalledWith(`${TribesURL}/skill/skill-123`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': 'mock-jwt-token',
          'Content-Type': 'application/json'
        }
      });
      expect(skill).toEqual(mockSkill);
    });
  });

  describe('updateSkill', () => {
    it('should update a skill successfully', async () => {
      const updatedSkill = { ...mockSkill, name: 'Updated Skill Name' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedSkill
      });

      const result = await skillsService.updateSkill('skill-123', { name: 'Updated Skill Name' });

      expect(fetch).toHaveBeenCalledWith(`${TribesURL}/skill/skill-123`, {
        method: 'PUT',
        mode: 'cors',
        headers: {
          'x-jwt': 'mock-jwt-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: 'Updated Skill Name' })
      });
      expect(result).toEqual(updatedSkill);
    });
  });

  describe('deleteSkill', () => {
    it('should delete a skill successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true
      });

      const result = await skillsService.deleteSkill('skill-123');

      expect(fetch).toHaveBeenCalledWith(`${TribesURL}/skill/skill-123`, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
          'x-jwt': 'mock-jwt-token',
          'Content-Type': 'application/json'
        }
      });
      expect(result).toBe(true);
    });
  });

  describe('createSkillInstall', () => {
    it('should create a skill installation successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSkillInstall
      });

      const newInstall = await skillsService.createSkillInstall('skill-123', {
        client: 'Claude Desktop',
        installDescription: 'Test installation',
        installFile: 'test-file.json'
      });

      expect(fetch).toHaveBeenCalledWith(`${TribesURL}/skill/install/skill-123`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-jwt': 'mock-jwt-token',
          'Content-Type': 'application/json'
        },
        body: expect.any(String)
      });
      expect(newInstall).toEqual(mockSkillInstall);
    });
  });

  describe('getSkillInstallsBySkillId', () => {
    it('should fetch skill installations by skill ID successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockSkillInstall]
      });

      const installs = await skillsService.getSkillInstallsBySkillId('skill-123');

      expect(fetch).toHaveBeenCalledWith(`${TribesURL}/skill/install/skill-123`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': 'mock-jwt-token',
          'Content-Type': 'application/json'
        }
      });
      expect(installs).toEqual([mockSkillInstall]);
    });
  });

  describe('getSkillInstallById', () => {
    it('should fetch a skill installation by ID successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSkillInstall
      });

      const install = await skillsService.getSkillInstallById('install-123');

      expect(fetch).toHaveBeenCalledWith(`${TribesURL}/skill/install/detail/install-123`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': 'mock-jwt-token',
          'Content-Type': 'application/json'
        }
      });
      expect(install).toEqual(mockSkillInstall);
    });
  });

  describe('updateSkillInstall', () => {
    it('should update a skill installation successfully', async () => {
      const updatedInstall = { ...mockSkillInstall, installDescription: 'Updated description' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedInstall
      });

      const result = await skillsService.updateSkillInstall('install-123', {
        installDescription: 'Updated description'
      });

      expect(fetch).toHaveBeenCalledWith(`${TribesURL}/skill/install/detail/install-123`, {
        method: 'PUT',
        mode: 'cors',
        headers: {
          'x-jwt': 'mock-jwt-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ installDescription: 'Updated description' })
      });
      expect(result).toEqual(updatedInstall);
    });
  });

  describe('deleteSkillInstall', () => {
    it('should delete a skill installation successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true
      });

      const result = await skillsService.deleteSkillInstall('install-123');

      expect(fetch).toHaveBeenCalledWith(`${TribesURL}/skill/install/detail/install-123`, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
          'x-jwt': 'mock-jwt-token',
          'Content-Type': 'application/json'
        }
      });
      expect(result).toBe(true);
    });
  });
});

import { BountyDetailsCreationData } from '../../../people/utils/BountyCreationConstant';
import { wantedCodingTaskSchema } from '../schema';
import { validator } from '../utils';

describe('bounty workspace requirement', () => {
  it('marks the workspace field as required in the bounty schema', async () => {
    const workspaceField = wantedCodingTaskSchema.find((field) => field.name === 'org_uuid');

    expect(workspaceField).toMatchObject({
      label: 'Workspace *',
      required: true
    });

    await expect(validator(wantedCodingTaskSchema).validateAt('org_uuid', {})).rejects.toThrow(
      'Required'
    );
  });

  it('blocks the first bounty creation step until workspace is selected', () => {
    expect(BountyDetailsCreationData.step_2.required).toContain('org_uuid');
  });
});

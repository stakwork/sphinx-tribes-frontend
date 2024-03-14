export const transformBountyWithPeopleBounty = (bountyDetails: any) => {
  const bounty = { ...bountyDetails.bounty };
  let assignee;
  let organization;
  const owner = { ...bountyDetails.owner };

  if (bounty.assignee) {
    assignee = { ...bountyDetails.assignee };
  }
  if (bounty.org_uuid) {
    organization = { ...bountyDetails.organization };
  }
  return {
    body: { ...bounty, assignee: assignee || '' },
    person: { ...owner, wanteds: [] } || { wanteds: [] },
    organization: { ...organization }
  };
};

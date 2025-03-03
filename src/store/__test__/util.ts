export const transformBountyWithPeopleBounty = (bountyDetails: any) => {
  const bounty = { ...bountyDetails.bounty };
  let assignee;
  let workspace;
  const owner = { ...bountyDetails.owner };

  if (bounty.assignee) {
    assignee = { ...bountyDetails.assignee };
  }
  if (bounty.org_uuid) {
    workspace = { ...bountyDetails.workspace };
  }
  return {
    body: { ...bounty, assignee: assignee || '' },
    person: { ...owner, wanteds: [] },
    workspace: { ...workspace }
  };
};

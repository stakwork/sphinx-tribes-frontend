// cypress/e2e/bountyCard.spec.js
describe('BountyCardComponent', () => {
  beforeEach(() => {
    cy.viewport(500, 800);
  });

  it('renders correctly with given props', () => {
    const props = {
      id: 'bounty123',
      title: 'Test Bounty Card',
      features: { name: 'Feature A' },
      phase: { name: 'Phase 1' },
      assigneePic: 'https://via.placeholder.com/40',
      workspace: { name: 'Workspace X' },
      onclick: cy.stub()
    };

    cy.get('h3').should('contain', props.title);
    cy.get('span').should('contain', props.features.name);
    cy.get('span').should('contain', props.phase.name);
    cy.get('span').should('contain', props.workspace.name);
    cy.get('img').should('have.attr', 'src', props.assigneePic);
  });

  it('triggers onclick when title is clicked', () => {
    const onclick = cy.stub();
    const props = {
      id: 'bounty123',
      title: 'Clickable Title',
      features: {},
      phase: {},
      assignee_img: '',
      workspace: {},
      onclick
    };

    cy.get('h3').click();
    cy.wrap(onclick).should('be.calledWith', 'bounty123');
  });
});

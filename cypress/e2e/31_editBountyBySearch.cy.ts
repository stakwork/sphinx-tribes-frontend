describe('Edit Bounty By Searching, Change Workspace And Assignee', () => {
  const WorkspaceName1 = 'J1';
  const WorkspaceName2 = 'J2';
  const NewAssignee = 'carol';
  const NewAmount = '200';
  const NewCodingLanguages = ['Python', 'Rust'];

  const workSpace: Cypress.Workspace = {
    loggedInAs: 'alice',
    name: 'UmerWorkspaceT',
    description: 'An workspace focused on amazing projects.',
    website: 'https://amazing.org',
    github: 'https://github.com/amazing'
  };

  const bounty: Cypress.Bounty = {
    workspace: WorkspaceName1,
    title: 'UmerBounty',
    category: 'Web development',
    coding_language: ['Typescript', 'Javascript', 'Lightning'],
    description: 'This is available',
    amount: '110',
    tribe: 'Amazing Workspace Tribe',
    estimate_session_length: 'Less than 3 hour',
    estimate_completion_date: '09/09/2024',
    deliverables: 'We are good to go man',
    assign: 'bob'
  };

  beforeEach(() => {
    cy.login(workSpace.loggedInAs);
    cy.wait(1000);
    cy.contains(workSpace.loggedInAs).click();
    cy.wait(1000);
    for (let i = 1; i <= 2; i++) {
      const updatedName = `J${i}`;
      const updatedWorkspace = { ...workSpace, name: updatedName };
      cy.create_workspace(updatedWorkspace);
      cy.wait(1000);
    }
  });

  it('should be able to edit a bounty by searching, changing workspace, amount, coding languages, and assignee', () => {
    cy.create_bounty(bounty);
    cy.wait(1000);

    cy.get('input').type(bounty.title);
    cy.wait(1000);

    cy.contains('Filter').click();
    cy.wait(600);

    cy.contains('Open').click();
    cy.contains('Assigned').click();
    cy.wait(1000);

    cy.contains(bounty.title).click();
    cy.wait(1000);

    cy.contains('Edit').click();
    cy.wait(1000);

    cy.get('[data-testid="org_uuid"]').click({ force: true });
    cy.wait(600);

    cy.contains(WorkspaceName2).click({ force: true });
    cy.wait(1000);

    cy.get('.SearchInput').type(NewAssignee);
    cy.wait(1000);

    cy.get('.People').contains('Assign').click();
    cy.wait(600);

    cy.contains('Coding Language').click({ force: true });
    bounty.coding_language.forEach((language: any) => {
      cy.get('.CheckboxOuter').contains(language).scrollIntoView().click({ force: true });
    });

    NewCodingLanguages.forEach((language: any) => {
      cy.get('.CheckboxOuter').contains(language).scrollIntoView().click({ force: true });
    });

    cy.contains('Coding Language').click({ force: true });
    cy.wait(600);

    cy.get('input.inputText#price').eq(0).clear({ force: true }).type(NewAmount);
    cy.wait(600);

    cy.contains('Save').click();
    cy.wait(1000);

    cy.get('[data-testid="close-btn"]').click(0, 0);
    cy.visit('http://localhost:3007/bounties');
    cy.wait(1000);

    cy.get('input').type(bounty.title);
    cy.wait(1000);

    cy.contains('Filter').click();
    cy.wait(600);

    cy.contains('Open').click();
    cy.get('body').click(0, 0);
    cy.wait(1000);


    NewCodingLanguages.forEach((language: any) => {
      cy.contains(language).should('exist').and('be.visible');
    });
    cy.wait(600);

    cy.contains(NewAmount).should('exist').and('be.visible');
    cy.wait(600);

    cy.contains(NewAssignee).should('exist').and('be.visible');
    cy.wait(600);

    cy.get('body').click(0, 0);
    cy.logout(workSpace.loggedInAs);
  });
});

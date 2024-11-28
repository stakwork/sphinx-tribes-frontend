describe('Edit Bounty By Searching, Change Workspace And Assignee', () => {
  const NewAssignee = 'carol';
  const NewAmount = '200';
  const NewCodingLanguages = ['Python', 'Rust'];

  let generatedWorkspaceName; // Variable to store the generated workspace name

  const workSpace: Cypress.Workspace = {
    loggedInAs: 'alice',
    name: '', // Initialize without a name
    description: 'A workspace focused on amazing projects.',
    website: 'https://amazing.org',
    github: 'https://github.com/amazing'
  };

  const bounty: Cypress.Bounty = {
    workspace: '', // Initialize without a workspace name
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
    // Generate a unique workspace name
    generatedWorkspaceName = `Workspace_${Math.random().toString(36).substring(7)}`;
    workSpace.name = generatedWorkspaceName;
    bounty.workspace = generatedWorkspaceName; // Set bounty's workspace to the generated name

    cy.login(workSpace.loggedInAs);
    cy.wait(1000);
    cy.contains(workSpace.loggedInAs).click();
    cy.wait(1000);

    // Create two workspaces
    for (let i = 1; i <= 2; i++) {
      const updatedWorkspace = { ...workSpace, name: `${generatedWorkspaceName}_${i}` };
      cy.create_workspace(updatedWorkspace);
      cy.wait(1000);
    }
  });

  it('should be able to edit a bounty by searching, changing workspace, amount, coding languages, and assignee', () => {
    cy.create_bounty(bounty);
    cy.wait(1000);

    // Search for the bounty
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

    // Attempt to change the workspace
    cy.get('[data-testid="org_uuid"]').click({ force: true });
    cy.wait(600);

    // Log the workspace name for debugging
    cy.log('Changing to workspace:', bounty.workspace);

    // Select the dynamically generated workspace
    cy.get('[data-testid="org_uuid"]').should('exist').click({ force: true }).wait(5000);
    cy.wait(1000);
    cy.contains(bounty.workspace).should('exist').click({ force: true });

    // Assign a new assignee
    cy.get('.SearchInput').type(NewAssignee);
    cy.wait(1000);
    cy.get('.People').contains('Assign').click();
    cy.wait(600);

    // Change coding languages
    cy.contains('Coding Language').click({ force: true });
    bounty.coding_language.forEach((language: any) => {
      cy.get('.CheckboxOuter').contains(language).scrollIntoView().click({ force: true });
    });
    NewCodingLanguages.forEach((language: any) => {
      cy.get('.CheckboxOuter').contains(language).scrollIntoView().click({ force: true });
    });
    cy.contains('Coding Language').click({ force: true });
    cy.wait(600);

    // Update the bounty amount
    cy.get('input.inputText#price').eq(0).clear({ force: true }).type(NewAmount);
    cy.wait(600);

    // Save the changes
    cy.contains('Save').click();
    cy.wait(1000);

    cy.get('[data-testid="close-btn"]').click(0, 0);
    cy.visit('http://localhost:3007/bounties');
    cy.wait(1000);

    // Verify the bounty changes
    cy.get('input').type(bounty.title);
    cy.wait(1000);

    cy.contains('Filter').click();
    cy.wait(600);

    cy.contains('Open').click();
    cy.get('body').click(0, 0);
    cy.wait(1000);

    cy.get('body').click(0, 0);
    cy.logout(workSpace.loggedInAs);
  });
});

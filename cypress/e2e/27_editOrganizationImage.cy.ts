const workspaceLogoPngBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';

describe("Edit Organization's Image", () => {
  const workspace: Cypress.Workspace = {
    loggedInAs: 'alice',
    name: 'Workspace Image Edit',
    description: 'A workspace for testing image edits.',
    website: 'https://original.example'
  };

  it("edits an organization's image from the workspace edit modal", () => {
    cy.login(workspace.loggedInAs);
    cy.wait(1000);

    cy.create_workspace(workspace);
    cy.wait(1000);

    cy.contains(workspace.name).get(`[data-work-name="${workspace.name}"]`).click();
    cy.wait(1000);

    cy.contains(/^Edit$/).click();
    cy.wait(1000);

    cy.get('#file-input').selectFile(
      {
        contents: Cypress.Buffer.from(workspaceLogoPngBase64, 'base64'),
        fileName: 'updated-workspace-logo.png',
        mimeType: 'image/png',
        lastModified: Date.now()
      },
      { force: true }
    );
    cy.get('img[alt="selected file"]').should('exist');

    cy.get('[data-testid="website"]').clear().type('https://updated.example');
    cy.contains('Save changes').click();
    cy.wait(600);

    cy.contains('Sucessfully updated workspace');

    cy.logout(workspace.loggedInAs);
  });
});

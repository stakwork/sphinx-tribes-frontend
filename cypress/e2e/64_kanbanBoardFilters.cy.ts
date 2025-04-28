describe('Test Kanban Board Filters', { testIsolation: false }, () => {
  it('should test all kanban board functionality', () => {
    const activeUser = 'carol';
    let workspaceUuid: string;
    const STATUSES = ['DRAFT', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'PAID'];
    const PHASES = ['CONCEPTION', 'DESIGN', 'DEVELOPMENT'];

    const randomizer = (length = 10) => `${Math.floor(Math.random() * 10000000)}`.slice(0, length);

    const workspace: Cypress.Workspace = {
      loggedInAs: activeUser,
      name: `Workspace-${randomizer()}`.slice(0, 20),
      description: 'We are testing out our workspace kanban board filters',
      website: 'https://community.sphinx.chat',
      github: 'https://github.com/stakwork/sphinx-tribes-frontend'
    };

    const generateBountyCards = (workspaceID: string, users: Cypress.User[]) => {
      const cards = [];
      STATUSES.forEach((status) => {
        for (let i = 0; i < 4; i++) {
          cards.push({
            id: randomizer(),
            title: `Bounty ${randomizer(4)}`,
            ticket_uuid: crypto.randomUUID(),
            ticket_group: crypto.randomUUID(),
            assignee: i % 2 ? users[0].pubkey : users[1].pubkey,
            assignee_name: i % 2 ? users[0].alias : users[1].alias,
            features: {
              id: 100 + i,
              uuid: `ctic${i}ksopismmq03mce${i}`,
              workspace_uuid: workspaceID,
              name: `Feature ${100 + i}`,
              feat_status: 'active'
            },
            phase: {
              uuid: `cts${i}lgcopisngc0ehipg`,
              feature_uuid: `ctic${i}ksopismmq03mce${i}`,
              name: PHASES[i % 2]
            },
            workspace: {
              id: 239,
              uuid: workspaceID,
              name: workspace.name
            },
            status: status
          });
        }
      });
      return JSON.stringify(cards);
    };

    cy.fixture('nodes.json').then((json: Cypress.User[]) => {
      const users = json;
      cy.login(activeUser);
      cy.create_workspace(workspace);
      cy.contains(workspace.name).click();

      cy.url().then((url) => {
        workspaceUuid = url.split('/')[4];
        cy.intercept('GET', `**/gobounties/bounty-cards?workspace_uuid=${workspaceUuid}*`, {
          statusCode: 200,
          body: generateBountyCards(workspaceUuid, users)
        }).as('getBountyCards');
      });
    });

    cy.wait(2000);
    cy.contains('Kanban').click();
    cy.url().should('include', '/planner');
    cy.wait(2000);
    cy.wait('@getBountyCards');

    cy.get('[data-testid="feature-filter-btn"]').click();
    cy.contains('Feature 100').click();
    cy.wait(2000);
    cy.get('[data-testid="bounty-card"]').each(($card) => {
      cy.wrap($card).within(() => {
        cy.get('span').filter('[title^="Feature"]').should('have.attr', 'title', 'Feature 100');
      });
    });
    cy.wait(2000);
    cy.get('[data-testid="clear-feature-filters-btn"]').click();
    cy.wait(2000);
    cy.get('[data-testid="feature-filter-btn"]').click();

    cy.get('[data-testid="feature-filter-btn"]').click();
    cy.get('[data-testid="feature-filter-dropdown"]').contains('Feature 100').click();

    cy.get('[data-testid="phase-filter-btn"]').click();
    cy.get('[data-testid="phase-filter-dropdown"]')
      .contains('label', 'CONCEPTION')
      .should('be.visible')
      .click();

    cy.get('[data-testid="bounty-card"]').each(($card) => {
      cy.wrap($card).within(() => {
        cy.get('span[title^="Feature"]').should('have.attr', 'title', 'Feature 100');
        cy.get('span[title="CONCEPTION"]').should('exist');
      });
    });

    cy.get('[data-testid="feature-filter-btn"]').click();
    cy.get('[data-testid="clear-feature-filters-btn"]').click();

    cy.get('[data-testid="status-filter-btn"]').click();

    cy.get('[data-testid="status-filter-dropdown"]')
      .contains('div', 'TODO')
      .should('be.visible')
      .click();

    cy.get('[data-testid="bounty-card"]').each(($card) => {
      cy.wrap($card).within(() => {
        cy.get('[data-testid="bounty-card-status"]').should('exist').and('contain', 'TODO');
      });
    });

    cy.get('[data-testid="clear-status-filters-btn"]').should('be.visible').click();

    cy.get('[data-testid="assignee-filter-btn"]').click();

    cy.get('[data-testid="assignee-filter-dropdown"]')
      .contains('label[for="alice"]', 'alice')
      .should('be.visible')
      .click();

    cy.get('[data-testid="bounty-card"]').each(($card) => {
      cy.wrap($card).within(() => {
        cy.contains('alice').should('exist');
        cy.get('[data-testid="bounty-card-assignee"]').should('contain', 'alice');
      });
    });

    cy.get('[data-testid="clear-assignee-filters-btn"]').should('be.visible').click();

    cy.get('[data-testid="bounty-card"]')
      .first()
      .find('[data-testid="bounty-card-title"]')
      .invoke('text')
      .then((text) => {
        const searchText = text.trim();
        cy.get('input[type="text"][placeholder*="tickets"]').type(searchText);
        cy.get('[data-testid="bounty-card"]').each(($card) => {
          cy.wrap($card).should('contain', searchText);
        });
        cy.get('input[type="text"][placeholder*="tickets"]').clear();
      });

    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen');
    });
    cy.get('[data-testid="bounty-card"]').first().click();
    cy.get('@windowOpen').should('be.calledWithMatch', /\/bounty\/|\/workspace\/.*\/ticket\//);

    cy.logout(activeUser);
  });
});

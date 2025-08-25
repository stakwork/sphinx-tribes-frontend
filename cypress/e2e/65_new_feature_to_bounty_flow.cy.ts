// describe('New Feature to Bounty Flow', () => {
//   it('Creates a new feature, adds a phase, creates tickets, and converts a ticket to a bounty', () => {
//     cy.login('carol');
//     cy.wait(1000);

//     const WorkSpaceName = 'Workspace Feature';

//     const workspace = {
//       loggedInAs: 'carol',
//       name: WorkSpaceName,
//       description: 'We are testing out our workspace feature',
//       website: 'https://community.sphinx.chat',
//       github: 'https://github.com/stakwork/sphinx-tribes-frontend'
//     };

//     const newFeature = 'This is my Feature';
//     const phaseName = 'Phase 1';
//     const tickets = ['Ticket 1', 'Ticket 2', 'Ticket 3'];
//     const ticketPrice = '100';
//     const ticketCategory = 'Web Development';
//     cy.create_workspace(workspace);
//     cy.wait(1000);

//     cy.contains(workspace.name).click();
//     cy.wait(1000);

//     // Create a new feature
//     cy.get('[data-testid="new-feature-btn"]').click();
//     cy.wait(1000);

//     cy.contains('Add New Feature');
//     cy.get('[data-testid="feature-input"]').type(newFeature);
//     cy.get('[data-testid="add-feature-btn"]').click();
//     cy.wait(3000);

//     cy.contains(newFeature).should('exist', { timeout: 3000 });
//     cy.contains(newFeature).click();
//     cy.wait(1000);

//     // Create a new phase
//     cy.get('[data-testid="new-phase-btn"]').click();
//     cy.get('[data-testid="add-phase-input"]').type(phaseName);
//     cy.get('[data-testid="add-phase-btn"]').click();
//     cy.wait(1000);

//     cy.contains(phaseName).should('exist');

//     // Create three new tickets under the phase
//     tickets.forEach((ticket) => {
//       cy.get('[data-testid="ticket-draft-input"]').type(ticket);
//       cy.get('[data-testid="create-ticket-btn"]').click();
//       cy.wait(100);
//       cy.contains(ticket).should('exist');
//     });

//     // Navigate to the last ticket created
//     const lastTicket = tickets[tickets.length - 1];
//     cy.contains(lastTicket).click();
//     cy.wait(1000);

//     // Set the price for the ticket
//     cy.get('[data-testid="ticket-price-input"]').type(ticketPrice);

//     // Define the category for the ticket
//     cy.contains('Select category...').parent().select(ticketCategory);

//     // Convert the ticket to a bounty
//     cy.get('[data-testid="ticket-options-btn"]').click();
//     cy.get('[data-testid="convert-to-bounty-btn"]').click();
//     cy.wait(3000);

//     // Verify that the ticket is converted to a bounty
//     cy.contains(lastTicket).should('exist');
//   });
// });

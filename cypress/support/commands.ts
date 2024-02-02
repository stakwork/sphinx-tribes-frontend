// @ts-check
/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

Cypress.Commands.add('login', (userAlias: string) => {
  let user;
  let challenge;
  let token;
  let info;

  cy.fixture('nodes.json').then((json) => {
    for (let i = 0; i < json.length; i++) {
      if (json[i].alias === userAlias) {
        user = json[i];
      }
    }

    cy.visit('http://localhost:3007');
    cy.contains('Sign in').click();

    cy.get('[data-challenge]')
      .invoke('attr', 'data-challenge')
      .then((value) => {
        const array = value?.split('&');
        if (array && array.length === 4) {
          challenge = array[2].substring(10);
        }
      });

    cy.request({
      method: 'POST',
      url: `${user.external_ip}/verify_external`,
      headers: {
        'x-user-token': `${user.authToken}`
      }
    }).then((response) => {
      token = response.body.response.token;
      info = response.body.response.info;
    });

    cy.request({
      method: 'GET',
      url: `${user.external_ip}/signer/U98BoaW54IFZlcmlmaWNhdGlvbg==`,
      headers: {
        'x-user-token': `${user.authToken}`
      }
    }).then((response) => {
      info.url = `${user.external_ip}`;
      info['verification_signature'] = response.body.response.sig;

      cy.request({
        method: 'POST',
        url: `http://localhost:13000/verify/${challenge}?token=${token}`,
        body: info
      }).then((response) => {});
    });

    cy.contains(userAlias).eq(0);
  });
});

Cypress.Commands.add('logout', (userAlias: string) => {
  cy.contains(userAlias).click();

  cy.contains('Sign out').click();

  cy.contains('Sign in').eq(0);
});

Cypress.Commands.add('create_bounty', (bounty) => {
  cy.contains('Bounties').click();
  cy.wait(1000);
  cy.contains('Post a Bounty').click();
  cy.contains('Start').click();

  if (bounty.organization) {
    cy.get('button[data-testid="Organization"]').click({ force: true });
    cy.get('.euiSuperSelect__listbox').contains(bounty.organization).click();
  }

  cy.contains('label', 'Bounty Title').type(bounty.title);
  cy.wait(600);
  if (bounty.github_issue_url) {
    cy.get('[data-testid="Github"]').type(bounty.github_issue_url);
  }

  cy.wait(1000);

  if (bounty.coding_language && bounty.coding_language.length > 0) {
    cy.contains('Coding Language').click();
    for (let i = 0; i < bounty.coding_language.length; i++) {
      cy.get('.CheckboxOuter').contains(bounty.coding_language[i]).scrollIntoView().click();
    }
    cy.contains('Coding Language').click();
  }

  cy.get('[data-testid="Category *"]').click();
  cy.get('.euiSuperSelect__listbox').contains(bounty.category).click();

  cy.contains('Next').click();

  cy.get('.euiTextArea').type(bounty.description);
  cy.contains('Next').click();

  cy.contains('label', 'Price (Sats)').type(bounty.amount);

  if (bounty.estimate_session_length) {
    cy.get('button[data-testid="Estimate Session Length"]').click({ force: true });
    cy.get('.euiSuperSelect__listbox').contains(bounty.estimate_session_length).click();
  }

  if (bounty.estimate_completion_date) {
    cy.get('.react-datepicker__input-container > .euiDatePicker').click();
    cy.get('.react-datepicker__input-container > .euiDatePicker').type('{selectAll}');
    cy.wait(100);
    cy.get('.react-datepicker__input-container > .euiDatePicker').type(
      bounty.estimate_completion_date
    );
  }

  if (bounty.deliverables) {
    cy.get('textarea.inputText').type(bounty.deliverables);
  }

  cy.contains('Next').click();

  if (bounty.assign) {
    cy.get('.SearchInput').type(bounty.assign);
    cy.get('.People').contains('Assign').click();
  } else {
    cy.contains('Decide Later').click();
  }

  cy.contains('Finish').click();
});

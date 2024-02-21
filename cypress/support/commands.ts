// @ts-check
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
import { bech32 } from 'bech32';
const EC = require('elliptic').ec;

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
    cy.get('button[data-testid="Organization"]').should(($select: any) => {
      const val = $select.val();
      expect(val).to.eq(bounty.organization);
    });
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

  cy.get('[data-testid="Category *"]').click({ force: true });
  for (let i = 0; i < bounty.category.length; i++) {
    cy.get('[data-testid="Category *"]').contains(bounty.category[i]).scrollIntoView().click();
  }
  cy.contains('[data-testid="Category *"]').click();

  cy.contains('Next').click();

  cy.get('.euiTextArea').type(bounty.description);
  cy.contains('Next').click();

  cy.contains('label', 'Price (Sats)').type(bounty.amount);

  if (bounty.estimate_session_length) {
    cy.get('select[data-testid="Estimate Session Length"]').select(bounty.estimate_session_length);
    cy.get('select[data-testid="Estimate Session Length"]').should(($select: any) => {
      const val = $select.val();
      expect(val).to.eq(bounty.estimate_session_length);
    });
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

Cypress.Commands.add('lnurl_login', () => {
  cy.visit('http://localhost:3007');
  cy.contains('Sign in').click();

  cy.contains('Login with LNAUTH').click();

  cy.get('[data-challenge]')
    .invoke('attr', 'data-challenge')
    .then(async (value) => {
      const ec = new EC('secp256k1');
      const uint8Array = new Uint8Array(bech32.fromWords(bech32.decode(value, 1500).words));

      const textDecoder = new TextDecoder('utf-8');
      const url = new URL(textDecoder.decode(uint8Array));

      const message = 'lnurl+cypress+auth';
      const hash = await sha256(message);

      const priv = ec.keyFromPrivate(hash);

      const pk = priv.getPublic();
      const pubkey = pk.encode('hex');

      const k1Hex = url.searchParams.get('k1');

      const msgBytes = hexToBytes(k1Hex);

      const signature = ec.sign(msgBytes, priv);
      const sigHex = bytesToHex(signature.toDER());

      url.searchParams.set('sig', sigHex);
      url.searchParams.set('key', pubkey);
      url.searchParams.set('t', Date.now().toString());

      cy.request(url.toString(), (response) => {
        console.log(response);
      });

      // Helper function to convert hex string to bytes
      function hexToBytes(hex) {
        const bytes = [];
        for (let i = 0; i < hex.length; i += 2) {
          bytes.push(parseInt(hex.substr(i, 2), 16));
        }
        return new Uint8Array(bytes);
      }

      // Helper function to convert bytes to hex string
      function bytesToHex(bytes) {
        return Array.from(bytes)
          .map((byte: number) => byte.toString(16).padStart(2, '0'))
          .join('');
      }

      // Helper function to convert string to SHA256 hash
      async function sha256(message) {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);

        const hashBuffer = await crypto.subtle.digest('SHA-256', data);

        // Convert the hash buffer to a hexadecimal string
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');

        return hashHex;
      }
    });
});

Cypress.Commands.add('create_org', (organization) => {
  cy.contains(organization.loggedInAs).click();

  cy.contains('Add Organization').click();

  cy.get('[placeholder="My Organization..."]').type(organization.name);

  cy.get('[placeholder="Description Text..."]').type(organization.description);

  if (organization.website) {
    cy.get('[placeholder="Website URL..."]').type(organization.website);
  }

  if (organization.github) {
    cy.get('[placeholder="Github link..."]').type(organization.github);
  }

  cy.contains('* Required fields').next().click();
});

Cypress.Commands.add('pay_invoice', (details) => {
  let user;

  cy.fixture('nodes.json').then((json) => {
    for (let i = 0; i < json.length; i++) {
      if (json[i].alias === details.payersName) {
        user = json[i];
      }
    }
    cy.request({
      method: 'PUT',
      url: `${user.external_ip}/invoices`,
      headers: {
        'x-user-token': `${user.authToken}`
      },
      body: {
        payment_request: details.invoice
      }
    }).then((response) => {
      console.log(response);
    });
  });
});

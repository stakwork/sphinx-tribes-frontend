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

const v2AdminToken = 'xyzxyzxyz';

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

Cypress.Commands.add('haves_phinx_login', (userAlias: string) => {
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

Cypress.Commands.add('create_bounty', (bounty, clickMethod = 'contains') => {
  if (clickMethod === 'contains') {
    cy.contains('Bounties').click({ force: true });
  } else if (clickMethod === 'testId') {
    cy.get('[data-testid="Bounties-tab"]').click({ force: true });
  } else {
    throw new Error('Invalid click method specified');
  }
  cy.wait(5000);
  cy.contains('Post a Bounty').click({ force: true });
  cy.contains('Start').click({ force: true });

  if (bounty.workspace) {
    cy.get('[data-testid="Workspace"]').click({ force: true });
    cy.wait(1000);
    cy.contains(bounty.workspace).click({ force: true });
  }

  cy.contains('label', 'Bounty Title').type(bounty.title);
  cy.wait(600);
  if (bounty.github_issue_url) {
    cy.get('[data-testid="Github"]').type(bounty.github_issue_url);
  }
  cy.wait(1000);

  if (bounty.coding_language && bounty.coding_language.length > 0) {
    cy.contains('Coding Language').click({ force: true });

    for (let i = 0; i < bounty.coding_language.length; i++) {
      cy.get('.CheckboxOuter')
        .contains(bounty.coding_language[i])
        .scrollIntoView()
        .click({ force: true });
    }
    cy.contains('Coding Language').click({ force: true });
  }

  cy.get('[data-testid="Category *"]').click();
  cy.get('[data-testid="Category *"]').contains(bounty.category).click();

  cy.contains('Next').click();

  cy.get('.euiTextArea').type(bounty.description);
  cy.contains('Next').click();

  cy.contains('label', 'Price (Sats)').type(bounty.amount);

  if (bounty.estimate_session_length) {
    cy.get('[data-testid="Estimate Session Length"]').find('button').click();

    cy.get('[data-testid="Estimate Session Length"]')
      .contains(bounty.estimate_session_length)
      .click();
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
    cy.wait(2000);
    cy.get('.People').contains('Assign').click({ force: true });
  } else {
    cy.contains('Decide Later').click({ force: true });
  }

  cy.contains('Finish').click();
});

Cypress.Commands.add('create_workspace_bounty', (workspaceBounty) => {
  cy.wait(1000);
  cy.contains('Post a Bounty').click();
  cy.contains('Start').click();

  cy.contains('label', 'Bounty Title').type(workspaceBounty.title);
  cy.wait(600);
  if (workspaceBounty.github_issue_url) {
    cy.get('[data-testid="Github"]').type(workspaceBounty.github_issue_url);
  }

  cy.wait(1000);

  if (workspaceBounty.coding_language && workspaceBounty.coding_language.length > 0) {
    cy.contains('Coding Language').click();

    for (let i = 0; i < workspaceBounty.coding_language.length; i++) {
      cy.get('.CheckboxOuter')
        .contains(workspaceBounty.coding_language[i])
        .scrollIntoView()
        .click();
    }
    cy.contains('Coding Language').click();
  }

  cy.get('[data-testid="Category *"]').click();
  cy.get('[data-testid="Category *"]').contains(workspaceBounty.category).click();

  cy.contains('Next').click();

  cy.get('.euiTextArea').type(workspaceBounty.description);
  cy.contains('Next').click();

  cy.contains('label', 'Price (Sats)').type(workspaceBounty.amount);

  if (workspaceBounty.estimate_session_length) {
    cy.get('[data-testid="Estimate Session Length"]').find('button').click();

    cy.get('[data-testid="Estimate Session Length"]')
      .contains(workspaceBounty.estimate_session_length)
      .click();
  }

  if (workspaceBounty.estimate_completion_date) {
    cy.get('.react-datepicker__input-container > .euiDatePicker').click();
    cy.get('.react-datepicker__input-container > .euiDatePicker').type('{selectAll}');
    cy.wait(100);
    cy.get('.react-datepicker__input-container > .euiDatePicker').type(
      workspaceBounty.estimate_completion_date
    );
  }

  if (workspaceBounty.deliverables) {
    cy.get('textarea.inputText').type(workspaceBounty.deliverables);
  }

  cy.contains('Next').click();

  if (workspaceBounty.assign) {
    cy.get('.SearchInput').type(workspaceBounty.assign);
    cy.wait(1000);
    cy.get('.People').contains('Assign').click();
  } else {
    cy.contains('Decide Later').click();
  }

  cy.contains('Finish').click();
});

Cypress.Commands.add('lnurl_login', (seed: string): Cypress.Chainable<string> => {
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

  cy.visit('http://localhost:3007');
  cy.contains('Sign in').click();

  cy.contains('Login with LNAUTH').click();

  return cy
    .get('[data-challenge]')
    .invoke('attr', 'data-challenge')
    .then((value) => {
      return new Promise(async (resolve, reject) => {
        try {
          const ec = new EC('secp256k1');
          const uint8Array = new Uint8Array(bech32.fromWords(bech32.decode(value, 1500).words));

          const textDecoder = new TextDecoder('utf-8');
          const url = new URL(textDecoder.decode(uint8Array));

          const message = seed ? seed : 'lnurl+cypress+auth';
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

          resolve(pubkey);
        } catch (error) {
          cy.log(error);
          reject('error getting pubkey');
        }
      });
    })
    .then((pubkey: string) => {
      return cy.wrap(pubkey);
    });
});

Cypress.Commands.add('create_workspace', (workspace) => {
  cy.get('[data-testid="loggedInUser"]').click();

  cy.wait(1000);
  cy.contains('Add Workspace').click();

  cy.get('[placeholder="My Workspace..."]').type(workspace.name);

  cy.get('[placeholder="Description Text..."]').type(workspace.description);

  if (workspace.website) {
    cy.get('[placeholder="Website URL..."]').type(workspace.website);
  }

  if (workspace.github) {
    cy.get('[placeholder="Github link..."]').type(workspace.github);
  }

  cy.contains('* Required fields').next().click();
});

Cypress.Commands.add('pay_invoice', (details) => {
  const v2BobUrl = 'http://localhost:3006/pay_invoice';
  cy.request({
    method: 'POST',
    url: v2BobUrl,
    headers: {
      'x-admin-token': `${v2AdminToken}`
    },
    body: {
      bolt11: details.invoice
    }
  }).then((response) => {
    console.log(response);
  });
});

Cypress.Commands.add('add_invoice', (details) => {
  const v2BobUrl = 'http://localhost:3006/invoice';
  let user;
  cy.request({
    method: 'POST',
    url: v2BobUrl,
    headers: {
      'x-admin-token': `${v2AdminToken}`
    },
    body: {
      amt_msat: details.amount * 1000
    }
  });
});

// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import nodes from '../fixtures/nodes.json';
import nodesv2 from '../fixtures/v2nodes.json';
import { randomString } from '../../src/helpers/helpers-extended';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Generate session ID once
const sessionId = randomString(32);

before(() => {
  sessionStorage.clear();

  sessionStorage.setItem('sphinx_session_id', sessionId);
});

beforeEach(() => {
  const currentSessionId = sessionStorage.getItem('sphinx_session_id');
  if (!currentSessionId || currentSessionId !== sessionId) {
    sessionStorage.setItem('sphinx_session_id', sessionId);
  }

  cy.intercept('**/*', (req: any) => {
    const retryCount = 3;
    let attempt = 0;

    const makeRequest = () => {
      req.headers['x-session-id'] = sessionStorage.getItem('sphinx_session_id');

      if (req.url.includes('?')) {
        req.url += `&_t=${Date.now()}`;
      } else {
        req.url += `?_t=${Date.now()}`;
      }

      return req.continue((res: any) => {
        if (res.statusCode >= 400 && attempt < retryCount) {
          attempt++;
          cy.wait(1000 * attempt);
          return makeRequest();
        }
      });
    };

    return makeRequest();
  });

  cy.window().then(
    (win: any) =>
      new Cypress.Promise((resolve: any) => {
        const checkSession = () => {
          if (win.sessionStorage.getItem('sphinx_session_id') === sessionId) {
            resolve();
          } else {
            setTimeout(checkSession, 100);
          }
        };
        checkSession();
      })
  );
});

afterEach(() => {
  cy.window().then((win: any) => {
    const currentSessionId = win.sessionStorage.getItem('sphinx_session_id');
    if (currentSessionId !== sessionId) {
      sessionStorage.setItem('sphinx_session_id', sessionId);
    }
  });
});

async function postAllUsersToTribe() {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    try {
      await fetch(`${node.external_ip}/profile`, {
        method: 'POST',
        body: JSON.stringify({
          price_to_meet: 0,
          description: `Testing out how this works by ${node.alias}`,
          owner_alias: `${node.alias}`,
          img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQR9dAUM-b34F_a6DMw8D6fQ_Y0LUIAVzvfCw&usqp=CAU'
        }),
        headers: { 'x-user-token': `${node.authToken}` }
      });
    } catch (error) {
      console.log(`Error creating user on bounty platform: ${JSON.stringify(error)}`);
    }
  }
}
postAllUsersToTribe();

async function postV2UsersToTribe() {
  for (let i = 0; i < nodesv2.length; i++) {
    const node = nodesv2[i];
    const botUrl = `${node.external_ip}/signed_timestamp`;
    const tribesUrl = 'http://localhost:13000';
    const adminToken = node.adminToken;

    try {
      const res = await fetch(botUrl, {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'x-admin-token': `${adminToken}` }
      });

      const resJson = await res.json();
      const sig = resJson.sig;
      const profileUrl = tribesUrl + `/person?token=${sig}`;

      let node_alias = '';
      if (node.alias === 'alice') {
        node_alias = 'raph';
      } else {
        node_alias = 'evan';
      }
      // Insert V2 User
      await fetch(profileUrl, {
        method: 'POST',
        body: JSON.stringify({
          owner_alias: node_alias,
          owner_pubkey: node.pubkey,
          owner_route_hint: node.routeHint,
          owner_contact_key: node.pubkey,
          description: 'V2 Description',
          img: '',
          tags: [],
          price_to_meet: 0,
          extras: {},
          new_ticket_time: 0
        })
      });
    } catch (error) {
      console.log(`Error creating user on bounty platform: ${JSON.stringify(error)}`);
    }
  }
}
postV2UsersToTribe();

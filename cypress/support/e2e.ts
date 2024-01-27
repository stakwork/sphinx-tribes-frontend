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

// Alternatively you can use CommonJS syntax:
// require('./commands')

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
      console.log('This is an error');
    }
  }
}

postAllUsersToTribe();

import { bech32 } from 'bech32';
const EC = require('elliptic').ec;

// LNURL PublicKey
// 0430a9b0f2a0bad383b1b3a1989571b90f7486a86629e040c603f6f9ecec857505fd2b1279ccce579dbe59cc88d8d49b7543bd62051b1417cafa6bb2e4fd011d30

describe('Login with LNURL', () => {
  it('User trying to login with LNURL', () => {
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
});

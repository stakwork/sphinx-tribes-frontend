import { bech32 } from 'bech32';
import { getCodespacesBackendUrl } from 'config';
import { ec as EC } from 'elliptic';

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) throw new Error('Hex string must have an even length');

  // Explicitly type the result of hex.match()
  const matchedBytes: string[] = hex.match(/.{1,2}/g) ?? [];

  return new Uint8Array(matchedBytes.map((byte) => parseInt(byte, 16)));
}

// Helper function to convert bytes to hex string
function bytesToHex(bytes: Uint8Array) {
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

export async function testUserLnUrlLogin(encode: string) {
  const ec = new EC('secp256k1');
  const uint8Array = new Uint8Array(bech32.fromWords(bech32.decode(encode, 1500).words));

  const textDecoder = new TextDecoder('utf-8');
  let rawUrl = textDecoder.decode(uint8Array);

  const codespaceUrl = getCodespacesBackendUrl();

  if (codespaceUrl && rawUrl.includes('https://app.github.dev')) {
    rawUrl = rawUrl.replace('https://app.github.dev', `https://${codespaceUrl}`);
  }
  if (codespaceUrl && rawUrl.includes('https://workspaces.sphinx.chat')) {
    rawUrl = rawUrl.replace('https://workspaces.sphinx.chat', `https://${codespaceUrl}`);
  }

  const url = new URL(rawUrl);

  const message = 'lnurl+cypress+auth';
  const hash = await sha256(message);

  const priv = ec.keyFromPrivate(hash);

  const pk = priv.getPublic();
  const pubkey = pk.encode('hex');

  const k1Hex = url.searchParams.get('k1') || '';

  const msgBytes = hexToBytes(k1Hex);

  const signature = ec.sign(msgBytes, priv);
  const sigHex = bytesToHex(signature.toDER());

  url.searchParams.set('sig', sigHex);
  url.searchParams.set('key', pubkey);
  url.searchParams.set('t', Date.now().toString());

  const response = await fetch(url.toString());

  if (!response.ok) {
    console.log('Response from API Call', response);
  }
}

type Signature = ArrayBuffer;
type Data = ArrayBuffer;

// Configuration for IndexedDb for local key store
export const IDBConfig = {
  DATABASE_NAME: "KeyDb",
  OBJECT_STORE_NAME: "KeyObjectStore",
  VERSION: 1,
  KEY_ID: 1,
};

interface CryptoConfig {
  name: string;
  modulusLength: 1024 | 2048 | 4096;
  publicExponent: Uint8Array;
  hash: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
  extractable: false;
  keyUsages: KeyUsage[];
}

// Configuration for WebCrypto
export const CryptoConfig: CryptoConfig = {
  name: "RSASSA-PKCS1-v1_5",
  modulusLength: 4096,
  publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
  hash: "SHA-384",
  extractable: false,
  keyUsages: ["sign", "verify"],
};

/**
 * Returns a new non-exportable key pair for signing and verifying.
 * @returns {Promise<CryptoKeyPair>}
 */
function makeKeys(): Promise<CryptoKeyPair> {
  return window.crypto.subtle.generateKey(
    {
      name: CryptoConfig.name,
      modulusLength: CryptoConfig.modulusLength,
      publicExponent: CryptoConfig.publicExponent,
      hash: CryptoConfig.hash,
    },
    CryptoConfig.extractable, //whether the key is extractable (i.e. can be used in exportKey)
    CryptoConfig.keyUsages
  );
}

/**
 * Takes a payload and signs it with a key pair. Returns the signature only, not the payload.
 * @param data Data to sign
 * @param keys Key pair to sign with
 * @returns signature
 */
function sign(data: Data, key: CryptoKey): Promise<Signature> {
  return window.crypto.subtle.sign(
    {
      name: CryptoConfig.name,
      hash: CryptoConfig.hash,
    },
    key, //from generateKey or importKey above
    data //ArrayBuffer of data you want to sign
  );
}

/**
 * Given data, a key pair, and a signature, verifies that the signature is valid for the data.
 * @param data Payload to verify
 * @param keys Public key to verify with
 * @param signature Signature to verify
 * @returns true if data was signed with signature is valid, false otherwise
 */
function verify(
  data: Data,
  key: CryptoKey,
  signature: Signature
): Promise<boolean> {
  return window.crypto.subtle.verify(
    {
      name: CryptoConfig.name,
      hash: CryptoConfig.hash, //the length of the salt
    },
    key, //from generateKey or importKey above
    signature, //ArrayBuffer of the signature
    data //ArrayBuffer of the data
  );
}

function openDb() {
  const indexedDB = window.indexedDB;
  // Open (or create) the database
  const open = indexedDB.open(IDBConfig.DATABASE_NAME, IDBConfig.VERSION);

  // Create the schema
  open.onupgradeneeded = function () {
    const db = open.result;
    db.createObjectStore(IDBConfig.OBJECT_STORE_NAME, {
      keyPath: "id",
    });
  };

  return open;
}

/**
 * Gets the public key from the local key store. If the key does not exist, creates a new key pair
 * @returns Public key as JsonWebKey
 */
export async function getPublicKey(): Promise<JsonWebKey> {
  return new Promise((resolve, reject) => {
    // Open (or create) the database
    const open = openDb();

    open.onsuccess = function () {
      // Start a new transaction
      const db = open.result;
      const tx = db.transaction(IDBConfig.OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(IDBConfig.OBJECT_STORE_NAME);

      const getKeys = store.get(IDBConfig.KEY_ID) as IDBRequest<{
        id: number;
        keys: CryptoKeyPair;
      }>;
      getKeys.onsuccess = async function () {
        try {
          const keys = await getKeysFromDbOrCreate(getKeys, db);
          const publicKey = await window.crypto.subtle.exportKey(
            "jwk",
            keys.publicKey
          );
          resolve(publicKey);
        } catch (e) {
          reject(e);
        }
      };
    };
  });
}

/**
 * Signs a payload with a key pair that is stored in browser indexedDb.
 * If key pair does not exist, creates a new key pair using WebCrypto
 * and stores the keys in indexedDb.
 * @param data payload to sign
 * @returns Signature as ArrayBuffer
 */
export async function signPayload(data: Data): Promise<Signature> {
  return new Promise((resolve, reject) => {
    // Open (or create) the database
    const open = openDb();

    open.onsuccess = function () {
      // Start a new transaction
      const db = open.result;
      const tx = db.transaction(IDBConfig.OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(IDBConfig.OBJECT_STORE_NAME);

      const getKeys = store.get(IDBConfig.KEY_ID) as IDBRequest<{
        id: number;
        keys: CryptoKeyPair;
      }>;
      getKeys.onsuccess = async function () {
        try {
          const keys = await getKeysFromDbOrCreate(getKeys, db);
          const signature = await sign(data, keys.privateKey);
          resolve(signature);
        } catch (e) {
          reject(e);
        }
      };
      getKeys.onerror = async function () {
        reject(getKeys.error);
      };
    };
  });
}

// function to get keys or create them if they don't exist
async function getKeysFromDbOrCreate(
  keyRequest: IDBRequest<{
    id: number;
    keys: CryptoKeyPair;
  }>,
  db: IDBDatabase
): Promise<CryptoKeyPair> {
  let keys = keyRequest.result?.keys;
  if (!keys) {
    // Keys do not exist, create new keys
    keys = await makeKeys();
    if (makeKeys() === undefined) {
      throw new Error(
        "Could not create keys - Your browser does not support WebCrypto or you are running without SSL enabled."
      );
    }
    // Create new transaction to store new keys, as the previous one is closed
    const tx = db.transaction(IDBConfig.OBJECT_STORE_NAME, "readwrite");
    const newTxStore = tx.objectStore(IDBConfig.OBJECT_STORE_NAME);
    newTxStore.put({ id: 1, keys });
  }
  return keys;
}
/**
 * Verifies that a payload was signed with signature using a key pair that is stored in browser indexedDb.
 * @param data payload to verify
 * @param signature	signature used to sign payload
 * @returns true if data was signed with signature is valid, false otherwise
 */
export function verifyPayload(
  data: Data,
  signature: Signature
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // Open (or create) the database
    const open = openDb();

    open.onsuccess = function () {
      // Start a new transaction
      const db = open.result;
      const tx = db.transaction(IDBConfig.OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(IDBConfig.OBJECT_STORE_NAME);

      const getKeys = store.get(IDBConfig.KEY_ID) as IDBRequest<{
        id: number;
        keys: CryptoKeyPair;
      }>;
      getKeys.onsuccess = async function () {
        const key = getKeys.result.keys.publicKey;
        const isValid = await verify(data, key, signature);
        resolve(isValid);
      };
      getKeys.onerror = async function () {
        reject(getKeys.error);
      };
    };
  });
}

// Helpers

export function convertStringToBase64String(data: string): string {
  return uint8ArrayToString(stringToUint8Array(data));
}

export function arrayBufferToBase64(arrayBuffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(arrayBuffer);
  let byteString = "";
  byteArray.forEach((byte) => {
    byteString += String.fromCharCode(byte);
  });
  return btoa(byteString)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function base64ToArrayBuffer(base64: string) {
  const base64Formatted = base64
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .replace(/\s/g, "");
  const binary_string = atob(base64Formatted);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

function base64ToUint8Array(base64Contents: string): Uint8Array {
  base64Contents = base64Contents
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .replace(/\s/g, "");
  const content = atob(base64Contents);
  return new Uint8Array(content.split("").map((c) => c.charCodeAt(0)));
}

export function stringToUint8Array(contents: string): Uint8Array {
  const encoded = btoa(unescape(encodeURIComponent(contents)));
  return base64ToUint8Array(encoded);
}

function uint8ArrayToString(unsignedArray: Uint8Array): string {
  const base64string = btoa(String.fromCharCode(...unsignedArray));
  return base64string.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

interface TokenPayload {
  [key: string]: string | number | boolean | object;
}

/**
 * Takes a JSON payload, signs it, and returns a signed JWT in format {header}.{body}.{signature}
 * @param tokenPayload JWT payload to sign
 * @returns An object with the signed JWT
 */
export async function signJwt(tokenPayload: TokenPayload): Promise<string> {
  const header = {
    alg: "RS384",
    typ: "JWT",
    kid: IDBConfig.KEY_ID,
  };

  const nowInSeconds = Math.floor(Date.now() / 1000);
  const futureTimeExpiry = 300;

  const payload: TokenPayload = {
    iat: nowInSeconds,
    nbf: nowInSeconds,
    exp: nowInSeconds + futureTimeExpiry,
    ...tokenPayload,
  };

  const stringifiedHeader = JSON.stringify(header);
  const stringifiedPayload = JSON.stringify(payload);

  const headerBase64 = convertStringToBase64String(stringifiedHeader);
  const payloadBase64 = convertStringToBase64String(stringifiedPayload);

  const headerAndPayload = `${headerBase64}.${payloadBase64}`;

  const messageAsUint8Array = stringToUint8Array(headerAndPayload);

  const signature = await signPayload(messageAsUint8Array);
  const base64Signature = arrayBufferToBase64(signature);

  return `${headerAndPayload}.${base64Signature}`;
}

export async function verifyJwt(jwt: string) {
  const [header, payload, signature] = jwt.split(".");
  const headerAndPayloadAsUint8Array = stringToUint8Array(
    `${header}.${payload}`
  );
  const signatureAsUint8Array = base64ToArrayBuffer(signature);
  return await verifyPayload(
    headerAndPayloadAsUint8Array,
    signatureAsUint8Array
  );
}

// Run code in the browser console
(async () => {
  const keys = await getPublicKey();
  console.group("Public Key");
  console.log(keys);
  console.groupEnd();
  const jwt = await signJwt({ hello: "world" });
  console.group("JWT created and signed using Private Key");
  console.log(jwt);
  console.groupEnd();
  const isValid = await verifyJwt(jwt);
  console.group("Validate JWT using Public Key");
  console.log(isValid ? "JWT is valid" : "JWT is invalid");
  console.groupEnd();
})();

# Using WebCrypto and IndexedDB to generate and persist encryption keys securely in the browser

[See Live Demo](https://cfu288.github.io/web-crypto-indexed-db/)

We can securely save the keys created with SubtleCrypto without exporting or exposing the keys by saving the CryptoKey object to IndexedDB. This will allow us to safely get and reuse the same keys in the future. This is important for some use cases like [OAuth2's Dynamic Client Registration Protocol](https://www.rfc-editor.org/rfc/rfc7591).

This repo uses WebCrypto and IndexedDB to securely sign and verify JWT's in the browser with persisted public/private keys.

## Getting started

```
npm i
npm run dev
```

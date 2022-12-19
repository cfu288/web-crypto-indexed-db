# Using SubtleCrypto/WebCrypto to sign and verify JWT's in the browser, and saving the keys securely using IndexedDB

We can securely save the keys created with SubtleCrypto without exporting or exposing the keys by saving the CryptoKey object to IndexedDB. This will allow us to safely get and reuse the same keys in the future. This is important for some use cases like [OAuth2's Dynamic Client Registration Protocol](https://www.rfc-editor.org/rfc/rfc7591).

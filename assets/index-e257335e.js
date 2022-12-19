(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const u of s.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&r(u)}).observe(document,{childList:!0,subtree:!0});function n(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerpolicy&&(s.referrerPolicy=o.referrerpolicy),o.crossorigin==="use-credentials"?s.credentials="include":o.crossorigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(o){if(o.ep)return;o.ep=!0;const s=n(o);fetch(o.href,s)}})();const c={DATABASE_NAME:"MariKeyDb",OBJECT_STORE_NAME:"MariKeyObjectStore",VERSION:1,KEY_ID:1},l={name:"RSASSA-PKCS1-v1_5",modulusLength:4096,publicExponent:new Uint8Array([1,0,1]),hash:"SHA-384",extractable:!1,keyUsages:["sign","verify"]};function p(){return window.crypto.subtle.generateKey({name:l.name,modulusLength:l.modulusLength,publicExponent:l.publicExponent,hash:l.hash},l.extractable,l.keyUsages)}function A(t,e){return window.crypto.subtle.sign({name:l.name,hash:l.hash},e,t)}function S(t,e,n){return window.crypto.subtle.verify({name:l.name,hash:l.hash},e,n,t)}function f(){const e=window.indexedDB.open(c.DATABASE_NAME,c.VERSION);return e.onupgradeneeded=function(){e.result.createObjectStore(c.OBJECT_STORE_NAME,{keyPath:"id"})},e}async function T(){return new Promise((t,e)=>{const n=f();n.onsuccess=function(){const r=n.result,u=r.transaction(c.OBJECT_STORE_NAME,"readwrite").objectStore(c.OBJECT_STORE_NAME).get(c.KEY_ID);u.onsuccess=async function(){try{const a=await b(u,r),i=await window.crypto.subtle.exportKey("jwk",a.publicKey);t(i)}catch(a){e(a)}}}})}async function m(t){return new Promise((e,n)=>{const r=f();r.onsuccess=function(){const o=r.result,a=o.transaction(c.OBJECT_STORE_NAME,"readwrite").objectStore(c.OBJECT_STORE_NAME).get(c.KEY_ID);a.onsuccess=async function(){try{const i=await b(a,o),d=await A(t,i.privateKey);e(d)}catch(i){n(i)}},a.onerror=async function(){n(a.error)}}})}async function b(t,e){var r;let n=(r=t.result)==null?void 0:r.keys;if(!n){if(n=await p(),p()===void 0)throw new Error("Could not create keys - Your browser does not support WebCrypto or you are running without SSL enabled.");e.transaction(c.OBJECT_STORE_NAME,"readwrite").objectStore(c.OBJECT_STORE_NAME).put({id:1,keys:n})}return n}function O(t,e){return new Promise((n,r)=>{const o=f();o.onsuccess=function(){const i=o.result.transaction(c.OBJECT_STORE_NAME,"readwrite").objectStore(c.OBJECT_STORE_NAME).get(c.KEY_ID);i.onsuccess=async function(){const d=i.result.keys.publicKey,y=await S(t,d,e);n(y)},i.onerror=async function(){r(i.error)}}})}function E(t){return B(g(t))}function _(t){const e=new Uint8Array(t);let n="";return e.forEach(r=>{n+=String.fromCharCode(r)}),btoa(n)}function K(t){const e=atob(t),n=e.length,r=new Uint8Array(n);for(let o=0;o<n;o++)r[o]=e.charCodeAt(o);return r.buffer}function x(t){t=t.replace(/-/g,"+").replace(/_/g,"/").replace(/\s/g,"");const e=atob(t);return new Uint8Array(e.split("").map(n=>n.charCodeAt(0)))}function g(t){const e=btoa(unescape(encodeURIComponent(t)));return x(e)}function B(t){return btoa(String.fromCharCode(...t)).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}async function C(t){const e={alg:"RS384",typ:"JWT",kid:c.KEY_ID},n=Math.floor(Date.now()/1e3),o={iat:n,nbf:n,exp:86400,...t},s=JSON.stringify(e),u=JSON.stringify(o),a=E(s),i=E(u),d=`${a}.${i}`,y=g(d),w=await m(y),h=_(w);return`${d}.${h}`}async function J(t){const[e,n,r]=t.split("."),o=g(`${e}.${n}`),s=K(r);return await O(o,s)}(async()=>{const t=await T();console.group("Public Key"),console.log(t),console.groupEnd();const e=await C({hello:"world"});console.group("JWT created and signed using Private Key"),console.log(e),console.groupEnd();const n=await J(e);console.group("Validate JWT using Public Key"),console.log(n?"JWT is valid":"JWT is invalid"),console.groupEnd()})();

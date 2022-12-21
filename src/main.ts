import { setupJWTDisplay } from "./demo/jwt-display";
import { setupPKDisplay } from "./demo/pk-display";
import { signJwt, verifyJwt } from "./jwt-tools";
import { getPublicKey } from "./web-crypto";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<div id="step1">
  <article>
    <h3>1) Generate public + private key pair</h3>
    <button id="pkButton" type="button"></button>
    <p id="publicKeySubtitle"></p>
    <pre id="pkDisplay"></pre>
  </article>
</div>
<div id="step2"></div>
<div id="step3"></div>
`;

const step2Html = `
<article>
<h3>2) Sign JWT</h3>
<p>
  <label>JWT Body</label>
  <input id="jwtInput" type="text" value='{"hello": "world"}' />
</p>
<button id="jwtButton" type="button"></button>
<p id="jwtSubtitle"></p>
<pre id="jwtDisplay"></pre>
</article>
`;

setupPKDisplay(
  document.querySelector<HTMLButtonElement>("#pkButton")!,
  document.querySelector<HTMLDivElement>("#publicKeySubtitle")!,
  document.querySelector<HTMLDivElement>("#pkDisplay")!,
  () => {
    document.querySelector<HTMLDivElement>("#step2")!.innerHTML = step2Html;
    setupJWTDisplay(
      document.querySelector<HTMLButtonElement>("#jwtButton")!,
      document.querySelector<HTMLDivElement>("#jwtSubtitle")!,
      document.querySelector<HTMLInputElement>("#jwtInput")!,
      document.querySelector<HTMLDivElement>("#jwtDisplay")!
    );
  }
);

// // Run code in the browser console
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

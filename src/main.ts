import { setupJWTDisplay } from "./demo/jwt-display";
import { setupPKDisplay } from "./demo/pk-display";
import { setupVerifyDisplay } from "./demo/verify-display";
import { signJwt, verifyJwt } from "./jwt-tools";
import { getPublicKey } from "./web-crypto";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<div id="step1"></div>
<div id="step2"></div>
<div id="step3"></div>
`;

setupPKDisplay(() => setupJWTDisplay((jwt: string) => setupVerifyDisplay(jwt)));

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

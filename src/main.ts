import { setupStep2Display, removeStep2Display } from "./demo/step2-display";
import { setupStep1Display } from "./demo/step1-display";
import { setupStep3Display, removeStep3Display } from "./demo/step3-display";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<div id="step1"></div>
<div id="step2"></div>
<div id="step3"></div>
`;

setupStep1Display(
  () =>
    setupStep2Display(
      (jwt: string) => setupStep3Display(jwt),
      () => removeStep3Display()
    ),
  () => removeStep2Display()
);

// Run code in the browser console
// (async () => {
//   const keys = await getPublicKey();
//   console.group("Public Key");
//   console.log(keys);
//   console.groupEnd();
//   const jwt = await signJwt({ hello: "world" });
//   console.group("JWT created and signed using Private Key");
//   console.log(jwt);
//   console.groupEnd();
//   const isValid = await verifyJwt(jwt);
//   console.group("Validate JWT using Public Key");
//   console.log(isValid ? "JWT is valid" : "JWT is invalid");
//   console.groupEnd();
// })();

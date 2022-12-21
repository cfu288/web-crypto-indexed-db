import { signJwt } from "../jwt-tools";

const step2Html = `
<article>
  <h2>2) Sign JWT</h2>
  <p>Now that we've generated a CryptoKey, we can sign payloads like JWT's using the private key and later validate them using the public key.</p>
  <p>Try providing a sample JWT body below to see how we generate and sign a JWT using the body dynamically in the browser.</p>
  <p>
    <label>JWT Body</label>
    <input id="jwtInput" type="text" value='{"hello": "world"}' />
  </p>
  <button id="jwtButton" type="button"></button>
  <p id="jwtSubtitle"></p>
  <div id="jwtResult">
    <pre id="jwtDisplay"></pre>
    <p>You can validate this JWT with the debugger at jwt.io using the public key from the previous section. Click the button below to pre-populate the above JWT in the JWT debugger automatically. Note that you'll need to copy over the public key manually to validate the signature in the debugger</p>
    <a id="jwtLink" target='_blank' style="text:center"><img src='https://jwt.io/img/badge.svg' alt='jwt.io'></img></a>
  </div>
</article>
`;

export function removeStep2Display() {
  document.querySelector<HTMLDivElement>("#step2")!.innerHTML = "";
  document.querySelector<HTMLDivElement>("#step3")!.innerHTML = "";
}

export async function setupStep2Display(
  activateNextStep: (jwt: string) => void,
  deactivateNextStep: () => void
) {
  // Initialize
  document.querySelector<HTMLDivElement>("#step2")!.innerHTML = step2Html;
  const buttonElement =
    document.querySelector<HTMLButtonElement>("#jwtButton")!;
  const subtitleElement =
    document.querySelector<HTMLDivElement>("#jwtSubtitle")!;
  const jwtInputElement =
    document.querySelector<HTMLInputElement>("#jwtInput")!;
  const jwtDisplayElement =
    document.querySelector<HTMLDivElement>("#jwtDisplay")!;
  const jwtResultElement =
    document.querySelector<HTMLDivElement>("#jwtResult")!;
  const jwtLink = document.querySelector<HTMLLinkElement>("#jwtLink")!;

  // State
  let buttonState: boolean = true;
  let jwtText: string = "";

  // Handlers
  const toggleButton = () => {
    const text = buttonState ? "Sign JWT" : "Reset";
    buttonElement.innerHTML = text;
    buttonState = !buttonState;
  };
  const setCodeDisplayText = (str: string) => {
    jwtDisplayElement.innerHTML = str;
  };
  const setLinkDisplay = async (str: string) => {
    jwtLink.href = `https://jwt.io?access_token=${str}`;
  };
  const setErrorText = (str: string, color?: string) => {
    subtitleElement.innerHTML = `${str}`;
    subtitleElement.style.display = str ? "block" : "none";
    subtitleElement.style.color = color ? color : "black";
  };
  const setResultDisplay = (visible: boolean) => {
    jwtResultElement.style.display = visible ? "block" : "none";
  };
  const getInputTextAsJson = async () => {
    try {
      const parsed = JSON.parse(jwtInputElement.value);
      jwtInputElement.disabled = true;
      return Promise.resolve(parsed);
    } catch (e) {
      jwtInputElement.disabled = false;
      return Promise.reject(e);
    }
  };
  const resetInputText = () => {
    jwtInputElement.value = '{"hello": "world"}';
    jwtInputElement.disabled = false;
  };
  const lockInputText = () => {
    jwtInputElement.disabled = true;
  };

  // Event listeners
  buttonElement.addEventListener("click", async () => {
    toggleButton();
    try {
      if (buttonState) {
        const validJwtText = await getInputTextAsJson();
        setResultDisplay(true);
        jwtText = `${await signJwt(validJwtText)}`;
        setCodeDisplayText(jwtText);
        setErrorText("");
        await setLinkDisplay(jwtText);
        activateNextStep(jwtText);
      } else {
        // Reset
        setResultDisplay(false);
        setErrorText("");
        resetInputText();
        deactivateNextStep();
      }
    } catch (e) {
      setErrorText(
        "Invalid JSON provided. Please provide valid JSON for the JWT body.",
        "red"
      );
      lockInputText();
      setCodeDisplayText("");
      return;
    }
  });

  // Initialize
  toggleButton();
  setResultDisplay(false);
  setCodeDisplayText("");
  setErrorText("");
  await setLinkDisplay("");
}

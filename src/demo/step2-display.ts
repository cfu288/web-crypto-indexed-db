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
  <div id="jwtResult">
    <p id="jwtSubtitle"></p>
    <pre id="jwtDisplay"></pre>
    <p>You can validate this JWT with the debugger at jwt.io using the public key from the previous section. Click the button below to pre-populate the above JWT in the JWT debugger automatically. Note that you'll need to copy over the public key manually:</p>
    <a id="jwtLink" target='_blank' style="text:center"><img src='https://jwt.io/img/badge.svg' alt='jwt.io'></img></a>
  </div>
</article>
`;

export async function setupStep2Display(
  activateNextStep: (jwt: string) => void
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
  let buttonState: boolean = false;
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
  const setSubtitleText = (str: string, color?: string) => {
    subtitleElement.innerHTML = `${str}`;
    subtitleElement.style.color = color ? color : "black";
  };
  const setResultDisplay = (visible: boolean) => {
    jwtResultElement.style.display = visible ? "block" : "none";
  };
  const getInputTextAsJson = async () => {
    // const pk = await getPublicKey();
    try {
      return Promise.resolve({
        ...JSON.parse(jwtInputElement.value),
        // sub_jwk: pk,
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };
  const resetInputText = () => {
    jwtInputElement.value = '{"hello": "world"}';
  };

  // Event listeners
  buttonElement.addEventListener("click", async () => {
    toggleButton();
    try {
      if (buttonState) {
        const validJwtText = await getInputTextAsJson();
        jwtText = `${await signJwt(validJwtText)}`;
        setCodeDisplayText(jwtText);
        setResultDisplay(true);
        setSubtitleText(
          "Below is the signed JWT using the above body from input field and private key previously stored from IndexedDB."
        );
        await setLinkDisplay(jwtText);
        activateNextStep(jwtText);
      } else {
        // Reset
        setResultDisplay(false);
        await setLinkDisplay("");
        setSubtitleText("");
        setCodeDisplayText("");
        resetInputText();
      }
    } catch (e) {
      setSubtitleText(
        "Invalid JSON provided. Please provide valid JSON for the JWT body.",
        "red"
      );
      setCodeDisplayText("");
      return;
    }
  });

  // Initialize
  toggleButton();
  toggleButton();
  setResultDisplay();
  setCodeDisplayText("");
  setSubtitleText("");
  await setLinkDisplay("");
}

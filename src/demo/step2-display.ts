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
  <pre id="jwtDisplay"></pre>
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
    jwtDisplayElement.style.display = str ? "block" : "none";
  };
  const setSubtitleText = (str: string, color?: string) => {
    subtitleElement.innerHTML = `${str}`;
    subtitleElement.style.color = color ? color : "black";
  };
  const getInputTextAsJson = () => {
    try {
      return Promise.resolve(JSON.parse(jwtInputElement.value));
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
        setSubtitleText(
          "Below is the signed JWT using the above body from input field and private key previously stored from IndexedDB. You can validate this JWT at <a href='https://jwt.io/' target='_blank'>jwt.io</a> using the public key from the previous section."
        );
        activateNextStep(jwtText);
      } else {
        // Reset
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
  setCodeDisplayText("");
  setSubtitleText("");
}

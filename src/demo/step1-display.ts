import { getPublicKey } from "../web-crypto";

const step1Html = `
<article>
  <h2>1) Generate CryptoKey Key Pair</h2>
  <p>The following button will check to see if a CryptoKey key pair already exists in IndexedDB. If it does, it will just return the existing CryptoKey object. If not, it will generate a new one and store it in IndexedDB.</p>
  <button id="pkButton" type="button"></button>
  <p id="publicKeySubtitle"></p>
  <pre id="pkDisplay"></pre>
</article>
`;

export async function setupStep1Display(
  activateNextStep: () => void,
  deactivateNextStep: () => void
) {
  // Initialize
  document.querySelector<HTMLDivElement>("#step1")!.innerHTML = step1Html;
  const buttonElement = document.querySelector<HTMLButtonElement>("#pkButton")!;
  const subtitleElement =
    document.querySelector<HTMLDivElement>("#publicKeySubtitle")!;
  const pkElement = document.querySelector<HTMLInputElement>("#pkDisplay")!;

  // State
  let buttonState: boolean = true;

  // Handlers
  const toggleButton = () => {
    buttonState = !buttonState;
    const text = buttonState
      ? "Hide public key"
      : "Generate key pair and show public key";
    buttonElement.innerHTML = text;
  };
  const setPkText = (str: string) => {
    pkElement.innerHTML = str;
    pkElement.style.display = str ? "block" : "none";
  };
  const setSubtitleText = (str: string) => {
    subtitleElement.innerHTML = `${str}`;
  };

  // Event listeners
  buttonElement.addEventListener("click", async () => {
    toggleButton();

    if (buttonState) {
      setPkText(
        buttonState ? `${JSON.stringify(await getPublicKey(), null, 2)}` : ""
      );
      setSubtitleText(
        buttonState
          ? "This public key is persisted in IndexedDB - try refreshing to see that you'll always get the same public key result. The private key is not shown as it is not exposed. If you want to restart this demo with a new key pair, clear your IndexedDB storage."
          : ""
      );
      activateNextStep();
    } else {
      setPkText("");
      setSubtitleText("");
      deactivateNextStep();
    }
  });

  // Initialize
  toggleButton();
  setPkText("");
}

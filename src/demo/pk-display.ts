import { getPublicKey } from "../web-crypto";

export async function setupPKDisplay(
  buttonElement: HTMLButtonElement,
  subtitleElement: HTMLDivElement,
  pkElement: HTMLDivElement,
  activateNextStep: () => void
) {
  // State
  let buttonState: boolean = true;

  // Handlers
  const toggleButton = () => {
    buttonState = !buttonState;
    const text = buttonState
      ? "Hide public key"
      : "Generate key pair and show public";
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
    setPkText(
      buttonState ? `${JSON.stringify(await getPublicKey(), null, 2)}` : ""
    );
    setSubtitleText(
      buttonState
        ? "This public key is persisted in IndexedDB - try refreshing to see that you'll always get the same result. The private key is not shown as it is not exposed. If you want to restart this demo with a new key pair, clear your IndexedDB storage."
        : ""
    );
    activateNextStep();
  });

  // Initialize
  toggleButton();
  setPkText("");
}

import { signJwt } from "../jwt-tools";

export async function setupJWTDisplay(
  buttonElement: HTMLButtonElement,
  subtitleElement: HTMLDivElement,
  jwtInputElement: HTMLInputElement,
  jwtDisplayElement: HTMLDivElement
) {
  // State
  let buttonState: boolean = false;

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
  const setSubtitleText = (str: string) => {
    subtitleElement.innerHTML = `${str}`;
  };
  const getInputTextAsJson = () => {
    return JSON.parse(jwtInputElement.value);
  };

  // Event listeners
  buttonElement.addEventListener("click", async () => {
    toggleButton();
    setCodeDisplayText(
      buttonState ? `${await signJwt(getInputTextAsJson())}` : ""
    );
    setSubtitleText(
      buttonState
        ? "Signed JWT using body from input field and private key from IndexedDB. You can validate this JWT at <a href='https://jwt.io/' target='_blank'>jwt.io</a> using the public key from the previous section."
        : ""
    );
  });

  // Initialize
  toggleButton();
  toggleButton();
  setCodeDisplayText("");
  setSubtitleText("");
}

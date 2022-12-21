import { verifyJwt } from "../jwt-tools";

const step3Html = `
<article>
  <h2>3) Verify JWT</h2>
  <p>Clicking the button below will attempt to validate the JWT using the public key from the previous section.</p>
  <button id="verifyButton" type="button"></button>
  <p id="verifyDisplay"></p>
</article>
`;

export async function setupStep3Display(jwt: string) {
  // Initialize
  document.querySelector<HTMLDivElement>("#step3")!.innerHTML = step3Html;
  const buttonElement =
    document.querySelector<HTMLButtonElement>("#verifyButton")!;
  const verifyDisplayElement =
    document.querySelector<HTMLDivElement>("#verifyDisplay")!;

  // State
  let buttonState: boolean = false;

  // Handlers
  const toggleButton = () => {
    const text = buttonState ? "Validate" : "Reset";
    buttonElement.innerHTML = text;
    buttonState = !buttonState;
  };
  const setCodeDisplayText = (str: string, color?: string) => {
    verifyDisplayElement.innerHTML = str;
    verifyDisplayElement.style.display = str ? "block" : "none";
    verifyDisplayElement.style.color = color ? color : "black";
  };

  // Event listeners
  buttonElement.addEventListener("click", async () => {
    toggleButton();
    const isValid = await verifyJwt(jwt);
    setCodeDisplayText(
      buttonState
        ? `${isValid ? "The JWT is valid 🎉" : "The JWT is not valid 😟"}`
        : "",
      isValid ? "green" : "red"
    );
  });

  // Initialize
  toggleButton();
  toggleButton();
  setCodeDisplayText("");
}

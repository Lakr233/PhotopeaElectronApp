/**
 * Photopea Bootstrap Loader
 * Handles loading the main editor components
 */

class PhotopeaBootstrap {
  constructor() {
    this.loaded = false;
    this.capElement = document.getElementById("cap");
    this.localStorage = window.localStorage;
    this.preferences = this.loadPreferences();
  }

  loadPreferences() {
    try {
      const data = this.localStorage?.getItem("_ppp");
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.warn("[-] failed to load preferences:", error);
      return {};
    }
  }

  savePreferences() {
    try {
      this.preferences.capShown = "false";
      this.localStorage?.setItem("_ppp", JSON.stringify(this.preferences));
      console.log("[+] preferences saved successfully");
    } catch (error) {
      console.warn("[-] failed to save preferences:", error);
    }
  }

  loadResources() {
    // order matters!
    const resources = [
      "style/all09.css",
      "code/ext/ext1753796081.js",
      "code/dbs/DBS1751979998.js",
      "code/pp/pp1754493533.js",
    ];

    const basePath = "";
    console.log("[i] loading resources from:", basePath);

    resources.forEach((resource) => {
      const isScript = resource.endsWith(".js");
      const element = document.createElement(isScript ? "script" : "link");

      if (isScript) {
        console.log("[i] loading script:", resource);
        element.src = basePath + resource;
        element.async = false;
        element.onload = () => {
          console.log(`[+] script ${resource} loaded.`);
        };
        document.body.appendChild(element);
      } else {
        console.log("[i] loading stylesheet:", resource);
        element.href = basePath + resource;
        element.rel = "stylesheet";
        document.head.appendChild(element);
      }
    });
  }

  applyPatchToHomePage() {
    const selectors = [
      // remove left sidebar for home and load from this device
      "body > div.flexrow.app > div > div.flexrow > div > div > div.body > div > div:nth-child(1)",
      // remove welcome message
      "body > div.flexrow.app > div > div.flexrow > div > div > div.body > div > div > div",
      // remove fullscreen button
      "body > div.flexrow.app > div > div:nth-child(3) > div:nth-child(2) > div > span:nth-child(2) > button:nth-child(2)",
    ];
    let missingCount = 0;
    let removedCount = 0;
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`[+] removing unwanted element: ${selector}`);
        element.remove();
        removedCount++;
      } else {
        console.log(`[-] element not found: ${selector}`);
        missingCount++;
      }
    }
    if (missingCount === selectors.length) {
      console.log("[-] not yet ready, waiting for elements to appear...");
      return false;
    }
    return true;
  }

  removeNewDocumentUnwantedElements() {
    // find element by id cb466
    const element = document.getElementById("cb466");
    if (!element) {
      console.log(
        "[-] element with id 'cb466' not found, waiting for it to appear..."
      );
      return false;
    }
    // go up 3 level
    const div = element.parentElement.parentElement.parentElement;
    if (div) {
      console.log("[+] removing unwanted element with id 'cb466'");
      div.remove();
      return true;
    }
    console.log("[-] parent element not found, cannot remove unwanted element.");
    return false;
  }

  ensureBackgroundOnTopDragger() {
    const topElements = document.querySelectorAll(".top");
    const addedStyles = "background: rgba(128, 128, 128, 0.8); font-size: 8px;";
    for (const topElement of topElements) {
      // <div class="top">&lt; &gt;</div>
      if (
        topElement.textContent.trim() === "< >" ||
        topElement.textContent.trim() === "> <"
      ) {
        if (!topElement.style.cssText.includes(addedStyles)) {
          console.log("[+] adding styles to top element:", topElement);
          topElement.style.cssText += addedStyles;
        }
      }
    }
  }

  init() {
    if (this.loaded) return;

    console.log("[i] initializing Photopea editor...");

    if (this.capElement) {
      this.capElement.style.display = "none";
      console.log("[+] cap element hidden");
    }

    this.savePreferences();
    this.loadResources();

    const elementPather = new MutationObserver(() => {
      this.applyPatchToHomePage();
      this.removeNewDocumentUnwantedElements();
      this.ensureBackgroundOnTopDragger();
    });
    elementPather.observe(document.body, {
      childList: true,
      subtree: true,
    });

    this.loaded = true;
    console.log("[+] photopea editor initialized");
  }
}

const photopea = new PhotopeaBootstrap();
photopea.init();

window.PhotopeaBootstrap = PhotopeaBootstrap;

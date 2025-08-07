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
      console.warn("Failed to load preferences:", error);
      return {};
    }
  }

  savePreferences() {
    try {
      this.preferences.capShown = "false";
      this.localStorage?.setItem("_ppp", JSON.stringify(this.preferences));
    } catch (error) {
      console.warn("Failed to save preferences:", error);
    }
  }

  loadResources() {
    const resources = [
      "style/all09.css",
      "code/ext/ext1753796081.js",
      "code/dbs/DBS1751979998.js",
      "code/pp/pp1754493533.js",
    ];

    const basePath = "";
    console.log("Loading resources from:", basePath);

    resources.forEach((resource) => {
      const isScript = resource.endsWith(".js");
      const element = document.createElement(isScript ? "script" : "link");

      if (isScript) {
        element.src = basePath + resource;
        element.async = false;
        document.body.appendChild(element);
      } else {
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
        console.log(`Removing unwanted element: ${selector}`);
        element.remove();
        removedCount++;
      } else {
        console.log(`Element not found: ${selector}`);
        missingCount++;
      }
    }
    if (missingCount === selectors.length) {
      console.log("Not yet ready, waiting for elements to appear...");
      return false;
    }
    return true;
  }

  removeNewDocumentUnwantedElements() {
    // find element by id cb466
    const element = document.getElementById("cb466");
    if (!element) {
      console.log(
        "Element with id 'cb466' not found, waiting for it to appear..."
      );
      return false;
    }
    // go up 3 level
    const div = element.parentElement.parentElement.parentElement;
    if (div) {
      console.log("Removing unwanted element with id 'cb466'");
      div.remove();
      return true;
    }
    console.log("Parent element not found, cannot remove unwanted element.");
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
          console.log("Adding styles to top element:", topElement);
          topElement.style.cssText += addedStyles;
        }
      }
    }
  }

  init() {
    if (this.loaded) return;

    console.log("Initializing Photopea editor...");

    if (this.capElement) {
      this.capElement.style.display = "none";
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
  }
}

const photopea = new PhotopeaBootstrap();
photopea.init();

window.PhotopeaBootstrap = PhotopeaBootstrap;

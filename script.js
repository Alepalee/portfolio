// Redirect per compatibilità con i vecchi link a index.html#lavori
if (window.location.hash === "#lavori") {
  window.location.replace("lavori.html");
}

// Verifica se l'animazione di caricamento iniziale della Home è già stata visualizzata nella sessione
try {
  if (window.sessionStorage.getItem("home-loader-seen") === "true") {
    document.documentElement.classList.add("skip-home-loader");
  }
} catch (error) {
  // Il loader funziona anche se sessionStorage non è disponibile
}

document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================================================
     PAGINA HOME (index.html)
     ========================================================================== */

  // Suddivisione in parole/lettere per testi con elementi annidati (link, evidenziature):
  // la struttura HTML viene mantenuta e l'animazione procede per parola
  const splitRichText = (element) => {
    let wordIndex = 0;

    const walk = (source, target) => {
      source.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          // U+2060 impedisce l'a capo tra una parola e un elemento adiacente senza spazio
          // (es. "dell'" + link, "CSS" + virgola), come nel testo non suddiviso
          const parts = node.textContent.split(/(\s+)/).filter(Boolean);
          parts.forEach((part, partIndex) => {
            if (/^\s+$/.test(part)) {
              target.appendChild(document.createTextNode(" "));
              return;
            }

            if (partIndex === 0 && node.previousSibling && node.previousSibling.nodeType === Node.ELEMENT_NODE) {
              target.appendChild(document.createTextNode("\u2060"));
            }

            const word = document.createElement("span");
            word.className = "animated-word";

            [...part].forEach((character) => {
              const letter = document.createElement("span");
              letter.className = "letter";
              letter.style.setProperty("--letter-index", wordIndex);
              letter.textContent = character;
              word.appendChild(letter);
            });

            wordIndex += 1;
            target.appendChild(word);

            if (partIndex === parts.length - 1 && node.nextSibling && node.nextSibling.nodeType === Node.ELEMENT_NODE) {
              target.appendChild(document.createTextNode("\u2060"));
            }
          });
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const clone = node.cloneNode(false);
          walk(node, clone);
          target.appendChild(clone);
        }
      });
    };

    const copy = document.createElement("span");
    copy.className = "animated-copy animated-copy-rich";
    walk(element, copy);
    element.textContent = "";
    element.appendChild(copy);
  };

  // Suddivisione in lettere per elementi con data-animate-text (es. navigazione Home)
  document.querySelectorAll("[data-animate-text]").forEach((element) => {
    if (element.children.length > 0) {
      splitRichText(element);
      return;
    }

    const text = element.textContent;
    const copy = document.createElement("span");
    copy.className = "animated-copy";
    copy.setAttribute("aria-hidden", "true");

    [...text].forEach((character, index) => {
      const letter = document.createElement("span");
      letter.className = `letter letter-${index}${character === " " ? " letter-space" : ""}`;
      letter.textContent = character === " " ? "\u00A0" : character;
      copy.appendChild(letter);
    });

    element.textContent = "";
    element.setAttribute("aria-label", text);
    element.appendChild(copy);
  });

  // Gestione del loader di caricamento numerico
  const loader = document.querySelector(".page-loader");
  const loaderProgress = document.querySelector("#loader-progress");

  if (loader && loaderProgress) {
    const loaderDuration = 4000;
    const loadingSteps = [
      { time: 0, value: 0 },
      { time: 0.08, value: 6 },
      { time: 0.18, value: 23 },
      { time: 0.29, value: 42 },
      { time: 0.38, value: 42 },
      { time: 0.53, value: 68 },
      { time: 0.62, value: 74 },
      { time: 0.7, value: 74 },
      { time: 0.82, value: 91 },
      { time: 0.9, value: 93 },
      { time: 0.95, value: 93 },
      { time: 1, value: 100 },
    ];
    const loaderStart = performance.now();
    const loaderInterval = 50;
    let loaderElapsed = 0;
    let loaderTimer = null;
    const shouldSkipLoader =
      document.documentElement.classList.contains("skip-home-loader");

    const getLoadingValue = (progress) => {
      const nextIndex = loadingSteps.findIndex((step) => step.time >= progress);
      const endIndex = nextIndex < 1 ? 1 : nextIndex;
      const start = loadingSteps[endIndex - 1];
      const end = loadingSteps[endIndex];
      const segment = (progress - start.time) / (end.time - start.time);
      const easedSegment = 1 - Math.pow(1 - Math.max(0, Math.min(1, segment)), 2);
      return Math.floor(start.value + (end.value - start.value) * easedSegment);
    };

    const revealHome = () => {
      window.requestAnimationFrame(() => {
        document.body.classList.remove("is-loading");
        document.body.classList.add("home-ready");

        window.setTimeout(() => {
          document.body.classList.add("motion-loaded");
        }, 1600);
      });
    };

    const completeLoading = () => {
      loaderProgress.textContent = "100";
      loader.classList.add("is-complete");
      window.setTimeout(revealHome, 450);
    };

    const updateLoading = () => {
      loaderElapsed += loaderInterval;
      const elapsed = Math.max(performance.now() - loaderStart, loaderElapsed);
      const progress = Math.min(elapsed / loaderDuration, 1);
      loaderProgress.textContent = String(getLoadingValue(progress));

      if (progress >= 1) {
        window.clearInterval(loaderTimer);
        completeLoading();
      }
    };

    if (shouldSkipLoader) {
      loader.remove();
      revealHome();
    } else {
      try {
        window.sessionStorage.setItem("home-loader-seen", "true");
      } catch (error) {
        // Continua senza persistenza se lo storage non è disponibile
      }

      loaderTimer = window.setInterval(updateLoading, loaderInterval);
      updateLoading();
    }
  }

  /* ==========================================================================
     PAGINA LAVORI (lavori.html)
     ========================================================================== */

  // Suddivisione in lettere ed elementi parola per header, titolo e righe della lista
  const worksRevealElements = document.querySelectorAll(
    ".works-mode-header a, .works-title, .unified-project-link span",
  );

  if (worksRevealElements.length > 0) {
    worksRevealElements.forEach((element) => {
      // Le parole vengono separate da spazi; un <br> nell'HTML forza un a capo e viene mantenuto
      const tokens = [];
      element.childNodes.forEach((node) => {
        if (node.nodeName === "BR") {
          tokens.push({ lineBreak: true });
        } else {
          node.textContent
            .split(/\s+/)
            .filter(Boolean)
            .forEach((word) => tokens.push({ word }));
        }
      });

      const text = tokens
        .map((token) => (token.lineBreak ? " " : token.word))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      const copy = document.createElement("span");
      copy.className = "works-reveal-copy";
      copy.setAttribute("aria-hidden", "true");
      let letterIndex = 0;

      tokens.forEach((token, tokenIndex) => {
        if (token.lineBreak) {
          copy.appendChild(document.createElement("br"));
          return;
        }

        const wordElement = document.createElement("span");
        wordElement.className = "works-reveal-word";

        [...token.word].forEach((character) => {
          const letter = document.createElement("span");
          letter.className = `works-reveal-letter works-letter-${letterIndex}`;
          letter.textContent = character;
          wordElement.appendChild(letter);
          letterIndex += 1;
        });

        copy.appendChild(wordElement);

        const next = tokens[tokenIndex + 1];
        if (next && !next.lineBreak) {
          copy.appendChild(document.createTextNode(" "));
        }
      });

      element.textContent = "";
      element.setAttribute("aria-label", text);
      element.appendChild(copy);
    });

    const body = document.body;
    const homeLink = document.querySelector(".works-home-link");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let worksAnimationTimer = null;

    const startWorksAnimation = () => {
      body.classList.add("works-content-ready");
      // Fine sequenza: ultimo carattere dell'elenco termina a ~1.75s
      worksAnimationTimer = window.setTimeout(() => {
        body.classList.add("works-animation-complete");
      }, 2000);
    };

    // Nella pagina Chi sono il titolo parte insieme al resto, dopo il loader
    const whenHomeReady = (callback) => {
      if (!body.classList.contains("about-page") || body.classList.contains("home-ready")) {
        callback();
        return;
      }

      const observer = new MutationObserver(() => {
        if (body.classList.contains("home-ready")) {
          observer.disconnect();
          callback();
        }
      });
      observer.observe(body, { attributes: true, attributeFilter: ["class"] });
    };

    // L'animazione parte appena il font è pronto (con un limite massimo di 600ms)
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([
      fontsReady,
      new Promise((resolve) => window.setTimeout(resolve, 600)),
    ]).then(() => whenHomeReady(() => window.requestAnimationFrame(startWorksAnimation)));

    // Transizione in uscita verso la Home
    if (homeLink) {
      homeLink.addEventListener("click", (event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          reducedMotion.matches
        ) {
          return;
        }

        event.preventDefault();
        window.clearTimeout(worksAnimationTimer);
        body.classList.remove("works-animation-complete");
        body.classList.add("works-content-exit");
        window.setTimeout(() => {
          window.location.href = homeLink.href;
        }, 280);
      });
    }

    // Tornando indietro dalla cache del browser la pagina riappare già completa
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) {
        window.clearTimeout(worksAnimationTimer);
        body.classList.remove("works-content-exit");
        body.classList.add("works-content-ready", "works-animation-complete");
      }
    });
  }

  /* ==========================================================================
     PAGINE PROGETTO (tesi.html e simili)
     ========================================================================== */

  // Dopo la prima schermata, i contenuti compaiono man mano che si scorre
  // (stessa comparsa anche in Chi sono: tutto ciò che sta sotto il testo principale)
  if (
    document.body.classList.contains("project-page") ||
    document.body.classList.contains("about-page")
  ) {
    const revealTargets = document.querySelectorAll(
      ".project-intro, .project-details, .project-gallery-row, .project-footer, .about-row, .about-footer",
    );

    if ("IntersectionObserver" in window && revealTargets.length > 0) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 },
      );

      revealTargets.forEach((target) => {
        target.classList.add("project-reveal");
        revealObserver.observe(target);
      });
    }
  }
});
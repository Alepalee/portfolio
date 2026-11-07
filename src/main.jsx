import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ShaderEffect } from "./lib/custom-effect-runtime/index";
import {
  manifest as portraitManifest,
  render as renderPortrait,
  setup as setupPortrait,
} from "./lib/custom-effects/CodeComponentId_384b08a4d3ccec60ef3bf0cdbd6ac388eef821dd_8350";
import "./landing.css";

const portraitShader = {
  setup: setupPortrait,
  render: renderPortrait,
  params: {
    offset: 0,
    gradient: {
      stops: [
        { position: 0.4375, color: { r: 0, g: 0, b: 0, a: 1 } },
        {
          position: 0.7740384340286255,
          color: { r: 0.5500000715255737, g: 1, b: 0, a: 1 },
        },
      ],
    },
    mixSpace: "sRGB",
    scatter: 0,
    repeatFrequency: 2,
    repeatType: "none",
  },
  manifest: portraitManifest,
};

function App() {
  return (
    <main className="landing-page" data-node-id="1:156">
      <div className="landing-canvas" data-node-id="1:157">
        <div className="designer-meta" data-node-id="1:158">
          <p data-node-id="1:160">Editorial designer</p>
          <p aria-hidden="true" data-node-id="1:162">
            —
          </p>
          <p className="graphic-role" data-node-id="1:165">
            Graphic designer
            <sup data-node-id="1:167">[...]</sup>
          </p>
        </div>

        <section className="landing-content" data-node-id="1:168">
          <nav className="primary-nav" aria-label="Navigazione principale">
            <a href="/chisono.html" data-node-id="1:172">
              About me
            </a>
            <a href="/lavori.html" data-node-id="1:174">
              Lavori
            </a>
          </nav>

          <header className="introduction" data-node-id="1:175">
            <h1>
              <span className="intro-line" data-node-id="1:177">
                <span data-node-id="1:178">Benvenuto!</span>
                <span data-node-id="1:179">Io sono</span>
              </span>
              <span className="name-line" data-node-id="1:180">
                <ShaderEffect
                  className="portrait-effect"
                  shaders={[portraitShader]}
                  data-node-id="1:182"
                >
                  <span className="portrait-frame">
                    <img
                      src="/assets/322f5.png"
                      alt=""
                      aria-hidden="true"
                    />
                  </span>
                </ShaderEffect>
                <span data-node-id="1:181">Alessio Palermo</span>
              </span>
            </h1>
          </header>
        </section>

        <footer data-node-id="1:183">
          <p data-node-id="1:185">Copyright 2026 — ©Alessio Palermo</p>
        </footer>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

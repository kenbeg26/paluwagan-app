// Footer.js
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css"; // make sure this is imported

export default function Footer() {
  return (
    <footer className="custom-footer">
      <div className="text-center py-4">
        {/* Copyright */}
        <p className="mb-1 footer-text">
          &copy; 2025 John Kenneth Begornia. All rights reserved.
        </p>

        {/* Social Media Links */}
        <div className="d-flex justify-content-center mb-3 gap-3">
          <a
            href="https://www.facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <img
              src="./footer/facebookicon.png"
              alt="Facebook"
              width="30"
              height="30"
              className="footer-icon"
            />
          </a>
          <a
            href="https://www.linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <img
              src="./footer/linkeinicon.jpg"
              alt="LinkedIn"
              width="30"
              height="30"
              className="footer-icon"
            />
          </a>
          <a
            href="https://github.com/kenbeg26"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <img
              src="./footer/githubicon.png"
              alt="GitHub"
              width="30"
              height="30"
              className="footer-icon"
            />
          </a>
          <a
            href="https://gitlab.com/kenbegornia2"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Gitlab"
          >
            <img
              src="./footer/gitlabicon.png"
              alt="Gitlab"
              width="30"
              height="30"
              className="footer-icon"
            />
          </a>

        </div>

        {/* Contact Info */}
        <p className="mb-0 footer-text">
          Email:{" "}
          <a
            href="mailto:kenbegornia2@gmail.com"
            className="footer-link"
          >
            kenbegornia2@gmail.com
          </a>
        </p>
      </div>
    </footer>
  );
}

"use strict";
const menu = document.querySelector(".menu");
const navigation = document.querySelector("#navigation");
const triggers = [...document.querySelectorAll(".nav-trigger")];
function closeDropdowns(except) {
  triggers.forEach((trigger) => {
    if (trigger === except) return;
    trigger.setAttribute("aria-expanded", "false");
    document.getElementById(trigger.getAttribute("aria-controls")).hidden =
      true;
  });
}
function closeNavigation() {
  closeDropdowns();
  menu?.setAttribute("aria-expanded", "false");
  navigation?.classList.remove("open");
}
menu?.addEventListener("click", () => {
  const opened = menu.getAttribute("aria-expanded") !== "true";
  closeDropdowns();
  menu.setAttribute("aria-expanded", String(opened));
  navigation.classList.toggle("open", opened);
});
triggers.forEach((trigger) =>
  trigger.addEventListener("click", () => {
    const opened = trigger.getAttribute("aria-expanded") !== "true";
    closeDropdowns(trigger);
    trigger.setAttribute("aria-expanded", String(opened));
    document.getElementById(trigger.getAttribute("aria-controls")).hidden =
      !opened;
  }),
);
document.addEventListener("click", (event) => {
  if (!event.target.closest(".header")) closeNavigation();
});
document.addEventListener("focusin", (event) => {
  if (!event.target.closest(".header")) closeDropdowns();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const opened = triggers.find(
    (trigger) => trigger.getAttribute("aria-expanded") === "true",
  );
  if (opened) {
    closeDropdowns();
    opened.focus();
  } else if (menu?.getAttribute("aria-expanded") === "true") {
    closeNavigation();
    menu.focus();
  }
});
navigation
  ?.querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeNavigation));
const route = location.pathname.replace(/\.html$/, "").replace(/\/$/, "");
if (/\/(reconciliation|profitability)$/.test(route))
  triggers[0]?.setAttribute("data-current", "true");
if (/\/help$/.test(route)) triggers[1]?.setAttribute("data-current", "true");
window
  .matchMedia("(max-width: 900px)")
  .addEventListener("change", closeNavigation);
document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    const dashboard = button.closest(".dashboard");
    dashboard
      .querySelectorAll("[data-view]")
      .forEach((tab) =>
        tab.setAttribute("aria-pressed", String(tab === button)),
      );
    dashboard.querySelector("#preview-profit").hidden =
      button.dataset.view !== "profit";
    dashboard.querySelector("#preview-payout").hidden =
      button.dataset.view !== "payout";
  });
});
const money = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});
const calculator = document.querySelector(".calculator");
if (calculator) {
  const update = () => {
    const price = Number(document.querySelector("#price").value);
    const cost = Number(document.querySelector("#cost").value);
    const ads = Number(document.querySelector("#ads").value);
    const contribution = price - cost - 8 - ads;
    ["price", "cost", "ads"].forEach((id) => {
      document.querySelector(`#${id}-label`).textContent =
        `£${document.querySelector(`#${id}`).value}`;
    });
    document.querySelector("#contribution").textContent =
      money.format(contribution);
    document.querySelector("#margin").textContent =
      `${((contribution / price) * 100).toFixed(1)}% contribution margin`;
    document.querySelector("#calc-equation").textContent =
      `£${price} − £${cost} − £8 − £${ads} = ${money.format(contribution)}`;
  };
  calculator
    .querySelectorAll("input")
    .forEach((input) => input.addEventListener("input", update));
  update();
}
const form = document.querySelector("#enquiry-form");
const formStatus = form?.querySelector("#form-status");
const submitButton = form?.querySelector('[type="submit"]');
const submitLabel = submitButton?.textContent;

function showFormStatus(message, state = "") {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.className = state ? `form-status ${state}` : "form-status";
}

if (form) {
  const contactState = new URLSearchParams(location.search).get("contact");
  if (contactState === "sent") {
    showFormStatus(
      "Thank you — your enquiry has been sent. We’ll reply by email.",
      "success",
    );
  } else if (contactState === "error") {
    showFormStatus(
      "We couldn’t send your enquiry. Please try again in a moment.",
      "error",
    );
  }
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  submitButton.disabled = true;
  submitButton.textContent = "Sending…";
  showFormStatus("Sending your enquiry…");

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok)
      throw new Error(result.message || "Unable to send your enquiry.");

    form.reset();
    showFormStatus(
      "Thank you — your enquiry has been sent. We’ll reply by email.",
      "success",
    );
  } catch (error) {
    showFormStatus(
      error.message ||
        "We couldn’t send your enquiry. Please try again in a moment.",
      "error",
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = submitLabel;
  }
});

const faqSearch = document.querySelector("#faq-search");
faqSearch?.addEventListener("input", () => {
  const query = faqSearch.value.trim().toLowerCase();
  const questions = [...document.querySelectorAll("#faq-answers details")];
  let visible = 0;
  questions.forEach((question) => {
    const matches = question.textContent.toLowerCase().includes(query);
    question.hidden = !matches;
    if (matches) visible++;
  });
  document.querySelector("#faq-count").textContent = visible
    ? `${visible} ${visible === 1 ? "answer" : "answers"}${query ? " found" : " available"}.`
    : "No matching answers. Try “channel”, “payout”, “cost” or “Xero”.";
});

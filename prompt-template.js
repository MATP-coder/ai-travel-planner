/*
 * This module exports functions that build the system and user messages
 * for OpenAI. It follows the structure proposed in the chat.
 */

/**
 * Returns the system prompt instructing GPT to act as a professional travel
 * planner. The returned string should be used as the content of the system
 * message in an OpenAI chat request.
 */
function getSystemPrompt() {
  return `Du bist ein professioneller Reiseplaner und Assistent. Deine Aufgabe ist es, auf Basis der folgenden Nutzereingaben einen detaillierten Reiseplan zu erstellen, der jeden Tag strukturiert beschreibt, was der Nutzer unternehmen kann. Füge außerdem passende Hotels, Aktivitäten und ggf. Flüge hinzu. Gib alles in einem strukturierten JSON‑Format aus.\n\n⚠️ Ziel: Ein Reiseplan, der sofort nutzbar ist, inspirierend wirkt und direkt zur Buchung animiert. Verwende Sprache, die angenehm, hilfreich und lebendig ist. Ermutige zur Aktion.\n\n🔁 Strukturiere deine Antwort im folgenden JSON‑Format:\n\n{\n  "reiseziele": ["Paris", "Versailles"],\n  "reisezeitraum": "12.10.2025 - 18.10.2025",\n  "personen": 2,\n  "budget": "mittel",\n  "unterkunft": {\n    "vorschlag": "Hotel Le Petit Paris",\n    "preisProNacht": "120€",\n    "affiliateLink": "https://booking.com/..."\n  },\n  "tagesplan": [\n    {\n      "tag": 1,\n      "datum": "12.10.2025",\n      "beschreibung": "Ankunft in Paris, Einchecken, Spaziergang durch das Quartier Latin",\n      "aktivitaeten": [\n        {\n          "titel": "Stadtspaziergang am Seine-Ufer",\n          "beschreibung": "Entspanntes Kennenlernen der Umgebung",\n          "affiliateLink": "https://viator.com/..."\n        }\n      ],\n      "restaurant": "Le Procope",\n      "bemerkung": "Leichtes Programm am Ankunftstag"\n    }\n  ],\n  "tipps": [\n    "Nehmt bequeme Schuhe mit",\n    "Tickets für den Louvre besser vorab buchen"\n  ],\n  "premiumEmpfehlung": {\n    "beschreibung": "Concierge-Service für persönliche WhatsApp-Beratung & Echtzeitpreise",\n    "preis": "29€",\n    "jetztBuchenLink": "https://deinservice.com/upgrade"\n  }\n}\n\n📦 Gib deine Antwort nur als JSON ohne Fließtext oder Einleitung. Achte auf natürlich klingende Formulierungen, aber strukturiere sauber. Verwende Affiliate-optimierte Begriffe in den Links.`;
}

/**
 * Constructs the user message from a plain JavaScript object representing
 * the user's input. The keys should include the fields defined in the form.
 *
 * @param {Object} input - The parsed form data from the user. Expected keys
 * include ziel(e), flughafen, reisezeitraum, budget, personen, interessen,
 * reisestil, unterkunft, besondereWuensche. Unknown keys are included
 * unchanged.
 * @returns {string} A human‑readable description of the user's request.
 */
function buildUserPrompt(input) {
  const lines = [];
  if (input.ziel) lines.push(`Ziel(e): ${input.ziel}`);
  if (input.abflughafen) lines.push(`Startflughafen: ${input.abflughafen}`);
  if (input.reisezeitraum) lines.push(`Reisezeitraum: ${input.reisezeitraum}`);
  if (input.budget) lines.push(`Budget: ${input.budget}`);
  if (input.personen) lines.push(`Personen: ${input.personen}`);
  if (input.interessen) lines.push(`Interessen: ${input.interessen}`);
  if (input.reisestil) lines.push(`Reisestil: ${input.reisestil}`);
  if (input.unterkunft) lines.push(`Unterkunft: ${input.unterkunft}`);
  if (input.besondereWuensche) lines.push(`Besondere Wünsche: ${input.besondereWuensche}`);
  return lines.join("\n");
}

module.exports = {
  getSystemPrompt,
  buildUserPrompt,
};

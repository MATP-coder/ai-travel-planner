const schema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Reiseplan',
  type: 'object',
  required: ['reiseziele', 'reisezeitraum', 'personen', 'budget', 'unterkunft', 'tagesplan'],
  properties: {
    reiseziele: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
    },
    reisezeitraum: {
      type: 'string',
      pattern: '^\\d{2}\\.\\d{2}\\.\\d{4} - \\d{2}\\.\\d{2}\\.\\d{4}$',
    },
    personen: {
      type: 'integer',
      minimum: 1,
    },
    budget: {
      type: 'string',
      enum: ['niedrig', 'mittel', 'hoch', 'luxus'],
    },
    unterkunft: {
      type: 'object',
      required: ['vorschlag', 'preisProNacht', 'affiliateLink'],
      properties: {
        vorschlag: { type: 'string' },
        preisProNacht: { type: 'string' },
        affiliateLink: { type: 'string', format: 'uri' },
      },
    },
    tagesplan: {
      type: 'array',
      items: {
        type: 'object',
        required: ['tag', 'datum', 'beschreibung', 'aktivitaeten'],
        properties: {
          tag: { type: 'integer' },
          datum: {
            type: 'string',
            pattern: '^\\d{2}\\.\\d{2}\\.\\d{4}$',
          },
          beschreibung: { type: 'string' },
          aktivitaeten: {
            type: 'array',
            items: {
              type: 'object',
              required: ['titel', 'beschreibung'],
              properties: {
                titel: { type: 'string' },
                beschreibung: { type: 'string' },
                affiliateLink: { type: 'string', format: 'uri' },
              },
            },
          },
          restaurant: { type: 'string' },
          bemerkung: { type: 'string' },
        },
      },
    },
    tipps: {
      type: 'array',
      items: { type: 'string' },
    },
    premiumEmpfehlung: {
      type: 'object',
      required: ['beschreibung', 'preis', 'jetztBuchenLink'],
      properties: {
        beschreibung: { type: 'string' },
        preis: { type: 'string' },
        jetztBuchenLink: { type: 'string', format: 'uri' },
      },
    },
  },
};

module.exports = schema;

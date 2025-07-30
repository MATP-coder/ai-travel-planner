/*
 * Minimal Express server implementing the core logic of the AI travel planner.
 * This code is provided as a starting point. It illustrates how to
 * orchestrate GPT requests, validate the response, enrich it with
 * affiliate links, send emails and log data for analytics. You still need
 * to configure real credentials and endpoints before going to production.
 */

const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const Ajv = require('ajv');
const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const schema = require('./schemas');
const { getSystemPrompt, buildUserPrompt } = require('./prompt-template');

// Load environment variables
dotenv.config({ path: require('path').join(__dirname, '.env') });

const app = express();
app.use(bodyParser.json());
// Serve static files from the public directory to provide a simple UI for testing
app.use(express.static(require('path').join(__dirname, 'public')));

// Initialise Ajv validator
const ajv = new Ajv({ allErrors: true, strict: false });
const validatePlan = ajv.compile(schema);

// Create Supabase client (optional, if you configure credentials)
let supabase;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
} else {
  console.warn('Supabase credentials not provided. Plans will not be persisted to DB.');
}

// Create OpenAI client (if API key set). When no key is present,
// a dummy generator will be used instead.
let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else {
  console.warn('OpenAI API key not set. Using dummy travel plan generator.');
}

/**
 * Dummy travel plan used when no OpenAI API key is configured. This
 * function returns a simple plan consistent with the JSON schema for
 * demonstration purposes.
 */
function generateDummyPlan(userInput) {
  // simple static plan for demonstration
  return {
    reiseziele: userInput.ziel ? [userInput.ziel] : ['Paris'],
    reisezeitraum: userInput.reisezeitraum || '01.01.2026 - 05.01.2026',
    personen: parseInt(userInput.personen || '2', 10),
    budget: userInput.budget || 'mittel',
    unterkunft: {
      vorschlag: 'Hotel Demo',
      preisProNacht: '100€',
      affiliateLink: 'https://booking.com/demo',
    },
    tagesplan: [
      {
        tag: 1,
        datum: userInput.reisezeitraum ? userInput.reisezeitraum.split(' - ')[0] : '01.01.2026',
        beschreibung: 'Ankunft und erster Spaziergang durch die Stadt.',
        aktivitaeten: [
          {
            titel: 'Stadtbesichtigung',
            beschreibung: 'Erkunden Sie die Altstadt und genießen Sie lokale Spezialitäten.',
            affiliateLink: 'https://viator.com/demo-tour',
          },
        ],
        restaurant: 'Demo Restaurant',
        bemerkung: 'Leichtes Programm am Ankunftstag.',
      },
    ],
    tipps: ['Vergessen Sie bequeme Schuhe nicht.'],
    premiumEmpfehlung: {
      beschreibung: 'Concierge-Service für persönliche Beratung & Echtzeitpreise',
      preis: '29€',
      jetztBuchenLink: 'https://deinservice.com/upgrade',
    },
  };
}

/**
 * Helper to call OpenAI and return the parsed JSON plan. Throws an error on
 * failure or invalid JSON.
 *
 * @param {Object} userInput Form data provided by the user
 */
async function generatePlanWithOpenAI(userInput) {
  const messages = [
    { role: 'system', content: getSystemPrompt() },
    { role: 'user', content: buildUserPrompt(userInput) },
  ];
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages,
    temperature: 0.7,
    max_tokens: 3000,
  });
  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI returned no content');
  }
  try {
    return JSON.parse(content);
  } catch (err) {
    throw new Error('Failed to parse OpenAI output as JSON: ' + err.message);
  }
}

/**
 * Stub for affiliate link enrichment. In production you would query
 * booking/flight/activity APIs here to get real affiliate URLs. This
 * function simply returns the plan unmodified and logs actions.
 *
 * @param {Object} plan The travel plan returned by GPT
 */
async function enrichWithAffiliateLinks(plan) {
  // In a real implementation, you might call external APIs here.
  // Example: plan.unterkunft.vorschlag -> search Booking.com; plan.reiseziele -> search activities
  // For demonstration we simply add a dummy parameter to indicate enrichment.
  plan.enriched = true;
  return plan;
}

/**
 * Endpoint: generate a new travel plan. Accepts JSON body with user inputs.
 */
app.post('/api/plan', async (req, res) => {
  const userInput = req.body;
  try {
    // Step 1: call GPT or dummy generator
    let plan;
    if (openai) {
      plan = await generatePlanWithOpenAI(userInput);
    } else {
      plan = generateDummyPlan(userInput);
    }
    // Step 2: validate JSON
    const valid = validatePlan(plan);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid travel plan', details: validatePlan.errors });
    }
    // Step 3: enrich with affiliate links
    plan = await enrichWithAffiliateLinks(plan);
    // Step 4: persist to database (optional)
    if (supabase) {
      const { error } = await supabase.from('plans').insert({ input: userInput, plan });
      if (error) console.error('Supabase insert error:', error);
    }
    // Step 5: return plan to caller
    res.json(plan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AI travel planner server listening on port ${PORT}`);
});

// Mock AI assistant backend. `streamChatReply` mimics a streaming LLM endpoint:
// a short "thinking" pause, then the answer arrives a few words at a time.
// Swap the body for a real fetch + ReadableStream reader later — the chat UI
// only depends on the async-iterator contract (yields text chunks, honours
// `signal` for Stop).

const KNOWLEDGE = [
  {
    keys: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'namaste'],
    reply: `Hello! 👋 I'm **SafeNex AI**, your EHS assistant.

I can help you with:
- **Safety procedures** — PPE, forklift, hoist, fire safety
- **Reporting** — incidents, observations, violations
- **Audits & training** — schedules, checklists, compliance

What would you like to know?`,
  },
  {
    keys: ['ppe', 'helmet', 'glove', 'goggle', 'shoe', 'vest', 'protective'],
    reply: `Here are the **mandatory PPE requirements** on the shop floor:

- **Safety helmet** — in all production and material-handling zones
- **Safety shoes** (steel toe) — at all times inside the plant
- **High-visibility vest** — near forklift and crane movement areas
- **Safety goggles** — during grinding, cutting or chemical handling
- **Cut-resistant gloves** — when handling sheet metal or slings

Inspect your PPE before every shift and replace damaged items through your supervisor. Missing PPE should be logged as a **Safety Observation**.`,
  },
  {
    keys: ['forklift', 'fork lift', 'reach truck', 'stacker'],
    reply: `**Forklift pre-use checklist** (complete before every shift):

1. Check tyres, forks and mast chains for damage or wear
2. Test brakes, horn, lights and reverse alarm
3. Verify hydraulic oil, fuel / battery level and no leaks
4. Confirm the seat belt and overhead guard are intact
5. Ensure the operator carries a **valid licence**

If any item fails, tag the forklift **"Out of Service"** and raise it in the **Forklift Audit** module. Never exceed the rated load capacity.`,
  },
  {
    keys: ['incident', 'accident', 'injury', 'injured', 'near miss', 'nearmiss'],
    reply: `To **report an incident** quickly:

1. Make the area safe and give **first aid** if needed
2. Inform your supervisor and the EHS team immediately
3. Open **Incident Report** from the portal and fill in what, where and when
4. Attach photos of the scene and the names of any witnesses
5. Submit — the EHS officer will start the **root-cause investigation**

Near misses matter too: reporting them early is how we stay on track for **Zero Accident**.`,
  },
  {
    keys: ['fire', 'extinguisher', 'evacuation', 'emergency', 'alarm', 'smoke'],
    reply: `In a **fire emergency**, remember **R.A.C.E.**:

- **R**escue anyone in immediate danger
- **A**larm — raise the fire alarm and call the emergency number
- **C**onfine — close doors to slow the spread
- **E**xtinguish or **E**vacuate — only fight small fires if trained

For extinguishers use **P.A.S.S.**: Pull the pin, Aim at the base, Squeeze the handle, Sweep side to side. Assemble at the designated **assembly point** and wait for the headcount.`,
  },
  {
    keys: ['first aid', 'firstaid', 'fastaid', 'cut', 'burn', 'bleeding'],
    reply: `**Basic first-aid steps:**

- **Minor cuts** — clean with water, apply antiseptic and a sterile dressing
- **Burns** — cool under running water for **at least 10 minutes**; don't apply ice or creams
- **Bleeding** — apply firm direct pressure with a clean cloth and elevate the limb
- **Eye contact with chemicals** — flush at the eye-wash station for 15 minutes

Every first-aid case must be recorded in the **FastAid** module so the medical team can follow up.`,
  },
  {
    keys: ['hoist', 'crane', 'lifting', 'sling', 'web sling', 'websling', 'rigging'],
    reply: `**Safe lifting checklist** for hoists and web slings:

- Check the **SWL tag** — never exceed the safe working load
- Inspect slings for cuts, burns, knots or broken stitching
- Confirm hooks have working **safety latches**
- Keep everyone clear of the **load path** — never walk under a suspended load
- Use a tag line to control swinging loads

Damaged slings must be removed from use immediately and logged in the **Web Sling** or **Hoist** audit.`,
  },
  {
    keys: ['training', 'induction', 'course', 'certificate', 'skill'],
    reply: `Your **training records** live in the **Training** module. There you can:

- View upcoming sessions and your **attendance history**
- Check which certifications are **due for renewal**
- Download completed training certificates

Today's scheduled sessions also show up in **Today's Audit & Training Plan** at the start of each shift.`,
  },
  {
    keys: ['audit', 'gemba', 'inspection', 'checklist', 'machine'],
    reply: `Audits are organised by module in the portal:

- **Gemba Walk** — floor walks with on-the-spot findings
- **Machine Audit** — guarding, interlocks, LOTO points
- **Forklift / Hoist / Web Sling** — equipment-specific checklists
- **Fire Safety** — extinguishers, hydrants and exit routes

Open **Today's Plan** from the header to see what's assigned to your shift. Findings automatically create follow-up actions with owners and due dates.`,
  },
  {
    keys: ['observation', 'violation', 'unsafe', 'hazard', 'unsafe act', 'unsafe condition'],
    reply: `Spotted something unsafe? Here's how to log it:

- **Safety Observation** — unsafe *conditions* or good practices (e.g. oil spill, blocked exit)
- **Safety Violation** — unsafe *acts* against a rule (e.g. no helmet, bypassing a guard)

Add a photo, the location and the severity. The responsible area owner is notified and must close the action within the **target date**.`,
  },
  {
    keys: ['moc', 'management of change', 'change request'],
    reply: `**Management of Change (MOC)** is required before modifying any process, equipment, material or layout.

1. Raise an MOC request describing the change and its reason
2. Complete the **hazard / risk assessment**
3. Get approvals from EHS, maintenance and production
4. Implement, train affected people, then close the MOC

Unapproved changes are one of the top causes of serious incidents — when in doubt, raise an MOC.`,
  },
  {
    keys: ['loto', 'lockout', 'lock out', 'tagout', 'isolation', 'energy'],
    reply: `**Lockout / Tagout (LOTO)** steps:

1. Notify affected employees
2. Shut down the machine using normal controls
3. **Isolate** all energy sources — electrical, pneumatic, hydraulic
4. Apply your **personal lock and tag**
5. Release stored energy and **verify zero energy** by trying to start it

Only the person who applied a lock may remove it.`,
  },
  {
    keys: ['thank', 'thanks', 'great', 'awesome', 'helpful'],
    reply: `You're welcome! 😊 Stay safe out there — **Zero Accident** starts with each of us.

Is there anything else I can help you with?`,
  },
];

const FALLBACK = `I'm not completely sure about that one, but here's what I can help with:

- **PPE** and safety procedures
- **Incident**, observation and violation reporting
- **Forklift, hoist, web sling** and fire safety
- **Audits, training** and Management of Change

Try asking something like *"What is the forklift checklist?"* or *"How do I report an incident?"*`;

export const SUGGESTED_PROMPTS = [
  'What PPE is mandatory?',
  'How do I report an incident?',
  'Forklift pre-use checklist',
  'Fire emergency steps',
];

function pickReply(message) {
  const text = message.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const entry of KNOWLEDGE) {
    const score = entry.keys.filter((k) => text.includes(k)).length;
    if (score > bestScore) {
      best = entry;
      bestScore = score;
    }
  }
  return best ? best.reply : FALLBACK;
}

const rand = (min, max) => min + Math.random() * (max - min);

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    }
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

// Yields the reply in small word-ish chunks (keeping whitespace attached) with
// jittered delays so it reads like a model generating tokens.
export async function* streamChatReply(message, { signal } = {}) {
  await wait(rand(700, 1400), signal); // "thinking" latency before the first token

  const tokens = pickReply(message).match(/\S+\s*|\s+/g) || [];
  for (let i = 0; i < tokens.length;) {
    const size = Math.ceil(rand(0, 3));
    yield tokens.slice(i, i + size).join('');
    i += size;
    await wait(rand(25, 80), signal);
  }
}

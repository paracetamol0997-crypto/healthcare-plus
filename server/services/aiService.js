// AI Service for Health Companion AI
// Enforces strict health & wellness guardrails, supports Gemini API,
// and features an intelligent contextual wellness engine.

const REDIRECT_MESSAGE = "I am designed to help with mental wellness and physical health. How can I support your wellness journey today?";

// Topics considered strictly unrelated to Mental/Physical Health
const UNRELATED_PATTERNS = [
  // Coding & Technology
  /\b(code|coding|javascript|python|typescript|react|html|css|sql|git|bug|function|compile|debugger|algorithm|api endpoint|backend|frontend|linux|bash|powershell|regex|serverless|docker|kubernetes|aws|database query)\b/i,
  // Politics & Government
  /\b(politics|politician|election|president|prime minister|democrat|republican|parliament|congress|senate|campaign|geopolitics|voting|war in|treaty|government policy|bill passing)\b/i,
  // Finance & Crypto
  /\b(crypto|bitcoin|ethereum|stock market|forex|investing|wall street|shares|dividend|trading|nasdaq|crypto coin|dogecoin|binance|banking account|mortgage|credit score)\b/i,
  // Entertainment & Celebrities
  /\b(movie|cinema|hollywood|bollywood|netflix|box office|celebrity gossip|actor|actress|pop singer|album release|oscars|grammys|marvel|dc comics|batman|disney)\b/i,
  // Gaming & Vehicles
  /\b(car repair|engine oil|mechanic|video game|fortnite|minecraft|playstation|xbox|nintendo|steam key|gta|esports|gaming console)\b/i,
  // Homework & Academic trivia
  /\b(homework|write an essay on|solve this math|who invented|capital of|derivative of|integrate|history of ancient|physics problem|chemistry equation)\b/i,
  // Unnecessary small talk & casual chit-chat with no health context
  /\b(tell me a joke|tell a joke|make me laugh|knock knock|riddle|funny story|write a poem about dragons|write a song|write a story|write a rap|what is your favorite movie|who is your crush|will you marry me|are you single)\b/i,
  // Random trivia questions
  /^(who is the best (footballer|cricketer|actor|singer|player|president)|who won the|what is the price of|how to cook (biryani|pizza|burger|pasta|cake)|how to build a|how to fix my computer|where is|tell me about)\b/i
];

// Legitimate health & wellness keywords
const HEALTH_PATTERNS = [
  /\b(health|wellness|mental|physical|stress|anxiety|anxious|depress|depression|sad|panic|breathe|breathing|sleep|insomnia|rest|tired|fatigue|burnout|mood|mindful|meditat|meditation|calm|peace|relax|relaxation|emotion|feel|feeling|crying|lonely|overwhelm|grief|heartbroken|trauma)\b/i,
  /\b(fit|fitness|workout|exercise|walk|walking|run|running|jog|jogging|gym|stretch|stretching|yoga|weights|muscle|cardio|core|abs|squat|pushup|pullup|hiit|calories|steps|stamina|endurance)\b/i,
  /\b(nutrition|diet|food|eat|eating|meal|water|hydration|hydrate|protein|carbs|vitamins|weight|fat loss|gain weight|bmi|posture|back pain|neck pain|headache|migraine|sore|stiff|heart rate|metabolism)\b/i,
  /\b(doctor|physician|symptom|fever|cough|cold|recovery|healing|injury|blood pressure|glucose|hypertension|vital|checkup|sprain|aches)\b/i,
  /\b(habit|routine|morning routine|evening routine|self-care|affirmation|journal|gratitude|motivation|mindset|focus|clarity)\b/i
];

function isHealthRelated(message) {
  if (!message || typeof message !== 'string') return false;
  const cleanMsg = message.trim();
  if (cleanMsg.length === 0) return true;

  const lower = cleanMsg.toLowerCase();

  // 1. Check for polite short wellness check-in / greeting or bot capability question
  if (/^(hello|hi|hey|good morning|good evening|good afternoon|greetings|help me with my health|i need health advice|thank you|thanks)[.!?]*$/i.test(cleanMsg)) {
    return true;
  }
  if (/^(what can you do|how can you help|what do you do|help me|what are your features|what can i ask you)[.?]?$/i.test(cleanMsg)) {
    return true;
  }

  // 2. Check explicitly banned non-health patterns
  for (const pattern of UNRELATED_PATTERNS) {
    if (pattern.test(cleanMsg)) {
      // Check if user is connecting it to a legitimate health problem (e.g. "coding causes neck pain")
      const hasHealthContext = /\b(pain|stress|fatigue|eyes|hurt|ergonomic|posture|burnout|anxiety|sleep insomnia|injury|wrist|headache)\b/i.test(cleanMsg);
      if (!hasHealthContext) {
        return false;
      }
    }
  }

  // 3. Check for presence of health terms
  for (const pattern of HEALTH_PATTERNS) {
    if (pattern.test(cleanMsg)) {
      return true;
    }
  }

  // 4. If query is a general knowledge question or non-health request, block it
  if (/^(what is|what are|who is|who are|who was|how to|where is|where are|when was|when is|why is|why are|can you tell me|can you write|can you explain|tell me about)\b/i.test(cleanMsg)) {
    return false;
  }

  // 5. Short random messages that lack any health intent ("cool", "nice", "ok", "test", "asdf")
  if (cleanMsg.split(/\s+/).length < 2 && !HEALTH_PATTERNS.some(p => p.test(cleanMsg))) {
    return false;
  }

  return false;
}

function getSystemPrompt(companionType, userProfile = {}) {
  const userName = userProfile.name ? userProfile.name.trim() : 'Friend';
  const age = userProfile.age ? `${userProfile.age} years old` : '';
  const height = userProfile.heightCm ? `${userProfile.heightCm} cm` : '';
  const weight = userProfile.weightKg ? `${userProfile.weightKg} kg` : '';
  const fitGoals = userProfile.fitnessGoals || 'General fitness, stamina, and daily movement';
  const mentalGoals = userProfile.mentalWellnessGoals || 'Stress balance, peaceful mindset, and restful sleep';

  const userContext = `
USER PROFILE:
- Name: ${userName}
${age ? `- Age: ${age}` : ''}
${height ? `- Height: ${height}` : ''}
${weight ? `- Weight: ${weight}` : ''}
- Fitness Goals: ${fitGoals}
- Mental Wellness Goals: ${mentalGoals}
`;

  const commonGuardrail = `
STRICT SAFETY & SCOPE GUARDRAILS:
1. You are STRICTLY a wellness, fitness, and mental health companion.
2. You MUST ONLY discuss physical health, workouts, exercise plans, nutrition, hydration, sleep, stress management, anxiety relief, emotional well-being, and healthy lifestyle habits.
3. If the user asks about ANYTHING ELSE (coding, tech, politics, finance, movies, jokes, homework, celebrity gossip, gaming, or unnecessary non-health chatter), you MUST POLITELY DECLINE with EXACTLY:
"${REDIRECT_MESSAGE}"
4. Do NOT answer off-topic questions under any circumstances.
5. Provide high quality, empathetic, and beautifully structured responses with bullet points, practical actionable steps, and encouraging warmth.
6. Clearly state when appropriate that you are an AI wellness companion and encourage professional medical consultation for serious health conditions or emergencies.`;

  if (companionType === 'mind') {
    return `You are "Mind Companion AI", a warm, empathetic, and evidence-informed mental health and emotional well-being mentor.
${userContext}
${commonGuardrail}
SPECIALTY INSTRUCTIONS:
- Offer compassionate listening, emotional validation, cognitive grounding (e.g. 5-4-3-2-1), guided breathing protocols, and sleep hygiene practices.
- Use a calm, reassuring, and gentle voice. Break explanations into digestible, bite-sized steps.`;
  }

  if (companionType === 'fit') {
    return `You are "Fit Companion AI", an energetic, encouraging, and knowledgeable physical fitness coach and nutrition guide.
${userContext}
${commonGuardrail}
SPECIALTY INSTRUCTIONS:
- Deliver customized workout plans, daily step encouragement, posture correction, injury prevention tips, hydration targets, and clean plate nutrition frameworks.
- Use an enthusiastic, supportive, and motivating tone. Focus on realistic progress.`;
  }

  return `You are "Health Companion AI", a trusted, comprehensive personal health sanctuary combining the care of a family doctor, the mindfulness of a wellness mentor, and the encouragement of a fitness trainer.
${userContext}
${commonGuardrail}`;
}

// Fallback response generator when Gemini API key is absent or offline
function generateLocalResponse(companionType, message, userProfile = {}) {
  const userName = userProfile.name ? userProfile.name.trim() : 'Friend';
  const lower = (message || '').toLowerCase();

  // Guardrail check
  if (!isHealthRelated(message)) {
    return REDIRECT_MESSAGE;
  }

  // Capability questions
  if (/^(what can you do|how can you help|what do you do|help me|what are your features|what can i ask you)/i.test(lower)) {
    return `I am your **Health Companion AI**, dedicated exclusively to your mental and physical wellness, ${userName}! 🌿💪

Here is how I can support you:
1. **Mental Wellness (Mind Companion):**
   - Stress and anxiety reduction techniques (4-4-4-4 Box Breathing, 5-4-3-2-1 Grounding)
   - Sleep hygiene protocols and evening relaxation routines
   - Emotional validation, mindfulness, and gratitude journaling
2. **Physical Health (Fit Companion):**
   - Tailored workout programs and bodyweight foundation routines
   - Daily step motivation, distance pacing, and movement snacks
   - Clean Plate nutrition frameworks and hydration targets
   - Desk posture resets and mobility stretches

How would you like to begin your wellness journey today?`;
  }

  // Greeting
  if (/^(hi|hello|hey|good morning|good evening|good afternoon|greetings)/i.test(lower)) {
    if (companionType === 'mind') {
      return `Hello ${userName}! 🌿 I'm your Mind Companion AI. I'm here to support your mental well-being, guide calming breathing exercises, and listen without judgment whenever you need space to reflect.

How is your emotional landscape feeling today? You can share what's on your mind, or we can do a quick 2-minute stress release together.`;
    } else if (companionType === 'fit') {
      return `Hey ${userName}! 💪 I'm your Fit Companion AI. Ready to energize your body today?

Whether you're looking for a beginner workout plan, want to hit your daily steps, or need healthy nutrition ideas, what fitness goal are we tackling right now?`;
    } else {
      return `Welcome ${userName}! 🌟 I'm your Health Companion AI, combining the care of a family doctor, fitness trainer, and wellness mentor.

How can I support your physical vitality and peace of mind today?`;
    }
  }

  // Stress / Anxiety / Overwhelm / Panic
  if (lower.includes('stress') || lower.includes('anxious') || lower.includes('anxiety') || lower.includes('overwhelm') || lower.includes('panic') || lower.includes('nervous') || lower.includes('burnout')) {
    return `I hear you, ${userName}, and I'm really glad you reached out. Feeling stressed or overwhelmed is completely valid, and you don't have to carry it all at once.

Here is an immediate **3-Step Nervous System Reset** you can do right now:

1. **The 4-4-4-4 Box Breath:**
   - Inhale gently through your nose for 4 counts.
   - Hold gently with relaxed shoulders for 4 counts.
   - Exhale smoothly through your mouth for 4 counts.
   - Rest in stillness for 4 counts.
   *(Doing just 3 cycles signals your vagus nerve to reduce cortisol immediately).*

2. **5-4-3-2-1 Sensory Grounding:**
   - Name **5** things you can see around you.
   - Touch **4** different textures (your clothes, desk, a pen).
   - Listen for **3** distinct sounds in the room.
   - Notice **2** scents.
   - State **1** kind truth about yourself.

3. **Physical De-tensioning:**
   - Unclench your jaw, drop your shoulders away from your ears, and soften your stomach.

Would you like to try our visual breathing sphere in the Mind Companion tab, or talk through what is causing this stress? Take it one breath at a time.`;
  }

  // Sleep / Insomnia / Night Routine
  if (lower.includes('sleep') || lower.includes('insomnia') || lower.includes('tired') || lower.includes('night') || lower.includes('wake up') || lower.includes('bedtime')) {
    return `Restful sleep is the foundation of cognitive clarity, emotional resilience, and cellular repair, ${userName}. 🌙

Here is an evidence-based **Restorative Sleep Protocol** for tonight:

- **The 45-Minute Digital Sunset:** Turn off bright blue screens 45 minutes before bed. Blue light halts melatonin synthesis.
- **Cool Temperature:** Keep your bedroom at approximately 18–20°C (65–68°F). A drop in core body temperature is what signals deep REM sleep.
- **Mental Brain Dump:** Write down any unfinished worries or tomorrow's to-dos in our Journal tab before bed. Once written down, your brain permits itself to let go.
- **The 4-7-8 Breathing Technique:** Inhale through your nose for 4 seconds, hold for 7 seconds, and exhale with a gentle whoosh for 8 seconds.

How many hours did you rest last night? We can tailor an evening wind-down routine that fits your schedule!`;
  }

  // Workouts / Gym / Strength / Beginner routine
  if (lower.includes('gym') || lower.includes('workout') || lower.includes('exercise') || lower.includes('beginner') || lower.includes('routine') || lower.includes('muscle') || lower.includes('strength')) {
    return `Building consistent physical activity is the single best investment in your long-term energy and metabolic health, ${userName}! 💪

Here is a balanced **Full-Body Foundation Routine** designed for steady strength and joint safety:

**1. Warm-Up (3–5 minutes):**
- Arm circles & shoulder rolls: 30 seconds
- Cat-Cow spinal mobility: 10 slow reps
- Bodyweight hip openers & air squats: 10 reps

**2. Main Movement Circuit (2 to 3 sets):**
- **Chair or Bodyweight Squats:** 10–12 reps *(strengthens quads, glutes, and core)*
- **Incline Push-ups (against a wall, bench, or floor):** 8–10 reps *(chest, triceps, and shoulders)*
- **Glute Bridges:** 12 reps *(activates posterior chain and protects lower back)*
- **Plank Hold:** 20–30 seconds *(deep core stability and spinal alignment)*

**3. Cool-Down & Stretch (3 minutes):**
- Hamstring stretch: 30 seconds each leg
- Doorway chest opener: 30 seconds
- Child's pose with deep belly breathing.

Remember to sip water throughout. You can log this session in your **Workout Tracker** on the Physical Health page to record your active minutes!`;
  }

  // Walking / Steps / 10k steps
  if (lower.includes('step') || lower.includes('walk') || lower.includes('walking') || lower.includes('10000') || lower.includes('10,000') || lower.includes('run') || lower.includes('running')) {
    return `Daily walking is one of the most effective, accessible forms of preventative health for both body and mind, ${userName}! 🚶‍♂️

- **Cardiovascular Health:** Brisk walking increases VO2 max, enhances capillary density, and gently lowers resting blood pressure.
- **Blood Sugar Regulation:** Taking a 10-minute walk after lunch or dinner blunts postprandial glucose spikes by up to 30%.
- **Mental Stress Relief:** Walking in natural light triggers dopamine and releases serotonin, clearing mental fog.
- **Easy Habit Stack:** Break 10,000 steps into three small chunks—a 15-minute morning walk, a 15-minute midday stroll, and an evening cooldown.

Check your **Daily Steps** progress on your dashboard right now to see how close you are to today's target!`;
  }

  // Water / Hydration
  if (lower.includes('water') || lower.includes('hydrat') || lower.includes('drink') || lower.includes('thirst')) {
    return `Hydration is essential for cognitive alertness, joint lubrication, waste elimination, and vibrant energy, ${userName}! 💧

**Daily Hydration Guidelines:**
- **Baseline Target:** Aim for approximately **2.5 to 3 liters** (roughly 8 to 10 glasses) of pure water daily.
- **Morning Kickstart:** Drink a full 500ml glass of room-temperature water upon waking before caffeine to rehydrate organs after sleep.
- **Exercise Compensation:** Add 250–500ml of water plus a pinch of electrolytes for every 30 minutes of vigorous sweat.
- **Track It:** Keep a glass or reusable bottle within arm's reach.

You can record your glasses in real-time using the interactive **Water Tracker** on your Physical Health page!`;
  }

  // Nutrition / Food / Diet / Weight Loss
  if (lower.includes('nutrition') || lower.includes('diet') || lower.includes('food') || lower.includes('protein') || lower.includes('meal') || lower.includes('eat') || lower.includes('weight loss') || lower.includes('fat loss') || lower.includes('calorie')) {
    return `Nutritious eating is about nourishing your cells and honoring your energy, not restrictive deprivation, ${userName}. 🥗

Here is the **Clean Plate Framework** for sustained metabolic energy and satiety:

1. **50% Colorful Greens & Vegetables:**
   - Spinach, broccoli, peppers, cucumbers, and carrots for fiber, micronutrients, and gut microbiome diversity.
2. **25% High-Quality Protein:**
   - Eggs, chicken breast, tofu, lentils, Greek yogurt, or wild fish to repair muscle fibers and regulate hunger hormones (leptin and ghrelin).
3. **25% Smart Complex Carbohydrates:**
   - Quinoa, brown rice, sweet potatoes, or rolled oats for steady, slow-releasing glucose.
4. **1–2 Thumb-Sizes of Healthy Fats:**
   - Extra virgin olive oil, avocado, walnuts, or chia seeds for hormone balance and brain health.

Are you looking for meal prep ideas for breakfast, clean lunch options, or a wholesome post-workout snack?`;
  }

  // Posture / Desk work / Pain / Ergonomics
  if (lower.includes('posture') || lower.includes('desk') || lower.includes('back pain') || lower.includes('neck pain') || lower.includes('sitting') || lower.includes('wrist') || lower.includes('shoulder')) {
    return `Sedentary desk work places immense continuous strain on the cervical and lumbar spine, ${userName}. 🧘

Here is a quick **2-Minute Desk Reset** you can do right in your chair:

1. **Chin Tucks:** Gently slide your chin straight back as if making a double chin. Hold for 5 seconds; repeat 8 times to reset forward-head posture.
2. **Doorway / Corner Pec Stretch:** Stand in an open doorway, rest forearms on the frame, and step forward gently until you feel a comfortable chest opening. Hold for 30 seconds.
3. **Seated Spinal Twist:** Sit upright, place your right hand on your left knee, inhale tall, and exhale gently twisting to the left for 3 deep breaths. Repeat on the right side.
4. **Ergonomic Tip:** Ensure the top third of your monitor is aligned with eye level and your feet rest flat on the floor.

You can find the full guided routine under **Guided Exercise Plans** in the Physical Health section!`;
  }

  // General Wellness Query
  if (companionType === 'fit') {
    return `That's a wonderful health question, ${userName}! In physical training, consistency always outperforms intensity. Small daily habits—like hitting 8,000+ steps, drinking adequate water, and doing 20 minutes of functional movement—create compounding vitality over months and years.

What specific physical area would you like to focus on right now: workout routines, nutrition planning, or recovery stretching?`;
  } else {
    return `Thank you for checking in with me, ${userName}. Honoring your mental and physical health is a wonderful act of daily self-care.

Take a slow, intentional breath right now. Drop your shoulders, relax your jaw, and give yourself credit for showing up today.

How can I best support your wellness journey in this moment?`;
  }
}

// Call Google Gemini API if key is present, otherwise fallback to local response
async function generateAiResponse(companionType, message, userProfile = {}, chatHistory = [], apiKey = null) {
  // Step 1: Strict Guardrail check
  if (!isHealthRelated(message)) {
    return {
      content: REDIRECT_MESSAGE,
      guardrailTriggered: true,
      source: 'guardrail'
    };
  }

  const effectiveKey = apiKey || process.env.GEMINI_API_KEY;

  if (!effectiveKey) {
    // Deliver high quality contextual local response
    const localContent = generateLocalResponse(companionType, message, userProfile);
    return {
      content: localContent,
      guardrailTriggered: false,
      source: 'local-engine'
    };
  }

  try {
    const systemInstruction = getSystemPrompt(companionType, userProfile);

    // Format history for Gemini API
    const contents = [];
    
    // Add past history if available (limit to last 6 messages for token efficiency)
    const recentHistory = (chatHistory || []).slice(-6);
    for (const h of recentHistory) {
      contents.push({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
      });
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 900,
          topP: 0.9
        }
      })
    });

    if (!response.ok) {
      console.warn("Gemini API call returned non-200 status:", response.status);
      const fallback = generateLocalResponse(companionType, message, userProfile);
      return {
        content: fallback,
        guardrailTriggered: false,
        source: 'local-fallback'
      };
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (candidateText && candidateText.trim()) {
      return {
        content: candidateText.trim(),
        guardrailTriggered: false,
        source: 'gemini-api'
      };
    } else {
      const fallback = generateLocalResponse(companionType, message, userProfile);
      return {
        content: fallback,
        guardrailTriggered: false,
        source: 'local-fallback'
      };
    }
  } catch (error) {
    console.error("Error communicating with Gemini API:", error.message);
    const fallback = generateLocalResponse(companionType, message, userProfile);
    return {
      content: fallback,
      guardrailTriggered: false,
      source: 'local-fallback'
    };
  }
}

module.exports = {
  isHealthRelated,
  generateAiResponse,
  REDIRECT_MESSAGE
};

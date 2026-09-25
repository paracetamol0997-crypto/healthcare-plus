// AI Service for Health Companion AI
// Enforces strict health & wellness guardrails, supports Gemini API,
// and features an intelligent contextual fallback engine.

const REDIRECT_MESSAGE = "I am designed to help with mental wellness and physical health. How can I support your wellness journey today?";

// Topics considered unrelated to Mental/Physical Health
const UNRELATED_PATTERNS = [
  /\b(code|coding|javascript|python|typescript|react|html|css|sql|git|bug|function|compile|debugger|algorithm|api endpoint|backend|frontend|linux|windows bash|powershell|regex)\b/i,
  /\b(politics|politician|election|president|prime minister|democrat|republican|parliament|congress|senate|campaign|geopolitics|voting|war in|treaty)\b/i,
  /\b(crypto|bitcoin|ethereum|stock market|forex|investing|wall street|shares|dividend|trading|nasdaq)\b/i,
  /\b(movie|cinema|hollywood|bollywood|netflix|box office|celebrity gossip|actor|actress|pop singer|album release|oscars)\b/i,
  /\b(car repair|engine oil|mechanic|video game|fortnite|minecraft|playstation|xbox|nintendo|steam key)\b/i,
  /\b(homework|write an essay on history|solve this math equation|who invented the airplane|capital of)\b/i
];

// Health keywords that indicate a legitimate health query
const HEALTH_PATTERNS = [
  /\b(health|wellness|mental|physical|stress|anxiety|depression|sad|panic|breathe|breathing|sleep|insomnia|rest|tired|fatigue|burnout|mood|mindful|meditat|calm|peace|relax|emotion|feel|feeling|crying|lonely|overwhelm)\b/i,
  /\b(fit|fitness|workout|exercise|walk|walking|run|running|jog|gym|stretch|stretching|yoga|weights|muscle|cardio|core|abs|squat|pushup|hiit|calories|steps)\b/i,
  /\b(nutrition|diet|food|eat|eating|meal|water|hydration|protein|carbs|vitamins|weight|fat loss|gain weight|bmi|posture|back pain|neck pain|headache|sore|stiff|heart rate)\b/i,
  /\b(doctor|doctor's|physician|symptom|fever|cough|cold|recovery|healing|injury|blood pressure|glucose|vital|checkup)\b/i,
  /\b(habit|routine|morning routine|self-care|affirmation|journal|gratitude|motivation|mindset|focus)\b/i,
  /\b(hello|hi|hey|good morning|good afternoon|good evening|who are you|help me|how can you help|thank you|thanks)\b/i
];

function isHealthRelated(message) {
  const cleanMsg = message.trim();
  if (cleanMsg.length === 0) return true;

  // Check if message matches an explicitly unrelated pattern
  for (const pattern of UNRELATED_PATTERNS) {
    if (pattern.test(cleanMsg)) {
      // Unless they are explicitly talking about physical/mental effects, e.g. "coding gives me wrist pain"
      const hasHealthContext = /\b(pain|stress|fatigue|eyes|hurt|ergonomic|posture|burnout|anxiety|sleep)\b/i.test(cleanMsg);
      if (!hasHealthContext) {
        return false;
      }
    }
  }

  // If it's a short greeting or contains health keywords, it's valid
  for (const pattern of HEALTH_PATTERNS) {
    if (pattern.test(cleanMsg)) {
      return true;
    }
  }

  // If question words without health context (e.g. "What is the capital of France?")
  if (/^(what is|who is|who was|how to code|tell me about|explain the history of|write a script|generate a poem about cars)\b/i.test(cleanMsg)) {
    return false;
  }

  // By default, if ambiguous, give user benefit of the doubt if not strictly disallowed
  return true;
}

function getSystemPrompt(companionType, userProfile = {}) {
  const userName = userProfile.name || 'Friend';
  const age = userProfile.age ? `${userProfile.age} years old` : '';
  const height = userProfile.heightCm ? `${userProfile.heightCm} cm` : '';
  const weight = userProfile.weightKg ? `${userProfile.weightKg} kg` : '';
  const fitGoals = userProfile.fitnessGoals || 'General wellness & vitality';
  const mentalGoals = userProfile.mentalWellnessGoals || 'Stress balance & peace of mind';

  const userContext = `
USER PROFILE:
- Name: ${userName}
${age ? `- Age: ${age}` : ''}
${height ? `- Height: ${height}` : ''}
${weight ? `- Weight: ${weight}` : ''}
- Fitness Goals: ${fitGoals}
- Mental Wellness Goals: ${mentalGoals}
`;

  if (companionType === 'mind') {
    return `You are "Mind Companion AI", a compassionate, warm, and supportive mental health and emotional wellness mentor within the Health Companion AI platform.
${userContext}
YOUR MISSION:
- Provide empathetic listening, stress reduction advice, anxiety coping methods, guided breathing prompts, sleep hygiene tips, positive habit formation, and emotional validation.
- Speak in a calm, soothing, encouraging, and clear voice.
- Keep language simple, gentle, and accessible. Break up long advice into easy steps or bullet points.
- ALWAYS emphasize that you are an AI wellness companion, not a replacement for licensed medical or psychological professionals. If a user exhibits signs of acute crisis or self-harm, gently encourage them to contact professional emergency services immediately.
- STRICT RULE: ONLY answer mental and physical health topics. Do NOT discuss politics, programming, finance, or entertainment.`;
  }

  if (companionType === 'fit') {
    return `You are "Fit Companion AI", an energetic, encouraging, and knowledgeable physical fitness trainer and nutrition guide within the Health Companion AI platform.
${userContext}
YOUR MISSION:
- Provide customized workout plans (walking, running, bodyweight, gym, yoga, stretching), form tips, step tracking encouragement, hydration advice, and balanced nutrition tips.
- Use an enthusiastic, positive, supportive, and motivating tone.
- Give actionable, realistic advice tailored to the user's fitness goals (${fitGoals}).
- Emphasize safe progressions, proper warm-ups, cool-downs, and listening to one's body.
- STRICT RULE: ONLY answer physical and mental health topics. Do NOT discuss coding, politics, finance, or entertainment.`;
  }

  // Unified "health" companion
  return `You are "Health Companion AI", a trusted, comprehensive personal wellness companion combining the care of a family doctor, the encouragement of a fitness trainer, and the empathy of a mental health mentor.
${userContext}
YOUR MISSION:
- Help ${userName} thrive across both mental well-being and physical fitness.
- Balance emotional comfort with practical physical health advice.
- Be friendly, warm, supportive, and clear.
- STRICT RULE: ONLY answer mental and physical health topics. If asked about unrelated subjects (coding, politics, entertainment, trivia), reply with:
"${REDIRECT_MESSAGE}"`;
}

// Fallback response generator when Gemini API key is not present or offline
function generateLocalResponse(companionType, message, userProfile = {}) {
  const userName = userProfile.name || 'Friend';
  const lower = message.toLowerCase();

  // Guardrail check
  if (!isHealthRelated(message)) {
    return REDIRECT_MESSAGE;
  }

  // Greeting
  if (/^(hi|hello|hey|good morning|good evening|good afternoon)/i.test(lower)) {
    if (companionType === 'mind') {
      return `Hello ${userName}! 🌿 I'm your Mind Companion AI. I'm here to listen, help you navigate stress, practice mindfulness, or guide you through a calming exercise. How is your heart and mind feeling today?`;
    } else if (companionType === 'fit') {
      return `Hey ${userName}! 💪 I'm your Fit Companion AI. Ready to energize your body today? Whether you're looking for a quick stretch, a workout routine, or nutrition advice, what's our goal right now?`;
    } else {
      return `Welcome ${userName}! 🌟 I'm your Health Companion AI. How can I support your physical vitality and peace of mind today?`;
    }
  }

  // Stress / Anxiety
  if (lower.includes('stress') || lower.includes('anxious') || lower.includes('overwhelm') || lower.includes('panic') || lower.includes('nervous')) {
    return `I hear you, ${userName}, and I'm really glad you reached out. Feeling stressed or overwhelmed is completely valid, especially with everything you juggle.

Here is a quick 3-step calm down technique you can try right now:
1. **The 4-4-4-4 Box Breath**: Inhale gently through your nose for 4 counts, hold for 4 counts, release slowly through your mouth for 4 counts, and rest for 4 counts. Doing just 3 rounds sends an immediate relaxation signal to your vagus nerve.
2. **5-4-3-2-1 Sensory Grounding**: Name 5 things you can see around you, 4 things you can physically touch, 3 sounds you can hear, 2 scents, and 1 positive thought about yourself.
3. **Release physical tension**: Gently drop your shoulders away from your ears, unclench your jaw, and let your belly relax.

Would you like to try a guided breathing session, or would it feel better to talk through what is causing this stress? Remember, take it one breath at a time.`;
  }

  // Sleep / Insomnia
  if (lower.includes('sleep') || lower.includes('insomnia') || lower.includes('tired') || lower.includes('night') || lower.includes('wake up')) {
    return `Restful sleep is one of the most vital pillars of both mental clarity and physical recovery, ${userName}. 🌙

Here are proven habits to improve your sleep quality tonight:
- **Digital Sunset**: Power down bright screens 45–60 minutes before bed. Blue light suppresses melatonin, your body's natural sleep hormone.
- **Cool & Dark Environment**: Aim for a bedroom temperature around 18–20°C (65–68°F). A slight drop in core body temperature triggers sleepiness.
- **The Brain Dump**: If your thoughts are spinning, write them down in our Journal tab before getting into bed. Once they are on paper, your brain feels permitted to let go.
- **Gentle 4-7-8 Breathing**: Inhale for 4 seconds, hold for 7 seconds, exhale smoothly for 8 seconds. This slows your heart rate.

How many hours of sleep did you get last night? We can adjust your evening routine together!`;
  }

  // Workout / Gym / Beginner exercise
  if (lower.includes('gym') || lower.includes('workout') || lower.includes('exercise') || lower.includes('beginner') || lower.includes('routine')) {
    return `I love your enthusiasm, ${userName}! Building consistent physical activity is the ultimate investment in your long-term health and mood. 💪

Here is a balanced **Full-Body Beginner Routine** you can do anywhere:

**1. Warm-Up (3–5 minutes):**
- Arm circles and shoulder rolls: 30 seconds
- Cat-Cow spine mobility: 10 repetitions
- Gentle bodyweight squats: 12 repetitions

**2. Main Movement (2 to 3 sets):**
- **Chair or Bodyweight Squats**: 10–12 reps (strengthens quads, glutes, core)
- **Incline Push-ups (against a wall or sturdy table)**: 8–10 reps (chest and triceps)
- **Glute Bridges**: 12 reps (hips and lower back stability)
- **Plank Hold**: 20–30 seconds (deep core support)

**3. Cool-Down & Stretch (3 minutes):**
- Hamstring stretch: 30 seconds each side
- Chest-opening doorway stretch: 30 seconds
- Child's pose with deep belly breathing.

Remember to sip water throughout. Would you like to log this in your Workout Tracker, or would you like to focus on cardio or home yoga today?`;
  }

  // Walking / Steps / 10k steps
  if (lower.includes('step') || lower.includes('walk') || lower.includes('walking') || lower.includes('10000') || lower.includes('10,000')) {
    return `Walking is truly one of the most underrated forms of medicine for both body and mind, ${userName}! 🚶‍♂️

- **Cardiovascular Health**: Brisk walking strengthens your heart, improves insulin sensitivity, and lowers resting blood pressure.
- **Mental Clarity**: A 20-minute walk outside reduces cortisol (the stress hormone) and triggers endorphins that boost cognitive focus.
- **Habit Tip**: You don't have to get all your steps at once! Try three 10-minute walks—one after breakfast, one after lunch, and one after dinner. Walking after meals significantly blunts blood sugar spikes.

Check your dashboard to see your steps progress today! Have you reached your daily goal yet?`;
  }

  // Water / Hydration
  if (lower.includes('water') || lower.includes('hydrat') || lower.includes('drink') || lower.includes('thirst')) {
    return `Staying properly hydrated is essential for mental energy, joint lubrication, glowing skin, and healthy digestion, ${userName}! 💧

**Daily Hydration Guidelines:**
- Aim for roughly **2.5 to 3 liters** (approx. 8–10 glasses) of water daily.
- If you exercise or sweat heavily, add an extra 350–500ml or a pinch of electrolytes.
- Keep a reusable bottle on your desk where you can easily see it.
- Start your morning with a large glass of room-temperature water before coffee to kickstart your metabolism.

You can click on the glasses in the **Water Tracker** module on your Physical Health page to record your intake!`;
  }

  // Nutrition / Food / Diet
  if (lower.includes('nutrition') || lower.includes('diet') || lower.includes('food') || lower.includes('protein') || lower.includes('meal') || lower.includes('eat')) {
    return `Nutritious eating is about nourishing your cells and fueling your energy, not restrictive deprivation, ${userName}. 🥗

Here is the **Golden Plate Formula** for balanced energy and satiety:
1. **1/2 of your plate**: Colorful vegetables and leafy greens (fiber, micronutrients, antioxidants).
2. **1/4 of your plate**: High-quality protein (chicken breast, eggs, tofu, lentils, fish, or Greek yogurt). Protein sustains muscle repair and stabilizes satiety hormones.
3. **1/4 of your plate**: Complex carbohydrates (brown rice, oats, quinoa, sweet potatoes).
4. **1-2 thumb-sizes**: Healthy fats (extra virgin olive oil, avocado, chia seeds, or nuts) for brain health.

Are you looking for meal prep ideas for breakfast, lunch, or a healthy post-workout snack?`;
  }

  // General Wellness Advice
  if (companionType === 'fit') {
    return `Great question, ${userName}! In physical training, consistency beats intensity every single time. Small, repeatable habits like 8,000+ daily steps, drinking adequate water, and 20 minutes of targeted resistance work create lasting vitality.

How does your body feel right now—any tight muscles, joint stiffness, or energy dips we should address with a targeted stretch or mobility routine?`;
  } else {
    return `Thank you for sharing that with me, ${userName}. Taking time to check in with yourself is a wonderful act of self-care. 

Remember to honor where you are today. You don't have to have everything figured out; taking one intentional breath, drinking a warm glass of water, or stretching for two minutes can gently reset your nervous system.

What is one kind thing you can do for yourself today?`;
  }
}

// Call Google Gemini API if key is present, otherwise fallback to local response
async function generateAiResponse(companionType, message, userProfile = {}, chatHistory = [], apiKey = null) {
  // Step 1: Guardrail check
  if (!isHealthRelated(message)) {
    return {
      content: REDIRECT_MESSAGE,
      guardrailTriggered: true,
      source: 'guardrail'
    };
  }

  const effectiveKey = apiKey || process.env.GEMINI_API_KEY;

  if (!effectiveKey) {
    // Return high quality contextual local response
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
    const recentHistory = chatHistory.slice(-6);
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
          temperature: 0.7,
          maxOutputTokens: 800,
          topP: 0.95
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn("Gemini API call returned non-200:", response.status, errText);
      const fallback = generateLocalResponse(companionType, message, userProfile);
      return {
        content: fallback,
        guardrailTriggered: false,
        source: 'local-fallback-after-api-error'
      };
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (candidateText) {
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

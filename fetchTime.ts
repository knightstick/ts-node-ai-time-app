import dotenv from "dotenv";

dotenv.config();
const apiKey = process.env.OPEN_AI_API_KEY;

// Raise if the key isn't present
if (!apiKey) {
  throw new Error("OpenAI API key not found");
}

const endpoint = "https://api.openai.com/v1/completions";
const model = "text-davinci-003";
const maxTokens = 50;
const temperature = 0.7;

const buildPrompt = (time: string) => `The current time is ${time}.
Write a fun and imaginative way to describe this time.
It should be short and succinct, but, most importantly, include the actual time.
It will be used as an interesting way to display the current time, so, the time
should be clear. Each time you generate an answer, try and be creative about
the order of the words and where in the string the time is.
It should be slightly humourous, but, dry and possibly a little sarcastic and weird.
When you include the exact time, format it as words, not military time.
`;

interface Choice {
  text: string;
}

interface ApiResponse {
  choices: Choice[];
}

function parseApiResponse(response: unknown): ApiResponse {
  if (
    typeof response === "object" &&
    response !== null &&
    "choices" in response &&
    Array.isArray((response as ApiResponse).choices)
  ) {
    const choices = (response as ApiResponse).choices;
    const parsedChoices: Choice[] = [];

    for (const choice of choices) {
      if (typeof choice === "object" && choice !== null && "text" in choice) {
        parsedChoices.push(choice as Choice);
      } else {
        throw new Error(
          "Invalid API Response: choice object does not match expected shape"
        );
      }
    }

    return { choices: parsedChoices };
  } else {
    throw new Error(
      "Invalid API Response: response object does not match expected shape"
    );
  }
}

const generateCreativeTime = async () => {
  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const prompt = buildPrompt(currentTime);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt,
        model,
        max_tokens: maxTokens,
        temperature,
      }),
    });

    const data = parseApiResponse(await response.json());
    return data.choices[0].text.trim();
  } catch (error) {
    console.error(error);
  }
};

(async () => {
  const creativeTime = await generateCreativeTime();
  console.log(creativeTime);
})();

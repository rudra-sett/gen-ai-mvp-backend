# Bedrock Connector Testing

## First, ensure you are in the bedrock-connector directory

*When you first open up the terminal, it defaults to ~/environment/. 
To navigate to the bedrock-connector home directory from there, run:
```
cd bedrock-connector
```

## Next, craft your test string, it should look like this:
```
npm test -- --model=[MODEL_NAME] --system=[SYSTEM_INSTRUCTIONS] --hist=[HISTORY_LIST] --prompt=[PROMPT_TEXT]
```
Breakdown:

MODEL_NAME
- Explanation: The name of the model (use filename in ./models/)
- Format: String

SYSTEM_INSTRUCTIONS
- Explanation: The name of the high level instructions for the model
- Format: String

HISTORY_LIST
- Explanation: A list of historical messages
- Format: List of (Dictionary) JS Objects
  [{"user" : <<some message here>>, "chatbot" : <<some response here>>},
   {"user" : <<some message here>>, "chatbot" : <<some response here>>},
   {"user" : <<some message here>>, "chatbot" : <<some response here>>}]

PROMPT_TEXT
- Explanation: The prompt given
- Format: String


For each value not set, each above flags will DEFAULT to:

- model: 'claude3Sonnet'

- system: "You write sonnets that always end with the word 'revere'.",

- hist: [],

- prompt: `In a world where time is but a fleeting whisper, 
craft a sonnet that explores the enduring resonance of memories. 
Consider how moments, once lived, leave indelible imprints on our souls, 
echoing through the corridors of our minds long after they've passed. 
Reflect on the bittersweet dance of reminiscence, 
where joy and sorrow intertwine, and the past becomes both sanctuary 
and haunt. Embrace the challenge of capturing the essence of time's 
relentless march and the eternal echoes it leaves behind in the human heart.`
const { KendraClient, RetrieveCommand } = require("@aws-sdk/client-kendra");
const ClaudeModel = require("models/claude3Sonnet");
const Llama13BModel = require("models/llama13b");
const Mistral7BModel = require("models/mistral7b");

exports.handler = awslambda.streamifyResponse(async (event, responseStream, _context) => {
  try {
    const requestObject = JSON.parse(event.body);
    const projectId = requestObject.projectId;
    const systemPrompt = requestObject.systemPrompt;
    const userMessage = requestObject.userMessage;
    const chatHistory = requestObject.chatHistory;
    const kendra = new KendraClient({ region: 'us-east-1' });
    const WARNING_STRING = "For security and ethical reasons, I can't fulfill your request. Please try again with a different question that is relevant...";
    const projectIDToKendraIndex = {
      "rsrs111111": "fdfa8142-736d-44e9-baab-7491f3faeea3",
      "smjv012345": "be118630-f4fc-4c19-8370-531c37032725",
      "vgbt420420": "740b4f0d-09f4-458c-82f3-33d6e1558b80",
      "rkdg062824": "dd8dea5b-a884-46b3-a9ab-b8d51253d339",
    };

    if (!projectIDToKendraIndex[projectId]) {
      throw new Error("ProjectID is incorrect or not found.");
    }

    // const promptSafety = await isPromptSafe(userMessage, "user_prompt");
    // if (!promptSafety) {
    //   throw new Error(WARNING_STRING);
    // }

    const enhancedUserPrompt = await getPromptWithHistoricalContext(userMessage, chatHistory);

    // const promptSafetyAfterEnhancement = await isPromptSafe(enhancedUserPrompt, "model_response");
    // if (!promptSafetyAfterEnhancement) {
    //   throw new Error(WARNING_STRING);
    // }

    const docString = await retrieveKendraDocs(enhancedUserPrompt, kendra, projectIDToKendraIndex[projectId]);
    const enhancedSystemPrompt = injectKendraDocsInPrompt(systemPrompt, docString);

    let claude = new ClaudeModel();
    const stream = await claude.getStreamedResponse(enhancedSystemPrompt, chatHistory, userMessage);

    await processBedrockStream(stream, claude, responseStream);
  } catch (error) {
    console.error("Error:", error);
    responseStream.write(error.message);
  } finally {
    responseStream.end();
  }
});

async function processBedrockStream(modelStream, model, responseStream){
  try {
    for await (const event of modelStream) {
      const chunk = JSON.parse(new TextDecoder().decode(event.chunk.bytes));
      const parsedChunk = await model.parseChunk(chunk);
      if (parsedChunk) {
        responseStream.write(parsedChunk);
      }
    }
  } catch (error) {
    console.error("Stream processing error:", error);
    responseStream.write(error.message);
    responseStream.end()
    // Note: At this point, it's not possible to send an error message through the stream if it's already started streaming data.
  }
}

async function getPromptWithHistoricalContext(prompt, history) {
  // add error handling
  try {
    if (history.length > 0) {
      let llama = new Mistral7BModel();
      const CONTEXT_COMPLETION_INSTRUCTIONS = "Given this chat history and follow-up question, please re-write the question so that it is contextualized and suitable for a similarity search program to find relevant information. Try replacing words like 'it' or 'that' with relevant vocabulary words. Return ONLY the sentence and nothing more. If the question contains any personal information, please remove it. The rephrased prompt: ";
      const enhancedPrompt =  await llama.getResponse(CONTEXT_COMPLETION_INSTRUCTIONS, history, prompt);
      console.log(enhancedPrompt);
      return enhancedPrompt;
    } else {
      return prompt;
    }
  }
    catch (error) {
        console.error("Error in getting prompt with historical context:", error);
        return prompt;
  }}

  async function retrieveKendraDocs(query, kendra, kendraIndex) {
      const params = {
        QueryText: query,
        IndexId: kendraIndex,
        PageSize: 6,
        PageNumber: 1
      };
      const command = new RetrieveCommand(params);
      const result =  await kendra.send(command);
    return result.ResultItems.map(item => item.Content).join('\n');
  }

  function injectKendraDocsInPrompt(prompt, docs) {
      // Assuming buildPrompt concatenates query and docs into a single string
      return `Context: ${docs}\nInstructions: ${prompt}`;
  }

  async function isPromptSafe(prompt, prompt_type) {
    const promptInfo = {
      "content": prompt,
      "content_type": prompt_type
    }
    const response = await fetch('https://5iypg7vzzkirpf3xhhyzve4ghq0axjnf.lambda-url.us-east-1.on.aws/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(promptInfo), // Convert the JavaScript object to a JSON string
    })
    const data = await response.json()
    return data.isSafe
  }

// Other function definitions (isPromptSafe, getPromptWithHistoricalContext, retrieveKendraDocs, injectKendraDocsInPrompt) remain unchanged.



// const {KendraClient, RetrieveCommand } = require("@aws-sdk/client-kendra");
// const ClaudeModel = require("models/claude3Sonnet");
// const Llama13BModel = require("models/llama13b");
//
//
// exports.handler = awslambda.streamifyResponse(async (event, responseStream, _context) => {
//
//   async function processBedrockStream(modelStream, model){
//     for await (const event of modelStream) {
//       const chunk = JSON.parse(new TextDecoder().decode(event.chunk.bytes));
//       // call each model's chunk parser and write it to the pipeline
//       const parsedChunk = await model.parseChunk(chunk);
//       if (parsedChunk) {
//         responseStream.write(parsedChunk);
//       }
//     }
//     responseStream.end();
//   }
//
//   async function getPromptWithHistoricalContext(prompt, history) {
//     if (history.length > 0) {
//       let llama = new Llama13BModel();
//       const CONTEXT_COMPLETION_INSTRUCTIONS = "Given this chat history and follow-up question, please re-write the question so that it is contextualized and suitable for a similarity search program to find relevant information. Try replacing words like 'it' or 'that' with relevant vocabulary words. Return ONLY the sentence and nothing more. If the question contains any personal information, please remove it.";
//       console.log('Got Here');
//       return await llama.getResponse(CONTEXT_COMPLETION_INSTRUCTIONS, history, prompt);
//     } else {
//       return prompt;
//     }
//   }
//
//   async function retrieveKendraDocs(query, kendraIndex) {
//       const params = {
//         QueryText: query,
//         IndexId: kendraIndex,
//         PageSize: 10,
//         PageNumber: 1
//       };
//       const command = new RetrieveCommand(params);
//       const result =  await kendra.send(command);
//       const contents = result.ResultItems.map(item => item.Content).join('\n');
//       return contents;
//   }
//
//   function injectKendraDocsInPrompt(prompt, docs) {
//       // Assuming buildPrompt concatenates query and docs into a single string
//       return `Instructions: ${prompt}\nRelevant Docs: ${docs}`;
//   }
//
//   async function isPromptSafe(prompt, prompt_type) {
//     const promptInfo = {
//       "content": prompt,
//       "content_type": prompt_type
//     }
//     const response = await fetch('https://5iypg7vzzkirpf3xhhyzve4ghq0axjnf.lambda-url.us-east-1.on.aws/', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(promptInfo), // Convert the JavaScript object to a JSON string
//     })
//     const data = await response.json()
//     return data.isSafe
//   }
//
//   //
//
//     const requestObject = JSON.parse(event.body);
//     const projectId = requestObject.projectId;
//     const systemPrompt = requestObject.systemPrompt;
//     const userMessage = requestObject.userMessage;
//     const chatHistory = requestObject.chatHistory;
//     const kendra = new KendraClient({ region: 'us-east-1' });
//     const WARNING_STRING = "For security and ethical reasons, I can't fulfill your request. Please try again with a different question that is relevant...";
//     const projectIDToKendraIndex = {
//         "rsrs111111": "fdfa8142-736d-44e9-baab-7491f3faeea3",
//         "smjv012345": "be118630-f4fc-4c19-8370-531c37032725",
//         "vgbt420420": "740b4f0d-09f4-458c-82f3-33d6e1558b80",
//         "rkdg062824": "dd8dea5b-a884-46b3-a9ab-b8d51253d339",
//     };
//     try {
//     if (projectIDToKendraIndex[projectId] === undefined) {
//         responseStream.write("ProjectID is incorrect")
//     }
// } catch (error) {
//     console.error("An error occurred in parsing the request body:", error);
//     responseStream.write("Error: Parsing the request body");
//     responseStream.end();
// }
//
//
// const startTime1 = Date.now();
//   if (!isPromptSafe(userMessage, "user_prompt")) {
//     return responseStream.write(WARNING_STRING);
//   }
//   const endTime1 = Date.now();
//   console.log(`Time taken by userprpmptguardrail: ${endTime1 - startTime1} ms`);
//
//   const startTime = Date.now();
//   const enhancedUserPrompt = await getPromptWithHistoricalContext(userMessage, chatHistory);
//   const endTime = Date.now();
//
//   console.log(`Time taken by promptenhacement: ${endTime - startTime} ms`);
//
//   const startTime2 = Date.now();
//   if (!isPromptSafe(enhancedUserPrompt, "model_response")) {
//     return responseStream.write(WARNING_STRING);
//   }
//   const endTime2 = Date.now();
//   console.log(`Time taken by enhancedpromptguardrail: ${endTime - startTime} ms`);
//
//   //console.log('Prompt is Safe!')
//   const startTime3 = Date.now();
//   const docString = await retrieveKendraDocs(enhancedUserPrompt, projectIDToKendraIndex[projectId]);
//   const endTime3 = Date.now();
//   console.log(`Time taken for gettingdocs from kendra: ${endTime3 - startTime2} ms`);
//
//   const enhancedSystemPrompt = injectKendraDocsInPrompt(systemPrompt, docString);
//   //console.log(enhancedSystemPrompt)
//   let claude = new ClaudeModel();
//
//   const startTime4 = Date.now();
//   const stream = await claude.getStreamedResponse(enhancedSystemPrompt, chatHistory, enhancedUserPrompt);
//   const endTime4 = Date.now();
//   console.log(`Time taken for model ouput: ${endTime4 - startTime4} ms`);
//
//   await processBedrockStream(stream,claude);
// });
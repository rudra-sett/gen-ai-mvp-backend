// Default argument values
const defaultArgs = {
    model: 'claude3Sonnet',
    system: "You write lengthy sonnets that always end with the word 'revere'.",
    hist: [],
    prompt: `In a world where time is but a fleeting whisper, 
    craft a sonnet that explores the enduring resonance of memories. 
    Consider how moments, once lived, leave indelible imprints on our souls, 
    echoing through the corridors of our minds long after they've passed. 
    Reflect on the bittersweet dance of reminiscence, 
    where joy and sorrow intertwine, and the past becomes both sanctuary 
    and haunt. Embrace the challenge of capturing the essence of time's 
    relentless march and the eternal echoes it leaves behind in the human heart.`
};

// Function to parse command line arguments and replace missing ones with defaults
function parseArgs() {
    const args = {};

    // Loop through command line arguments starting from index 2
    for (let i = 2; i < process.argv.length; i++) {
        const arg = process.argv[i];

        // Check if the argument is a flag (prefixed with '--')
        if (arg.startsWith('--')) {
            const [flag, value] = arg.split('=');
            args[flag.slice(2)] = value || true; // If no value is provided, set it to true
        }
    }

    // Merge default arguments with provided arguments
    return { ...defaultArgs, ...args };
}

function loadModel(modelName) {
    try {
        const model = require(`../models/${modelName}.js`);
        return new model
    } catch (error) {
        console.error(
        `Model Not Found: '${modelName}'. Ensure that:
        1. You're providing the right filename less the .js extension
        2. The filename includes an exported class module`)
    }
}

async function processStream(responseStream) {
    for await (const chunk of responseStream) {
        if (typeof chunk.content === 'string') {
            process.stdout.write(chunk.content);
        }
    }
}


// this is a function for processing streams directly from bedrock rather than
  // langchain
async function processBedrockStream(modelStream, model){
    for await (const event of modelStream) {
        // Decode each chunk
        const chunk = JSON.parse(new TextDecoder().decode(event.chunk.bytes));
        // call each model's chunk parser and write it to the pipeline
        console.log(model.parseChunk(chunk));}
}

// Main function
async function main() {
    // Parse command line arguments
    const args = parseArgs();
    console.log('Running test with arguments:', args);
    const model = loadModel(args["model"]);
    console.log('Model Loaded, Running Streamed Response...');
    const responseStream = await model.getStreamedResponse(args["system"], args["hist"], args["prompt"]);
    await processBedrockStream(responseStream, model)
    console.log('Streamed Response Complete, Running Regular Response...')
    const response = await model.getResponse(args["system"], args["hist"], args["prompt"])
    console.log(response)
    console.log(
        `Regular Response Complete!
        Test Successfully Terminated! 
        Remember to Review the Response Quality.`)
}

main();
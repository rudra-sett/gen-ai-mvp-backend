const {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} = require("@aws-sdk/client-bedrock-runtime");
const { Bedrock } = require("@langchain/community/llms/bedrock");

class Mistral7BModel {
  constructor() {
    this.client = new BedrockRuntimeClient({
      region: "us-east-1",
    });
    this.model = new Bedrock({
      model: "mistral.mistral-7b-instruct-v0:2",
      region: "us-east-1",
    });
  }

  
  assembleHistory(system,hist,prompt) {
      var history = ""
      history = history.concat(`[INST]\n ${system} [/INST]\n`)
      hist.forEach((element) => {
        history = history.concat(`[INST]\n ${element.user} [/INST]\n`)
        history = history.concat(`${element.chatbot}`)
      });
      history = history.concat(`[INST]\n ${prompt} [/INST]`)
      return history
  }
  
  async getStreamedResponse(system,history,message) {
      const hist = this.assembleHistory(system,history,message);
      const payload = {
        prompt: hist,
      };
      // Invoke the model with the payload and wait for the API to respond.
      const modelId = "mistral.mistral-7b-instruct-v0:2";
      const command = new InvokeModelWithResponseStreamCommand({
        contentType: "application/json",
        body: JSON.stringify(payload),
        modelId,
      });
      const apiResponse = await this.client.send(command);
      return apiResponse.body;
  }
  
  async getResponse(system,history,message) {
      const hist = this.assembleHistory(system,history,message);
      const stream = await this.model.invoke(hist);
      return stream;
  }
  
  parseChunk(chunk) {
    return chunk.outputs[0].text;
  }
}

module.exports = Mistral7BModel;
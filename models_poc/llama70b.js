const {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
  InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");
const { Bedrock } = require("@langchain/community/llms/bedrock");

class Llama70BModel {
  constructor() {
    this.client = new BedrockRuntimeClient({
      region: "us-east-1",
    });
    this.model = new Bedrock({
      model: "meta.llama2-70b-chat-v1",
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
  
  parseChunk(chunk) {
    return chunk.generation;
  }
  
  async getStreamedResponse(system,history,message) {
      const hist = this.assembleHistory(system,history,message);
      const payload = {
        prompt: hist,
      };
      // Invoke the model with the payload and wait for the API to respond.
      const modelId = "meta.llama2-70b-chat-v1";
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
      // const payload = {
      //   prompt: hist,
      // };
      // // Invoke the model with the payload and wait for the API to respond.
      // const modelId = "meta.llama2-70b-chat-v1";
      // const command = new InvokeModelWithResponseStreamCommand({
      //   contentType: "application/json",
      //   body: JSON.stringify(payload),
      //   modelId,
      // });
      // const apiResponse = this.client.send(command);
      // const chunk = JSON.parse(new TextDecoder().decode(apiResponse.body));
      // return chunk.generation;
      return stream;
  }
  
}

module.exports = Llama70BModel;
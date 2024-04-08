const {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand
} = require("@aws-sdk/client-bedrock-runtime");

class ClaudeModel{
  constructor() {
    this.client = new BedrockRuntimeClient({
      region: "us-east-1",
    });
    this.modelId = "anthropic.claude-3-sonnet-20240229-v1:0";}
  
    assembleHistory(hist, prompt) {
    var history = []
    hist.forEach((element) => {
      history.push({"role": "user", "content": [{"type": "text", "text": element.user}]});
      history.push({"role": "assistant", "content": [{"type": "text", "text": element.chatbot}]});
    });
    history.push({"role": "user", "content": [{"type": "text", "text": prompt}]});
    return history;
  }
  parseChunk(chunk) {
    if (chunk.type == 'content_block_delta') {
      if (chunk.delta.type == 'text_delta') {
        return chunk.delta.text
      }
    }
  }

  async getStreamedResponse(system, history, message) {
    const hist = this.assembleHistory(history, message);
    
    const payload = {
      "anthropic_version": "bedrock-2023-05-31",
      "system": system,
      "max_tokens": 2048,
      "messages" : hist,
      "temperature" : 0.27,
    };
    
    const command = new InvokeModelWithResponseStreamCommand({body:JSON.stringify(payload),contentType:'application/json',modelId:this.modelId});
    const apiResponse = await this.client.send(command);
    return apiResponse.body
  }
  
  async getResponse(system, history, message) {
    return ''
  }
  // async getResponse(system, history, message) {
  //   const hist = this.assembleHistory(history, message);
  //   const stream = await this.getStreamedResponse(system, hist, message);
  //   return stream;
  // }
}

module.exports = ClaudeModel;
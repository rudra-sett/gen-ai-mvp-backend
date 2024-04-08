// interface modelInterface {
    
//     ():;
    
// }

// HISTORY: [{"user" : <<some message here>>, "chatbot" : <<some response here>>},
//           {"user" : <<some message here>>, "chatbot" : <<some response here>>},
//           {"user" : <<some message here>>, "chatbot" : <<some response here>>}]

// curl -X POST -H "Content-Type: application/json" -d 
// '{"message": "how do I schedule a ride?","history" : "","text" : "hi"}' 
// "https://sg4ozxukd5pu7nplx6gd3m64by0qslfb.lambda-url.us-east-1.on.aws/" --no-buffer

/*
// Every chat model needs these imports
const { BedrockChat } = require("@langchain/community/chat_models/bedrock");
const { HumanMessage } = require("@langchain/core/messages");
const { SystemMessage } = require("@langchain/core/messages");
const { AIMessage } = require("@langchain/core/messages");

// Every non-chat model needs this import
const { Bedrock } = require("@langchain/community/llms/bedrock");


// every script should have a class that looks like this
class ClaudeModel {
    // the constrcutor takes NO inputs and simply sets up a model like this:
    //
  constructor() {
    //BedrockChat OR Bedrock
    this.model = new BedrockChat({
      model: "anthropic.claude-3-sonnet-20240229-v1:0",
      region: "us-east-1",
    });
  }

  
  // you'll need your own version of this function
  assembleHistory(system,hist,prompt) {
      var history = []
      history.push(new SystemMessage({content:system}))
      hist.forEach((element) => {
        history.push(new HumanMessage({content:element.user}))
        history.push(new AIMessage({content:element.chatbot}))
      });
      history.push(new HumanMessage({content:prompt}))
      return history
  }
  
  // IMPORTANT define this function
  async getStreamedResponse(system,history,message) {
      const hist = this.assembleHistory(system,history,message);
      const stream = await this.model.stream(hist);
      return stream;
  }
  
  // IMPORTANT define this function
  async getResponse(system,history,message) {
      const hist = this.assembleHistory(system,history,message);
      const stream = await this.model.invoke(hist);
      return stream;
  }
}

module.exports = ClaudeModel;
*/
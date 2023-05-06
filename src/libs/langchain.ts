import { getConfig } from '../config/config';
import { OpenAI } from 'langchain/llms/openai';

class LLMFactory {
  static instanceOpenAI: OpenAI;

  async createOpenAI(model: string): Promise<OpenAI> {
    if (!LLMFactory.instanceOpenAI) {
      const config = await getConfig();
      LLMFactory.instanceOpenAI = new OpenAI({
        modelName: model,
        temperature: config.TEMPERATURE,
        openAIApiKey: config.OPENAI_API_KEY,
        maxTokens: config.MAX_TOKENS,
      });
      return LLMFactory.instanceOpenAI;
    } else {
      return LLMFactory.instanceOpenAI;
    }
  }
}

export const langchain = new LLMFactory();

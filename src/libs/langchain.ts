import { getConfig } from '../config/config';
import { OpenAI } from 'langchain/llms/openai';

class LLMFactory {
  async createOpenAI(model: string, streaming = false): Promise<OpenAI> {
    const config = await getConfig();
    return new OpenAI({
      modelName: model,
      temperature: config.TEMPERATURE,
      openAIApiKey: config.OPENAI_API_KEY,
      maxTokens: config.MAX_TOKENS,
      streaming,
    });
  }
}

export const langchain = new LLMFactory();

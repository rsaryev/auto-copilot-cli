import { getConfig } from '../config/config';
import { OpenAI } from 'langchain/llms/openai';

class LLMFactory {
  async createOpenAI(
    model: string,
    streaming = false,
    maxTokens: number,
  ): Promise<OpenAI> {
    const config = await getConfig();
    return new OpenAI({
      modelName: model,
      temperature: config.TEMPERATURE,
      openAIApiKey: config.OPENAI_API_KEY,
      maxTokens,
      streaming,
    });
  }
}

export const langchain = new LLMFactory();

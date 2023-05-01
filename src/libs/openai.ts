import { Configuration, OpenAIApi } from 'openai';
import { ChatCompletionRequestMessage } from 'openai/api';
import { getConfig } from '../config/config';

export async function createChatCompletion(
  messages: Array<ChatCompletionRequestMessage>,
): Promise<any> {
  const config = await getConfig();
  const configuration = new Configuration({
    apiKey: config.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  return openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    temperature: config.TEMPERATURE,
    messages,
    max_tokens: config.MAX_TOKENS,
  });
}

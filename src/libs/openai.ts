import { Configuration, CreateChatCompletionResponse, OpenAIApi } from 'openai';
import { ChatCompletionRequestMessage } from 'openai/api';
import { getConfig } from '../config/config';

export async function createChatCompletion(
  messages: Array<ChatCompletionRequestMessage>,
  model: string,
): Promise<CreateChatCompletionResponse> {
  const config = await getConfig();
  const configuration = new Configuration({
    apiKey: config.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const completion = await openai.createChatCompletion({
    model,
    temperature: config.TEMPERATURE,
    messages,
    max_tokens: config.MAX_TOKENS,
  });

  return completion.data;
}

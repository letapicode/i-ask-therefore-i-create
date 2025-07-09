# Pair Programmer Chat

The portal includes a small chat widget that connects to the orchestrator over WebSockets. Messages are forwarded to the configured LLM provider (OpenAI or a custom model) and responses appear in the widget.

## Setup

1. Start the analytics and orchestrator services.
2. Provide `OPENAI_API_KEY` or `CUSTOM_MODEL_URL` for the LLM.
3. Launch the portal and navigate to any page to start chatting.

## Privacy

Conversations are saved by the analytics service in `chat.json`. This history can be used for future model fine-tuning. If prompts contain sensitive data, delete the file or disable the chat endpoint.

// import { Configuration, OpenAIApi } from 'openai-edge'
import { Message, OpenAIStream, StreamingTextResponse } from 'ai'
import { NextResponse } from 'next/server';
import { getChatById } from '@/lib/db';
import { getContext } from '@/lib/context';
import { openai } from '@/lib/openai';

// export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const { messages, chatId } = await req.json();
        const chat = await getChatById(chatId);
        if (!chat) return NextResponse.json({ 'error': 'chat not found' }, { status: 404 });
       
        const fileKey = chat.fileKye;
        const lastMessage: Message = messages[messages.length - 1];
        const context = await getContext(lastMessage.content, fileKey);
        const prompt = {
            role: "system",
            content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
            The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
            AI is a well-behaved and well-mannered individual.
            AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
            AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
            AI assistant is a big fan of Pinecone and Vercel.
            START CONTEXT BLOCK
            ${context}
            END OF CONTEXT BLOCK
            AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
            If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
            AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
            AI assistant will not invent anything that is not drawn directly from the context.
            `,
        };
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [prompt, ...messages.filter((message: Message) => message.role === 'user')],
            stream: true
        });
        const stream = OpenAIStream(response);
        return new StreamingTextResponse(stream);
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "internal server error" },
            { status: 500 }
        )
    }
}
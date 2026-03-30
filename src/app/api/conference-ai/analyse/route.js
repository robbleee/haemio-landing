import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const SYSTEM_PROMPTS = {
  abstract: `You are a senior medical affairs analyst specialising in haematology.
Given a conference abstract or session content, extract a structured analysis.

Return your analysis in this exact format using markdown:

## Structured Summary

**Study Design:** [brief description]
**Patient Population:** [N, disease, line of therapy, key eligibility]
**Primary Endpoint:** [endpoint and result]

## Efficacy Data

| Endpoint | Result | Notes |
|----------|--------|-------|
| [endpoint] | [value] | [context] |

## Safety Signals

| Signal | Grade 3+ Rate | Action |
|--------|---------------|--------|
| [AE] | [%] | [dose mod/discontinuation/etc] |

## Key Findings
- [bullet 1]
- [bullet 2]
- [bullet 3]

## Clinical Relevance
[2-3 sentence assessment of what this means for clinical practice]

Be precise with numbers. If data is not present, write "Not reported". Do not fabricate data.`,

  compare: `You are a senior medical affairs analyst specialising in haematology.
Given two conference abstracts or session summaries, produce a structured side-by-side comparison.

Return your analysis in this exact format using markdown:

## Head-to-Head Comparison

| Dimension | Study A | Study B |
|-----------|---------|---------|
| Study Design | | |
| Population (N) | | |
| Disease / Setting | | |
| Primary Endpoint | | |
| ORR | | |
| CR Rate | | |
| Median PFS | | |
| Median OS | | |
| Key Grade 3+ AEs | | |

## Differentiators
- [key difference 1]
- [key difference 2]
- [key difference 3]

## Clinical Implications
[2-3 sentence comparison of how these results relate to each other and what they mean for treatment decisions]

Be precise with numbers. If data is not present, write "NR" (not reported). Do not fabricate data.`,

  qa: `You are a clinical intelligence assistant specialising in haematology conference data.
Answer the user's question based on the provided session content.
Be precise, cite specific data points from the content, and flag if information is not available.
Keep answers concise and clinically relevant. Use markdown formatting.`,
};

export async function POST(request) {
  try {
    const { mode, content, contentB, question } = await request.json();

    if (!content) {
      return Response.json({ error: 'Content is required' }, { status: 400 });
    }

    const systemPrompt = SYSTEM_PROMPTS[mode];
    if (!systemPrompt) {
      return Response.json({ error: 'Invalid mode' }, { status: 400 });
    }

    let userMessage = '';
    if (mode === 'abstract') {
      userMessage = `Analyse this conference abstract/session content:\n\n${content}`;
    } else if (mode === 'compare') {
      if (!contentB) {
        return Response.json({ error: 'Second abstract is required for comparison' }, { status: 400 });
      }
      userMessage = `Compare these two abstracts:\n\n**Study A:**\n${content}\n\n**Study B:**\n${contentB}`;
    } else if (mode === 'qa') {
      if (!question) {
        return Response.json({ error: 'Question is required' }, { status: 400 });
      }
      userMessage = `Session content:\n${content}\n\nQuestion: ${question}`;
    }

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta?.text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

import { openai } from "@ai-sdk/openai";
import { auth } from "@clerk/nextjs/server";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/api-handler";

export const POST = apiHandler(async (req: NextRequest) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prompt } = await req.json();

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json(
      { error: "Missing required field: prompt (string)" },
      { status: 400 },
    );
  }

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    prompt,
  });

  return NextResponse.json({ response: text });
});

import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/cached";
import { isProUser } from "@/app/actions";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  // Import internal module directly to avoid pdf-parse's top-level fs.readFileSync in index.js
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse/lib/pdf-parse.js");
  const data = await pdfParse(Buffer.from(buffer));
  return data.text;
}

const TOGGL_PROMPT = `Przeanalizuj ten raport z Toggl Track (lub innego time trackera) i wyodrębnij WSZYSTKIE przedziały czasowe / wpisy pracy.

Zwróć TYLKO czysty JSON (bez markdown, bez komentarzy, bez tekstu przed/po) — tablicę obiektów:
[
  {
    "title": "<nazwa zadania / projektu>",
    "date": "<data w formacie YYYY-MM-DD>",
    "start_time": "<godzina rozpoczęcia w formacie HH:MM>",
    "end_time": "<godzina zakończenia w formacie HH:MM>",
    "duration_hours": <czas trwania w godzinach jako liczba, np. 1.5>
  }
]

Zasady:
- Wyodrębnij KAŻDY wpis czasowy
- Jeśli widać tylko czas trwania (np. "1:30:00") bez start/end, ustaw start_time na "09:00" i oblicz end_time
- Jeśli widać start i end time, użyj ich dokładnie
- Data z kolumny daty, jeśli nie widać użyj: ${new Date().toISOString().split("T")[0]}
- Tytuł: nazwa projektu / zadania / klienta widoczna przy wpisie
- duration_hours jako liczba dziesiętna (1h30m = 1.5)
- Godziny w formacie 24h (HH:MM)
- Jeśli jest tylko 1 wpis, zwróć tablicę z 1 elementem`;

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pro = await isProUser();
    if (!pro) {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabaseAdmin
        .from("scan_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", weekAgo);
      if ((count ?? 0) >= 3) {
        return NextResponse.json(
          { error: "Limit 3 skanów tygodniowo w planie darmowym. Przejdź na Pro, aby skanować bez limitu.", remaining: 0 },
          { status: 403 }
        );
      }
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Brak klucza API Groq" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Brak pliku" },
        { status: 400 }
      );
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Plik za duży (max 10MB)" },
        { status: 400 }
      );
    }

    const isPdf = file.type === "application/pdf" || file.name?.toLowerCase().endsWith(".pdf");
    const bytes = await file.arrayBuffer();

    let messages;

    if (isPdf) {
      const pdfText = await extractPdfText(bytes);

      if (!pdfText.trim()) {
        return NextResponse.json(
          { error: "Nie udało się odczytać tekstu z PDF. Plik może być zeskanowany — spróbuj wgrać jako obraz." },
          { status: 422 }
        );
      }

      messages = [
        {
          role: "user" as const,
          content: `${TOGGL_PROMPT}\n\nOto treść raportu:\n\n${pdfText}`,
        },
      ];
    } else {
      const base64 = Buffer.from(bytes).toString("base64");
      const mimeType = file.type || "image/jpeg";
      const dataUrl = `data:${mimeType};base64,${base64}`;

      messages = [
        {
          role: "user" as const,
          content: [
            {
              type: "image_url" as const,
              image_url: { url: dataUrl },
            },
            {
              type: "text" as const,
              text: TOGGL_PROMPT,
            },
          ],
        },
      ];
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages,
          max_tokens: 4096,
          temperature: 0.1,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", errorText);
      return NextResponse.json(
        { error: "Błąd API Groq" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Brak odpowiedzi z AI" },
        { status: 502 }
      );
    }

    let parsed;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        const objMatch = content.match(/\{[\s\S]*\}/);
        if (!objMatch) throw new Error("No JSON found");
        parsed = [JSON.parse(objMatch[0])];
      } else {
        parsed = JSON.parse(jsonMatch[0]);
      }
      if (!Array.isArray(parsed)) parsed = [parsed];
    } catch {
      console.error("Failed to parse AI response:", content);
      return NextResponse.json(
        { error: "Nie udało się sparsować odpowiedzi AI", raw: content },
        { status: 422 }
      );
    }

    const entries = parsed.map((item: Record<string, unknown>) => ({
      title: (item.title as string) || "Praca",
      date: (item.date as string) || new Date().toISOString().split("T")[0],
      start_time: (item.start_time as string) || "09:00",
      end_time: (item.end_time as string) || "10:00",
      duration_hours: Number(item.duration_hours) || 1,
    }));

    await supabaseAdmin
      .from("scan_logs")
      .insert({ user_id: user.id, scan_type: "toggl" });

    return NextResponse.json({ entries });
  } catch (error: unknown) {
    console.error("Scan toggl error:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}

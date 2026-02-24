import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/cached";
import { isProUser } from "@/app/actions";

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isProUser())) {
      return NextResponse.json({ error: "Wymagany Plan Pro" }, { status: 403 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Brak klucza API Groq" },
        { status: 500 }
      );
    }

    const data = await request.json();
    const { totalEarnings, totalHours, byWallet, previousWeekEarnings, previousWeekHours, eventCount, confirmedCount, period } = data;

    // Walidacja typów numerycznych
    if (typeof totalEarnings !== 'number' || typeof totalHours !== 'number' ||
        typeof previousWeekEarnings !== 'number' || typeof previousWeekHours !== 'number' ||
        typeof eventCount !== 'number') {
      return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
    }

    const allowedPeriods = ['tydzień', 'miesiąc'];
    const periodName = allowedPeriods.includes(period) ? period : 'tydzień';
    const prevPeriodName = periodName === 'miesiąc' ? 'poprzedni miesiąc' : 'poprzedni tydzień';

    // Sanityzacja nazw portfeli — ogranicz do 50 znaków, usuń znaki kontrolne
    const sanitizeName = (name: string) =>
      String(name).replace(/[\x00-\x1f]/g, '').slice(0, 50);

    const walletBreakdown = (Array.isArray(byWallet) ? byWallet : [])
      .slice(0, 20) // max 20 portfeli
      .filter((w): w is { name: string; earnings: number; hours: number } =>
        typeof w?.name === 'string' && typeof w?.earnings === 'number' && typeof w?.hours === 'number')
      .map((w) => `- ${sanitizeName(w.name)}: ${w.earnings.toFixed(2)} PLN (${w.hours.toFixed(1)}h)`)
      .join('\n');

    const confirmed = confirmedCount ?? eventCount;
    const unconfirmed = eventCount - confirmed;

    const prompt = `Jesteś asystentem finansowym. Przeanalizuj zarobki użytkownika za ${periodName} i daj krótkie, motywujące podsumowanie po polsku (2-3 zdania). Bądź konkretny i odnos się do danych. Zarobki dotyczą TYLKO potwierdzonych wydarzeń (tych które się odbyły).

Dane:
- Okres: ${periodName}
- Zarobki ten ${periodName}: ${totalEarnings.toFixed(2)} PLN (tylko z potwierdzonych wydarzeń)
- Godziny pracy: ${totalHours.toFixed(1)}h
- Potwierdzone wydarzenia: ${confirmed} z ${eventCount}${unconfirmed > 0 ? ` (${unconfirmed} jeszcze niepotwierdzonych)` : ''}
- Zarobki ${prevPeriodName}: ${previousWeekEarnings.toFixed(2)} PLN (${previousWeekHours.toFixed(1)}h)
${walletBreakdown ? `\nRozbicie per portfel:\n${walletBreakdown}` : ''}

Odpowiedz TYLKO tekstem podsumowania, bez nagłówków ani formatowania.`;

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
          messages: [
            { role: "user", content: prompt },
          ],
          max_tokens: 256,
          temperature: 0.7,
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

    const result = await response.json();
    const insight = result.choices?.[0]?.message?.content?.trim();

    if (!insight) {
      return NextResponse.json(
        { error: "Brak odpowiedzi z AI" },
        { status: 502 }
      );
    }

    return NextResponse.json({ insight });
  } catch (error: unknown) {
    console.error("Calendar summary error:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}

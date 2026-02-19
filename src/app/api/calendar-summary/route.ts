import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Brak klucza API Groq" },
        { status: 500 }
      );
    }

    const data = await request.json();
    const { totalEarnings, totalHours, byWallet, previousWeekEarnings, previousWeekHours, eventCount, confirmedCount, period } = data;

    const periodName = period || 'tydzień';
    const prevPeriodName = periodName === 'miesiąc' ? 'poprzedni miesiąc' : 'poprzedni tydzień';

    const walletBreakdown = (byWallet || [])
      .map((w: { name: string; earnings: number; hours: number }) => `- ${w.name}: ${w.earnings.toFixed(2)} PLN (${w.hours.toFixed(1)}h)`)
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

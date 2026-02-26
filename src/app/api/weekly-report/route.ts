import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/cached";
import { isProUser, getWeeklyReportData, getLastWeeklyReport } from "@/app/actions";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";

export async function POST() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = rateLimit(`weekly-report:${user.id}`, { limit: 5, windowSeconds: 60 });
    if (!rl.success) {
      return NextResponse.json({ error: "Zbyt wiele żądań" }, { status: 429 });
    }

    const [isPro, lastReport] = await Promise.all([
      isProUser(),
      getLastWeeklyReport(),
    ]);

    // Free user: 1 raport / tydzień
    if (!isPro && lastReport) {
      const lastDate = new Date(lastReport);
      const now = new Date();
      const diffMs = now.getTime() - lastDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays < 7) {
        return NextResponse.json(
          { error: "limit", upgradeUrl: true },
          { status: 403 }
        );
      }
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Brak klucza API" }, { status: 500 });
    }

    const data = await getWeeklyReportData();
    if (!data) {
      return NextResponse.json({ error: "Brak danych" }, { status: 400 });
    }

    const sanitize = (s: string) => String(s).replace(/[\x00-\x1f]/g, '').slice(0, 80);

    const categoryBreakdown = data.outcomeByCategory
      .slice(0, 10)
      .map(c => `- ${sanitize(c.category)}: ${c.amount.toFixed(2)} PLN`)
      .join('\n');

    const topExpensesStr = data.topExpenses
      .map(e => `- ${sanitize(e.description)} (${sanitize(e.category)}): ${e.amount.toFixed(2)} PLN`)
      .join('\n');

    const habitsStr = data.habits
      .slice(0, 10)
      .map(h => `- ${sanitize(h.name)}: ${h.completed}/${h.expected} dni`)
      .join('\n');

    const prompt = `Jesteś osobistym doradcą finansowym. Przeanalizuj dane z ostatniego tygodnia (${sanitize(data.weekLabel)}) i napisz krótki raport po polsku (max 300 słów).
Struktura:
1. Podsumowanie ogólne (1-2 zdania)
2. Wydatki — na co najwięcej, czy to dużo
3. Przychody — praca, godziny
4. Nawyki — które trzymasz, które zawiodły
5. Rada na następny tydzień (1 zdanie)
Bądź konkretny, odnos się do danych. Ton: przyjazny, motywujący, szczery.

Dane:
- Przychody: ${data.totalIncome.toFixed(2)} PLN
- Wydatki: ${data.totalOutcome.toFixed(2)} PLN
- Bilans: ${(data.totalIncome - data.totalOutcome).toFixed(2)} PLN
${categoryBreakdown ? `\nWydatki per kategoria:\n${categoryBreakdown}` : ''}
${topExpensesStr ? `\nTop wydatki:\n${topExpensesStr}` : ''}
- Godziny pracy: ${data.workHours.toFixed(1)}h
- Zarobki z pracy: ${data.workEarnings.toFixed(2)} PLN
${habitsStr ? `\nNawyki:\n${habitsStr}` : '\nBrak nawyków do analizy.'}

Odpowiedz TYLKO tekstem raportu, bez nagłówków ani formatowania markdown.`;

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
          messages: [{ role: "user", content: prompt }],
          max_tokens: 512,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", errorText);
      return NextResponse.json({ error: "Błąd API AI" }, { status: 502 });
    }

    const result = await response.json();
    const report = result.choices?.[0]?.message?.content?.trim();

    if (!report) {
      return NextResponse.json({ error: "Brak odpowiedzi z AI" }, { status: 502 });
    }

    // Zapisz timestamp ostatniego raportu
    await supabaseAdmin
      .from('users')
      .update({ last_weekly_report: new Date().toISOString() })
      .eq('id', user.id);

    return NextResponse.json({ report, weekLabel: data.weekLabel });
  } catch (error: unknown) {
    console.error("Weekly report error:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

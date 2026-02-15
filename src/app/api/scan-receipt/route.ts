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

    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Brak pliku obrazu" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

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
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: dataUrl },
                },
                {
                  type: "text",
                  text: `Przeanalizuj ten wyciąg bankowy / rachunek / paragon / fakturę i wyodrębnij WSZYSTKIE transakcje widoczne na zdjęciu.

Zwróć TYLKO czysty JSON (bez markdown, bez komentarzy, bez tekstu przed/po) — tablicę obiektów:
[
  {
    "amount": <kwota jako liczba, zawsze dodatnia>,
    "type": "<income lub outcome>",
    "category": "<kategoria po polsku: Przelew, Jedzenie, Transport, Zakupy, Rozrywka, Zdrowie, Edukacja, Rachunki, Zwrot, Inne>",
    "date": "<data w formacie YYYY-MM-DD>",
    "description": "<krótki opis po polsku, max 60 znaków>"
  }
]

Zasady:
- Wyodrębnij KAŻDĄ transakcję z tabeli/listy na zdjęciu
- Kwota zawsze dodatnia (bez znaku minus)
- Określ typ: "income" dla wpływów/przelewów przychodzących/zwrotów, "outcome" dla wydatków/przelewów wychodzących/płatności
- Słowa kluczowe dla income: "PRZYCHODZĄCY", "WPŁYW", "ZWROT", "UZNANIE"
- Słowa kluczowe dla outcome: "WYCHODZĄCY", "WYPŁATA", "OBCIĄŻENIE", "PŁATNOŚĆ", "ZAKUP"
- Data z kolumny "Data operacji" jeśli dostępna
- Opis: skrócony opis operacji (nazwa odbiorcy/nadawcy lub tytuł)
- Jeśli nie widać daty, użyj: ${new Date().toISOString().split("T")[0]}
- Jeśli jest tylko 1 transakcja, zwróć tablicę z 1 elementem`,
                },
              ],
            },
          ],
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

    // Parse JSON array from response
    let parsed;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        // Fallback: try single object
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

    const transactions = parsed.map((item: Record<string, unknown>) => ({
      amount: Math.abs(Number(item.amount)) || 0,
      type: item.type === "income" ? "income" : "outcome",
      category: (item.category as string) || "Inne",
      date: (item.date as string) || new Date().toISOString().split("T")[0],
      description: (item.description as string) || "",
    }));

    return NextResponse.json({ transactions });
  } catch (error: unknown) {
    console.error("Scan receipt error:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}

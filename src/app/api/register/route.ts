import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateSalt, generateDEK, deriveKEK, encryptDEK } from "@/lib/crypto";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(`register:${ip}`, { limit: 5, windowSeconds: 600 });
    if (!rl.success) {
      return new NextResponse("Zbyt wiele prób. Spróbuj ponownie później.", { status: 429 });
    }

    const body = await request.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return new NextResponse("Brakujące dane", { status: 400 });
    }

    // Walidacja formatu email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== 'string' || !emailRegex.test(email) || email.length > 254) {
      return new NextResponse("Nieprawidłowy format email", { status: 400 });
    }

    // Walidacja hasła
    if (typeof password !== 'string' || password.length < 8) {
      return new NextResponse("Hasło musi mieć co najmniej 8 znaków", { status: 400 });
    }

    // Walidacja nazwy
    if (typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
      return new NextResponse("Nieprawidłowa nazwa użytkownika", { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Utwórz użytkownika przez signUp — wysyła email weryfikacyjny automatycznie
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { name: name.trim() },
      },
    });

    if (authError) {
      console.error("Supabase auth error:", authError);
      if (authError.message.includes("already")) {
        return new NextResponse("Email już istnieje", { status: 400 });
      }
      return new NextResponse("Nie udało się utworzyć konta", { status: 400 });
    }

    // signUp zwraca user z pustymi identities jeśli email już istnieje
    if (!authData.user || authData.user.identities?.length === 0) {
      return new NextResponse("Email już istnieje", { status: 400 });
    }

    // Generuj klucze szyfrowania E2E
    const salt = generateSalt();
    const dek = generateDEK();
    const kek = await deriveKEK(password, salt);
    const encryptedDek = encryptDEK(dek, kek);

    // Dodaj użytkownika do tabeli users (via admin, bo user nie jest jeszcze zalogowany)
    const { error: dbError } = await supabaseAdmin
      .from("users")
      .insert({
        id: authData.user.id,
        email: normalizedEmail,
        name: name.trim(),
        encryption_salt: salt.toString('base64'),
        encrypted_dek: encryptedDek,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error("Database error:", dbError);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return new NextResponse("Błąd bazy danych", { status: 500 });
    }

    return NextResponse.json({
      message: "Sprawdź swoją skrzynkę email, aby potwierdzić konto.",
      requiresConfirmation: true,
    });
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return new NextResponse("Błąd serwera", { status: 500 });
  }
}

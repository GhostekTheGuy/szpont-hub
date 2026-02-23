import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateSalt, generateDEK, deriveKEK, encryptDEK } from "@/lib/crypto";

export async function POST(request: Request) {
  try {
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

    // Utwórz użytkownika przez Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true, // Automatycznie potwierdź email
      user_metadata: {
        name: name.trim(),
      },
    });

    if (authError) {
      console.error("Supabase auth error:", authError);
      if (authError.message.includes("already")) {
        return new NextResponse("Email już istnieje", { status: 400 });
      }
      return new NextResponse("Nie udało się utworzyć konta", { status: 400 });
    }

    // Generuj klucze szyfrowania E2E
    const salt = generateSalt();
    const dek = generateDEK();
    const kek = await deriveKEK(password, salt);
    const encryptedDek = encryptDEK(dek, kek);

    // Dodaj użytkownika do tabeli users
    const { error: dbError } = await supabaseAdmin
      .from("users")
      .insert({
        id: authData.user.id,
        email,
        name,
        encryption_salt: salt.toString('base64'),
        encrypted_dek: encryptedDek,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error("Database error:", dbError);
      // Usuń użytkownika z auth jeśli nie udało się dodać do bazy
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return new NextResponse("Błąd bazy danych", { status: 500 });
    }

    return NextResponse.json({
      message: "Konto utworzone pomyślnie",
      user: { id: authData.user.id, email, name }
    });
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return new NextResponse("Błąd serwera", { status: 500 });
  }
}

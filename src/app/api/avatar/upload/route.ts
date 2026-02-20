import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return new NextResponse('Invalid file type', { status: 400 });
    }

    // Max 2MB
    if (file.size > 2 * 1024 * 1024) {
      return new NextResponse('File too large (max 2MB)', { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    const filePath = `${user.id}/avatar`;

    // Upload to Supabase Storage (upsert)
    const { error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new NextResponse('Upload failed', { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    // Update user metadata
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        avatar_url: avatarUrl,
      },
    });

    return NextResponse.json({ url: avatarUrl });
  } catch (error: unknown) {
    console.error('Avatar upload error:', error);
    return new NextResponse('Server error', { status: 500 });
  }
}

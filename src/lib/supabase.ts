import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lururxkoilxwqpfgczrc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1cnVyeGtvaWx4d3FwZmdjenJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1Njg4MzksImV4cCI6MjA0NzE0NDgzOX0.1kxGFqzq27VPOLgdo2jAyVpAJ4l__3y1Bclqmu0uMKs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// File upload helpers
export async function uploadProfilePicture(file: File, userId: string) {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile_picture')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('profile_picture')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
}

export async function uploadNovelCover(file: File, novelId: string) {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${novelId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('novel_coverpage')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('novel_coverpage')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading novel cover:', error);
    throw error;
  }
}

export async function updateUserBio(userId: string, bio: string) {
  try {
    const { error } = await supabase
      .from('Users')
      .update({ bio, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating user bio:', error);
    throw error;
  }
}
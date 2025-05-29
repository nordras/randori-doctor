import { supabase } from './supabaseClient';
import { Session } from './models';

export async function saveSession(session: Session) {
  const { data, error } = await supabase
    .from('sessions')
    .upsert([session]);
  if (error) throw error;
  return data;
}

export async function getSession(id: string) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

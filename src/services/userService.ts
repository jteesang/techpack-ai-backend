import supabase from '../../supabase/lib/supabase'

export const createUser = async (email: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: ''
  })
  if (error) throw error
  return data
}

export const loginUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

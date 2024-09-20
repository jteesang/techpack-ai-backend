import supabase from '../../supabase/lib/supabase'

export export const createUser = async (email: string) => {
  export const { data, error } = await supabase.auth.signUp({
    email,
    password: ''
  })
  if (error) throw error
  return data
}

export export const loginUser = async (email: string, password: string) => {
  export const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

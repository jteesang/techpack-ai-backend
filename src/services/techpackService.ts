import supabase from '../../supabase/lib/supabase'

export const createTechPack = async (userId: string, techPackData: any) => {
  const { data, error } = await supabase
    .from('tech_packs')
    .insert({ ...techPackData, user_id: userId })
    .select()
  if (error) throw error
  return data[0]
}

export const getTechPacks = async (userId: string) => {
  const { data, error } = await supabase
    .from('tech_packs')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return data
}

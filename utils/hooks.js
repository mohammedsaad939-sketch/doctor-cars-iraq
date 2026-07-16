let cachedCategories = null;
export async function getCategories(supabase) {
  if (cachedCategories) return cachedCategories;
  const { data } = await supabase.from('categories').select('*').order('sort_order');
  cachedCategories = data || [];
  return cachedCategories;
}

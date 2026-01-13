-- ONE-LINE FIX: Just copy and paste this single line in SQL Editor
INSERT INTO storage.buckets (id, name, public) VALUES ('medical-images', 'medical-images', false) ON CONFLICT (id) DO NOTHING;

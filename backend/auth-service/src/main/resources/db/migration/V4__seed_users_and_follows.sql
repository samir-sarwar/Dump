-- Seed 10 test users (password: password123 for all)
-- BCrypt hash generated from Spring Security's BCryptPasswordEncoder
INSERT INTO users (id, name, username, email, password_hash, auth_provider, bio) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Mike Chen', 'mikechen', 'mike@example.com',
   '$2a$10$MVOKMivapn6NVw7axIhLCu.m2ZqLBjnE5sK4OogPCp/aKkjtG/nhS', 'LOCAL',
   'photographer & weekend adventurer'),
  ('a1000000-0000-0000-0000-000000000002', 'Sara Kim', 'sarakim', 'sara@example.com',
   '$2a$10$MVOKMivapn6NVw7axIhLCu.m2ZqLBjnE5sK4OogPCp/aKkjtG/nhS', 'LOCAL',
   'travel lover. always chasing sunsets'),
  ('a1000000-0000-0000-0000-000000000003', 'Jake Morrison', 'jakemorrison', 'jake@example.com',
   '$2a$10$MVOKMivapn6NVw7axIhLCu.m2ZqLBjnE5sK4OogPCp/aKkjtG/nhS', 'LOCAL',
   'music producer & festival goer'),
  ('a1000000-0000-0000-0000-000000000004', 'Priya Patel', 'priyap', 'priya@example.com',
   '$2a$10$MVOKMivapn6NVw7axIhLCu.m2ZqLBjnE5sK4OogPCp/aKkjtG/nhS', 'LOCAL',
   'foodie documenting every meal'),
  ('a1000000-0000-0000-0000-000000000005', 'Alex Rivera', 'alexrivera', 'alex@example.com',
   '$2a$10$MVOKMivapn6NVw7axIhLCu.m2ZqLBjnE5sK4OogPCp/aKkjtG/nhS', 'LOCAL',
   'skateboarder. filmmaker. coffee snob.'),
  ('a1000000-0000-0000-0000-000000000006', 'Olivia Hart', 'livhart', 'olivia@example.com',
   '$2a$10$MVOKMivapn6NVw7axIhLCu.m2ZqLBjnE5sK4OogPCp/aKkjtG/nhS', 'LOCAL',
   'designer by day, dancer by night'),
  ('a1000000-0000-0000-0000-000000000007', 'Noah Williams', 'noahw', 'noah@example.com',
   '$2a$10$MVOKMivapn6NVw7axIhLCu.m2ZqLBjnE5sK4OogPCp/aKkjtG/nhS', 'LOCAL',
   'hiking every trail in the PNW'),
  ('a1000000-0000-0000-0000-000000000008', 'Emma Zhang', 'emmazhang', 'emma@example.com',
   '$2a$10$MVOKMivapn6NVw7axIhLCu.m2ZqLBjnE5sK4OogPCp/aKkjtG/nhS', 'LOCAL',
   'grad student. cat mom. amateur baker.'),
  ('a1000000-0000-0000-0000-000000000009', 'Liam Brooks', 'liambrooks', 'liam@example.com',
   '$2a$10$MVOKMivapn6NVw7axIhLCu.m2ZqLBjnE5sK4OogPCp/aKkjtG/nhS', 'LOCAL',
   'rugby + road trips'),
  ('a1000000-0000-0000-0000-000000000010', 'Zara Okafor', 'zaraokafor', 'zara@example.com',
   '$2a$10$MVOKMivapn6NVw7axIhLCu.m2ZqLBjnE5sK4OogPCp/aKkjtG/nhS', 'LOCAL',
   'painter. poet. people watcher.');

-- Seed follow relationships (~15, some mutual for "friends")
INSERT INTO follows (follower_id, followee_id) VALUES
  -- Mike <-> Sara (mutual)
  ('a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002'),
  ('a1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001'),
  -- Mike <-> Jake (mutual)
  ('a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003'),
  ('a1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001'),
  -- Mike -> Priya
  ('a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004'),
  -- Sara <-> Olivia (mutual)
  ('a1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000006'),
  ('a1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002'),
  -- Jake -> Alex
  ('a1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000005'),
  -- Priya <-> Emma (mutual)
  ('a1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000008'),
  ('a1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000004'),
  -- Alex -> Liam
  ('a1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000009'),
  -- Noah -> Mike
  ('a1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001'),
  -- Noah -> Zara
  ('a1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000010'),
  -- Liam <-> Zara (mutual)
  ('a1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000010'),
  ('a1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000009'),
  -- Emma -> Sara
  ('a1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000002');

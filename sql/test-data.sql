-- 単位命題三角ロジック演習システム テストデータ
-- 作成日: 2025-10-05
-- 用途: 開発・テスト用のサンプルデータ

-- ==============================================
-- テストユーザー作成
-- ==============================================
INSERT INTO users (user_id, name, email) VALUES 
  ('01HZ8X9K2M3N4P5Q6R7S8T9U0V', 'テストユーザー1', 'test1@example.com'),
  ('01HZ8X9K2M3N4P5Q6R7S8T9U0W', 'テストユーザー2', 'test2@example.com'),
  ('01HZ8X9K2M3N4P5Q6R7S8T9U0X', '研究用ユーザー', 'research@example.com');

-- ==============================================
-- テストセッション作成
-- ==============================================
INSERT INTO sessions (session_id, user_id) VALUES 
  ('01HZ8X9K2M3N4P5Q6R7S8T9U0Y', '01HZ8X9K2M3N4P5Q6R7S8T9U0V'),
  ('01HZ8X9K2M3N4P5Q6R7S8T9U0Z', '01HZ8X9K2M3N4P5Q6R7S8T9U0W'),
  ('01HZ8X9K2M3N4P5Q6R7S8T9U1A', '01HZ8X9K2M3N4P5Q6R7S8T9U0X');

-- ==============================================
-- テスト試行記録作成
-- ==============================================
INSERT INTO attempts (attempt_id, session_id, user_id, problem_id, status) VALUES 
  ('01HZ8X9K2M3N4P5Q6R7S8T9U1B', '01HZ8X9K2M3N4P5Q6R7S8T9U0Y', '01HZ8X9K2M3N4P5Q6R7S8T9U0V', 'TLU-A-v1.0.0', 'in_progress'),
  ('01HZ8X9K2M3N4P5Q6R7S8T9U1C', '01HZ8X9K2M3N4P5Q6R7S8T9U0Z', '01HZ8X9K2M3N4P5Q6R7S8T9U0W', 'TLU-A-v1.0.0', 'completed'),
  ('01HZ8X9K2M3N4P5Q6R7S8T9U1D', '01HZ8X9K2M3N4P5Q6R7S8T9U1A', '01HZ8X9K2M3N4P5Q6R7S8T9U0X', 'TLU-A-v1.0.0', 'in_progress');

-- ==============================================
-- テスト回答状態作成
-- ==============================================
INSERT INTO responses (response_id, session_id, user_id, problem_id, problem_number, state, current_step, is_completed) VALUES 
  ('01HZ8X9K2M3N4P5Q6R7S8T9U1E', '01HZ8X9K2M3N4P5Q6R7S8T9U0Y', '01HZ8X9K2M3N4P5Q6R7S8T9U0V', 'TLU-A-v1.0.0', 1,
   '{"step1": {"antecedent": "Pである", "consequent": "Rである", "is_passed": true}, "step2": {"answer_type": "selectable", "premise": "Qである", "link_directions": {"antecedent-link": true, "consequent-link": true}, "is_passed": false}}', 
   2, false),
  
  ('01HZ8X9K2M3N4P5Q6R7S8T9U1F', '01HZ8X9K2M3N4P5Q6R7S8T9U0Z', '01HZ8X9K2M3N4P5Q6R7S8T9U0W', 'TLU-A-v1.0.0', 1,
   '{"step1": {"antecedent": "Pである", "consequent": "Rである", "is_passed": true}, "step2": {"answer_type": "selectable", "premise": "Qである", "link_directions": {"antecedent-link": true, "consequent-link": true}, "is_passed": true}, "step3": {"inference_type": "演繹", "validity": true, "is_passed": true}}', 
   3, true),
  
  ('01HZ8X9K2M3N4P5Q6R7S8T9U1G', '01HZ8X9K2M3N4P5Q6R7S8T9U1A', '01HZ8X9K2M3N4P5Q6R7S8T9U0X', 'TLU-A-v1.0.0', 1,
   '{"step1": {"antecedent": "Pである", "consequent": "Rである", "is_passed": false}}', 
   1, false);

-- ==============================================
-- テストイベントログ作成
-- ==============================================
INSERT INTO events (event_id, session_id, user_id, attempt_id, seq, kind, payload, client_ts, idempotency_key) VALUES 
  -- ユーザー1のイベント
  ('01HZ8X9K2M3N4P5Q6R7S8T9U1H', '01HZ8X9K2M3N4P5Q6R7S8T9U0Y', '01HZ8X9K2M3N4P5Q6R7S8T9U0V', '01HZ8X9K2M3N4P5Q6R7S8T9U1B', 1, 'attempt_started', '{"problem_id": "TLU-A-v1.0.0"}', NOW() - INTERVAL '10 minutes', 'attempt_started_01HZ8X9K2M3N4P5Q6R7S8T9U1B'),
  ('01HZ8X9K2M3N4P5Q6R7S8T9U1I', '01HZ8X9K2M3N4P5Q6R7S8T9U0Y', '01HZ8X9K2M3N4P5Q6R7S8T9U0V', '01HZ8X9K2M3N4P5Q6R7S8T9U1B', 2, 'select_dropdown', '{"control_id": "step1_antecedent", "value": "Pである"}', NOW() - INTERVAL '9 minutes', 'select_dropdown_01HZ8X9K2M3N4P5Q6R7S8T9U1B_2'),
  ('01HZ8X9K2M3N4P5Q6R7S8T9U1J', '01HZ8X9K2M3N4P5Q6R7S8T9U0Y', '01HZ8X9K2M3N4P5Q6R7S8T9U0V', '01HZ8X9K2M3N4P5Q6R7S8T9U1B', 3, 'select_dropdown', '{"control_id": "step1_consequent", "value": "Rである"}', NOW() - INTERVAL '8 minutes', 'select_dropdown_01HZ8X9K2M3N4P5Q6R7S8T9U1B_3'),
  ('01HZ8X9K2M3N4P5Q6R7S8T9U1K', '01HZ8X9K2M3N4P5Q6R7S8T9U0Y', '01HZ8X9K2M3N4P5Q6R7S8T9U0V', '01HZ8X9K2M3N4P5Q6R7S8T9U1B', 4, 'check_answer', '{"step": 1}', NOW() - INTERVAL '7 minutes', 'check_answer_01HZ8X9K2M3N4P5Q6R7S8T9U1B_4'),
  ('01HZ8X9K2M3N4P5Q6R7S8T9U1L', '01HZ8X9K2M3N4P5Q6R7S8T9U0Y', '01HZ8X9K2M3N4P5Q6R7S8T9U0V', '01HZ8X9K2M3N4P5Q6R7S8T9U1B', 5, 'step_completed', '{"step": 1, "result": "correct", "is_correct": true}', NOW() - INTERVAL '6 minutes', 'step_completed_01HZ8X9K2M3N4P5Q6R7S8T9U1B_5'),
  
  -- ユーザー2のイベント（完了済み）
  ('01HZ8X9K2M3N4P5Q6R7S8T9U1M', '01HZ8X9K2M3N4P5Q6R7S8T9U0Z', '01HZ8X9K2M3N4P5Q6R7S8T9U0W', '01HZ8X9K2M3N4P5Q6R7S8T9U1C', 1, 'attempt_started', '{"problem_id": "TLU-A-v1.0.0"}', NOW() - INTERVAL '20 minutes', 'attempt_started_01HZ8X9K2M3N4P5Q6R7S8T9U1C'),
  ('01HZ8X9K2M3N4P5Q6R7S8T9U1N', '01HZ8X9K2M3N4P5Q6R7S8T9U0Z', '01HZ8X9K2M3N4P5Q6R7S8T9U0W', '01HZ8X9K2M3N4P5Q6R7S8T9U1C', 2, 'attempt_finished', '{"problem_id": "TLU-A-v1.0.0", "success": true}', NOW() - INTERVAL '5 minutes', 'attempt_finished_01HZ8X9K2M3N4P5Q6R7S8T9U1C');

-- ==============================================
-- 完了済み試行の更新
-- ==============================================
UPDATE attempts 
SET finished_at = NOW() - INTERVAL '5 minutes', 
    status = 'completed' 
WHERE attempt_id = '01HZ8X9K2M3N4P5Q6R7S8T9U1C';

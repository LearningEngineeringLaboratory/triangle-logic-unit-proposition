-- 組立不可が正解となる問題の例
-- 作成日: 2025-10-05
-- 用途: 組立不可ボタンが正解となる問題のサンプル

-- ==============================================
-- 組立不可が正解となる問題の例
-- ==============================================
INSERT INTO problems (problem_id, title, body, rubric, options, version) VALUES (
  'TLU-A-Q02-v1.0.0',
  '組立不可問題の例',
  'PであるならばQである。また，QであるならばRである。したがって，RであるならばSである。',
  '{
    "step1": {
      "description": "導出命題を構成してください",
      "correct_answer": {
        "antecedent": "Rである",
        "consequent": "Sである"
      }
    },
    "step2": {
      "description": "所与命題を構成してください",
      "answer_type": "impossible",
      "correct_answer": {
        "is_impossible": true
      }
    },
    "step3": {
      "description": "推論形式と妥当性を選択してください",
      "correct_answer": {
        "inference_type": "演繹",
        "validity": "非妥当"
      }
    }
  }',
  '["Pである", "Qである", "Rである", "Sである"]',
  '1.0.0'
);

-- ==============================================
-- 組立不可回答のテストデータ
-- ==============================================
-- 組立不可が正解となる問題の回答例
INSERT INTO responses (response_id, session_id, user_id, attempt_id, state, current_step, passed_steps) VALUES 
  ('01HZ8X9K2M3N4P5Q6R7S8T9U2A', '01HZ8X9K2M3N4P5Q6R7S8T9U0Y', '01HZ8X9K2M3N4P5Q6R7S8T9U0V', '01HZ8X9K2M3N4P5Q6R7S8T9U1B', 
   '{"step1": {"antecedent": "Rである", "consequent": "Sである"}, "step2": {"answer_type": "impossible", "is_impossible": true}}', 
   2, '{1}');

-- ==============================================
-- 組立不可ボタンクリックのイベント例
-- ==============================================
INSERT INTO events (event_id, session_id, user_id, attempt_id, seq, kind, payload, client_ts, idempotency_key) VALUES 
  ('01HZ8X9K2M3N4P5Q6R7S8T9U2B', '01HZ8X9K2M3N4P5Q6R7S8T9U0Y', '01HZ8X9K2M3N4P5Q6R7S8T9U0V', '01HZ8X9K2M3N4P5Q6R7S8T9U1B', 6, 'click_impossible_button', '{"step": 2, "is_impossible": true}', NOW() - INTERVAL '5 minutes', 'click_impossible_button_01HZ8X9K2M3N4P5Q6R7S8T9U1B_6');

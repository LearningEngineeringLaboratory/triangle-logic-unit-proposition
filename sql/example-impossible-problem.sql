-- 組立不可が正解となる問題の例
-- 作成日: 2025-10-05
-- 用途: 組立不可ボタンが正解となる問題のサンプル

-- ==============================================
-- 組立不可が正解となる問題の例
-- ==============================================
INSERT INTO problems (problem_id, title, argument, total_steps, steps, version) VALUES (
  'TLU-B-v1.0.0',
  '問題2（組立不可問題の例）',
  'PであるならばQである。また，QであるならばRである。したがって，RであるならばSである。',
  3,
  '{
    "step1": {
      "rubric": {
        "correct_answer": {
          "antecedent": "Rである",
          "consequent": "Sである"
        }
      },
      "options": ["Pである", "Qである", "Rである", "Sである"]
    },
    "step2": {
      "rubric": {
        "answer_type": "impossible"
      },
      "options": ["Pである", "Qである", "Rである", "Sである"]
    },
    "step3": {
      "rubric": {
        "correct_answer": {
          "inference_type": "非形式",
          "validity": false
        }
      }
    }
  }',
  '1.0.0'
);

-- ==============================================
-- 組立不可回答のテストデータ
-- ==============================================
-- 組立不可が正解となる問題の回答例
INSERT INTO responses (response_id, session_id, user_id, problem_id, problem_number, state, current_step, is_completed) VALUES 
  ('01HZ8X9K2M3N4P5Q6R7S8T9U2A', '01HZ8X9K2M3N4P5Q6R7S8T9U0Y', '01HZ8X9K2M3N4P5Q6R7S8T9U0V', 'TLU-B-v1.0.0', 2,
   '{"step1": {"antecedent": "Rである", "consequent": "Sである", "is_passed": true}, "step2": {"answer_type": "impossible", "is_passed": true}}', 
   2, false);

-- ==============================================
-- 組立不可ボタンクリックのイベント例
-- ==============================================
INSERT INTO events (event_id, session_id, user_id, attempt_id, seq, kind, payload, client_ts, idempotency_key) VALUES 
  ('01HZ8X9K2M3N4P5Q6R7S8T9U2B', '01HZ8X9K2M3N4P5Q6R7S8T9U0Y', '01HZ8X9K2M3N4P5Q6R7S8T9U0V', '01HZ8X9K2M3N4P5Q6R7S8T9U1B', 6, 'click_impossible_button', '{"step": 2, "is_impossible": true}', NOW() - INTERVAL '5 minutes', 'click_impossible_button_01HZ8X9K2M3N4P5Q6R7S8T9U1B_6');

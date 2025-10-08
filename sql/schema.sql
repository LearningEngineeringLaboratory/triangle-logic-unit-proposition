-- 単位命題三角ロジック演習システム データベーススキーマ
-- 作成日: 2025-10-05
-- 用途: 学習過程の詳細ログ収集・分析用

-- ==============================================
-- 1. users テーブル（ユーザー情報）
-- ==============================================
CREATE TABLE users (
  user_id TEXT PRIMARY KEY,  -- ULID形式
  name TEXT NOT NULL,        -- ユーザー名
  email TEXT UNIQUE NOT NULL, -- メールアドレス（重複不可）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- 登録日時
);

-- インデックス
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ==============================================
-- 2. problems テーブル（問題データ）
-- ==============================================
CREATE TABLE problems (
  problem_id TEXT PRIMARY KEY,  -- 問題ID（例: TLU-A-v1.0.0）
  title TEXT NOT NULL,          -- 問題タイトル
  argument TEXT NOT NULL,       -- 論証文
  total_steps INTEGER NOT NULL, -- 問題内のステップ数（可変対応）
  steps JSONB NOT NULL,         -- ステップ情報の配列（JSONB形式）
  version TEXT NOT NULL,        -- 問題バージョン
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 作成日時
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  -- 更新日時
);

-- インデックス
CREATE INDEX idx_problems_version ON problems(version);
CREATE INDEX idx_problems_created_at ON problems(created_at);

-- ==============================================
-- 3. sessions テーブル（セッション管理）
-- ==============================================
CREATE TABLE sessions (
  session_id TEXT PRIMARY KEY,  -- セッションID（ULID形式）
  user_id TEXT NOT NULL,        -- ユーザーID（外部キー）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- セッション開始日時
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- 最終活動日時
);

-- 外部キー制約
ALTER TABLE sessions ADD CONSTRAINT fk_sessions_user_id 
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

-- インデックス
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at);
CREATE INDEX idx_sessions_last_activity ON sessions(last_activity);

-- ==============================================
-- 4. attempts テーブル（試行記録）
-- ==============================================
CREATE TABLE attempts (
  attempt_id TEXT PRIMARY KEY,  -- 試行ID（ULID形式）
  session_id TEXT NOT NULL,     -- セッションID（外部キー）
  user_id TEXT NOT NULL,        -- ユーザーID（外部キー）
  problem_id TEXT NOT NULL,     -- 問題ID（外部キー）
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 開始日時
  finished_at TIMESTAMP WITH TIME ZONE, -- 終了日時（NULL=進行中）
  status TEXT NOT NULL DEFAULT 'in_progress' -- ステータス（in_progress, completed, abandoned）
);

-- 外部キー制約
ALTER TABLE attempts ADD CONSTRAINT fk_attempts_session_id 
  FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE;
ALTER TABLE attempts ADD CONSTRAINT fk_attempts_user_id 
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE attempts ADD CONSTRAINT fk_attempts_problem_id 
  FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE;

-- インデックス
CREATE INDEX idx_attempts_session_id ON attempts(session_id);
CREATE INDEX idx_attempts_user_id ON attempts(user_id);
CREATE INDEX idx_attempts_problem_id ON attempts(problem_id);
CREATE INDEX idx_attempts_status ON attempts(status);
CREATE INDEX idx_attempts_started_at ON attempts(started_at);

-- ==============================================
-- 5. events テーブル（操作ログ）
-- ==============================================
CREATE TABLE events (
  event_id TEXT PRIMARY KEY,    -- イベントID（ULID形式）
  session_id TEXT NOT NULL,     -- セッションID（外部キー）
  user_id TEXT NOT NULL,        -- ユーザーID（外部キー）
  attempt_id TEXT NOT NULL,     -- 試行ID（外部キー）
  seq INTEGER NOT NULL,         -- シーケンス番号（セッション内で一意）
  kind TEXT NOT NULL,           -- イベント種別
  payload JSONB,                -- イベント詳細データ
  client_ts TIMESTAMP WITH TIME ZONE, -- クライアント側タイムスタンプ
  server_ts TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- サーバー側タイムスタンプ
  idempotency_key TEXT UNIQUE  -- 冪等性キー（重複防止）
);

-- 外部キー制約
ALTER TABLE events ADD CONSTRAINT fk_events_session_id 
  FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE;
ALTER TABLE events ADD CONSTRAINT fk_events_user_id 
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE events ADD CONSTRAINT fk_events_attempt_id 
  FOREIGN KEY (attempt_id) REFERENCES attempts(attempt_id) ON DELETE CASCADE;

-- インデックス
CREATE INDEX idx_events_session_id ON events(session_id);
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_attempt_id ON events(attempt_id);
CREATE INDEX idx_events_kind ON events(kind);
CREATE INDEX idx_events_server_ts ON events(server_ts);
CREATE UNIQUE INDEX idx_events_session_seq ON events(session_id, seq);

-- ==============================================
-- 6. responses テーブル（回答状態）
-- ==============================================
CREATE TABLE responses (
  response_id TEXT PRIMARY KEY, -- 回答ID（ULID形式）
  session_id TEXT NOT NULL,     -- セッションID（外部キー）
  user_id TEXT NOT NULL,        -- ユーザーID（外部キー）
  problem_id TEXT NOT NULL,     -- 問題ID（外部キー）
  problem_number INTEGER NOT NULL, -- 問題番号（1, 2, 3...）
  state JSONB NOT NULL,         -- 全ステップの回答状態（JSONB形式）
  current_step INTEGER NOT NULL DEFAULT 1, -- 現在のステップ番号
  is_completed BOOLEAN NOT NULL DEFAULT FALSE, -- 問題全体の完了状態
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 作成日時
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  -- 更新日時
);

-- 外部キー制約
ALTER TABLE responses ADD CONSTRAINT fk_responses_session_id 
  FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE;
ALTER TABLE responses ADD CONSTRAINT fk_responses_user_id 
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE responses ADD CONSTRAINT fk_responses_problem_id 
  FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE;

-- インデックス
CREATE INDEX idx_responses_session_id ON responses(session_id);
CREATE INDEX idx_responses_user_id ON responses(user_id);
CREATE INDEX idx_responses_problem_id ON responses(problem_id);
CREATE INDEX idx_responses_problem_number ON responses(problem_number);
CREATE INDEX idx_responses_current_step ON responses(current_step);
CREATE INDEX idx_responses_is_completed ON responses(is_completed);
CREATE INDEX idx_responses_updated_at ON responses(updated_at);

-- ==============================================
-- 7. Row Level Security (RLS) 設定
-- ==============================================

-- RLSを有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- users テーブルのRLSポリシー
-- ユーザーは自分のデータのみアクセス可能
CREATE POLICY "Users can access their own data" ON users
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- problems テーブルのRLSポリシー
-- 全ユーザーが問題データを読み取り可能（認証済みユーザーのみ）
CREATE POLICY "Authenticated users can read problems" ON problems
  FOR SELECT USING (auth.role() = 'authenticated');

-- sessions テーブルのRLSポリシー
-- ユーザーは自分のセッションのみアクセス可能
CREATE POLICY "Users can access their own sessions" ON sessions
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- attempts テーブルのRLSポリシー
-- ユーザーは自分の試行記録のみアクセス可能
CREATE POLICY "Users can access their own attempts" ON attempts
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- events テーブルのRLSポリシー
-- ユーザーは自分のイベントログのみアクセス可能
CREATE POLICY "Users can access their own events" ON events
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- responses テーブルのRLSポリシー
-- ユーザーは自分の回答状態のみアクセス可能
CREATE POLICY "Users can access their own responses" ON responses
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- ==============================================
-- 8. 更新日時の自動更新関数
-- ==============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 更新日時トリガーを設定
CREATE TRIGGER update_problems_updated_at 
  BEFORE UPDATE ON problems 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_responses_updated_at 
  BEFORE UPDATE ON responses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- 9. テストデータ用のサンプル問題
-- ==============================================

-- 問題1: 通常の三段論法問題
INSERT INTO problems (problem_id, title, argument, options, total_steps, steps, version) VALUES (
  'TLU-A-v1.0.0',
  '問題1',
  'PであるならばQである。また，QであるならばRである。したがって，PであるならばRである。',
  '["Pである", "Qである", "Rである"]',
  3,
  '{
    "step1": {
      "rubric": {
        "correct_answer": {
          "antecedent": "Pである",
          "consequent": "Rである"
        }
      },
    },
    "step2": {
      "rubric": {
        "answer_type": "selectable",
        "correct_answer": {
          "premise": "Qである",
          "link_directions": {
            "antecedent-link": true,
            "consequent-link": true
          }
        }
      },
    },
    "step3": {
      "rubric": {
        "correct_answer": {
          "inference_type": "演繹推論",
          "validity": true
        }
      }
    }
  }',
  '1.0.0'
);

-- 問題2: 組立不可が正解となる問題
INSERT INTO problems (problem_id, title, argument, options, total_steps, steps, version) VALUES (
  'TLU-B-v1.0.0',
  '問題2（組立不可問題の例）',
  'PであるならばQである。また，QであるならばRである。したがって，RであるならばSである。',
  '["Pである", "Qである", "Rである", "Sである"]',
  3,
  '{
    "step1": {
      "rubric": {
        "correct_answer": {
          "antecedent": "Rである",
          "consequent": "Sである"
        }
      }
    },
    "step2": {
      "rubric": {
        "answer_type": "impossible"
      }
    },
    "step3": {
      "rubric": {
        "correct_answer": {
          "inference_type": "非形式推論",
          "validity": false
        }
      }
    }
  }',
  '1.0.0'
);

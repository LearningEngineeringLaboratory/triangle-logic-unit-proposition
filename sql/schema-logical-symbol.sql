-- 比較実験用ログテーブル: events_logical_symbol
-- 作成日: 2025-01-XX
-- 用途: 比較実験用の操作ログ管理（eventsテーブルとは分離）

-- ==============================================
-- events_logical_symbol テーブル（比較実験用操作ログ）
-- ==============================================
CREATE TABLE events_logical_symbol (
    event_id TEXT PRIMARY KEY, -- イベントID（ULID形式）
    session_id TEXT NOT NULL, -- セッションID（外部キー）
    user_id TEXT NOT NULL, -- ユーザーID（外部キー）
    attempt_id TEXT, -- 試行ID（外部キー、問題非関連イベントではNULL）
    seq INTEGER NOT NULL, -- シーケンス番号（セッション内で一意）
    kind TEXT NOT NULL, -- イベント種別
    payload JSONB, -- イベント詳細データ
    state JSONB, -- イベント送信時の問題の全ての回答状況（JSONB形式）
    client_ts TIMESTAMP WITH TIME ZONE, -- クライアント側タイムスタンプ
    server_ts TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- サーバー側タイムスタンプ
    idempotency_key TEXT UNIQUE -- 冪等性キー（重複防止）
);

-- 外部キー制約
ALTER TABLE events_logical_symbol
ADD CONSTRAINT fk_events_logical_symbol_session_id FOREIGN KEY (session_id) REFERENCES sessions (session_id) ON DELETE CASCADE;

ALTER TABLE events_logical_symbol
ADD CONSTRAINT fk_events_logical_symbol_user_id FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE;

ALTER TABLE events_logical_symbol
ADD CONSTRAINT fk_events_logical_symbol_attempt_id FOREIGN KEY (attempt_id) REFERENCES attempts (attempt_id) ON DELETE CASCADE;

-- インデックス
CREATE INDEX idx_events_logical_symbol_session_id ON events_logical_symbol (session_id);
CREATE INDEX idx_events_logical_symbol_user_id ON events_logical_symbol (user_id);
CREATE INDEX idx_events_logical_symbol_attempt_id ON events_logical_symbol (attempt_id);
CREATE INDEX idx_events_logical_symbol_kind ON events_logical_symbol (kind);
CREATE INDEX idx_events_logical_symbol_server_ts ON events_logical_symbol (server_ts);
CREATE UNIQUE INDEX idx_events_logical_symbol_session_seq ON events_logical_symbol (session_id, seq);

-- ==============================================
-- Row Level Security (RLS) 設定
-- ==============================================
ALTER TABLE events_logical_symbol ENABLE ROW LEVEL SECURITY;

-- events_logical_symbol テーブルのRLSポリシー
-- ユーザーは自分のイベントログのみアクセス可能
CREATE POLICY "Users can access their own events_logical_symbol" ON events_logical_symbol FOR ALL USING (
    user_id = current_setting ('app.current_user_id', true)
);


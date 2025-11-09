# データベーススキーマ設計書 v0.4

## 概要

単位命題三角ロジック演習システムのデータベース設計書です。学習過程の詳細ログを収集・分析するための基盤として設計されています。

**更新履歴**:
- v0.4: ステップ構成の変更（5ステップ対応）、リンク情報のデータ構造変更

## テーブル一覧

| テーブル名 | 用途 | 主要フィールド |
|-----------|------|---------------|
| `users` | ユーザー情報管理 | user_id, name, email |
| `problems` | 問題データ管理 | problem_id, argument, correct_answers, options, version |
| `sessions` | セッション管理 | session_id, user_id, created_at, last_activity |
| `attempts` | 試行記録管理 | attempt_id, session_id, user_id, problem_id, status |
| `events` | 操作ログ管理 | event_id, session_id, user_id, attempt_id, kind, payload |
| `responses` | 回答状態管理 | response_id, session_id, user_id, problem_id, problem_number, state, current_step, is_completed |

## 詳細設計

### 1. users テーブル

**用途**: ユーザー情報の管理

| フィールド名 | データ型 | 制約 | 説明 |
|-------------|----------|------|------|
| user_id | TEXT | PRIMARY KEY | ULID形式のユニークID |
| name | TEXT | NOT NULL | ユーザー名 |
| email | TEXT | UNIQUE NOT NULL | メールアドレス（重複不可） |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 登録日時 |

**インデックス**:
- `idx_users_email`: メールアドレス検索用
- `idx_users_created_at`: 登録日時検索用

### 2. problems テーブル

**用途**: 問題データの管理

| フィールド名 | データ型 | 制約 | 説明 |
|-------------|----------|------|------|
| problem_id | TEXT | PRIMARY KEY | 問題ID（例: TLU-A-v1.0.0） |
| argument | TEXT | NOT NULL | 論証文（問題文） |
| correct_answers | JSONB | NOT NULL | 各ステップの正解データ（JSONB形式） |
| options | JSONB | NULL可 | 単位命題の共通選択肢（全ステップ共通） |
| version | TEXT | NOT NULL | 問題バージョン |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 更新日時 |

**JSONBフィールドの詳細**:

- `options`: 単位命題の共通選択肢
  ```json
  ["Pである", "Qである", "Rである", "Sである"]
  ```

- `correct_answers`: 各ステップの正解データ
  ```json
  {
    "step1": {
      "antecedent": "Pである",
      "consequent": "Rである"
    },
    "step2": [
      { "from": "Pである", "to": "Qである" },
      { "from": "Qである", "to": "Rである" }
    ],
    "step3": {
      "inference_type": "仮説推論",
      "validity": true
    },
    "step4": [
      { "from": "Pである", "to": "Qである", "active": true },
      { "from": "Qである", "to": "Rである", "active": true },
      { "from": "Pである", "to": "Rである", "active": false }
    ],
    "step5": [
      { "antecedent": "Pである", "consequent": "Qである" },
      { "antecedent": "Qである", "consequent": "Rである" }
    ]
  }
  ```
  - **Step1**: 導出命題の前件・後件
  - **Step2**: 正解リンク配列のみ（premiseは正解判定に不要）
  - **Step3**: 推論形式と妥当性
  - **Step4**: リンクの活性/非活性（`active`フラグ: true=必要、false=不要）
  - **Step5**: 妥当性のある三項論証（常に2つの条件文）

**Step3の推論形式選択肢**:
- **演繹推論**: 形式推論であり、妥当な推論
- **仮説推論**: 非妥当であるが形式推論であり、導出命題に検証価値がある推論
- **非形式推論**: 非妥当な非形式推論

**Step3の妥当性選択肢**:
- **true (妥当)**: 所与命題が真であれば導出命題が必ず真となる推論
- **false (非妥当)**: 所与命題が真であっても導出命題が真とは言えない推論

### 3. sessions テーブル

**用途**: セッション管理

| フィールド名 | データ型 | 制約 | 説明 |
|-------------|----------|------|------|
| session_id | TEXT | PRIMARY KEY | セッションID（ULID形式） |
| user_id | TEXT | NOT NULL | ユーザーID（外部キー） |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | セッション開始日時 |
| last_activity | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 最終活動日時 |

**外部キー制約**:
- `fk_sessions_user_id`: users.user_id を参照

### 4. attempts テーブル

**用途**: 試行記録の管理

| フィールド名 | データ型 | 制約 | 説明 |
|-------------|----------|------|------|
| attempt_id | TEXT | PRIMARY KEY | 試行ID（ULID形式） |
| session_id | TEXT | NOT NULL | セッションID（外部キー） |
| user_id | TEXT | NOT NULL | ユーザーID（外部キー） |
| problem_id | TEXT | NOT NULL | 問題ID（外部キー） |
| started_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 開始日時 |
| finished_at | TIMESTAMP WITH TIME ZONE | NULL可 | 終了日時（NULL=進行中） |
| status | TEXT | NOT NULL DEFAULT 'in_progress' | ステータス |

**ステータス値**:
- `in_progress`: 進行中
- `completed`: 完了

### 5. events テーブル

**用途**: 操作ログの管理

| フィールド名 | データ型 | 制約 | 説明 |
|-------------|----------|------|------|
| event_id | TEXT | PRIMARY KEY | イベントID（ULID形式） |
| session_id | TEXT | NOT NULL | セッションID（外部キー） |
| user_id | TEXT | NOT NULL | ユーザーID（外部キー） |
| attempt_id | TEXT | NOT NULL | 試行ID（外部キー） |
| seq | INTEGER | NOT NULL | シーケンス番号（セッション内で一意） |
| kind | TEXT | NOT NULL | イベント種別 |
| payload | JSONB | NULL可 | イベント詳細データ |
| client_ts | TIMESTAMP WITH TIME ZONE | NULL可 | クライアント側タイムスタンプ |
| server_ts | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | サーバー側タイムスタンプ |
| idempotency_key | TEXT | UNIQUE | 冪等性キー（重複防止） |

**イベント種別**:
- `user_registered`: ユーザー登録（`name`, `email`）
- `session_created`: セッション作成（`user_id`, `session_id`）
- `session_restored`: セッション復帰（`user_id`, `session_id`）
- `continue_dialog_shown`: 継続確認ダイアログ表示（`user_id`, `problem_number`, `current_step`）
- `continue_selected`: 継続方法選択（`user_id`, `choice`, `problem_number`, `current_step`）
- `select_dropdown`: ドロップダウン選択（`control_id`, `value`）
- `link_created`: リンク作成（`from_node`, `to_node`）
- `link_deleted`: リンク削除（`from_node`, `to_node`）
- `link_marked_inactive`: リンクを不要としてマーク（`link_id`, `active: false`）
- `link_marked_active`: リンクを必要としてマーク（`link_id`, `active: true`）
- `step_completed`: ステップ完了（`step`, `result`, `is_correct`）
- `attempt_started`: 試行開始（`problem_id`）
- `attempt_finished`: 試行終了（`problem_id`, `success`）
- `check_answer`: 答え合わせボタンクリック
- `step_navigation`: ステップ切り替え（`from_step`, `to_step`）

### 6. responses テーブル

**用途**: 回答状態の管理

| フィールド名 | データ型 | 制約 | 説明 |
|-------------|----------|------|------|
| response_id | TEXT | PRIMARY KEY | 回答ID（ULID形式） |
| session_id | TEXT | NOT NULL | セッションID（外部キー） |
| user_id | TEXT | NOT NULL | ユーザーID（外部キー） |
| problem_id | TEXT | NOT NULL | 問題ID（外部キー） |
| problem_number | INTEGER | NOT NULL | 問題番号（1, 2, 3...） |
| state | JSONB | NOT NULL | 全ステップの回答状態（JSONB形式） |
| current_step | INTEGER | NOT NULL DEFAULT 1 | 現在のステップ番号 |
| is_completed | BOOLEAN | NOT NULL DEFAULT FALSE | 問題全体の完了状態 |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 更新日時 |

**stateフィールドの例**:

**3ステップで完了する場合（演繹推論）**:
```json
{
  "step1": {
    "antecedent": "Pである",
    "consequent": "Rである",
    "is_passed": true
  },
  "step2": {
    "links": [
      { "from": "node1", "to": "node2" },
      { "from": "node2", "to": "node3" }
    ],
    "is_passed": true
  },
  "step3": {
    "inference_type": "演繹推論",
    "validity": true,
    "is_passed": true
  }
}
```

**5ステップまで進む場合（演繹推論以外）**:
```json
{
  "step1": {
    "antecedent": "Pである",
    "consequent": "Rである",
    "is_passed": true
  },
  "step2": {
    "links": [
      { "from": "node1", "to": "node3" }
    ],
    "is_passed": true
  },
  "step3": {
    "inference_type": "非形式推論",
    "validity": false,
    "is_passed": true
  },
  "step4": {
    "links": [
      { "from": "node1", "to": "node3", "active": false },
      { "from": "node1", "to": "node2", "active": true },
      { "from": "node2", "to": "node3", "active": true }
    ],
    "is_passed": true
  },
  "step5": {
    "premises": [
      { "antecedent": "Pである", "consequent": "Qである" },
      { "antecedent": "Qである", "consequent": "Rである" }
    ],
    "is_passed": false
  }
}
```

## セキュリティ設定

### Row Level Security (RLS)

全テーブルでRLSを有効化し、ユーザーは自分のデータのみアクセス可能に設定。

**ポリシー**:
- `users`: ユーザーは自分のデータのみアクセス可能
- `problems`: 認証済みユーザーは全問題を読み取り可能
- `sessions`, `attempts`, `events`, `responses`: ユーザーは自分のデータのみアクセス可能

## インデックス設計

### パフォーマンス最適化

各テーブルに適切なインデックスを設定し、クエリパフォーマンスを最適化。

**主要インデックス**:
- 外部キー関連のインデックス
- 検索頻度の高いフィールドのインデックス
- 時系列データのインデックス

## データの整合性

### 外部キー制約

テーブル間の関係性を外部キー制約で保証。

### 更新日時の自動更新

`problems`と`responses`テーブルで更新日時を自動更新するトリガーを設定。

## テストデータ

開発・テスト用のサンプルデータを`sql/test-data.sql`に定義。

## 運用上の注意点

1. **ULIDの使用**: 時系列順序が保たれるユニークID
2. **JSONBフィールド**: 柔軟なデータ構造をサポート
3. **RLS設定**: セキュリティを最優先に考慮
4. **インデックス**: クエリパフォーマンスを最適化
5. **データ保持**: 研究用データの長期保存を考慮
6. **統合状態管理**: `responses.state`で全ステップの状態を一元管理
7. **問題番号管理**: `problem_number`で問題の順序を管理し、適切な進捗復帰を実現
8. **可変ステップ対応**: JSONB構造により問題ごとに異なるステップ数に対応可能（3ステップまたは5ステップ）
9. **ログ分析の簡素化**: テーブル統合によりJOINが不要で分析クエリが簡潔
10. **リンク情報の管理**: Step2とStep4でリンク情報を分離して保持し、学習過程を詳細に記録
11. **ReactFlow対応**: リンク構造はReactFlowのEdge形式に対応したデータ構造

# 回答パターン設計書

## 概要

単位命題三角ロジック演習システムにおける回答パターンの設計書です。選択肢の数に応じて異なる回答方式を採用しています。

## 回答パターンの分類

### 1. 通常の選択式回答

**条件**: 所与命題を組み立てることが可能な問題

**特徴**:
- Step2で所与命題を組み立てることが可能
- ドロップダウン選択とリンク方向の調整で回答
- 組立不可ボタンも常に表示（クリック可能）

**データ構造**:
```json
{
  "step2": {
    "answer_type": "selectable",
    "premise": {"from": "Pである", "to": "Qである"},
    "link_directions": {
      "antecedent-link": true,
      "consequent-link": true
    }
  }
}
```

**正解条件**:
```json
{
  "step2": {
    "answer_type": "selectable",
    "correct_answer": {
      "premise": {"from": "Pである", "to": "Qである"},
      "link_directions": {
        "antecedent-link": true,
        "consequent-link": true
      }
    }
  }
}
```

### 2. 組立不可回答

**条件**: 所与命題を組み立てることが不可能な問題

**特徴**:
- Step2で所与命題を組み立てることが不可能
- 組立不可ボタンをクリックして回答
- ドロップダウン選択も可能（ただし正解ではない）

**データ構造**:
```json
{
  "step2": {
    "answer_type": "impossible",
    "is_impossible": true
  }
}
```

**正解条件**:
```json
{
  "step2": {
    "answer_type": "impossible",
    "correct_answer": {
      "is_impossible": true
    }
  }
}
```

## 判定ロジック

### 回答タイプの判定

```typescript
// 問題データのrubricから回答タイプを判定
function determineAnswerType(rubric: any): 'selectable' | 'impossible' {
  return rubric.step2.answer_type;
}
```

### 正解判定

```typescript
function checkStep2Answer(userAnswer: any, correctAnswer: any): boolean {
  // 回答タイプが一致しているかチェック
  if (userAnswer.answer_type !== correctAnswer.answer_type) {
    return false;
  }
  
  if (correctAnswer.answer_type === "impossible") {
    // 組立不可の場合
    return userAnswer.is_impossible === true;
  } else {
    // 通常の選択式の場合
    return userAnswer.premise.from === correctAnswer.premise.from &&
           userAnswer.premise.to === correctAnswer.premise.to &&
           userAnswer.link_directions["antecedent-link"] === correctAnswer.link_directions["antecedent-link"] &&
           userAnswer.link_directions["consequent-link"] === correctAnswer.link_directions["consequent-link"];
  }
}
```

## イベントログ

### 通常の選択式回答

```json
{
  "kind": "select_dropdown",
  "payload": {
    "control_id": "step2_premise_from",
    "value": "Pである"
  }
}
```

```json
{
  "kind": "toggle_link_direction",
  "payload": {
    "link_id": "antecedent-link",
    "new_direction": true
  }
}
```

### 組立不可回答

```json
{
  "kind": "click_impossible_button",
  "payload": {
    "step": 2,
    "is_impossible": true
  }
}
```

## UI表示の制御

### 統一されたUI表示

```typescript
// UIは常に統一されており、問題の種類に関係なく同じ要素を表示
function renderStep2UI() {
  return {
    dropdowns: true,        // 常に表示
    linkDirectionToggles: true,  // 常に表示
    impossibleButton: true  // 常に表示
  };
}
```

### 問題例

#### 通常の選択式問題
- **選択肢**: `["Pである", "Qである", "Rである"]`
- **Step2**: ドロップダウン選択 + リンク方向調整 + 組立不可ボタン
- **正解**: ドロップダウンとリンク方向の組み合わせ

#### 組立不可問題
- **選択肢**: `["Pである", "Qである", "Rである", "Sである"]`
- **Step2**: ドロップダウン選択 + リンク方向調整 + 組立不可ボタン
- **正解**: 組立不可ボタンのクリック

## データベース設計への影響

### problemsテーブル

- `rubric`フィールドで`answer_type`を明示（選択肢数とは無関係）
- `options`フィールドは選択肢の配列（UI表示用）

### responsesテーブル

- `state`フィールドで回答タイプを保存
- 回答タイプに応じて異なるデータ構造を格納

### eventsテーブル

- 回答タイプに応じて異なるイベント種別を記録
- `payload`で回答の詳細を保存

## 実装時の考慮事項

1. **フロントエンド**: UIは常に統一（問題の種類に関係なく同じ要素を表示）
2. **バックエンド**: 回答タイプに応じて異なる検証ロジックを適用
3. **データベース**: 回答タイプの整合性を保証
4. **ログ**: 回答タイプに応じて適切なイベントを記録

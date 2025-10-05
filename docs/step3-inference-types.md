# Step3 推論形式と妥当性の選択肢

## 概要

Step3では、どの問題であっても推論形式と妥当性の2つの選択肢を提供します。これらは固定の選択肢であり、問題の内容に関係なく同じUIで表示されます。

## 推論形式の選択肢

### 1. 演繹推論（Deductive Reasoning）
**説明**: 論理的に必然的な推論
**特徴**: 
- 前提が真であれば、結論は必ず真
- 論理的に確実な推論
- 例: 「すべての人間は死ぬ。ソクラテスは人間である。したがって、ソクラテスは死ぬ。」

### 2. 仮説推論（Hypothetical Reasoning）
**説明**: 仮説に基づく推論
**特徴**:
- 仮定を前提とした推論
- 仮説が真であれば結論が真
- 例: 「もし雨が降れば、地面が濡れる。雨が降った。したがって、地面が濡れる。」

### 3. 非形式推論（Informal Reasoning）
**説明**: 形式的でない推論
**特徴**:
- 論理的形式に依存しない推論
- 文脈や常識に基づく推論
- 例: 「彼はいつも遅刻する。今日も遅刻するだろう。」

## 妥当性の選択肢

### 1. 妥当（Valid）
**説明**: 推論が正しい
**特徴**:
- 論理的に正しい推論
- 前提が真であれば結論も真
- 推論形式が正しい

### 2. 非妥当（Invalid）
**説明**: 推論が正しくない
**特徴**:
- 論理的に正しくない推論
- 前提が真でも結論が偽の可能性
- 推論形式に誤りがある

## データ構造

### 正解条件の例
```json
{
  "step3": {
    "description": "推論形式と妥当性を選択してください",
    "correct_answer": {
      "inference_type": "演繹",
      "validity": "妥当"
    }
  }
}
```

### 回答状態の例
```json
{
  "step3": {
    "inference_type": "演繹",
    "validity": "妥当"
  }
}
```

## UI実装

### 推論形式選択
```tsx
<select name="inference_type">
  <option value="演繹">演繹推論</option>
  <option value="仮説">仮説推論</option>
  <option value="非形式">非形式推論</option>
</select>
```

### 妥当性選択
```tsx
<select name="validity">
  <option value="妥当">妥当</option>
  <option value="非妥当">非妥当</option>
</select>
```

## 正解判定ロジック

```typescript
function checkStep3Answer(userAnswer: any, correctAnswer: any): boolean {
  return userAnswer.inference_type === correctAnswer.inference_type &&
         userAnswer.validity === correctAnswer.validity;
}
```

## イベントログ

### 推論形式選択
```json
{
  "kind": "select_dropdown",
  "payload": {
    "control_id": "step3_inference_type",
    "value": "演繹"
  }
}
```

### 妥当性選択
```json
{
  "kind": "select_dropdown",
  "payload": {
    "control_id": "step3_validity",
    "value": "妥当"
  }
}
```

## 問題例での正解パターン

### 通常の三段論法（演繹・妥当）
- **問題**: PであるならばQである。また、QであるならばRである。したがって、PであるならばRである。
- **正解**: 演繹推論、妥当

### 組立不可問題（演繹・非妥当）
- **問題**: PであるならばQである。また、QであるならばRである。したがって、RであるならばSである。
- **正解**: 演繹推論、非妥当

### 仮説推論の例（仮説・妥当）
- **問題**: もしPであるならばQである。Pである。したがって、Qである。
- **正解**: 仮説推論、妥当

## 実装時の考慮事項

1. **固定選択肢**: 全ての問題で同じ選択肢を表示
2. **UI一貫性**: Step1、Step2と同様に統一されたUI
3. **バリデーション**: 両方の選択が必須
4. **ログ記録**: 選択操作を詳細に記録

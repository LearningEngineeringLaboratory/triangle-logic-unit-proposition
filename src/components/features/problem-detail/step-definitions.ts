interface StepDefinition {
  number: number
  title: string
  content: string
  hint?: string
}

export function buildStepDefinitions(totalSteps: number): StepDefinition[] {
  const steps: StepDefinition[] = []

  for (let i = 1; i <= totalSteps; i++) {
    if (i === 1) {
      steps.push({
        number: 1,
        title: '導出命題を構成',
        content: 'この論証が導いている命題（導出命題）を構成しましょう。',
        hint: '「したがって」や「よって」、「とすると」などの接続詞がある命題に着目しましょう。',
      })
      continue
    }

    if (i === 2) {
      steps.push({
        number: 2,
        title: '三角ロジックの構成',
        content: 'この論証の前提となる命題（所与命題）を構成しましょう。\n\n 1. 前提に必要な部品を追加\n 2. 論証が表す意味と同じになるように、リンクを接続',
      })
      continue
    }

    if (i === 3) {
      steps.push({
        number: 3,
        title: '推論形式と妥当性の判別',
        content: '構成した三角ロジックをもとに、この論証の推論形式と妥当性を答えましょう。',
      })
      continue
    }

    if (i === 4) {
      steps.push({
        number: 4,
        title: '妥当性のある三角ロジックの構成',
        content: '三角ロジックを修正して妥当性のある論証になるような三角ロジックを構成しましょう。',
      })
      continue
    }

    if (i === 5) {
      steps.push({
        number: 5,
        title: '妥当性のある三項論証を構成',
        content: '修正した三角ロジックをもとに、妥当性のある三項論証を構成しましょう。',
      })
      continue
    }

    steps.push({
      number: i,
      title: `ステップ${i}`,
      content: `ステップ${i}の内容をここに記述します。`,
      hint: `ステップ${i}のヒントをここに記述します。`,
    })
  }

  return steps
}

export type { StepDefinition }

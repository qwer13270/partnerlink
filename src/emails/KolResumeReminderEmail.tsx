import { Button, Section, Text } from '@react-email/components'
import { EmailLayout, emailStyles } from './_layout'

export type ReminderStage = 3 | 7 | 14

type KolResumeReminderEmailProps = {
  fullName: string
  stage: ReminderStage
  missingPhoto: boolean
  missingPortfolio: boolean
  appUrl: string
}

function missingBits(missingPhoto: boolean, missingPortfolio: boolean) {
  const parts: string[] = []
  if (missingPhoto) parts.push('個人頭像')
  if (missingPortfolio) parts.push('作品集')
  return parts.join('與')
}

function stageCopy(stage: ReminderStage, missing: string) {
  if (stage === 3) {
    return {
      heading: '提醒一下：你的履歷還差一點就完成了',
      lead: `你加入 PartnerLink 已經三天了，目前履歷還缺少${missing}。補齊後，合作商家才能更快認識你。`,
      nudge: '只需要幾分鐘，就能讓你的頁面完整呈現。',
    }
  }
  if (stage === 7) {
    return {
      heading: '完整的履歷能明顯提升合作機會',
      lead: `你的履歷還缺少${missing}。根據平台統計，履歷完整的 KOL 被商家主動接洽的機率高出許多。`,
      nudge: '補上素材，讓你的頁面更有說服力。',
    }
  }
  return {
    heading: '最後提醒：完成履歷，開始接洽合作',
    lead: `已經兩週了，你的履歷仍缺少${missing}。完成後，你的檔案才會正式對商家公開。`,
    nudge: '現在就補上，別錯過接下來的合作邀約。',
  }
}

export default function KolResumeReminderEmail({
  fullName,
  stage,
  missingPhoto,
  missingPortfolio,
  appUrl,
}: KolResumeReminderEmailProps) {
  const resumeUrl = `${appUrl}/kol/resume/edit`
  const missing = missingBits(missingPhoto, missingPortfolio) || '部分資料'
  const copy = stageCopy(stage, missing)

  return (
    <EmailLayout preview={`${fullName}，你的 KOL 履歷還差一步`}>
      <Section>
        <Text style={emailStyles.heading}>{copy.heading}</Text>
        <Text style={emailStyles.paragraph}>{fullName} 你好，</Text>
        <Text style={emailStyles.paragraph}>{copy.lead}</Text>
        <Text style={emailStyles.paragraph}>{copy.nudge}</Text>
        <Button href={resumeUrl} style={emailStyles.button}>
          前往完成履歷
        </Button>
        <Text style={emailStyles.subtle}>
          如果按鈕無法點擊，請複製此連結：
          <br />
          {resumeUrl}
        </Text>
      </Section>
    </EmailLayout>
  )
}

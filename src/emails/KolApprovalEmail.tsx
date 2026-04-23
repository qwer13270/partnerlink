import { Button, Section, Text } from '@react-email/components'
import { EmailLayout, emailStyles } from './_layout'

type KolApprovalEmailProps = {
  fullName: string
  appUrl: string
}

export default function KolApprovalEmail({ fullName, appUrl }: KolApprovalEmailProps) {
  const dashboardUrl = `${appUrl}/kol/home`

  return (
    <EmailLayout preview={`${fullName}，你的 KOL 申請已通過審核`}>
      <Section>
        <Text style={emailStyles.heading}>歡迎加入 PartnerLink，{fullName}！</Text>
        <Text style={emailStyles.paragraph}>
          你的 KOL 申請已經通過審核，帳號已正式啟用。現在就能登入儀表板，開始接洽建案與商家合作、建立可追蹤的推薦連結。
        </Text>
        <Text style={emailStyles.paragraph}>
          為了讓合作商家更認識你，建議你盡快完成個人履歷 — 上傳頭像、補齊作品集與合作經驗，能明顯提升被接洽的機會。
        </Text>
        <Button href={dashboardUrl} style={emailStyles.button}>
          前往 KOL 儀表板
        </Button>
        <Text style={emailStyles.subtle}>
          如果按鈕無法點擊，請複製此連結：
          <br />
          {dashboardUrl}
        </Text>
      </Section>
    </EmailLayout>
  )
}

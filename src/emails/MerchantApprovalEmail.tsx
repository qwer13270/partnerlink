import { Button, Section, Text } from '@react-email/components'
import { EmailLayout, emailStyles } from './_layout'

type MerchantApprovalEmailProps = {
  contactName: string
  companyName: string
  merchantType: 'property' | 'shop' | null
  appUrl: string
}

export default function MerchantApprovalEmail({
  contactName,
  companyName,
  merchantType,
  appUrl,
}: MerchantApprovalEmailProps) {
  const dashboardUrl = `${appUrl}/merchant/home`

  const typeLabel = merchantType === 'property' ? '建案' : merchantType === 'shop' ? '商案' : '合作'
  const typeGuidance =
    merchantType === 'property'
      ? '建議你先建立建案專案頁、補上基本資訊與視覺素材，KOL 就能開始為你產生專屬的推薦連結。'
      : merchantType === 'shop'
        ? '建議你先建立店家專案頁，補齊地點、合作方案與素材，KOL 就能開始為你導流與追蹤成效。'
        : '建議你先完成商家資料與專案頁，讓 KOL 能快速掌握合作重點。'

  return (
    <EmailLayout preview={`${companyName}，你的商家申請已通過審核`}>
      <Section>
        <Text style={emailStyles.heading}>{companyName} 已完成 {typeLabel}商家審核</Text>
        <Text style={emailStyles.paragraph}>
          {contactName} 你好，你在 PartnerLink 的商家申請已通過審核，帳號已正式啟用。
        </Text>
        <Text style={emailStyles.paragraph}>{typeGuidance}</Text>
        <Button href={dashboardUrl} style={emailStyles.button}>
          前往商家儀表板
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

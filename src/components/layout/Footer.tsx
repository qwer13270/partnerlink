'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLocale } from '@/hooks/useLocale'

export default function Footer() {
  const t = useTranslations('footer')
  const { isZhTW, locale } = useLocale()
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    { label: isZhTW ? '所有建案' : 'Properties', href: `/${locale}/properties` },
    { label: isZhTW ? 'KOL 合作' : 'For KOLs', href: '#' },
    { label: isZhTW ? '建商合作' : 'For Developers', href: '#' },
    { label: isZhTW ? '關於我們' : 'About', href: '#' },
  ]

  return (
    <footer className="border-t border-border">
      {/* Main Footer */}
      <div className="editorial-container section-editorial-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-5"
          >
            <Link href={`/${locale}`} className="inline-flex items-center gap-3 mb-6">
              <span className="text-xl font-semibold">HomeKey</span>
              {isZhTW && (
                <span className="text-lg text-muted-foreground">房客</span>
              )}
            </Link>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
              {isZhTW
                ? '台灣頂級房地產聯盟行銷平台。我們連結優質建案與具影響力的KOL，創造共贏的行銷新模式。'
                : 'Taiwan\'s premier real estate affiliate platform. We connect quality properties with influential KOLs, creating a win-win marketing model.'}
            </p>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="md:col-span-3"
          >
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-6">
              {isZhTW ? '導航' : 'Navigation'}
            </h4>
            <ul className="space-y-4">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors duration-200 group"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-4"
          >
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-6">
              {isZhTW ? '聯絡方式' : 'Contact'}
            </h4>
            <ul className="space-y-4 text-foreground">
              <li>
                <a
                  href="mailto:contact@homekey.tw"
                  className="hover:text-muted-foreground transition-colors duration-200"
                >
                  contact@homekey.tw
                </a>
              </li>
              <li>+886 2 1234 5678</li>
              <li className="text-muted-foreground">
                {isZhTW ? '台北市信義區信義路五段7號' : '7 Xinyi Rd. Sec. 5, Xinyi Dist., Taipei'}
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="editorial-container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>{t('copyright', { year: currentYear })}</p>
            <p className="text-center md:text-right max-w-md">
              {t('disclaimer')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

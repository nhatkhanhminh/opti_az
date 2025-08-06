"use client"

import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"

const faqs = [
  {
    category: "general",
    questions: [
      {
        key: "aiStaking",
        question: "What is AI-powered staking?",
        answer:
          "Our AI-powered staking platform combines traditional staking with advanced artificial intelligence trading algorithms. The AI bot trades across multiple exchanges 24/7 to generate optimal returns for our stakers.",
      },
      {
        key: "returns",
        question: "How are the returns generated?",
        answer:
          "Returns are generated through a combination of staking rewards and AI trading profits. Our system automatically executes trades across various cryptocurrency exchanges to maximize profits while maintaining strict risk management protocols.",
      },
      {
        key: "lockup",
        question: "Is there a lock-up period?",
        answer:
          "No, there is no lock-up period. You can withdraw your earnings daily. However, each stake will automatically stop once it reaches 400% of the initial investment.",
      },
    ],
  },
  {
    category: "staking",
    questions: [
      {
        key: "amounts",
        question: "What are the minimum and maximum stake amounts?",
        answer:
          "The minimum stake amount is $100. Maximum amounts vary by plans: Starter ($100-$999), Bronze ($1,000-$4,999), Silver ($5,000-$9,999), Gold ($10,000-$19,999), and Diamond ($20,000+).",
      },
      {
        key: "tokens",
        question: "Which tokens can I stake?",
        answer:
          "Currently, we support staking of USDT, FIL, LINK, and BNB. We regularly evaluate and may add more tokens based on market conditions and community demand.",
      },
      {
        key: "rewards",
        question: "How often can I claim rewards?",
        answer:
          "Rewards can be claimed daily. The monthly APY ranges from 9% to 18% depending on your staking tier, and you can continue earning until reaching 400% of your initial stake.",
      },
    ],
  },
  {
    category: "partner",
    questions: [
      {
        key: "referral",
        question: "How does the referral program work?",
        answer:
          "Our partner program offers three types of commissions: Direct Referral (6% for F1, 1% for F2 and F3), Profit Sharing across 10 levels (1-10%), and Leader Performance Bonus (up to 3% extra commission).",
      },
      {
        key: "requirements",
        question: "What are the requirements for each leader rank?",
        answer:
          "Leader ranks are based on team volume: Silver ($100K), Gold ($500K), Platinum ($1M), Diamond ($5M), and Royal ($10M). Each rank comes with increased commission rates and benefits.",
      },
      {
        key: "commissions",
        question: "How are commissions calculated and paid?",
        answer:
          "Commissions are calculated based on your referrals' staking amounts and profits. They are paid in the same token as the original stake and can be claimed daily.",
      },
    ],
  },
  {
    category: "security",
    questions: [
      {
        key: "platform",
        question: "How secure is the platform?",
        answer:
          "We implement multiple security measures including multi-signature wallets, real-time monitoring systems, and regular security audits. Our AI trading system also includes risk management protocols to protect user funds.",
      },
      {
        key: "losses",
        question: "What happens if the AI bot makes losses?",
        answer:
          "Our AI system is designed with strict risk management protocols. While trading involves inherent risks, we maintain reserve funds to ensure consistent staking rewards regardless of market conditions.",
      },
      {
        key: "audits",
        question: "Are the smart contracts audited?",
        answer:
          "Yes, all our smart contracts are audited by leading blockchain security firms. Audit reports are publicly available, and we regularly undergo security assessments.",
      },
    ],
  },
]

export default function FAQ() {
  const t = useTranslations('FAQSection')

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            {t('badge')}
          </Badge>
          <h2 className="text-4xl font-bold mb-4">{t('title')}</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {faqs.map((category, index) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{t(`categories.${category.category}.title`)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`${index}-${faqIndex}`}>
                        <AccordionTrigger>
                          {t(`categories.${category.category}.questions.${faq.key}.question`)}
                        </AccordionTrigger>
                        <AccordionContent>
                          {t(`categories.${category.category}.questions.${faq.key}.answer`)}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, Shield, Wallet, Users, Code } from "lucide-react"
import { useTranslations } from "next-intl"

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  [key: string]: FAQItem;
}

export default function FAQPage() {
  const t = useTranslations("FAQPage")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredFAQs, setFilteredFAQs] = useState<Record<string, FAQItem[]>>({})
  const [activeCategory, setActiveCategory] = useState("all")

  // Get FAQ data from translations, memoized with useMemo
  const faqData = useMemo(() => ({
    general: Object.entries(t.raw("questions.general") as FAQCategory).map(([key, value]) => ({
      question: value.question,
      answer: value.answer
    })),
    smartContract: Object.entries(t.raw("questions.smartContract") as FAQCategory).map(([key, value]) => ({
      question: value.question,
      answer: value.answer
    })),
    staking: Object.entries(t.raw("questions.staking") as FAQCategory).map(([key, value]) => ({
      question: value.question,
      answer: value.answer
    })),
    security: Object.entries(t.raw("questions.security") as FAQCategory).map(([key, value]) => ({
      question: value.question,
      answer: value.answer
    })),
    partnerProgram: Object.entries(t.raw("questions.partnerProgram") as FAQCategory).map(([key, value]) => ({
      question: value.question,
      answer: value.answer
    }))
  }), [t]); // faqData will recompute if 't' changes

  // Filter FAQs based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFAQs(faqData)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered: Record<string, FAQItem[]> = {}
    Object.keys(faqData).forEach((category) => {
      filtered[category] = (faqData[category as keyof typeof faqData]).filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query),
      )
    })

    setFilteredFAQs(filtered)
  }, [searchQuery, faqData]); // Added faqData to dependencies

  // Count total FAQs for a category or all categories
  const countFAQs = (category: string) => {
    if (category === "all") {
      return Object.values(filteredFAQs).reduce((total, items) => total + items.length, 0)
    }
    return filteredFAQs[category as keyof typeof filteredFAQs]?.length || 0
  }

  // Get icon for category 
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "general":
        return <FileText className="h-5 w-5" />
      case "smartContract":
        return <Code className="h-5 w-5" />
      case "staking":
        return <Wallet className="h-5 w-5" />
      case "security":
        return <Shield className="h-5 w-5" />
      case "partnerProgram":
        return <Users className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-emerald-400/90 to-cyan-300">{t("title")}</h1>
              <p className="text-muted-foreground">{t("description")}</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mb-8 max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("search.placeholder")}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* FAQ Categories and Content */}
          <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
            <div className="mb-8 overflow-auto">
              <TabsList className="inline-flex w-full justify-start">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{t("categories.all")}</span>
                  <Badge variant="secondary" className="ml-1">
                    {countFAQs("all")}
                  </Badge>
                </TabsTrigger>
                {Object.keys(faqData).map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="flex items-center gap-2"
                    disabled={countFAQs(category) === 0}
                  >
                    {getCategoryIcon(category)}
                    <span>{t(`categories.${category}`)}</span>
                    <Badge variant="secondary" className="ml-1">
                      {countFAQs(category)}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="all" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.keys(faqData).map((category) =>
                  filteredFAQs[category as keyof typeof faqData] && filteredFAQs[category as keyof typeof faqData].length > 0 ? (
                    <Card key={category}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {getCategoryIcon(category)}
                          {t(`categories.${category}`)}
                        </CardTitle>
                        <CardDescription>
                          {t("description")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                          {filteredFAQs[category as keyof typeof faqData].map((faq, index) => (
                            <AccordionItem key={index} value={`${category}-${index}`}>
                              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  ) : null,
                )}
              </div>
            </TabsContent>

            {Object.keys(faqData).map((category) => (
              <TabsContent key={category} value={category}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      {t(`categories.${category}`)}
                    </CardTitle>
                    <CardDescription>
                      {t("description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {filteredFAQs[category as keyof typeof faqData] && filteredFAQs[category as keyof typeof faqData].length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {filteredFAQs[category as keyof typeof faqData].map((faq, index) => (
                          <AccordionItem key={index} value={`${category}-${index}`}>
                            <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        {t("noResults.title")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          {/* No results message */}
          {countFAQs("all") === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">{t("noResults.title")}</h3>
              <p className="text-muted-foreground">{t("noResults.description")}</p>
            </div>
          )}

          {/* Still need help section */}
          <div className="mt-12 mb-8">
            <Card className="bg-primary/5">
              <CardContent className="pt-6 pb-6">
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-semibold">{t("stillNeedHelp.title")}</h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    {t("stillNeedHelp.description")}
                  </p>
                  <div className="flex justify-center gap-4 pt-2">
                    <a
                      href="mailto:hello@optifund.app"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                      {t("stillNeedHelp.contactSupport")}
                    </a>
                    <a
                      href="https://t.me/azcoin_app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                    >
                      {t("stillNeedHelp.joinTelegram")}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

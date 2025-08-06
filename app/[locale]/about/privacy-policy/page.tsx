"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

import { ArrowLeft, Shield, Eye, Lock, FileText, Users, Server, Bell, Globe, Mail } from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicyPage() {
  const t = useTranslations("PrivacyPolicy")

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">{t("backToHome")}</span>
                  </Link>
                </Button>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">{t("legalBadge")}</Badge>
              </div>
              <h1 className="text-3xl font-bold">{t("title")}</h1>
              <p className="text-muted-foreground">{t("lastUpdated")}</p>
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {t("introduction.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>{t("introduction.content")}</p>
            </CardContent>
          </Card>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  {t("informationCollection.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">{t("informationCollection.personalInfo.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("informationCollection.personalInfo.content")}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">{t("informationCollection.transactionData.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("informationCollection.transactionData.content")}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">{t("informationCollection.technicalData.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("informationCollection.technicalData.content")}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {t("informationUsage.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">{t("informationUsage.serviceProvision.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("informationUsage.serviceProvision.content")}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">{t("informationUsage.communication.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("informationUsage.communication.content")}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">{t("informationUsage.security.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("informationUsage.security.content")}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">{t("informationUsage.analytics.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("informationUsage.analytics.content")}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {t("dataSharing.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">{t("dataSharing.thirdParty.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("dataSharing.thirdParty.content")}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">{t("dataSharing.legalRequirements.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("dataSharing.legalRequirements.content")}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">{t("dataSharing.blockchainTransparency.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("dataSharing.blockchainTransparency.content")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  {t("dataSecurity.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t("dataSecurity.content")}
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <Server className="h-4 w-4 text-primary mt-1" />
                    <p className="text-sm">{t("dataSecurity.securityMeasures.servers")}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Lock className="h-4 w-4 text-primary mt-1" />
                    <p className="text-sm">{t("dataSecurity.securityMeasures.encryption")}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary mt-1" />
                    <p className="text-sm">{t("dataSecurity.securityMeasures.audits")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {t("userRights.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">{t("userRights.access.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("userRights.access.content")}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">{t("userRights.deletion.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("userRights.deletion.content")}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">{t("userRights.optOut.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("userRights.optOut.content")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  {t("cookies.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("cookies.description")}
                </p>
                <h3 className="font-medium mb-2">{t("cookies.types.essential.title")}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{t("cookies.types.essential.title")}</span>
                    <Badge>{t("cookies.types.essential.badge")}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("cookies.types.essential.description")}</p>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{t("cookies.types.functional.title")}</span>
                    <Badge variant="outline">{t("cookies.types.functional.badge")}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("cookies.types.functional.description")}</p>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{t("cookies.types.analytics.title")}</span>
                    <Badge variant="outline">{t("cookies.types.analytics.badge")}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("cookies.types.analytics.description")}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  {t("policyChanges.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("policyChanges.content")}
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">{t("policyChanges.updateProcess.title")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t("policyChanges.updateProcess.description")}
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                      <li>{t("policyChanges.updateProcess.methods.0")}</li>
                      <li>{t("policyChanges.updateProcess.methods.1")}</li>
                      <li>{t("policyChanges.updateProcess.methods.2")}</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">{t("policyChanges.previousVersions.title")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t("policyChanges.previousVersions.content")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                {t("contact.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t("contact.description")}
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium">
                  {t("contact.email")}
                </p>
                <p className="font-medium mt-2">
                  {t("contact.address")}
                </p>
                <p className="font-medium mt-2">{t("contact.dpo")}</p>
              </div>
              <div className="mt-6">
                <h3 className="font-medium mb-2">{t("contact.responseTime.title")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("contact.responseTime.content")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t("additionalInfo.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">{t("additionalInfo.internationalTransfers.title")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("additionalInfo.internationalTransfers.content")}
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">{t("additionalInfo.dataRetention.title")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("additionalInfo.dataRetention.content")}
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">{t("additionalInfo.childrenPrivacy.title")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("additionalInfo.childrenPrivacy.content")}
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">{t("additionalInfo.thirdPartyLinks.title")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("additionalInfo.thirdPartyLinks.content")}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground">
              {t("acknowledgment")}
            </p>
          </div>
          <div className="mt-6 flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link href="/about/term-of-service">{t("termsOfService")}</Link>
            </Button>
            <Button asChild>
              <Link href="/staking">{t("startStaking")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
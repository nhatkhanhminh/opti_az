"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

import { ArrowLeft, FileText, UserCheck, UserPlus, Coins, Users, Wallet, ShieldAlert, Copyright, AlertTriangle, XCircle, Scale, RefreshCw, Mail } from 'lucide-react'
import Link from "next/link"

export default function TermsOfServicePage() {
  const t = useTranslations("TermsOfService")

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
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  {t("legalBadge")}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold">{t("title")}</h1>
              <p className="text-muted-foreground">{t("lastUpdated")}</p>
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
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
                  <UserCheck className="h-5 w-5 text-primary" />
                  {t("eligibility.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="rounded-full bg-primary/20 p-1 mt-0.5 flex-shrink-0">
                      <UserCheck className="h-3 w-3 text-primary" />
                    </span>
                    <span>{t("eligibility.items.age")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="rounded-full bg-primary/20 p-1 mt-0.5 flex-shrink-0">
                      <UserCheck className="h-3 w-3 text-primary" />
                    </span>
                    <span>{t("eligibility.items.laws")}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  {t("account.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="rounded-full bg-primary/20 p-1 mt-0.5 flex-shrink-0">
                      <UserPlus className="h-3 w-3 text-primary" />
                    </span>
                    <span>{t("account.items.register")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="rounded-full bg-primary/20 p-1 mt-0.5 flex-shrink-0">
                      <UserPlus className="h-3 w-3 text-primary" />
                    </span>
                    <span>{t("account.items.responsibility")}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-primary" />
                  {t("staking.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">{t("staking.mechanism.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("staking.mechanism.content")}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">{t("staking.profitClaims.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("staking.profitClaims.content")}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">{t("staking.maxOutLimit.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("staking.maxOutLimit.content")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {t("referral.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("referral.content")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("referral.details")}
                </p>
                <div className="bg-muted p-4 rounded-lg mt-4">
                  <h4 className="font-medium mb-2">{t("referral.commissionStructure.title")}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t("referral.commissionStructure.f1")}</span>
                      <span className="font-medium">{t("referral.commissionStructure.f1Rate")}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span>{t("referral.commissionStructure.f2")}</span>
                      <span className="font-medium">{t("referral.commissionStructure.f2Rate")}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span>{t("referral.commissionStructure.f3")}</span>
                      <span className="font-medium">{t("referral.commissionStructure.f3Rate")}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  {t("tokenUsage.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("tokenUsage.swap")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("tokenUsage.distribution")}
                </p>
                <div className="bg-muted p-4 rounded-lg mt-4">
                  <h4 className="font-medium mb-2">{t("tokenUsage.profitDistribution.title")}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{t("tokenUsage.profitDistribution.originalTokenRate")}</div>
                      <div className="text-sm text-muted-foreground">{t("tokenUsage.profitDistribution.originalToken")}</div>
                    </div>
                    <div className="text-center p-3 bg-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{t("tokenUsage.profitDistribution.azcTokenRate")}</div>
                      <div className="text-sm text-muted-foreground">{t("tokenUsage.profitDistribution.azcToken")}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-primary" />
                  {t("responsibilities.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="rounded-full bg-primary/20 p-1 mt-0.5 flex-shrink-0">
                      <ShieldAlert className="h-3 w-3 text-primary" />
                    </span>
                    <span>{t("responsibilities.items.taxes")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="rounded-full bg-primary/20 p-1 mt-0.5 flex-shrink-0">
                      <ShieldAlert className="h-3 w-3 text-primary" />
                    </span>
                    <span>{t("responsibilities.items.fraud")}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Copyright className="h-5 w-5 text-primary" />
                  {t("intellectualProperty.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("intellectualProperty.content")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("intellectualProperty.permission")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  {t("liability.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("liability.warranty")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("liability.damages")}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-primary" />
                  {t("termination.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("termination.content")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("termination.effect")}
                </p>
                <div className="bg-muted p-4 rounded-lg mt-4">
                  <h4 className="font-medium mb-2">{t("termination.prohibitedActivities.title")}</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                      <span>{t("termination.prohibitedActivities.items.multipleAccounts")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                      <span>{t("termination.prohibitedActivities.items.hacking")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                      <span>{t("termination.prohibitedActivities.items.illegal")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                      <span>{t("termination.prohibitedActivities.items.misinformation")}</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  {t("disputeResolution.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("disputeResolution.arbitration")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("disputeResolution.classAction")}
                </p>
                <div className="bg-muted p-4 rounded-lg mt-4">
                  <h4 className="font-medium mb-2">{t("disputeResolution.arbitrationProcess.title")}</h4>
                  <ol className="space-y-2 text-sm list-decimal list-inside">
                    <li>{t("disputeResolution.arbitrationProcess.steps.notice")}</li>
                    <li>{t("disputeResolution.arbitrationProcess.steps.negotiation")}</li>
                    <li>{t("disputeResolution.arbitrationProcess.steps.language")}</li>
                    <li>{t("disputeResolution.arbitrationProcess.steps.decision")}</li>
                    <li>{t("disputeResolution.arbitrationProcess.steps.fees")}</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  {t("changes.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("changes.content")}
                </p>
                <div className="bg-muted p-4 rounded-lg mt-4">
                  <h4 className="font-medium mb-2">{t("changes.notificationProcess.title")}</h4>
                  <p className="text-sm">{t("changes.notificationProcess.description")}</p>
                  <ul className="space-y-2 text-sm mt-2">
                    <li className="flex items-start gap-2">
                      <span className="rounded-full bg-primary/20 p-1 mt-0.5 flex-shrink-0">
                        <RefreshCw className="h-3 w-3 text-primary" />
                      </span>
                      <span>{t("changes.notificationProcess.methods.email")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="rounded-full bg-primary/20 p-1 mt-0.5 flex-shrink-0">
                        <RefreshCw className="h-3 w-3 text-primary" />
                      </span>
                      <span>{t("changes.notificationProcess.methods.website")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="rounded-full bg-primary/20 p-1 mt-0.5 flex-shrink-0">
                        <RefreshCw className="h-3 w-3 text-primary" />
                      </span>
                      <span>{t("changes.notificationProcess.methods.inApp")}</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  {t("contact.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("contact.content")}
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium">{t("contact.email")}</p>
                  <p className="font-medium mt-2">{t("contact.address")}</p>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium mb-2">{t("contact.response")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("contact.responseTime")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t("additionalTerms.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">{t("additionalTerms.forceMajeure.title")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("additionalTerms.forceMajeure.content")}
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">{t("additionalTerms.severability.title")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("additionalTerms.severability.content")}
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">{t("additionalTerms.assignment.title")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("additionalTerms.assignment.content")}
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">{t("additionalTerms.entireAgreement.title")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("additionalTerms.entireAgreement.content")}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground">
              {t("acceptance")}
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Button asChild variant="outline">
                <Link href="/about/privacy-policy">{t("privacyPolicy")}</Link>
              </Button>
              <Button asChild>
                <Link href="/staking">{t("startStaking")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

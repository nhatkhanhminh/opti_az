"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Download,
  ImageIcon,
  FileIcon as FilePresentation,
  Globe,
  ChevronRight,
  ExternalLink,
  Palette,
} from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"

export default function MediaResourcesPage() {
  const t = useTranslations("MediaResourcePage")

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
              <p className="text-muted-foreground">{t("description")}</p>
            </div>
          </div>

          {/* Intro Card */}
          <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <h2 className="text-2xl font-bold">{t("intro.title")}</h2>
                  <p className="text-muted-foreground">
                    {t("intro.description")}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link href="/assets.zip"> 
                      <Button className="w-full cursor-pointer" variant="default">
                        <Download className="mr-2 h-4 w-4" />
                        {t("intro.downloadAll")}
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Palette className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{t("intro.categories.brandAssets")}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <FilePresentation className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{t("intro.categories.presentations")}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{t("intro.categories.marketing")}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Globe className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{t("intro.categories.multiLanguage")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{t("collections.title")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Palette className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{t("collections.brandKit.title")}</h3>
                      <p className="text-sm text-muted-foreground">{t("collections.brandKit.subtitle")}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("collections.brandKit.description")}
                  </p>
                  <Link href="/logo_az.zip">
                    <Button className="w-full cursor-pointer" variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      {t("collections.brandKit.download")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{t("collections.multiLanguage.title")}</h3>
                      <p className="text-sm text-muted-foreground">{t("collections.multiLanguage.subtitle")}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("collections.multiLanguage.description")}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <FilePresentation className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{t("collections.presentation.title")}</h3>
                      <p className="text-sm text-muted-foreground">{t("collections.presentation.subtitle")}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("collections.presentation.description")}
                  </p>
                  <Link href="/azcoin_app_eng.pdf">
                    <Button className="w-full cursor-pointer" variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      {t("collections.presentation.download")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Need help section */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="md:w-2/3 space-y-4">
                  <h2 className="text-2xl font-bold">{t("customMaterials.title")}</h2>
                  <p className="text-muted-foreground">
                    {t("customMaterials.description")}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link href="mailto:hello@optifund.app">
                      <Button variant="outline">
                        <ChevronRight className="mr-2 h-4 w-4" />
                        {t("customMaterials.contactSupport")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


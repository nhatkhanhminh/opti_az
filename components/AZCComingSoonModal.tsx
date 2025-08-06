import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Clock, Star, Trophy, Users, Zap } from "lucide-react";
import Image from "next/image";

interface AZCComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AZCComingSoonModal: React.FC<AZCComingSoonModalProps> = ({
  isOpen,
  onClose,
}) => {

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Image
              src="/images/tokens/azc.webp"
              alt="AZC Token"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AZC Token Staking
              </DialogTitle>
              <Badge variant="outline" className="mt-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <Clock className="w-3 h-3 mr-1" />
                Coming Soon
              </Badge>
            </div>
          </div>
          <DialogDescription>
            AZC staking portal is being developed with exclusive features and attractive benefits for the community.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Roadmap Section */}
          {/* <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Development Roadmap</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-400">Q4 2024: Smart Contract Completion</p>
                    <p className="text-sm text-muted-foreground">Develop and audit smart contract for AZC staking</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-blue-700 dark:text-blue-400">Q1 2025: Beta Testing</p>
                    <p className="text-sm text-muted-foreground">Testing with VIP user group</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-purple-700 dark:text-purple-400">Q2 2025: Public Launch</p>
                    <p className="text-sm text-muted-foreground">Official launch of AZC staking portal</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card> */}

          {/* Staking Plans Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold">Staking Plans</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                  <div className="text-center">
                    <h4 className="font-bold text-lg text-blue-700 dark:text-blue-400">3 Months</h4>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">10% <span className="text-sm">Monthly</span></p>
                    <p className="text-sm text-muted-foreground mt-2">Short-term growth</p>
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
                  <div className="text-center">
                    <h4 className="font-bold text-lg text-purple-700 dark:text-purple-400">6 Months</h4>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">12% <span className="text-sm">Monthly</span></p>
                    <p className="text-sm text-muted-foreground mt-2">Balanced returns</p>
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
                  <div className="text-center">
                    <h4 className="font-bold text-lg text-green-700 dark:text-green-400">12 Months</h4>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-300">16% <span className="text-sm">Monthly</span></p>
                    <p className="text-sm text-muted-foreground mt-2">Maximum rewards</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Exclusive Features</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Trophy className="w-5 h-5 text-yellow-500 mt-1" />
                  <div>
                    <p className="font-medium">Daily Rewards</p>
                    <p className="text-sm text-muted-foreground">50% USDT + 50% AZC tokens</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <p className="font-medium">Flexible Withdrawal</p>
                    <p className="text-sm text-muted-foreground">Withdraw principal at end of term</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CalendarDays className="w-5 h-5 text-purple-500 mt-1" />
                  <div>
                    <p className="font-medium">Early Bird Bonus</p>
                    <p className="text-sm text-muted-foreground">20% bonus added to principal</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-500 mt-1" />
                  <div>
                    <p className="font-medium">Governance Rights</p>
                    <p className="text-sm text-muted-foreground">Voting power in project decisions</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How It Works Section */}
          <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">How AZC Staking Works</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium">Choose Your Plan</p>
                    <p className="text-sm text-muted-foreground">Select from 3, 6, or 12-month staking periods</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium">Stake Your AZC</p>
                    <p className="text-sm text-muted-foreground">Lock your AZC tokens for the selected period</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium">Earn Daily Rewards</p>
                    <p className="text-sm text-muted-foreground">Receive 50% USDT + 50% AZC tokens daily</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <p className="font-medium">Withdraw at Term End</p>
                    <p className="text-sm text-muted-foreground">Unlock your principal + 20% bonus at maturity</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Section */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Early Staker Benefits</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm">20% bonus added to your principal amount</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm">Daily rewards in dual tokens (USDT + AZC)</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm">Priority whitelist for special events</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm">50% transaction fee reduction when using AZC</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm">Exclusive airdrop for AZC stakers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Contact Section */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              To receive updates about AZC Staking, please follow our official channels
            </p>
            {/* <div className="flex justify-center gap-4">
              <Button variant="outline" size="sm">
                Telegram
              </Button>
              <Button variant="outline" size="sm">
                X.com
              </Button>
              
            </div> */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 
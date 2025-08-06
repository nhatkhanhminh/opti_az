// hooks/useEarningsCalculator.ts
"use client";

import { useState, useEffect } from "react";

const tiers = [
  { min: 100, max: 999, apy: 9 },
  { min: 1000, max: 4999, apy: 11 },
  { min: 5000, max: 9999, apy: 13 },
  { min: 10000, max: 19999, apy: 15 },
  { min: 20000, max: Infinity, apy: 18 },
];

const getApyForAmount = (amount: number) => {
  const tier = tiers.find((t) => amount >= t.min && amount <= t.max);
  return tier ? tier.apy : 9;
};

export function useEarningsCalculator(initialAmount: number) {
  const [demoAmount, setDemoAmount] = useState(initialAmount);
  const [currentApy, setCurrentApy] = useState(getApyForAmount(initialAmount));

  useEffect(() => {
    setCurrentApy(getApyForAmount(demoAmount));
  }, [demoAmount]);

  const monthlyEarnings = (demoAmount * currentApy) / 100;
  const dailyEarnings = monthlyEarnings / 30;
  const maxEarnings = demoAmount * 4;
  return { demoAmount, setDemoAmount, currentApy, monthlyEarnings, dailyEarnings, maxEarnings };
}
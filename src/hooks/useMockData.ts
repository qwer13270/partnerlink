'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  mockProperties,
  getPropertyBySlug,
  getPropertyById,
  mockKols,
  mockAffiliateLinks,
  currentKol,
  currentKolStats,
  currentKolLinks,
  performanceChartData,
  getKolById,
  getAffiliateLinksByKolId,
  mockReferrals,
  developerReferrals,
  adminStats,
  developerStats,
  kolPerformanceData,
  getReferralsByKolId,
  getReferralsByPropertyId,
  mockActivities,
  currentKolActivities,
  getRecentActivities,
} from '@/data'
import type {
  Property,
  KOL,
  AffiliateLink,
  Referral,
  Activity,
  KolStats,
  AdminStats,
  DeveloperStats,
  ChartDataPoint,
  KolPerformanceData,
  LeadStatus,
} from '@/lib/types'

// Simulate loading delay for demo purposes
const SIMULATED_DELAY = 300

function useSimulatedFetch<T>(data: T, delay: number = SIMULATED_DELAY) {
  const [isLoading, setIsLoading] = useState(true)
  const [result, setResult] = useState<T | null>(null)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setResult(data)
      setIsLoading(false)
    }, delay)

    return () => clearTimeout(timer)
  }, [data, delay])

  return { data: result, isLoading }
}

// Properties
export function useProperties() {
  return useSimulatedFetch(mockProperties)
}

export function useProperty(slug: string) {
  const property = getPropertyBySlug(slug)
  return useSimulatedFetch(property)
}

export function usePropertyById(id: string) {
  const property = getPropertyById(id)
  return useSimulatedFetch(property)
}

// KOLs
export function useKols() {
  return useSimulatedFetch(mockKols)
}

export function useKol(id: string) {
  const kol = getKolById(id)
  return useSimulatedFetch(kol)
}

export function useCurrentKol() {
  return useSimulatedFetch(currentKol)
}

export function useCurrentKolStats() {
  return useSimulatedFetch(currentKolStats)
}

// Affiliate Links
export function useAffiliateLinks() {
  return useSimulatedFetch(mockAffiliateLinks)
}

export function useCurrentKolLinks() {
  return useSimulatedFetch(currentKolLinks)
}

export function useKolAffiliateLinks(kolId: string) {
  const links = getAffiliateLinksByKolId(kolId)
  return useSimulatedFetch(links)
}

// Performance Chart Data
export function usePerformanceChartData() {
  return useSimulatedFetch(performanceChartData)
}

// Referrals
export function useReferrals() {
  return useSimulatedFetch(mockReferrals)
}

export function useDeveloperReferrals() {
  const [referrals, setReferrals] = useState(developerReferrals)
  const { data, isLoading } = useSimulatedFetch(referrals)

  const updateReferralStatus = useCallback((id: string, newStatus: LeadStatus) => {
    setReferrals((prev) =>
      prev.map((ref) =>
        ref.id === id ? { ...ref, status: newStatus } : ref
      )
    )
  }, [])

  return { data, isLoading, updateReferralStatus }
}

export function useKolReferrals(kolId: string) {
  const referrals = useMemo(() => getReferralsByKolId(kolId), [kolId])
  return useSimulatedFetch(referrals)
}

export function usePropertyReferrals(propertyId: string) {
  const referrals = useMemo(() => getReferralsByPropertyId(propertyId), [propertyId])
  return useSimulatedFetch(referrals)
}

// Stats
export function useAdminStats() {
  return useSimulatedFetch(adminStats)
}

export function useDeveloperStats() {
  return useSimulatedFetch(developerStats)
}

// KOL Performance
export function useKolPerformanceData() {
  return useSimulatedFetch(kolPerformanceData)
}

// Activities
export function useActivities() {
  return useSimulatedFetch(mockActivities)
}

export function useRecentActivities(limit: number = 5) {
  const activities = getRecentActivities(limit)
  return useSimulatedFetch(activities)
}

export function useCurrentKolActivities() {
  return useSimulatedFetch(currentKolActivities)
}

// Developer info
export const developerInfo = {
  id: 'dev-001',
  name: '璞真建設',
  nameEn: 'PureCity Development',
  activeProjects: 2,
}

export function useDeveloperInfo() {
  return useSimulatedFetch(developerInfo)
}

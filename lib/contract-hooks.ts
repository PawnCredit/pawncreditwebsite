'use client'

import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { PAWN_PLATFORM_ADDRESS, PAWN_PLATFORM_ABI, ERC20_ABI, type TokenInfo, LoanStatus, TOKENS } from './web3-config'
import { base } from 'wagmi/chains'
import { useMemo } from 'react'

// Loan type from contract
export type ContractLoan = {
  id: bigint
  borrower: `0x${string}`
  lender: `0x${string}`
  collateralToken: `0x${string}`
  collateralAmount: bigint
  loanToken: `0x${string}`
  loanAmount: bigint
  originationFee: bigint
  borrowerReceives: bigint
  duration: bigint
  startTime: bigint
  status: number
}

export type LoanWithExpiry = {
  loan: ContractLoan
  isExpired: boolean
}

// Read next loan ID
export function useNextLoanId() {
  return useReadContract({
    address: PAWN_PLATFORM_ADDRESS,
    abi: PAWN_PLATFORM_ABI,
    functionName: 'nextLoanId',
    chainId: base.id,
  })
}

// Get loan details
export function useLoanDetails(loanId: bigint | undefined) {
  return useReadContract({
    address: PAWN_PLATFORM_ADDRESS,
    abi: PAWN_PLATFORM_ABI,
    functionName: 'getLoanDetails',
    args: loanId !== undefined ? [loanId] : undefined,
    chainId: base.id,
    query: {
      enabled: loanId !== undefined,
    },
  })
}

// Fetch all loans using multicall
export function useAllLoans() {
  const { data: nextLoanId, isLoading: isLoadingNextId } = useNextLoanId()
  
  const loanIds = useMemo(() => {
    if (!nextLoanId || nextLoanId === BigInt(0)) return []
    return Array.from({ length: Number(nextLoanId) }, (_, i) => BigInt(i))
  }, [nextLoanId])

  const contracts = useMemo(() => {
    return loanIds.map((id) => ({
      address: PAWN_PLATFORM_ADDRESS,
      abi: PAWN_PLATFORM_ABI,
      functionName: 'getLoanDetails' as const,
      args: [id] as const,
      chainId: base.id,
    }))
  }, [loanIds])

  const { data: loansData, isLoading: isLoadingLoans, refetch } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0,
    },
  })

  const loans = useMemo(() => {
    if (!loansData) return []
    return loansData
      .map((result, index) => {
        if (result.status !== 'success' || !result.result) return null
        const [loan, isExpired] = result.result as [ContractLoan, boolean]
        return { loan, isExpired, id: loanIds[index] }
      })
      .filter((loan): loan is { loan: ContractLoan; isExpired: boolean; id: bigint } => loan !== null)
  }, [loansData, loanIds])

  return {
    loans,
    isLoading: isLoadingNextId || isLoadingLoans,
    refetch,
    totalLoans: nextLoanId ? Number(nextLoanId) : 0,
  }
}

// Fetch open loans (available for funding)
export function useOpenLoans() {
  const { loans, isLoading, refetch, totalLoans } = useAllLoans()
  
  const openLoans = useMemo(() => {
    return loans.filter((l) => l.loan.status === LoanStatus.OPEN && !l.isExpired)
  }, [loans])

  return { loans: openLoans, isLoading, refetch, totalLoans }
}

// Fetch active loans
export function useActiveLoans() {
  const { loans, isLoading, refetch } = useAllLoans()
  
  const activeLoans = useMemo(() => {
    return loans.filter((l) => l.loan.status === LoanStatus.ACTIVE)
  }, [loans])

  return { loans: activeLoans, isLoading, refetch }
}

// Fetch user's loans (as borrower)
export function useUserBorrowerLoans() {
  const { address } = useAccount()
  const { loans, isLoading, refetch } = useAllLoans()
  
  const userLoans = useMemo(() => {
    if (!address) return []
    return loans.filter((l) => l.loan.borrower.toLowerCase() === address.toLowerCase())
  }, [loans, address])

  return { loans: userLoans, isLoading, refetch, address }
}

// Fetch user's loans (as lender)
export function useUserLenderLoans() {
  const { address } = useAccount()
  const { loans, isLoading, refetch } = useAllLoans()
  
  const userLoans = useMemo(() => {
    if (!address) return []
    return loans.filter((l) => 
      l.loan.lender.toLowerCase() === address.toLowerCase() && 
      l.loan.lender !== '0x0000000000000000000000000000000000000000'
    )
  }, [loans, address])

  return { loans: userLoans, isLoading, refetch, address }
}

// Platform stats from real data
export function usePlatformStats() {
  const { loans, isLoading, totalLoans } = useAllLoans()
  
  const stats = useMemo(() => {
    if (!loans.length) {
      return {
        totalValueLocked: BigInt(0),
        totalLoansCreated: 0,
        activeLoans: 0,
        completedLoans: 0,
        openLoans: 0,
      }
    }

    let totalValueLocked = BigInt(0)
    let activeLoans = 0
    let completedLoans = 0
    let openLoans = 0

    for (const { loan, isExpired } of loans) {
      // Count by status
      if (loan.status === LoanStatus.OPEN && !isExpired) {
        openLoans++
        // TVL includes collateral in open loans
        totalValueLocked += loan.collateralAmount
      } else if (loan.status === LoanStatus.ACTIVE) {
        activeLoans++
        // TVL includes collateral in active loans
        totalValueLocked += loan.collateralAmount
      } else if (loan.status === LoanStatus.REPAID) {
        completedLoans++
      }
    }

    return {
      totalValueLocked,
      totalLoansCreated: totalLoans,
      activeLoans,
      completedLoans,
      openLoans,
    }
  }, [loans, totalLoans])

  return { stats, isLoading }
}

// Get user's origination fee
export function useOriginationFee(userAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: PAWN_PLATFORM_ADDRESS,
    abi: PAWN_PLATFORM_ABI,
    functionName: 'getOriginationFeeBps',
    args: userAddress ? [userAddress] : undefined,
    chainId: base.id,
    query: {
      enabled: !!userAddress,
    },
  })
}

// Get user's tier
export function useUserTier(userAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: PAWN_PLATFORM_ADDRESS,
    abi: PAWN_PLATFORM_ABI,
    functionName: 'getTier',
    args: userAddress ? [userAddress] : undefined,
    chainId: base.id,
    query: {
      enabled: !!userAddress,
    },
  })
}

// Preview disbursement
export function usePreviewDisbursement(userAddress: `0x${string}` | undefined, loanAmount: bigint | undefined) {
  return useReadContract({
    address: PAWN_PLATFORM_ADDRESS,
    abi: PAWN_PLATFORM_ABI,
    functionName: 'previewDisbursement',
    args: userAddress && loanAmount ? [userAddress, loanAmount] : undefined,
    chainId: base.id,
    query: {
      enabled: !!userAddress && !!loanAmount,
    },
  })
}

// Token balance hook
export function useTokenBalance(tokenAddress: `0x${string}` | undefined, userAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    chainId: base.id,
    query: {
      enabled: !!tokenAddress && !!userAddress,
    },
  })
}

// Token allowance hook
export function useTokenAllowance(tokenAddress: `0x${string}` | undefined, owner: `0x${string}` | undefined, spender: `0x${string}`) {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: owner ? [owner, spender] : undefined,
    chainId: base.id,
    query: {
      enabled: !!tokenAddress && !!owner,
    },
  })
}

// Approve token spending
export function useApproveToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const approve = async (tokenAddress: `0x${string}`, spender: `0x${string}`, amount: bigint) => {
    writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spender, amount],
      chainId: base.id,
    })
  }

  return { approve, isPending, isConfirming, isSuccess, error, hash }
}

// Create loan offer
export function useCreateLoanOffer() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const createLoan = async (
    collateralToken: `0x${string}`,
    collateralAmount: bigint,
    loanToken: `0x${string}`,
    loanAmount: bigint,
    duration: bigint
  ) => {
    writeContract({
      address: PAWN_PLATFORM_ADDRESS,
      abi: PAWN_PLATFORM_ABI,
      functionName: 'createLoanOffer',
      args: [collateralToken, collateralAmount, loanToken, loanAmount, duration],
      chainId: base.id,
    })
  }

  return { createLoan, isPending, isConfirming, isSuccess, error, hash }
}

// Cancel loan offer
export function useCancelLoanOffer() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const cancelLoan = async (loanId: bigint) => {
    writeContract({
      address: PAWN_PLATFORM_ADDRESS,
      abi: PAWN_PLATFORM_ABI,
      functionName: 'cancelLoanOffer',
      args: [loanId],
      chainId: base.id,
    })
  }

  return { cancelLoan, isPending, isConfirming, isSuccess, error, hash }
}

// Fund loan
export function useFundLoan() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const fundLoan = async (loanId: bigint) => {
    writeContract({
      address: PAWN_PLATFORM_ADDRESS,
      abi: PAWN_PLATFORM_ABI,
      functionName: 'fundLoan',
      args: [loanId],
      chainId: base.id,
    })
  }

  return { fundLoan, isPending, isConfirming, isSuccess, error, hash }
}

// Repay loan
export function useRepayLoan() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const repayLoan = async (loanId: bigint) => {
    writeContract({
      address: PAWN_PLATFORM_ADDRESS,
      abi: PAWN_PLATFORM_ABI,
      functionName: 'repayLoan',
      args: [loanId],
      chainId: base.id,
    })
  }

  return { repayLoan, isPending, isConfirming, isSuccess, error, hash }
}

// Claim default (collateral after loan expires)
export function useClaimDefault() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const claimDefault = async (loanId: bigint) => {
    writeContract({
      address: PAWN_PLATFORM_ADDRESS,
      abi: PAWN_PLATFORM_ABI,
      functionName: 'claimDefault',
      args: [loanId],
      chainId: base.id,
    })
  }

  return { claimDefault, isPending, isConfirming, isSuccess, error, hash }
}

// Helper to format token amounts
export function formatTokenAmount(amount: bigint | undefined, decimals: number): string {
  if (!amount) return '0'
  return formatUnits(amount, decimals)
}

// Helper to parse token amounts
export function parseTokenAmount(amount: string, decimals: number): bigint {
  try {
    return parseUnits(amount, decimals)
  } catch {
    return BigInt(0)
  }
}

// Helper to get token info by address
export function getTokenByAddress(address: `0x${string}`): TokenInfo | undefined {
  const normalizedAddress = address.toLowerCase()
  return Object.values(TOKENS).find(
    (token) => token.address.toLowerCase() === normalizedAddress
  )
}

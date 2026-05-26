import { http, createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { injected, metaMask, coinbaseWallet } from 'wagmi/connectors'

// Contract addresses (Base Mainnet - LIVE)
export const PAWN_PLATFORM_ADDRESS = '0x6057E6d0cC35fb626540dFD196163AeA2F5768F7' as const
export const FEE_RECIPIENT_ADDRESS = '0xbB4A4029CF56ce9F4dF6216D7b80d63be6F908d8' as const
// $PAWN Token - Coming Soon
export const PAWN_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000' as const
export const PAWN_TOKEN_COMING_SOON = true

// Popular tokens on Base
export const TOKENS = {
  USDC: {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logo: '/tokens/usdc.svg'
  },
  WETH: {
    address: '0x4200000000000000000000000000000000000006' as const,
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    logo: '/tokens/weth.svg'
  },
  DAI: {
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb' as const,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    logo: '/tokens/dai.svg'
  },
  PAWN: {
    address: PAWN_TOKEN_ADDRESS,
    symbol: 'PAWN',
    name: 'Pawn Token',
    decimals: 18,
    logo: '/tokens/pawn.svg',
    comingSoon: true
  }
} as const

export type TokenInfo = {
  address: `0x${string}`
  symbol: string
  name: string
  decimals: number
  logo: string
  comingSoon?: boolean
}

// Loyalty tier thresholds
export const TIERS = {
  BRONZE: {
    name: 'Bronze',
    threshold: 0,
    feeBps: 50, // 0.50%
    color: 'bronze'
  },
  SILVER: {
    name: 'Silver',
    threshold: 1000,
    feeBps: 30, // 0.30%
    color: 'silver'
  },
  GOLD: {
    name: 'Gold',
    threshold: 10000,
    feeBps: 10, // 0.10%
    color: 'gold'
  }
} as const

export function getTierByBalance(balance: number): typeof TIERS[keyof typeof TIERS] {
  if (balance >= TIERS.GOLD.threshold) return TIERS.GOLD
  if (balance >= TIERS.SILVER.threshold) return TIERS.SILVER
  return TIERS.BRONZE
}

export function getNextTier(balance: number): { tier: typeof TIERS[keyof typeof TIERS]; tokensNeeded: number } | null {
  if (balance >= TIERS.GOLD.threshold) return null
  if (balance >= TIERS.SILVER.threshold) {
    return { tier: TIERS.GOLD, tokensNeeded: TIERS.GOLD.threshold - balance }
  }
  return { tier: TIERS.SILVER, tokensNeeded: TIERS.SILVER.threshold - balance }
}

// Wagmi config
export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({ appName: 'Pawn.credit' }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
})

// Loan status enum matching the contract
export enum LoanStatus {
  OPEN = 0,
  ACTIVE = 1,
  REPAID = 2,
  DEFAULTED = 3,
  CANCELLED = 4
}

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  [LoanStatus.OPEN]: 'Open',
  [LoanStatus.ACTIVE]: 'Active',
  [LoanStatus.REPAID]: 'Repaid',
  [LoanStatus.DEFAULTED]: 'Defaulted',
  [LoanStatus.CANCELLED]: 'Cancelled'
}

export const LOAN_STATUS_COLORS: Record<LoanStatus, string> = {
  [LoanStatus.OPEN]: 'text-[var(--pawn-blue)]',
  [LoanStatus.ACTIVE]: 'text-[var(--pawn-green)]',
  [LoanStatus.REPAID]: 'text-muted-foreground',
  [LoanStatus.DEFAULTED]: 'text-destructive',
  [LoanStatus.CANCELLED]: 'text-muted-foreground'
}

// Contract ABI (simplified for key functions)
export const PAWN_PLATFORM_ABI = [
  {
    name: 'createLoanOffer',
    type: 'function',
    inputs: [
      { name: '_collateralToken', type: 'address' },
      { name: '_collateralAmount', type: 'uint256' },
      { name: '_loanToken', type: 'address' },
      { name: '_loanAmount', type: 'uint256' },
      { name: '_duration', type: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'cancelLoanOffer',
    type: 'function',
    inputs: [{ name: '_id', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'fundLoan',
    type: 'function',
    inputs: [{ name: '_id', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'repayLoan',
    type: 'function',
    inputs: [{ name: '_id', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'claimDefault',
    type: 'function',
    inputs: [{ name: '_id', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'getLoanDetails',
    type: 'function',
    inputs: [{ name: '_id', type: 'uint256' }],
    outputs: [
      {
        name: 'loan',
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'borrower', type: 'address' },
          { name: 'lender', type: 'address' },
          { name: 'collateralToken', type: 'address' },
          { name: 'collateralAmount', type: 'uint256' },
          { name: 'loanToken', type: 'address' },
          { name: 'loanAmount', type: 'uint256' },
          { name: 'originationFee', type: 'uint256' },
          { name: 'borrowerReceives', type: 'uint256' },
          { name: 'duration', type: 'uint256' },
          { name: 'startTime', type: 'uint256' },
          { name: 'status', type: 'uint8' }
        ]
      },
      { name: 'isExpired', type: 'bool' }
    ],
    stateMutability: 'view'
  },
  {
    name: 'getOriginationFeeBps',
    type: 'function',
    inputs: [{ name: '_borrower', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    name: 'getTier',
    type: 'function',
    inputs: [{ name: '_borrower', type: 'address' }],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view'
  },
  {
    name: 'previewDisbursement',
    type: 'function',
    inputs: [
      { name: '_borrower', type: 'address' },
      { name: '_loanAmount', type: 'uint256' }
    ],
    outputs: [
      { name: 'fee', type: 'uint256' },
      { name: 'borrowerReceives', type: 'uint256' }
    ],
    stateMutability: 'view'
  },
  {
    name: 'nextLoanId',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    name: 'loans',
    type: 'function',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'borrower', type: 'address' },
      { name: 'lender', type: 'address' },
      { name: 'collateralToken', type: 'address' },
      { name: 'collateralAmount', type: 'uint256' },
      { name: 'loanToken', type: 'address' },
      { name: 'loanAmount', type: 'uint256' },
      { name: 'originationFee', type: 'uint256' },
      { name: 'borrowerReceives', type: 'uint256' },
      { name: 'duration', type: 'uint256' },
      { name: 'startTime', type: 'uint256' },
      { name: 'status', type: 'uint8' }
    ],
    stateMutability: 'view'
  }
] as const

// ERC20 ABI for approvals and balances
export const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable'
  },
  {
    name: 'allowance',
    type: 'function',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    name: 'decimals',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view'
  },
  {
    name: 'symbol',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view'
  },
  {
    name: 'name',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view'
  }
] as const

import { PublicKey } from "@solana/web3.js";

const PUMPFUN_PROGRAM_ID = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P")

const PUMPFUN_FEE_RECIPIENT = [
    new PublicKey("7VtfL8fvgNfhz17qKRMjzQEXgbdpnHHHQRh54R9jP2RJ"),
    new PublicKey("7hTckgnGnLQR6sdH7YkqFTAA7VwTfYFaZ6EhEsU3saCX"),
    new PublicKey("9rPYyANsfQZw3DnDmKE3YCQF5E8oD89UXoHn9JFEhJUz"),
    new PublicKey("AVmoTthdrX6tKt4nDjco2D775W2YK3sDhxPcMmzUAmTY"),
    new PublicKey("CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM"),
    new PublicKey("FWsW1xNtWscwNmKv6wVsU1iTzRN6wmmk3MjxRP5tT7hz"),
    new PublicKey("G5UZAVbAf46s7cKWoyKu8kYTip9DGTpbLZ2qa9Aq69dP"),
]

const PUMPFUN_MAINNET_EVENT_AUTH = new PublicKey("Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1")
const PUMPFUN_DEVNET_EVENT_AUTH = new PublicKey("68yFSZxzLWJXkxxRGydZ63C6mHx1NLEDWmwN9Lb5yySg")

const BONDING_CURVE_SEED = "bonding-curve"
const PUMPFUN_GLOBAL = "global"
const PUMPFUN_CREATOR_VAULT = "creator-vault"

export {
    PUMPFUN_PROGRAM_ID,
    BONDING_CURVE_SEED,
    PUMPFUN_GLOBAL,
    PUMPFUN_FEE_RECIPIENT,
    PUMPFUN_MAINNET_EVENT_AUTH,
    PUMPFUN_DEVNET_EVENT_AUTH,
    PUMPFUN_CREATOR_VAULT
}
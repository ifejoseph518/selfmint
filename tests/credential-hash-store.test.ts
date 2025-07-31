import { describe, it, expect, beforeEach } from "vitest"

const mockContract = {
  admin: "ST1ADMINADDRESS0000000000000000000000000",
  issuerWhitelist: new Map<string, boolean>(),
  credentialHashes: new Map<string, any>(),

  isAdmin(caller: string) {
    return caller === this.admin
  },

  addIssuer(caller: string, issuer: string) {
    if (!this.isAdmin(caller)) return { error: 100 }
    this.issuerWhitelist.set(issuer, true)
    return { value: true }
  },

  removeIssuer(caller: string, issuer: string) {
    if (!this.isAdmin(caller)) return { error: 100 }
    this.issuerWhitelist.delete(issuer)
    return { value: true }
  },

  storeCredential(caller: string, hash: string, subject: string, expiresAt?: number) {
    if (!this.issuerWhitelist.get(caller)) return { error: 105 }
    if (this.credentialHashes.has(hash)) return { error: 101 }
    this.credentialHashes.set(hash, {
      issuer: caller,
      subject,
      timestamp: 9999,
      expiresAt,
      revoked: false
    })
    return { value: true }
  },

  revokeCredential(caller: string, hash: string) {
    const data = this.credentialHashes.get(hash)
    if (!data) return { error: 102 }
    if (caller !== data.issuer) return { error: 100 }
    data.revoked = true
    return { value: true }
  },

  isValid(hash: string, currentHeight = 9999) {
    const data = this.credentialHashes.get(hash)
    if (!data) return { error: 102 }
    if (data.revoked) return { error: 103 }
    if (data.expiresAt && currentHeight > data.expiresAt) return { error: 104 }
    return { value: true }
  },

  getCredential(hash: string) {
    const data = this.credentialHashes.get(hash)
    return data ? { value: data } : { error: 102 }
  },

  transferAdmin(caller: string, newAdmin: string) {
    if (!this.isAdmin(caller)) return { error: 100 }
    this.admin = newAdmin
    return { value: true }
  }
}

describe("Credential Hash Store Contract", () => {
  const admin = "ST1ADMINADDRESS0000000000000000000000000"
  const issuer = "ST2ISSUER000000000000000000000000000000"
  const user = "ST3SUBJECT000000000000000000000000000000"

  beforeEach(() => {
    mockContract.admin = admin
    mockContract.issuerWhitelist = new Map()
    mockContract.credentialHashes = new Map()
  })

  it("allows admin to whitelist issuer", () => {
    const res = mockContract.addIssuer(admin, issuer)
    expect(res).toEqual({ value: true })
    expect(mockContract.issuerWhitelist.get(issuer)).toBe(true)
  })

  it("prevents non-admin from whitelisting", () => {
    const res = mockContract.addIssuer(user, issuer)
    expect(res).toEqual({ error: 100 })
  })

  it("allows whitelisted issuer to store credential", () => {
    mockContract.addIssuer(admin, issuer)
    const hash = "abc123"
    const res = mockContract.storeCredential(issuer, hash, user, 10000)
    expect(res).toEqual({ value: true })
  })

  it("prevents storing duplicate credentials", () => {
    mockContract.addIssuer(admin, issuer)
    mockContract.storeCredential(issuer, "abc123", user)
    const res = mockContract.storeCredential(issuer, "abc123", user)
    expect(res).toEqual({ error: 101 })
  })

  it("revokes a credential correctly", () => {
    mockContract.addIssuer(admin, issuer)
    mockContract.storeCredential(issuer, "abc123", user)
    const res = mockContract.revokeCredential(issuer, "abc123")
    expect(res).toEqual({ value: true })
  })

  it("validates credential status", () => {
    mockContract.addIssuer(admin, issuer)
    mockContract.storeCredential(issuer, "abc123", user, 11000)
    const res = mockContract.isValid("abc123", 10000)
    expect(res).toEqual({ value: true })
  })

  it("fails validation if credential is revoked", () => {
    mockContract.addIssuer(admin, issuer)
    mockContract.storeCredential(issuer, "abc123", user)
    mockContract.revokeCredential(issuer, "abc123")
    const res = mockContract.isValid("abc123")
    expect(res).toEqual({ error: 103 })
  })

  it("fails validation if credential is expired", () => {
    mockContract.addIssuer(admin, issuer)
    mockContract.storeCredential(issuer, "abc123", user, 1000)
    const res = mockContract.isValid("abc123", 1500)
    expect(res).toEqual({ error: 104 })
  })

  it("transfers admin rights", () => {
    const res = mockContract.transferAdmin(admin, user)
    expect(res).toEqual({ value: true })
    expect(mockContract.admin).toBe(user)
  })
})

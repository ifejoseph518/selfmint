# Selfmint

**Self-Sovereign Digital Identity & Credential Verification**

A decentralized infrastructure for issuing, managing, and verifying digital identities and verifiable credentials using Clarity smart contracts. Selfmint enables individuals and institutions to build trusted, privacy-preserving reputations without relying on centralized authorities.

---

## **Overview**

Selfmint provides a blockchain-based system that empowers users to mint their own digital identities, receive verifiable credentials from trusted issuers, and present proof of qualifications or status using zero-knowledge proofs. Built with modular smart contracts, it ensures transparent credential issuance, decentralized governance, and secure verification.

This system consists of ten smart contracts that work together to form the foundation of a verifiable identity and credential system.

---

## **Smart Contracts**

1. **Identity Registry Contract**  
   - Registers user DIDs and binds wallets to identities  
   - Manages public keys and metadata  

2. **Issuer Registry Contract**  
   - Registers and verifies trusted issuers (e.g., universities, certifiers)  
   - Tracks issuer reputation and validity  

3. **Credential Hash Store Contract**  
   - Stores on-chain hashes of off-chain verifiable credentials  
   - Ensures tamper-proof referencing and timestamping  

4. **Access Policy Contract**  
   - Manages access rules and credential request conditions  
   - Controls visibility and access based on policy ID  

5. **Revocation Registry Contract**  
   - Allows issuers to revoke credentials  
   - Maintains revocation logs with timestamps  

6. **ZK-Proof Verifier Contract**  
   - Validates zero-knowledge proofs for private credential verification  
   - Supports selective disclosure  

7. **Reputation Oracle Contract**  
   - Aggregates issuer trust scores  
   - Allows community-based upvotes/downvotes on issuer credibility  

8. **Wallet Auth Contract**  
   - Supports multiple wallets under a single DID  
   - Enables social recovery and wallet rotation  

9. **Audit Log Contract**  
   - Immutable logs of credential verifications and proof submissions  
   - Transparent on-chain activity tracking  

10. **DAO Governance Contract**  
    - Community-based management of policy changes, issuer approvals, and upgrades  
    - Token-weighted voting system

---

## **Features**

- Self-sovereign identity (SSI) support  
- DID-based identity mapping  
- Verifiable credentials with off-chain data integrity  
- Zero-knowledge proof verification  
- Revocable and auditable credentials  
- Issuer trust and reputation scores  
- Decentralized policy and governance via DAO  
- Multi-wallet support and social recovery  

---

## **Installation**

1. Install [Clarinet CLI](https://docs.stacks.co/clarity/clarinet-cli)  
2. Clone this repository:
   ```bash
   git clone https://github.com/your-username/selfmint.git
   cd selfmint
   ```
3. Run tests:
```bash
npm test
```
4. Deploy contracts:
```bash
clarinet deploy
```

## **Usage**

- Each contract within Selfmint is modular and independently deployable. Developers and institutions can integrate individual components (e.g., identity registry or credential verification) into their own Web3 applications.
- Refer to each contract file in the /contracts directory for function definitions and usage documentation.

## **Testing**

All contracts are tested using Clarinet. To run tests:
```bash
npm test
```
Tests cover credential issuance, proof verification, revocation, DAO voting, and identity wallet linking.

## **License**

MIT License
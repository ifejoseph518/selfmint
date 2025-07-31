;; Credential Hash Store Contract for Selfmint
;; Stores hashed references to off-chain verifiable credentials
;; Implements expiration, revocation, and issuer-based access control

(define-data-var admin principal tx-sender)

(define-map issuer-whitelist principal bool)

(define-map credential-hashes
  (tuple (hash (buff 32))) ;; Unique credential hash
  (tuple
    (issuer principal)
    (subject principal)
    (timestamp uint)
    (expires-at (optional uint))
    (revoked bool)
  )
)

;; Error constants
(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-ALREADY-EXISTS u101)
(define-constant ERR-NOT-FOUND u102)
(define-constant ERR-REVOKED u103)
(define-constant ERR-EXPIRED u104)
(define-constant ERR-NOT-WHITELISTED u105)

;; Private helper
(define-private (is-admin)
  (is-eq tx-sender (var-get admin))
)

;; Public function: Add an issuer to the whitelist
(define-public (add-issuer (issuer principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (map-set issuer-whitelist issuer true)
    (ok true)
  )
)

;; Public function: Remove issuer from whitelist
(define-public (remove-issuer (issuer principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (map-delete issuer-whitelist issuer)
    (ok true)
  )
)

;; Public: Store a new credential hash
(define-public (store-credential (hash (buff 32)) (subject principal) (expires-at (optional uint)))
  (let ((key (tuple (hash hash))))
    (begin
      (asserts! (is-eq (get some (map-get? issuer-whitelist tx-sender)) true) (err ERR-NOT-WHITELISTED))
      (asserts! (is-none (map-get? credential-hashes key)) (err ERR-ALREADY-EXISTS))
      (map-set credential-hashes key
        (tuple
          (issuer tx-sender)
          (subject subject)
          (timestamp block-height)
          (expires-at expires-at)
          (revoked false)
        )
      )
      (ok true)
    )
  )
)

;; Public: Revoke a stored credential
(define-public (revoke-credential (hash (buff 32)))
  (let ((key (tuple (hash hash))))
    (match (map-get? credential-hashes key)
      credential-data
      (begin
        (asserts! (is-eq tx-sender (get issuer credential-data)) (err ERR-NOT-AUTHORIZED))
        (map-set credential-hashes key
          (tuple
            (issuer (get issuer credential-data))
            (subject (get subject credential-data))
            (timestamp (get timestamp credential-data))
            (expires-at (get expires-at credential-data))
            (revoked true)
          )
        )
        (ok true)
      )
    )
  )
)

;; Read-only: Check if a credential is valid (not revoked or expired)
(define-read-only (is-valid (hash (buff 32)))
  (let ((key (tuple (hash hash))))
    (match (map-get? credential-hashes key)
      credential-data
      (if (get revoked credential-data)
        (err ERR-REVOKED)
        (match (get expires-at credential-data)
          expires
          (if (> block-height expires)
            (err ERR-EXPIRED)
            (ok true)
          )
          none
          (ok true)
        )
      )
    )
  )
)

;; Read-only: Get metadata for a credential
(define-read-only (get-credential (hash (buff 32)))
  (let ((key (tuple (hash hash))))
    (match (map-get? credential-hashes key)
      data
      (ok data)
    )
  )
)

;; Public: Transfer admin rights
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (var-set admin new-admin)
    (ok true)
  )
)

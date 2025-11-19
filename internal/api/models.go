package api

import "time"

// AuthResponse is returned by authentication endpoints.
type AuthResponse struct {
	Token            string    `json:"token"`
	RefreshToken     string    `json:"refresh_token"`
	ExpiresAt        time.Time `json:"expires_at"`
	RefreshExpiresAt time.Time `json:"refresh_expires_at"`
	User             *User     `json:"user"`
}

// User represents a BankApp user account.
type User struct {
	ID        int64     `json:"id"`
	FullName  string    `json:"full_name"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Account represents a bank account belonging to a user.
type Account struct {
	ID            int64     `json:"id"`
	UserID        int64     `json:"user_id"`
	AccountNumber string    `json:"account_number"`
	Balance       float64   `json:"balance"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// Card represents a payment card tied to a bank account.
type Card struct {
	ID         int64     `json:"id"`
	AccountID  int64     `json:"account_id"`
	CardNumber string    `json:"card_number"`
	MaskedPAN  string    `json:"masked_pan"`
	ExpiryDate string    `json:"expiry_date"`
	IsActive   bool      `json:"is_active"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// Transaction represents a deposit, withdrawal, or transfer.
type Transaction struct {
	ID          int64     `json:"id"`
	AccountID   int64     `json:"account_id"`
	ToAccountID *int64    `json:"to_account_id"`
	Amount      float64   `json:"amount"`
	Type        string    `json:"type"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

// RegisterRequest is the payload for registering a new user.
type RegisterRequest struct {
	FullName string `json:"full_name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginRequest is the payload for authenticating an existing user.
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// RefreshRequest is the payload for refreshing an access token.
type RefreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

// UpdateEmailRequest updates the user's email address.
type UpdateEmailRequest struct {
	Email string `json:"email"`
}

// UpdatePasswordRequest updates the user's password.
type UpdatePasswordRequest struct {
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
}

// UpdateUserStatusRequest toggles the active state of a user account.
type UpdateUserStatusRequest struct {
	IsActive bool `json:"is_active"`
}

// CreateAccountRequest creates a new bank account.
type CreateAccountRequest struct {
	UserID  *int64  `json:"user_id,omitempty"`
	Balance float64 `json:"balance"`
}

// UpdateAccountRequest updates an existing bank account balance.
type UpdateAccountRequest struct {
	Balance float64 `json:"balance"`
}

// CreateCardRequest issues a new card.
type CreateCardRequest struct {
	AccountID int64  `json:"account_id"`
	PAN       string `json:"card_number"`
	CVV       string `json:"cvv"`
	Expiry    string `json:"expiry_date"`
}

// UpdateCardRequest updates card sensitive details.
type UpdateCardRequest struct {
	CardNumber *string `json:"card_number,omitempty"`
	CVV        *string `json:"cvv,omitempty"`
	ExpiryDate *string `json:"expiry_date,omitempty"`
}

// UpdateCardStatusRequest activates or deactivates a card.
type UpdateCardStatusRequest struct {
	IsActive bool `json:"is_active"`
}

// CreateTransactionRequest creates a new transaction.
type CreateTransactionRequest struct {
	AccountID   int64   `json:"account_id"`
	ToAccountID *int64  `json:"to_account_id,omitempty"`
	Amount      float64 `json:"amount"`
	Type        string  `json:"type"`
	Description *string `json:"description,omitempty"`
}

// Collection envelopes ----------------------------------------------------

type UsersResponse struct {
	Users []User `json:"users"`
	Count int    `json:"count"`
}

type AccountsResponse struct {
	Accounts []Account `json:"accounts"`
	Count    int       `json:"count"`
}

type CardsResponse struct {
	Cards []Card `json:"cards"`
	Count int    `json:"count"`
}

type TransactionsResponse struct {
	Transactions []Transaction `json:"transactions"`
	Count        int           `json:"count"`
}

// UpdateTransactionRequest updates an existing transaction.
type UpdateTransactionRequest struct {
	Amount      *float64 `json:"amount,omitempty"`
	Description *string  `json:"description,omitempty"`
}

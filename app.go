package main

import (
	"context"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"desktop-app/internal/api"
	"desktop-app/internal/storage"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

const timestampLayout = time.RFC3339

// AppConfig exposes runtime configuration to the frontend.
type AppConfig struct {
	APIBaseURL string `json:"api_base_url"`
}

// SessionView represents the authenticated session state.
type SessionView struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	ExpiresAt    int64     `json:"expires_at"`
	User         *UserView `json:"user"`
}

// UserView adapts api.User for UI consumption.
type UserView struct {
	ID        string `json:"id"`
	FullName  string `json:"full_name"`
	Email     string `json:"email"`
	Role      string `json:"role"`
	IsActive  bool   `json:"is_active"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

// AccountView adapts api.Account for UI consumption.
type AccountView struct {
	ID            string  `json:"id"`
	UserID        string  `json:"user_id"`
	AccountNumber string  `json:"account_number"`
	Balance       float64 `json:"balance"`
	CreatedAt     string  `json:"created_at"`
	UpdatedAt     string  `json:"updated_at"`
}

// CardView adapts api.Card for UI consumption.
type CardView struct {
	ID         string `json:"id"`
	AccountID  string `json:"account_id"`
	CardNumber string `json:"card_number"`
	MaskedPAN  string `json:"masked_pan"`
	ExpiryDate string `json:"expiry_date"`
	IsActive   bool   `json:"is_active"`
	CreatedAt  string `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`
}

// TransactionView adapts api.Transaction for UI consumption.
type TransactionView struct {
	ID          string  `json:"id"`
	AccountID   string  `json:"account_id"`
	ToAccountID *string `json:"to_account_id,omitempty"`
	Amount      float64 `json:"amount"`
	Type        string  `json:"type"`
	Description string  `json:"description"`
	CreatedAt   string  `json:"created_at"`
}

// UpdateCardInput wraps optional card fields provided by the UI.
type UpdateCardInput struct {
	CardNumber *string `json:"card_number,omitempty"`
	CVV        *string `json:"cvv,omitempty"`
	ExpiryDate *string `json:"expiry_date,omitempty"`
}

// TransactionInput represents the payload expected when creating a transaction.
type TransactionInput struct {
	AccountID   string  `json:"account_id"`
	ToAccountID *string `json:"to_account_id,omitempty"`
	Amount      float64 `json:"amount"`
	Type        string  `json:"type"`
	Description *string `json:"description,omitempty"`
}

// TransactionUpdateInput carries optional transaction edits.
type TransactionUpdateInput struct {
	Amount      *float64 `json:"amount,omitempty"`
	Description *string  `json:"description,omitempty"`
}

// App orchestrates API calls, session state, and the Wails lifecycle.
type App struct {
	ctx          context.Context
	mu           sync.RWMutex
	service      *api.Service
	sessionStore *storage.Store
	session      *storage.Session
	config       AppConfig
	initErr      error
}

// NewApp constructs the core application instance.
func NewApp() *App {
	baseURL := strings.TrimSpace(os.Getenv("BANKAPP_API_URL"))
	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}

	client, clientErr := api.NewClient(baseURL)
	var service *api.Service
	if clientErr == nil {
		service = api.NewService(client)
	}

	sessionPath, storeErr := defaultSessionPath()
	var store *storage.Store
	if storeErr == nil {
		store = storage.NewStore(sessionPath)
	}

	var initErr error
	if clientErr != nil {
		initErr = clientErr
	}
	if storeErr != nil {
		if initErr != nil {
			initErr = errors.Join(initErr, storeErr)
		} else {
			initErr = storeErr
		}
	}

	return &App{
		service:      service,
		sessionStore: store,
		config:       AppConfig{APIBaseURL: baseURL},
		initErr:      initErr,
	}
}

// startup is triggered by Wails once the runtime is ready.
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	if a.initErr != nil {
		runtime.LogError(ctx, fmt.Sprintf("initialisation issue: %v", a.initErr))
	}

	if a.sessionStore == nil {
		return
	}

	session, err := a.sessionStore.Load()
	if err != nil {
		runtime.LogError(ctx, fmt.Sprintf("load session: %v", err))
		return
	}

	if session != nil {
		a.mu.Lock()
		a.session = session
		a.mu.Unlock()
		runtime.LogInfo(ctx, "session restored from storage")
	}
}

// shutdown executes during application teardown.
func (a *App) shutdown(ctx context.Context) {
	runtime.LogInfo(ctx, "application shutdown")
}

// AppInfo reports configuration and current session snapshot.
func (a *App) AppInfo() (AppConfig, *SessionView) {
	return a.config, sessionViewFromSession(a.currentSession())
}

// Register creates a new user and authenticates immediately.
func (a *App) Register(fullName, email, password string) (*SessionView, error) {
	if err := a.ensureService(); err != nil {
		return nil, err
	}

	payload := api.RegisterRequest{
		FullName: strings.TrimSpace(fullName),
		Email:    strings.TrimSpace(email),
		Password: strings.TrimSpace(password),
	}

	if payload.FullName == "" || payload.Email == "" || payload.Password == "" {
		return nil, errors.New("full name, email, and password are required")
	}

	resp, err := a.service.Register(a.callContext(), payload)
	if err != nil {
		return nil, err
	}

	return a.updateSessionFromAuth(resp)
}

// Login authenticates an existing user.
func (a *App) Login(email, password string) (*SessionView, error) {
	if err := a.ensureService(); err != nil {
		return nil, err
	}

	payload := api.LoginRequest{
		Email:    strings.TrimSpace(email),
		Password: strings.TrimSpace(password),
	}

	if payload.Email == "" || payload.Password == "" {
		return nil, errors.New("email and password are required")
	}

	resp, err := a.service.Login(a.callContext(), payload)
	if err != nil {
		return nil, err
	}

	return a.updateSessionFromAuth(resp)
}

// RefreshSession exchanges the refresh token for a fresh access token.
func (a *App) RefreshSession() (*SessionView, error) {
	if err := a.ensureService(); err != nil {
		return nil, err
	}

	session, err := a.requireSessionRaw()
	if err != nil {
		return nil, err
	}

	if session.RefreshToken == "" {
		return nil, errors.New("refresh token missing")
	}

	resp, err := a.service.Refresh(a.callContext(), api.RefreshRequest{RefreshToken: session.RefreshToken})
	if err != nil {
		return nil, err
	}

	return a.updateSessionFromAuth(resp)
}

// Logout clears session state both in memory and on disk.
func (a *App) Logout() error {
	if _, err := a.saveSession(nil); err != nil {
		return err
	}
	runtime.LogInfo(a.callContext(), "session cleared")
	return nil
}

// GetProfile retrieves details for the current user.
func (a *App) GetProfile() (*UserView, error) {
	if err := a.ensureService(); err != nil {
		return nil, err
	}

	token, err := a.requireAccessToken()
	if err != nil {
		return nil, err
	}

	user, err := a.service.GetProfile(a.callContext(), token)
	if err != nil {
		return nil, err
	}

	return userViewFromAPI(user), nil
}

// ListUsers returns all users (requires administrative role).
func (a *App) ListUsers() ([]UserView, error) {
	if err := a.ensureService(); err != nil {
		return nil, err
	}

	token, err := a.requireAccessToken()
	if err != nil {
		return nil, err
	}

	users, err := a.service.ListUsers(a.callContext(), token)
	if err != nil {
		return nil, err
	}

	result := make([]UserView, 0, len(users))
	for i := range users {
		if view := userViewFromAPI(&users[i]); view != nil {
			result = append(result, *view)
		}
	}
	return result, nil
}

// GetUser fetches a specific user by identifier.
func (a *App) GetUser(id string) (*UserView, error) {
	if err := a.ensureService(); err != nil {
		return nil, err
	}

	cleanID := strings.TrimSpace(id)
	if cleanID == "" {
		return nil, errors.New("user id is required")
	}

	token, err := a.requireAccessToken()
	if err != nil {
		return nil, err
	}

	user, err := a.service.GetUser(a.callContext(), token, cleanID)
	if err != nil {
		return nil, err
	}

	return userViewFromAPI(user), nil
}

// UpdateUserEmail changes the email address for a user.
func (a *App) UpdateUserEmail(id, email string) (*UserView, error) {
	if err := a.ensureService(); err != nil {
		return nil, err
	}

	cleanID := strings.TrimSpace(id)
	if cleanID == "" {
		return nil, errors.New("user id is required")
	}

	cleanEmail := strings.TrimSpace(email)
	if cleanEmail == "" {
		return nil, errors.New("email is required")
	}

	token, err := a.requireAccessToken()
	if err != nil {
		return nil, err
	}

	user, err := a.service.UpdateUserEmail(a.callContext(), token, cleanID, api.UpdateEmailRequest{Email: cleanEmail})
	if err != nil {
		return nil, err
	}

	return userViewFromAPI(user), nil
}

// UpdateUserPassword alters the user's password.
func (a *App) UpdateUserPassword(id, oldPassword, newPassword string) error {
	if err := a.ensureService(); err != nil {
		return err
	}

	cleanID := strings.TrimSpace(id)
	if cleanID == "" {
		return errors.New("user id is required")
	}

	oldPassword = strings.TrimSpace(oldPassword)
	newPassword = strings.TrimSpace(newPassword)
	if oldPassword == "" || newPassword == "" {
		return errors.New("old and new passwords are required")
	}

	token, err := a.requireAccessToken()
	if err != nil {
		return err
	}

	return a.service.UpdateUserPassword(a.callContext(), token, cleanID, api.UpdatePasswordRequest{
		OldPassword: oldPassword,
		NewPassword: newPassword,
	})
}

// UpdateUserStatus toggles the active state for a user.
func (a *App) UpdateUserStatus(id string, isActive bool) (*UserView, error) {
	if err := a.ensureService(); err != nil {
		return nil, err
	}

	cleanID := strings.TrimSpace(id)
	if cleanID == "" {
		return nil, errors.New("user id is required")
	}

	token, err := a.requireAccessToken()
	if err != nil {
		return nil, err
	}

	user, err := a.service.UpdateUserStatus(a.callContext(), token, cleanID, api.UpdateUserStatusRequest{IsActive: isActive})
	if err != nil {
		return nil, err
	}

	return userViewFromAPI(user), nil
}

// DeleteUser removes the user identified by id.
func (a *App) DeleteUser(id string) error {
	if err := a.ensureService(); err != nil {
		return err
	}

	cleanID := strings.TrimSpace(id)
	if cleanID == "" {
		return errors.New("user id is required")
	}

	token, err := a.requireAccessToken()
	if err != nil {
		return err
	}

	if err := a.service.DeleteUser(a.callContext(), token, cleanID); err != nil {
		return err
	}

	current := a.currentSession()
	if current != nil && current.User != nil && current.User.ID == cleanID {
		_, _ = a.saveSession(nil)
	}

	return nil
}

// ListAccounts retrieves accounts visible to the current user.
func (a *App) ListAccounts() ([]AccountView, error) {
	if err := a.ensureService(); err != nil {
		return nil, err
	}

	token, err := a.requireAccessToken()
	if err != nil {
		return nil, err
	}

	accounts, err := a.service.ListAccounts(a.callContext(), token)
	if err != nil {
		return nil, err
	}

	result := make([]AccountView, 0, len(accounts))
	for i := range accounts {
		if view := accountViewFromAPI(&accounts[i]); view != nil {
			result = append(result, *view)
		}
	}
	return result, nil
}

// GetAccount fetches a single account by id.
func (a *App) GetAccount(id string) (*AccountView, error) {
	if err := a.ensureService(); err != nil {
		return nil, err
	}

	cleanID := strings.TrimSpace(id)
	if cleanID == "" {
		return nil, errors.New("account id is required")
	}

	token, err := a.requireAccessToken()
	if err != nil {
		return nil, err
	}

	account, err := a.service.GetAccount(a.callContext(), token, cleanID)
	if err != nil {
		return nil, err
	}

	return accountViewFromAPI(account), nil
}

// CreateAccount opens a new account optionally seeded with an initial deposit.
func (a *App) CreateAccount(initialDeposit float64) (*AccountView, error) {
	if err := a.ensureService(); err != nil {
		return nil, err
	}

	if initialDeposit < 0 {
		return nil, errors.New("initial deposit cannot be negative")
	}

	token, err := a.requireAccessToken()
	if err != nil {
		return nil, err
	}

	account, err := a.service.CreateAccount(a.callContext(), token, api.CreateAccountRequest{InitialDeposit: initialDeposit})
	if err != nil {
		return nil, err
	}

	return accountViewFromAPI(account), nil
}

// UpdateAccount adjusts account balance.
func (a *App) UpdateAccount(id string, balance float64) (*AccountView, error) {
	if err := a.ensureService(); err != nil {
		return nil, err
	}

	cleanID := strings.TrimSpace(id)
	if cleanID == "" {
		return nil, errors.New("account id is required")
	}

	token, err := a.requireAccessToken()
	if err != nil {
		return nil, err
	}

	account, err := a.service.UpdateAccount(a.callContext(), token, cleanID, api.UpdateAccountRequest{Balance: balance})
	if err != nil {
		return nil, err
	}

	return accountViewFromAPI(account), nil
}

// DeleteAccount closes the account identified by id.
func (a *App) DeleteAccount(id string) error {
	if err := a.ensureService(); err != nil {
		return err
	}

	cleanID := strings.TrimSpace(id)
	if cleanID == "" {
		return errors.New("account id is required")
	}

	token, err := a.requireAccessToken()
	if err != nil {
		return err
	}

	return a.service.DeleteAccount(a.callContext(), token, cleanID)
}

// ListCards returns cards visible to the current user.
func (a *App) ListCards() ([]CardView, error) {
	if err := a.ensureService(); err != nil {
		return nil, err
	}

	token, err := a.requireAccessToken()
	if err != nil {
		return nil, err
	}

	cards, err := a.service.ListCards(a.callContext(), token)
	if err != nil {
		return nil, err
	}

	result := make([]CardView, 0, len(cards))
	for i := range cards {
		if view := cardViewFromAPI(&cards[i]); view != nil {
			result = append(result, *view)
		}
	}
	return result, nil
}

// GetCard fetches a card by id.
func (a *App) GetCard(id string) (*CardView, error) {
	if err := a.ensureService(); err != nil {
		return nil, err
	}

	cleanID := strings.TrimSpace(id)
	if cleanID == "" {
		return nil, errors.New("card id is required")
	}

	token, err := a.requireAccessToken()
	if err != nil {
		return nil, err
	}

	card, err := a.service.GetCard(a.callContext(), token, cleanID)
	if err != nil {
		return nil, err
	}

	return cardViewFromAPI(card), nil
}

// CreateCard issues a new card for a specific account.
func (a *App) CreateCard(accountID, cardNumber, cvv, expiry string) (*CardView, error) {
	if err := a.ensureService(); err != nil {
		return nil, err
	}

	accountID = strings.TrimSpace(accountID)
	cardNumber = strings.TrimSpace(cardNumber)
	cvv = strings.TrimSpace(cvv)
	expiry = strings.TrimSpace(expiry)

	if accountID == "" || cardNumber == "" || cvv == "" || expiry == "" {
		return nil, errors.New("account id, card number, cvv, and expiry are required")
	}

	token, err := a.requireAccessToken()
	if err != nil {
		return nil, err
	}

	card, err := a.service.CreateCard(a.callContext(), token, api.CreateCardRequest{
		AccountID: accountID,
		PAN:       cardNumber,
		CVV:       cvv,
		Expiry:    expiry,
	})
	if err != nil {
		return nil, err
	}

	return cardViewFromAPI(card), nil
}

// UpdateCard applies partial updates to card details.
func (a *App) UpdateCard(id string, input UpdateCardInput) (*CardView, error) {
	if err := a.ensureService(); err != nil {
		return nil, err
	}

	cleanID := strings.TrimSpace(id)
	if cleanID == "" {
		return nil, errors.New("card id is required")
	}

	token, err := a.requireAccessToken()
	if err != nil {
		return nil, err
	}

	payload := api.UpdateCardRequest{}
	if input.CardNumber != nil {
		trimmed := strings.TrimSpace(*input.CardNumber)
		if trimmed != "" {
			payload.CardNumber = &trimmed
		}
	}
	if input.CVV != nil {
		trimmed := strings.TrimSpace(*input.CVV)
		if trimmed != "" {
			payload.CVV = &trimmed
		}
	}
	if input.ExpiryDate != nil {
		trimmed := strings.TrimSpace(*input.ExpiryDate)
		if trimmed != "" {
			payload.ExpiryDate = &trimmed
		}
	}

	card, err := a.service.UpdateCard(a.callContext(), token, cleanID, payload)
	if err != nil {
		return nil, err
	}

	return cardViewFromAPI(card), nil
}

// UpdateCardStatus toggles card activation without exposing sensitive data.
func (a *App) UpdateCardStatus(id string, isActive bool) (*CardView, error) {
	if err := a.ensureService(); err != nil {
		return nil, err
	}

	cleanID := strings.TrimSpace(id)
	if cleanID == "" {
		return nil, errors.New("card id is required")
	}

	token, err := a.requireAccessToken()
	if err != nil {
		return nil, err
	}

	card, err := a.service.UpdateCardStatus(a.callContext(), token, cleanID, api.UpdateCardStatusRequest{IsActive: isActive})
	if err != nil {
		return nil, err
	}

	return cardViewFromAPI(card), nil
}

// DeleteCard removes a card by id.
func (a *App) DeleteCard(id string) error {
	if err := a.ensureService(); err != nil {
		return err
	}

	cleanID := strings.TrimSpace(id)
	if cleanID == "" {
		return errors.New("card id is required")
	}

	token, err := a.requireAccessToken()
	if err != nil {
		return err
	}

	return a.service.DeleteCard(a.callContext(), token, cleanID)
}

// ListTransactions retrieves transactions visible to the current user.
func (a *App) ListTransactions() ([]TransactionView, error) {
	if err := a.ensureService(); err != nil {
		return nil, err
	}

	token, err := a.requireAccessToken()
	if err != nil {
		return nil, err
	}

	transactions, err := a.service.ListTransactions(a.callContext(), token)
	if err != nil {
		return nil, err
	}

	result := make([]TransactionView, 0, len(transactions))
	for i := range transactions {
		if view := transactionViewFromAPI(&transactions[i]); view != nil {
			result = append(result, *view)
		}
	}
	return result, nil
}

// GetTransaction fetches a transaction by id.
func (a *App) GetTransaction(id string) (*TransactionView, error) {
	if err := a.ensureService(); err != nil {
		return nil, err
	}

	cleanID := strings.TrimSpace(id)
	if cleanID == "" {
		return nil, errors.New("transaction id is required")
	}

	token, err := a.requireAccessToken()
	if err != nil {
		return nil, err
	}

	tx, err := a.service.GetTransaction(a.callContext(), token, cleanID)
	if err != nil {
		return nil, err
	}

	return transactionViewFromAPI(tx), nil
}

// CreateTransaction records a new transaction entry.
func (a *App) CreateTransaction(input TransactionInput) (*TransactionView, error) {
	if err := a.ensureService(); err != nil {
		return nil, err
	}

	input.AccountID = strings.TrimSpace(input.AccountID)
	if input.AccountID == "" {
		return nil, errors.New("account id is required")
	}
	if input.Amount == 0 {
		return nil, errors.New("amount must be non-zero")
	}
	input.Type = strings.TrimSpace(input.Type)
	if input.Type == "" {
		return nil, errors.New("transaction type is required")
	}

	token, err := a.requireAccessToken()
	if err != nil {
		return nil, err
	}

	payload := api.CreateTransactionRequest{
		AccountID: input.AccountID,
		Amount:    input.Amount,
		Type:      strings.ToUpper(input.Type),
	}
	if input.ToAccountID != nil {
		trimmed := strings.TrimSpace(*input.ToAccountID)
		if trimmed != "" {
			payload.ToAccountID = &trimmed
		}
	}
	if input.Description != nil {
		trimmed := strings.TrimSpace(*input.Description)
		if trimmed != "" {
			payload.Description = &trimmed
		}
	}

	tx, err := a.service.CreateTransaction(a.callContext(), token, payload)
	if err != nil {
		return nil, err
	}

	return transactionViewFromAPI(tx), nil
}

// UpdateTransaction applies partial updates to an existing transaction.
func (a *App) UpdateTransaction(id string, input TransactionUpdateInput) (*TransactionView, error) {
	if err := a.ensureService(); err != nil {
		return nil, err
	}

	cleanID := strings.TrimSpace(id)
	if cleanID == "" {
		return nil, errors.New("transaction id is required")
	}

	token, err := a.requireAccessToken()
	if err != nil {
		return nil, err
	}

	payload := api.UpdateTransactionRequest{}
	if input.Amount != nil {
		payload.Amount = input.Amount
	}
	if input.Description != nil {
		trimmed := strings.TrimSpace(*input.Description)
		if trimmed != "" {
			payload.Description = &trimmed
		}
	}

	tx, err := a.service.UpdateTransaction(a.callContext(), token, cleanID, payload)
	if err != nil {
		return nil, err
	}

	return transactionViewFromAPI(tx), nil
}

// DeleteTransaction removes a transaction by id.
func (a *App) DeleteTransaction(id string) error {
	if err := a.ensureService(); err != nil {
		return err
	}

	cleanID := strings.TrimSpace(id)
	if cleanID == "" {
		return errors.New("transaction id is required")
	}

	token, err := a.requireAccessToken()
	if err != nil {
		return err
	}

	return a.service.DeleteTransaction(a.callContext(), token, cleanID)
}

// ensureService verifies the API service is available.
func (a *App) ensureService() error {
	if a.service == nil {
		if a.initErr != nil {
			return fmt.Errorf("api service unavailable: %w", a.initErr)
		}
		return errors.New("api service unavailable")
	}
	return nil
}

// callContext returns the runtime context if available.
func (a *App) callContext() context.Context {
	if a.ctx != nil {
		return a.ctx
	}
	return context.Background()
}

// currentSession returns a defensive copy of the session.
func (a *App) currentSession() *storage.Session {
	a.mu.RLock()
	defer a.mu.RUnlock()
	if a.session == nil {
		return nil
	}
	copy := *a.session
	if a.session.User != nil {
		userCopy := *a.session.User
		copy.User = &userCopy
	}
	return &copy
}

// requireSession ensures a valid (non-expired) session exists.
func (a *App) requireSession() (*storage.Session, error) {
	session := a.currentSession()
	if session == nil {
		return nil, errors.New("no active session")
	}
	if session.ExpiresAt > 0 && time.Now().Unix() >= session.ExpiresAt {
		return nil, errors.New("session expired")
	}
	return session, nil
}

// requireSessionRaw returns the session without expiry validation.
func (a *App) requireSessionRaw() (*storage.Session, error) {
	session := a.currentSession()
	if session == nil {
		return nil, errors.New("no active session")
	}
	return session, nil
}

// requireAccessToken returns the current access token ensuring validity.
func (a *App) requireAccessToken() (string, error) {
	session, err := a.requireSession()
	if err != nil {
		return "", err
	}
	if session.AccessToken == "" {
		return "", errors.New("access token missing")
	}
	return session.AccessToken, nil
}

// saveSession stores the session in memory and persists it to disk.
func (a *App) saveSession(session *storage.Session) (*SessionView, error) {
	var clone *storage.Session
	if session != nil {
		copy := *session
		if session.User != nil {
			userCopy := *session.User
			copy.User = &userCopy
		}
		clone = &copy
	}

	a.mu.Lock()
	a.session = clone
	a.mu.Unlock()

	if a.sessionStore != nil {
		if clone == nil {
			if err := a.sessionStore.Clear(); err != nil {
				return nil, err
			}
		} else if err := a.sessionStore.Save(clone); err != nil {
			return nil, err
		}
	}

	return sessionViewFromSession(clone), nil
}

// updateSessionFromAuth projects an authentication response into persistent session state.
func (a *App) updateSessionFromAuth(auth *api.AuthResponse) (*SessionView, error) {
	if auth == nil {
		return nil, errors.New("auth response missing")
	}
	session := sessionFromAuth(auth)
	view, err := a.saveSession(session)
	if err != nil {
		return nil, err
	}
	runtime.LogInfo(a.callContext(), "session updated")
	return view, nil
}

// sessionFromAuth converts an authentication payload into a persisted session snapshot.
func sessionFromAuth(auth *api.AuthResponse) *storage.Session {
	if auth == nil {
		return nil
	}
	expiresAt := auth.IssuedAt.Add(time.Duration(auth.ExpiresIn) * time.Second).Unix()
	session := &storage.Session{
		AccessToken:  auth.AccessToken,
		RefreshToken: auth.RefreshToken,
		ExpiresAt:    expiresAt,
	}
	if auth.User != nil {
		session.User = &storage.UserSnapshot{
			ID:        auth.User.ID,
			FullName:  auth.User.FullName,
			Email:     auth.User.Email,
			Role:      auth.User.Role,
			IsActive:  auth.User.IsActive,
			CreatedAt: formatTime(auth.User.CreatedAt),
			UpdatedAt: formatTime(auth.User.UpdatedAt),
		}
	}
	return session
}

// sessionViewFromSession prepares the session for UI presentation.
func sessionViewFromSession(session *storage.Session) *SessionView {
	if session == nil {
		return nil
	}
	view := &SessionView{
		AccessToken:  session.AccessToken,
		RefreshToken: session.RefreshToken,
		ExpiresAt:    session.ExpiresAt,
	}
	if session.User != nil {
		view.User = userViewFromSnapshot(session.User)
	}
	return view
}

// userViewFromAPI converts an API user to a UI model.
func userViewFromAPI(user *api.User) *UserView {
	if user == nil {
		return nil
	}
	return &UserView{
		ID:        user.ID,
		FullName:  user.FullName,
		Email:     user.Email,
		Role:      user.Role,
		IsActive:  user.IsActive,
		CreatedAt: formatTime(user.CreatedAt),
		UpdatedAt: formatTime(user.UpdatedAt),
	}
}

// userViewFromSnapshot converts a stored snapshot to a UI model.
func userViewFromSnapshot(snapshot *storage.UserSnapshot) *UserView {
	if snapshot == nil {
		return nil
	}
	return &UserView{
		ID:        snapshot.ID,
		FullName:  snapshot.FullName,
		Email:     snapshot.Email,
		Role:      snapshot.Role,
		IsActive:  snapshot.IsActive,
		CreatedAt: snapshot.CreatedAt,
		UpdatedAt: snapshot.UpdatedAt,
	}
}

// accountViewFromAPI converts an API account to a UI model.
func accountViewFromAPI(account *api.Account) *AccountView {
	if account == nil {
		return nil
	}
	return &AccountView{
		ID:            account.ID,
		UserID:        account.UserID,
		AccountNumber: account.AccountNumber,
		Balance:       account.Balance,
		CreatedAt:     formatTime(account.CreatedAt),
		UpdatedAt:     formatTime(account.UpdatedAt),
	}
}

// cardViewFromAPI converts an API card to a UI model.
func cardViewFromAPI(card *api.Card) *CardView {
	if card == nil {
		return nil
	}
	return &CardView{
		ID:         card.ID,
		AccountID:  card.AccountID,
		CardNumber: card.CardNumber,
		MaskedPAN:  card.MaskedPAN,
		ExpiryDate: card.ExpiryDate,
		IsActive:   card.IsActive,
		CreatedAt:  formatTime(card.CreatedAt),
		UpdatedAt:  formatTime(card.UpdatedAt),
	}
}

// transactionViewFromAPI converts an API transaction to a UI model.
func transactionViewFromAPI(tx *api.Transaction) *TransactionView {
	if tx == nil {
		return nil
	}
	view := &TransactionView{
		ID:          tx.ID,
		AccountID:   tx.AccountID,
		Amount:      tx.Amount,
		Type:        tx.Type,
		Description: tx.Description,
		CreatedAt:   formatTime(tx.CreatedAt),
	}
	if tx.ToAccountID != nil {
		trimmed := strings.TrimSpace(*tx.ToAccountID)
		if trimmed != "" {
			view.ToAccountID = &trimmed
		}
	}
	return view
}

// formatTime normalises timestamps for frontend usage.
func formatTime(t time.Time) string {
	if t.IsZero() {
		return ""
	}
	return t.UTC().Format(timestampLayout)
}

// defaultSessionPath determines the on-disk location for session storage.
func defaultSessionPath() (string, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return "", fmt.Errorf("resolve config dir: %w", err)
	}
	return filepath.Join(configDir, "desktop-app", "session.json"), nil
}

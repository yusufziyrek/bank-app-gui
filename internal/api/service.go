package api

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
)

// Service exposes typed helper methods for the BankApp REST endpoints.
type Service struct {
	client *Client
}

// NewService creates a new Service wrapper around the low level client.
func NewService(client *Client) *Service {
	return &Service{client: client}
}

func (s *Service) postJSON(ctx context.Context, path string, body interface{}, token string, out interface{}) error {
	return s.client.Do(ctx, Request{Method: http.MethodPost, Path: path, Body: body, AccessToken: token, Result: out})
}

func (s *Service) getJSON(ctx context.Context, path string, query url.Values, token string, out interface{}) error {
	return s.client.Do(ctx, Request{Method: http.MethodGet, Path: path, Query: query, AccessToken: token, Result: out})
}

func (s *Service) putJSON(ctx context.Context, path string, body interface{}, token string, out interface{}) error {
	return s.client.Do(ctx, Request{Method: http.MethodPut, Path: path, Body: body, AccessToken: token, Result: out})
}

func (s *Service) patchJSON(ctx context.Context, path string, body interface{}, token string, out interface{}) error {
	return s.client.Do(ctx, Request{Method: http.MethodPatch, Path: path, Body: body, AccessToken: token, Result: out})
}

func (s *Service) delete(ctx context.Context, path string, token string) error {
	return s.client.Do(ctx, Request{Method: http.MethodDelete, Path: path, AccessToken: token})
}

// Authentication -----------------------------------------------------------

func (s *Service) Register(ctx context.Context, payload RegisterRequest) (*AuthResponse, error) {
	var result AuthResponse
	if err := s.postJSON(ctx, "/api/v1/register", payload, "", &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *Service) Login(ctx context.Context, payload LoginRequest) (*AuthResponse, error) {
	var result AuthResponse
	if err := s.postJSON(ctx, "/api/v1/login", payload, "", &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *Service) Refresh(ctx context.Context, payload RefreshRequest) (*AuthResponse, error) {
	var result AuthResponse
	if err := s.postJSON(ctx, "/api/v1/refresh", payload, "", &result); err != nil {
		return nil, err
	}
	return &result, nil
}

// Users --------------------------------------------------------------------

func (s *Service) ListUsers(ctx context.Context, token string) ([]User, error) {
	var result UsersResponse
	if err := s.getJSON(ctx, "/api/v1/users", nil, token, &result); err != nil {
		return nil, err
	}
	return result.Users, nil
}

func (s *Service) GetUser(ctx context.Context, token, id string) (*User, error) {
	var result User
	if err := s.getJSON(ctx, fmt.Sprintf("/api/v1/users/%s", id), nil, token, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *Service) GetProfile(ctx context.Context, token string) (*User, error) {
	var result User
	if err := s.getJSON(ctx, "/api/v1/users/me", nil, token, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *Service) UpdateUserEmail(ctx context.Context, token, id string, payload UpdateEmailRequest) (*User, error) {
	var result User
	if err := s.putJSON(ctx, fmt.Sprintf("/api/v1/users/%s/email", id), payload, token, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *Service) UpdateUserPassword(ctx context.Context, token, id string, payload UpdatePasswordRequest) error {
	return s.putJSON(ctx, fmt.Sprintf("/api/v1/users/%s/password", id), payload, token, nil)
}

func (s *Service) UpdateUserStatus(ctx context.Context, token, id string, payload UpdateUserStatusRequest) (*User, error) {
	var result User
	if err := s.putJSON(ctx, fmt.Sprintf("/api/v1/users/%s/status", id), payload, token, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *Service) DeleteUser(ctx context.Context, token, id string) error {
	return s.delete(ctx, fmt.Sprintf("/api/v1/users/%s", id), token)
}

// Accounts -----------------------------------------------------------------

func (s *Service) ListAccounts(ctx context.Context, token string) ([]Account, error) {
	var result AccountsResponse
	if err := s.getJSON(ctx, "/api/v1/accounts", nil, token, &result); err != nil {
		return nil, err
	}
	return result.Accounts, nil
}

func (s *Service) GetAccount(ctx context.Context, token, id string) (*Account, error) {
	var result Account
	if err := s.getJSON(ctx, fmt.Sprintf("/api/v1/accounts/%s", id), nil, token, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *Service) CreateAccount(ctx context.Context, token string, payload CreateAccountRequest) (*Account, error) {
	var result Account
	if err := s.postJSON(ctx, "/api/v1/accounts", payload, token, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *Service) UpdateAccount(ctx context.Context, token, id string, payload UpdateAccountRequest) (*Account, error) {
	var result Account
	if err := s.putJSON(ctx, fmt.Sprintf("/api/v1/accounts/%s", id), payload, token, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *Service) DeleteAccount(ctx context.Context, token, id string) error {
	return s.delete(ctx, fmt.Sprintf("/api/v1/accounts/%s", id), token)
}

// Cards --------------------------------------------------------------------

func (s *Service) ListCards(ctx context.Context, token string) ([]Card, error) {
	var result CardsResponse
	if err := s.getJSON(ctx, "/api/v1/cards", nil, token, &result); err != nil {
		return nil, err
	}
	return result.Cards, nil
}

func (s *Service) GetCard(ctx context.Context, token, id string) (*Card, error) {
	var result Card
	if err := s.getJSON(ctx, fmt.Sprintf("/api/v1/cards/%s", id), nil, token, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *Service) CreateCard(ctx context.Context, token string, payload CreateCardRequest) (*Card, error) {
	var result Card
	if err := s.postJSON(ctx, "/api/v1/cards", payload, token, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *Service) UpdateCard(ctx context.Context, token, id string, payload UpdateCardRequest) (*Card, error) {
	var result Card
	if err := s.putJSON(ctx, fmt.Sprintf("/api/v1/cards/%s", id), payload, token, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *Service) PatchCard(ctx context.Context, token, id string, payload UpdateCardRequest) (*Card, error) {
	var result Card
	if err := s.patchJSON(ctx, fmt.Sprintf("/api/v1/cards/%s", id), payload, token, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *Service) UpdateCardStatus(ctx context.Context, token, id string, payload UpdateCardStatusRequest) (*Card, error) {
	var result Card
	if err := s.patchJSON(ctx, fmt.Sprintf("/api/v1/cards/%s/status", id), payload, token, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *Service) DeleteCard(ctx context.Context, token, id string) error {
	return s.delete(ctx, fmt.Sprintf("/api/v1/cards/%s", id), token)
}

// Transactions -------------------------------------------------------------

func (s *Service) ListTransactions(ctx context.Context, token string) ([]Transaction, error) {
	var result TransactionsResponse
	if err := s.getJSON(ctx, "/api/v1/transactions", nil, token, &result); err != nil {
		return nil, err
	}
	return result.Transactions, nil
}

func (s *Service) GetTransaction(ctx context.Context, token, id string) (*Transaction, error) {
	var result Transaction
	if err := s.getJSON(ctx, fmt.Sprintf("/api/v1/transactions/%s", id), nil, token, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *Service) CreateTransaction(ctx context.Context, token string, payload CreateTransactionRequest) (*Transaction, error) {
	var result Transaction
	if err := s.postJSON(ctx, "/api/v1/transactions", payload, token, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *Service) UpdateTransaction(ctx context.Context, token, id string, payload UpdateTransactionRequest) (*Transaction, error) {
	var result Transaction
	if err := s.putJSON(ctx, fmt.Sprintf("/api/v1/transactions/%s", id), payload, token, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *Service) DeleteTransaction(ctx context.Context, token, id string) error {
	return s.delete(ctx, fmt.Sprintf("/api/v1/transactions/%s", id), token)
}

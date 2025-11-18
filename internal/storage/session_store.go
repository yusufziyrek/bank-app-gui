package storage

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
)

// Session represents persisted authentication tokens.
type Session struct {
	AccessToken  string        `json:"access_token"`
	RefreshToken string        `json:"refresh_token"`
	ExpiresAt    int64         `json:"expires_at"`
	User         *UserSnapshot `json:"user"`
}

// UserSnapshot keeps minimal user information alongside the tokens for offline presentation.
type UserSnapshot struct {
	ID        string `json:"id"`
	FullName  string `json:"full_name"`
	Email     string `json:"email"`
	Role      string `json:"role"`
	IsActive  bool   `json:"is_active"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

// Store persists the session payload on disk.
type Store struct {
	path string
}

// NewStore creates a session store in the given directory.
func NewStore(path string) *Store {
	return &Store{path: path}
}

// Load reads a session from disk if it exists.
func (s *Store) Load() (*Session, error) {
	if s.path == "" {
		return nil, errors.New("store path is empty")
	}

	file, err := os.Open(s.path)
	if errors.Is(err, os.ErrNotExist) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("open session file: %w", err)
	}
	defer file.Close()

	var session Session
	if err := json.NewDecoder(file).Decode(&session); err != nil {
		return nil, fmt.Errorf("decode session: %w", err)
	}
	return &session, nil
}

// Save writes the session to disk, creating parent directories as necessary.
func (s *Store) Save(session *Session) error {
	if s.path == "" {
		return errors.New("store path is empty")
	}
	if session == nil {
		return errors.New("session payload is nil")
	}

	if err := os.MkdirAll(filepath.Dir(s.path), 0o755); err != nil {
		return fmt.Errorf("create session dir: %w", err)
	}

	file, err := os.OpenFile(s.path, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, 0o600)
	if err != nil {
		return fmt.Errorf("open session file: %w", err)
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(session); err != nil {
		return fmt.Errorf("encode session: %w", err)
	}
	return nil
}

// Clear removes the persisted session file.
func (s *Store) Clear() error {
	if s.path == "" {
		return errors.New("store path is empty")
	}
	if err := os.Remove(s.path); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return nil
		}
		return fmt.Errorf("remove session file: %w", err)
	}
	return nil
}

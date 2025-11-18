package api

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"path"
	"strings"
	"time"
)

// Client is a lightweight HTTP client tailored for the BankApp REST API.
type Client struct {
	baseURL   *url.URL
	http      *http.Client
	userAgent string
}

// Option configures the API client during construction.
type Option func(*Client)

// WithHTTPClient overrides the default http.Client instance.
func WithHTTPClient(httpClient *http.Client) Option {
	return func(c *Client) {
		if httpClient != nil {
			c.http = httpClient
		}
	}
}

// WithUserAgent overrides the default User-Agent header.
func WithUserAgent(agent string) Option {
	return func(c *Client) {
		c.userAgent = agent
	}
}

// NewClient constructs a new API client using the provided base URL.
func NewClient(baseURL string, opts ...Option) (*Client, error) {
	parsed, err := url.Parse(strings.TrimSpace(baseURL))
	if err != nil {
		return nil, fmt.Errorf("invalid base url: %w", err)
	}

	c := &Client{
		baseURL: parsed,
		http: &http.Client{
			Timeout: 15 * time.Second,
		},
		userAgent: "BankAppDesktop/1.0",
	}

	for _, opt := range opts {
		opt(c)
	}

	return c, nil
}

// Request encapsulates the necessary fields to execute an API call.
type Request struct {
	Method      string
	Path        string
	Query       url.Values
	Body        interface{}
	Headers     http.Header
	AccessToken string
	Result      interface{}
}

// Do issues the HTTP request described by the Request payload and decodes the JSON response into Result if provided.
func (c *Client) Do(ctx context.Context, req Request) error {
	if req.Method == "" {
		return fmt.Errorf("request method is required")
	}

	rel, err := url.Parse(req.Path)
	if err != nil {
		return fmt.Errorf("invalid request path: %w", err)
	}

	finalURL := *c.baseURL
	finalURL.Path = path.Join(c.baseURL.Path, rel.Path)
	finalURL.RawQuery = req.Query.Encode()

	var body io.Reader
	if req.Body != nil {
		payload, err := json.Marshal(req.Body)
		if err != nil {
			return fmt.Errorf("marshal body: %w", err)
		}
		body = bytes.NewReader(payload)
	}

	httpReq, err := http.NewRequestWithContext(ctx, req.Method, finalURL.String(), body)
	if err != nil {
		return fmt.Errorf("create request: %w", err)
	}

	httpReq.Header.Set("Accept", "application/json")
	httpReq.Header.Set("User-Agent", c.userAgent)
	if req.Body != nil {
		httpReq.Header.Set("Content-Type", "application/json")
	}
	if req.AccessToken != "" {
		httpReq.Header.Set("Authorization", "Bearer "+req.AccessToken)
	}
	for key, values := range req.Headers {
		for _, value := range values {
			httpReq.Header.Add(key, value)
		}
	}

	httpResp, err := c.http.Do(httpReq)
	if err != nil {
		return fmt.Errorf("perform request: %w", err)
	}
	defer httpResp.Body.Close()

	if httpResp.StatusCode >= 400 {
		apiErr, decodeErr := decodeAPIError(httpResp)
		if decodeErr != nil {
			return fmt.Errorf("api error: status=%d: %w", httpResp.StatusCode, decodeErr)
		}
		apiErr.StatusCode = httpResp.StatusCode
		return apiErr
	}

	if req.Result == nil || httpResp.StatusCode == http.StatusNoContent {
		return nil
	}

	decoder := json.NewDecoder(httpResp.Body)
	if err := decoder.Decode(req.Result); err != nil {
		return fmt.Errorf("decode response: %w", err)
	}

	return nil
}

// decodeAPIError attempts to parse a JSON error payload returned by the API.
func decodeAPIError(resp *http.Response) (*Error, error) {
	payload, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read error body: %w", err)
	}

	if len(payload) == 0 {
		return &Error{StatusCode: resp.StatusCode, Message: resp.Status}, nil
	}

	var wrapper map[string]interface{}
	if err := json.Unmarshal(payload, &wrapper); err != nil {
		// Return body as raw string if JSON decoding fails.
		return &Error{StatusCode: resp.StatusCode, Message: strings.TrimSpace(string(payload))}, nil
	}

	message := "unexpected error"
	if msg, ok := wrapper["message"].(string); ok {
		message = msg
	} else if errStr, ok := wrapper["error"].(string); ok {
		message = errStr
	}

	return &Error{StatusCode: resp.StatusCode, Message: message, Details: wrapper}, nil
}

// Error represents an error returned by the BankApp API.
type Error struct {
	StatusCode int
	Message    string
	Details    map[string]interface{}
}

func (e *Error) Error() string {
	if e == nil {
		return ""
	}
	if e.Message != "" {
		return fmt.Sprintf("api error (%d): %s", e.StatusCode, e.Message)
	}
	return fmt.Sprintf("api error (%d)", e.StatusCode)
}

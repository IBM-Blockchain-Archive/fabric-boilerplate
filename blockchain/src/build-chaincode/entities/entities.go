package entities

type ECertResponse struct {
	OK string `json:"OK"`
}

type TestData struct {
	Clients []Client `json:"clients"`
	Things  []Thing  `json:"things"`
}

type TestDataElement interface {
	ID() string
}

type Client struct {
	TestDataElement `json:"-"`
	ClientID string `json:"clientID"`
	Username string `json:"username"`
	Password string `json:"password"`
	Salt     string `json:"salt"`
	Hash     string `json:"hash"`
}

type Thing struct {
	TestDataElement    `json:"-"`
	ThingID      string `json:"thingID"`
	SomeProperty string `json:"someProperty"`
	ClientID     string `json:"clientID"`
}

type ConsumerAuthenticationResult struct {
	Client        Client
	Authenticated bool
}

type Users struct {
	CLients []Client `json:"consumers"`
}

func (t *Client) ID() string {
	return t.Username
}

func (t *Thing) ID() string {
	return t.ThingID
}

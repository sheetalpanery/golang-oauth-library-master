package service

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	"testing"
)

func Test_GetAccessToken_With_Valid_AuthorizationCode(t *testing.T) {
	autorizationCode := "G-xxlrnRQeJF5CQROvBynVpiM6tECxF2hisAAAEu"
	token, err := GetAccessToken(autorizationCode)
	fmt.Println(token)
	assert.Nil(t, err)
	assert.NotNil(t, token)
	//assert.Greater(t, len(token), 0)
}

func Test_GetAccessToken_With_Nil_AuthorizationCode(t *testing.T) {
	autorizationCode := ""
	token, err := GetAccessToken(autorizationCode)
	assert.Empty(t, token)
	assert.NotNil(t, err)
}

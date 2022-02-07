package service

import (
	"encoding/json"
	"fmt"
	"github.com/spf13/cast"
	"github.com/spf13/viper"
	"golang-oauth-library-master/logger"
	"io/ioutil"
	"net/http"
	"strings"
)

var (
	CLIENT_ID     string
	CLIENT_SECRET string
	REDIRECT_URI  string
)

func InitAuthClient() {

	runmode := cast.ToString(viper.Get("runmode"))

	AuthMap := viper.Get(runmode + ".auth").(map[string]interface{})
	CLIENT_ID = AuthMap["client_id"].(string)
	CLIENT_SECRET = AuthMap["client_secret"].(string)
	REDIRECT_URI = AuthMap["redirect_uri"].(string)
}

func Request() string {
	redirectUrl := `https://cloudsso-test.cisco.com/as/authorization.oauth2` +
		`?response_type=code&` +
		`client_id=` + CLIENT_ID +
		`&scope=%20openid%20profile%20email%20phone` +
		`&redirect_uri=` + REDIRECT_URI

	return redirectUrl
}

func GetAccessToken(code string) (token interface{}, err error) {
	url := "https://cloudsso-test.cisco.com/as/token.oauth2"
	method := "POST"

	payload := strings.NewReader(
		"client_id=" + CLIENT_ID +
			"&client_secret=" + CLIENT_SECRET +
			"&grant_type=authorization_code" +
			"&redirect_uri=" + REDIRECT_URI +
			"&code=" + code,
	)

	client := &http.Client{}
	req, err := http.NewRequest(method, url, payload)
	if err != nil {
		//fmt.Println(err)
		logger.SugarLogger.Error(err)
		return
	}
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	res, err := client.Do(req)
	if err != nil {
		//fmt.Println(err)
		logger.SugarLogger.Error(err)
		return
	}
	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		//fmt.Println(err)
		logger.SugarLogger.Error(err)
		return
	}
	fmt.Println(string(body))

	var response interface{}
	json.Unmarshal(body, &response)
	return response, nil
}

func GetUserInfo(Accesstoken string) (userInfo interface{}, err error) {

	url := "https://cloudsso-test.cisco.com/idp/userinfo.openid"
	method := "GET"

	client := &http.Client{}
	req, err := http.NewRequest(method, url, nil)

	if err != nil {
		fmt.Println(err)
		return
	}
	req.Header.Add("Authorization", "Bearer "+Accesstoken)

	res, err := client.Do(req)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	fmt.Println(string(body))
	json.Unmarshal(body, &userInfo)
	return userInfo, nil

}

package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"golang-oauth-library-master/communication"
	"golang-oauth-library-master/logger"
	"golang-oauth-library-master/models"
	"io/ioutil"
	"net/http"

	"github.com/spf13/viper"
)

var RedisClient *communication.Client

func Init() {
	runmode := viper.Get("runmode").(string)
	redis := viper.Get(runmode + ".redis").(map[string]interface{})
	fmt.Println("Cache Initialized")
	RedisClient = communication.NewClient(redis["hostname"].(string), redis["password"].(string))
}

func getCCOUserFromUserInfo(userInfo map[string]interface{}) models.CCOUser {
	ccoUser := models.CCOUser{
		Userid:      userInfo["sub"].(string),
		Ccoid:       userInfo["sub"].(string),
		Email:       userInfo["email"].(string),
		PhoneNumber: userInfo["phone_number"].(string),
		CompanyInfo: userInfo["company"].(string),
		FullName:    userInfo["fullname"].(string),
	}
	logger.SugarLogger.Info("Created cco user", ccoUser)
	return ccoUser
}

func LoadCCOUserByUserInfoAndAdmin(userInfo map[string]interface{}) (remoteuser models.CCOUser, err error) {
	ccoUser := getCCOUserFromUserInfo(userInfo)

	remoteUser, err := createOrUpdateUser(ccoUser)
	if err != nil || remoteUser == nil || remoteUser.Ccoid == "" {
		logger.SugarLogger.Error("Error while creating or updating user in admin")
		logger.SugarLogger.Info("Sending default ccoUser", ccoUser)
		return ccoUser, err
	}
	return *remoteUser, nil
}

func createOrUpdateUser(ccoUser models.CCOUser) (remoteuser *models.CCOUser, err error) {

	ccoUserFromAdmin, err := FetchCCOUserFromAdmin(ccoUser.Ccoid)
	logger.SugarLogger.Info("CCOUserFromAdmin", ccoUserFromAdmin)
	logger.SugarLogger.Info("Err", err)

	if err != nil || ccoUserFromAdmin == nil || ccoUserFromAdmin.Ccoid == "" {
		//create CCOUser in Admin
		ccoUserFromAdmin, err = CreateCCOUser(ccoUser)
		if err != nil || ccoUserFromAdmin == nil || ccoUserFromAdmin.Ccoid == "" {
			logger.SugarLogger.Error("Error while creating user in admin", err)
			return nil, err
		}
		return ccoUserFromAdmin, err
	} else {
		//update CCOUser in admin.
		ccoUserFromAdmin, err = UpdateCCOUser(ccoUser)
		if err != nil {
			logger.SugarLogger.Error("Error while updating user in admin", err)
			return nil, err
		}
		return ccoUserFromAdmin, err
	}

}

func CreateCCOUser(user models.CCOUser) (remoteuser *models.CCOUser, err error) {
	Url := "https://learningspace-qa.cisco.com/admin" + "/rest/api/users/createuser"
	return ExchangeCCOUser(user, Url)

}

func UpdateCCOUser(user models.CCOUser) (remoteuser *models.CCOUser, err error) {
	Url := "https://learningspace-qa.cisco.com/admin" + "/rest/api/users/updateuser"
	return ExchangeCCOUser(user, Url)
}

func FetchCCOUserFromAdmin(ccoid string) (remoteuser *models.CCOUser, err error) {
	url := "https://learningspace-qa.cisco.com/admin" + "/rest/api/users/getuser"

	method := "POST"

	requestPayload := make(map[string]string)
	requestPayload["userid"] = ccoid

	jsonBody, _ := json.Marshal(requestPayload)
	payload := bytes.NewBuffer(jsonBody)

	client := &http.Client{}
	req, err := http.NewRequest(method, url, payload)
	if err != nil {
		logger.SugarLogger.Error(err)
		return nil, err
	}
	req.Header.Add("Content-Type", "application/json")

	res, err := client.Do(req)
	if err != nil || res.StatusCode > 300 {
		logger.SugarLogger.Error(err)
		return nil, err
	}
	defer res.Body.Close()
	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		logger.SugarLogger.Error(err)
		return nil, err
	}
	// logger.SugarLogger.Info("resBody", string(body))

	json.Unmarshal(body, &remoteuser)
	return remoteuser, err

}

func ExchangeCCOUser(user models.CCOUser, Url string) (remoteuser *models.CCOUser, err error) {

	method := "POST"
	jsonBody, _ := json.Marshal(user)
	payload := bytes.NewBuffer(jsonBody)

	client := &http.Client{}
	req, err := http.NewRequest(method, Url, payload)
	if err != nil {
		//fmt.Println(err)
		logger.SugarLogger.Error(err)
		return
	}
	req.Header.Add("Content-Type", "application/json")
	res, err := client.Do(req)
	if err != nil || res.StatusCode > 300 {
		//fmt.Println(err)
		logger.SugarLogger.Error(err)
		return nil, err
	}
	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		//fmt.Println(err)
		logger.SugarLogger.Error(err)
		return nil, err
	}
	fmt.Println(string(body))
	json.Unmarshal(body, &remoteuser)
	return remoteuser, err

	//var response interface{}

}

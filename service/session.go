package service

import (
	"encoding/json"
	"golang-oauth-library-master/logger"
	"golang-oauth-library-master/models"
	"time"
)

func CreateUserSession(ccoUser models.CCOUser) (sessionId string, err error) {

	sessionId = ccoUser.Email

	err = RedisClient.AddData(sessionId, ccoUser, 24*time.Hour)
	if err != nil {
		logger.SugarLogger.Error("Error while saving data in redis:", err)
		return "", err
	}

	return sessionId, err
}

func RemoveUserFromSession(sessionId string) {
	err := RedisClient.RemoveDataByKey(sessionId)
	if err != nil {
		logger.SugarLogger.Error("Error while removing session from redis for session id:", sessionId)
	}
	return
}

func GetUserFromSession(sessionId string) (ccoUser models.CCOUser, err error) {

	userInfo, err := RedisClient.GetDataByKey(sessionId)
	logger.SugarLogger.Info("Redis Data:", userInfo)
	if err != nil {
		logger.SugarLogger.Error("Error while getting redis data for session.")
		return models.CCOUser{}, err
	}
	jsonbody, err := json.Marshal(userInfo)
	if err != nil {
		// do error check
		logger.SugarLogger.Error("Error while getting redis data for session.")
		return
	}
	ccoUser = models.CCOUser{}
	if err = json.Unmarshal(jsonbody, &ccoUser); err != nil {
		// do error check
		logger.SugarLogger.Error("Error while unmarshaling data to CCOUser.")
		return
	}
	return ccoUser, nil

}

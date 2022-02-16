package handler

import (
	"fmt"
	"golang-oauth-library-master/logger"
	"golang-oauth-library-master/models"
	"golang-oauth-library-master/service"
	"html/template"
	"log"
	"net/http"
	"time"
)

const (
	contentTypeJSON                   = "application/json"
	contentTypePlain                  = "text/html"
	headerContentType                 = "Content-Type"
	httpErrMessageBadRequest          = "Bad Request"
	httpStatusOkMessage               = "Success"
	httpErrMessageInternalServerError = "Something bad"
	httErrMessageUnauthorized         = "Not authorized"
)

var Tmpl *template.Template

func CheckAndGetSessionUserObjectFromRequest(req *http.Request) (ccoUser models.CCOUser, err error) {
	cookie, err := req.Cookie("session-id")
	if err != nil {
		logger.SugarLogger.Error("No Session Id found in request.")
		return models.CCOUser{}, err
	}
	logger.SugarLogger.Info("cookie:", cookie)
	sessionId := cookie.Value
	user, err := service.GetUserFromSession(sessionId)

	if err != nil {
		logger.SugarLogger.Error("No user found in session with session id", sessionId)
		return models.CCOUser{}, err
	}
	return user, nil

}

func LogOutHandler(w http.ResponseWriter, req *http.Request) {

	cookie, err := req.Cookie("session-id")
	if err != nil {
		logger.SugarLogger.Error("No Session Id found in request.")
	}
	logger.SugarLogger.Info("cookie:", cookie)
	sessionId := cookie.Value
	service.RemoveUserFromSession(sessionId)
	cookie.MaxAge = -1 // delete cookie immediately from client
	http.SetCookie(w, cookie)
	http.Redirect(w, req, "/", http.StatusSeeOther)

}

func GetUserHomeInfoObjectFromCCOUser(ccoUser models.CCOUser) models.UserHomePageInfo {
	userHomeInfo := models.UserHomePageInfo{
		UserName:     ccoUser.Userid,
		CCOID:        ccoUser.Userid,
		UserFullName: ccoUser.FullName}
	return userHomeInfo
}

func HomePageHandle(w http.ResponseWriter, req *http.Request) {
	ccoUser, err := CheckAndGetSessionUserObjectFromRequest(req)
	logger.SugarLogger.Info("CCOUser CCOId:", ccoUser.Userid)
	if err != nil || ccoUser.Ccoid == "" {

		err := Tmpl.ExecuteTemplate(w, "home", nil)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	err = Tmpl.ExecuteTemplate(w, "home", GetUserHomeInfoObjectFromCCOUser(ccoUser))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func LoginHandler(w http.ResponseWriter, req *http.Request) {
	loginUrl := "https://cloudsso-test.cisco.com/as/authorization.oauth2?response_type=code&client_id=_WSXUserSTG_OAUTHNEW_&scope=%20openid%20profile%20email%20phone&redirect_uri=http://localhost:8080/callback"
	req.Method = "POST"

	sb := ""
	sb = sb + "<html>"
	sb = sb + "<body onload='document.forms[\"form\"].submit()'>"
	sb = sb + "<form name='form' action='" + loginUrl + "' method='post'>"
	sb = sb + "</form>"
	sb = sb + "</body>"
	sb = sb + "</html>"

	w.Write([]byte(sb))
	w.WriteHeader(200)

	http.Redirect(w, req, loginUrl, 302)
}

//take the url

func Ping(w http.ResponseWriter, req *http.Request) {
	w.Header().Set(headerContentType, contentTypePlain)
	w.Write([]byte("pong"))
}

func RequestHandler(w http.ResponseWriter, req *http.Request) {

	url := service.Request()
	logger.SugarLogger.Debugf("tring to hit get request for %s", url)
	http.Redirect(w, req, url, http.StatusTemporaryRedirect)
}

func GetUserInfoByAuthorizationCode(w http.ResponseWriter, req *http.Request) {
	// code := req.Header.Get("code")
	code := req.FormValue("code")
	fmt.Println("code:", code)
	accessTokenString, err := service.GetAccessToken(code)
	if err != nil {
		log.Fatal("Error while fetching the access token", err)
	}

	var accessTokenDetailMap map[string]interface{}
	accessTokenDetailMap = accessTokenString.(map[string]interface{})
	userInfo, _ := service.GetUserInfo(fmt.Sprint(accessTokenDetailMap["access_token"]))

	//call admin to update the ccouser though admin api.
	ccoUser, err := service.LoadCCOUserByUserInfoAndAdmin(userInfo.(map[string]interface{}))
	if err != nil {

	}

	// create session for ccouser.
	sessionId, err := service.CreateUserSession(ccoUser)
	if err != nil {
		// TODO : Error handling
	}

	//set cookie with session id for ccouser
	expiration := time.Now().Add(365 * 24 * time.Hour)
	cookie := http.Cookie{Name: "session-id", Value: sessionId, Expires: expiration}
	http.SetCookie(w, &cookie)

	http.Redirect(w, req, "/", http.StatusSeeOther)

}

func GetUserInformationByAccessToken(w http.ResponseWriter, req *http.Request) {
	//accessToken:=req.URL.Query().Get("accesstoken")
	accessToken := req.Header.Get("accesstoken")
	userInfo, err := service.GetUserInfo(accessToken)
	if err != nil {
		URLReturnResponseJson(w, err)
	}
	URLReturnResponseJson(w, userInfo)
}

func GenerateAccessToken(w http.ResponseWriter, req *http.Request) {
	code := req.URL.Query().Get("code")
	fmt.Println("code:", code)
	token, err := service.GetAccessToken(code)
	if err != nil {
		URLReturnResponseJson(w, err)
	}

	URLReturnResponseJson(w, token)
}

func MyContent(w http.ResponseWriter, req *http.Request) {
	err := Tmpl.ExecuteTemplate(w, "mycontent", nil)
	if err != nil {
		fmt.Println(err)

	}

}

func MyCourses(w http.ResponseWriter, req *http.Request) {
	CourseDetail := models.MyCourses{
		ModuleMasterId: 123,
		ModuleTitle:    "234",
		SkuTitle:       "new",
		ModuleName:     "cisco",
		Description:    "",
		Free:           true,
	}
	slice := make([]models.MyCourses, 0)
	slice = append(slice, CourseDetail)

	//myCouses := myContent.GetContentById()
	URLReturnResponseJson(w, slice)

}
func MyEntitlements(w http.ResponseWriter, req *http.Request) {
	MyEntitlementsDetail := models.MyEntitlements{
		ModuleMasterId: 123,
		ModuleTitle:    "234",
		SkuTitle:       "new",
		ModuleName:     "cisco",
		Description:    "",
		Free:           true,
	}
	slice := make([]models.MyEntitlements, 0)
	slice = append(slice, MyEntitlementsDetail)

	//myCouses := myContent.GetContentById()
	URLReturnResponseJson(w, slice)

}

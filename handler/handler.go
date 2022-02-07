package handler

import (
	"encoding/json"
	"fmt"
	"golang-oauth-library-master/logger"
	"golang-oauth-library-master/models"
	"golang-oauth-library-master/service"
	"html/template"
	"net/http"
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

func HomePageHandle(w http.ResponseWriter, req *http.Request) {
	err := Tmpl.ExecuteTemplate(w, "home", nil)
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
	sb = sb + "<form name='form' action='"+loginUrl+"' method='post'>"
	sb = sb + "</form>"
	sb = sb + "</body>"
	sb = sb + "</html>"

	w.Write([] byte(sb))
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

	var accessTokenDetailMap map[string]interface{}
	accessTokenDetailMap = accessTokenString.(map[string]interface{})
	userInfo, err := service.GetUserInfo(fmt.Sprint(accessTokenDetailMap["access_token"]))
	userInfoMap := userInfo.(map[string]interface{})
	fmt.Println(userInfoMap["sub"])
	userHomeInfo := UserHomePageInfo{
		userInfoMap["sub"].(string),
		userInfoMap["sub"].(string),
		code,
		userInfoMap["fullname"].(string)}

	//store session here.
	err = Tmpl.ExecuteTemplate(w, "home", userHomeInfo)
	if err != nil {
		fmt.Println(err)

	}

}

type UserHomePageInfo struct {
	UserName     string
	CCOID        string
	AccessCode   string
	UserFullName string
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

func URLReturnResponseJson(w http.ResponseWriter, data interface{}) {
	returnJson, err := json.Marshal(data)
	if err != nil {
		fmt.Println("issue while parsing json")
	}
	w.Header().Set("Content-Type", "application/json")
	//json.NewEncoder(w).Encode(data)
	w.WriteHeader(http.StatusOK)
	w.Write(returnJson)
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

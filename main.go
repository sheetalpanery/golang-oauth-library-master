package main

import (
	"fmt"
	"golang-oauth-library-master/handler"
	"golang-oauth-library-master/logger"
	"golang-oauth-library-master/service"
	"html/template"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/spf13/viper"
)

func init() {
	setUpViper()
	service.InitAuthClient()
	logger.InitLogger()
	defer logger.SugarLogger.Sync()
}

func init() {
	var err error
	service.Init()
	handler.Tmpl, err = template.ParseGlob("public/*")
	if err != nil {
		panic(err.Error())
		return
	}
}

func main() {

	port := ":8080"
	r := mux.NewRouter()

	//specify endpoints, handler functions and HTTP method
	r.HandleFunc("/healthcheck/ping", handler.Ping).Methods("GET")
	r.HandleFunc("/getAccessTokenByCode", handler.GenerateAccessToken).Methods("GET")
	r.HandleFunc("/callback", handler.GetUserInfoByAuthorizationCode).Methods("GET")
	r.HandleFunc("/getuserinfo", handler.GetUserInformationByAccessToken).Methods("POST")
	// r.HandleFunc("/admin/setUserSession", handler.SetDataInAdmin).Methods("POST")
	r.HandleFunc("/request", handler.RequestHandler).Methods("GET")
	r.HandleFunc("/", handler.HomePageHandle).Methods("GET")
	r.HandleFunc("/login", handler.LoginHandler).Methods("GET")
	r.HandleFunc("/logout", handler.LogOutHandler).Methods("GET")
	r.HandleFunc("/content", handler.MyContent).Methods("GET")
	r.HandleFunc("/api/modules", handler.MyCourses).Methods("GET")

	r.HandleFunc("/api/entitlements", handler.MyEntitlements).Methods("GET")

	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("./static/"))))

	//start and listen to requests
	log.Fatal(http.ListenAndServe(port, r))
	fmt.Println("Server started on port" + port)

}

func setUpViper() {
	viper.AddConfigPath("./conf")
	viper.SetConfigName("env")

	if err := viper.ReadInConfig(); err != nil {
		fmt.Printf("Error reading config file, %s", err)
	}
	viper.SetEnvPrefix("global")
}

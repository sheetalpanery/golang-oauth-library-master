package handler

import (
	models "golang-oauth-library-master/models"

)

func (ccoUser models.CCOUser)CreateOrUpdateCCOUser() (models.CCOUser,error) {
	var err error
	return models.CCOUser{}, err
}

func CreateCCOUser(user models.CCOUser) {
	Url:= "https://localhost:8080" + "/rest/api/users/createuser"
	return  ExchangeCCOUser(Url,user)
}
 func ExchangeCCOUser(user models.CCOUser,Url string){

 }

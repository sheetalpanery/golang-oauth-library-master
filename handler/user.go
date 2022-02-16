package handler

// func CreateOrUpdateCCOUser() (models.CCOUser, error) {
// 	var err error
// 	return models.CCOUser{}, err
// }

// func SetDataInAdmin(w http.ResponseWriter, r *http.Request) {
// 	//read body from reqeust.

// 	decoder := json.NewDecoder(r.Body)
// 	var ccoUser models.CCOUser
// 	err := decoder.Decode(&ccoUser)
// 	if err != nil {
// 		panic(err)
// 	}

// 	//CCOUser, err := AdminService.CreateAndUpdateInRedis(CCOUser)
// 	// if err != nil
// 	// write ccouser json in response.

// 	dbCCOUser, err := service.CreateAndUpdateUserInRedis(ccoUser)

// 	if err != nil {
// 		log.Fatal("Error while creating or updating user in redis")
// 		w.Write([]byte("Error while creating or updating user in redis" + err.Error()))
// 		w.WriteHeader(http.StatusInternalServerError)
// 	}

// 	json.NewEncoder(w).Encode(dbCCOUser)
// 	w.WriteHeader(http.StatusOK)

// }

// func ExchangeCCOUser(ccoUser models.CCOUser, Url string) models.CCOUser {
// 	var updatedUser models.CCOUser

// 	return updatedUser
// }

package utility

import (
	"encoding/json"
	"fmt"
	"net/http"
)

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

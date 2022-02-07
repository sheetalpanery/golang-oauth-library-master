package models

import "time"

type UserHomePageInfo struct {
	userName string
	ccoid string
	accessCode string
}
type MyCourses struct {
	ModuleMasterId      int         `json:"moduleMasterId"`
	ModuleTitle         string      `json:"moduleTitle"`
	SkuTitle            string      `json:"skuTitle"`
	ModuleName          string      `json:"moduleName"`
	Description         interface{} `json:"description"`
	AvailableDate       time.Time   `json:"availableDate"`
	Free                bool        `json:"free"`
	DkitMasterId        int         `json:"dkitMasterId"`
	CourseURL           interface{} `json:"courseURL"`
	ModuleCCSId         string      `json:"moduleCCSId"`
	ModulePartNumber    string      `json:"modulePartNumber"`
	Version             string      `json:"version"`
	GroupId             string      `json:"groupId"`
	SkuUpdateStatus     int         `json:"skuUpdateStatus"`
	Provider            string      `json:"provider"`
	LearningPartner     string      `json:"learningPartner"`
	LearningPartnerName string      `json:"learningPartnerName"`
	Acronym             string      `json:"acronym"`
	LastAccessedDate    time.Time   `json:"lastAccessedDate"`
	ModuleType          string      `json:"moduleType"`
	Language            string      `json:"language"`
	Instructor          bool        `json:"instructor"`
	IsLatest            bool        `json:"isLatest"`
}
type MyEntitlements struct {
	ModuleMasterId      int         `json:"moduleMasterId"`
	ModuleTitle         string      `json:"moduleTitle"`
	SkuTitle            string      `json:"skuTitle"`
	ModuleName          string      `json:"moduleName"`
	Description         interface{} `json:"description"`
	AvailableDate       time.Time   `json:"availableDate"`
	Free                bool        `json:"free"`
	DkitMasterId        int         `json:"dkitMasterId"`
	CourseURL           interface{} `json:"courseURL"`
	ModuleCCSId         string      `json:"moduleCCSId"`
	ModulePartNumber    string      `json:"modulePartNumber"`
	Version             string      `json:"version"`
	GroupId             string      `json:"groupId"`
	SkuUpdateStatus     int         `json:"skuUpdateStatus"`
	Provider            interface{} `json:"provider"`
	LearningPartner     string      `json:"learningPartner"`
	LearningPartnerName string      `json:"learningPartnerName"`
	Acronym             string      `json:"acronym"`
	LastAccessedDate    time.Time   `json:"lastAccessedDate"`
	ModuleType          string      `json:"moduleType"`
	Language            string      `json:"language"`
	Instructor          bool        `json:"instructor"`
	IsLatest            bool        `json:"isLatest"`
}




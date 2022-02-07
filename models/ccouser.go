package models

type User struct {
CCOUser
}

type CCOUser struct {
	serialVersionUID string
	ccoid            int
	ccouserMasterId  string
	userid           string
	email            string
	contactType      string
	firstName        string
	lastName         string
	phoneNumber string
	companyInfo string
	country string
	addrLine1 string
	addrLine2 string
	city string
	zipcode string
	jobRole string
	jobLevel string
	state string
	region string
	active bool
	security_password string
	weightage  int
	autoScreenName string
	status string
	opentoken string
	instructor bool
}
//public class CCOUser implements UserDetails {
//private int ccouserMasterId;
//private Long userid;
//private String email;
//private String contactType;
//private Long learningPartnerId;
//private String firstName;
//private String lastName;
//private String phoneNumber;
//private String companyInfo;
//private String country;
//private String addrLine1;
//private String addrLine2;
//private String city;
//private String zipcode;
//private String jobRole;
//private String jobLevel;
//private String state;
//private String region;
//private boolean active;
//private String security_password;
//private int weightage;
//private String autoScreenName;
//private String status;
//private String opentoken;
//private boolean instructor;

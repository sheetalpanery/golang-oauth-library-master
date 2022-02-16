package models

type CCOUser struct {
	SerialVersionUID string `json:"serial_version_uid"`
	Ccoid            string `json:"ccoid"`
	CcouserMasterId  string `json:"ccouser_master_id"`
	Userid           string `json:"userid"`
	Email            string `json:"email"`
	ContactType      string `json:"contact_type"`
	FirstName        string `json:"first_name"`
	LastName         string `json:"last_name"`
	FullName         string `json:"full_name"`
	PhoneNumber      string `json:"phone_number"`
	CompanyInfo      string `json:"companyinfo"`
	Country          string `json:"country"`
	AddrLine1        string
	AddrLine2        string
	City             string
	Zipcode          string
	JobRole          string
	JobLevel         string
	State            string
	Region           string
	Active           bool
	SecurityPassword string
	Weightage        int
	AutoScreenName   string
	Status           string
	Opentoken        string
	Instructor       bool
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

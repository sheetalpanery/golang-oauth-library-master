package communication

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"golang-oauth-library-master/logger"
	"time"

	"github.com/go-redis/redis"
)

type Client struct {
	redis *redis.Client
}

func NewClient(hostname, password string) *Client {
	redisClient := redis.NewClient(&redis.Options{
		Addr:     hostname,
		Password: password,
		DB:       0,
	})
	return &Client{redis: redisClient}
}

func (r *Client) GetDataByKey(key string) (data interface{}, err error) {
	value, err := r.redis.Get(key).Result()
	if err == redis.Nil {
		return nil, errors.New("could not find key in redis")
	} else if err != nil {
		fmt.Println(err.Error())
		return nil, err
	} else {
		err := json.Unmarshal(bytes.NewBufferString(value).Bytes(), &data)
		if err != nil {
			fmt.Println(err.Error())
			return nil, err
		}
		return data, err
	}
}

func (r *Client) RemoveDataByKey(key string) error {
	_, err := r.redis.Del(key).Result()
	if err == redis.Nil {
		return errors.New("could not find key in redis")
	} else if err != nil {
		fmt.Println(err.Error())
		return err
	}
	return nil
}

func (r *Client) AddData(x string, value interface{}, ttl time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		fmt.Println(err.Error())
		return err
	}

	errRedis := r.redis.Set(x, data, ttl).Err()
	if errRedis != nil {
		logger.SugarLogger.Error("Error while saving session data in redis", x)
		return errRedis
	}
	logger.SugarLogger.Info("Sesion data saved in redis with key", x)
	return nil
}
